import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  UseQueryOptions,
  UseMutationOptions,
  UseQueryResult,
  UseMutationResult,
  QueryKey,
} from '@tanstack/react-query';
import type { AxiosRequestConfig, AxiosError } from 'axios';
import { HttpClient } from '../utils/HttpClient';

// 기본 API 클라이언트 인스턴스 (필요에 따라 설정)
const defaultApiClient = new HttpClient({
  baseURL:
    (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  retryOptions: {
    retries: 3,
    retryCondition: (error: AxiosError) => {
      const status = error.response?.status;
      return status ? [429, 500, 502, 503, 504].includes(status) : false;
    },
    retryDelay: (retryCount: number) => retryCount * 1000,
  },
  onError: (error: AxiosError) => {
    // 글로벌 에러 핸들링
    if (error.response?.status === 401) {
      // 인증 실패 시 처리
      console.warn('Authentication failed');
    }
    return Promise.reject(error);
  },
});

// Query Hook 옵션 타입
interface ApiQueryOptions<TData, TError = Error>
  extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  client?: HttpClient;
  config?: AxiosRequestConfig;
}

// Mutation Hook 옵션 타입
interface ApiMutationOptions<TData, TError = Error, TVariables = void>
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
  client?: HttpClient;
  config?: AxiosRequestConfig;
}

/**
 * GET 요청을 위한 Custom Query Hook
 */
export function useApiQuery<TData = unknown, TError = Error>(
  queryKey: QueryKey,
  url: string,
  options?: ApiQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  const { client = defaultApiClient, config, ...queryOptions } = options || {};

  return useQuery({
    queryKey,
    queryFn: () => client.get<TData>(url, config),
    ...queryOptions,
  });
}

/**
 * POST 요청을 위한 Custom Mutation Hook
 */
export function useApiMutation<
  TData = unknown,
  TError = Error,
  TVariables = unknown,
>(
  url: string,
  options?: ApiMutationOptions<TData, TError, TVariables>
): UseMutationResult<TData, TError, TVariables> {
  const {
    client = defaultApiClient,
    config,
    ...mutationOptions
  } = options || {};

  return useMutation({
    mutationFn: (variables: TVariables) =>
      client.post<TData>(url, variables, config),
    ...mutationOptions,
  });
}

/**
 * PUT 요청을 위한 Custom Mutation Hook
 */
export function useApiMutationPut<
  TData = unknown,
  TError = Error,
  TVariables = unknown,
>(
  url: string,
  options?: ApiMutationOptions<TData, TError, TVariables>
): UseMutationResult<TData, TError, TVariables> {
  const {
    client = defaultApiClient,
    config,
    ...mutationOptions
  } = options || {};

  return useMutation({
    mutationFn: (variables: TVariables) =>
      client.request<TData>({ method: 'PUT', url, data: variables, ...config }),
    ...mutationOptions,
  });
}

/**
 * DELETE 요청을 위한 Custom Mutation Hook
 */
export function useApiMutationDelete<
  TData = unknown,
  TError = Error,
  TVariables = unknown,
>(
  url: string,
  options?: ApiMutationOptions<TData, TError, TVariables>
): UseMutationResult<TData, TError, TVariables> {
  const {
    client = defaultApiClient,
    config,
    ...mutationOptions
  } = options || {};

  return useMutation({
    mutationFn: (variables: TVariables) =>
      client.request<TData>({
        method: 'DELETE',
        url,
        data: variables,
        ...config,
      }),
    ...mutationOptions,
  });
}

/**
 * 쿼리 무효화 헬퍼
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return {
    // 특정 쿼리 키 무효화
    invalidate: (queryKey: QueryKey) => {
      queryClient.invalidateQueries({ queryKey });
    },

    // 패턴으로 무효화
    invalidateByPattern: (pattern: QueryKey) => {
      const queries = queryClient.getQueryCache().findAll();
      queries.forEach((query) => {
        const key = query.queryKey;
        const isMatch = pattern.every((item, index) => key[index] === item);
        if (isMatch) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      });
    },

    // 모든 쿼리 무효화
    invalidateAll: () => {
      queryClient.invalidateQueries();
    },
  };
}

/**
 * 캐시 데이터 업데이트 헬퍼
 */
export function useCacheUpdater() {
  const queryClient = useQueryClient();

  return {
    // 캐시 데이터 설정
    setQueryData: <TData>(queryKey: QueryKey, data: TData) => {
      queryClient.setQueryData(queryKey, data);
    },

    // 캐시 데이터 업데이트
    updateQueryData: <TData>(
      queryKey: QueryKey,
      updater: (oldData: TData | undefined) => TData
    ) => {
      queryClient.setQueryData(queryKey, updater);
    },

    // 캐시에서 데이터 가져오기
    getQueryData: <TData>(queryKey: QueryKey): TData | undefined => {
      return queryClient.getQueryData<TData>(queryKey);
    },
  };
}
