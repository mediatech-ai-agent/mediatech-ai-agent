import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import type { QueryClientConfig } from '@tanstack/react-query';

// 에러 로깅 함수
const logError = (error: Error, context: string) => {
  console.error(`[React Query ${context}]:`, error);

  // 프로덕션에서는 에러 모니터링 서비스에 전송
  if (import.meta.env.PROD) {
    // 예: Sentry.captureException(error, { tags: { context } });
  }
};

// 기본 QueryClient 설정
export const defaultQueryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // 5분간 데이터 유지
      staleTime: 5 * 60 * 1000,
      // 30분간 캐시 유지
      gcTime: 30 * 60 * 1000,
      // 3번 재시도
      retry: 3,
      // 재시도 지연 시간 (exponential backoff)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // 네트워크 재연결 시 자동 refetch
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // 백그라운드에서 데이터 갱신
      refetchOnMount: true,
    },
    mutations: {
      // 3번 재시도
      retry: 3,
      // 재시도 지연 시간
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
  queryCache: new QueryCache({
    // @ts-ignore
    onError: (error, query) => {
      logError(error as Error, `Query ${query.queryKey.join(' > ')}`);
    },
  }),
  mutationCache: new MutationCache({
    // @ts-ignore
    onError: (error, variables, context, mutation) => {
      logError(
        error as Error,
        `Mutation ${mutation.options.mutationKey?.join(' > ') || 'unknown'}`
      );
    },
  }),
};

// QueryClient 인스턴스 생성
export const createQueryClient = (config?: QueryClientConfig) => {
  return new QueryClient({
    ...defaultQueryClientConfig,
    ...config,
    defaultOptions: {
      ...defaultQueryClientConfig.defaultOptions,
      ...config?.defaultOptions,
      queries: {
        ...defaultQueryClientConfig.defaultOptions?.queries,
        ...config?.defaultOptions?.queries,
      },
      mutations: {
        ...defaultQueryClientConfig.defaultOptions?.mutations,
        ...config?.defaultOptions?.mutations,
      },
    },
  });
};

// 개발 환경용 QueryClient (더 자세한 로깅)
export const createDevQueryClient = () => {
  return createQueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0, // 개발 중에는 항상 fresh 상태로
        gcTime: 5 * 60 * 1000, // 5분
        retry: 1, // 개발 중에는 재시도 적게
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (process.env.NODE_ENV === 'development') {
          console.group(`🔴 Query Error: ${query.queryKey.join(' > ')}`);
          console.error('Error:', error);
          console.groupEnd();
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, variables, context, mutation) => {
        if (process.env.NODE_ENV === 'development') {
          console.group(
            `🔴 Mutation Error: ${mutation.options.mutationKey?.join(' > ') || 'unknown'}`
          );
          console.error('Error:', error);
          console.groupEnd();
        }
      },
    }),
  });
};

// 테스트 환경용 QueryClient
export const createTestQueryClient = () => {
  return createQueryClient({
    defaultOptions: {
      queries: {
        retry: false, // 테스트에서는 재시도 안함
        gcTime: 0, // 즉시 가비지 컬렉션
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// 쿼리 상태 디버깅을 위한 헬퍼
export const debugQueryState = (queryClient: QueryClient) => {
  if (process.env.NODE_ENV !== 'development') return;

  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();

  console.group('🔍 Query Cache State');
  queries.forEach((query) => {
    console.log(`${query.queryKey.join(' > ')}:`, {
      state: query.state,
      dataUpdatedAt: new Date(query.state.dataUpdatedAt),
      errorUpdatedAt: new Date(query.state.errorUpdatedAt),
      isStale: query.isStale(),
      isActive: query.isActive(),
    });
  });
  console.groupEnd();
};

// 캐시 크기 모니터링
export const getCacheSize = (queryClient: QueryClient) => {
  const queryCache = queryClient.getQueryCache();
  const mutationCache = queryClient.getMutationCache();

  return {
    queryCount: queryCache.getAll().length,
    mutationCount: mutationCache.getAll().length,
    memoryUsage: {
      // 실제 메모리 사용량 계산은 복잡하므로 간단히 개수만 표시
      queries: queryCache.getAll().length,
      mutations: mutationCache.getAll().length,
    },
  };
};

// 특정 패턴의 쿼리 무효화
export const invalidateQueriesByPattern = (
  queryClient: QueryClient,
  pattern: string[]
) => {
  queryClient.invalidateQueries({
    predicate: (query) =>
      pattern.every((part, index) => query.queryKey[index] === part),
  });
};

// 모든 쿼리 제거 (로그아웃 시 사용)
export const clearAllQueries = (queryClient: QueryClient) => {
  queryClient.clear();
};

// 오래된 쿼리 정리
export const cleanupStaleQueries = (queryClient: QueryClient) => {
  const cache = queryClient.getQueryCache();
  const staleQueries = cache
    .getAll()
    .filter((query) => query.isStale() && !query.isActive());

  staleQueries.forEach((query) => {
    cache.remove(query);
  });

  return staleQueries.length;
};

// 전역 에러 핸들러 설정
export const setupGlobalErrorHandling = (queryClient: QueryClient) => {
  queryClient.setMutationDefaults(['auth', 'login'], {
    onError: (error) => {
      console.error('Authentication error:', error);
      // 인증 관련 에러 처리
    },
  });

  queryClient.setMutationDefaults(['auth', 'logout'], {
    onSuccess: () => {
      // 로그아웃 성공 시 모든 쿼리 정리
      clearAllQueries(queryClient);
    },
  });
};

// 개발 도구 (개발 환경에서만 사용)
export const devTools = {
  logCache: (queryClient: QueryClient) => debugQueryState(queryClient),
  getCacheSize: (queryClient: QueryClient) => getCacheSize(queryClient),
  clearCache: (queryClient: QueryClient) => clearAllQueries(queryClient),
  cleanupStale: (queryClient: QueryClient) => cleanupStaleQueries(queryClient),
};

// 전역 변수로 개발 도구 노출 (개발 환경에서만)
if (import.meta.env.DEV) {
  (
    window as unknown as { reactQueryDevTools: typeof devTools }
  ).reactQueryDevTools = devTools;
}
