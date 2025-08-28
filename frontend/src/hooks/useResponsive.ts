import { useState, useEffect } from "react";

// Breakpoint definitions
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1024,
} as const;

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
}

/**
 * Hook for responsive design utilities
 * Provides screen size detection and responsive state management
 */
export const useResponsive = (): ResponsiveState => {
  const [screenSize, setScreenSize] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: 0,
    height: 0,
    orientation: 'portrait',
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
        isDesktop: width >= BREAKPOINTS.desktop,
        width,
        height,
        orientation: width > height ? 'landscape' : 'portrait',
      });
    };

    // Update immediately
    updateScreenSize();

    // Listen for resize events
    window.addEventListener('resize', updateScreenSize);
    window.addEventListener('orientationchange', updateScreenSize);

    return () => {
      window.removeEventListener('resize', updateScreenSize);
      window.removeEventListener('orientationchange', updateScreenSize);
    };
  }, []);

  return screenSize;
};

/**
 * Utility functions for responsive design
 */
export const responsiveUtils = {
  // Get responsive value based on screen size
  getResponsiveValue: <T>(
    mobile: T,
    tablet: T,
    desktop: T,
    currentWidth: number = window.innerWidth
  ): T => {
    if (currentWidth < BREAKPOINTS.mobile) return mobile;
    if (currentWidth < BREAKPOINTS.tablet) return tablet;
    return desktop;
  },

  // Check if current screen is within breakpoint range
  isWithinBreakpoint: (min: number, max?: number, currentWidth: number = window.innerWidth): boolean => {
    if (max === undefined) return currentWidth >= min;
    return currentWidth >= min && currentWidth < max;
  },

  // Get CSS classes for responsive behavior
  getResponsiveClasses: (baseClass: string, responsiveVariants: Record<string, string>): string => {
    const classes = [baseClass];
    const width = window.innerWidth;

    if (width < BREAKPOINTS.mobile && responsiveVariants.mobile) {
      classes.push(responsiveVariants.mobile);
    } else if (width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet && responsiveVariants.tablet) {
      classes.push(responsiveVariants.tablet);
    } else if (width >= BREAKPOINTS.desktop && responsiveVariants.desktop) {
      classes.push(responsiveVariants.desktop);
    }

    return classes.join(' ');
  },
};
