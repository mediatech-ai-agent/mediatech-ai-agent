import { useMemo, useCallback } from 'react';
import { ICON_PATH } from '@/shared/constants';
import { useSidebarToggle } from '@/shared/hooks/useSidebarToggle';
import { MENU_HEADER_ITEMS, MENU_ITEMS, getIconByAgentMode, useSidebarController } from '@/shared/utils/useSidebarController';
import { useChatSessions, useCurrentMessages, useChatStore } from '@/stores/chatStore.ts';
import AgentCardGrid from './components/AgentCardGrid';
import ChatHeader from './components/ChatHeader';
import ChatInput from './components/ChatInput';
import ChatMessages from './components/ChatMessages';
import { SideMenu } from './components/sideMenu';

const SIDEBAR_WIDTH_EXPANDED = 280;

const Home = () => {
  const messages = useCurrentMessages();
  const sessions = useChatSessions();
  const { togglePinSession } = useChatStore();
  const { handleMenuClick, handleHistoryClick } = useSidebarController();
  const { isCollapsed, toggle } = useSidebarToggle();

  // 세션에서 첫 번째 사용자 메시지를 17자까지 자른 제목 생성
  const getSessionTitle = useCallback((session: typeof sessions[0]): string => {
    const firstUserMessage = session.messages.find(message => message.sender === 'user');
    if (firstUserMessage) {
      const originalTitle = firstUserMessage.content;
      if (originalTitle.length > 17) {
        return `${originalTitle.slice(0, 17)}...`;
      }
      return originalTitle;
    }
    return session.title; // 사용자 메시지가 없으면 기본 제목 사용
  }, []);

  // sessions 데이터를 historyItems 형태로 변환 - memoization으로 최적화
  const historyItems = useMemo(() =>
    sessions.map(session => ({
      id: session.id,
      title: getSessionTitle(session),
      icon: getIconByAgentMode(session.agentMode),
      isSaved: session.isPinned || false, // 고정 상태를 isSaved로 전달
    })), [sessions, getSessionTitle]
  );

  const handleHistorySaveToggle = useCallback((sessionId: string) => {
    togglePinSession(sessionId);
  }, [togglePinSession]);

  return (
    <div className="overflow-hidden relative min-h-screen">
      <aside className={`fixed top-1/2 transition-all duration-300 -translate-y-1/2 left-[60px] left-side-menu h-[810px]`}>
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
        className={`fixed top-1/2 -translate-y-1/2 custom-scrollbar transition-all duration-300 flex flex-col ${messages.length === 0 ? 'items-center justify-center' : ''}`}
        style={{
          marginLeft: SIDEBAR_WIDTH_EXPANDED + 177, // 사이드바 확장 상태 기준으로 고정 (280 + 177)
          marginRight: 212,
          minWidth: '1236px',
          height: '810px', // 전체 높이를 사이드바와 동일한 810px로 설정
        }}
      >
        {messages.length === 0 && (
          <div style={{ marginTop: '44px', height: '530px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0 24px' }}>
              <AgentCardGrid />
            </div>
          </div>
        )}
        {messages.length > 0 && (
          <>
            <ChatHeader />
            <div style={{ marginTop: '44px', height: '530px', overflowY: 'auto' }}>
              <ChatMessages />
            </div>
          </>
        )}
        <ChatInput />
      </main>
    </div >
  );
};

export default Home;