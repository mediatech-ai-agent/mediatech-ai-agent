import { useChatStore } from '@/stores/chatStore.ts';
import { useRequestAgent } from '@/shared/hooks/useRequestAgent';
import {
  getCurrentSessionId,
  getBrowserSessionId,
} from '@/shared/utils/sessionId';
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
  const requestAgent = useRequestAgent();
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [jiraTicketId, setJiraTicketId] = useState('');
  const [jiraCardWidth, setJiraCardWidth] = useState(140);
  const jiraCardRef = useRef<HTMLDivElement>(null);

  const isJiraMode = currentSession?.agentMode === 'jira';
  const isCrMode = currentSession?.agentMode === 'cr';
  const hasJiraNumber = currentSession?.jiraNumber;
  const isIssueKeyMode = isJiraMode || isCrMode;

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

  const handleSend = async (message: string) => {
    let fullMessage = message;
    let issueKey: string | undefined;

    if (isIssueKeyMode && jiraTicketId.trim()) {
      fullMessage = `${message}`;
      issueKey = jiraTicketId.trim();
      setJiraNumber(jiraTicketId.trim());
    }

    // 사용자 메시지 추가 (세션이 없으면 자동 생성됨)
    addUserMessage(fullMessage);
    setAiResponding(true);

    try {
      // 브라우저 세션 ID 조회 (없으면 새로 생성)
      const browserSessionId = getCurrentSessionId() || getBrowserSessionId();

      // 실제 API 호출
      const response = await requestAgent.mutateAsync({
        question: message,
        agent_type: currentSession?.agentMode || 'jira',
        issue_key: currentSession?.jiraNumber ?? issueKey,
        session_id: browserSessionId,
      });

      // API 응답을 AI 메시지로 추가
      addAiMessage(response.result);
    } catch (error) {
      console.error('API 요청 실패:', error);

      // 에러 시 fallback 메시지
      const errorMessage = `
## 죄송합니다. 일시적인 오류가 발생했습니다.

현재 AI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.

**오류 유형**: 네트워크 연결 오류
**해결 방법**: 
- 인터넷 연결을 확인해주세요
- 잠시 후 다시 시도해주세요
- 문제가 지속되면 관리자에게 문의해주세요

> 불편을 드려 죄송합니다. 🙏
      `;
      addAiMessage(errorMessage.trim());
    } finally {
      setAiResponding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      if (input.trim() !== '') {
        handleSend(input);
        setInput('');
        if (isIssueKeyMode) {
          setJiraTicketId('');
        }
      }
    }
  };

  return (
    <div
      className="fixed bottom-0 overflow-hidden chat-input-container"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'clamp(1192px, 80vw, 1400px)', // 반응형
        maxWidth: '1192px', // 최대 너비 제한
        minHeight: '236px', // 고정 최소 높이
        maxHeight: '600px', // 최대 높이 제한
        background: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderRadius: '24px', // 고정 보더 라디우스
        zIndex: 10,
        padding: '32px 40px', // 고정 패딩
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
              placeholder={'B tv 개발에 필요한 무엇이든 물어보세요'}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                minHeight: isIssueKeyMode ? '44px' : '124px',
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

        {isIssueKeyMode && !hasJiraNumber && (
          <div className="mb-3">
            <input
              type="text"
              className="w-full bg-transparent border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 text-lg outline-none focus:border-white/60 transition-colors"
              placeholder={
                isJiraMode ? 'BPM-00000' : isCrMode ? 'BR-00000' : 'Issue Key'
              }
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
                if (isIssueKeyMode) {
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
