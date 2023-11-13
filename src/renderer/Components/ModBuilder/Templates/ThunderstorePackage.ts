import { CardProps, StatChange, getStatInfo } from "./CardTemplate";

function getManifest(modName: string, modVersion: string, shortModDescription: string) {
  return JSON.stringify({
    name: modName,
    version_number: modVersion,
    website_url: 'https://github.com/willis81808/DeckSmith',
    description: shortModDescription,
    dependencies: [
      'willis81808-UnboundLib-3.2.12',
      'willis81808-DeckSmithUtil-1.0.0',
      'willis81808-ModsPlus-1.6.2',
      'CrazyCoders-RarityBundle-0.0.0'
    ]
  }, null, 2);
}

function getReadme(modName: string, modDescription: string, cards: CardProps[]) {
  return `
# ${ modName }
### Created with [DeckSmith](https://rounds.thunderstore.io/package/willis81808/DeckSmith/)

${ modDescription.replaceAll('`', '\\`').replaceAll('${', '\\${') }

## Cards
${ cards.map(cardToDescription).join('\n\n') }
`;
}

function cardToDescription(card: CardProps) {
  return `

#### ${ card.cardName }

${ card.cardDescription }

${ card.cardStats.map(cardStatToList).join('\n') }

`;
}

function cardStatToList(stat: StatChange) {
  const statInfo = getStatInfo(stat.stat);
  var amountString: string;
  if (statInfo.additive) {
    amountString = `${stat.value < 0 ? stat.value : `+${stat.value}`}${statInfo.unit}`
  } else {
    const amountPercent = Math.floor((stat.value - 1) * 100);
    amountString = `${amountPercent < 0 ? '' : '+'}${amountPercent}%`
  }

  return `- ${statInfo.displayName} ${amountString}`
}

export { getManifest, getReadme }