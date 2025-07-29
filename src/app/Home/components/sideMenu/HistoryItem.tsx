import React, { useCallback } from 'react';
import { ICON_PATH } from '@/shared/constants';

interface HistoryItemProps {
  title: string;
  icon: string;
  isSaved?: boolean;
  onClick?: () => void;
  onSaveToggle?: () => void;
}

const HistoryItem: React.FC<HistoryItemProps> = React.memo(({
  title,
  icon,
  isSaved = false,
  onClick,
  onSaveToggle,
}) => {
  const handleSaveClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // 부모의 onClick 이벤트 방지
    onSaveToggle?.();
  }, [onSaveToggle]);

  return (
    <div
      className="group flex items-center w-[232px] h-8 px-1.5 cursor-pointer menu-item-hover mb-2 last:mb-0"
      onClick={onClick}
    >
      <div className="flex justify-center items-center w-8 h-8">
        <img src={icon} alt={title} className="w-8 h-8" />
      </div>
      <span className="ml-1.5 text-white text-sm font-normal leading-6 font-['Pretendard'] opacity-60 flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-left">
        {title}
      </span>
      <div
        className={`flex justify-center items-center w-4 h-4 cursor-pointer transition-opacity duration-200 ${
          isSaved 
            ? 'opacity-100' 
            : 'opacity-0 group-hover:opacity-100'
        }`}
        onClick={handleSaveClick}
      >
        <img
          src={isSaved ? ICON_PATH.SAVE_BUTTON.SELECTED : ICON_PATH.SAVE_BUTTON.NORMAL}
          alt={isSaved ? '고정됨' : '고정하기'}
          className="w-4 h-4"
        />
      </div>
    </div>
  );
});

HistoryItem.displayName = 'HistoryItem';

export default HistoryItem;
