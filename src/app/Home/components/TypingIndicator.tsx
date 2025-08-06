import React from 'react';

/**
 * 텍스트가 빛나는 타이핑 인디케이터 컴포넌트
 * - "B tv Agent가 생각 중입니다." 텍스트 자체가 빛나는 애니메이션
 */
const TypingIndicator: React.FC = () => {
    return (
        <div className="mt-10 mb-6 text-left w-fit">
            {/* 빛나는 텍스트 메시지 */}
            <div
                className="text-gray-400"
                style={{
                    fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '24px',
                    animation: 'text-glow 2s ease-in-out infinite',
                }}
            >
                B tv Agent가 생각 중입니다.
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
          @keyframes text-glow {
            0%, 100% {
              color: #9ca3af;
              text-shadow: none;
            }
            50% {
              color: #d1d5db;
              text-shadow: 
                0 0 10px rgba(255, 255, 255, 0.3),
                0 0 20px rgba(255, 255, 255, 0.2),
                0 0 30px rgba(255, 255, 255, 0.1);
            }
          }
        `
            }} />
        </div>
    );
};

export default TypingIndicator;