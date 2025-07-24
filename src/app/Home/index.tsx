import ChatInput from './components/ChatInput';
import AgentCardGrid from './components/AgentCardGrid';
import ChatMessages from './components/ChatMessages';
import { SideMenu } from './components/sideMenu';
import { useCurrentMessages } from '@/stores/chatStore.ts';
import { ICON_PATH } from '@/shared/constants';

const SIDEBAR_WIDTH = 240;

const Home = () => {
  const messages = useCurrentMessages();
  const handleMenuClick = (id: string) => {
    console.log('Menu clicked:', id);
  };

  const handleHistoryClick = (id: string) => {
    console.log('History clicked:', id);
  };

  // TODO: store 이관
  const menuHeaderItems = [
    {
      id: 'new-chat',
      title: '새로운 대화하기',
      icon: ICON_PATH.SIDE_MENU.NEW_CHAT,
    },
  ];

  // TODO: store 이관
  const menuItems = [
    {
      id: 'jira',
      title: 'Jira 요약하기',
      icon: ICON_PATH.SIDE_MENU.JIRA,
    },
    {
      id: 'cr',
      title: 'CR 생성하기',
      icon: ICON_PATH.SIDE_MENU.CR,
    },
    {
      id: 'policy',
      title: '정책 문의하기',
      icon: ICON_PATH.SIDE_MENU.POLICY,
    },
    {
      id: 'person',
      title: '담당자 찾기',
      icon: ICON_PATH.SIDE_MENU.PERSON,
    },
  ];

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
      <aside className={`fixed items-center top-flex-col left-side-menu w-[${SIDEBAR_WIDTH}px] h-[810px]`}>
        <SideMenu
          title="B tv Agent"
          headerIcon={ICON_PATH.SIDE_MENU.MENU}
          menuHeaderItems={menuHeaderItems}
          menuItems={menuItems}
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
