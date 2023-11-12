import { Card, Button, EditableText, H1, H2, FormGroup, HTMLSelect, TextArea, NumericInput, Intent, OverlayToaster, ButtonGroup, InputGroup, ProgressBar } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import "@blueprintjs/core/lib/css/blueprint.css";
import buildCard, { CardProps, StatChange } from "./Templates/CardTemplate";
import { useState } from "react";
import '../Flow.css'
import '../../Shared.css'
import { useModContext } from "../../ModContextProvider";
import { NavLink, useNavigate } from "react-router-dom";
import buildMod from "./Templates/ModTemplate";
import getCardRegistry from "./Templates/CardRegistry";
import buildCsproj from "./Templates/CsprojTemplate";

function CardList() {
  const navigate = useNavigate();
  const { modContext, updateModContext } = useModContext();

  const [ exporting, setExporting ] = useState(false);
  
  async function selectLibFolder() {
    const newModContext = {...modContext};
    newModContext.libFolder = await window.modApi.selectFolder('Select Library Folder');
    updateModContext(newModContext);
  }
  
  async function selectExportFolder() {
    const newModContext = {...modContext};
    newModContext.exportFolder = await window.modApi.selectFolder('Select Export Destination');
    updateModContext(newModContext);
  }

  function handleSetName(name: string) {
    const newModContext = {...modContext};
    newModContext.modName = name;
    updateModContext(newModContext);
  }

  function handleSetId(id: string) {
    const newModContext = {...modContext};
    newModContext.modId = id;
    updateModContext(newModContext);
  }

  function handleSetVersion(version: string) {
    const newModContext = {...modContext};
    newModContext.modVersion = version;
    updateModContext(newModContext);
  }

  function canExport() {
    if (modContext.libFolder == null || modContext.libFolder == '') return false;
    if (modContext.exportFolder == null || modContext.exportFolder == '') return false;
    if (modContext.cards == null || modContext.cards.length == 0) return false;
    return true;
  }

  async function exportMod() {
    setExporting(true);

    const files = await window.modApi.getAssemblies(modContext.libFolder) as string[];
    const csproj = buildCsproj(files);
    const cardScripts = modContext.cards.map(c => {
      return {
        name: c.cardName.replaceAll(' ', ''),
        content: buildCard(modContext.modName, c.cardName.replaceAll(' ', ''), c.cardName, c.cardDescription, c.cardRarity, c.cardColor, c.cardStats)
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

    if (result.status == 'success') {
      await window.modApi.showFile(result.binary);
      const toast = OverlayToaster.create({ position: 'top', usePortal: true });
      toast.show({
        message: `Building '${modContext.modName.replaceAll(' ', '')}.dll' completed successfully.`,
        intent: Intent.SUCCESS,
        icon: IconNames.SAVED,
        timeout: 3000
      });
    } else {
      console.error(result.message);
      const toast = OverlayToaster.create({ position: 'top', usePortal: true });
      toast.show({
        message: `Export failed!\n${result.message}`,
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

  function cardStatView(stats: StatChange, index: number) {
    return (
      <li>
        <p>{stats.stat}: {stats.value}</p>
      </li>
    );
  }

  function cardView(card: CardProps, index: number) {
    return (
      <Card className="max-width-s min-width-s" style={{display: 'flex', flexDirection: 'column', margin: '1em'}}>
        <H2>{card.cardName}</H2>
        <p>{card.cardDescription}</p>
        <p>{card.cardRarity}</p>
        <p>{card.cardColor}</p>
        <ul>
          { card.cardStats.map(cardStatView) }
        </ul>
        <ButtonGroup fill style={{marginTop: 'auto'}}>
          <Button text='Edit' intent={Intent.PRIMARY} icon={IconNames.EDIT} onClick={() => navigate(`/card/${index}`)} />
          <Button text='Delete' intent={Intent.DANGER} icon={IconNames.DELETE} onClick={() => deleteCard(index)} />
        </ButtonGroup>
      </Card>
    );
  }

  return (
    <div className="fill-view" style={{margin: '0', padding: '0', display: "grid", gridTemplateColumns: '2fr 30em', gridTemplateRows: '1fr'}}>
      <Card style={{display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', overflow: 'auto' }}>
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
    </div>
  );
}

export default CardList;