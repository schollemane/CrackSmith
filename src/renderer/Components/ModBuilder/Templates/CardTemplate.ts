type CardRarity = 'Common' | 'Uncommon' | 'Rare';
type CardColor = 'DestructiveRed' | 'FirepowerYellow' | 'DefensiveBlue' | 'TechWhite' | 'EvilPurple' | 'PoisonGreen' | 'NatureBrown' | 'ColdBlue' | 'MagicPink';
type Stat = 'damage' | 'health' | 'reload' | 'ammo' | 'projectiles' | 'bursts' | 'timeBetweenBullets' | 'attackSpeed' | 'bounces' | 'bulletSpeed';
type SimpleAmount = 'notAssigned' | 'aLittleBitOf' | 'Some' | 'aLotOf' | 'aHugeAmountOf' | 'slightlyLower' | 'lower' | 'aLotLower' | 'slightlySmaller' | 'smaller';

const statDisplayTexts = {
  'damage': 'Damage',
  'health': 'Health',
  'reload': 'Reload',
  'ammo': 'Ammunition',
  'projectiles': 'Projectiles',
  'bursts': 'Bursts',
  'timeBetweenBullets': 'Time Between Bullets',
  'attackSpeed': 'Attack Speed',
  'bounces': 'Bounces',
  'bulletSpeed': 'Bullet Speed'
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
${ statChanges.map(sc => `        actions["${sc.stat}"].Invoke(${sc.value}f);`).join('\n') }
    }
}`.trim();
}

function statToInfo(stat: StatChange) {
  const amountPercent = Math.floor((stat.value - 1) * 100);
  const amountString = `${amountPercent < 0 ? '' : '+'}${amountPercent}%`
  return `          new CardInfoStat()
          {
            positive = ${stat.positive},
            stat = "${statDisplayTexts[stat.stat]}",
            amount = "${amountString}",
            simepleAmount = CardInfoStat.SimpleAmount.${stat.simpleAmount},
          }`;
}

export default buildCard;
export type { CardRarity, CardColor, SimpleAmount, StatChange, Stat, CardProps };