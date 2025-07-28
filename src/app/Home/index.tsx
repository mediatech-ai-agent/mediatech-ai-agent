import ChatInput from './components/ChatInput';
import AgentCardGrid from './components/AgentCardGrid';
import ChatMessages from './components/ChatMessages';
import { SideMenu } from './components/sideMenu';
import { useCurrentMessages, useChatSessions } from '@/stores/chatStore.ts';
import { useSidebarController, MENU_ITEMS, MENU_HEADER_ITEMS, getIconByAgentMode } from '@/shared/utils/useSidebarController';
import { useSidebarToggle } from '@/shared/hooks/useSidebarToggle';
import { ICON_PATH } from '@/shared/constants';

const SIDEBAR_WIDTH_EXPANDED = 280;
const SIDEBAR_WIDTH_COLLAPSED = 92;

const Home = () => {
  const messages = useCurrentMessages();
  const sessions = useChatSessions();
  const { handleMenuClick, handleHistoryClick } = useSidebarController();
  const { isCollapsed, toggle } = useSidebarToggle();

  // 세션에서 첫 번째 사용자 메시지를 17자까지 자른 제목 생성
  const getSessionTitle = (session: typeof sessions[0]): string => {
    const firstUserMessage = session.messages.find(message => message.sender === 'user');
    if (firstUserMessage) {
      const originalTitle = firstUserMessage.content;
      if (originalTitle.length > 17) {
        return `${originalTitle.slice(0, 17)}...`;
      }
      return originalTitle;
    }
    return session.title; // 사용자 메시지가 없으면 기본 제목 사용
  };

  // sessions 데이터를 historyItems 형태로 변환
  const historyItems = sessions.map(session => ({
    id: session.id,
    title: getSessionTitle(session),
    icon: getIconByAgentMode(session.agentMode),
  }));
  const currentSidebarWidth = isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <div className="overflow-hidden relative min-h-screen">
      <aside className={`fixed top-1/2 -translate-y-1/2 left-[60px] left-side-menu h-[810px] transition-all duration-300`}>
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
        />
      </aside>

      <main
        className={`custom-scrollbar transition-all duration-300 ${messages.length === 0 ? 'flex items-center justify-center' : 'overflow-y-auto'}`}
        style={{
          marginLeft: currentSidebarWidth + 177, // 사이드바 + 177px 마진
          marginRight: 212,
          minWidth: '1120px',
          height: 'calc(100vh - 308px)', // 전체 높이에서 ChatInput 높이(236px + 여백 72px) 제외
        }}
      >
        {messages.length === 0 && <AgentCardGrid />}
        {messages.length > 0 && <ChatMessages />}
      </main>

      <ChatInput />
    </div >
  );
};

export default Home;
