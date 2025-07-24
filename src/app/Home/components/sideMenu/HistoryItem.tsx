import React from 'react';

interface HistoryItemProps {
  title: string;
  icon: string;
  iconBgColor?: string;
  onClick?: () => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  title,
  icon,
  iconBgColor = 'transparent',
  onClick,
}) => {
  return (
    <div
      className="flex items-center w-[232px] h-10 cursor-pointer hover:opacity-80"
      onClick={onClick}
    >
      <div className="flex relative justify-center items-center w-11 h-10">
        {iconBgColor !== 'transparent' && (
          <div
            className="absolute w-[37px] h-[34px] rounded"
            style={{ backgroundColor: iconBgColor }}
          />
        )}
        <img src={icon} alt={title} className="relative z-10" />
      </div>
      <span className="ml-3 text-white text-sm font-normal leading-6 font-['Pretendard'] opacity-60">
        {title}
      </span>
    </div>
  );
};

export default HistoryItem;
