import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
    /** 툴팁에 표시될 텍스트 */
    content: string;
    /** 툴팁을 트리거할 자식 요소 */
    children: React.ReactNode;
    /** 툴팁 위치 */
    position?: 'top' | 'bottom' | 'left' | 'right';
    /** 지연 시간 (ms) */
    delay?: number;
    /** 수동으로 표시 여부 제어 */
    show?: boolean;
    /** 툴팁 클래스명 */
    className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top',
    delay = 500,
    show,
    className = '',
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [actualPosition, setActualPosition] = useState(position);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    // 툴팁 위치 계산
    const calculatePosition = () => {
        if (!tooltipRef.current || !triggerRef.current) return;

        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let newPosition = position;

        // 화면 경계 체크 및 위치 조정
        if (position === 'top' && triggerRect.top - tooltipRect.height < 10) {
            newPosition = 'bottom';
        } else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height > viewportHeight - 10) {
            newPosition = 'top';
        } else if (position === 'left' && triggerRect.left - tooltipRect.width < 10) {
            newPosition = 'right';
        } else if (position === 'right' && triggerRect.right + tooltipRect.width > viewportWidth - 10) {
            newPosition = 'left';
        }

        setActualPosition(newPosition);
    };

    const handleMouseEnter = () => {
        if (show !== undefined) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
            // 다음 프레임에서 위치 계산
            requestAnimationFrame(calculatePosition);
        }, delay);
    };

    const handleMouseLeave = () => {
        if (show !== undefined) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setIsVisible(false);
    };

    useEffect(() => {
        if (show !== undefined) {
            setIsVisible(show);
            if (show) {
                requestAnimationFrame(calculatePosition);
            }
        }
    }, [show]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // 위치별 스타일 클래스
    const getPositionClasses = () => {
        const baseClasses = "absolute z-50 pointer-events-none";

        switch (actualPosition) {
            case 'top':
                return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
            case 'bottom':
                return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
            case 'left':
                return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
            case 'right':
                return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
            default:
                return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
        }
    };

    // 화살표 위치 클래스
    const getArrowClasses = () => {
        const baseArrow = "absolute w-2 h-2 bg-white/[0.03] border border-white/20 transform rotate-45";

        switch (actualPosition) {
            case 'top':
                return `${baseArrow} top-full left-1/2 -translate-x-1/2 -translate-y-1/2`;
            case 'bottom':
                return `${baseArrow} bottom-full left-1/2 -translate-x-1/2 translate-y-1/2`;
            case 'left':
                return `${baseArrow} left-full top-1/2 -translate-x-1/2 -translate-y-1/2`;
            case 'right':
                return `${baseArrow} right-full top-1/2 translate-x-1/2 -translate-y-1/2`;
            default:
                return `${baseArrow} top-full left-1/2 -translate-x-1/2 -translate-y-1/2`;
        }
    };

    const visible = show !== undefined ? show : isVisible;

    return (
        <div
            ref={triggerRef}
            className="inline-block relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}

            {visible && (
                <div
                    ref={tooltipRef}
                    className={`opacity-100 transition-all duration-200 ease-out transform scale-100 ${getPositionClasses()} ${className}`}
                >
                    {/* 툴팁 본체 */}
                    <div className="relative px-3 py-1 min-h-[24px] flex items-center justify-center rounded-full bg-gradient-to-br from-white/[0.03] to-gray-500/15 border border-transparent bg-clip-border backdrop-blur-sm">
                        {/* 그라데이션 테두리 효과 */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/45 via-white/[0.0001] to-white/15 p-[0.5px]">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-white/[0.03] to-gray-500/15" />
                        </div>

                        {/* 텍스트 */}
                        <span className="relative z-10 text-white text-xs font-semibold font-['Pretendard'] whitespace-nowrap leading-4">
                            {content}
                        </span>
                    </div>

                    {/* 화살표 */}
                    <div className={getArrowClasses()} />
                </div>
            )}
        </div>
    );
};

export default Tooltip; 