/**
 * Query Key 관리 유틸리티
 *
 * 사용 예시:
 * - queryKeys.users.all
 * - queryKeys.users.detail(userId)
 * - queryKeys.users.list({ page: 1, limit: 10 })
 */

export const queryKeys = {
  // 전체 쿼리 키
  all: ['queries'] as const,

  // 도메인별 쿼리 키
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string | number) =>
      [...queryKeys.users.details(), id] as const,
  },
  // posts: {
  //   all: ['posts'] as const,
  //   lists: () => [...queryKeys.posts.all, 'list'] as const,
  //   list: (filters?: Record<string, unknown>) =>
  //     [...queryKeys.posts.lists(), { filters }] as const,
  //   details: () => [...queryKeys.posts.all, 'detail'] as const,
  //   detail: (id: string | number) =>
  //     [...queryKeys.posts.details(), id] as const,
  // },
  // // 검색 관련
  // search: {
  //   all: ['search'] as const,
  //   results: (query: string, type?: string) =>
  //     [...queryKeys.search.all, { query, type }] as const,
  // },
  // // 무한 스크롤 관련
  // infinite: {
  //   users: (filters?: Record<string, unknown>) =>
  //     [...queryKeys.users.all, 'infinite', { filters }] as const,
  //   posts: (filters?: Record<string, unknown>) =>
  //     [...queryKeys.posts.all, 'infinite', { filters }] as const,
  // },
} as const;

/**
 * 쿼리 키 생성 헬퍼
 */
export const createQueryKey = (
  domain: string,
  type: string,
  params?: Record<string, unknown>
) => {
  const base = [domain, type];
  return params ? [...base, params] : base;
};

/**
 * 쿼리 키 매칭 헬퍼
 */
export const matchQueryKey = (
  queryKey: readonly unknown[],
  pattern: readonly unknown[]
): boolean => {
  if (pattern.length > queryKey.length) return false;

  return pattern.every((item, index) => {
    if (typeof item === 'object' && item !== null) {
      return typeof queryKey[index] === 'object' && queryKey[index] !== null;
    }
    return queryKey[index] === item;
  });
};
