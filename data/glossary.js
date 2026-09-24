// Stars of the City TTRPG - Glossary & Rules Reference Data
// Contains descriptions for Affinities, Buffs, Debuffs, Boons, Ailments, Triggers, and Special Statuses

const GLOSSARY = {
  buffs: [
    { name: "Strength", type: "Buff", desc: "Increase the Power of all Offensive Dice by this value. Removed at the end of the scene." },
    { name: "Endurance", type: "Buff", desc: "Increase the Power of all Defensive Dice by this value. Removed at the end of the scene." },
    { name: "Protection", type: "Buff", desc: "Damage affinities have -1 for every Protection when taking damage (even while staggered). Removed at end of scene." },
    { name: "Resolve", type: "Buff", desc: "Stagger affinities have -1 for every Resolve when taking stagger. Removed at end of scene." },
    { name: "Haste", type: "Buff", desc: "At the start of next scene, increase the value of all Speed Dice by this value, then remove all Haste." }
  ],
  debuffs: [
    { name: "Feeble", type: "Debuff", desc: "Decrease the Power of all Offensive Dice by this value. Removed at the end of the scene." },
    { name: "Disarm", type: "Debuff", desc: "Decrease the Power of all Defensive Dice by this value. Removed at the end of the scene." },
    { name: "Fragile", type: "Debuff", desc: "Damage affinities have +1 for every Fragile when taking damage. Increases Bleed cap by 1. Removed at end of scene." },
    { name: "Vulnerable", type: "Debuff", desc: "Stagger affinities have +1 for every Vulnerable when taking stagger. Removed at end of scene." },
    { name: "Bind", type: "Debuff", desc: "At the start of next scene, reduce all Speed Dice by this value (min 1), then remove all Bind." }
  ],
  boons: [
    { name: "Charge", type: "Boon", desc: "Spend 1 Charge before rolling a die to roll with Advantage. Also consumed as a resource for modules/skills." },
    { name: "Aggro", type: "Boon", desc: "Add Aggro to Speed Die to intercept. If opposing Speed <= Aggro, intercept without spending a Speed Die. Halved at end of scene." },
    { name: "Thorns", type: "Boon", desc: "When hit, attacker takes damage = Thorns (doubled on incoming Crit). Removed at the end of the scene." },
    { name: "Safeguard", type: "Boon", desc: "When gaining a Debuff or Ailment, automatically nullify 1 full stack and reduce Safeguard by 1." },
    { name: "Poise", type: "Boon", desc: "Before rolling a die, spend Poise equal to half the max die face (e.g. 3 for d6, 4 for d8) to take the maximum roll." }
  ],
  ailments: [
    { name: "Burn", type: "Ailment", desc: "At the end of the scene, take damage = Burn on self, then halve the Count." },
    { name: "Bleed", type: "Ailment", desc: "When using an Offensive die, take damage = Bleed and reduce by 1. At end of scene, take damage = Bleed and halve Count (Cap: 5 + Fragile)." },
    { name: "Tremor", type: "Ailment", desc: "Does nothing on its own. When Tremor Burst triggers, take Stagger = Tremor value (Cap: 30)." },
    { name: "Sinking", type: "Ailment", desc: "At end of scene, take Stagger = Sinking and reduce Emotion Points by half of Sinking, then halve Sinking." },
    { name: "Paralyze", type: "Ailment", desc: "When rolling a die, automatically take minimum value and cannot reroll, then reduce Paralyze by 1. Cancels Poise." }
  ],
  triggers: [
    { name: "Tremor Burst", type: "Trigger", desc: "Target takes Stagger damage equal to their current Tremor value." },
    { name: "Blaze", type: "Trigger", desc: "Inflict 1 + (Burn/5) to all target's allies with less Burn than them (or +1 Burn to target if alone)." },
    { name: "Sinking Deluge", type: "Trigger", desc: "Target takes Stagger = 3x Sinking, then removes all Sinking. Every 3 excess Stagger past 0 deals 2 direct damage." },
    { name: "Revival", type: "Trigger", desc: "Defeated character revives next scene with 30 HP, half max Stagger Resist, 3 Light and no active EGO passives." }
  ],
  tags: [
    { name: "[On Use]", type: "Tag", desc: "Applies immediately when the skill is chosen, before any Dice are rolled." },
    { name: "[After Use]", type: "Tag", desc: "Applies after all Dice have been used, regardless of defensive dice remaining." },
    { name: "[Clash Win]", type: "Tag", desc: "Triggers effects when this Die wins a clash." },
    { name: "[Clash Lose]", type: "Tag", desc: "Triggers effects when this Die loses a clash." },
    { name: "[Hit]", type: "Tag", desc: "Applies when an Offensive Die deals damage to an enemy." },
    { name: "[Crit]", type: "Tag", desc: "Applies when an Offensive Die damages an enemy and rolls its maximum possible value." },
    { name: "[Check]", type: "Tag", desc: "A condition checked when rolling the die to grant Power or special bonuses." },
    { name: "[On Evade]", type: "Tag", desc: "Triggers when an Evade Die wins or ties against an Offensive Die." },
    { name: "[On Kill]", type: "Tag", desc: "Applies when this skill reduces an enemy to 0 HP." },
    { name: "[On Stagger]", type: "Tag", desc: "Applies when this skill reduces an enemy to 0 Stagger Resist." },
    { name: "[Eminence]", type: "Tag", desc: "Ongoing effect active from when skill is declared until it concludes." },
    { name: "[Proactive]", type: "Tag", desc: "Triggers when used proactively on your turn rather than reacting to an enemy." },
    { name: "[Reactive]", type: "Tag", desc: "Triggers when intercepting for an ally or reacting to an enemy attack." },
    { name: "[Limit X Uses]", type: "Tag", desc: "Can be used X times per mission before needing recharge." },
    { name: "[Exhaust]", type: "Tag", desc: "Triggers when the final use of a [Limit] skill is spent." }
  ],
  specialStatuses: [
    { name: "Barrier", type: "Special Boon", desc: "Max 30. Absorbs damage in place of Hit Points from skills or statuses." },
    { name: "Stealth", type: "Special Boon", desc: "Cannot be targeted except when enemy directly responds, attacks cannot be redirected." },
    { name: "Time Moratorium", type: "Special Status", desc: "All Buffs, Debuffs, Boons and Ailments have no effect and do not tick down. Removed at scene start." },
    { name: "Nails", type: "Special Ailment", desc: "Max 3. Increases Bleed Cap by 1 each. Prevents Bleed from reducing at end of scene." },
    { name: "Trap Set", type: "Special Status", desc: "If Bind >= 5, target loses Stagger Resist equal to Bind and Trap Set is consumed." },
    { name: "Shattered", type: "Special Debuff", desc: "All Damage Affinities +1, Stagger Affinities +2, Tremor Cap increased by +5." }
  ]
};

window.GLOSSARY = GLOSSARY;
