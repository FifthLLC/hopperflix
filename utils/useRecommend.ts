import { useMutation } from '@tanstack/react-query';

import { safeFetch } from './apiValidation';
import { useErrorHandler } from './useErrorHandler';

import { RecommendationData, RecommendationRequest } from '@/types';
import { isRecommendationData } from '@/types/api';

export const useRecommend = () => {
  const { handleError } = useErrorHandler({
    showUserMessage: false,
    logToConsole: true,
  });

  return useMutation<RecommendationData, Error, RecommendationRequest>({
    mutationFn: async (data: RecommendationRequest) => {
      try {
        return await safeFetch<RecommendationData>(
          '/api/recommend',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          },
          isRecommendationData
        );
      } catch (error) {
        handleError(error, 'API recommendation request');
        throw error;
      }
    },
    onError: (error) => {
      handleError(error, 'React Query mutation');
    },
  });
};
