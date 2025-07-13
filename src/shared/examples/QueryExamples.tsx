import React from 'react';
import { useApiQuery, useApiMutation, useInvalidateQueries, useCacheUpdater } from '../hooks/useApiQuery';
import { useInfiniteApiQuery, useFlattenInfiniteData } from '../hooks/useInfiniteApiQuery';
import { useOptimisticUpdate, useOptimisticToggle } from '../hooks/useOptimisticUpdate';
import { QueryStateRenderer, InfiniteQueryRenderer } from '../components/QueryBoundary';
import { queryKeys } from '../utils/queryKeys';

// 사용자 데이터 타입
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

// 포스트 데이터 타입
interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  isLiked: boolean;
  likeCount: number;
  createdAt: string;
}

/**
 * 1. 기본 Query 사용 예시
 */
export const UserListExample: React.FC = () => {
  const { data, isLoading, isError, error } = useApiQuery<User[]>(
    queryKeys.users.list({ status: 'active' }),
    '/users',
    {
      config: {
        params: { status: 'active' },
      },
      staleTime: 10 * 60 * 1000, // 10분
    }
  );

  return (
    <QueryStateRenderer
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={data}
      isEmpty={data?.length === 0}
    >
      {(users) => (
        <ul>
          {users.map(user => (
            <li key={user.id}>
              {user.name} - {user.email}
              {user.isActive && <span> (활성)</span>}
            </li>
          ))}
        </ul>
      )}
    </QueryStateRenderer>
  );
};

/**
 * 2. Mutation 사용 예시
 */
export const CreateUserExample: React.FC = () => {
  const { invalidate } = useInvalidateQueries();
  const { addToList } = useOptimisticUpdate();
  
  const createUserMutation = useApiMutation<User, Omit<User, 'id' | 'createdAt'>>(
    '/users',
    {
      onMutate: async (newUser) => {
        // 옵티미스틱 업데이트
        const optimisticUser = {
          ...newUser,
          id: Date.now(), // 임시 ID
          createdAt: new Date().toISOString(),
        };
        
        addToList(queryKeys.users.list(), optimisticUser);
        
        return { optimisticUser };
      },
      onError: (error, variables, context) => {
        console.error('User creation failed:', error);
        // 옵티미스틱 업데이트 롤백은 자동으로 처리됨
      },
      onSuccess: (data) => {
        // 성공 시 관련 쿼리 무효화
        invalidate(queryKeys.users.lists());
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate({
      name: 'New User',
      email: 'new@example.com',
      isActive: true,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <button 
        type="submit" 
        disabled={createUserMutation.isPending}
      >
        {createUserMutation.isPending ? '생성 중...' : '사용자 생성'}
      </button>
      {createUserMutation.isError && (
        <div className="error">
          생성 실패: {createUserMutation.error?.message}
        </div>
      )}
    </form>
  );
};

/**
 * 3. 무한 스크롤 사용 예시
 */
export const InfinitePostsExample: React.FC = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteApiQuery<Post>(
    queryKeys.infinite.posts({ category: 'tech' }),
    '/posts',
    {
      config: {
        params: { category: 'tech' },
      },
      limit: 10,
    }
  );

  const flattenedPosts = useFlattenInfiniteData(data);

  return (
    <InfiniteQueryRenderer
      data={flattenedPosts}
      isLoading={isLoading}
      isError={isError}
      error={error}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
    >
      {(posts, loadMore) => (
        <div>
          {posts.map(post => (
            <div key={post.id} className="post">
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <LikeButton post={post} />
            </div>
          ))}
          
          {hasNextPage && (
            <button 
              onClick={loadMore}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? '로딩 중...' : '더 보기'}
            </button>
          )}
        </div>
      )}
    </InfiniteQueryRenderer>
  );
};

/**
 * 4. 옵티미스틱 토글 사용 예시
 */
interface LikeButtonProps {
  post: Post;
}

const LikeButton: React.FC<LikeButtonProps> = ({ post }) => {
  const { toggleInList } = useOptimisticToggle();
  
  const toggleLikeMutation = useApiMutation<Post, { postId: number }>(
    `/posts/${post.id}/like`,
    {
      onMutate: async () => {
        // 옵티미스틱 토글
        toggleInList<Post>(
          queryKeys.infinite.posts({ category: 'tech' }),
          post.id,
          'isLiked'
        );
        
        // 좋아요 수도 업데이트
        const { updateInList } = useOptimisticUpdate();
        updateInList<Post>(
          queryKeys.infinite.posts({ category: 'tech' }),
          post.id,
          (item) => ({
            ...item,
            likeCount: item.isLiked ? item.likeCount - 1 : item.likeCount + 1,
          })
        );
      },
      onError: (error) => {
        console.error('Like toggle failed:', error);
      },
    }
  );

  return (
    <button
      onClick={() => toggleLikeMutation.mutate({ postId: post.id })}
      disabled={toggleLikeMutation.isPending}
      className={`like-btn ${post.isLiked ? 'liked' : ''}`}
    >
      {post.isLiked ? '❤️' : '🤍'} {post.likeCount}
    </button>
  );
};

/**
 * 5. 캐시 직접 조작 예시
 */
export const CacheManipulationExample: React.FC = () => {
  const { setQueryData, updateQueryData, getQueryData } = useCacheUpdater();
  
  const handleSetUser = () => {
    setQueryData<User>(queryKeys.users.detail(1), {
      id: 1,
      name: 'Cache User',
      email: 'cache@example.com',
      isActive: true,
      createdAt: new Date().toISOString(),
    });
  };

  const handleUpdateUser = () => {
    updateQueryData<User>(queryKeys.users.detail(1), (oldUser) => {
      if (!oldUser) return oldUser;
      return {
        ...oldUser,
        name: 'Updated ' + oldUser.name,
      };
    });
  };

  const handleGetUser = () => {
    const user = getQueryData<User>(queryKeys.users.detail(1));
    console.log('Current user in cache:', user);
  };

  return (
    <div>
      <button onClick={handleSetUser}>캐시에 사용자 설정</button>
      <button onClick={handleUpdateUser}>사용자 업데이트</button>
      <button onClick={handleGetUser}>사용자 조회 (콘솔)</button>
    </div>
  );
};

/**
 * 6. 검색 쿼리 예시 (디바운스 포함)
 */
export const SearchExample: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');

  // 디바운스 처리
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useApiQuery<User[]>(
    queryKeys.search.results(debouncedSearchTerm, 'users'),
    '/users/search',
    {
      enabled: debouncedSearchTerm.length > 2, // 3글자 이상일 때만 검색
      config: {
        params: { q: debouncedSearchTerm },
      },
    }
  );

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="사용자 검색..."
      />
      
      {isLoading && <div>검색 중...</div>}
      
      {data && data.length > 0 && (
        <ul>
          {data.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * 전체 예시를 포함한 컴포넌트
 */
export const AllExamples: React.FC = () => {
  return (
    <div>
      <h2>1. 기본 Query</h2>
      <UserListExample />
      
      <h2>2. Mutation</h2>
      <CreateUserExample />
      
      <h2>3. 무한 스크롤</h2>
      <InfinitePostsExample />
      
      <h2>4. 캐시 조작</h2>
      <CacheManipulationExample />
      
      <h2>5. 검색</h2>
      <SearchExample />
    </div>
  );
}; 