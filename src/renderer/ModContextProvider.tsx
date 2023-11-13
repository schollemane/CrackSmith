import React, { createContext, useContext, useEffect, useState } from 'react';
import { CardProps } from './Components/ModBuilder/Templates/CardTemplate';

interface ModContextProps {
  modName: string
  modId: string
  modVersion: string
  modDescription: string
  shortModDescription: string
  modIcon: string
  cards: CardProps[]
  libFolder: string
  exportFolder: string
}

const modContextKey = 'mod-context';

const ModContext = createContext<{ modContext: ModContextProps; updateModContext: (newPreferences: ModContextProps) => void }>(
  { modContext: { modName: 'ExampleMod', modIcon: 'https://placehold.co/256/png', modDescription: 'This is a card mod made with DeckSmith', shortModDescription: '', modId: 'com.example.rounds.mod', modVersion: '0.0.1', cards: [], libFolder: '', exportFolder: '' }, updateModContext: () => {} }
);

function ModContextProvider({ children }) {
  const [modContext, setModContext] = useState<ModContextProps>(() => {
    // Load context from local storage when the component is initialized
    const savedContext = localStorage.getItem(modContextKey);
    return savedContext ? JSON.parse(savedContext) : {
      modName: 'ExampleMod',
      modId: 'com.example.rounds.mod',
      modVersion: '0.0.1',
      cards: [],
      libFolder: '',
      exportFolder: '',
    };
  });

  const updateModContext = (newPreferences: ModContextProps) => {
    setModContext(newPreferences);
  };
  
  useEffect(() => {
    localStorage.setItem(modContextKey, JSON.stringify(modContext));
  }, [modContext]);

  return (
    <ModContext.Provider value={{ modContext, updateModContext }}>
      {children}
    </ModContext.Provider>
  );
}

function useModContext() {
  const context = useContext(ModContext);
  if (!context) {
    throw new Error('useModContext must be used within a ModContextProvider');
  }
  return context;
}

export { ModContextProvider, useModContext };