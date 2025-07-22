import React from 'react';
import MenuHeader from './MenuHeader';
import MenuItem from './MenuItem';
import MenuDivider from './MenuDivider';
import SectionHeader from './SectionHeader';
import HistoryItem from './HistoryItem';

export interface SideMenuProps {
  title: string;
  headerIcon: string;
  menuItems: Array<{
    id: string;
    title: string;
    icon: string;
    iconBgColor?: string;
  }>;
  historyItems: Array<{
    id: string;
    title: string;
    icon: string;
    iconBgColor?: string;
  }>;
  onMenuItemClick?: (id: string) => void;
  onHistoryItemClick?: (id: string) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({
  title,
  headerIcon,
  menuHeaderItems,
  menuItems,
  historyItems,
  onMenuItemClick,
  onHistoryItemClick,
}) => {
  return (
    <div
      className="w-[280px] h-[810px] relative apple-liquid-glass"
    >
      <div className="p-6 pt-8">
        <MenuHeader title={title} icon={headerIcon} />

        <div className="mt-6">
          {menuHeaderItems.map((item, index) => (
            <MenuItem
              key={item.id}
              title={item.title}
              icon={item.icon}
              iconBgColor={item.iconBgColor}
              onClick={() => onMenuItemClick?.(item.id)}
            />
          ))}
        </div>

        <MenuDivider />

        <div className="mt-6">
          {menuItems.map((item, index) => (
            <MenuItem
              key={item.id}
              title={item.title}
              icon={item.icon}
              iconBgColor={item.iconBgColor}
              onClick={() => onMenuItemClick?.(item.id)}
            />
          ))}
        </div>

        <MenuDivider />

        <SectionHeader title="이전 대화" />

        <div className="mt-4">
          {historyItems.map((item, index) => (
            <HistoryItem
              key={item.id}
              title={item.title}
              icon={item.icon}
              iconBgColor={item.iconBgColor}
              onClick={() => onHistoryItemClick?.(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
