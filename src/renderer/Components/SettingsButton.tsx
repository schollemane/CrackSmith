import { Alignment, Button, ButtonGroup, Card, Classes, Drawer, FormGroup, HTMLSelect, InputGroup, Navbar, Position, Switch } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import "@blueprintjs/core/lib/css/blueprint.css";
import { useCallback, useEffect, useState } from "react";
import { OpenAIModel, useSettings } from "../SettingsProvider";

const settingsStorageKey = 'preferences';

function SettingsButton() {
  const { settings, updateSettings } = useSettings();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const key = JSON.parse(localStorage.getItem(settingsStorageKey));
    if (key) {
      updateSettings({ ...settings, ...key});
      console.log(key);
    } else {
      if (settings.openAiKey == null || settings.openAiKey === '') {
        setActive(true);
      }
    }
  }, []);

  const handleOpenAiKeyChange = useCallback((value: string) => {
    const newSettings = { ...settings, openAiKey: value };
    updateSettings(newSettings);
    localStorage.setItem(settingsStorageKey, JSON.stringify(newSettings));
  }, [settings, updateSettings]);

  const handleOpenAiModelChange = useCallback((value: OpenAIModel) => {
    const newSettings = { ...settings, openAiModel: value};
    updateSettings(newSettings)
    localStorage.setItem(settingsStorageKey, JSON.stringify(newSettings));
  }, [settings, updateSettings]);

  return (
    <div>
      <Button icon={IconNames.SETTINGS} text="Settings" onClick={() => setActive(true)} />
      <Drawer
        className={settings.theme == 'dark' ? Classes.DARK : undefined}
        icon={IconNames.SETTINGS}
        size={'500px'}
        onClose={() => setActive(false)}
        title="Settings"
        isOpen={active}
        autoFocus
        canEscapeKeyClose
        canOutsideClickClose
        enforceFocus
        hasBackdrop
        usePortal
      >
        <Card>
          <FormGroup label="OpenAI API Key" labelFor="open-ai-key">
            <InputGroup type="password" id="open-ai-key" value={settings.openAiKey} onValueChange={handleOpenAiKeyChange} />
          </FormGroup>
          <FormGroup label="OpenAI Model" labelFor="open-ai-model">
            <HTMLSelect
            fill={true}
            options={['gpt-4', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k', 'gpt-4-1106-preview']}
            value={settings.openAiModel}
            id="open-ai-model"
            onChange={(e) => handleOpenAiModelChange(e.target.value as OpenAIModel)} />
          </FormGroup>
        </Card>
      </Drawer>
    </div>
  );
}

export default SettingsButton;