import React, { useState, useCallback } from 'react';
import { Check } from 'lucide-react';

interface CopyButtonProps {
    /** 복사할 텍스트 내용 */
    textContent: string;
    /** 추가 클래스명 */
    className?: string;
}

/**
 * 복사하기 버튼 컴포넌트
 * - 피그마 Frame 19 디자인 기반
 * - 아이콘 + 텍스트 조합
 * - 클립보드 복사 기능
 */
const CopyButton: React.FC<CopyButtonProps> = ({
    textContent,
    className = ''
}) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(textContent);
            setIsCopied(true);

            // 2초 후 원래 상태로 복원
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (error) {
            console.error('클립보드 복사 실패:', error);
        }
    }, [textContent]);

    return (
        <button
            onClick={handleCopy}
            className={`flex items-center transition-all duration-200 hover:opacity-80 ${className}`}
            style={{
                width: '85px', // 피그마 기준 너비
                height: '36px', // 피그마 기준 높이
            }}
            aria-label="텍스트 복사하기"
        >
            {/* 아이콘 영역 */}
            <div
                className="flex flex-shrink-0 justify-center items-center"
                style={{
                    width: '36px',
                    height: '36px',
                }}
            >
                {isCopied ? (
                    <Check
                        size={16}
                        className="text-green-400"
                    />
                ) : (
                    <img
                        src={`${import.meta.env.BASE_URL}assets/ic_copy_nor.png`}
                        alt="복사"
                        style={{
                            width: '32px',
                            height: '32px',
                            opacity: 0.9
                        }}
                    />
                )}
            </div>

            {/* 텍스트 영역 */}
            <span
                className="text-white"
                style={{
                    fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '24px',
                    letterSpacing: '0px',
                    opacity: 0.6,
                    marginLeft: '0px', // 아이콘과 텍스트 사이 간격 없음
                }}
            >
                {isCopied ? '복사됨!' : '복사하기'}
            </span>
        </button>
    );
};

export default CopyButton;
