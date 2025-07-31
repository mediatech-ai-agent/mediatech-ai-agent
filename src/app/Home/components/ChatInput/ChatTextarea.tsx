import React, { forwardRef } from 'react';

interface ChatTextareaProps {
  value: string;
  placeholder: string;
  jiraCardWidth: number;
  hasJiraNumber: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
}

const ChatTextarea = forwardRef<HTMLTextAreaElement, ChatTextareaProps>(
  (
    {
      value,
      placeholder,
      jiraCardWidth,
      hasJiraNumber,
      onChange,
      onKeyDown,
      onCompositionStart,
      onCompositionEnd,
    },
    ref
  ) => {
    return (
      <textarea
        ref={ref}
        className="w-full bg-transparent text-white placeholder-white/70 text-lg outline-none resize-none"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        style={{
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          minHeight: '80px',
          maxHeight: '600px',
          textIndent: hasJiraNumber ? `${jiraCardWidth + 20}px` : '0px',
          lineHeight: '1.5',
          padding: '0',
        }}
      />
    );
  }
);

ChatTextarea.displayName = 'ChatTextarea';

export default ChatTextarea;
