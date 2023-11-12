import { Switch } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import { useSettings } from "../SettingsProvider";
import { useCallback } from "react";
import './Header.css'

function ThemeToggle() {
  const {settings, updateSettings} = useSettings();

  const handleThemeChange = useCallback(() => {
    const newSettings = { ...settings, theme: (settings.theme == 'light' ? 'dark' : 'light') };
    updateSettings(newSettings);
  }, [settings]);

  return (
    <div className="no-drag" style={{marginLeft: '1em', display: 'flex', alignItems: 'center', marginBottom: '-10px' }}>
      <Switch className="no-drag" large={true} checked={settings.theme == 'dark'} innerLabel="Light" innerLabelChecked="Dark" onChange={handleThemeChange} />
    </div>
  );
}

export default ThemeToggle;