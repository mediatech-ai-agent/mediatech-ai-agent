import { useCurrentMessages, useChatStore } from '@/stores/chatStore.ts';
import { useEffect, useRef, useState } from 'react';
import MarkdownRenderer from '../../../shared/components/MarkdownRenderer';
import { useTypewriter } from '../../../shared/hooks/useTypewriter';

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

const ChatMessages = () => {
  const messages = useCurrentMessages();
  const { currentSession, isAiResponding } = useChatStore();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [newMessageId, setNewMessageId] = useState<string | null>(null);
  const wasAiRespondingRef = useRef(isAiResponding);
  const currentSessionIdRef = useRef(currentSession?.id);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 세션 전환 시 최하단으로 스크롤
  useEffect(() => {
    if (currentSession?.id) {
      // 세션이 변경되면 약간의 지연 후 스크롤 (DOM 업데이트 대기)
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [currentSession?.id]);

  // 세션 변경 시 타이핑 상태 초기화 및 임시 세션의 첫 AI 메시지에 타이핑 효과 적용
  useEffect(() => {
    if (currentSession?.id !== currentSessionIdRef.current) {
      setNewMessageId(null);

      // 임시 세션이고 첫 번째 메시지가 AI 메시지인 경우에만 타이핑 효과 적용
      const isTemporarySession =
        currentSession?.id?.startsWith('temp_session_');
      if (
        isTemporarySession &&
        currentSession?.id &&
        messages.length === 1 &&
        messages[0]?.sender === 'ai'
      ) {
        const firstAiMessage = messages[0];
        setNewMessageId(firstAiMessage.id);

        // 타이핑 완료 후 상태 제거
        setTimeout(
          () => {
            setNewMessageId(null);
          },
          firstAiMessage.content.length * 15 + 1000 // 안내 메시지는 조금 더 빠르게
        );
      }

      currentSessionIdRef.current = currentSession?.id;
    }
  }, [currentSession?.id, messages]);

  // AI 응답이 완료된 직후의 메시지에만 타이핑 효과 적용
  useEffect(() => {
    const wasResponding = wasAiRespondingRef.current;
    const isNowResponding = isAiResponding;

    // AI 응답이 방금 완료되었을 때만 (true -> false로 변경)
    if (wasResponding && !isNowResponding && messages.length > 0) {
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

    // AI가 응답 중이면 타이핑 상태 제거
    if (isAiResponding) {
      setNewMessageId(null);
    }

    wasAiRespondingRef.current = isAiResponding;
  }, [isAiResponding, messages]);

  // 타이핑 중일 때 지속적으로 스크롤 유지
  useEffect(() => {
    if (newMessageId) {
      const scrollInterval = setInterval(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200); // 200ms마다 스크롤 체크

      return () => clearInterval(scrollInterval);
    }
  }, [newMessageId]);

  return (
    <div>
      {messages.map((msg) =>
        msg.sender === 'ai' ? (
          <div key={msg.id} className="mt-10 mb-6 text-left w-fit">
            {currentSession?.agentMode === 'cr' ? (
              <HtmlRenderer
                content={msg.content}
                className="inline-block"
                enableTyping={msg.id === newMessageId}
              />
            ) : (
              <TypewriterMarkdownRenderer
                content={msg.content}
                className="inline-block"
                enableTyping={msg.id === newMessageId}
              />
            )}
          </div>
        ) : (
          <div key={msg.id} className="flex justify-end">
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
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatMessages;
