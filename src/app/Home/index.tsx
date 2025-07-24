import { useRef, useEffect } from 'react';
import ChatInput from './components/ChatInput';
import AgentCard from './components/AgentCard';
import { useChatStore, useCurrentMessages } from '../../stores/chatStore';

const SIDEBAR_WIDTH = 240;

const Home = () => {
  const { addUserMessage, addAiMessage, setAiResponding, createSession } =
    useChatStore();
  const currentSession = useChatStore((state) => state.currentSession);
  const messages = useCurrentMessages();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAgentCardClick = (agentType: string) => {
    // 세션이 없으면 새로 생성
    if (!currentSession) {
      createSession();
    }

    let aiMessage = '';
    switch (agentType) {
      case 'jira':
        aiMessage =
          '어떤 이슈인지 금방 파악하고 싶은가요?\n CR이나 BR 링크만 주시면,\n히스토리부터 핵심 요점까지 정리해드릴게요.\n여러 개의 링크를 주시면,\n서로 어떻게 연결되는지도 같이 정리해드릴게요!';
        break;
      case 'cr':
        aiMessage =
          '사업 기획서를 개발 요청서로 바꾸고 싶을 때 사용하세요.\nBR이나 회의록 링크를 주시면,\n바로 쓸 수 있는 CR 형식으로 정리해드릴게요.\n\n기본적으로 배경, 필요 개발 컴포넌트, 카테고리, Acceptance Criteria, 요구사항 항목이 포함돼요.\n추가로 넣고 싶은 항목이 있다면 질문 입력창에서 선택해 주세요.';
        break;
      case 'polish':
        aiMessage =
          'B tv 서비스, UI 정책이 궁금하신가요?\n"홈 배너 노출 조건이 뭐야?"처럼\n구체적으로 질문해주시면 Figma, Confluence 정책 문서를 기반으로 알려드릴게요.';
        break;
      case 'person':
        aiMessage =
          '누구랑 이야기해야 할지 막막할 때 써보세요.\n궁금한 기능의 UI·GUI·개발 담당자를 찾는 건 물론,\n새로운 기획을 제안하거나 논의하고 싶을 때 연결할 담당자도 찾아드릴게요.';
        break;
    }

    if (aiMessage) {
      addAiMessage(aiMessage);
    }
  };

  const handleSend = (message: string) => {
    // 세션이 없으면 새로 생성
    if (!currentSession) {
      createSession();
    }

    // 사용자 메시지 추가
    addUserMessage(message);

    // AI 응답 시뮬레이션
    setAiResponding(true);
    setTimeout(() => {
      addAiMessage(`"${message}"에 대한 AI 응답입니다.`);
      setAiResponding(false);
    }, 1000);
  };

  const handleImageUpload = (file: File) => {
    console.log('Image uploaded:', file.name);

    // 세션이 없으면 새로 생성
    if (!currentSession) {
      createSession();
    }

    // 이미지 메시지 추가
    addUserMessage(`이미지를 업로드했습니다: ${file.name}`, 'image', {
      fileName: file.name,
      fileSize: file.size,
      imageUrl: URL.createObjectURL(file),
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fixed Sidebar */}
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

      {/* Main Chat Area */}
      <main
        className={`custom-scrollbar ${messages.length === 0 ? 'flex items-center justify-center' : 'overflow-y-auto'}`}
        style={{
          marginLeft: SIDEBAR_WIDTH + 177, // 사이드바 + 177px 마진
          marginRight: 212, // 우측 212px 마진
          minWidth: '1120px', // 최소 너비 1120px
          height: 'calc(100vh - 308px)', // 전체 높이에서 ChatInput 높이(236px + 여백 72px) 제외
        }}
      >
        {/* Agent Cards Section - 수직 중앙 (메시지가 없을 때만 표시) */}
        {messages.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
            <AgentCard
              title="Jira 요약하기"
              description="CR, BR 링크를 첨부해서\n댓글 요약, 히스토리 요청해 보세요"
              imageName="btn_jira"
              gradientColors={{
                primary: 'rgba(153, 211, 255, 0.2)',
                secondary: 'rgba(153, 255, 255, 0.1)',
              }}
              borderColor="rgba(153, 211, 255, 0.3)"
              shadowColor="rgba(153, 211, 255, 0.1)"
              onClick={() => handleAgentCardClick('jira')}
            />

            <AgentCard
              title="CR 생성하기"
              description="BR 링크를 첨부해서\nCR 초안 작성을 요청해 보세요"
              imageName="btn_cr"
              gradientColors={{
                primary: 'rgba(255, 165, 230, 0.2)',
                secondary: 'rgba(255, 167, 230, 0.1)',
              }}
              borderColor="rgba(255, 165, 230, 0.3)"
              shadowColor="rgba(255, 165, 230, 0.1)"
              onClick={() => handleAgentCardClick('cr')}
            />

            <AgentCard
              title="정책 문의하기"
              description="B tv 서비스 / UI 정책을 물어보세요\nFigma, Confluence 기반으로\n답변해 드려요"
              imageName="btn_polish"
              gradientColors={{
                primary: 'rgba(167, 178, 255, 0.2)',
                secondary: 'rgba(55, 73, 188, 0.1)',
              }}
              borderColor="rgba(167, 178, 255, 0.3)"
              shadowColor="rgba(167, 178, 255, 0.1)"
              onClick={() => handleAgentCardClick('polish')}
            />

            <AgentCard
              title="담당자 찾기"
              description="특정 서비스/기능 관련\nUI, GUI, 개발 담당자를 물어보세요"
              imageName="btn_person"
              gradientColors={{
                primary: 'rgba(199, 220, 255, 0.2)',
                secondary: 'rgba(96, 153, 252, 0.1)',
              }}
              borderColor="rgba(199, 220, 255, 0.3)"
              shadowColor="rgba(199, 220, 255, 0.1)"
              onClick={() => handleAgentCardClick('person')}
            />
          </div>
        )}

        {/* 채팅 영역 */}
        <div className="p-8 pt-12">
          {messages.map((msg) =>
            msg.sender === 'ai' ? (
              <div key={msg.id} className="mb-6 w-fit text-left">
                <div className="text-xs text-white/50 mb-2">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
                <div className="text-white leading-relaxed whitespace-pre-line inline-block">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-2xl">
                  <div className="text-xs text-white/50 mb-2 text-right">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                  <div
                    className="p-4 rounded-2xl rounded-br-md text-white leading-relaxed"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow:
                        '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    {msg.content}
                    {msg.type === 'image' && msg.metadata?.imageUrl && (
                      <img
                        src={msg.metadata.imageUrl}
                        alt={msg.metadata.fileName}
                        className="mt-3 max-w-full rounded-xl border border-white/20"
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* ChatInput - 하단 고정 */}
      <ChatInput onSend={handleSend} onImageUpload={handleImageUpload} />
    </div>
  );
};

export default Home;
