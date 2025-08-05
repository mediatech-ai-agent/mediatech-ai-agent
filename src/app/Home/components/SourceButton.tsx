import React from 'react';

interface SourceButtonProps {
    /** 출처 개수 (meta_data.length) */
    sourceCount: number;
    /** 클릭 이벤트 핸들러 */
    onClick?: () => void;
    /** 추가 클래스명 */
    className?: string;
}

/**
 * 출처 버튼 컴포넌트
 * - 피그마 Tooltip 디자인 기반
 * - SourceCard hover 스타일을 평시에 적용
 * - 클릭 시 SourceContainer 표시
 */
const SourceButton: React.FC<SourceButtonProps> = ({
    sourceCount,
    onClick,
    className = ''
}) => {
    return (
        <button
            onClick={onClick}
            className={`flex justify-center items-center transition-all duration-200 hover:opacity-90 ${className}`}
            style={{
                width: '76px', // 피그마 기준 너비
                height: '36px', // 피그마 기준 높이
                borderRadius: '200px', // 완전히 둥근 형태
                marginLeft: '4px', // 복사하기 버튼과 간격

                // SourceCard hover 시와 동일한 배경 효과를 평시에 적용
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundImage: `
          linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.06) 0%,
            rgba(255, 255, 255, 0.01) 25%,
            transparent 100%
          ),
          linear-gradient(
            315deg,
            rgba(255, 255, 255, 0.04) 0%,
            rgba(255, 255, 255, 0.005) 20%,
            transparent 100%
          )
        `,
                boxShadow: `
          inset 1px 1px 0 rgba(255, 255, 255, 0.15),
          inset -1px -1px 0 rgba(255, 255, 255, 0.1),
          0 0 0 0.5px rgba(255, 255, 255, 0.03)
        `,
            }}
            aria-label={`출처 ${sourceCount}개 보기`}
        >
            <span
                className="text-white"
                style={{
                    fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: '16px',
                    letterSpacing: '0px',
                    textAlign: 'center',
                }}
            >
                출처 +{sourceCount}
            </span>
        </button>
    );
};

export default SourceButton;
