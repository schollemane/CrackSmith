import { Switch } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import { useSettings } from "../SettingsProvider";
import { useCallback } from "react";

const settingsStorageKey = 'preferences';

function ThemeToggle() {
  const {settings, updateSettings} = useSettings();

  const handleThemeChange = useCallback(() => {
    const newSettings = { ...settings, theme: (settings.theme == 'light' ? 'dark' : 'light') };
    updateSettings(newSettings);
    localStorage.setItem(settingsStorageKey, JSON.stringify(newSettings));
  }, [settings]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '-10px' }}>
      <Switch large={true} checked={settings.theme == 'dark'} innerLabel="Light" innerLabelChecked="Dark" onChange={handleThemeChange} />
    </div>
  );
}

export default ThemeToggle;