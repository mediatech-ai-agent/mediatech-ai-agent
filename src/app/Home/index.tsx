import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { ICON_PATH } from '@/shared/constants';
import { useSidebarToggle } from '@/shared/hooks/useSidebarToggle';
import {
  MENU_HEADER_ITEMS,
  MENU_ITEMS,
  getIconByAgentMode,
  useSidebarController,
} from '@/shared/utils/useSidebarController';
import {
  useChatSessions,
  useCurrentMessages,
  useChatStore,
  useIsSessionLoading,
} from '@/stores/chatStore.ts';
import type { RequestAgentResponse } from '@/shared/hooks/useRequestAgent';
import AgentCardGrid from './components/AgentCardGrid';
import ChatHeader from './components/ChatHeader';
import ChatInput from './components/ChatInput';
import ChatMessages from './components/ChatMessages';
import SourceContainer from './components/SourceContainer';
import { SideMenu } from './components/sideMenu';

/**
 * source 값에 따라 적절한 아이콘 URL을 반환하는 함수
 * @param source - 'jira', 'figma', 'confluence' 등의 소스 타입
 * @returns 해당하는 아이콘 URL 또는 undefined
 */
const getSourceIcon = (source: string): string | undefined => {
  switch (source.toLowerCase()) {
    case 'jira':
      return ICON_PATH.SOURCE_ICONS.JIRA;
    case 'figma':
      return ICON_PATH.SOURCE_ICONS.FIGMA;
    case 'confluence':
      return ICON_PATH.SOURCE_ICONS.CONFLUENCE;
    default:
      return undefined; // SourceCard에서 기본 아이콘 사용
  }
};

const Home = () => {
  const messages = useCurrentMessages();
  const sessions = useChatSessions();
  const { togglePinSession, currentSession, isAiResponding } = useChatStore();
  const isSessionLoading = useIsSessionLoading();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [aiResponseStartTime, setAiResponseStartTime] = useState<number | null>(
    null
  );
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const lastScrollTopRef = useRef<number>(0);

  // SourceContainer 상태 관리
  const [isSourceContainerVisible, setIsSourceContainerVisible] = useState(false);
  const [sourceContainerData, setSourceContainerData] = useState<Array<{
    id: string;
    title: string;
    sourceUrl: string;
    iconUrl?: string;
  }>>([]);


  // SourceContainer 표시 핸들러
  const handleShowSourceContainer = useCallback((metaData: Array<{
    source: string;
    title: string;
    url: string;
  }>) => {
    // metaData를 sourceContainer 형식으로 변환
    const sourceData = metaData.map((meta, index) => ({
      id: `source_${index}`,
      title: meta.title,
      sourceUrl: meta.url,
      iconUrl: getSourceIcon(meta.source),
    }));

    setSourceContainerData(sourceData);
    setIsSourceContainerVisible(true);
  }, []);

  // SourceContainer 닫기 핸들러
  const handleCloseSourceContainer = useCallback(() => {
    setIsSourceContainerVisible(false);
  }, []);

  // SourceContainer 외부 클릭 핸들러
  const handleSourceContainerOutsideClick = useCallback(() => {
    setIsSourceContainerVisible(false);
  }, []);

  const { handleMenuClick, handleHistoryClick } = useSidebarController();
  const { isCollapsed, toggle } = useSidebarToggle();

  // AI 응답 상태 및 시작 시간 추적
  useEffect(() => {
    if (isAiResponding) {
      // AI 응답 시작 시간 기록
      const startTime = Date.now();
      setAiResponseStartTime(startTime);
      setUserHasScrolled(false); // 사용자 스크롤 상태 초기화
      // 현재 스크롤 위치 기록
      if (scrollContainerRef.current) {
        lastScrollTopRef.current = scrollContainerRef.current.scrollTop;
      }
    } else {
      // AI 응답 완료 시 시작 시간 초기화
      setAiResponseStartTime(null);
      setUserHasScrolled(false);
      // 응답 완료 후 즉시 한 번 체크
      setTimeout(() => {
        checkScrollPositionImmediate();
      }, 100);
    }
  }, [isAiResponding]);

  // 메시지에서 RequestAgentResponse 감지하여 SourceContainer 데이터 설정
  useEffect(() => {
    // 가장 최근 AI 메시지에서 RequestAgentResponse 찾기
    const latestAiMessage = messages
      .filter(message => message.sender === 'ai')
      .reverse()
      .find(message => {
        try {
          const parsedData = JSON.parse(message.content) as RequestAgentResponse;
          return parsedData.meta_data && parsedData.meta_data.length > 0;
        } catch {
          return false;
        }
      });

    if (latestAiMessage) {
      try {
        const parsedData = JSON.parse(latestAiMessage.content) as RequestAgentResponse;
        if (parsedData.meta_data && parsedData.meta_data.length > 0) {
          // MetaData를 SourceCard format으로 변환
          const sourceData = parsedData.meta_data.map((meta, index) => ({
            id: `source-${index}`,
            title: meta.title,
            sourceUrl: meta.url,
            iconUrl: getSourceIcon(meta.source),
          }));

          setSourceContainerData(sourceData);
          // meta_data가 있으면 숨겨진 상태로 준비 (isVisible = false)
          setIsSourceContainerVisible(false);
        }
      } catch (error) {
        console.error('RequestAgentResponse 파싱 에러:', error);
      }
    } else {
      // meta_data가 없으면 SourceContainer 데이터 초기화
      setSourceContainerData([]);
      setIsSourceContainerVisible(false);
    }
  }, [messages]);

  // 세션에서 첫 번째 사용자 메시지를 17자까지 자른 제목 생성
  const getSessionTitle = useCallback(
    (session: (typeof sessions)[0]): string => {
      const firstUserMessage = session.messages.find(
        (message) => message.sender === 'user'
      );
      if (firstUserMessage) {
        const originalTitle = firstUserMessage.content;
        if (originalTitle.length > 17) {
          return `${originalTitle.slice(0, 17)}...`;
        }
        return originalTitle;
      }
      return session.title; // 사용자 메시지가 없으면 기본 제목 사용
    },
    []
  );

  // sessions 데이터를 historyItems 형태로 변환 - memoization으로 최적화
  const historyItems = useMemo(
    () =>
      sessions.map((session) => ({
        id: session.id,
        title: getSessionTitle(session),
        icon: getIconByAgentMode(session.agentMode),
        isSaved: session.isPinned || false, // 고정 상태를 isSaved로 전달
      })),
    [sessions, getSessionTitle]
  );

  const handleHistorySaveToggle = useCallback(
    (sessionId: string) => {
      togglePinSession(sessionId);
    },
    [togglePinSession]
  );

  // 맨 아래로 스크롤하는 함수
  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  // 디바운싱을 위한 ref
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 스크롤 위치 체크 함수 (스마트 디바운싱 적용)
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const currentScrollTop = container.scrollTop;

    // 사용자가 직접 스크롤했는지 감지
    if (aiResponseStartTime && !userHasScrolled) {
      const scrollDiff = Math.abs(currentScrollTop - lastScrollTopRef.current);
      if (scrollDiff > 50) {
        // 50px 이상 변화면 사용자 스크롤로 판단
        setUserHasScrolled(true);
      }
    }

    // 사용자가 스크롤했거나 AI 응답이 끝났으면 즉시 체크
    const shouldCheckImmediately = userHasScrolled || !isAiResponding;

    if (shouldCheckImmediately) {
      checkScrollPositionImmediate();
      return;
    }

    // AI 응답 중이고 사용자 스크롤이 없으면 디바운싱 적용
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20; // 여유분 통일
      const shouldShowButton = !isAtBottom;

      setShowScrollToBottom(shouldShowButton);
    }, 800); // 디바운싱 시간을 800ms로 증가
  }, [isAiResponding, aiResponseStartTime, userHasScrolled]);

  // 즉시 스크롤 위치 체크 함수 (사용자 스크롤용)
  const checkScrollPositionImmediate = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20; // 여유분을 20px로 줄임
    const shouldShowButton = !isAtBottom;

    setShowScrollToBottom(shouldShowButton);
  };

  // 스크롤 위치 감지 (사용자 스크롤은 즉시 반응)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // 사용자가 직접 스크롤했다고 표시
      if (isAiResponding) {
        setUserHasScrolled(true);
      }
      checkScrollPositionImmediate(); // 즉시 체크
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    // 초기 상태 확인
    // checkScrollPositionImmediate();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [checkScrollPositionImmediate, isAiResponding]);

  // 메시지 변경 시 스크롤 위치 체크 (디바운싱 적용)
  useEffect(() => {
    checkScrollPosition();
  }, [messages.length, checkScrollPosition]);

  // AI 응답 완료 후 정리 (필요시)
  useEffect(() => {
    if (!isAiResponding && aiResponseStartTime) {
      // 상태 정리 로직이 필요하면 여기에 추가
    }
  }, [isAiResponding, aiResponseStartTime]);

  // 타이핑 애니메이션 중 DOM 변화 감지 (디바운싱 적용)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new MutationObserver(() => {
      checkScrollPosition(); // 디바운싱 적용된 체크
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true, // 텍스트 변화도 감지
    });

    return () => {
      observer.disconnect();
      // 디바운싱 타이머도 클리어
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    };
  }, [checkScrollPosition]);

  // 세션 로딩 완료 시 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (currentSession?.id && !isSessionLoading && scrollContainerRef.current) {
      // 더 안정적인 스크롤 설정을 위해 여러 단계로 처리
      const autoScrollToBottom = () => {
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          container.scrollTop = container.scrollHeight;

          // 스크롤이 제대로 적용되었는지 확인하고, 안 되었으면 재시도
          requestAnimationFrame(() => {
            if (
              container.scrollTop <
              container.scrollHeight - container.clientHeight - 10
            ) {
              container.scrollTop = container.scrollHeight;
            }
          });
        }
      };

      // 첫 번째 시도: 즉시
      requestAnimationFrame(() => {
        autoScrollToBottom();

        // 두 번째 시도: 약간의 지연 후 (DOM 업데이트 완료 보장)
        setTimeout(() => {
          autoScrollToBottom();
        }, 100);
      });
    }
  }, [currentSession?.id, isSessionLoading]);

  return (
    <div className="overflow-hidden relative min-h-screen">
      <aside
        className="fixed top-1/2 transition-all duration-300 -translate-y-1/2 left-side-menu"
        style={{
          left: 'clamp(100px, 4.5vw, 100px)', // 반응형
          height: '810px', // 반응형
        }}
      >
        <SideMenu
          title="B tv GPT"
          headerIcon={ICON_PATH.SIDE_MENU.MENU}
          isCollapsed={isCollapsed}
          onToggle={toggle}
          menuHeaderItems={MENU_HEADER_ITEMS}
          menuItems={MENU_ITEMS}
          historyItems={historyItems}
          onMenuItemClick={handleMenuClick}
          onHistoryItemClick={handleHistoryClick}
          onHistorySaveToggle={handleHistorySaveToggle}
        />
      </aside>

      <main
        className={`fixed top-1/2 -translate-y-1/2 custom-scrollbar transition-all duration-300 flex flex-col ${messages.length === 0 ? 'items-center justify-center' : ''
          }`}
        style={{
          left: `calc((${isCollapsed ? '292px' : '480px'} + 100vw) / 2)`, // 사이드바 접힘 상태에 따른 동적 left (100px + 92px + 100px) vs (100px + 280px + 100px)
          right: 'clamp(100px, 14vw, 200px)', // 반응형
          transform: 'translateX(-50%)',
          width: 'auto', // 자동 너비
          height: '810px', // 반응형
          minWidth: '1192px', // 반응형
        }}
      >
        {messages.length === 0 && (
          <div
            className="flex absolute inset-0 justify-center items-center agent-cards-wrapper"
            style={{
              paddingBottom: 'clamp(286px, 30vh, 350px)', // ChatInput 높이 + 여백
              paddingTop: '0',
            }}
          >
            <div
              className="agent-card-grid-container"
              style={{
                width: '100%',
              }}
            >
              <AgentCardGrid />
            </div>
          </div>
        )}
        {messages.length > 0 && (
          <>
            <ChatHeader />
            <div
              ref={scrollContainerRef}
              className="overflow-y-auto relative custom-scrollbar"
              style={{
                position: 'absolute',
                top: '60px', // ChatHeader 높이 고려
                left: '0',
                right: '0',
                bottom: '266px', // 브라우저 바닥에서 316px 위까지
                paddingLeft: '32px',
                paddingRight: '32px',
                paddingBottom: '20px',
              }}
            >
              <ChatMessages
                scrollContainerRef={scrollContainerRef}
                onShowSources={handleShowSourceContainer}
              />
            </div>

            {/* 맨 아래로 버튼 - main 컨테이너 기준 */}
            {showScrollToBottom && (
              <button
                onClick={scrollToBottom}
                className="absolute left-1/2 z-10 p-2 rounded-full shadow-lg backdrop-blur-md transition-all duration-200 transform -translate-x-1/2 bg-white/20 hover:bg-white/30 hover:shadow-xl"
                style={{
                  width: '36px',
                  height: '36px',
                  bottom: '276px', // ChatInput 영역(266px) + 10px 여백
                }}
                aria-label="맨 아래로 스크롤"
              >
                <ArrowDown size={18} className="m-auto text-white" />
              </button>
            )}
          </>
        )}
        <ChatInput />
      </main>

      {/* SourceContainer - API 응답의 meta_data가 있을 때만 렌더링 */}
      {sourceContainerData.length > 0 && (
        <SourceContainer
          title="출처"
          sources={sourceContainerData}
          isVisible={isSourceContainerVisible}
          onClose={handleCloseSourceContainer}
          onOutsideClick={handleSourceContainerOutsideClick}
        />
      )}
    </div>
  );
};

export default Home;
