// contexts/UIContext.tsx
import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface UIContextType {
  isSearchSidebarOpen: boolean;
  setSearchSidebarOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSearchSidebarOpen, setSearchSidebarOpen] = useState(false);

  return (
    <UIContext.Provider value={{ isSearchSidebarOpen, setSearchSidebarOpen }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};