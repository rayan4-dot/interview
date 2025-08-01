"use client";

import React, { createContext, useContext, useState, useMemo } from 'react';

type AppMode = 'candidate' | 'manager';

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export const AppModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AppMode>('candidate');

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'candidate' ? 'manager' : 'candidate'));
  };

  const value = useMemo(() => ({ mode, setMode, toggleMode }), [mode]);

  return (
    <AppModeContext.Provider value={value}>
      {children}
    </AppModeContext.Provider>
  );
};

export const useAppMode = () => {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
};
