import React from 'react';

interface MenuItemProps {
  title: string;
  icon: string;
  iconBgColor?: string;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
  title,
  icon,
  iconBgColor = 'transparent',
  onClick,
}) => {
  return (
    <div
      className="flex items-center w-[232px] h-11 cursor-pointer hover:opacity-80"
      onClick={onClick}
    >
      <div className="w-11 h-11 flex items-center justify-center relative">
        {iconBgColor !== 'transparent' && (
          <div
            className="absolute w-[37px] h-[34px] rounded"
            style={{ backgroundColor: iconBgColor }}
          />
        )}
        <img src={icon} alt={title} className="relative z-10" />
      </div>
      <span className="ml-3 text-white text-[17px] font-normal leading-6 font-['Pretendard']">
        {title}
      </span>
    </div>
  );
};

export default MenuItem;
