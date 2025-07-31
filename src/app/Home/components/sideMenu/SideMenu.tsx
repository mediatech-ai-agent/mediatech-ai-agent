import React, { useCallback } from 'react';
import MenuHeader from './MenuHeader';
import MenuItem from './MenuItem';
import MenuDivider from './MenuDivider';
import SectionHeader from './SectionHeader';
import HistoryItem from './HistoryItem';

export interface SideMenuProps {
  title: string;
  headerIcon: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
  menuHeaderItems: Array<{
    id: string;
    title: string;
    icon: string;
    iconBgColor?: string;
  }>;
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
    isSaved?: boolean;
  }>;
  onMenuItemClick?: (id: string) => void;
  onHistoryItemClick?: (id: string) => void;
  onHistorySaveToggle?: (id: string) => void;
}

const SideMenu: React.FC<SideMenuProps> = React.memo(
  ({
    title,
    headerIcon,
    isCollapsed = false,
    onToggle,
    menuHeaderItems,
    menuItems,
    historyItems,
    onMenuItemClick,
    onHistoryItemClick,
    onHistorySaveToggle,
  }) => {
    const handleMenuItemClick = useCallback(
      (id: string) => {
        onMenuItemClick?.(id);
      },
      [onMenuItemClick]
    );

    const handleHistoryItemClick = useCallback(
      (id: string) => {
        onHistoryItemClick?.(id);
      },
      [onHistoryItemClick]
    );

    const handleHistorySaveToggle = useCallback(
      (id: string) => {
        onHistorySaveToggle?.(id);
      },
      [onHistorySaveToggle]
    );

    return (
      <div
        className={`relative transition-all duration-300 origin-left ${
          isCollapsed ? 'menu-glass-mini w-[92px]' : 'menu-glass-full'
        }`}
        style={{
          height: '100%',
          width: isCollapsed ? '92px' : undefined, // CSS 미디어 쿼리에 위임
        }}
      >
        {/* 배경 레이어 - Glass Effect */}
        <div
          className={`menu-glass-background ${isCollapsed ? 'menu-glass-mini' : 'menu-glass-full'}`}
        />

        {/* 컨텐츠 레이어 - 모든 요소 절대 위치로 고정 */}
        <div className="relative z-10 w-full h-full">
          {/* MenuHeader - 절대 위치 고정 */}
          <div className="absolute right-6 left-6 top-8">
            <MenuHeader
              title={title}
              icon={headerIcon}
              isCollapsed={isCollapsed}
              onToggle={onToggle}
            />
          </div>
          {/* 새로운 대화하기 - 절대 위치 고정 */}
          <div className="absolute top-[113px] left-6">
            {menuHeaderItems.map((item) => (
              <div key={item.id} className="relative">
                <MenuItem
                  title={item.title}
                  icon={item.icon}
                  iconBgColor={item.iconBgColor}
                  isCollapsed={isCollapsed}
                  onClick={() => handleMenuItemClick(item.id)}
                />
              </div>
            ))}
          </div>

          {/* 두 번째 Divider - 절대 위치 고정 */}
          <div
            className={`absolute top-[165px] ${isCollapsed ? 'left-[24px]' : 'left-6'}`}
          >
            <MenuDivider isCollapsed={isCollapsed} />
          </div>

          {/* 에이전트 아이콘들 - 절대 위치 고정 */}
          <div className="absolute top-[184px] left-6">
            {menuItems.map((item, index) => (
              <div
                key={item.id}
                className="absolute"
                style={{ top: `${index * 52}px` }}
              >
                <div className="relative">
                  <MenuItem
                    title={item.title}
                    icon={item.icon}
                    iconBgColor={item.iconBgColor}
                    isCollapsed={isCollapsed}
                    onClick={() => handleMenuItemClick(item.id)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 이전 대화 섹션 - 절대 위치 고정 */}
          {!isCollapsed && (
            <>
              <div className="absolute top-[402px] left-6">
                <MenuDivider isCollapsed={isCollapsed} />
              </div>
              <div className="absolute top-[431px] left-6">
                <SectionHeader title="이전 대화" />
              </div>
              <div className="absolute bottom-6 right-2 left-6 top-[483px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                <div className="pr-4">
                  {historyItems.map((item) => (
                    <HistoryItem
                      key={item.id}
                      title={item.title}
                      icon={item.icon}
                      isSaved={item.isSaved}
                      onClick={() => handleHistoryItemClick(item.id)}
                      onSaveToggle={() => handleHistorySaveToggle(item.id)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);

SideMenu.displayName = 'SideMenu';

export default SideMenu;
