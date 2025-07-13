import React, { ReactNode } from 'react';
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
    <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
      <h2 className="text-lg font-semibold text-red-800 mb-2">
        문제가 발생했습니다
      </h2>
      <p className="text-red-600 mb-4">
        {error.message || '알 수 없는 오류가 발생했습니다'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
    <div className="text-center p-6">
      <div className="text-gray-400 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-gray-600 mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  </div>
);

// Query Boundary 컴포넌트
interface QueryBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

export const QueryBoundary: React.FC<QueryBoundaryProps> = ({
  children,
  fallback,
  onError
}) => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary
        FallbackComponent={fallback ? () => <>{fallback}</> : ErrorFallback}
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
    return <>{errorFallback || <ErrorFallback error={error!} resetErrorBoundary={() => {}} />}</>;
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
    return <>{errorFallback || <ErrorFallback error={error!} resetErrorBoundary={() => {}} />}</>;
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