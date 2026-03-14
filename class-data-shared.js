/**
 * Shared Class Data
 * 
 * This module contains class data that is common to both OSE Standard and Smoothified Mode.
 * Mode-specific data (saving throws, attack bonuses, XP, etc.) is in class-data-ose.js and class-data-gygar.js.
 */

// Class descriptions and basic info
export const CLASS_INFO = {
  Cleric: {
    name: "Cleric",
    description: "Clerics are adventurers sworn to the service of a deity. They are trained for battle and channel the power of their deity.",
    primeRequisite: "WIS",
    hitDieType: "d6",
    armor: ["Leather", "Chain mail", "Plate mail", "Shield"],
    armorDescription: "Any, including shields",
    weapons: ["Club", "Mace", "Sling", "Staff", "War hammer"],
    weaponDescription: "Any blunt weapons",
    languages: ["Alignment", "Common"],
    availableIn: {
      basic: true,   // Available in Basic Mode (Human only)
      advanced: true // Available in Advanced Mode (Human, Dwarf, Gnome)
    },
    availableRaces: {
      basic: ["Human"],
      advanced: ["Human", "Dwarf", "Gnome"]
    },
    requirements: {
      Human: {},
      Dwarf: { WIS: 9 },
      Gnome: { WIS: 9 }
    }
  },

  Fighter: {
    name: "Fighter",
    description: "Fighters are adventurers dedicated to mastering the arts of combat and war. In a group of adventurers, the role of fighters is to battle monsters and to defend other characters.",
    primeRequisite: "STR",
    hitDieType: "d8",
    armor: ["Leather", "Chain mail", "Plate mail", "Shield"],
    armorDescription: "Any, including shields",
    weapons: ["Battle axe", "Club", "Crossbow", "Dagger", "Hand axe", "Javelin", "Lance", "Long bow", "Mace", "Pole arm", "Short bow", "Short sword", "Silver dagger", "Sling", "Spear", "Staff", "Sword", "Torch", "Two-handed sword", "War hammer"],
    weaponDescription: "Any",
    languages: ["Alignment", "Common"],
    availableIn: {
      basic: true,   // Available in Basic Mode (Human only)
      advanced: true // Available in Advanced Mode (all races)
    },
    availableRaces: {
      basic: ["Human"],
      advanced: ["Human", "Dwarf", "Elf", "Halfling", "Gnome"]
    },
    requirements: {
      Human: {},
      Dwarf: {},
      Elf: {},
      Halfling: {},
      Gnome: {}
    }
  },

  "Magic-User": {
    name: "Magic-User",
    description: "Magic-users are adventurers who study arcane secrets and cast spells. Magic-users are able to cast a greater number of increasingly powerful spells as they advance in level.",
    primeRequisite: "INT",
    hitDieType: "d4",
    armor: [],
    armorDescription: "None",
    weapons: ["Dagger", "Staff"],
    weaponDescription: "Dagger only",
    languages: ["Alignment", "Common"],
    availableIn: {
      basic: true,   // Available in Basic Mode (Human only)
      advanced: true // Available in Advanced Mode (Human, Elf)
    },
    availableRaces: {
      basic: ["Human"],
      advanced: ["Human", "Elf"]
    },
    requirements: {
      Human: {},
      Elf: {}
    }
  },

  Thief: {
    name: "Thief",
    description: "Thieves are adventurers who live by their skills of deception and stealth. They have a range of specialised adventuring skills unavailable to other characters.",
    primeRequisite: "DEX",
    hitDieType: "d4",
    armor: ["Leather"],
    armorDescription: "Leather only, no shields",
    weapons: ["Battle axe", "Club", "Crossbow", "Dagger", "Hand axe", "Javelin", "Lance", "Long bow", "Mace", "Pole arm", "Short bow", "Short sword", "Silver dagger", "Sling", "Spear", "Staff", "Sword", "Torch", "Two-handed sword", "War hammer"],
    weaponDescription: "Any",
    languages: ["Alignment", "Common"],
    availableIn: {
      basic: true,   // Available in Basic Mode (Human only)
      advanced: true // Available in Advanced Mode (Human, Halfling, Gnome)
    },
    availableRaces: {
      basic: ["Human"],
      advanced: ["Human", "Halfling", "Gnome"]
    },
    requirements: {
      Human: {},
      Halfling: {},
      Gnome: {}
    },
    abilityScoreAdjustments: {
      note: "During character creation, thieves may not lower STR"
    }
  },

  Spellblade: {
    name: "Spellblade",
    description: "Spellblades are adventurers who combine martial prowess with arcane magic. They can fight in armor while casting spells, making them versatile combatants.",
    primeRequisite: "INT and STR",
    hitDieType: "d6",
    armor: ["Leather", "Chain mail", "Plate mail", "Shield"],
    armorDescription: "Any, including shields",
    weapons: ["Battle axe", "Club", "Crossbow", "Dagger", "Hand axe", "Javelin", "Lance", "Long bow", "Mace", "Pole arm", "Short bow", "Short sword", "Silver dagger", "Sling", "Spear", "Staff", "Sword", "Torch", "Two-handed sword", "War hammer"],
    weaponDescription: "Any",
    languages: ["Alignment", "Common"],
    availableIn: {
      basic: true,   // Available in Basic Mode (Human only)
      advanced: true // Available in Advanced Mode (Human, Elf)
    },
    availableRaces: {
      basic: ["Human"],
      advanced: ["Human", "Elf"]
    },
    requirements: {
      Human: { INT: 9, STR: 9 },
      Elf: { INT: 9, STR: 9 }
    }
  },

  Dwarf: {
    name: "Dwarf",
    description: "Dwarves are stout, bearded demihumans who average a height of approximately 4' and weigh about 150 pounds. Dwarves typically live in underground strongholds and have a great love of fine craftsmanship, gold, and warfare.",
    primeRequisite: "STR",
    hitDieType: "d8",
    armor: ["Leather", "Chain mail", "Plate mail", "Shield"],
    armorDescription: "Any appropriate to size, including shields",
    weapons: ["Battle axe", "Club", "Crossbow", "Dagger", "Hand axe", "Javelin", "Lance", "Mace", "Pole arm", "Short bow", "Short sword", "Silver dagger", "Sling", "Spear", "Staff", "Sword", "Torch", "War hammer"],
    weaponDescription: "Any, but not longbows or two-handed swords",
    weaponRestrictions: "Cannot use Long bow or Two-handed sword (too large)",
    languages: ["Alignment", "Common", "Dwarvish", "Gnomish", "Goblin", "Kobold"],
    availableIn: {
      basic: true,    // Available in Basic Mode (race-as-class)
      advanced: false // NOT available in Advanced Mode (use Dwarf race + other classes)
    },
    availableRaces: {
      basic: ["Dwarf"],
      advanced: ["Dwarf"]
    },
    requirements: {
      Dwarf: { CON: 9 }
    }
  },

  Elf: {
    name: "Elf",
    description: "Elves are slender, fey demihumans with pointed ears. They typically weigh about 120 pounds and are between 5 and 5½ feet tall. Elves are seldom met in human settlements, preferring to feast and make merry in the woods.",
    primeRequisite: "INT and STR",
    hitDieType: "d6",
    armor: ["Leather", "Chain mail", "Plate mail", "Shield"],
    armorDescription: "Any, including shields",
    weapons: ["Battle axe", "Club", "Crossbow", "Dagger", "Hand axe", "Javelin", "Lance", "Long bow", "Mace", "Pole arm", "Short bow", "Short sword", "Silver dagger", "Sling", "Spear", "Staff", "Sword", "Torch", "Two-handed sword", "War hammer"],
    weaponDescription: "Any",
    languages: ["Alignment", "Common", "Elvish", "Gnoll", "Hobgoblin", "Orcish"],
    availableIn: {
      basic: true,    // Available in Basic Mode (race-as-class)
      advanced: false // NOT available in Advanced Mode (use Elf race + other classes)
    },
    availableRaces: {
      basic: ["Elf"],
      advanced: ["Elf"]
    },
    requirements: {
      Elf: { INT: 9 }
    }
  },

  Halfling: {
    name: "Halfling",
    description: "Halflings are small, rotund demihumans with curly hair on their heads and feet. They weigh about 60 pounds and are around 3' tall. Halflings are a friendly and welcoming folk. Above all, they love the comforts of home and are not known for their bravery.",
    primeRequisite: "DEX and STR",
    hitDieType: "d6",
    armor: ["Leather", "Chain mail", "Plate mail", "Shield"],
    armorDescription: "Any appropriate to size, including shields",
    weapons: ["Battle axe", "Club", "Crossbow", "Dagger", "Hand axe", "Javelin", "Lance", "Mace", "Pole arm", "Short bow", "Short sword", "Silver dagger", "Sling", "Spear", "Staff", "Sword", "Torch", "War hammer"],
    weaponDescription: "Any appropriate to size, but not longbows or two-handed swords",
    weaponRestrictions: "Weapons must be appropriate to size",
    armorRestrictions: "Armor must be appropriate to size",
    languages: ["Alignment", "Common", "Halfling"],
    availableIn: {
      basic: true,    // Available in Basic Mode (race-as-class)
      advanced: false // NOT available in Advanced Mode (use Halfling race + other classes)
    },
    availableRaces: {
      basic: ["Halfling"],
      advanced: ["Halfling"]
    },
    requirements: {
      Halfling: { CON: 9, DEX: 9 }
    }
  },

  Gnome: {
    name: "Gnome",
    description: "Gnomes are small, inquisitive demihumans with a love of illusion magic and tinkering. They average 3½' tall and weigh about 100 pounds. Gnomes are curious and inventive, often found in underground workshops or hidden forest glades.",
    primeRequisite: "INT",
    hitDieType: "d4",
    armor: ["Leather", "Chain mail", "Plate mail", "Shield"],
    armorDescription: "Any appropriate to size, including shields",
    weapons: ["Battle axe", "Club", "Crossbow", "Dagger", "Hand axe", "Javelin", "Lance", "Mace", "Pole arm", "Short bow", "Short sword", "Silver dagger", "Sling", "Spear", "Staff", "Sword", "Torch", "War hammer"],
    weaponDescription: "Any appropriate to size, but not longbows or two-handed swords",
    weaponRestrictions: "Cannot use Long bow or Two-handed sword (too large)",
    armorRestrictions: "Armor must be appropriate to size",
    languages: ["Alignment", "Common", "Dwarvish", "Gnomish", "Kobold", "Burrowing mammals"],
    availableIn: {
      basic: true,    // Available in Basic Mode (race-as-class)
      advanced: false // NOT available in Advanced Mode (use Gnome race + other classes)
    },
    availableRaces: {
      basic: ["Gnome"],
      advanced: ["Gnome"]
    },
    requirements: {
      Gnome: { CON: 9, INT: 9 }
    }
  }
};

// XP bonus for prime requisites
export const XP_BONUS = {
  "3-5": -0.20,
  "6-8": -0.10,
  "9-12": 0,
  "13-15": 0.05,
  "16-18": 0.10
};

// Class abilities (non-level-dependent descriptions)
export const CLASS_ABILITIES = {
  Cleric: [
    {
      name: "Turn Undead",
      description: "Clerics can invoke the power of their deity to repel undead monsters. Roll 2d6 and consult the turning table.",
      availableAt: 1
    },
    {
      name: "Divine Magic",
      description: "Clerics can pray to receive divine spells. Spell casting begins at 2nd level.",
      availableAt: 2
    },
    {
      name: "Holy Symbol",
      description: "A cleric must carry a holy symbol to cast spells.",
      availableAt: 2
    },
    {
      name: "Magical Research",
      description: "A cleric may spend time and money on magical research to create new spells or magical effects.",
      availableAt: 1
    },
    {
      name: "Magic Item Creation",
      description: "A cleric can create magic items.",
      availableAt: 9
    },
    {
      name: "Stronghold",
      description: "A cleric may construct a stronghold. If in deity's favor, costs are halved. Attracts 5d6×10 fighters (level 1-2) as followers.",
      availableAt: 9
    }
  ],

  Fighter: [
    {
      name: "Combat Machine",
      description: "Fighters have the best attack progression and can use any weapon and armor.",
      availableAt: 1
    },
    {
      name: "Stronghold",
      description: "A fighter may construct a stronghold (typically a castle). Attracts soldiers and other followers.",
      availableAt: 9
    }
  ],

  "Magic-User": [
    {
      name: "Arcane Magic",
      description: "Magic-users study arcane secrets and cast spells from their spellbook.",
      availableAt: 1
    },
    {
      name: "Magical Research",
      description: "A magic-user may spend time and money on magical research to create new spells or magical effects.",
      availableAt: 1
    },
    {
      name: "Magic Item Creation",
      description: "A magic-user can create magic items.",
      availableAt: 9
    },
    {
      name: "Stronghold",
      description: "A magic-user may construct a stronghold (typically a tower). Attracts apprentices and other followers.",
      availableAt: 9
    }
  ],

  Thief: [
    {
      name: "Back-stab",
      description: "When attacking an unaware opponent from behind, +4 to hit and double damage.",
      availableAt: 1
    },
    {
      name: "Thief Skills",
      description: "Thieves have special skills: Climb Sheer Surfaces, Find/Remove Traps, Hear Noise, Hide in Shadows, Move Silently, Open Locks, Pick Pockets.",
      availableAt: 1
    },
    {
      name: "Read Languages",
      description: "80% chance to read non-magical text in any language (including dead languages and basic codes).",
      availableAt: 4
    },
    {
      name: "Scroll Use",
      description: "Can cast arcane spells from scrolls (10% chance of error).",
      availableAt: 10
    },
    {
      name: "Hideout",
      description: "A thief may construct a secret hideout. Attracts 2d6 apprentice thieves (level 1) as followers.",
      availableAt: 9
    }
  ],

  Spellblade: [
    {
      name: "Arcane Magic",
      description: "Spellblades can cast arcane spells while wearing armor.",
      availableAt: 1
    },
    {
      name: "Combat Training",
      description: "Spellblades can use any weapon and armor, combining martial and magical abilities.",
      availableAt: 1
    },
    {
      name: "Magical Research",
      description: "A spellblade may spend time and money on magical research.",
      availableAt: 1
    },
    {
      name: "Magic Item Creation",
      description: "A spellblade can create magic items.",
      availableAt: 9
    }
  ],

  Dwarf: [
    {
      name: "Detect Construction Tricks",
      description: "2-in-6 chance to detect traps, false walls, hidden construction, or sloping passages.",
      availableAt: 1
    },
    {
      name: "Detect Room Traps",
      description: "2-in-6 chance to detect non-magical room traps when searching.",
      availableAt: 1
    },
    {
      name: "Infravision",
      description: "60' infravision.",
      availableAt: 1
    },
    {
      name: "Listen at Doors",
      description: "2-in-6 chance to hear noises.",
      availableAt: 1
    },
    {
      name: "Resilience",
      description: "Bonus to saves vs Death/Wands/Spells based on CON (7-10: +2, 11-14: +3, 15-17: +4, 18: +5).",
      availableAt: 1
    },
    {
      name: "Stronghold",
      description: "A dwarf may construct an underground stronghold. Attracts dwarf followers.",
      availableAt: 9
    }
  ],

  Elf: [
    {
      name: "Arcane Magic",
      description: "Elves can cast arcane spells.",
      availableAt: 1
    },
    {
      name: "Detect Secret Doors",
      description: "2-in-6 chance when actively searching, 1-in-6 chance when just passing by.",
      availableAt: 1
    },
    {
      name: "Immunity to Ghoul Paralysis",
      description: "Elves are immune to the paralysis attack of ghouls.",
      availableAt: 1
    },
    {
      name: "Infravision",
      description: "60' infravision.",
      availableAt: 1
    },
    {
      name: "Listen at Doors",
      description: "2-in-6 chance to hear noises.",
      availableAt: 1
    },
    {
      name: "Stronghold",
      description: "An elf may construct a stronghold in the woods. Attracts elf followers.",
      availableAt: 9
    }
  ],

  Halfling: [
    {
      name: "Combat Bonuses",
      description: "+1 to missile attack rolls, +2 AC vs large opponents.",
      availableAt: 1
    },
    {
      name: "Hiding",
      description: "In woods or undergrowth, can hide with 90% chance of success. Must be motionless.",
      availableAt: 1
    },
    {
      name: "Initiative Bonus",
      description: "+1 to initiative rolls (optional rule).",
      availableAt: 1
    },
    {
      name: "Listen at Doors",
      description: "2-in-6 chance to hear noises.",
      availableAt: 1
    },
    {
      name: "Resilience",
      description: "Bonus to saves vs Death/Wands/Spells/Rods/Staves based on CON (same as Dwarf).",
      availableAt: 1
    },
    {
      name: "Stronghold",
      description: "A halfling may construct a stronghold. Attracts halfling followers.",
      availableAt: 9
    }
  ],

  Gnome: [
    {
      name: "Illusion Magic",
      description: "Gnomes can cast illusionist spells.",
      availableAt: 1
    },
    {
      name: "Detect Construction Tricks",
      description: "2-in-6 chance to detect traps, false walls, hidden construction, or sloping passages.",
      availableAt: 1
    },
    {
      name: "Infravision",
      description: "90' infravision.",
      availableAt: 1
    },
    {
      name: "Listen at Doors",
      description: "2-in-6 chance to hear noises.",
      availableAt: 1
    },
    {
      name: "Combat Bonus",
      description: "+2 AC vs large opponents.",
      availableAt: 1
    },
    {
      name: "Magic Resistance",
      description: "Bonus to saves vs spells/wands/rods/staves based on CON (7-10: +2, 11-14: +3, 15-17: +4, 18: +5).",
      availableAt: 1
    },
    {
      name: "Stronghold",
      description: "A gnome may construct an underground stronghold. Attracts gnome followers.",
      availableAt: 9
    }
  ]
};

// Helper function to get class info
export function getClassInfo(className) {
  return CLASS_INFO[className] || null;
}

// Helper function to get class abilities
export function getClassAbilities(className) {
  return CLASS_ABILITIES[className] || [];
}

// Helper function to get abilities available at a specific level
export function getAbilitiesAtLevel(className, level) {
  const abilities = CLASS_ABILITIES[className] || [];
  return abilities.filter(ability => ability.availableAt <= level);
}

// Helper function to calculate XP bonus from prime requisite
export function calculateXPBonus(score) {
  if (score >= 3 && score <= 5) return XP_BONUS["3-5"];
  if (score >= 6 && score <= 8) return XP_BONUS["6-8"];
  if (score >= 9 && score <= 12) return XP_BONUS["9-12"];
  if (score >= 13 && score <= 15) return XP_BONUS["13-15"];
  if (score >= 16 && score <= 18) return XP_BONUS["16-18"];
  return 0;
}

// Helper function to check if a race can take a class
export function canRaceTakeClass(className, race, mode = "basic") {
  const classInfo = CLASS_INFO[className];
  if (!classInfo) return false;
  
  const availableRaces = classInfo.availableRaces[mode] || [];
  return availableRaces.includes(race);
}

// Helper function to check if ability requirements are met
export function meetsRequirements(className, race, abilityScores) {
  const classInfo = CLASS_INFO[className];
  if (!classInfo) return false;
  
  const requirements = classInfo.requirements[race];
  if (!requirements) return false;
  
  for (const [ability, minScore] of Object.entries(requirements)) {
    if (abilityScores[ability] < minScore) {
      return false;
    }
  }
  
  return true;
}

// ============================================================================
// HIT DICE PROGRESSIONS (Shared across all modes)
// ============================================================================
// After 9th level, CON modifiers no longer apply (marked with *)
// The number after the underscore indicates HP gain per level after 9th

export const HIT_DICE_PROGRESSIONS = {
  // d8 progression: +2 HP per level after 9th (Fighter)
  D8_2: ["1d8", "2d8", "3d8", "4d8", "5d8", "6d8", "7d8", "8d8", "9d8", "9d8+2*", "9d8+4*", "9d8+6*", "9d8+8*", "9d8+10*"],
  // d8 progression: +3 HP per level after 9th (Dwarf)
  D8_3: ["1d8", "2d8", "3d8", "4d8", "5d8", "6d8", "7d8", "8d8", "9d8", "9d8+3*", "9d8+6*", "9d8+9*"],
  // d6 progression: +1 HP per level after 9th (Cleric, Halfling)
  D6_1: ["1d6", "2d6", "3d6", "4d6", "5d6", "6d6", "7d6", "8d6", "9d6", "9d6+1*", "9d6+2*", "9d6+3*", "9d6+4*", "9d6+5*"],
  // d6 progression: +2 HP per level after 9th (Elf, Spellblade extended to 14)
  D6_2: ["1d6", "2d6", "3d6", "4d6", "5d6", "6d6", "7d6", "8d6", "9d6", "9d6+2*", "9d6+4*", "9d6+6*", "9d6+8*", "9d6+10*"],
  // d4 progression: +1 HP per level after 9th (Magic-User, Gnome)
  D4_1: ["1d4", "2d4", "3d4", "4d4", "5d4", "6d4", "7d4", "8d4", "9d4", "9d4+1*", "9d4+2*", "9d4+3*", "9d4+4*", "9d4+5*"],
  // d4 progression: +2 HP per level after 9th (Thief)
  D4_2: ["1d4", "2d4", "3d4", "4d4", "5d4", "6d4", "7d4", "8d4", "9d4", "9d4+2*", "9d4+4*", "9d4+6*", "9d4+8*", "9d4+10*"]
};

// ============================================================================
// SPELL SLOTS (Shared across all modes)
// ============================================================================
// Arcane spell progression (used by Magic-User, Elf, Spellblade, Gnome)
// Each class uses this progression but stops at different levels

export const ARCANE_SPELL_SLOTS = {
  1: [1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4],
  2: [0, 0, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4],
  3: [0, 0, 0, 0, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4],
  4: [0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 3, 3, 3, 4],
  5: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 3, 3],
  6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3]
};

// Divine spell progression (used by Cleric)
export const DIVINE_SPELL_SLOTS = {
  1: [0, 1, 2, 2, 2, 2, 2, 3, 3, 4, 4, 5, 5, 6],
  2: [0, 0, 0, 1, 2, 2, 2, 3, 3, 4, 4, 5, 5, 5],
  3: [0, 0, 0, 0, 0, 1, 2, 2, 3, 3, 4, 4, 5, 5],
  4: [0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5],
  5: [0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4]
};

// ============================================================================
// THIEF SKILLS (Shared across all modes)
// ============================================================================
// Skills: Climb Sheer Surfaces, Find/Remove Traps, Hear Noise, Hide in Shadows,
//         Move Silently, Open Locks, Pick Pockets
// Note: Hear Noise is a 1d6 roll (1-2, 1-3, etc.), others are percentile

export const THIEF_SKILLS = {
  climbSheerSurfaces: [87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 99],
  findRemoveTraps: [10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 95, 97, 99],
  hearNoise: [2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5], // 1-2, 1-3, 1-4, 1-5 on 1d6
  hideInShadows: [10, 15, 20, 25, 30, 36, 45, 55, 65, 75, 85, 90, 95, 99],
  moveSilently: [20, 25, 30, 35, 40, 45, 55, 65, 75, 85, 95, 96, 98, 99],
  openLocks: [15, 20, 25, 30, 35, 45, 55, 65, 75, 85, 95, 96, 97, 99],
  pickPockets: [20, 25, 30, 35, 40, 45, 55, 65, 75, 85, 95, 105, 115, 125]
};

// ============================================================================
// TURN UNDEAD TABLE (Shared across all modes)
// ============================================================================
// Rows: Cleric levels 1-11+ (11 rows)
// Columns: Undead types by HD (1 HD, 2 HD, 2* HD, 3 HD, 4 HD, 5 HD, 6 HD, 7-9 HD)
// Values: Number needed on 2d6, "T" = automatic turn, "D" = automatic destroy, null = cannot turn

export const TURN_UNDEAD = {
  1: { "1HD": 7, "2HD": 9, "2*HD": 11, "3HD": null, "4HD": null, "5HD": null, "6HD": null, "7-9HD": null },
  2: { "1HD": "T", "2HD": 7, "2*HD": 9, "3HD": 11, "4HD": null, "5HD": null, "6HD": null, "7-9HD": null },
  3: { "1HD": "T", "2HD": "T", "2*HD": 7, "3HD": 9, "4HD": 11, "5HD": null, "6HD": null, "7-9HD": null },
  4: { "1HD": "D", "2HD": "T", "2*HD": "T", "3HD": 7, "4HD": 9, "5HD": 11, "6HD": null, "7-9HD": null },
  5: { "1HD": "D", "2HD": "D", "2*HD": "T", "3HD": "T", "4HD": 7, "5HD": 9, "6HD": 11, "7-9HD": null },
  6: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "T", "4HD": "T", "5HD": 7, "6HD": 9, "7-9HD": 11 },
  7: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "D", "4HD": "T", "5HD": "T", "6HD": 7, "7-9HD": 9 },
  8: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "D", "4HD": "D", "5HD": "T", "6HD": "T", "7-9HD": 7 },
  9: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "D", "4HD": "D", "5HD": "D", "6HD": "T", "7-9HD": "T" },
  10: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "D", "4HD": "D", "5HD": "D", "6HD": "D", "7-9HD": "T" },
  11: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "D", "4HD": "D", "5HD": "D", "6HD": "D", "7-9HD": "D" }
};


// ============================================================================
// XP REQUIREMENTS BY CLASS (Shared across all modes)
// ============================================================================
// All classes can reach level 14 (except Spellblade at 10)
// Traditional "soft limits" for demihumans are preserved in saving throw plateaus

export const XP_REQUIREMENTS = {
  "Fighter_CLASS": [0, 2000, 4000, 8000, 16000, 32000, 64000, 120000, 240000, 360000, 480000, 600000, 720000, 840000],
  "Thief_CLASS": [0, 1200, 2400, 4800, 9600, 20000, 40000, 80000, 160000, 280000, 400000, 520000, 640000, 760000],
  "Magic-User_CLASS": [0, 2500, 5000, 10000, 20000, 40000, 80000, 150000, 300000, 450000, 600000, 750000, 900000, 1050000],
  "Cleric_CLASS": [0, 1500, 3000, 6000, 12000, 25000, 50000, 100000, 200000, 300000, 400000, 500000, 600000, 700000],
  "Spellblade_CLASS": [0, 4000, 8000, 16000, 32000, 64000, 120000, 250000, 400000, 600000, 800000, 1000000, 1200000, 1400000],  // Levels 11-14 added for optional extended progression (+200k per level)
  "Dwarf_CLASS": [0, 2200, 4400, 8800, 17000, 35000, 70000, 140000, 270000, 400000, 530000, 660000, 790000, 920000],
  "Elf_CLASS": [0, 4000, 8000, 16000, 32000, 64000, 120000, 250000, 400000, 600000, 800000, 1000000, 1200000, 1400000],  // Levels 11-14 added for optional extended progression
  "Halfling_CLASS": [0, 2000, 4000, 8000, 16000, 32000, 64000, 120000, 240000, 360000, 480000, 600000, 720000, 840000],
  "Gnome_CLASS": [0, 3000, 6000, 12000, 30000, 60000, 120000, 240000, 360000, 480000, 600000, 720000, 840000, 960000]
};

// ============================================================================
// HIT DICE SCALE MAPPING (Shared across all modes)
// ============================================================================
// Maps each class to its hit dice progression scale (from HIT_DICE_PROGRESSIONS)

export const HIT_DICE_SCALE = {
  "Fighter_CLASS": "D8_2",
  "Thief_CLASS": "D4_2",
  "Magic-User_CLASS": "D4_1",
  "Cleric_CLASS": "D6_1",
  "Spellblade_CLASS": "D6_2",
  "Dwarf_CLASS": "D8_2",
  "Elf_CLASS": "D6_2",
  "Halfling_CLASS": "D6_1",
  "Gnome_CLASS": "D4_1"
};

// ============================================================================
// SPELL SLOT SCALE MAPPING (Shared across all modes)
// ============================================================================
// Maps each spellcasting class to its spell slot progression
// Same for both OSE Standard and Smoothified Mode

export const SPELL_SLOT_SCALE = {
  "Cleric_CLASS": "DIVINE",
  "Magic-User_CLASS": "ARCANE",
  "Spellblade_CLASS": "ARCANE",
  "Elf_CLASS": "ARCANE",
  "Gnome_CLASS": "ARCANE"
};

// Export all for use in other modules
export default {
  CLASS_INFO,
  XP_BONUS,
  CLASS_ABILITIES,
  XP_REQUIREMENTS,
  HIT_DICE_PROGRESSIONS,
  HIT_DICE_SCALE,
  ARCANE_SPELL_SLOTS,
  DIVINE_SPELL_SLOTS,
  THIEF_SKILLS,
  TURN_UNDEAD,
  SPELL_SLOT_SCALE,
  getClassInfo,
  getClassAbilities,
  getAbilitiesAtLevel,
  calculateXPBonus,
  canRaceTakeClass,
  meetsRequirements
};
