import React from 'react';

interface MenuDividerProps {
  isCollapsed?: boolean;
}

const MenuDivider: React.FC<MenuDividerProps> = React.memo(({ isCollapsed = false }) => {
  return (
    <div className={`h-px bg-gray-300 opacity-30 transition-all duration-300 ${isCollapsed ? 'w-11' : 'w-56'
      }`} />
  );
});

MenuDivider.displayName = 'MenuDivider';

export default MenuDivider;
