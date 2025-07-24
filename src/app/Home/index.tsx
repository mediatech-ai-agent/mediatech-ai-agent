import ChatInput from './components/ChatInput';
import AgentCardGrid from './components/AgentCardGrid';
import ChatMessages from './components/ChatMessages';
import { SideMenu } from './components/sideMenu';
import { useCurrentMessages } from '@/stores/chatStore.ts';
import { useSidebarController, MENU_ITEMS, MENU_HEADER_ITEMS } from '@/shared/utils/useSidebarController';
import { ICON_PATH } from '@/shared/constants';

const SIDEBAR_WIDTH = 280;

const Home = () => {
  const messages = useCurrentMessages();
  const { handleMenuClick, handleHistoryClick } = useSidebarController();

  // TODO: store 이관 및 local storage 저장을 위한 로직 추가
  const historyItems = [
    {
      id: 'history-1',
      title: '일반 질문에 대한 요약',
      icon: ICON_PATH.SIDE_MENU.NEW_CHAT,
    },
    {
      id: 'history-2',
      title: 'Jira 요약하기',
      icon: ICON_PATH.SIDE_MENU.JIRA,
    },
    {
      id: 'history-3',
      title: 'CR 생성하기',
      icon: ICON_PATH.SIDE_MENU.CR,
    },
    {
      id: 'history-4',
      title: '정책 문의하기',
      icon: ICON_PATH.SIDE_MENU.POLICY,
    },
    {
      id: 'history-5',
      title: '담당자 찾기',
      icon: ICON_PATH.SIDE_MENU.PERSON,
    },
  ]
  return (
    <div className="overflow-hidden relative min-h-screen">
      <aside className={`fixed top-1/2 flex-col items-center -translate-y-1/2 left-[60px] left-side-menu w-[${SIDEBAR_WIDTH}px] h-[810px]`}>
        <SideMenu
          title="B tv GPT"
          headerIcon={ICON_PATH.SIDE_MENU.MENU}
          menuHeaderItems={MENU_HEADER_ITEMS}
          menuItems={MENU_ITEMS}
          historyItems={historyItems}
          onMenuItemClick={handleMenuClick}
          onHistoryItemClick={handleHistoryClick}
        />
      </aside>

      <main
        className={`custom-scrollbar ${messages.length === 0 ? 'flex items-center justify-center' : 'overflow-y-auto'}`}
        style={{
          marginLeft: SIDEBAR_WIDTH + 177, // 사이드바 + 177px 마진
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
