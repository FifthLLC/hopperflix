import { HTTP_STATUS } from '@/utils/constants';
import { NextRequest, NextResponse } from 'next/server';

import { ImdbMovieInfoWithUrl } from '@/types';
import { fetchImdbMovieInfo } from '@/utils/fetchImdbTitle';
import { validateContent } from '@/utils/guardrailService';
import { isValidImdbUrl } from '@/utils/validateImdbUrl';

export async function POST(request: NextRequest) {
  try {
    const { description, imdbUrls } = await request.json();

    if (
      (!imdbUrls || imdbUrls.length === 0) &&
      (!description || typeof description !== 'string')
    ) {
      return NextResponse.json(
        {
          isValid: false,
          reasoning: 'Description is required.',
          blockedContent: ['description'],
          suggestions: ['Please provide a description.'],
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const descResult = await validateContent({
      content: description,
      contentType: 'description',
    });

    if (!descResult.isAppropriate) {
      return NextResponse.json(
        {
          isValid: false,
          reasoning: descResult.reasoning,
          blockedContent: [description],
          suggestions: descResult.suggestions || [],
        },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    let blockedMovies: string[] = [];
    let movieInfos: ImdbMovieInfoWithUrl[] = [];

    if (Array.isArray(imdbUrls)) {
      for (const url of imdbUrls) {
        if (isValidImdbUrl(url)) {
          const info = await fetchImdbMovieInfo(url);

          movieInfos.push({ url, ...info });
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
        }
      }
    }

    if (blockedMovies.length > 0) {
      return NextResponse.json(
        {
          isValid: false,
          reasoning: 'This doesn’t meet our criteria.',
          blockedContent: blockedMovies,
          suggestions: ['Remove inappropriate movies or try different ones.'],
        },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    return NextResponse.json({
      isValid: true,
      reasoning: 'All content is appropriate.',
      blockedContent: [],
      suggestions: [],
      movieInfos,
    });
  } catch (error) {
    console.error('Guardrail API error:', error);

    return NextResponse.json(
      {
        isValid: false,
        reasoning: 'Internal server error.',
        blockedContent: [],
        suggestions: ['Please try again later.'],
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
