import { renderHook, waitFor } from '@testing-library/react';
import { useMovies, useAddMovies } from '../useMovies';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientTestWrapper';
  return Wrapper;
};

describe('useMovies', () => {
  it('fetches movies successfully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ movies: ['Movie 1', 'Movie 2'] }),
      })
    ) as jest.Mock;

    const { result } = renderHook(() => useMovies(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ movies: ['Movie 1', 'Movie 2'] });
    });
    expect(global.fetch).toHaveBeenCalledWith('/api/movies');
  });

  it('handles fetch movies error', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
      })
    ) as jest.Mock;

    const { result } = renderHook(() => useMovies(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error).toHaveProperty(
      'message',
      'Failed to fetch movies'
    );
  });
});

describe('useAddMovies', () => {
  it('adds movies successfully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    ) as jest.Mock;

    const { result } = renderHook(() => useAddMovies(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ imdbMovies: ['tt1234567'] });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(global.fetch).toHaveBeenCalledWith('/api/movies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imdbMovies: ['tt1234567'] }),
    });
  });

  it('handles add movies error', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
      })
    ) as jest.Mock;

    const { result } = renderHook(() => useAddMovies(), {
      wrapper: createWrapper(),
    });

    await result.current
      .mutateAsync({ imdbMovies: ['tt1234567'] })
      .catch(() => {});

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(new Error('Failed to add movies'));
    });
  });
});
