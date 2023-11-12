type CardRarity = 'Common' | 'Uncommon' | 'Rare';
type CardColor = 'DestructiveRed' | 'FirepowerYellow' | 'DefensiveBlue' | 'TechWhite' | 'EvilPurple' | 'PoisonGreen' | 'NatureBrown' | 'ColdBlue' | 'MagicPink';
type Stat = 'damage' | 'health' | 'reload' | 'ammo' | 'projectiles' | 'bursts' | 'timeBetweenBullets' | 'attackSpeed' | 'bounces' | 'bulletSpeed';
type SimpleAmount = 'notAssigned' | 'aLittleBitOf' | 'Some' | 'aLotOf' | 'aHugeAmountOf' | 'slightlyLower' | 'lower' | 'aLotLower' | 'slightlySmaller' | 'smaller';

interface StatInfo {
  displayName: string
  additive: boolean
  integer: boolean
  unit: string
  min: number
  max: number
  requires: Stat[]
}

const statInfoConstraints: { [key: string]: StatInfo } = {
  'damage': {
    displayName: 'Damage',
    additive: false,
    integer: false,
    unit: '%',
    min: -100,
    max: 100,
    requires: []
  },
  'health': {
    displayName: 'Health',
    additive: false,
    integer: false,
    unit: '%',
    min: -100,
    max: 100,
    requires: []
  },
  'reload': {
    displayName: 'Reload Time',
    additive: false,
    integer: false,
    unit: '%',
    min: -100,
    max: 100,
    requires: []
  },
  'ammo': {
    displayName: 'Ammunition',
    additive: true,
    integer: true,
    unit: '',
    min: -100,
    max: 100,
    requires: []
  },
  'projectiles': {
    displayName: 'Projectiles',
    additive: true,
    integer: true,
    unit: '',
    min: 1,
    max: 100,
    requires: []
  },
  'bursts': {
    displayName: 'Bursts',
    additive: true,
    integer: true,
    unit: '',
    min: 1,
    max: 100,
    requires: ['timeBetweenBullets']
  },
  'timeBetweenBullets': {
    displayName: 'Time Between Bullets',
    additive: true,
    integer: false,
    unit: ' seconds',
    min: -100,
    max: 100,
    requires: ['bursts']
  },
  'attackSpeed': {
    displayName: 'Attack Speed',
    additive: false,
    integer: false,
    unit: '%',
    min: -100,
    max: 100,
    requires: []
  },
  'bounces': {
    displayName: 'Bounces',
    additive: true,
    integer: true,
    unit: '',
    min: 1,
    max: 100,
    requires: []
  },
  'bulletSpeed': {
    displayName: 'Bullet Speed',
    additive: false,
    integer: false,
    unit: '%',
    min: -100,
    max: 100,
    requires: []
  },
}

interface StatChange {
  value: number;
  stat: Stat;
  positive: boolean;
  simpleAmount: SimpleAmount;
}

interface CardProps {
  cardName: string
  cardDescription: string
  cardRarity: CardRarity
  cardColor: CardColor
  cardStats: StatChange[]
}

function buildCard(modName: string, className: string, title: string, description: string, rarity: CardRarity, color: CardColor, statChanges: StatChange[]) {
  return `
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using ModsPlus;

public class ${className} : SimpleCard
{
    public override CardDetails Details => new CardDetails
    {
        Title       = "${title}",
        Description = "${description}",
        ModName     = "${modName}",
        Rarity      = CardInfo.Rarity.${rarity},
        Theme       = CardThemeColor.CardThemeColorType.${color},
        Stats = new CardInfoStat[]
        {
${statChanges.map(statToInfo).join(',\n')}
        }
    };

    public override void SetupCard(CardInfo cardInfo, Gun gun, ApplyCardStats cardStats, CharacterStatModifiers statModifiers, Block block)
    {
        Dictionary<string, Action<float>> actions = new Dictionary<string, Action<float>>
        {
            { "damage",             (val) => { gun.damage = val;  } },
            { "health",             (val) => { statModifiers.health = val; } },
            { "reload",             (val) => { gun.reloadTime = val; } },
            { "ammo",               (val) => { gun.ammo = (int)val; } },
            { "projectiles",        (val) => { gun.numberOfProjectiles = Mathf.Max(1, (int)val); } },
            { "bursts",             (val) => { gun.bursts = (int)val; } },
            { "timeBetweenBullets", (val) => { gun.timeBetweenBullets = val; } },
            { "attackSpeed",        (val) => { gun.attackSpeed = val; } },
            { "bounces",            (val) => { gun.reflects = (int)val; } },
            { "bulletSpeed",        (val) => { gun.projectileSpeed = val; } }
        };
${ statChanges.map(sc => statToInvocation(sc)).join('\n') }
    }
}`.trim();
}

function statToInvocation(stat: StatChange) {
  return `        actions["${stat.stat}"].Invoke(${stat.value}f);`;
}

function statToInfo(stat: StatChange) {

  const statInfo = getStatInfo(stat.stat);

  var amountString: string;
  if (statInfo.additive) {
    amountString = `${stat.value < 0 ? stat.value : `+${stat.value}`}${statInfo.unit}`
  } else {
    const amountPercent = Math.floor((stat.value - 1) * 100);
    amountString = `${amountPercent < 0 ? '' : '+'}${amountPercent}%`
  }

  return `          new CardInfoStat()
          {
            positive = ${stat.positive},
            stat = "${statInfo.displayName}",
            amount = "${amountString}",
            simepleAmount = CardInfoStat.SimpleAmount.${stat.simpleAmount},
          }`;
}

function getStatInfo(stat: Stat) {
  return statInfoConstraints[stat];
}

export default buildCard;
export { getStatInfo }
export type { CardRarity, CardColor, SimpleAmount, StatChange, Stat, CardProps };