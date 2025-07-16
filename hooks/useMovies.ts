import { useQuery, useMutation } from '@tanstack/react-query';
import { processJSONBody } from '@/utils/api.utils';

export const useMovies = () => {
  return useQuery<{ movies: string[] }, Error>({
    queryKey: ['movies'],
    queryFn: async () => {
      const res = await fetch('/api/movies');

      if (!res.ok) throw new Error('Failed to fetch movies');

      return res.json();
    },
  });
};

export const useAddMovies = () => {
  return useMutation<{ success: boolean }, Error, { imdbMovies: string[] }>({
    mutationFn: async (data: { imdbMovies: string[] }) => {
      const response = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: processJSONBody(data),
      });

      if (!response.ok) {
        throw new Error('Failed to add movies');
      }

      return response.json();
    },
  });
};
