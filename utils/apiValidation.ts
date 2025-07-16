import { ApiResponse, ApiErrorResponse, ApiSuccessResponse } from '@/types/api';

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
