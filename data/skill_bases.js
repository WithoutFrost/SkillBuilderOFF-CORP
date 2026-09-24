// Stars of the City TTRPG - Skill Bases Data
const SKILL_BASES = [
  {
    id: "cheap_blow",
    name: "Cheap Blow",
    cost: 0,
    category: "Standard",
    description: "A quick, low-impact strike requiring no light.",
    dice: [
      { id: "d1", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Slash", count: 1, sides: 6, bonus: 0 }
    ]
  },
  {
    id: "panic_defense",
    name: "Panic Defense",
    cost: 0,
    category: "Standard",
    description: "An instinctual defensive posture in a desperate moment.",
    dice: [
      { id: "d1", type: "Defensive", allowedTypes: ["Block", "Evade"], defaultType: "Block", count: 1, sides: 6, bonus: 0 }
    ]
  },
  {
    id: "single_strike",
    name: "Single Strike",
    cost: 1,
    category: "Standard",
    description: "A focused, reliable single offensive strike.",
    dice: [
      { id: "d1", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Slash", count: 1, sides: 8, bonus: 3 }
    ]
  },
  {
    id: "heavy_guard",
    name: "Heavy Guard",
    cost: 1,
    category: "Standard",
    description: "Planting your feet to withstand an incoming blow.",
    dice: [
      { id: "d1", type: "Defensive", allowedTypes: ["Block"], defaultType: "Block", count: 1, sides: 8, bonus: 3 }
    ]
  },
  {
    id: "dual_strike",
    name: "Dual Strike",
    cost: 1,
    category: "Standard",
    description: "Two swift offensive strikes of differing attack styles.",
    dice: [
      { id: "d1", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Slash", count: 1, sides: 6, bonus: 0 },
      { id: "d2", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Pierce", count: 1, sides: 4, bonus: 0, distinctType: true }
    ]
  },
  {
    id: "mixed_defense",
    name: "Mixed Defense",
    cost: 1,
    category: "Standard",
    description: "A flexible defensive sequence of blocks and evasions.",
    dice: [
      { id: "d1", type: "Defensive", allowedTypes: ["Block", "Evade"], defaultType: "Block", count: 1, sides: 8, bonus: 0 },
      { id: "d2", type: "Defensive", allowedTypes: ["Block", "Evade"], defaultType: "Evade", count: 1, sides: 6, bonus: 0 }
    ]
  },
  {
    id: "parry",
    name: "Parry",
    cost: 1,
    category: "Standard",
    description: "Deflect an incoming strike and return with an attack.",
    dice: [
      { id: "d1", type: "Defensive", allowedTypes: ["Block", "Evade"], defaultType: "Block", count: 1, sides: 6, bonus: 0 },
      { id: "d2", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Slash", count: 1, sides: 6, bonus: 0 }
    ]
  },
  {
    id: "riposte",
    name: "Riposte",
    cost: 1,
    category: "Standard",
    description: "Strike first, then immediately raise your guard.",
    dice: [
      { id: "d1", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Pierce", count: 1, sides: 6, bonus: 0 },
      { id: "d2", type: "Defensive", allowedTypes: ["Block", "Evade"], defaultType: "Evade", count: 1, sides: 6, bonus: 0 }
    ]
  },
  {
    id: "strong_strike",
    name: "Strong Strike",
    cost: 2,
    category: "Standard",
    description: "A devastating single blow packing immense kinetic force.",
    dice: [
      { id: "d1", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Blunt", count: 1, sides: 10, bonus: 5 }
    ]
  },
  {
    id: "double_attack",
    name: "Double Attack",
    cost: 2,
    category: "Standard",
    description: "Two solid attacks delivered in rapid succession.",
    dice: [
      { id: "d1", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Slash", count: 1, sides: 8, bonus: 0 },
      { id: "d2", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Slash", count: 1, sides: 8, bonus: 0 }
    ]
  },
  {
    id: "fake_out",
    name: "Fake Out",
    cost: 2,
    category: "Standard",
    description: "A feint followed by an unexpected heavy follow-up.",
    dice: [
      { id: "d1", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Blunt", count: 1, sides: 4, bonus: 1 },
      { id: "d2", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Slash", count: 1, sides: 8, bonus: 1, distinctType: true }
    ]
  },
  {
    id: "lunge",
    name: "Lunge",
    cost: 2,
    category: "Standard",
    description: "A forward piercing thrust followed by an evasive retreat.",
    dice: [
      { id: "d1", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Pierce", count: 1, sides: 8, bonus: 1 },
      { id: "d2", type: "Defensive", allowedTypes: ["Evade"], defaultType: "Evade", count: 1, sides: 6, bonus: 1 }
    ]
  },
  {
    id: "triple_threat",
    name: "Triple Threat",
    cost: 2,
    category: "Standard",
    description: "Attack, defend, then attack again to keep the enemy off-balance.",
    dice: [
      { id: "d1", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Slash", count: 1, sides: 6, bonus: 0 },
      { id: "d2", type: "Defensive", allowedTypes: ["Block", "Evade"], defaultType: "Block", count: 1, sides: 6, bonus: 0 },
      { id: "d3", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Slash", count: 1, sides: 6, bonus: 0 }
    ]
  },
  {
    id: "quick_jabs",
    name: "Quick Jabs",
    cost: 2,
    category: "Standard",
    description: "A flurry of three rapid strikes (max 2 of the same damage type).",
    dice: [
      { id: "d1", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Pierce", count: 1, sides: 6, bonus: 0 },
      { id: "d2", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Pierce", count: 1, sides: 4, bonus: 0 },
      { id: "d3", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Blunt", count: 1, sides: 4, bonus: 0 }
    ]
  },
  {
    id: "delayed_strike",
    name: "Delayed Strike",
    cost: 2,
    category: "Standard",
    description: "Block an incoming strike and wait for an opening to retaliate.",
    dice: [
      { id: "d1", type: "Defensive", allowedTypes: ["Block"], defaultType: "Block", count: 1, sides: 6, bonus: 1 },
      { id: "d2", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Slash", count: 1, sides: 8, bonus: 1 }
    ]
  },
  {
    id: "defensive_push",
    name: "Defensive Push",
    cost: 2,
    category: "Standard",
    description: "Deliver a strong blow and immediately raise a reinforced guard.",
    dice: [
      { id: "d1", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Blunt", count: 1, sides: 10, bonus: 0 },
      { id: "d2", type: "Defensive", allowedTypes: ["Block"], defaultType: "Block", count: 1, sides: 6, bonus: 2 }
    ]
  },
  {
    id: "walled_off",
    name: "Walled Off",
    cost: 2,
    category: "Standard",
    description: "Double block layers followed by a counterattack.",
    dice: [
      { id: "d1", type: "Defensive", allowedTypes: ["Block"], defaultType: "Block", count: 1, sides: 8, bonus: 0 },
      { id: "d2", type: "Defensive", allowedTypes: ["Block"], defaultType: "Block", count: 1, sides: 8, bonus: 0 },
      { id: "d3", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Slash", count: 1, sides: 6, bonus: 0 }
    ]
  },
  {
    id: "wait_and_see",
    name: "Wait and See",
    cost: 2,
    category: "Standard",
    description: "Evade and guard before unleashing an accurate counterstrike.",
    dice: [
      { id: "d1", type: "Defensive", allowedTypes: ["Evade"], defaultType: "Evade", count: 1, sides: 4, bonus: 0 },
      { id: "d2", type: "Defensive", allowedTypes: ["Block"], defaultType: "Block", count: 1, sides: 4, bonus: 0 },
      { id: "d3", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Pierce", count: 1, sides: 8, bonus: 2 }
    ]
  },
  {
    id: "dodge_and_strike",
    name: "Dodge and Strike",
    cost: 2,
    category: "Community",
    credit: "Roxas",
    description: "A nimble evasion that flows into an offensive strike.",
    dice: [
      { id: "d1", type: "Defensive", allowedTypes: ["Evade"], defaultType: "Evade", count: 1, sides: 8, bonus: 1 },
      { id: "d2", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Slash", count: 1, sides: 6, bonus: 1 }
    ]
  },
  {
    id: "behind_a_shield",
    name: "Behind a Shield",
    cost: 2,
    category: "Community",
    credit: "Roxas",
    description: "A fortified strike surrounded by protective blocks.",
    dice: [
      { id: "d1", type: "Defensive", allowedTypes: ["Block"], defaultType: "Block", count: 1, sides: 6, bonus: 1 },
      { id: "d2", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Pierce", count: 1, sides: 6, bonus: 2 },
      { id: "d3", type: "Defensive", allowedTypes: ["Block"], defaultType: "Block", count: 1, sides: 6, bonus: 0 }
    ]
  },
  {
    id: "massive_strike",
    name: "Massive Strike",
    cost: 3,
    category: "Standard",
    description: "A colossal single strike carrying devastating power (1d12+8).",
    dice: [
      { id: "d1", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Slash", count: 1, sides: 12, bonus: 8 }
    ]
  },
  {
    id: "full_assault",
    name: "Full Assault",
    cost: 3,
    category: "Standard",
    description: "A relentless barrage of 3 offensive strikes.",
    dice: [
      { id: "d1", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Slash", count: 1, sides: 8, bonus: 1 },
      { id: "d2", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Pierce", count: 1, sides: 8, bonus: 0 },
      { id: "d3", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Blunt", count: 1, sides: 6, bonus: 0 }
    ]
  },
  {
    id: "old_reliable",
    name: "Old Reliable",
    cost: 3,
    category: "Standard",
    description: "Classic Fixer combination: Guard, strike hard, guard again.",
    dice: [
      { id: "d1", type: "Defensive", allowedTypes: ["Block"], defaultType: "Block", count: 1, sides: 8, bonus: 1 },
      { id: "d2", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Blunt", count: 1, sides: 10, bonus: 3 },
      { id: "d3", type: "Defensive", allowedTypes: ["Block"], defaultType: "Block", count: 1, sides: 8, bonus: 1 }
    ]
  },
  {
    id: "press_on",
    name: "Press On",
    cost: 3,
    category: "Standard",
    description: "Relentless push with two strong attacks finishing with defense.",
    dice: [
      { id: "d1", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Slash", count: 1, sides: 10, bonus: 0 },
      { id: "d2", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Slash", count: 1, sides: 8, bonus: 0 },
      { id: "d3", type: "Defensive", allowedTypes: ["Block", "Evade"], defaultType: "Block", count: 1, sides: 8, bonus: 0 }
    ]
  },
  {
    id: "dodge_and_weave",
    name: "Dodge and Weave",
    cost: 3,
    category: "Standard",
    description: "A 4-die sequence alternating evasions and attacks.",
    dice: [
      { id: "d1", type: "Defensive", allowedTypes: ["Evade"], defaultType: "Evade", count: 1, sides: 8, bonus: 0 },
      { id: "d2", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Slash", count: 1, sides: 8, bonus: 0 },
      { id: "d3", type: "Defensive", allowedTypes: ["Evade"], defaultType: "Evade", count: 1, sides: 6, bonus: 0 },
      { id: "d4", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Slash", count: 1, sides: 6, bonus: 0 }
    ]
  },
  {
    id: "bastion",
    name: "Bastion",
    cost: 3,
    category: "Standard",
    description: "An impenetrable wall followed by a heavy counterstrike.",
    dice: [
      { id: "d1", type: "Defensive", allowedTypes: ["Block"], defaultType: "Block", count: 1, sides: 10, bonus: 4 },
      { id: "d2", type: "Offensive", allowedTypes: ["Slash", "Pierce", "Blunt"], defaultType: "Blunt", count: 1, sides: 8, bonus: 2 }
    ]
  }
];

// Attach to window for standalone compatibility
window.SKILL_BASES = SKILL_BASES;
