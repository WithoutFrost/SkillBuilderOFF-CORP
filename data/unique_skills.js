// Stars of the City TTRPG - Unique Skills Data
const UNIQUE_SKILLS = [
  {
    id: "yield_my_flesh",
    name: "Yield My Flesh",
    cost: 2,
    rarity: "Unique",
    archetype: "Blade Lineage / Kurokumo",
    description: "When spending Poise on this skill, you may choose to take the max or min values. Unlocks To Claim Their Bones on clash loss.",
    innateTags: ["[After Use] Gain 3 Aggro"],
    dice: [
      {
        id: "d1",
        type: "Offensive",
        allowedTypes: ["Slash"],
        defaultType: "Slash",
        count: 1,
        sides: 8,
        bonus: 7,
        tags: [
          "[Clash Lose] Unlock 1 use of the special skill 'To Claim Their Bones'",
          "[Hit] Inflict 2 Bleed"
        ]
      }
    ],
    specialNote: "Grants access to extra skill 'To Claim Their Bones' (Cost 1 Counter)."
  },
  {
    id: "boundary_of_death",
    name: "Boundary of Death",
    cost: 2,
    rarity: "Unique",
    archetype: "Shi Association",
    description: "Poise required to max out dice on this skill is always 5. On a roll of 4, sets Power to 20!",
    innateTags: ["[On Use] Gain 1 Haste"],
    dice: [
      {
        id: "d1",
        type: "Offensive",
        allowedTypes: ["Pierce"],
        defaultType: "Pierce",
        count: 1,
        sides: 4,
        bonus: 4,
        tags: ["[Check] On a roll of 4, set Power to 20, ignoring ALL other modifiers except nullification."]
      }
    ]
  },
  {
    id: "overspeed",
    name: "Overspeed",
    cost: 3,
    rarity: "Unique",
    archetype: "General / Speed",
    description: "Devastating high-speed single pierce blow.",
    innateTags: ["[On Use] Spend 3 Emotion Points to gain 1 additional Speed Die next scene (max once per scene)."],
    dice: [
      { id: "d1", type: "Offensive", allowedTypes: ["Pierce"], defaultType: "Pierce", count: 1, sides: 12, bonus: 6, tags: [] }
    ]
  },
  {
    id: "sharpened_blade",
    name: "Sharpened Blade",
    cost: 2,
    rarity: "Unique",
    archetype: "Blade Lineage",
    description: "Limit 5 Uses. Empowers all Slash dice for the rest of the scene.",
    innateTags: ["[Limit: 5 Uses]", "[On Use] For the rest of the scene, your Slash Dice gain +2 Power (including this skill)."],
    dice: [
      { id: "d1", type: "Offensive", allowedTypes: ["Slash"], defaultType: "Slash", count: 1, sides: 6, bonus: 0, tags: [] },
      { id: "d2", type: "Offensive", allowedTypes: ["Slash"], defaultType: "Slash", count: 1, sides: 6, bonus: 0, tags: ["[Hit] Inflict 2 Bleed"] }
    ]
  },
  {
    id: "ink_over",
    name: "Ink Over",
    cost: 3,
    rarity: "Unique",
    archetype: "Kurokumo Clan",
    description: "Gains power for every distinct Known Skill used in this combat.",
    innateTags: [],
    dice: [
      { id: "d1", type: "Offensive", allowedTypes: ["Slash"], defaultType: "Slash", count: 1, sides: 8, bonus: 0, tags: ["[Check] Gains +1 Power for every distinct Known Skill used in this combat."] },
      { id: "d2", type: "Defensive", allowedTypes: ["Block"], defaultType: "Block", count: 1, sides: 8, bonus: 0, tags: [] },
      { id: "d3", type: "Offensive", allowedTypes: ["Pierce"], defaultType: "Pierce", count: 1, sides: 8, bonus: 0, tags: ["[Hit] Inflict 1 Fragile"] }
    ]
  },
  {
    id: "onrush",
    name: "Onrush",
    cost: 3,
    rarity: "Unique",
    archetype: "R Corp",
    description: "Massive strike that re-uses itself against another enemy on kill or stagger.",
    innateTags: [],
    dice: [
      { id: "d1", type: "Offensive", allowedTypes: ["Slash"], defaultType: "Slash", count: 1, sides: 8, bonus: 9, tags: ["[On Kill or Stagger] Re-use this skill against another random enemy without spending Light."] }
    ]
  },
  {
    id: "rip_space",
    name: "Rip Space",
    cost: 2,
    rarity: "Unique",
    archetype: "W Corp",
    description: "Spends up to 10 Charge. On a successful d10 roll <= Charge spent, grants +8 Power to all dice!",
    innateTags: ["[On Use] Spend up to 10 Charge, roll 1d10. If <= Charge spent, give both dice +8 Power.", "[After Use] If d10 > Charge spent, take damage = Charge spent and gain half Charge."],
    dice: [
      { id: "d1", type: "Offensive", allowedTypes: ["Pierce"], defaultType: "Pierce", count: 1, sides: 8, bonus: 0, tags: ["[Check] If this skill spent 10 Charge, gain +2 Power."] },
      { id: "d2", type: "Offensive", allowedTypes: ["Slash"], defaultType: "Slash", count: 1, sides: 8, bonus: 2, tags: [] }
    ]
  }
];

window.UNIQUE_SKILLS = UNIQUE_SKILLS;
