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
import AgentCardGrid from './components/AgentCardGrid';
import ChatHeader from './components/ChatHeader';
import ChatInput from './components/ChatInput';
import ChatMessages from './components/ChatMessages';
import { SideMenu } from './components/sideMenu';

const Home = () => {
  const messages = useCurrentMessages();
  const sessions = useChatSessions();
  const { togglePinSession, currentSession, isAiResponding } = useChatStore();
  const isSessionLoading = useIsSessionLoading();

  // AI 응답 상태 디버깅 및 시작 시간 추적
  useEffect(() => {
    console.log('🔄 isAiResponding 상태 변경:', isAiResponding);

    if (isAiResponding) {
      // AI 응답 시작 시간 기록
      const startTime = Date.now();
      setAiResponseStartTime(startTime);
      setUserHasScrolled(false); // 사용자 스크롤 상태 초기화
      // 현재 스크롤 위치 기록
      if (scrollContainerRef.current) {
        lastScrollTopRef.current = scrollContainerRef.current.scrollTop;
      }
      console.log('🚀 AI 응답 시작 - 스크롤 추적 시작');
    } else {
      // AI 응답 완료 시 시작 시간 초기화
      setAiResponseStartTime(null);
      setUserHasScrolled(false);
      console.log('✅ AI 응답 완료 - 최종 버튼 상태 체크');
      // 응답 완료 후 즉시 한 번 체크
      setTimeout(() => {
        checkScrollPositionImmediate();
      }, 100);
    }
  }, [isAiResponding]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [aiResponseStartTime, setAiResponseStartTime] = useState<number | null>(
    null
  );
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const lastScrollTopRef = useRef<number>(0);

  const { handleMenuClick, handleHistoryClick } = useSidebarController();
  const { isCollapsed, toggle } = useSidebarToggle();

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
        console.log('👆 사용자 스크롤 감지 - 즉시 버튼 상태 업데이트');
      }
    }

    // 사용자가 스크롤했거나 AI 응답이 끝났으면 즉시 체크
    const shouldCheckImmediately = userHasScrolled || !isAiResponding;

    if (shouldCheckImmediately) {
      console.log('🚀 즉시 스크롤 위치 체크');
      checkScrollPositionImmediate();
      return;
    }

    // AI 응답 중이고 사용자 스크롤이 없으면 디바운싱 적용
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;
      const shouldShowButton = !isAtBottom;

      console.log('📏 디바운싱된 스크롤 상태:', {
        scrollTop,
        scrollHeight,
        clientHeight,
        isAtBottom,
        shouldShowButton,
        isAiResponding,
        userHasScrolled,
      });

      setShowScrollToBottom(shouldShowButton);
    }, 800); // 디바운싱 시간을 800ms로 증가
  }, [isAiResponding, aiResponseStartTime, userHasScrolled]);

  // 즉시 스크롤 위치 체크 함수 (사용자 스크롤용)
  const checkScrollPositionImmediate = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;
    const shouldShowButton = !isAtBottom;

    console.log('⚡ 즉시 체크:', { scrollTop, isAtBottom, shouldShowButton });
    setShowScrollToBottom(shouldShowButton);
  }, []);

  // 스크롤 위치 감지 (사용자 스크롤은 즉시 반응)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // 사용자가 직접 스크롤했다고 표시
      if (isAiResponding) {
        setUserHasScrolled(true);
        console.log('🖱️ 사용자 직접 스크롤 감지');
      }
      checkScrollPositionImmediate(); // 즉시 체크
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    // 초기 상태 확인
    checkScrollPositionImmediate();

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
      console.log('🔄 AI 응답 완료 - 상태 정리');
    }
  }, [isAiResponding, aiResponseStartTime]);

  // 타이핑 애니메이션 중 DOM 변화 감지 (디바운싱 적용)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    console.log('👁️ MutationObserver 시작 - DOM 변화 감지');

    const observer = new MutationObserver(() => {
      console.log('🔄 DOM 변화 감지 - 디바운싱 스크롤 위치 체크');
      checkScrollPosition(); // 디바운싱 적용된 체크
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true, // 텍스트 변화도 감지
    });

    return () => {
      console.log('👁️ MutationObserver 중단');
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
        className={`fixed top-1/2 -translate-y-1/2 custom-scrollbar transition-all duration-300 flex flex-col ${
          messages.length === 0 ? 'items-center justify-center' : ''
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
            className="absolute inset-0 flex items-center justify-center agent-cards-wrapper"
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
              className="overflow-y-auto custom-scrollbar relative"
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
              <ChatMessages scrollContainerRef={scrollContainerRef} />
            </div>

            {/* 맨 아래로 버튼 - main 컨테이너 기준 */}
            {showScrollToBottom && (
              <button
                onClick={scrollToBottom}
                className="absolute left-1/2 transform -translate-x-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full p-2 shadow-lg transition-all duration-200 hover:shadow-xl z-10"
                style={{
                  width: '36px',
                  height: '36px',
                  bottom: '276px', // ChatInput 영역(266px) + 10px 여백
                }}
                aria-label="맨 아래로 스크롤"
              >
                <ArrowDown size={18} className="text-white m-auto" />
              </button>
            )}
          </>
        )}
        <ChatInput />
      </main>
    </div>
  );
};

export default Home;
