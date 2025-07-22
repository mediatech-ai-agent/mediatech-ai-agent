import React from 'react';
import { cn } from '../lib/utils';
import bgMenuImage from '../assets/bg_menu_full.png';

interface BgMenuFullProps {
    children?: React.ReactNode;
    className?: string;
    width?: number;
    height?: number;
}

/**
 * BgMenuFull Component
 * 
 * Figma에서 가져온 bg_menu_full 컴포넌트를 React로 구현
 * 원본 크기: 280 x 1000px
 * bg_menu_full.png 이미지를 배경으로 사용
 */
export const BgMenuFull: React.FC<BgMenuFullProps> = ({
    children,
    className = '',
    width = 280,
    height = 1000,
}) => {
    const isDefaultSize = width === 280 && height === 1000;

    return (
        <div
            className={cn(
                'rounded-3xl relative overflow-hidden shadow-menu',
                isDefaultSize ? 'w-[280px] h-[1000px]' : '',
                className
            )}
            style={{
                width: !isDefaultSize ? `${width}px` : undefined,
                height: !isDefaultSize ? `${height}px` : undefined,
                backgroundImage: `url(${bgMenuImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {children}
        </div>
    );
};

/**
 * 반응형 버전 - 화면 크기에 맞게 조정
 */
export const BgMenuFullResponsive: React.FC<BgMenuFullProps> = ({
    children,
    className = '',
}) => {
    return (
        <div
            className={cn(
                'w-full max-w-[280px] h-screen max-h-[1000px]',
                'rounded-3xl relative overflow-hidden shadow-menu',
                className
            )}
            style={{
                backgroundImage: `url(${bgMenuImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {children}
        </div>
    );
};

/**
 * 모바일 최적화 버전
 */
export const BgMenuFullMobile: React.FC<BgMenuFullProps> = ({
    children,
    className = '',
}) => {
    return (
        <div
            className={cn(
                'w-screen h-screen relative overflow-hidden',
                className
            )}
            style={{
                backgroundImage: `url(${bgMenuImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {children}
        </div>
    );
};

export default BgMenuFull; 