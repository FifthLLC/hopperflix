'use client';

import { useCallback } from 'react';
import { ErrorHandlerOptions } from '@/types';

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const { onError, showUserMessage = true, logToConsole = true } = options;

  const handleError = useCallback(
    (error: Error | unknown, context?: string) => {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));

      if (logToConsole) {
        console.error(`Error${context ? ` in ${context}` : ''}:`, errorObj);
      }

      if (showUserMessage) {
        alert(`An error occurred: ${errorObj.message}`);
      }

      if (onError) {
        onError(errorObj);
      }

      return errorObj;
    },
    [onError, showUserMessage, logToConsole]
  );

  const handleAsyncError = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      context?: string
    ): Promise<T | null> => {
      try {
        return await asyncFn();
      } catch (error) {
        handleError(error, context);

        return null;
      }
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncError,
  };
}
