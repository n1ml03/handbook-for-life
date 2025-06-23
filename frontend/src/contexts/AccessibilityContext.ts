import { createContext } from 'react';

export interface AccessibilityContextType {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  announceMessage: (message: string) => void;
}

export const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined); 