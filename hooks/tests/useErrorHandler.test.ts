import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from '../useErrorHandler';

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log error and show alert by default', () => {
    const { result } = renderHook(() => useErrorHandler());
    act(() => {
      result.current.handleError(new Error('Test error'), 'test context');
    });
    expect(console.error).toHaveBeenCalledWith(
      'Error in test context:',
      expect.any(Error)
    );
    expect(window.alert).toHaveBeenCalledWith('An error occurred: Test error');
  });

  it('should not show alert if showUserMessage is false', () => {
    const { result } = renderHook(() =>
      useErrorHandler({ showUserMessage: false })
    );
    act(() => {
      result.current.handleError(new Error('No alert'));
    });
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('should call onError callback if provided', () => {
    const onError = jest.fn();
    const { result } = renderHook(() => useErrorHandler({ onError }));
    act(() => {
      result.current.handleError('string error');
    });
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should handle async errors and return null on error', async () => {
    const { result } = renderHook(() => useErrorHandler());
    const asyncFn = jest.fn().mockRejectedValue(new Error('Async error'));
    let value: any;
    await act(async () => {
      value = await result.current.handleAsyncError(asyncFn, 'async context');
    });
    expect(value).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      'Error in async context:',
      expect.any(Error)
    );
  });

  it('should return value from async function if no error', async () => {
    const { result } = renderHook(() => useErrorHandler());
    const asyncFn = jest.fn().mockResolvedValue('success');
    let value: any;
    await act(async () => {
      value = await result.current.handleAsyncError(asyncFn);
    });
    expect(value).toBe('success');
  });
});
