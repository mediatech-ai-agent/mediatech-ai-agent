import React from 'react';

interface SourceCardProps {
    title: string;
    description: string;
    iconUrl?: string;
    className?: string;
    onClick?: () => void;
}

/**
 * 출처 카드 컴포넌트
 * - 좌측: 출처 아이콘 (36px × 38px)
 * - 우측: 타이틀 텍스트 + 설명 텍스트
 * - 기본 상태: 투명한 배경
 * - Hover 상태: 반투명한 둥근 사각형 배경
 */
const SourceCard: React.FC<SourceCardProps> = ({
    title,
    description,
    iconUrl,
    className = '',
    onClick
}) => {
    return (
        <div
            className={`flex relative items-center rounded-3xl transition-all duration-200 ease-in-out cursor-pointer ${className}`}
            style={{
                width: '100%', // 컨테이너에 맞춰 자동 조정
                maxWidth: '327px', // SourceContainer 내부 콘텐츠 영역 최대 너비 (391-64=327px)
                height: '98px',
                padding: '16px 18px', // 상하 16px, 좌우 18px
                background: 'transparent', // 기본 상태: 투명
                border: '1px solid transparent', // 기본 상태에서도 투명한 border로 크기 유지
                boxSizing: 'border-box', // border가 내부 패딩에 포함되도록 설정
            }}
            onClick={onClick}
            onMouseEnter={(e) => {
                // SideMenu에서 사용하고 있는 동일한 glass 효과 적용
                const element = e.currentTarget;

                // menu-glass-background와 동일한 효과
                element.style.backgroundColor = 'transparent';
                element.style.border = '1px solid rgba(255, 255, 255, 0.08)';

                // SideMenu와 동일한 배경 그라디언트
                element.style.backgroundImage = `
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
                `;

                // SideMenu와 동일한 박스 섀도우
                element.style.boxShadow = `
                    inset 1px 1px 0 rgba(255, 255, 255, 0.15),
                    inset -1px -1px 0 rgba(255, 255, 255, 0.1),
                    0 0 0 0.5px rgba(255, 255, 255, 0.03)
                `;
            }}
            onMouseLeave={(e) => {
                // Hover 해제 시 완전 초기화
                const element = e.currentTarget;
                element.style.backgroundColor = 'transparent';
                element.style.border = '1px solid transparent'; // 투명한 border로 크기 유지
                element.style.backgroundImage = 'none';
                element.style.boxShadow = 'none';
            }}
        >
            {/* 좌측 아이콘 */}
            <div
                className="flex flex-shrink-0 justify-center items-center"
                style={{
                    width: '36px',
                    height: '38px',
                    marginRight: '18px', // 아이콘과 텍스트 사이 간격
                }}
            >
                {iconUrl ? (
                    <img
                        src={iconUrl}
                        alt="source icon"
                        className="object-contain w-full h-full"
                    />
                ) : (
                    // 기본 아이콘 (Confluence 스타일)
                    <div
                        className="flex justify-center items-center w-full h-full rounded bg-white/10"
                    >
                        <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                            <path
                                d="M2 0H18C19.1 0 20 0.9 20 2V14C20 15.1 19.1 16 18 16H2C0.9 16 0 15.1 0 14V2C0 0.9 0.9 0 2 0Z"
                                fill="white"
                                fillOpacity="0.7"
                            />
                        </svg>
                    </div>
                )}
            </div>

            {/* 우측 텍스트 영역 */}
            <div className="flex-1 min-w-0">
                {/* 타이틀 텍스트 */}
                <h3
                    className="text-white truncate"
                    style={{
                        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        lineHeight: '16.71px',
                        letterSpacing: '0px',
                        marginBottom: '4px',
                    }}
                >
                    {title}
                </h3>

                {/* 설명 텍스트 */}
                <p
                    className="text-gray-400"
                    style={{
                        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        fontSize: '12px',
                        fontWeight: 400,
                        lineHeight: '19.2px',
                        letterSpacing: '0px',
                        color: '#a0a0a0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {description}
                </p>
            </div>
        </div>
    );
};

export default SourceCard;