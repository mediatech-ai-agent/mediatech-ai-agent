import { useMemo, useCallback } from 'react';
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
} from '@/stores/chatStore.ts';
import AgentCardGrid from './components/AgentCardGrid';
import ChatHeader from './components/ChatHeader';
import ChatInput from './components/ChatInput';
import ChatMessages from './components/ChatMessages';
import { SideMenu } from './components/sideMenu';

const Home = () => {
  const messages = useCurrentMessages();
  const sessions = useChatSessions();
  const { togglePinSession, currentSession } = useChatStore();

  // 사용자 메시지가 있는지 확인
  const hasUserMessage =
    currentSession?.messages?.some((message) => message.sender === 'user') ||
    false;
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
              className="overflow-y-auto custom-scrollbar"
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
              <ChatMessages />
            </div>
          </>
        )}
        <ChatInput />
      </main>
    </div>
  );
};

export default Home;
