import { useState, useCallback } from 'react';

interface UseSidebarToggleReturn {
  isCollapsed: boolean;
  toggle: () => void;
  collapse: () => void;
  expand: () => void;
}

export const useSidebarToggle = (
  initialCollapsed: boolean = false
): UseSidebarToggleReturn => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const collapse = useCallback(() => {
    setIsCollapsed(true);
  }, []);

  const expand = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  return {
    isCollapsed,
    toggle,
    collapse,
    expand,
  };
};
