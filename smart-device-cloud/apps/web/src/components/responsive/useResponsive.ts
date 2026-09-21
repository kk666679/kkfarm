import { useMediaQuery } from '@/hooks/useMediaQuery';

/**
 * Centralized responsive hook providing boolean flags for all breakpoints
 * Reduces duplicate media query hooks throughout the app
 */
export function useResponsive() {
  // Breakpoints
  const isSmallMobile = useMediaQuery('(max-width: 319px)');
  const isMobile = useMediaQuery('(max-width: 479px)');
  const isTablet = useMediaQuery('(min-width: 480px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isLargeDesktop = useMediaQuery('(min-width: 1440px)');

  // Composed flags
  const isMobileOrTablet = isMobile || isTablet;
  const isDesktopOrLarger = isDesktop || isLargeDesktop;

  // Touch device detection
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');

  // Orientation
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const isPortrait = useMediaQuery('(orientation: portrait)');

  return {
    // Breakpoints
    isSmallMobile,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,

    // Composed flags
    isMobileOrTablet,
    isDesktopOrLarger,

    // Device capabilities
    isTouchDevice,

    // Orientation
    isLandscape,
    isPortrait,
  };
}
