import SyntaxHighlighter from 'react-syntax-highlighter';
import { atelierCaveDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Card, Button, ButtonGroup, EditableText, H1, H2, FormGroup, HTMLSelect, TextArea, NumericInput, Intent } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import { useCallback, useState } from "react";
import '../Flow.css'
import buildCard, { CardColor, CardRarity, Stat, StatChange } from './Templates/CardTemplate';

function CardBuilder() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rarity, setRarity] = useState('Common' as CardRarity);
  const [color, setColor] = useState('TechWhite' as CardColor);
  const [stats, setStats] = useState([] as StatChange[])

  const handleSetName = useCallback((value: string) => {
    setName(value.replaceAll(' ', ''))
  }, [name]);

  const handleStatChange = useCallback((index: number, stat: Stat, value: number) => { 
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], stat, value };
    setStats(newStats);
  }, [stats]);

  const addStat = useCallback(() => {
    const newStats = [...stats];
    newStats.push({
      stat: 'damage',
      value: 1
    });
    setStats(newStats);
  }, [stats]); 

  const removeStat = useCallback((index: number) => {
    const newStats = stats.filter((_, i) => i !== index);
    setStats(newStats);
  }, [stats])

  function statView(index: number, stat: StatChange) {
    return (
      <Card>
        <FormGroup label="Stat">
          <HTMLSelect
            fill={true}
            options={['damage', 'health', 'reload', 'ammo', 'projectiles', 'bursts', 'timeBetweenBullets', 'attackSpeed', 'bounces', 'bulletSpeed']}
            value={stat.stat}
            onChange={(e) => handleStatChange(index, e.target.value as Stat, stat.value)} />
        </FormGroup>
        <FormGroup label="Value">
          <NumericInput
            fill={true}
            value={stat.value}
            stepSize={0.1}
            allowNumericCharactersOnly={true}
            onValueChange={(_v: number, value: string) => handleStatChange(index, stat.stat, _v)} />
        </FormGroup>
        <Button intent={Intent.DANGER} text='Delete' fill={true} onClick={() => removeStat(index)} />
      </Card>
    );
  }

  return (
    <div className="fill-view" style={{margin: '0', padding: '0', display: "grid", gridTemplateColumns: '35em 2fr', gridTemplateRows: '1fr'}}>
      <Card style={{paddingTop: '5em', overflow: 'auto'}}>
        <H1><EditableText placeholder="Card Name" onChange={handleSetName} value={name} /></H1>
        <FormGroup label="Description" labelFor="card-description">
          <TextArea id='card-description' fill placeholder='Card Description' onChange={(e) => setDescription(e.target.value)} value={description} />
        </FormGroup>
        
        <FormGroup label="Rarity" labelFor="card-rarity">
          <HTMLSelect
            fill={true}
            options={['Common', 'Uncommon', 'Rare']}
            value={rarity}
            id="card-rarity"
            onChange={(e) => setRarity(e.target.value as CardRarity)} />
        </FormGroup>
          
        <FormGroup label="Color" labelFor="card-color">
          <HTMLSelect
            fill={true}
            options={['DestructiveRed', 'FirepowerYellow', 'DefensiveBlue', 'TechWhite', 'EvilPurple', 'PoisonGreen', 'NatureBrown', 'ColdBlue', 'MagicPink']}
            value={color}
            id="open-ai-model"
            onChange={(e) => setColor(e.target.value as CardColor)} />
        </FormGroup>
        { stats.map((s, i) => statView(i, s)) }
        <Button fill={true} onClick={addStat} text="Add Stat" />
      </Card>
      <SyntaxHighlighter customStyle={{margin: 0, height: '100%'}} language="csharp" style={atelierCaveDark}>{buildCard('test.mod.id', name, name, description, rarity, color, stats).trim()}</SyntaxHighlighter>
    </div>
  );
}

export default CardBuilder;