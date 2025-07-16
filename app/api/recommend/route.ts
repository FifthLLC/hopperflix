import { NextRequest, NextResponse } from 'next/server';

import { RecommendationData, RecommendationRequest } from '@/types';
import {
  createApiErrorResponse,
  createApiSuccessResponse,
  isOpenAIError,
  isRecommendationRequest,
  parseOpenAIResponse,
  processJSONBody,
} from '@/utils/api.utils';
import {
  getOpenAiModelOptions,
  MOVIES,
  OPENAPI_URL,
  SECURITY_BLOCKED_SUGGESTIONS,
} from '@/utils/constants';
import { validateContent } from '@/utils/guardrailService';
import { isValidImdbUrl } from '@/utils/validateImdbUrl';
import { fetchImdbMovieInfo } from '@/utils/fetchImdbTitle';
import type { ImdbMovieInfoWithUrl } from '@/types';
import { getUserMessage, SYSTEM_PROMPT } from '@/utils/prompts';

const apiKey = process.env.OPENAI_API_KEY;

const recommendedMovies = new Set<string>();

export async function POST(request: NextRequest): Promise<NextResponse> {
  const timeoutPromise = new Promise<NextResponse>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), 30000);
  });

  try {
    const result = await Promise.race<NextResponse>([
      processRecommendation(request),
      timeoutPromise,
    ]);

    return result;
  } catch (error) {
    console.error('Error in recommendation API:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to generate recommendation';

    return NextResponse.json(
      createApiErrorResponse(errorMessage, 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}

async function processRecommendation(
  request: NextRequest
): Promise<NextResponse> {
  let body: RecommendationRequest;

  try {
    const rawBody = await request.json();

    if (!isRecommendationRequest(rawBody)) {
      return NextResponse.json(
        createApiErrorResponse('Invalid request format', 'INVALID_REQUEST'),
        { status: 400 }
      );
    }
    body = rawBody;
  } catch (parseError) {
    return NextResponse.json(
      createApiErrorResponse('Invalid JSON in request body', 'INVALID_JSON'),
      { status: 400 }
    );
  }

  const { description, imdbUrls } = body;

  if (!description.trim()) {
    return NextResponse.json(
      createApiErrorResponse('Description is required', 'MISSING_DESCRIPTION'),
      { status: 400 }
    );
  }

  // Direct guardrail validation instead of HTTP call
  const descResult = await validateContent({
    content: description,
    contentType: 'description',
  });

  if (!descResult.isAppropriate) {
    return NextResponse.json(
      createApiErrorResponse(
        `Content blocked: ${descResult.reasoning}`,
        'CONTENT_BLOCKED',
        {
          blockedContent: [description],
          suggestions: descResult.suggestions || [],
        }
      ),
      { status: 403 }
    );
  }

  let newMovieInfos: ImdbMovieInfoWithUrl[] = [];
  let blockedMovies: string[] = [];

  if (Array.isArray(imdbUrls) && imdbUrls.length > 0) {
    for (const url of imdbUrls) {
      if (isValidImdbUrl(url)) {
        try {
          const info = await fetchImdbMovieInfo(url);

          newMovieInfos.push({ url, ...info });

          const movieText = [
            info.title,
            ...(info.genre || []),
            info.description,
          ]
            .filter(Boolean)
            .join('. ');

          const movieResult = await validateContent({
            content: movieText,
            contentType: 'movie_title',
          });

          if (!movieResult.isAppropriate) {
            blockedMovies.push(info.title || url);
          }
        } catch (error) {
          console.error('Error fetching IMDB movie info:', error);
        }
      }
    }
  }

  if (blockedMovies.length > 0) {
    return NextResponse.json(
      createApiErrorResponse(
        'Some movies were blocked by content filter',
        'CONTENT_BLOCKED',
        {
          blockedContent: blockedMovies,
          suggestions: ['Remove inappropriate movies or try different ones.'],
        }
      ),
      { status: 403 }
    );
  }

  let enrichedMovies = [...MOVIES];

  if (newMovieInfos.length > 0) {
    enrichedMovies = [
      ...MOVIES,
      ...newMovieInfos.map((info: ImdbMovieInfoWithUrl) => {
        let str = info.title || info.url;

        if (info.genre && info.genre.length > 0)
          str += ` [${info.genre.join(', ')}]`;
        if (info.description) str += `: ${info.description}`;

        return str;
      }),
    ];
  }

  const userMessage = getUserMessage(
    description,
    enrichedMovies,
    recommendedMovies
  );

  const messages = [
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
    { role: 'user', content: userMessage },
  ];

  if (!apiKey) {
    throw new Error(
      'OpenAI API key not found. Please check your environment configuration.'
    );
  }

  const response = await fetch(OPENAPI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: processJSONBody({
      ...getOpenAiModelOptions('gpt-4', 0.1, 20),
      messages: messages,
    }),
  });

  if (!response.ok) {
    let errorData: unknown;

    try {
      errorData = await response.json();
    } catch {
      throw new Error('OpenAI API request failed with invalid error response');
    }
    if (isOpenAIError(errorData)) {
      throw new Error(errorData.error.message);
    } else {
      throw new Error('OpenAI API request failed');
    }
  }

  const rawResult = await response.json();
  const content = parseOpenAIResponse(rawResult).trim();

  if (content.startsWith('SECURITY_BLOCKED:')) {
    return NextResponse.json(
      createApiErrorResponse(
        'Security threat detected: User attempting to exploit system',
        'SECURITY_BLOCKED',
        {
          blockedContent: [description],
          suggestions: SECURITY_BLOCKED_SUGGESTIONS,
        }
      ),
      { status: 403 }
    );
  }

  if (content.startsWith('ALL_RECOMMENDED:')) {
    const allTitles = content
      .replace('ALL_RECOMMENDED:', '')
      .split(',')
      .map((s) => s.trim());

    recommendedMovies.clear();
    const recommendationData: RecommendationData = {
      recommendation: `All movies have been recommended! Starting fresh with: ${allTitles.join(', ')}`,
      reasoning:
        'All available movies have been recommended. Starting a new cycle.',
      genre: 'Various',
      year: 'Various',
    };

    return NextResponse.json(createApiSuccessResponse(recommendationData));
  }

  recommendedMovies.add(content);
  const recommendationData: RecommendationData = {
    recommendation: content,
    reasoning: 'Selected randomly among not-yet-recommended movies.',
    genre: 'Various',
    year: 'Various',
  };

  return NextResponse.json(createApiSuccessResponse(recommendationData));
}
