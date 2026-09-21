/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ========================================
      // RESPONSIVE BREAKPOINTS
      // ========================================
      screens: {
        xs: '320px', // Small mobile
        sm: '480px', // Mobile
        md: '768px', // Tablet
        lg: '1024px', // Desktop
        xl: '1280px', // Large desktop
        '2xl': '1440px', // Extra large desktop
        '3xl': '1536px', // Ultra wide
        // Touch device detection
        touch: { raw: '(hover: none) and (pointer: coarse)' },
        'no-touch': { raw: '(hover: hover) and (pointer: fine)' },
        // Orientation
        landscape: { raw: '(orientation: landscape)' },
        portrait: { raw: '(orientation: portrait)' },
      },

      // ========================================
      // FLUID TYPOGRAPHY TOKENS
      // ========================================
      fontSize: {
        'fluid-xs': 'clamp(0.7rem, 0.65rem + 0.15vw, 0.75rem)',
        'fluid-sm': 'clamp(0.8rem, 0.75rem + 0.15vw, 0.875rem)',
        'fluid-base': 'clamp(0.9rem, 0.85rem + 0.2vw, 1rem)',
        'fluid-lg': 'clamp(1rem, 0.9rem + 0.25vw, 1.125rem)',
        'fluid-xl': 'clamp(1.125rem, 1rem + 0.3vw, 1.25rem)',
        'fluid-2xl': 'clamp(1.25rem, 1.1rem + 0.4vw, 1.5rem)',
        'fluid-3xl': 'clamp(1.5rem, 1.25rem + 0.6vw, 1.875rem)',
        'fluid-4xl': 'clamp(1.875rem, 1.5rem + 0.9vw, 2.25rem)',
        'fluid-5xl': 'clamp(2.25rem, 1.75rem + 1.2vw, 3rem)',
        'fluid-6xl': 'clamp(2.5rem, 2rem + 1.5vw, 3.75rem)',
      },

      // ========================================
      // FLUID SPACING TOKENS
      // ========================================
      spacing: {
        'fluid-1': 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',
        'fluid-2': 'clamp(0.5rem, 0.4rem + 0.5vw, 1rem)',
        'fluid-3': 'clamp(0.75rem, 0.6rem + 0.75vw, 1.5rem)',
        'fluid-4': 'clamp(1rem, 0.8rem + 1vw, 2rem)',
        'fluid-5': 'clamp(1.25rem, 1rem + 1.25vw, 2.5rem)',
        'fluid-6': 'clamp(1.5rem, 1.2rem + 1.5vw, 3rem)',
        'fluid-8': 'clamp(2rem, 1.5rem + 2.5vw, 4rem)',
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
      },

      // ========================================
      // CONTAINER UTILITIES
      // ========================================
      maxWidth: {
        'container-xs': '320px',
        'container-sm': '480px',
        'container-md': '768px',
        'container-lg': '1024px',
        'container-xl': '1280px',
        'container-2xl': '1440px',
        'container-3xl': '1536px',
        'safe-content':
          'calc(100vw - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px))',
      },

      // ========================================
      // HEIGHT & WIDTH RESPONSIVE
      // ========================================
      height: {
        header: '4rem',
        'header-sm': '3.5rem',
        sidebar: 'calc(100vh - 4rem)',
        'sidebar-sm': 'calc(100vh - 3.5rem)',
        'screen-safe':
          'calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
        'screen-safe-without-header':
          'calc(100vh - 4rem - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
      },

      minHeight: {
        'touch-target': '44px',
        'touch-target-sm': '40px',
        'touch-target-lg': '48px',
      },

      minWidth: {
        'touch-target': '44px',
        'touch-target-sm': '40px',
        'touch-target-lg': '48px',
      },

      // ========================================
      // GAP & PADDING RESPONSIVE UTILITIES
      // ========================================
      gap: {
        'fluid-1': 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',
        'fluid-2': 'clamp(0.5rem, 0.4rem + 0.5vw, 1rem)',
        'fluid-3': 'clamp(0.75rem, 0.6rem + 0.75vw, 1.5rem)',
        'fluid-4': 'clamp(1rem, 0.8rem + 1vw, 2rem)',
        'fluid-5': 'clamp(1.25rem, 1rem + 1.25vw, 2.5rem)',
        'fluid-6': 'clamp(1.5rem, 1.2rem + 1.5vw, 3rem)',
        'fluid-8': 'clamp(2rem, 1.5rem + 2.5vw, 4rem)',
      },

      padding: {
        'fluid-1': 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',
        'fluid-2': 'clamp(0.5rem, 0.4rem + 0.5vw, 1rem)',
        'fluid-3': 'clamp(0.75rem, 0.6rem + 0.75vw, 1.5rem)',
        'fluid-4': 'clamp(1rem, 0.8rem + 1vw, 2rem)',
        'fluid-5': 'clamp(1.25rem, 1rem + 1.25vw, 2.5rem)',
        'fluid-6': 'clamp(1.5rem, 1.2rem + 1.5vw, 3rem)',
        'fluid-8': 'clamp(2rem, 1.5rem + 2.5vw, 4rem)',
        'safe-area':
          'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)',
      },

      // ========================================
      // ANIMATION & TRANSITIONS
      // ========================================
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 var(--tw-ring-color / 0.3)' },
          '50%': { boxShadow: '0 0 0 1rem var(--tw-ring-color / 0)' },
        },
      },

      // ========================================
      // CUSTOM UTILITIES
      // ========================================
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '350ms',
      },

      scrollBehavior: {
        smooth: 'smooth',
        auto: 'auto',
      },

      // ========================================
      // Z-INDEX HIERARCHY
      // ========================================
      zIndex: {
        dropdown: '40',
        sticky: '50',
        fixed: '50',
        'modal-backdrop': '40',
        modal: '50',
        popover: '60',
        tooltip: '70',
        notification: '80',
        max: '9999',
      },
    },
  },

  plugins: [
    // ========================================
    // RESPONSIVE UTILITIES PLUGIN
    // ========================================
    ({ addUtilities, theme, matchUtilities, e }) => {
      // Touch-friendly sizing
      addUtilities({
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
        },
        '.touch-target-sm': {
          minHeight: '40px',
          minWidth: '40px',
        },
        '.touch-target-lg': {
          minHeight: '48px',
          minWidth: '48px',
        },

        // Prevent horizontal overflow
        '.no-overflow-x': {
          overflowX: 'hidden',
        },
        '.text-wrap': {
          overflowWrap: 'anywhere',
          wordWrap: 'break-word',
          wordBreak: 'break-word',
        },

        // Safe area utilities
        '.safe-top': {
          paddingTop: 'env(safe-area-inset-top, 0px)',
        },
        '.safe-right': {
          paddingRight: 'env(safe-area-inset-right, 0px)',
        },
        '.safe-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        },
        '.safe-left': {
          paddingLeft: 'env(safe-area-inset-left, 0px)',
        },
        '.safe-area': {
          padding:
            'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)',
        },

        // Scrollbar utilities
        '.scrollbar-hide': {
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },

        // Reduce motion support
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
          },
        },
      });

      // Responsive padding utilities
      const paddingFluid = {
        '.px-fluid-1': {
          paddingLeft: 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',
          paddingRight: 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',
        },
        '.px-fluid-2': {
          paddingLeft: 'clamp(0.5rem, 0.4rem + 0.5vw, 1rem)',
          paddingRight: 'clamp(0.5rem, 0.4rem + 0.5vw, 1rem)',
        },
        '.px-fluid-3': {
          paddingLeft: 'clamp(0.75rem, 0.6rem + 0.75vw, 1.5rem)',
          paddingRight: 'clamp(0.75rem, 0.6rem + 0.75vw, 1.5rem)',
        },
        '.px-fluid-4': {
          paddingLeft: 'clamp(1rem, 0.8rem + 1vw, 2rem)',
          paddingRight: 'clamp(1rem, 0.8rem + 1vw, 2rem)',
        },
        '.py-fluid-1': {
          paddingTop: 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',
          paddingBottom: 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',
        },
        '.py-fluid-2': {
          paddingTop: 'clamp(0.5rem, 0.4rem + 0.5vw, 1rem)',
          paddingBottom: 'clamp(0.5rem, 0.4rem + 0.5vw, 1rem)',
        },
        '.py-fluid-3': {
          paddingTop: 'clamp(0.75rem, 0.6rem + 0.75vw, 1.5rem)',
          paddingBottom: 'clamp(0.75rem, 0.6rem + 0.75vw, 1.5rem)',
        },
        '.py-fluid-4': {
          paddingTop: 'clamp(1rem, 0.8rem + 1vw, 2rem)',
          paddingBottom: 'clamp(1rem, 0.8rem + 1vw, 2rem)',
        },
        '.p-fluid-1': { padding: 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)' },
        '.p-fluid-2': { padding: 'clamp(0.5rem, 0.4rem + 0.5vw, 1rem)' },
        '.p-fluid-3': { padding: 'clamp(0.75rem, 0.6rem + 0.75vw, 1.5rem)' },
        '.p-fluid-4': { padding: 'clamp(1rem, 0.8rem + 1vw, 2rem)' },
      };
      addUtilities(paddingFluid);

      // Responsive text sizing
      const textFluid = {
        '.text-fluid-xs': { fontSize: 'clamp(0.7rem, 0.65rem + 0.15vw, 0.75rem)' },
        '.text-fluid-sm': { fontSize: 'clamp(0.8rem, 0.75rem + 0.15vw, 0.875rem)' },
        '.text-fluid-base': { fontSize: 'clamp(0.9rem, 0.85rem + 0.2vw, 1rem)' },
        '.text-fluid-lg': { fontSize: 'clamp(1rem, 0.9rem + 0.25vw, 1.125rem)' },
        '.text-fluid-xl': { fontSize: 'clamp(1.125rem, 1rem + 0.3vw, 1.25rem)' },
        '.text-fluid-2xl': { fontSize: 'clamp(1.25rem, 1.1rem + 0.4vw, 1.5rem)' },
        '.text-fluid-3xl': { fontSize: 'clamp(1.5rem, 1.25rem + 0.6vw, 1.875rem)' },
        '.text-fluid-4xl': { fontSize: 'clamp(1.875rem, 1.5rem + 0.9vw, 2.25rem)' },
        '.text-fluid-5xl': { fontSize: 'clamp(2.25rem, 1.75rem + 1.2vw, 3rem)' },
        '.text-fluid-6xl': { fontSize: 'clamp(2.5rem, 2rem + 1.5vw, 3.75rem)' },
      };
      addUtilities(textFluid);

      // Container responsive utilities
      const containerUtilities = {
        '.container-responsive': {
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: 'clamp(1rem, 0.8rem + 1vw, 2rem)',
          paddingRight: 'clamp(1rem, 0.8rem + 1vw, 2rem)',
        },
        '.container-sm': { maxWidth: '480px' },
        '.container-md': { maxWidth: '768px' },
        '.container-lg': { maxWidth: '1024px' },
        '.container-xl': { maxWidth: '1280px' },
        '.container-2xl': { maxWidth: '1440px' },
        '.container-3xl': { maxWidth: '1536px' },
        '.container-full': { maxWidth: '100%' },
      };
      addUtilities(containerUtilities);

      // Responsive grid utilities
      addUtilities({
        '.grid-responsive': {
          display: 'grid',
          gap: 'clamp(0.75rem, 0.6rem + 0.75vw, 1.5rem)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        },
        '.grid-responsive-cols-1': {
          display: 'grid',
          gap: 'clamp(0.75rem, 0.6rem + 0.75vw, 1.5rem)',
          gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
        },
        '.grid-responsive-cols-2': {
          display: 'grid',
          gap: 'clamp(0.75rem, 0.6rem + 0.75vw, 1.5rem)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        },
      });

      // Flex responsive utilities
      addUtilities({
        '.flex-responsive': {
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(0.5rem, 0.4rem + 0.5vw, 1rem)',
        },
      });

      // Table responsive wrapper
      addUtilities({
        '.table-responsive': {
          width: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          '& table': {
            minWidth: '600px',
          },
        },
      });

      // Modal responsive
      addUtilities({
        '.modal-responsive': {
          width: 'calc(100% - clamp(1rem, 0.8rem + 1vw, 2rem))',
          maxWidth: '32rem',
          maxHeight: 'calc(100vh - clamp(1rem, 0.8rem + 1vw, 2rem))',
        },
      });

      // Visibility utilities for responsive
      addUtilities({
        '.hidden-xs': { '@screen xs': { display: 'none' } },
        '.hidden-sm': { '@screen sm': { display: 'none' } },
        '.hidden-md': { '@screen md': { display: 'none' } },
        '.hidden-lg': { '@screen lg': { display: 'none' } },
        '.hidden-xl': { '@screen xl': { display: 'none' } },
        '.visible-xs': { '@screen xs': { display: 'inherit' } },
        '.visible-sm': { '@screen sm': { display: 'inherit' } },
        '.visible-md': { '@screen md': { display: 'inherit' } },
        '.visible-lg': { '@screen lg': { display: 'inherit' } },
        '.visible-xl': { '@screen xl': { display: 'inherit' } },
      });
    },
  ],
};
