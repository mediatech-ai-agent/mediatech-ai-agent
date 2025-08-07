import { useState, useEffect, useCallback } from 'react';

export const useMobileMenu = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 화면 감지
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 1030);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // 모바일 메뉴 열기
  const openMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
    // 스크롤 방지
    document.body.style.overflow = 'hidden';
  }, []);

  // 모바일 메뉴 닫기
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    // 스크롤 복원
    document.body.style.overflow = 'unset';
  }, []);

  // 메뉴 토글
  const toggleMobileMenu = useCallback(() => {
    if (isMobileMenuOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }, [isMobileMenuOpen, openMobileMenu, closeMobileMenu]);

  // 모바일이 아닐 때 메뉴 닫기
  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) {
      closeMobileMenu();
    }
  }, [isMobile, isMobileMenuOpen, closeMobileMenu]);

  return {
    isMobile,
    isMobileMenuOpen,
    openMobileMenu,
    closeMobileMenu,
    toggleMobileMenu,
  };
};
