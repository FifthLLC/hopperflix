import { useMutation } from '@tanstack/react-query';

import { safeFetch } from '@/utils/api.utils';
import { useErrorHandler } from './useErrorHandler';

import { RecommendationData, RecommendationRequest } from '@/types';

export const useRecommend = () => {
  const { handleError } = useErrorHandler({
    showUserMessage: false,
    logToConsole: true,
  });

  return useMutation<RecommendationData, Error, RecommendationRequest>({
    mutationFn: async (data: RecommendationRequest) => {
      try {
        return await safeFetch<RecommendationData>('/api/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
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
