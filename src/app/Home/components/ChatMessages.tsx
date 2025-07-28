import { useCurrentMessages } from '@/stores/chatStore.ts';
import { useEffect, useRef } from 'react';
import MarkdownRenderer from '../../../shared/components/MarkdownRenderer';

const ChatMessages = () => {
  const messages = useCurrentMessages();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="p-8 pt-12">
      {messages.map((msg) =>
        msg.sender === 'ai' ? (
          <div key={msg.id} className="mb-6 text-left w-fit">
            <MarkdownRenderer content={msg.content} className="inline-block" />
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
