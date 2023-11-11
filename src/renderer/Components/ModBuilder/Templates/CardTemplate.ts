type CardRarity = 'Common' | 'Uncommon' | 'Rare';
type CardColor = 'DestructiveRed' | 'FirepowerYellow' | 'DefensiveBlue' | 'TechWhite' | 'EvilPurple' | 'PoisonGreen' | 'NatureBrown' | 'ColdBlue' | 'MagicPink';
type Stat = 'damage' | 'health' | 'reload' | 'ammo' | 'projectiles' | 'bursts' | 'timeBetweenBullets' | 'attackSpeed' | 'bounces' | 'bulletSpeed';

interface StatChange {
  value: number;
  stat: Stat;
}

function buildCard(modId: string, className: string, title: string, description: string, rarity: CardRarity, color: CardColor, statChanges: StatChange[]) {
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
    ModName     = "${modId}",
    Rarity      = CardInfo.Rarity.${rarity},
    Theme       = CardThemeColor.CardThemeColorType.${color}
  };

  public override void SetupCard(CardInfo cardInfo, Gun gun, ApplyCardStats cardStats, CharacterStatModifiers statModifiers, Block block)
  {
    Dictionary<string, Action<float>> actions = new Dictionary<string, Action<float>>
    {
      { "damage", (val) => { gun.damage = val;  } },
      { "health", (val) => { statModifiers.health = val; } },
      { "reload", (val) => { gun.reloadTime = val; } },
      { "ammo", (val) => { gun.ammo = (int)val; } },
      { "projectiles", (val) => { gun.numberOfProjectiles = Mathf.Max(1, (int)val); } },
      { "bursts", (val) => { gun.bursts = (int)val; } },
      { "timeBetweenBullets", (val) => { gun.timeBetweenBullets = val; } },
      { "attackSpeed", (val) => { gun.attackSpeed = val; } },
      { "bounces", (val) => { gun.reflects = (int)val; } },
      { "bulletSpeed", (val) => { gun.projectileSpeed = val; } }
    };
${ statChanges.map(sc => `    actions["${sc.stat}"].invoke(${sc.value});`).join('\n') }
  }
}
`;
}

export default buildCard;
export type { CardRarity, CardColor, StatChange, Stat };