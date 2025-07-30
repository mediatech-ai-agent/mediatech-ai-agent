import { useChatStore } from '@/stores/chatStore.ts';
import { ArrowUp, Link } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

const ChatInput = () => {
  const {
    addUserMessage,
    addAiMessage,
    setAiResponding,
    setJiraNumber,
    removeJiraNumber,
    currentSession,
  } = useChatStore();
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [jiraTicketId, setJiraTicketId] = useState('');
  const [jiraCardWidth, setJiraCardWidth] = useState(140);
  const jiraCardRef = useRef<HTMLDivElement>(null);

  const userMessageCount =
    currentSession?.messages?.filter((message) => message.sender === 'user')
      .length || 0;
  const showPlaceholder = userMessageCount === 0;
  const isJiraMode = currentSession?.agentMode === 'jira';
  const hasJiraNumber = currentSession?.jiraNumber;

  // Jira 카드 너비 측정
  useEffect(() => {
    if (hasJiraNumber && jiraCardRef.current) {
      const cardWidth = jiraCardRef.current.offsetWidth;
      setJiraCardWidth(cardWidth + 8); // 8px 여유 공간 추가
    }
  }, [hasJiraNumber]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleSend = (message: string) => {
    let fullMessage = message;
    if (isJiraMode && jiraTicketId.trim()) {
      fullMessage = `[${jiraTicketId.trim()}] ${message}`;
      setJiraNumber(jiraTicketId.trim());
    }

    // 사용자 메시지 추가 (세션이 없으면 자동 생성됨)
    addUserMessage(fullMessage);

    // AI 응답 시뮬레이션 (마크다운 형식)
    setAiResponding(true);
    setTimeout(() => {
      const markdownResponse =
        isJiraMode && jiraTicketId.trim()
          ? `
## "${jiraTicketId}" 티켓 분석 결과

안녕하세요! **${jiraTicketId}** 티켓에 대한 분석 결과입니다:

### 📋 티켓 정보
- **티켓 ID**: ${jiraTicketId}
- **요청 내용**: ${message}

### 🔍 분석 결과
- **상태**: 진행 중
- **우선순위**: 중간
- **담당자**: 개발팀

### 📝 권장 사항
1. **코드 리뷰** 필요
2. **테스트 케이스** 작성 필요
3. **문서화** 업데이트 필요

> Jira 티켓 분석이 완료되었습니다. 추가 정보가 필요하시면 말씀해 주세요!
        `
          : `
## "${message}"에 대한 AI 응답입니다.

안녕하세요! 다음과 같이 답변드립니다:

### 주요 포인트
- **중요한 내용**: 이것은 중요한 정보입니다
- *강조된 텍스트*: 이것은 강조된 내용입니다
- \`코드 예시\`: \`console.log('Hello')\`

### 코드 블록 예시
\`\`\`javascript
function example() {
  return "마크다운이 잘 렌더링됩니다!";
}
\`\`\`

> 이것은 인용문입니다. 중요한 내용을 강조할 때 사용합니다.

더 자세한 정보가 필요하시면 언제든 말씀해 주세요!
        `;
      addAiMessage(markdownResponse.trim());
      setAiResponding(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      if (input.trim() !== '') {
        handleSend(input);
        setInput('');
        if (isJiraMode) {
          setJiraTicketId(''); // jira 모드에서 메시지 전송 후 티켓 ID 초기화
        }
      }
    }
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 overflow-hidden"
      style={{
        width: '1192px',
        minHeight: '236px',
        maxHeight: '810px',
        background: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderRadius: '20px',
        zIndex: 10,
        padding: '24px 32px',
        boxSizing: 'border-box',
      }}
    >
      {/* Input area */}
      <div className="flex flex-col h-full">
        {/* Text input */}
        <div className="mb-4 relative">
          <div className="relative">
            {hasJiraNumber && (
              <div className="absolute left-0 top-0 z-10 group">
                <div
                  ref={jiraCardRef}
                  className="flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex-shrink-0 transition-opacity duration-200"
                  style={{
                    width: '152px',
                    height: '36px',
                    paddingLeft: '8px',
                    paddingRight: '8px',
                  }}
                >
                  <Link size={16} className="mr-2 text-white" />
                  <span
                    className="text-white font-medium"
                    style={{ fontSize: '17px' }}
                  >
                    {hasJiraNumber}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeJiraNumber();
                  }}
                  onMouseEnter={() => {
                    const card = jiraCardRef.current;
                    if (card) card.style.opacity = '0.1';
                  }}
                  onMouseLeave={() => {
                    const card = jiraCardRef.current;
                    if (card) card.style.opacity = '1';
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 ml-1 absolute"
                  style={{
                    top: '-11px',
                    left: '-15px',
                    border: '1px solid #fff',
                  }}
                >
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            <textarea
              className="w-full bg-transparent text-white placeholder-white/70 text-lg outline-none resize-none"
              placeholder={
                showPlaceholder ? 'B tv 개발에 필요한 무엇이든 물어보세요' : ''
              }
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                minHeight: isJiraMode ? '44px' : '120px',
                maxHeight: '676px',
                textIndent: hasJiraNumber ? `${jiraCardWidth + 20}px` : '0px',
                lineHeight: '1.5',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
          </div>
        </div>

        {isJiraMode && !hasJiraNumber && (
          <div className="mb-3">
            <input
              type="text"
              className="w-full bg-transparent border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 text-lg outline-none focus:border-white/60 transition-colors"
              placeholder="BPM-00000"
              value={jiraTicketId}
              onChange={(e) => setJiraTicketId(e.target.value)}
              style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                height: '58px',
              }}
            />
          </div>
        )}

        {/* Buttons area - fixed at bottom */}
        <div className="flex items-center justify-end">
          {/* Send button */}
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 relative overflow-hidden"
            style={
              input.trim()
                ? {
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                : {
                    background: 'rgba(255, 255, 255, 0.1)',
                    cursor: 'not-allowed',
                  }
            }
            onClick={() => {
              if (input.trim() !== '') {
                handleSend(input);
                setInput('');
                if (isJiraMode) {
                  setJiraTicketId('');
                }
              }
            }}
            onMouseEnter={(e) => {
              if (input.trim()) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (input.trim()) {
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <ArrowUp
              size={24}
              className={`${
                input.trim() ? 'text-white' : 'text-white/40'
              } transition-colors duration-200`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
