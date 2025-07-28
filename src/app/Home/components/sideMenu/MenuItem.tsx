import React, { useMemo } from 'react';
import { Tooltip } from '@/shared/components';

interface MenuItemProps {
  title: string;
  icon: string;
  iconBgColor?: string;
  isCollapsed?: boolean;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = React.memo(({
  title,
  icon,
  iconBgColor = 'transparent',
  isCollapsed = false,
  onClick,
}) => {
  const content = useMemo(() => (
    <div
      className={`relative h-[44px] mb-2 cursor-pointer menu-item-hover ${isCollapsed ? 'w-11' : 'w-[232px]'
        }`}
      onClick={onClick}
    >
      {/* 아이콘 영역 - 절대 위치 고정 (왼쪽에서 0px) */}
      <div className="flex absolute top-0 left-0 justify-center items-center w-11 h-11">
        {iconBgColor !== 'transparent' && (
          <div
            className="absolute w-[37px] h-[34px] rounded"
            style={{ backgroundColor: iconBgColor }}
          />
        )}
        <img src={icon} alt={title} className="relative z-10" />
      </div>

      {/* 텍스트 영역 - 아이콘 오른쪽에 고정, width/opacity만 변경 */}
      <div
        className={`absolute left-11 top-0 h-11 w-[180px] flex items-center ml-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'
          }`}
        style={{ overflow: 'hidden' }}
      >
        <span className="text-white text-[17px] font-normal leading-6 font-['Pretendard'] whitespace-nowrap text-left">
          {title}
        </span>
      </div>
    </div>
  ), [title, icon, iconBgColor, isCollapsed, onClick]);

  // 접힌 상태에서는 Tooltip으로 감싸기
  if (isCollapsed) {
    return (
      <Tooltip content={title} position="right">
        {content}
      </Tooltip>
    );
  }

  return content;
});

export default MenuItem;
