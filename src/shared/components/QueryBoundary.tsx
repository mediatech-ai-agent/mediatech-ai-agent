import React, { type ReactNode, type PropsWithChildren } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

// 에러 상태 컴포넌트
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary
}) => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="p-6 text-center bg-red-50 rounded-lg border border-red-200">
      <h2 className="mb-2 text-lg font-semibold text-red-800">
        문제가 발생했습니다
      </h2>
      <p className="mb-4 text-red-600">
        {error.message || '알 수 없는 오류가 발생했습니다'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 text-white bg-red-600 rounded transition-colors hover:bg-red-700"
      >
        다시 시도
      </button>
    </div>
  </div>
);

// 로딩 상태 컴포넌트
interface LoadingFallbackProps {
  message?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = '로딩 중...'
}) => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="text-center">
      <div className="mx-auto mb-4 w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// 빈 상태 컴포넌트
interface EmptyFallbackProps {
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyFallback: React.FC<EmptyFallbackProps> = ({
  message = '데이터가 없습니다',
  action
}) => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="p-6 text-center">
      <div className="mb-4 text-gray-400">
        <svg className="mx-auto w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="mb-4 text-gray-600">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-white bg-blue-600 rounded transition-colors hover:bg-blue-700"
        >
          {action.label}
        </button>
      )}
    </div>
  </div>
);

// Query Boundary 컴포넌트
interface QueryBoundaryProps {
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

export const QueryBoundary = ({
  fallback,
  onError,
  children
}: PropsWithChildren<QueryBoundaryProps>) => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary
        FallbackComponent={
          fallback
            ? ({ error, resetErrorBoundary }) => {
              return typeof fallback === 'function' ? React.createElement(fallback, { error, resetErrorBoundary }) : <>{fallback}</>;
            }
            : ErrorFallback
        }
        onError={onError}
        onReset={reset}
      >
        {children}
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);

// 조건부 렌더링 헬퍼
interface ConditionalRenderProps<T> {
  condition: boolean;
  fallback: ReactNode;
  children: (data: T) => ReactNode;
  data?: T;
}

export function ConditionalRender<T>({
  condition,
  fallback,
  children,
  data
}: ConditionalRenderProps<T>) {
  if (!condition) {
    return <>{fallback}</>;
  }

  return <>{data ? children(data) : fallback}</>;
}

// 쿼리 상태별 렌더링 헬퍼
interface QueryStateRendererProps<T> {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: T | undefined;
  isEmpty?: boolean;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
  emptyFallback?: ReactNode;
  children: (data: T) => ReactNode;
}

export function QueryStateRenderer<T>({
  isLoading,
  isError,
  error,
  data,
  isEmpty = false,
  loadingFallback,
  errorFallback,
  emptyFallback,
  children
}: QueryStateRendererProps<T>) {
  if (isLoading) {
    return <>{loadingFallback || <LoadingFallback />}</>;
  }

  if (isError) {
    return <>{errorFallback || <ErrorFallback error={error!} resetErrorBoundary={() => { }} />}</>;
  }

  if (isEmpty || !data) {
    return <>{emptyFallback || <EmptyFallback />}</>;
  }

  return <>{children(data)}</>;
}

// 무한 스크롤 상태 렌더러
interface InfiniteQueryRendererProps<T> {
  data: T[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  children: (data: T[], loadMore: () => void) => ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
  emptyFallback?: ReactNode;
}

export function InfiniteQueryRenderer<T>({
  data,
  isLoading,
  isError,
  error,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  children,
  loadingFallback,
  errorFallback,
  emptyFallback
}: InfiniteQueryRendererProps<T>) {
  if (isLoading) {
    return <>{loadingFallback || <LoadingFallback />}</>;
  }

  if (isError) {
    return <>{errorFallback || <ErrorFallback error={error!} resetErrorBoundary={() => { }} />}</>;
  }

  if (!data || data.length === 0) {
    return <>{emptyFallback || <EmptyFallback />}</>;
  }

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return <>{children(data, loadMore)}</>;
} 