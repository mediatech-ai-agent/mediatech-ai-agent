import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import SourceCard from './SourceCard';
import Tooltip from '@/shared/components/Tooltip';

interface SourceItem {
    id: string;
    title: string;
    sourceUrl: string;
    iconUrl?: string;
}

interface SourceContainerProps {
    title?: string;
    sources: SourceItem[];
    isVisible?: boolean;
    onClose?: () => void;
    onOutsideClick?: () => void;
    className?: string;
    isMobile?: boolean;
}

/**
 * URL을 새 탭에서 여는 함수
 * @param url - 열고자 하는 URL
 */
const openUrlInNewTab = (url: string) => {
    // URL이 유효한지 체크하고 새 탭에서 열기
    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
};

/**
 * 출처 컨테이너 컴포넌트
 * - 출처 제목, X 버튼, 텍스트 버블들을 포함하는 wrapper 컴포넌트
 * - 파란색 반투명 배경과 스트로크를 가짐
 * - 화면 전체 높이를 차지하며 우측에 고정
 */
const SourceContainer: React.FC<SourceContainerProps> = ({
    title = '출처',
    sources,
    isVisible = true,
    onClose,
    onOutsideClick,
    className = '',
    isMobile = false
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                onOutsideClick?.();
            }
        };

        if (isVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVisible, onOutsideClick]);

    // 컴포넌트가 보이지 않으면 렌더링하지 않음
    if (!isVisible) {
        return null;
    }
    return (
        <div
            ref={containerRef}
            className={`overflow-y-auto fixed top-0 right-0 border shadow-2xl custom-scrollbar border-indigo-400/50 ${className} ${isMobile ? 'source-container-mobile' : ''}`}
            style={{
                backgroundColor: 'rgba(12, 18, 79, 0.7)', // #0c124f with 70% opacity
                borderColor: '#6271c7',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                width: isMobile ? 'calc(100vw - 20px)' : '391px',
                height: isMobile ? 'calc(100vh - 200px)' : '100vh',
                borderRadius: isMobile ? '16px' : '0', // 모바일에서는 둥근 모서리
                padding: isMobile ? '20px' : '32px',
                top: isMobile ? '60px' : '0',
                right: isMobile ? '10px' : '0',
                zIndex: 10000, // 최상단 레이어
            }}
        >
            {/* Header with title and close button */}
            <div className="flex justify-between items-start mb-12">
                <h3
                    className="text-lg font-semibold text-white"
                    style={{
                        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        fontSize: '18px',
                        fontWeight: 600,
                        lineHeight: '28.8px',
                        letterSpacing: '0px',
                        marginTop: '7px', // 피그마 기준 정렬을 위한 조정 (29-22=7px)
                    }}
                >
                    {title}
                </h3>

                {onClose && (
                    <Tooltip content="출처 닫기" position="bottom" delay={300}>
                        <button
                            onClick={onClose}
                            className="flex justify-center items-center transition-all duration-200 group text-white/80"
                            style={{
                                width: '40px', // 클릭 영역 확대
                                height: '40px', // 클릭 영역 확대
                                marginTop: '-3px', // 피그마 기준 위치 조정 (29-32=-3px)
                                marginRight: '-3px', // 피그마 기준 우측 여백 조정 (35-32=3px)
                                borderRadius: '50%', // 원형 효과
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <X
                                size={20}
                                className="transition-colors duration-200 text-white/80 group-hover:text-white"
                            />
                        </button>
                    </Tooltip>
                )}
            </div>

            {/* Source cards */}
            <div className="space-y-3">
                {sources.map((source, index) => (
                    <SourceCard
                        key={source.id}
                        title={source.title}
                        sourceUrl={source.sourceUrl}
                        iconUrl={source.iconUrl}
                        className={index === sources.length - 1 ? 'mb-0' : ''}
                        onClick={() => openUrlInNewTab(source.sourceUrl)}
                    />
                ))}
            </div>
        </div>
    );
};

export default SourceContainer;