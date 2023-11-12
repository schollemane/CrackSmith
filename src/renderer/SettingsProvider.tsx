// 1. Create a context for user preferences
import { Classes } from '@blueprintjs/core';
import React, { createContext, useContext, useState } from 'react';

type OpenAIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k' | 'gpt-4-1106-preview';

interface SettingsProps {
  openAiKey: string,
  openAiModel: OpenAIModel
  theme: string
}

const SettingsContext = createContext<{ settings: SettingsProps; updateSettings: (newPreferences: SettingsProps) => void }>(
  { settings: { openAiKey: '', openAiModel: 'gpt-4', theme: 'light' }, updateSettings: () => {} }
);

// 2. Create a Provider component to manage the state
function SettingsProvider({ children }) {
  const [settings, setSettings] = useState<SettingsProps>({ openAiKey: '', openAiModel: 'gpt-4', theme: 'light' });

  const updateSettings = (newPreferences: SettingsProps) => {
    setSettings(newPreferences);
  };

  return (
    <div className={`nav${settings.theme == 'dark' ? ' ' + Classes.DARK : ''}`}>
      <SettingsContext.Provider value={{ settings, updateSettings }}>
        {children}
      </SettingsContext.Provider>
    </div>
  );
}

// 3. Create a custom hook to access user preferences
function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a UserPreferencesProvider');
  }
  return context;
}

export { SettingsProvider, useSettings, OpenAIModel };