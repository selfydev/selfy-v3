'use client';

import { createContext, useContext, ReactNode } from 'react';
import * as tokens from '@/design/tokens';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  tokens: typeof tokens;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // For now, we're using light theme only
  // Future sprints can add theme switching functionality
  const theme: Theme = 'light';

  return <ThemeContext.Provider value={{ theme, tokens }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
