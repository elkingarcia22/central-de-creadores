import React, { createContext, useContext, useState, ReactNode } from 'react';

interface InlineEditContextType {
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  startEditing: (id: string) => void;
  stopEditing: () => void;
  isEditing: (id: string) => boolean;
}

const InlineEditContext = createContext<InlineEditContextType | undefined>(undefined);

export const useInlineEdit = () => {
  const context = useContext(InlineEditContext);
  if (context === undefined) {
    throw new Error('useInlineEdit must be used within an InlineEditProvider');
  }
  return context;
};

interface InlineEditProviderProps {
  children: ReactNode;
}

export const InlineEditProvider: React.FC<InlineEditProviderProps> = ({ children }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const startEditing = (id: string) => {
    setEditingId(id);
  };

  const stopEditing = () => {
    setEditingId(null);
  };

  const isEditing = (id: string) => {
    return editingId === id;
  };

  const value: InlineEditContextType = {
    editingId,
    setEditingId,
    startEditing,
    stopEditing,
    isEditing,
  };

  return (
    <InlineEditContext.Provider value={value}>
      {children}
    </InlineEditContext.Provider>
  );
};
