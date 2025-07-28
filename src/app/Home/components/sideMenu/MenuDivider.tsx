import React from 'react';

interface MenuDividerProps {
  isCollapsed?: boolean;
}

const MenuDivider: React.FC<MenuDividerProps> = ({ isCollapsed = false }) => {
  return (
    <div className={`h-px bg-gray-300 opacity-30 ${isCollapsed ? 'w-11' : 'w-56'
      }`} />
  );
};

export default MenuDivider;
