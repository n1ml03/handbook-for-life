/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
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
      animation: {
        "fade-in": "var(--animate-fade-in)",
        "slide-up": "var(--animate-slide-up)",
        "slide-down": "var(--animate-slide-down)",
        "shimmer": "var(--animate-shimmer)",
        "tooltip-fade-in": "var(--animate-tooltip-fade-in)",
        "search-results-slide": "var(--animate-search-results-slide)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 