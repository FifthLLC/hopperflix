import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as apiUtils from '@/utils/api.utils';
import * as errorHandler from '../useErrorHandler';
import { useRecommend } from '../useRecommend';

jest.mock('@/utils/api.utils');

const createWrapper = () => {
  const queryClient = new QueryClient();
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientTestWrapper';
  return Wrapper;
};

describe('useRecommend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls safeFetch and returns data', async () => {
    (apiUtils.safeFetch as jest.Mock).mockResolvedValue({ result: 1 });
    jest
      .spyOn(errorHandler, 'useErrorHandler')
      .mockReturnValue({ handleError: jest.fn(), handleAsyncError: jest.fn() });
    const { result } = renderHook(() => useRecommend(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      await result.current.mutateAsync({ description: 'desc' });
    });
    expect(apiUtils.safeFetch).toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.data).toEqual({ result: 1 });
    });
  });

  it('handles error and calls handleError', async () => {
    const handleError = jest.fn();
    (apiUtils.safeFetch as jest.Mock).mockRejectedValue(new Error('fail'));
    jest
      .spyOn(errorHandler, 'useErrorHandler')
      .mockReturnValue({ handleError, handleAsyncError: jest.fn() });
    const { result } = renderHook(() => useRecommend(), {
      wrapper: createWrapper(),
    });
    await act(async () => {
      try {
        await result.current.mutateAsync({ description: 'desc' });
      } catch {}
    });
    expect(handleError).toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });
});
