import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface AccessibilityStore {
  // State
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  
  // Actions
  setReducedMotion: (reducedMotion: boolean) => void;
  setHighContrast: (highContrast: boolean) => void;
  setFontSize: (fontSize: 'normal' | 'large' | 'extra-large') => void;
  announceMessage: (message: string) => void;
  initializeFromSystem: () => void;
}

export const useAccessibilityStore = create<AccessibilityStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        reducedMotion: false,
        highContrast: false,
        fontSize: 'normal',

        // Actions
        setReducedMotion: (reducedMotion: boolean) => {
          set({ reducedMotion }, false, 'accessibility/setReducedMotion');
          applyAccessibilitySettings(get());
        },

        setHighContrast: (highContrast: boolean) => {
          set({ highContrast }, false, 'accessibility/setHighContrast');
          applyAccessibilitySettings(get());
        },

        setFontSize: (fontSize: 'normal' | 'large' | 'extra-large') => {
          set({ fontSize }, false, 'accessibility/setFontSize');
          applyAccessibilitySettings(get());
        },

        announceMessage: (message: string) => {
          const announcer = document.createElement('div');
          announcer.setAttribute('aria-live', 'polite');
          announcer.setAttribute('aria-atomic', 'true');
          announcer.className = 'sr-only';
          announcer.textContent = message;
          document.body.appendChild(announcer);
          
          setTimeout(() => {
            if (document.body.contains(announcer)) {
              document.body.removeChild(announcer);
            }
          }, 1000);
        },

        initializeFromSystem: () => {
          // Check for reduced motion preference
          const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
          const contrastQuery = window.matchMedia('(prefers-contrast: high)');
          
          set({
            reducedMotion: motionQuery.matches,
            highContrast: contrastQuery.matches,
          }, false, 'accessibility/initializeFromSystem');

          // Set up listeners for system preference changes
          const handleMotionChange = (e: MediaQueryListEvent) => {
            get().setReducedMotion(e.matches);
          };
          
          const handleContrastChange = (e: MediaQueryListEvent) => {
            get().setHighContrast(e.matches);
          };

          motionQuery.addEventListener('change', handleMotionChange);
          contrastQuery.addEventListener('change', handleContrastChange);

          // Apply initial settings
          applyAccessibilitySettings(get());

          // Cleanup function (stored for potential future use)
          return () => {
            motionQuery.removeEventListener('change', handleMotionChange);
            contrastQuery.removeEventListener('change', handleContrastChange);
          };
        },
      }),
      {
        name: 'accessibility-store',
        partialize: (state) => ({
          fontSize: state.fontSize,
          // Don't persist system preferences, they should be detected fresh
        }),
      }
    ),
    {
      name: 'accessibility-store',
    }
  )
);

// Helper function to apply accessibility settings to the DOM
function applyAccessibilitySettings(state: AccessibilityStore) {
  const root = document.documentElement;
  
  // Apply reduced motion
  if (state.reducedMotion) {
    root.classList.add('reduce-motion');
  } else {
    root.classList.remove('reduce-motion');
  }

  // Apply high contrast
  if (state.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }

  // Apply font size
  root.classList.remove('font-large', 'font-extra-large');
  if (state.fontSize === 'large') {
    root.classList.add('font-large');
  } else if (state.fontSize === 'extra-large') {
    root.classList.add('font-extra-large');
  }
}

// Initialize the store with system preferences
if (typeof window !== 'undefined') {
  useAccessibilityStore.getState().initializeFromSystem();
}
