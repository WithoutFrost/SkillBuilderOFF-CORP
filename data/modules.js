// Stars of the City TTRPG - Modules Data (Rank 1, 2, 3)
const MODULES = [
  // ================= RANK 1 MODULES =================
  {
    id: "powerful",
    name: "Powerful",
    rank: 1,
    target: "die",
    repeating: true,
    tag: "[Power]",
    category: "Power / Dice",
    description: "One Die gains +1 Base Power.",
    apply: (die) => { die.bonus = (die.bonus || 0) + 1; }
  },
  {
    id: "potential",
    name: "Potential",
    rank: 1,
    target: "die",
    repeating: true,
    tag: "[Die Size]",
    category: "Power / Dice",
    description: "One Die has its size increased by 1 stage (d4->d6, d6->d8, d8->d10, d10->d12. Max d12).",
    apply: (die) => {
      const progression = [4, 6, 8, 10, 12];
      const idx = progression.indexOf(die.sides);
      if (idx !== -1 && idx < progression.length - 1) {
        die.sides = progression[idx + 1];
      }
    }
  },
  {
    id: "forceful",
    name: "Forceful",
    rank: 1,
    target: "die",
    repeating: false,
    tag: "[Clash Win]",
    category: "Stagger",
    description: "One Die gains: '[Clash Win] Target loses 2 Stagger Resist.' (If Cost >= 3, applies to 2 Dice).",
    effectText: "[Clash Win] Target loses 2 Stagger Resist."
  },
  {
    id: "heroic",
    name: "Heroic",
    rank: 1,
    target: "die",
    filterDice: (d) => d.type === "Defensive" && d.selectedType === "Block",
    repeating: false,
    tag: "[Check]",
    category: "Defense",
    description: "One Block Die gains: '[Check] Power +2 if this skill intercepted the opposing attack.'",
    effectText: "[Check] Power +2 if this skill intercepted the opposing attack."
  },
  {
    id: "cut_through",
    name: "Cut Through",
    rank: 1,
    target: "die",
    repeating: true,
    tag: "[Hit]",
    category: "Utility",
    description: "One Die gains: '[Hit] Remove 1 Protection, 1 Thorns, and 1 Aggro from target' (2 of each if Cost >= 3).",
    effectText: (cost) => `[Hit] Remove ${cost >= 3 ? 2 : 1} Protection, ${cost >= 3 ? 2 : 1} Thorns, and ${cost >= 3 ? 2 : 1} Aggro from target.`
  },
  {
    id: "frustration",
    name: "Frustration",
    rank: 1,
    target: "die",
    repeating: true,
    tag: "[Clash Lose]",
    category: "Emotion",
    description: "One Die gains: '[Clash Lose] Gain 1 Emotion Point.'",
    effectText: "[Clash Lose] Gain 1 Emotion Point."
  },
  {
    id: "fast_on_use",
    name: "Fast (On Use)",
    rank: 1,
    target: "skill",
    repeating: false,
    tag: "[On Use]",
    category: "Speed & Haste",
    description: "This skill gains: '[On Use] Gain {Cost} Haste' (min 1).",
    effectText: (cost) => `[On Use] Gain ${Math.max(1, cost)} Haste.`
  },
  {
    id: "fast_after_use",
    name: "Fast (After Use)",
    rank: 1,
    target: "skill",
    repeating: false,
    tag: "[After Use]",
    category: "Speed & Haste",
    description: "This skill gains: '[After Use] Gain {Cost-1} Haste' (min 1).",
    effectText: (cost) => `[After Use] Gain ${Math.max(1, cost - 1)} Haste.`
  },
  {
    id: "shields_up",
    name: "Shields Up",
    rank: 1,
    target: "skill",
    repeating: false,
    tag: "[On Use]",
    category: "Defense",
    description: "This skill gains: '[On Use] Gain {Cost} Protection' (min 1).",
    effectText: (cost) => `[On Use] Gain ${Math.max(1, cost)} Protection.`
  },
  {
    id: "critical_fragility",
    name: "Critical Fragility",
    rank: 1,
    target: "die",
    repeating: true,
    tag: "[Crit]",
    category: "Status - Fragile",
    description: "One Die gains: '[Crit] Inflict 1 Fragile' (2 if Die size >= d10).",
    effectText: (cost, die) => `[Crit] Inflict ${die && die.sides >= 10 ? 2 : 1} Fragile.`
  },
  {
    id: "critical_bind",
    name: "Critical Bind",
    rank: 1,
    target: "die",
    repeating: true,
    tag: "[Crit]",
    category: "Status - Bind",
    description: "One Die gains: '[Crit] Inflict 1 Bind' (2 if Die size >= d10).",
    effectText: (cost, die) => `[Crit] Inflict ${die && die.sides >= 10 ? 2 : 1} Bind.`
  },
  {
    id: "charging_on_use",
    name: "Charging (On Use)",
    rank: 1,
    target: "skill",
    repeating: false,
    tag: "[On Use]",
    category: "Status - Charge",
    description: "This skill gains: '[On Use] Gain {Cost} Charge' (min 1).",
    effectText: (cost) => `[On Use] Gain ${Math.max(1, cost)} Charge.`
  },
  {
    id: "impact_charger",
    name: "Impact Charger",
    rank: 1,
    target: "die",
    repeating: true,
    tag: "[Hit]",
    category: "Status - Charge",
    description: "One Die gains: '[Hit] Gain 1 Charge.'",
    effectText: "[Hit] Gain 1 Charge."
  },
  {
    id: "powered_strike",
    name: "Powered Strike",
    rank: 1,
    target: "die",
    minCost: 1,
    filterDice: (d) => d.type === "Offensive",
    repeating: true,
    tag: "[Hit]",
    category: "Status - Charge",
    description: "One Offensive Die gains: '[Hit] Spend up to {Cost} Charge to deal additional damage = 3x Charge spent.'",
    effectText: (cost) => `[Hit] Spend up to ${cost} Charge to deal additional damage = 3x Charge spent.`
  },
  {
    id: "poised_on_use",
    name: "Poised (On Use)",
    rank: 1,
    target: "skill",
    repeating: false,
    tag: "[On Use]",
    category: "Status - Poise",
    description: "This skill gains: '[On Use] Gain {Cost} Poise' (min 1).",
    effectText: (cost) => `[On Use] Gain ${Math.max(1, cost)} Poise.`
  },
  {
    id: "recursive_crit",
    name: "Recursive Crit",
    rank: 1,
    target: "die",
    repeating: true,
    tag: "[Crit]",
    category: "Status - Poise",
    description: "One Die gains: '[Crit] Gain X Poise' (1 if <= d8, 2 if >= d10).",
    effectText: (cost, die) => `[Crit] Gain ${die && die.sides >= 10 ? 2 : 1} Poise.`
  },
  {
    id: "burning_single",
    name: "Burning (Single Die)",
    rank: 1,
    target: "die",
    repeating: true,
    tag: "[Hit]",
    category: "Status - Burn",
    description: "One Die gains: '[Hit] Inflict {Cost+1} Burn.'",
    effectText: (cost) => `[Hit] Inflict ${cost + 1} Burn.`
  },
  {
    id: "burning_all",
    name: "Burning (All Dice)",
    rank: 1,
    target: "skill",
    repeating: false,
    tag: "[Hit]",
    category: "Status - Burn",
    description: "All offensive Dice gain: '[Hit] Inflict 1 Burn.'",
    effectText: "All offensive dice gain: [Hit] Inflict 1 Burn."
  },
  {
    id: "blazing",
    name: "Blazing",
    rank: 1,
    target: "die",
    repeating: true,
    tag: "[Hit]",
    category: "Status - Burn",
    description: "One Die gains: '[Hit] Trigger Blaze on target.'",
    effectText: "[Hit] Trigger Blaze on target."
  },
  {
    id: "bleeding_single",
    name: "Bleeding (Single Die)",
    rank: 1,
    target: "die",
    repeating: true,
    tag: "[Hit]",
    category: "Status - Bleed",
    description: "One Die gains: '[Hit] Inflict {Cost} Bleed' (min 1).",
    effectText: (cost) => `[Hit] Inflict ${Math.max(1, cost)} Bleed.`
  },
  {
    id: "bleeding_all",
    name: "Bleeding (All Dice)",
    rank: 1,
    target: "skill",
    repeating: false,
    tag: "[Hit]",
    category: "Status - Bleed",
    description: "All offensive Dice gain: '[Hit] Inflict 1 Bleed.'",
    effectText: "All offensive dice gain: [Hit] Inflict 1 Bleed."
  },
  {
    id: "open_wounds",
    name: "Open Wounds",
    rank: 1,
    target: "die",
    repeating: false,
    tag: "[Hit]",
    category: "Status - Bleed",
    description: "One Die gains: '[Hit] Deal additional damage = Bleed on target.'",
    effectText: "[Hit] Deal additional damage = Bleed on target."
  },
  {
    id: "tremoring_single",
    name: "Tremoring (Single Die)",
    rank: 1,
    target: "die",
    repeating: true,
    tag: "[Hit]",
    category: "Status - Tremor",
    description: "One Die gains: '[Hit] Inflict {Cost} Tremor' (min 1).",
    effectText: (cost) => `[Hit] Inflict ${Math.max(1, cost)} Tremor.`
  },
  {
    id: "unstable_burst",
    name: "Unstable Burst",
    rank: 1,
    target: "die",
    repeating: true,
    tag: "[Hit]",
    category: "Status - Tremor",
    description: "One Die gains: '[Hit] Trigger Tremor Burst, then reduce target's Tremor by 4.'",
    effectText: "[Hit] Trigger Tremor Burst, then reduce target's Tremor by 4."
  },
  {
    id: "sinking_single",
    name: "Sinking (Single Die)",
    rank: 1,
    target: "die",
    repeating: true,
    tag: "[Hit]",
    category: "Status - Sinking",
    description: "One Die gains: '[Hit] Inflict {Cost+1} Sinking.'",
    effectText: (cost) => `[Hit] Inflict ${cost + 1} Sinking.`
  },

  // ================= RANK 2 MODULES =================
  {
    id: "revitalizer",
    name: "Revitalizer",
    rank: 2,
    target: "skill",
    repeating: false,
    tag: "[After Use]",
    category: "Light & Recovery",
    description: "This skill gains: '[Limit: 5 Uses]' and '[After Use] Regain 1 Light.'",
    effectText: "[Limit: 5 Uses] [After Use] Regain 1 Light."
  },
  {
    id: "reliable",
    name: "Reliable",
    rank: 2,
    target: "die",
    repeating: true,
    tag: "[Check]",
    category: "Power / Dice",
    description: "One Die (>= d6) reduces size by 1 stage, gains +2 Base Power and rerolls on minimum roll.",
    apply: (die) => {
      const progression = [4, 6, 8, 10, 12];
      const idx = progression.indexOf(die.sides);
      if (idx > 0) die.sides = progression[idx - 1];
      die.bonus = (die.bonus || 0) + 2;
    },
    effectText: "[Check] If this Die rolled minimum value, you may re-roll it once."
  },
  {
    id: "health_hauler",
    name: "Health Hauler",
    rank: 2,
    target: "die",
    repeating: true,
    tag: "[Clash Win]",
    category: "Light & Recovery",
    description: "One Die gains: '[Clash Win] Regain {Cost+2} HP.'",
    effectText: (cost) => `[Clash Win] Regain ${cost + 2} HP.`
  },
  {
    id: "stamina_hauler",
    name: "Stamina Hauler",
    rank: 2,
    target: "die",
    repeating: true,
    tag: "[Clash Win]",
    category: "Stagger",
    description: "One Die gains: '[Clash Win] Regain {Cost+2} Stagger Resistance.'",
    effectText: (cost) => `[Clash Win] Regain ${cost + 2} Stagger Resistance.`
  },
  {
    id: "nullify",
    name: "Nullify",
    rank: 2,
    target: "skill",
    repeating: false,
    tag: "[Eminence]",
    category: "Utility",
    description: "This skill gains: '[Eminence] This skill and opposing skill ignore any Power changes except Base Power and ignore [Check] effects.'",
    effectText: "[Eminence] This skill and opposing skill ignore any Power changes except Base Power and ignore [Check] effects."
  },
  {
    id: "velocity",
    name: "Velocity",
    rank: 2,
    target: "die",
    repeating: false,
    tag: "[Check]",
    category: "Speed & Haste",
    description: "One Die gains: '[Check] Power +{Cost+1} when used at 8+ Speed.'",
    effectText: (cost) => `[Check] Power +${cost + 1} when used at 8+ Speed.`
  },
  {
    id: "berserker",
    name: "Berserker",
    rank: 2,
    target: "skill",
    minCost: 2,
    repeating: false,
    tag: "[On Use]",
    category: "Power / Dice",
    description: "Cost 2+ only. This skill gains: '[On Use] Gain 1 Strength and 2 Fragile.'",
    effectText: "[On Use] Gain 1 Strength and 2 Fragile."
  },
  {
    id: "bunker",
    name: "Bunker",
    rank: 2,
    target: "skill",
    minCost: 2,
    repeating: false,
    tag: "[On Use]",
    category: "Defense",
    description: "Cost 2+ only. This skill gains: '[On Use] Gain 1 Endurance and 2 Bind.'",
    effectText: "[On Use] Gain 1 Endurance and 2 Bind."
  },
  {
    id: "shattering",
    name: "Shattering",
    rank: 2,
    target: "die",
    repeating: true,
    tag: "[Hit]",
    category: "Status - Fragile",
    description: "One Die gains: '[Hit] Inflict 1 Fragile' (If Cost >= 3 applies to 2 dice, or if single die inflicts 2).",
    effectText: (cost) => `[Hit] Inflict ${cost >= 3 ? 2 : 1} Fragile.`
  },
  {
    id: "charge_ripper",
    name: "Charge Ripper",
    rank: 2,
    target: "skill",
    repeating: false,
    tag: "[On Use]",
    category: "Status - Charge",
    description: "This skill gains: '[On Use] Spend 5 Charge to give all Dice +2 Power (+4 if single Die).'",
    effectText: "[On Use] Spend 5 Charge to give all Dice +2 Power (+4 if single Die)."
  },
  {
    id: "inferno",
    name: "Inferno",
    rank: 2,
    target: "die",
    repeating: true,
    tag: "[Hit]",
    category: "Status - Burn",
    description: "One Die gains: '[Hit] Trigger Blaze on target, then inflict 2 Burn.'",
    effectText: "[Hit] Trigger Blaze on target, then inflict 2 Burn."
  },
  {
    id: "burst",
    name: "Burst (Tremor)",
    rank: 2,
    target: "die",
    repeating: true,
    tag: "[Hit]",
    category: "Status - Tremor",
    description: "One Die gains: '[Hit] Trigger Tremor Burst, then reduce target's Tremor by 2.'",
    effectText: "[Hit] Trigger Tremor Burst, then reduce target's Tremor by 2."
  },
  {
    id: "bleed_exploit",
    name: "Bleed Exploit",
    rank: 2,
    target: "die",
    repeating: true,
    tag: "[Check]",
    category: "Status - Bleed",
    description: "One Die gains: '[Check] Power +{Cost+1} if target has 3+ Bleed.'",
    effectText: (cost) => `[Check] Power +${cost + 1} if target has 3+ Bleed.`
  },

  // ================= RANK 3 MODULES =================
  {
    id: "extra_die",
    name: "Extra Die",
    rank: 3,
    target: "skill",
    repeating: false,
    tag: "[Extra Die]",
    category: "Power / Dice",
    description: "Adds an additional Die to the skill (1d4 for Cost 0, 1d6 for Cost 1, 1d8 for Cost 2, 1d10 for Cost 3+).",
    isExtraDie: true
  },
  {
    id: "counter",
    name: "Counter Die",
    rank: 3,
    target: "skill",
    minCost: 1,
    repeating: false,
    tag: "[After Use]",
    category: "Defense",
    description: "Cost 1+ only. Gains '[After Use] Gain Counter Die' (1d4 for Cost 1, 1d6 for Cost 2, 1d8 for Cost 3+).",
    isCounterDie: true
  },
  {
    id: "crumble",
    name: "Crumble",
    rank: 3,
    target: "die",
    repeating: false,
    tag: "[Clash Win]",
    category: "Utility",
    description: "One Die gains: '[Clash Win] You may spend 1 Light to destroy target's next Die.'",
    effectText: "[Clash Win] You may spend 1 Light to destroy target's next Die."
  },
  {
    id: "extreme_critical",
    name: "Extreme Critical",
    rank: 3,
    target: "die",
    repeating: false,
    tag: "[Crit]",
    category: "Power / Dice",
    description: "One Die gains: '[Crit] Deal +{X} additional damage and stagger (X = max face of die)'.",
    effectText: (cost, die) => `[Crit] Deal +${die ? die.sides : 'X'} additional damage and stagger.`
  },
  {
    id: "mighty",
    name: "Mighty",
    rank: 3,
    target: "skill",
    minCost: 2,
    repeating: false,
    tag: "[On Use]",
    category: "Power / Dice",
    description: "Cost 2+ only. This skill gains: '[On Use] Gain 1 Strength.'",
    effectText: "[On Use] Gain 1 Strength."
  },
  {
    id: "sturdy",
    name: "Sturdy",
    rank: 3,
    target: "skill",
    minCost: 2,
    repeating: false,
    tag: "[On Use]",
    category: "Defense",
    description: "Cost 2+ only. This skill gains: '[On Use] Gain 1 Endurance.'",
    effectText: "[On Use] Gain 1 Endurance."
  },
  {
    id: "stable_burst",
    name: "Stable Burst",
    rank: 3,
    target: "die",
    repeating: true,
    tag: "[Hit]",
    category: "Status - Tremor",
    description: "One Die gains: '[Hit] Trigger Tremor Burst (without reducing Tremor).'",
    effectText: "[Hit] Trigger Tremor Burst."
  },
  {
    id: "mutilate",
    name: "Mutilate",
    rank: 3,
    target: "die",
    repeating: false,
    tag: "[Hit]",
    category: "Status - Bleed",
    description: "One Die gains: '[Hit] Inflict {Cost} Bleed, 1 Fragile, and 1 Bind' (min 1 Bleed).",
    effectText: (cost) => `[Hit] Inflict ${Math.max(1, cost)} Bleed, 1 Fragile, and 1 Bind.`
  },
  {
    id: "wildfire",
    name: "Wildfire",
    rank: 3,
    target: "die",
    minCost: 1,
    repeating: false,
    tag: "[Hit]",
    category: "Status - Burn",
    description: "Cost 1+ only. One Die gains: '[Hit] Set target's Burn equal to highest among combatants.'",
    effectText: "[Hit] Set target's Burn equal to highest among combatants."
  }
];

window.MODULES = MODULES;
