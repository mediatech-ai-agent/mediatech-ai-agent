import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowUp, Link } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore.ts';
import { useRequestAgent } from '@/shared/hooks/useRequestAgent';
import { Tooltip } from '@/shared/components';

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
  const jiraCardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [jiraTicketId, setJiraTicketId] = useState('');
  const [jiraCardWidth, setJiraCardWidth] = useState(140);
  const [isSendBtnHovered, setIsSendBtnHovered] = useState(false);

  const isJiraMode = currentSession?.agentMode === 'jira';
  const isCrMode = currentSession?.agentMode === 'cr';
  const hasJiraNumber = currentSession?.jiraNumber;
  const isIssueKeyMode = isJiraMode || isCrMode;

  const ableSendMessage = useMemo(() => {
    if (!input.trim()) {
      return false;
    }

    if (isIssueKeyMode && !hasJiraNumber) {
      return false;
    }

    return true;
  }, [input, isIssueKeyMode, jiraTicketId]);

  // Jira 카드 너비 측정
  useEffect(() => {
    if (hasJiraNumber && jiraCardRef.current) {
      const cardWidth = jiraCardRef.current.offsetWidth;
      setJiraCardWidth(cardWidth + 8); // 8px 여유 공간 추가
    }
  }, [hasJiraNumber]);

  // textarea 높이 자동 조정
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

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
      // 실제 API 호출
      const response = await requestAgent.mutateAsync({
        question: message,
        agent_type: currentSession?.agentMode ?? null,
        issue_key: currentSession?.jiraNumber ?? issueKey,
        session_id: currentSession?.id ?? '',
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
        maxHeight: '800px', // 최대 높이를 800px로 줄임
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
      <div className="relative flex flex-col h-full">
        {/* Textarea - 위쪽 영역 */}
        <div className="flex-1 relative min-h-0">
          <div className="relative h-full">
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
              ref={textareaRef}
              className="w-full bg-transparent text-white placeholder-white/70 text-lg outline-none resize-none"
              placeholder={'B tv 개발에 필요한 무엇이든 물어보세요'}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                minHeight: '80px',
                maxHeight: '600px', // 고정 최대 높이
                textIndent: hasJiraNumber ? `${jiraCardWidth + 20}px` : '0px',
                lineHeight: '1.5',
                padding: '0',
              }}
            />
          </div>
        </div>

        {/* Bottom area - Input과 Send button 수직 배치 */}
        <div
          className="flex flex-col flex-shrink-0"
          style={{ height: '120px' }}
        >
          {/* Jira Ticket ID input field */}
          {isIssueKeyMode && !hasJiraNumber ? (
            <div className="mb-4">
              <input
                type="text"
                className="bg-transparent border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 text-lg outline-none focus:border-white/60 transition-colors w-full"
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
          ) : (
            /* input이 없을 때는 같은 높이의 빈 공간을 만들어서 send button 위치 고정 */
            <div style={{ height: '58px', marginBottom: '16px' }}></div>
          )}

          {/* Send button - 항상 같은 위치에 고정 */}
          <div className="flex justify-end">
            <Tooltip
              content={'질문 보내기'}
              position="bottom"
              show={isSendBtnHovered}
              className="z-10"
            >
              <button
                type="submit"
                disabled={!ableSendMessage}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 relative overflow-hidden"
                style={
                  ableSendMessage
                    ? {
                        background: 'rgba(255, 255, 255, 0.1)',
                      }
                    : {
                        background: 'rgba(255, 255, 255, 0.1)',
                        cursor: 'not-allowed',
                      }
                }
                onClick={() => {
                  if (ableSendMessage) {
                    handleSend(input);
                    setInput('');
                    if (isIssueKeyMode) {
                      setJiraTicketId('');
                    }
                  }
                }}
                onMouseEnter={() => {
                  if (ableSendMessage) {
                    setIsSendBtnHovered(true);
                  }
                }}
                onMouseLeave={() => {
                  setIsSendBtnHovered(false);
                }}
              >
                <ArrowUp
                  size={24}
                  className={`${
                    ableSendMessage ? 'text-white' : 'text-white/40'
                  } transition-colors duration-200`}
                />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
