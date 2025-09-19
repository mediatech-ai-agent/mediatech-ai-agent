import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { ArrowDown, Menu } from 'lucide-react';
import { ICON_PATH } from '@/shared/constants';
import { useSidebarToggle } from '@/shared/hooks/useSidebarToggle';
import { useMobileMenu } from '@/shared/hooks/useMobileMenu';
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

// 스타일 유틸리티 함수들
const getMainStyles = (isMobile: boolean, isCollapsed: boolean) => {
  if (isMobile) {
    return {};
  }

  return {
    // 데스크탑에서만 인라인 스타일 적용
    left: `calc((${isCollapsed ? '292px' : '480px'} + 100vw) / 2)`,
    right: 'clamp(100px, 14vw, 200px)',
    transform: 'translateX(-50%)',
    width: 'auto',
    height: '810px',
    minWidth: '1192px',
  };
};

const getMainClassName = (isMobile: boolean, hasMessages: boolean) => {
  return `fixed top-1/2 custom-scrollbar transition-all duration-300 flex flex-col ${isMobile ? '-translate-y-1/10' : '-translate-y-1/2'
    } ${hasMessages ? '' : 'items-center justify-center'}`;
};

const getAgentCardGridContainerStyles = (isMobile: boolean) => {
  if (isMobile) {
    return {
      top: '60px',
      left: 0,
      right: 0,
      bottom: '160px',
    };
  }

  return { top: '-250px' };
};

const getAgentCardGridStyles = (isMobile: boolean) => {
  if (isMobile) {
    return {
      width: '320px',
      maxWidth: '320px',
    };
  }

  return {};
};

const getChatHeaderStyles = (isMobile: boolean) => {
  if (isMobile) {
    return {
      position: 'absolute' as const,
      top: '140px',
      left: '0px',
      right: '10px',
      padding: '0',
      textAlign: 'left' as const,
    };
  }

  return {};
};

const getChatMessagesStyles = (isMobile: boolean) => {
  return {
    position: 'absolute' as const,
    top: isMobile ? '220px' : '60px',
    left: '0',
    right: '0',
    bottom: isMobile ? '160px' : '266px',
    paddingLeft: isMobile ? '20px' : '32px',
    paddingRight: isMobile ? '20px' : '32px',
    paddingBottom: '20px',
    textAlign: isMobile ? ('left' as const) : ('inherit' as const),
  };
};

const getScrollToBottomStyles = (isMobile: boolean) => {
  return {
    width: '36px',
    height: '36px',
    bottom: isMobile ? '200px' : '276px',
  };
};

const getContainerStyles = (isMobile: boolean) => {
  return isMobile ? { paddingBottom: '160px' } : {};
};

// 컴포넌트 렌더링 유틸리티 함수들
const renderSideMenu = (
  isMobile: boolean,
  isCollapsed: boolean,
  toggle: () => void,
  historyItems: Array<{ id: string; title: string; icon: string; isSaved: boolean }>,
  handleMenuClick: (id: string) => void,
  handleHistoryClick: (id: string) => void,
  handleHistorySaveToggle: (id: string) => void,
  isMobileMenuOpen: boolean,
  closeMobileMenu: () => void
) => {
  const sideMenuProps = {
    title: "B tv Agent",
    headerIcon: ICON_PATH.SIDE_MENU.MENU,
    isCollapsed,
    onToggle: toggle,
    menuHeaderItems: MENU_HEADER_ITEMS,
    menuItems: MENU_ITEMS,
    historyItems,
    onMenuItemClick: handleMenuClick,
    onHistoryItemClick: handleHistoryClick,
    onHistorySaveToggle: handleHistorySaveToggle,
    isMobile,
    isMobileMenuOpen,
    onMobileMenuClose: closeMobileMenu,
  };

  if (isMobile) {
    return <SideMenu {...sideMenuProps} />;
  }

  return (
    <aside
      className="fixed top-1/2 transition-all duration-300 -translate-y-1/2 left-side-menu"
      style={{
        left: 'clamp(100px, 4.5vw, 100px)', // 반응형
        height: '810px', // 반응형
      }}
    >
      <SideMenu {...sideMenuProps} />
    </aside>
  );
};

const Home = () => {
  const messages = useCurrentMessages();
  const sessions = useChatSessions();
  const { togglePinSession, currentSession } = useChatStore();
  const isSessionLoading = useIsSessionLoading();
  const { isMobile, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useMobileMenu();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // AI 타이핑 중에만 모든 상태 변경을 차단하는 보호된 setter
  const setShowScrollToBottomProtected = useCallback((value: boolean) => {
    if (isTyping) {
      return;
    }

    if (showScrollToBottom === value) {
      return;
    }

    setShowScrollToBottom(value);
  }, [isTyping, showScrollToBottom]);

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

  // AI 타이핑 상태 변화 감지
  useEffect(() => {
    if (isTyping) {
      setShowScrollToBottom(true);
    } else {
      setTimeout(() => {
        checkScrollPositionImmediate();
      }, 100);
    }
  }, [isTyping, setShowScrollToBottomProtected]);

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


  // 스크롤 위치 체크 함수 (AI 타이핑 중에는 무조건 true)
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (isTyping) {
      setShowScrollToBottomProtected(true);
      return;
    }

    checkScrollPositionImmediate();
  }, [isTyping, setShowScrollToBottomProtected]);

  // 즉시 스크롤 위치 체크 함수 (AI 타이핑 중에는 무조건 true 유지)
  const checkScrollPositionImmediate = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (isTyping) {
      setShowScrollToBottomProtected(true);
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;
    const shouldShowButton = !isAtBottom;

    setShowScrollToBottomProtected(shouldShowButton);
  }, [isTyping, setShowScrollToBottomProtected]);

  // 스크롤 위치 감지 (AI 응답 중에는 무조건 버튼 표시)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isTyping) {
        setShowScrollToBottomProtected(true);
        return;
      }
      checkScrollPositionImmediate();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isTyping, checkScrollPositionImmediate]);

  // 메시지 변경 시 스크롤 위치 체크 (디바운싱 적용)
  useEffect(() => {
    checkScrollPosition();
  }, [messages.length, checkScrollPosition]);


  // 타이핑 애니메이션 중 DOM 변화 감지 (디바운싱 적용)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new MutationObserver(() => {
      if (isTyping) {
        setShowScrollToBottomProtected(true);
        return;
      }

      checkScrollPosition();
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true, // 텍스트 변화도 감지
    });

    return () => {
      observer.disconnect();
    };
  }, [checkScrollPosition, isTyping]);

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
    <div
      className="overflow-hidden relative min-h-screen"
      style={getContainerStyles(isMobile)}
    >
      {/* SideMenu 렌더링 - 모바일/데스크탑 조건부 */}
      {renderSideMenu(
        isMobile,
        isCollapsed,
        toggle,
        historyItems,
        handleMenuClick,
        handleHistoryClick,
        handleHistorySaveToggle,
        isMobileMenuOpen,
        closeMobileMenu
      )}

      {/* 모바일 햄버거 메뉴 버튼 */}
      {isMobile && !isMobileMenuOpen && (
        <button
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 p-3 rounded-lg transition-all duration-200 hover:bg-white/10"
          style={{ zIndex: 9999 }} // 최상위 레이어
          aria-label="메뉴 열기"
        >
          <Menu size={24} className="text-white" />
        </button>
      )}

      <main
        className={getMainClassName(isMobile, messages.length > 0)}
        style={getMainStyles(isMobile, isCollapsed)}
      >
        {messages.length === 0 && (
          <div
            className={`flex absolute justify-center items-center ${!isMobile ? 'inset-0 agent-cards-wrapper' : ''}`}
            style={getAgentCardGridContainerStyles(isMobile)}
          >
            <div
              className="agent-card-grid-container"
              style={getAgentCardGridStyles(isMobile)}
            >
              <AgentCardGrid />
            </div>
          </div>
        )}
        {messages.length > 0 && (
          <>
            <div
              className={isMobile ? 'chat-header-container' : ''}
              style={getChatHeaderStyles(isMobile)}
            >
              <ChatHeader isMobile={isMobile} />
            </div>
            <div
              ref={scrollContainerRef}
              className={`overflow-y-auto relative custom-scrollbar ${isMobile ? 'chat-messages-container' : ''}`}
              style={getChatMessagesStyles(isMobile)}
            >
              <ChatMessages
                scrollContainerRef={scrollContainerRef}
                onShowSources={handleShowSourceContainer}
                isMobile={isMobile}
                onTypingStateChange={setIsTyping}
              />
            </div>

            {/* 맨 아래로 버튼 - main 컨테이너 기준 */}
            {showScrollToBottom && (
              <button
                onClick={scrollToBottom}
                className={`absolute left-1/2 z-10 p-2 rounded-full shadow-lg backdrop-blur-md transition-all duration-200 transform -translate-x-1/2 bg-white/20 hover:bg-white/30 hover:shadow-xl ${isMobile ? 'scroll-to-bottom-mobile' : ''}`}
                style={getScrollToBottomStyles(isMobile)}
                aria-label="맨 아래로 스크롤"
              >
                <ArrowDown size={18} className="m-auto text-white" />
              </button>
            )}
          </>
        )}

        {/* 데스크탑에서는 원래 위치에 ChatInput 렌더링 */}
        {!isMobile && <ChatInput />}
      </main>

      {/* SourceContainer - API 응답의 meta_data가 있을 때만 렌더링 */}
      {sourceContainerData.length > 0 && (
        <SourceContainer
          title="출처"
          sources={sourceContainerData}
          isVisible={isSourceContainerVisible}
          onClose={handleCloseSourceContainer}
          onOutsideClick={handleSourceContainerOutsideClick}
          isMobile={isMobile}
        />
      )}

      {/* ChatInput - 모바일일 때만 여기서 렌더링 */}
      {isMobile && <ChatInput />}
    </div>
  );
};

export default Home;
