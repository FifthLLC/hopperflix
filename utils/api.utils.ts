import { RecommendationRequest } from '@/types';
import {
  ApiResponse,
  ApiErrorResponse,
  ApiSuccessResponse,
  OpenAIResponse,
  OpenAIError,
} from '@/types/api';

function isValidApiResponse<T>(response: unknown): response is ApiResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    typeof (response as ApiResponse<T>).success === 'boolean'
  );
}

function isValidSuccessResponse<T>(
  response: unknown
): response is ApiSuccessResponse<T> {
  return (
    isValidApiResponse(response) &&
    (response as ApiResponse<T>).success === true
  );
}

export function isValidErrorResponse(
  response: unknown
): response is ApiErrorResponse {
  return (
    isValidApiResponse(response) &&
    (response as ApiResponse<unknown>).success === false
  );
}

function extractApiData<T>(response: unknown): T {
  if (!isValidSuccessResponse<T>(response)) {
    throw new Error('Invalid API response format');
  }

  return response.data;
}

function extractApiError(response: unknown): string {
  if (!isValidErrorResponse(response)) {
    return 'Unknown error occurred';
  }

  return response.error.message;
}

async function handleApiResponse<T>(
  response: Response,
  expectedDataValidator?: (data: unknown) => data is T
): Promise<T> {
  let responseData: unknown;

  try {
    responseData = await response.json();
  } catch {
    throw new Error('Invalid JSON response from server');
  }

  if (!response.ok) {
    const errorMessage = extractApiError(responseData);

    throw new Error(errorMessage);
  }

  if (isValidSuccessResponse(responseData)) {
    const extractedData = responseData.data;

    if (expectedDataValidator) {
      if (!expectedDataValidator(extractedData)) {
        throw new Error('Response data validation failed');
      }

      return extractedData;
    }

    return extractedData as T;
  }

  if (expectedDataValidator) {
    if (!expectedDataValidator(responseData)) {
      throw new Error('Response data validation failed');
    }

    return responseData;
  }

  return extractApiData<T>(responseData);
}

export async function safeFetch<T>(
  url: string,
  options: RequestInit = {},
  dataValidator?: (data: unknown) => data is T
): Promise<T> {
  try {
    const response = await fetch(url, options);

    return await handleApiResponse<T>(response, dataValidator);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network request failed');
  }
}

function isOpenAIResponse(obj: unknown): obj is OpenAIResponse {
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
