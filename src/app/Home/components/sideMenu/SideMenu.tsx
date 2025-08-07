import React, { useCallback } from 'react';
import { X } from 'lucide-react';
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
  // 모바일 관련 props
  isMobile?: boolean;
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
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
    isMobile = false,
    isMobileMenuOpen = false,
    onMobileMenuClose,
  }) => {
    const handleMenuItemClick = useCallback(
      (id: string) => {
        onMenuItemClick?.(id);
        // 모바일에서 메뉴 아이템 클릭 시 메뉴 닫기
        if (isMobile && onMobileMenuClose) {
          onMobileMenuClose();
        }
      },
      [onMenuItemClick, isMobile, onMobileMenuClose]
    );

    const handleHistoryItemClick = useCallback(
      (id: string) => {
        onHistoryItemClick?.(id);
        // 모바일에서 히스토리 아이템 클릭 시 메뉴 닫기
        if (isMobile && onMobileMenuClose) {
          onMobileMenuClose();
        }
      },
      [onHistoryItemClick, isMobile, onMobileMenuClose]
    );

    const handleHistorySaveToggle = useCallback(
      (id: string) => {
        onHistorySaveToggle?.(id);
        // 저장 토글은 메뉴를 닫지 않음
      },
      [onHistorySaveToggle]
    );

    // 모바일일 때와 데스크탑일 때 다른 렌더링
    if (isMobile) {
      return (
        <>
          {/* 모바일 Overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 transition-opacity duration-300 bg-black/50"
              style={{ zIndex: 9997 }} // 높은 z-index
              onClick={onMobileMenuClose}
            />
          )}

          {/* 모바일 SideMenu */}
          <div
            className={`fixed top-0 left-0 h-full transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            style={{
              zIndex: 9998, // 햄버거 버튼(9999)보다 약간 낮게
              width: '320px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {/* 모바일 헤더 (X 버튼) */}
            <div className="flex justify-between items-center p-6 border-b border-white/20">
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <button
                onClick={onMobileMenuClose}
                className="p-2 rounded-lg transition-colors text-white/80 hover:text-white hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* 모바일 메뉴 컨텐츠 - 고정 영역과 스크롤 영역 분리 */}
            <div className="flex flex-col" style={{ height: 'calc(100% - 73px)' }}>
              {/* 고정 영역 - 스크롤 없음 */}
              <div className="flex-shrink-0 p-6 pb-0">
                {/* 새로운 대화하기 */}
                <div className="mb-6">
                  {menuHeaderItems.map((item) => (
                    <div key={item.id} className="mb-2">
                      <MenuItem
                        title={item.title}
                        icon={item.icon}
                        iconBgColor={item.iconBgColor}
                        isCollapsed={false}
                        onClick={() => handleMenuItemClick(item.id)}
                      />
                    </div>
                  ))}
                </div>

                <MenuDivider isCollapsed={false} />

                {/* 에이전트 아이템들 */}
                <div className="my-6">
                  {menuItems.map((item) => (
                    <div key={item.id} className="mb-2">
                      <MenuItem
                        title={item.title}
                        icon={item.icon}
                        iconBgColor={item.iconBgColor}
                        isCollapsed={false}
                        onClick={() => handleMenuItemClick(item.id)}
                      />
                    </div>
                  ))}
                </div>

                <MenuDivider isCollapsed={false} />

                {/* 이전 대화 헤더 */}
                <div className="mt-6 mb-4">
                  <SectionHeader title="이전 대화" />
                </div>
              </div>

              {/* 스크롤 영역 - 이전 대화 아이템들만 */}
              <div className="overflow-y-auto overflow-x-hidden flex-1 px-6 pb-6 custom-scrollbar">
                <div className="space-y-2">
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
            </div>
          </div>
        </>
      );
    }

    // 데스크탑 버전 (기존 코드)
    return (
      <div
        className={`relative transition-all duration-300 origin-left ${isCollapsed ? 'menu-glass-mini w-[92px]' : 'menu-glass-full'
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
