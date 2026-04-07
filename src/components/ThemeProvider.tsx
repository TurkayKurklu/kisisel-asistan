"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark"; // Locked to dark as per ChatGPT design request

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always dark
  const theme: Theme = "dark";

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: "dark" as Theme, setTheme: () => {} };
  }
  return context;
};
