import {
  useCurrentMessages,
  useChatStore,
  useIsSessionLoading,
} from '@/stores/chatStore.ts';
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import MarkdownRenderer from '../../../shared/components/MarkdownRenderer';
import { useTypewriter } from '../../../shared/hooks/useTypewriter';
import ChatActions from './ChatActions';
import TypingIndicator from './TypingIndicator';

interface ChatMessagesProps {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  onShowSources?: (metaData: Array<{
    source: string;
    title: string;
    url: string;
  }>) => void;
  isMobile?: boolean;
  onTypingStateChange?: (isTyping: boolean) => void;
}

// HTML 렌더링 컴포넌트 (타이핑 효과 포함)
const HtmlRenderer = ({
  content,
  className,
  enableTyping = false,
}: {
  content: string;
  className?: string;
  enableTyping?: boolean;
}) => {
  const { displayedText } = useTypewriter({
    text: content,
    speed: 20,
    startTyping: enableTyping,
  });

  return (
    <div className={`cr-html-content ${className || ''}`}>
      <div dangerouslySetInnerHTML={{ __html: displayedText }} />
    </div>
  );
};

// 마크다운 렌더링 컴포넌트 (타이핑 효과 포함)
const TypewriterMarkdownRenderer = ({
  content,
  className,
  enableTyping = false,
}: {
  content: string;
  className?: string;
  enableTyping?: boolean;
}) => {
  const { displayedText } = useTypewriter({
    text: content,
    speed: 20,
    startTyping: enableTyping,
  });

  return (
    <div className={className}>
      <MarkdownRenderer content={displayedText} />
    </div>
  );
};

const ChatMessages = ({ scrollContainerRef, onShowSources, isMobile = false, onTypingStateChange }: ChatMessagesProps) => {
  const messages = useCurrentMessages();
  const { currentSession, isAiResponding } = useChatStore();
  const isSessionLoading = useIsSessionLoading();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [newMessageId, setNewMessageId] = useState<string | null>(null);
  const wasAiRespondingRef = useRef(isAiResponding);
  const currentSessionIdRef = useRef(currentSession?.id);
  const [sessionChangedRecently, setSessionChangedRecently] = useState(false);
  const [userScrollPosition, setUserScrollPosition] = useState<number | null>(
    null
  );
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // 타이핑 상태 변화를 부모 컴포넌트에 알림
  useEffect(() => {
    const isTyping = newMessageId !== null;
    onTypingStateChange?.(isTyping);
  }, [newMessageId, onTypingStateChange]);

  // 사용자 스크롤 감지
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      setIsUserScrolling(true);

      // AI 응답 중에만 스크롤 위치 저장
      if (isAiResponding) {
        const newScrollTop = container.scrollTop;
        setUserScrollPosition(newScrollTop);
      }

      // 스크롤이 멈춘 후 사용자 스크롤 상태 해제
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsUserScrolling(false);
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isAiResponding]);

  // AI 응답 중 사용자 스크롤 위치 고정 (typewriter 효과 중이 아닐 때만)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (
      !container ||
      !isAiResponding ||
      userScrollPosition === null ||
      isUserScrolling ||
      newMessageId || // typewriter 효과 중에는 스크롤 고정하지 않음
      sessionChangedRecently // 세션 변경 직후에는 스크롤 고정하지 않음
    )
      return;

    // 저장된 위치와 현재 위치가 크게 다를 때만 고정
    const currentScrollTop = container.scrollTop;
    const scrollDiff = Math.abs(currentScrollTop - userScrollPosition);

    if (scrollDiff > 10) {
      // 10px 이상 차이날 때만
      container.scrollTop = userScrollPosition;
    }
  }, [
    messages,
    isAiResponding,
    userScrollPosition,
    isUserScrolling,
    newMessageId,
    sessionChangedRecently,
  ]);

  // 사용자 메시지 추가 시 해당 메시지를 화면 상단으로 스크롤
  useEffect(() => {
    if (!isSessionLoading && !sessionChangedRecently && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      if (lastMessage.sender === 'user') {
        // 사용자 메시지를 화면 상단으로 스크롤
        const container = scrollContainerRef.current;
        if (container) {
          // 약간의 지연 후 메시지 요소 찾기 (DOM 업데이트 대기)
          setTimeout(() => {
            const messageElements =
              container.querySelectorAll('[data-message-id]');
            const lastMessageElement = Array.from(messageElements).find(
              (el) => el.getAttribute('data-message-id') === lastMessage.id
            );

            if (lastMessageElement) {
              const containerRect = container.getBoundingClientRect();
              const elementRect = lastMessageElement.getBoundingClientRect();
              const scrollTop =
                container.scrollTop + elementRect.top - containerRect.top - 20;

              container.scrollTo({ top: scrollTop, behavior: 'smooth' });
              setUserScrollPosition(null);
            }
          }, 100);
        }
      } else if (lastMessage.sender === 'ai' && !isAiResponding) {
        // AI 응답 완료 시 자동 스크롤 비활성화
        setUserScrollPosition(null);
      }
    }
  }, [messages, isSessionLoading, sessionChangedRecently, isAiResponding]);

  // 세션 변경 시 스크롤 관련 상태 초기화
  useEffect(() => {
    if (currentSession?.id !== currentSessionIdRef.current) {
      setSessionChangedRecently(true);
      currentSessionIdRef.current = currentSession?.id;

      // 세션 변경 후 600ms 동안은 ChatMessages에서 스크롤하지 않음
      setTimeout(() => {
        setSessionChangedRecently(false);
      }, 600);
    }
  }, [currentSession?.id]);

  // AI 응답 상태 변화 감지 및 스크롤 위치 저장
  useEffect(() => {
    const wasResponding = wasAiRespondingRef.current;
    const isNowResponding = isAiResponding;

    // AI 응답이 시작될 때 (false -> true로 변경)
    if (!wasResponding && isNowResponding) {
      const container = scrollContainerRef.current;
      if (container) {
        // 사용자 메시지 스크롤이 완료된 후 위치 저장 (1초 후)
        setTimeout(() => {
          if (container && isAiResponding) {
            // 여전히 AI가 응답 중인지 확인
            const currentScrollTop = container.scrollTop;
            setUserScrollPosition(currentScrollTop);
          }
        }, 1000);
      }
    }

    // AI 응답이 방금 완료되었을 때 타이핑 적용
    const isTemporaryToPermament =
      sessionChangedRecently &&
      currentSession?.id?.startsWith('session_') && // 정식 세션
      messages.length > 1 && // 대화가 진행됨
      messages[messages.length - 2]?.sender === 'user'; // 바로 전 메시지가 사용자 메시지

    if (
      wasResponding &&
      !isNowResponding &&
      messages.length > 0 &&
      (!sessionChangedRecently || isTemporaryToPermament)
    ) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.sender === 'ai') {
        setNewMessageId(lastMessage.id);

        // 타이핑 완료 후 상태 제거
        setTimeout(
          () => {
            setNewMessageId(null);
          },
          lastMessage.content.length * 10 + 1000
        );
      }
    }

    // AI 응답 완료 시 스크롤 위치 저장 해제
    if (wasResponding && !isNowResponding) {
      setUserScrollPosition(null);
    }

    // AI가 응답 중이면 타이핑 상태 제거
    if (isAiResponding) {
      setNewMessageId(null);
    }

    wasAiRespondingRef.current = isAiResponding;
  }, [isAiResponding, messages]);

  // 타이핑 중 자동 스크롤 비활성화
  // useEffect(() => {
  //   if (newMessageId && !isUserScrolling && userScrollPosition === null) {
  //     const scrollInterval = setInterval(() => {
  //       chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  //     }, 200);
  //     return () => clearInterval(scrollInterval);
  //   }
  // }, [newMessageId, isUserScrolling, userScrollPosition]);

  // 세션 로딩 중일 때는 로딩 화면 표시
  if (isSessionLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 rounded-full border-b-2 animate-spin border-white/50"></div>
          <div className="text-sm text-white/70">대화를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {messages.map((msg) =>
        msg.sender === 'ai' ? (
          <div
            key={msg.id}
            className={`mt-10 mb-6 text-left ${isMobile ? 'w-full' : 'w-fit'}`}
            data-message-id={msg.id}
            style={isMobile ? { textAlign: 'left', display: 'block', width: '100%' } : {}}
          >
            {currentSession?.agentMode === 'cr' ? (
              <HtmlRenderer
                content={msg.content}
                className={isMobile ? "block w-full text-left" : "inline-block"}
                enableTyping={
                  msg.id === newMessageId ||
                  // 임시 세션의 안내메시지
                  (currentSession?.id?.startsWith('temp_session_') &&
                    messages.every((m) => m.sender === 'ai') &&
                    msg.id === messages[messages.length - 1]?.id)
                }
              />
            ) : (
              <TypewriterMarkdownRenderer
                content={msg.content}
                className={isMobile ? "block w-full text-left" : "inline-block"}
                enableTyping={
                  msg.id === newMessageId ||
                  // 임시 세션의 안내메시지
                  (currentSession?.id?.startsWith('temp_session_') &&
                    messages.every((m) => m.sender === 'ai') &&
                    msg.id === messages[messages.length - 1]?.id)
                }
              />
            )}

            {/* ChatActions - AI 메시지 하단에 추가 (hideActions가 true인 경우 숨김) */}
            {!msg.hideActions && (
              <ChatActions
                textContent={msg.content}
                metaData={msg.sourceMetaData || []}
                onShowSources={msg.sourceMetaData ? () => onShowSources?.(msg.sourceMetaData!) : undefined}
              />
            )}
          </div>
        ) : (
          <div
            key={msg.id}
            className="flex justify-end"
            data-message-id={msg.id}
          >
            <div className="max-w-2xl">
              <div
                className="p-4 leading-relaxed text-white rounded-2xl rounded-br-md"
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

      {/* AI 응답 중일 때 타이핑 인디케이터 표시 */}
      {isAiResponding && <TypingIndicator />}

      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatMessages;
