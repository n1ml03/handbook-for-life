/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    // Enhanced breakpoint system for better responsive design
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1400px',
      // Device-specific breakpoints
      'mobile': {'max': '767px'},
      'tablet': {'min': '768px', 'max': '1023px'},
      'desktop': {'min': '1024px'},
      // Orientation breakpoints
      'portrait': {'raw': '(orientation: portrait)'},
      'landscape': {'raw': '(orientation: landscape)'},
    },
    extend: {
      colors: {
        border: "hsl(var(--color-border))",
        input: "hsl(var(--color-input))",
        ring: "hsl(var(--color-ring))",
        background: "hsl(var(--color-background))",
        foreground: "hsl(var(--color-foreground))",
        primary: {
          DEFAULT: "hsl(var(--color-primary))",
          foreground: "hsl(var(--color-primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--color-secondary))",
          foreground: "hsl(var(--color-secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--color-destructive))",
          foreground: "hsl(var(--color-destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--color-muted))",
          foreground: "hsl(var(--color-muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--color-accent))",
          foreground: "hsl(var(--color-accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--color-popover))",
          foreground: "hsl(var(--color-popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--color-card))",
          foreground: "hsl(var(--color-card-foreground))",
        },
        // Custom DOAXVV colors
        'accent-ocean': "hsl(var(--color-accent-ocean))",
        'accent-pink': "hsl(var(--color-accent-pink))",
        'accent-purple': "hsl(var(--color-accent-purple))",
        'accent-gold': "hsl(var(--color-accent-gold))",
        'accent-cyan': "hsl(var(--color-accent-cyan))",
        'accent-coral': "hsl(var(--color-accent-coral))",
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      // Enhanced responsive spacing system
      spacing: {
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Enhanced responsive font sizes
      fontSize: {
        'xs': ['var(--text-xs)', { lineHeight: '1.4' }],
        'sm': ['var(--text-sm)', { lineHeight: '1.5' }],
        'base': ['var(--text-base)', { lineHeight: '1.6' }],
        'lg': ['var(--text-lg)', { lineHeight: '1.6' }],
        'xl': ['var(--text-xl)', { lineHeight: '1.6' }],
        '2xl': ['var(--text-2xl)', { lineHeight: '1.5' }],
        '3xl': ['var(--text-3xl)', { lineHeight: '1.4' }],
        // Responsive typography
        'responsive-xs': ['clamp(0.7rem, 0.5vw + 0.6rem, 0.75rem)', { lineHeight: '1.4' }],
        'responsive-sm': ['clamp(0.8rem, 0.6vw + 0.7rem, 0.875rem)', { lineHeight: '1.5' }],
        'responsive-base': ['clamp(0.9rem, 0.8vw + 0.8rem, 1rem)', { lineHeight: '1.6' }],
        'responsive-lg': ['clamp(1rem, 1vw + 0.9rem, 1.125rem)', { lineHeight: '1.6' }],
        'responsive-xl': ['clamp(1.1rem, 1.2vw + 1rem, 1.25rem)', { lineHeight: '1.6' }],
        'responsive-2xl': ['clamp(1.25rem, 1.5vw + 1.1rem, 1.5rem)', { lineHeight: '1.5' }],
        'responsive-3xl': ['clamp(1.5rem, 2vw + 1.3rem, 1.875rem)', { lineHeight: '1.4' }],
      },
      // Enhanced responsive grid systems
      gridTemplateColumns: {
        'responsive-auto': 'repeat(auto-fit, minmax(280px, 1fr))',
        'responsive-cards': 'repeat(auto-fit, minmax(320px, 1fr))',
        'responsive-small': 'repeat(auto-fill, minmax(240px, 1fr))',
        'responsive-large': 'repeat(auto-fit, minmax(400px, 1fr))',
      },
      // Enhanced container sizes
      maxWidth: {
        'responsive-sm': 'min(100%, 640px)',
        'responsive-md': 'min(100%, 768px)',
        'responsive-lg': 'min(100%, 1024px)',
        'responsive-xl': 'min(100%, 1280px)',
        'responsive-2xl': 'min(100%, 1400px)',
      },
      animation: {
        "fade-in": "var(--animate-fade-in)",
        "slide-up": "var(--animate-slide-up)",
        "slide-down": "var(--animate-slide-down)",
        "shimmer": "var(--animate-shimmer)",
        "tooltip-fade-in": "var(--animate-tooltip-fade-in)",
        "search-results-slide": "var(--animate-search-results-slide)",
      },
      // Touch-friendly interaction sizes
      minHeight: {
        'touch': 'var(--min-touch-target)',
        'icon': 'var(--min-icon-size)',
      },
      minWidth: {
        'touch': 'var(--min-touch-target)',
        'icon': 'var(--min-icon-size)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Custom responsive utilities plugin
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Responsive container utilities
        '.container-responsive': {
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          '@media (min-width: 640px)': {
            maxWidth: '640px',
          },
          '@media (min-width: 768px)': {
            maxWidth: '768px',
            paddingLeft: theme('spacing.6'),
            paddingRight: theme('spacing.6'),
          },
          '@media (min-width: 1024px)': {
            maxWidth: '1024px',
            paddingLeft: theme('spacing.8'),
            paddingRight: theme('spacing.8'),
          },
          '@media (min-width: 1280px)': {
            maxWidth: '1280px',
          },
        },
        // Mobile-first responsive grid
        '.grid-responsive-auto': {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: theme('spacing.4'),
          '@media (min-width: 768px)': {
            gap: theme('spacing.6'),
          },
          '@media (min-width: 1024px)': {
            gap: theme('spacing.8'),
          },
        },
        // Touch-friendly utilities
        '.touch-target': {
          minHeight: theme('minHeight.touch'),
          minWidth: theme('minWidth.touch'),
        },
        // Safe area utilities for mobile devices
        '.safe-area-inset': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
} 