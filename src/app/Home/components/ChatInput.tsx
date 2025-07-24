import React, { useState } from 'react';
import { Camera, Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onImageUpload?: (file: File) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, onImageUpload }) => {
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      if (input.trim() !== '') {
        onSend(input);
        setInput('');
      }
    }
  };

  const handleImageClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && onImageUpload) {
        onImageUpload(file);
      }
    };
    fileInput.click();
  };

  return (
    <div
      className="fixed z-50 p-6 overflow-hidden"
      style={{
        height: '236px',
        bottom: '52px',
        left: '417px', // 사이드바(240px) + 마진(177px)
        right: '212px', // 우측 마진
        minWidth: '800px', // 최소 너비
        background: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderRadius: '20px',
      }}
    >
      {/* Input area */}
      <div className="flex flex-col h-full">
        {/* Text input */}
        <div className="flex-1 mb-4">
          <textarea
            className="w-full h-full bg-transparent text-white placeholder-white/70 text-lg outline-none resize-none"
            placeholder="B tv 개발에 필요한 무엇이든 물어보세요"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            style={{
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            }}
          />
        </div>

        {/* Buttons area - fixed at bottom */}
        <div className="flex items-center justify-between">
          {/* Image upload button */}
          <button
            type="button"
            onClick={handleImageClick}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 group relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
          >
            <Camera
              size={24}
              className="text-white group-hover:scale-110 transition-transform duration-200"
            />
          </button>

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
            <Send
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
