import React from 'react';

interface MenuHeaderProps {
  title: string;
  icon: string;
}

const MenuHeader: React.FC<MenuHeaderProps> = ({ title, icon }) => {
  return (
    <div className="flex items-center justify-between w-[232px] h-11">
      <h1 className="text-white text-[17px] font-normal leading-6 font-['Pretendard']">
        {title}
      </h1>
      <div className="w-11 h-11 flex items-center justify-center">
        <img src={icon} alt="menu" className="w-[44px] h-4" />
      </div>
    </div>
  );
};

export default MenuHeader;
