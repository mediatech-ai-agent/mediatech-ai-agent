import React, { useState, useEffect, useCallback } from 'react';
import { Tooltip } from '@/shared/components';

interface MenuHeaderProps {
  title: string;
  icon: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const MenuHeader: React.FC<MenuHeaderProps> = React.memo(({
  title,
  icon,
  isCollapsed = false,
  onToggle
}) => {
  const [showTitle, setShowTitle] = useState(!isCollapsed);

  useEffect(() => {
    if (!isCollapsed) {
      // 사이드바가 펼쳐질 때 300ms 지연 후 제목 표시
      const timer = setTimeout(() => {
        setShowTitle(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      // 사이드바가 접힐 때 즉시 제목 숨김
      setShowTitle(false);
    }
  }, [isCollapsed]);

  const handleToggle = useCallback(() => {
    onToggle?.();
  }, [onToggle]);

  return (
    <div className={`flex items-center h-11 transition-all duration-300 ${isCollapsed ? 'justify-center w-11' : 'justify-between w-[232px]'
      }`}>
      {/* 제목 - 접힌 상태에서는 숨김, 펼친 상태에서는 지연 표시 */}
      {!isCollapsed && (
        <h1 className={`font-normal leading-6 text-white text-[17px] font-['Pretendard'] transition-opacity duration-200 overflow-hidden whitespace-nowrap text-ellipsis ${showTitle ? 'opacity-100' : 'opacity-0'
          }`}>
          {title}
        </h1>
      )}

      {/* 클릭 가능한 아이콘 영역 */}
      <Tooltip content={isCollapsed ? "메뉴 열기" : "메뉴 닫기"} position="right">
        <button
          onClick={handleToggle}
          className="flex justify-center items-center w-11 h-11 rounded-lg transition-colors duration-200 cursor-pointer hover:bg-white/10"
          aria-label={isCollapsed ? "메뉴 열기" : "메뉴 닫기"}
        >
          <img
            src={icon}
            alt="menu toggle"
            className="transition-transform duration-200"
          />
        </button>
      </Tooltip>
    </div>
  );
});

MenuHeader.displayName = 'MenuHeader';

export default MenuHeader;
