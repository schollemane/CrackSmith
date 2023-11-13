import { Card, Button, EditableText, H1, H2, FormGroup, HTMLSelect, TextArea, NumericInput, Intent, OverlayToaster, ButtonGroup, InputGroup, ProgressBar, Dialog, DialogBody, DialogFooter, Callout, Classes } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import "@blueprintjs/core/lib/css/blueprint.css";
import buildCard, { CardProps, StatChange, getCardColor, getRarityColor, getStatInfo } from "./Templates/CardTemplate";
import { useState } from "react";
import '../Flow.css'
import '../../Shared.css'
import { useModContext } from "../../ModContextProvider";
import { NavLink, useNavigate } from "react-router-dom";
import buildMod from "./Templates/ModTemplate";
import getCardRegistry from "./Templates/CardRegistry";
import buildCsproj from "./Templates/CsprojTemplate";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDarkReasonable as dark, atomOneLight as light } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useSettings } from '../../SettingsProvider';
import getRequiredAssmeblies, { RequiredAssembly } from "./RequiredAssemblies";
import PackageBuilder from "../PackageBuilder";

function CardList() {
  const navigate = useNavigate();
  const { modContext, updateModContext } = useModContext();
  const { settings, updateSettings } = useSettings();

  const [ exporting, setExporting ] = useState(false);
  const [ buildOutput, setBuildOutput ] = useState('');
  const [ showingLogs, setShowingLogs ] = useState(false);
  const [ showingPackagePrompt, setShowingPackagePrompt ] = useState(false);
  const [ missingAssemblies, setMissingAssemblies ] = useState([] as RequiredAssembly[]);
  const [ showingMissingAssemblies, setShowingMissingAssemblies ] = useState(false);
  const [ showPackageBuilder, setShowPackageBuilder ] = useState(false);
  const [ dllPath, setDllPath ] = useState('');
  
  async function selectLibFolder() {
    const newModContext = {...modContext};
    newModContext.libFolder = await window.modApi.selectFolder('Select Library Folder');
    
    if (newModContext.libFolder != '') {
      const libAssemblies = await window.modApi.getAssemblies(newModContext.libFolder);
      const requiredAssmeblies = getRequiredAssmeblies();
      const newMissingAssemblies = requiredAssmeblies.filter(r => !r.assemblies.every(a => libAssemblies.map(l => `${l.name}.dll`).includes(a)));
      setMissingAssemblies(newMissingAssemblies);
  
      if (newMissingAssemblies.length > 0) {
        newModContext.libFolder = '';
        handleShowMissingAssemblies();
      }
    }

    updateModContext(newModContext);
  }
  
  async function selectExportFolder() {
    const newModContext = {...modContext};
    newModContext.exportFolder = await window.modApi.selectFolder('Select Export Destination');
    updateModContext(newModContext);
  }

  function handleSetName(name: string) {
    if (/^[A-Za-z]*$/.test(name)) {
      const newModContext = {...modContext};
      newModContext.modName = name;
      updateModContext(newModContext);
    }
  }

  function handleSetId(id: string) {
    if (/^[a-z.]*$/.test(id)) {
      const newModContext = {...modContext};
      newModContext.modId = id;
      updateModContext(newModContext);
    }
  }

  function handleSetVersion(version: string) {
    if (/^[0-9.]*$/.test(version)) {
      const newModContext = {...modContext};
      newModContext.modVersion = version;
      updateModContext(newModContext);
    }
  }

  function canExport() {
    if (modContext.libFolder == null || modContext.libFolder == '') return false;
    if (modContext.exportFolder == null || modContext.exportFolder == '') return false;
    if (modContext.cards == null || modContext.cards.length == 0) return false;
    return true;
  }

  function handleShowLogs() {
    setShowingLogs(true);
  }

  function handleHideLogs() {
    setShowingLogs(false);
  }

  function handleShowMissingAssemblies() {
    setShowingMissingAssemblies(true);
  }

  function handleHideMissingAssemblies() {
    setShowingMissingAssemblies(false);
  }

  function handleCopyLogs() {
    navigator.clipboard.writeText(buildOutput);
    const toast = OverlayToaster.create({ position: 'bottom', usePortal: true });
    toast.show({
      message: 'Copied full logs.',
      intent: Intent.SUCCESS,
      icon: IconNames.CLIPBOARD,
      timeout: 3000
    });
  }

  async function exportMod() {
    setExporting(true);

    const files = await window.modApi.getAssemblies(modContext.libFolder);
    const csproj = buildCsproj(files);
    const cardScripts = modContext.cards.map(c => {
      return {
        name: c.cardName.replaceAll(' ', ''),
        content: buildCard(modContext.modName, c)
      }
    });
    const scripts = [
      {
        name: 'CardRegistry',
        content: getCardRegistry()
      },
      {
        name: modContext.modName.replaceAll(' ', ''),
        content: buildMod(modContext.modName, modContext.modId, modContext.modVersion, modContext.cards.map(c => c.cardName.replaceAll(' ', ''))),
      }, ...cardScripts
    ];
    const result = await window.modApi.exportMod({
      csproj,
      exportFolder: modContext.exportFolder,
      modName: modContext.modName.replaceAll(' ', ''),
      scripts
    });

    setBuildOutput(result.output);

    if (result.status == 'success') {
      setDllPath(result.binary);
      setShowingPackagePrompt(true);
    } else {
      const toast = OverlayToaster.create({ position: 'bottom', usePortal: true });
      toast.show({
        message: (<div className="no-drag">
            <p>Export failed!</p>
            <p>{result.message + ''}</p>
            <Button fill={true} className="no-drag" text="View Full Logs" onClick={(handleShowLogs)}/>
          </div>),
        intent: Intent.DANGER,
        icon: IconNames.CROSS_CIRCLE,
        timeout: 5000
      });
    }
    
    setExporting(false);
  }

  function addCard() {
    const newCards = [ ...modContext.cards ];
    newCards.push({
      cardName: '',
      cardDescription: '',
      cardArtUrl: 'https://placehold.co/512x512/png',
      cardColor: "TechWhite",
      cardRarity: "Common",
      cardStats: []
    });
    const newModContext = { ...modContext, cards: newCards };
    updateModContext(newModContext);
    navigate(`/card/${newCards.length - 1}`)
  }

  function deleteCard(index: number) {
    const newCards = modContext.cards.filter((_, i) => i !== index);
    const newModContext = { ...modContext, cards: newCards }
    updateModContext(newModContext);
  }

  function cardStatView(stat: StatChange, index: number) {
    const statInfo = getStatInfo(stat.stat);
    var amountString: string;
    if (statInfo.additive) {
      amountString = `${stat.value < 0 ? stat.value : `+${stat.value}`}${statInfo.unit}`
    } else {
      const amountPercent = Math.floor((stat.value - 1) * 100);
      amountString = `${amountPercent < 0 ? '' : '+'}${amountPercent}%`
    }

    return (
      <li key={`${index}`}>
        <p>{statInfo.displayName} {amountString}</p>
      </li>
    );
  }

  function missingAssemblyView(assemblyInfo: RequiredAssembly) {
    return (
      <Card className="bp5-running-text">
        You are missing one or more of the following required assemblies:
        <ul>
          { assemblyInfo.assemblies.map(a => (<li><code>{a}</code></li>)) }
        </ul>
        {assemblyInfo.missingMessage}
      </Card>
    )
  }

  function cardView(card: CardProps, index: number) {
    const style = { "--corner-color": getRarityColor(card.cardRarity), "--border-color": getCardColor(card.cardColor), borderWidth: '5px', margin: '0', padding: '1em', borderStyle: 'solid', borderColor: getCardColor(card.cardColor), display: 'flex', flexDirection: 'column'} as React.CSSProperties;
    return (
      <div style={{transform: 'translate(0, 0)'}}>
        <div style={{position: 'relative', overflow: 'hidden', margin: '1em', marginTop: '50px'}}>
          <div className="colored-corners max-width-s min-width-s" style={style}>
            <H2 style={{position: 'fixed', marginTop: '-60px'}}>{card.cardName}</H2>
            <img src={card.cardArtUrl} />
            <Callout title="Description" style={{ marginTop: '1em' }}>
              <p>{card.cardDescription}</p>
            </Callout>
            <Callout title="Stats" style={{margin: '1em 0'}}>
              <ul style={{marginTop: 0}}>
                { card.cardStats.map(cardStatView) }
              </ul>
            </Callout>
            <ButtonGroup fill style={{marginTop: 'auto'}}>
              <Button text='Edit' intent={Intent.PRIMARY} icon={IconNames.EDIT} onClick={() => navigate(`/card/${index}`)} />
              <Button text='Delete' intent={Intent.DANGER} icon={IconNames.DELETE} onClick={() => deleteCard(index)} />
            </ButtonGroup>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fill-view" style={{margin: '0', padding: '0', display: "grid", gridTemplateColumns: '2fr 30em', gridTemplateRows: '1fr'}}>
      <Card style={{display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', overflow: 'auto', marginBottom: '3em' }}>
        { modContext.cards.map(cardView) }
      </Card>
      <Card>
        <Card style={{marginBottom: '2em'}}>

          <H1>Mod Configuration</H1>

          <FormGroup label='Name' labelFor="mod-name">
            <InputGroup id='mod-name' placeholder="Example Mod" value={modContext.modName} onChange={(e) => handleSetName(e.target.value)} />
          </FormGroup>

          <FormGroup label='Unique Identifier' labelFor="mod-id">
            <InputGroup id='mod-id' placeholder="com.example.rounds.modname" value={modContext.modId} onChange={(e) => handleSetId(e.target.value)} />
          </FormGroup>

          <FormGroup label='Version' labelFor="mod-version">
            <InputGroup id='mod-version' placeholder="0.0.1" value={modContext.modVersion} onChange={(e) => handleSetVersion(e.target.value)} />
          </FormGroup>

          <FormGroup label='Library Folder' labelFor="mod-libs">
            <InputGroup readOnly={true} id='mod-libs' placeholder="..." value={modContext.libFolder} rightElement={
              <Button
                icon={IconNames.FOLDER_OPEN}
                intent={Intent.WARNING}
                minimal={true}
                onClick={selectLibFolder}
              />} />
          </FormGroup>

          <FormGroup label='Export Folder' labelFor="mod-export">
            <InputGroup readOnly={true} id='mod-export' placeholder="..." value={modContext.exportFolder} rightElement={
              <Button
                icon={IconNames.FOLDER_OPEN}
                intent={Intent.WARNING}
                minimal={true}
                onClick={selectExportFolder}
              />} />
          </FormGroup>
        </Card>

        <Button large fill text='New Card' icon={IconNames.ADD} intent={Intent.PRIMARY} onClick={addCard} />
        <br />
        <Button large fill disabled={!canExport() || exporting} text='Export Mod' icon={IconNames.EXPORT} intent={Intent.SUCCESS} onClick={exportMod} />

        { exporting ? <ProgressBar animate={true} intent={Intent.WARNING} stripes={true} /> : null }
      </Card>
      
      <Dialog
        className={`bp5-running-text nav${settings.theme == 'dark' ? ' ' + Classes.DARK : ''}`}
        title="Build Successful!"
        icon={IconNames.TICK}
        onClose={() => setShowingPackagePrompt(false)}
        isOpen={showingPackagePrompt}
        style={{width: 'unset', maxWidth: '90vw'}}
        isCloseButtonShown={true}
        canOutsideClickClose={false}
      >
        <DialogBody>
          <p>Would you like to package the mod for Thunderstore?</p>
        </DialogBody>
        <DialogFooter actions={
          <ButtonGroup>
            <Button intent={Intent.PRIMARY} icon={IconNames.BUILD} text="Create Package" onClick={() => { setShowingPackagePrompt(false); setShowPackageBuilder(true); }} />
            <Button intent={Intent.NONE} icon={IconNames.FOLDER_OPEN} text="Show DLL" onClick={() => window.modApi.showFile(dllPath) } />
            <Button intent={Intent.DANGER} icon={IconNames.CROSS_CIRCLE} text="Close" onClick={() => setShowingPackagePrompt(false)} />
          </ButtonGroup>
        } />
      </Dialog>

      <Dialog className={`nav${settings.theme == 'dark' ? ' ' + Classes.DARK : ''}`} title="Build Output Logs" icon={IconNames.WARNING_SIGN} onClose={handleHideLogs} isOpen={showingLogs} style={{width: 'unset', maxWidth: '90vw'}}>
        <DialogBody>
          <SyntaxHighlighter customStyle={{}} language="vim" style={ settings.theme == 'dark' ? dark : light }>{buildOutput}</SyntaxHighlighter>
        </DialogBody>
        <DialogFooter actions={
          <ButtonGroup>
            <Button intent={Intent.WARNING} icon={IconNames.CLIPBOARD} text="Copy" onClick={handleCopyLogs} />
            <Button intent={Intent.PRIMARY} icon={IconNames.CROSS_CIRCLE} text="Close" onClick={handleHideLogs} />
          </ButtonGroup>
        } />
      </Dialog>

      <Dialog className={`nav${settings.theme == 'dark' ? ' ' + Classes.DARK : ''}`} title="Required assemblies are missing from Library Folder!" icon={IconNames.WARNING_SIGN} onClose={handleHideMissingAssemblies} isOpen={showingMissingAssemblies} style={{width: 'unset', maxWidth: '90vw'}}>
        <DialogBody>
          { missingAssemblies.map(missingAssemblyView) }
        </DialogBody>
        <DialogFooter actions={<Button intent={Intent.PRIMARY} icon={IconNames.CROSS_CIRCLE} text="Close" onClick={handleHideMissingAssemblies} />} />
      </Dialog>
      <PackageBuilder isOpen={showPackageBuilder} dllPath={dllPath} onClose={() => setShowPackageBuilder(false)} />
    </div>
  );
}

export default CardList;