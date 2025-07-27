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
    position = 'right',
    delay = 300,
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
                return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-3`;
            default:
                return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
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
                    {/* 툴팁 본체 - Figma 디자인에 맞춤 */}
                    <div className="relative rounded-full backdrop-blur-sm overflow-hidden"
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            backgroundBlendMode: 'luminosity, color-dodge',
                            backdropFilter: 'blur(4px)',
                        }}>
                        {/* 그라디언트 테두리 */}
                        <div className="absolute inset-0 rounded-full"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.0001) 40.57%, rgba(255, 255, 255, 0.0001) 57.44%, rgba(255, 255, 255, 0.15) 98.66%)',
                                padding: '0.5px',
                                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'xor',
                                maskComposite: 'exclude',
                            }}>
                        </div>

                        {/* 텍스트 컨테이너 - 정확한 가운데 정렬 */}
                        <div className="relative px-3 py-1 flex items-center justify-center min-h-[24px]">
                            <span className="text-white text-xs font-semibold font-['Pretendard'] whitespace-nowrap leading-4">
                                {content}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tooltip; 