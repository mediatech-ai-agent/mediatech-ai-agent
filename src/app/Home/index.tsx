import ChatInput from './components/ChatInput';
import AgentCardGrid from './components/AgentCardGrid';
import ChatMessages from './components/ChatMessages';
import { useCurrentMessages } from '@/stores/chatStore.ts';

const SIDEBAR_WIDTH = 240;

const Home = () => {
  const messages = useCurrentMessages();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <aside
        className="fixed top-0 left-0 h-full z-20 hidden md:flex flex-col"
        style={{
          width: SIDEBAR_WIDTH,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex-1 flex items-center justify-center text-white/40">
          Sidebar
        </div>
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
    </div>
  );
};

export default Home;
