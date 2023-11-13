import { atomOneDarkReasonable as dark, atomOneLight as light } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { Card, Button, EditableText, H1, H2, FormGroup, HTMLSelect, TextArea, NumericInput, Intent, OverlayToaster, ButtonGroup, InputGroup, ProgressBar, Dialog, DialogBody, DialogFooter, Callout, MultistepDialog, ButtonProps, DialogStep, RadioGroup, Radio, DialogStepId, Classes } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import "@blueprintjs/core/lib/css/blueprint.css";
import { SyntheticEvent, useState } from "react";
import { useModContext } from "../ModContextProvider";
import { useSettings } from '../SettingsProvider';
import { getManifest, getReadme } from './ModBuilder/Templates/ThunderstorePackage';
import path from 'path';

interface PackageBuilderProps {
  isOpen: boolean,
  dllPath: string
  onClose: () => void
}

function PackageBuilder({ isOpen, dllPath, onClose }: PackageBuilderProps ) {
  const { settings, updateSettings } = useSettings();
  const { modContext, updateModContext } = useModContext();
  
  const [ currentStepId, setCurrentStepId ] = useState('info');
  const [ iconDimensionsValid, setIconDimensionsvalid ] = useState(false);
  const [ iconLoadSuccess, setIconLoadSuccess ] = useState(false);
  const [ iconDimensions, setIconDimensions ] = useState({ x: 0, y: 0});

  const fallbackIconUrl = 'https://craftypixels.com/placeholder-image/256/dddddd/fff&text=Failed+to+load+image';

  async function handleStepsCompleted() {
    const manifest = getManifest(modContext.modName, modContext.modVersion, modContext.shortModDescription);
    const readme = getReadme(modContext.modName, modContext.modDescription, modContext.cards);

    const destinationFolder = await window.modApi.selectFolder('Select Thunderstore package export destination')

    const zipPath = await window.modApi.exportPackage({
      destination: destinationFolder,
      iconUrl: modContext.modIcon,
      dllPath,
      manifest,
      readme
    });
    await window.modApi.showFile(zipPath);
    onClose();
  }

  function handleDescriptionChange(value: string) {
    const newModContext = { ...modContext };
    newModContext.modDescription = value;
    updateModContext(newModContext);
  }
  
  function handleShortDescriptionChange(value: string) {
    const newModContext = { ...modContext };
    newModContext.shortModDescription = value;
    updateModContext(newModContext);
  }
  
  function handleChangeModIcon(url: string) {
    const newModContext = { ...modContext };
    newModContext.modIcon = url;
    updateModContext(newModContext);
  }
  
  function onLoadIcon(event: SyntheticEvent<HTMLImageElement, Event>) {
    setIconLoadSuccess(true);
    const newIconDimensions = { ...iconDimensions };
    newIconDimensions.x = event.currentTarget.naturalWidth;
    newIconDimensions.y = event.currentTarget.naturalHeight;
    const validDimensions = newIconDimensions.y == 256 && newIconDimensions.x == 256;
    setIconDimensionsvalid(validDimensions);
    setIconDimensions(newIconDimensions);
  }

  function onLoadIconFailed() {
    setIconLoadSuccess(false);
  }

  function nextButtonEnabled() {
    if (currentStepId === 'info') {
      const hasShortDesc = modContext.shortModDescription != null && modContext.shortModDescription != '';
      const hasDesc = modContext.modDescription != null && modContext.modDescription != '';
      return hasShortDesc && hasDesc;
    } else if (currentStepId === 'icon') {
      const hasUrl = modContext.modIcon != null && modContext.modIcon != '';
      return hasUrl && iconLoadSuccess && iconDimensionsValid;
    }

    return false;
  }

  const finalButtonProps: Partial<ButtonProps> = {
    intent: Intent.PRIMARY,
    onClick: handleStepsCompleted,
    text: 'Build Package'
  }

  function handleStepChange(newDialogStepId: DialogStepId, prevDialogStepId: DialogStepId) {
    setCurrentStepId(newDialogStepId.toString());
    console.log(newDialogStepId.toString());
  }

  const labelStyle = { margin: 0, color: 'inherit' }

  function packageInfoPanel() {return (
    <DialogBody>
      <FormGroup label={(<h3 style={labelStyle}>Short Description</h3>)}>
        <p>This will be displayed under your mod's name in Thunderstore.</p>
        <InputGroup fill value={modContext.shortModDescription} onChange={(e) => handleShortDescriptionChange(e.target.value)} />
      </FormGroup>
      <FormGroup label={(<h3 style={labelStyle}>Description</h3>)}>
        <p>This will be added to the your main Thunderstore mod page (supports markdown).</p>
        <TextArea style={{minHeight: '10em'}} fill value={modContext.modDescription} onChange={(e) => handleDescriptionChange(e.target.value)} />
      </FormGroup>
    </DialogBody>
  )};


  function packageIconPanel() {return (
    <DialogBody>
      <FormGroup label={(<h3 style={labelStyle}>Icon URL</h3>)}>
        <p>This image will be used as the icon for your Thunderstore listing.</p>
        <p>Must be a PNG file of exactly <code>256 x 256</code> pixel dimensions.</p>
        <InputGroup fill value={modContext.modIcon} onChange={(e) => handleChangeModIcon(e.target.value)} />
      </FormGroup>
      <img hidden={iconLoadSuccess} height={256} src={fallbackIconUrl} />
      <img hidden={!iconLoadSuccess} height={256} src={modContext.modIcon} onLoad={onLoadIcon} onError={onLoadIconFailed} />
      {      
        iconLoadSuccess ? iconDimensionsValid ? null : 
        (<p style={{color: '#EB6847'}}>Icon must exactly <code>256 x 256 pixels</code> yours is <code>{iconDimensions.x} x {iconDimensions.y} pixels</code></p>) :
        (<p style={{color: '#EB6847'}}>Failed to load icon!</p>)
      }
    </DialogBody>
  )};

  function finalizePanel() {return(
    <DialogBody>
      <h3 style={labelStyle}>Finalize Package</h3>
      <SyntaxHighlighter language='json' style={ settings.theme == 'dark' ? dark : light}>
        { getManifest(modContext.modName, modContext.modVersion, modContext.shortModDescription) }
      </SyntaxHighlighter>
    </DialogBody>
  )};

  return (
    <MultistepDialog
      icon={IconNames.BUILD}
      navigationPosition='left'
      isOpen={isOpen}
      onClose={onClose}
      onOpened={() => setCurrentStepId('info')}
      onChange={handleStepChange}
      nextButtonProps={{ disabled: !nextButtonEnabled() }}
      finalButtonProps={finalButtonProps}
      autoFocus={true}
      enforceFocus={true}
      usePortal={true}
      resetOnClose={true}
      canOutsideClickClose={false}
      initialStepIndex={0}
      title='Create Thunderstore Package'
      className={`bp5-running-text nav${settings.theme == 'dark' ? ' ' + Classes.DARK : ''}`}
    >
      <DialogStep
          id="info"
          panel={packageInfoPanel()}
          title="Package Info"
      />
      <DialogStep
          id="icon"
          panel={packageIconPanel()}
          title="Select Icon"
      />
      <DialogStep
          id="finalize"
          panel={finalizePanel()}
          title="Finalize"
      />
    </MultistepDialog>
  );
}

export default PackageBuilder;