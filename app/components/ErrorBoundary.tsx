'use client';

import type { ErrorBoundaryProps, ErrorBoundaryState } from '@/types';

import React from 'react';
import { Button } from '@heroui/button';

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;

        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={this.resetError}
          />
        );
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md mx-auto text-center bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-red-500/20">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-red-400 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-300 mb-4">
                We encountered an unexpected error. Don&apos;t worry, your data
                is safe.
              </p>
            </div>

            <div className="mb-6 p-4 bg-red-900/20 rounded-lg border border-red-500/30">
              <p className="text-sm text-red-300 font-mono break-all">
                {this.state.error?.message || 'Unknown error occurred'}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full"
                color="primary"
                variant="solid"
                onPress={this.resetError}
              >
                Try Again
              </Button>

              <Button
                className="w-full"
                color="default"
                variant="bordered"
                onPress={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                  Show Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs text-gray-500 bg-gray-900/50 p-3 rounded overflow-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
