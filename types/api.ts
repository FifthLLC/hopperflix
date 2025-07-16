import { RecommendationData, RecommendationRequest } from './index';

import { ImdbMovieInfo } from '@/types';

interface OpenAIChoice {
  message: {
    content: string;
    role: string;
  };
  finish_reason: string;
  index: number;
}

interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
  usage: OpenAIUsage;
}

interface OpenAIError {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}

interface OpenAIRecommendationResponse {
  type: 'recommendation' | 'all_recommended';
  movieTitle?: string;
  reasoning?: string;
  genre?: string;
  year?: string;
  allTitles?: string[];
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ImdbMovieInfoWithUrl extends ImdbMovieInfo {
  url: string;
}

export function isOpenAIResponse(obj: unknown): obj is OpenAIResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'choices' in obj &&
    Array.isArray((obj as OpenAIResponse).choices) &&
    (obj as OpenAIResponse).choices.length > 0 &&
    typeof (obj as OpenAIResponse).choices[0]?.message?.content === 'string'
  );
}

export function isOpenAIError(obj: unknown): obj is OpenAIError {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'error' in obj &&
    typeof (obj as OpenAIError).error?.message === 'string'
  );
}

export function isRecommendationData(obj: unknown): obj is RecommendationData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'recommendation' in obj &&
    'reasoning' in obj &&
    'genre' in obj &&
    'year' in obj &&
    typeof obj.recommendation === 'string' &&
    typeof obj.reasoning === 'string' &&
    typeof obj.genre === 'string' &&
    typeof obj.year === 'string'
  );
}

export function isRecommendationRequest(
  obj: unknown
): obj is RecommendationRequest {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'description' in obj &&
    typeof (obj as RecommendationRequest).description === 'string' &&
    ((obj as RecommendationRequest).imdbUrls === undefined ||
      (Array.isArray((obj as RecommendationRequest).imdbUrls) &&
        (obj as RecommendationRequest).imdbUrls!.every(
          (url) => typeof url === 'string'
        )))
  );
}

export function isOpenAIRecommendationResponse(
  obj: unknown
): obj is OpenAIRecommendationResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    typeof obj.type === 'string' &&
    ['recommendation', 'all_recommended'].includes(obj.type)
  );
}

export function parseOpenAIResponse(response: unknown): string {
  if (!isOpenAIResponse(response)) {
    throw new Error('Invalid OpenAI API response format');
  }

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No content in OpenAI response');
  }

  return content;
}

export function parseOpenAIRecommendationResponse(
  response: unknown
): OpenAIRecommendationResponse {
  if (!isOpenAIResponse(response)) {
    throw new Error('Invalid OpenAI API response format');
  }

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No content in OpenAI response');
  }

  try {
    const parsed = JSON.parse(content);

    if (isOpenAIRecommendationResponse(parsed)) {
      return parsed;
    }

    throw new Error('Invalid recommendation response format');
  } catch (parseError) {
    const trimmedContent = content.trim();

    if (trimmedContent.startsWith('ALL_RECOMMENDED:')) {
      const allTitles = trimmedContent
        .replace('ALL_RECOMMENDED:', '')
        .split(',')
        .map((s) => s.trim());

      return {
        type: 'all_recommended',
        allTitles,
      };
    }

    return {
      type: 'recommendation',
      movieTitle: trimmedContent,
      reasoning: 'Selected from available movies',
      genre: 'Various',
      year: 'Various',
    };
  }
}

export function parseRecommendationData(data: unknown): RecommendationData {
  if (!isRecommendationData(data)) {
    throw new Error('Invalid recommendation data format');
  }

  return data;
}

export function createApiSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

export function createApiErrorResponse(
  message: string,
  code?: string,
  details?: unknown
): ApiErrorResponse {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };
}

export function safeJsonParse<T>(
  text: string,
  validator: (obj: unknown) => obj is T
): T {
  try {
    const parsed = JSON.parse(text);

    if (!validator(parsed)) {
      throw new Error('Parsed data failed validation');
    }

    return parsed;
  } catch (error) {
    throw new Error(
      `JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
