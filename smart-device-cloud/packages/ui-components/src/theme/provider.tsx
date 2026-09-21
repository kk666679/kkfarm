import React, { createContext, useContext } from 'react';
import { tokens } from './tokens';

const ThemeContext = createContext(tokens);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(ThemeContext.Provider, { value: tokens }, children);
}

export function useTheme() {
  return useContext(ThemeContext);
}
