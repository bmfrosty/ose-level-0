/**
 * Shared Class Data
 * 
 * This module contains class data that is common to both OSE Standard and Smoothified Mode.
 * Mode-specific data (saving throws, attack bonuses, XP, etc.) is in shared-class-data-ose.js and shared-class-data-gygar.js.
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

// Class abilities
//
// Fields:
//   name          — ability name (rendered as label when includeName is true)
//   description   — ability text
//   availableAt   — first level at which this entry applies
//   availableThrough — last level at which this entry applies; use a replacement entry
//                   with a higher availableAt when the description changes at a level.
//                   Default: 14 (max OSE level).
//   includeName   — if true (uncommented): rendered as "Name: description"
//                   if commented out (// includeName: false): renderer defaults to false,
//                   description rendered standalone (should be a self-contained sentence)
//   basicMode     — if false: entry is excluded from Basic mode sheets (Advanced mode only)
//
// SRD/BOOK comments show the source text.
// PROPOSED comments show the intended description for user review.
export const CLASS_ABILITIES = {

  // ── Cleric ─────────────────────────────────────────────────────────────────
  Cleric: [
    {
      name: "Combat",
      description: "Can use all armour; blunt weapons only (club, mace, sling, staff, war hammer).",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: "Clerics can use all types of armour. The edicts of their holy order forbid them from using weapons that have a sharp, cutting edge or stabbing point. They may use the following weapons: club, mace, sling, staff, war hammer."
      // PROPOSED: "Can use all armour; blunt weapons only (club, mace, sling, staff, war hammer)."
    },
    {
      name: "Holy Symbol",
      description: "A cleric must carry a holy symbol (see Adventuring Gear).",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: "A cleric must carry a holy symbol (see Adventuring Gear)."
      // PROPOSED: "A cleric must carry a holy symbol (see Adventuring Gear)."
    },
    {
      name: "Deity Disfavour",
      description: "Must be faithful to alignment, clergy, and religion; falling from deity's favour may incur penalties.",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: "Clerics must be faithful to the tenets of their alignment, clergy, and religion. Clerics who fall from favour with their deity may incur penalties."
      // PROPOSED: "Must be faithful to alignment, clergy, and religion; falling from deity's favour may incur penalties."
    },
    {
      name: "Magical Research",
      description: "Any level; create new spells or magical effects for the deity. At 9th level: also create magic items.",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: "A cleric of any level may spend time and money on magical research. This allows them to create new spells or other magical effects associated with their deity. When a cleric reaches 9th level, they are also able to create magic items."
      // PROPOSED: "Any level; create new spells or magical effects for the deity. At 9th level: also create magic items."
    },
    {
      name: "Turn Undead",
      description: "Invoke deity's power to repel undead encountered; roll 2d6 vs undead HD on turning table.",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: "Clerics can invoke the power of their deity to repel undead monsters encountered. To turn the undead, the player rolls 2d6. The referee then consults the table below, comparing the roll against the HD of the type of undead monsters targeted."
      // PROPOSED: "Invoke deity's power to repel undead encountered; roll 2d6 vs undead HD on turning table."
    },
    {
      name: "Spell Casting",
      description: "Once a cleric has proven their faith (from 2nd level), the character may pray to receive spells.",
      availableAt: 2,
      availableThrough: 14,
      // includeName: true,
      // SRD: "Once a cleric has proven their faith (from 2nd level), the character may pray to receive spells. The level progression table (below) shows the number of spells a cleric may memorize, based on their experience level."
      // PROPOSED: "Once a cleric has proven their faith (from 2nd level), the character may pray to receive spells."
    },
    {
      name: "Using Magic Items",
      description: "Use scrolls from cleric spell list and items restricted to divine casters (e.g. some magic staves).",
      availableAt: 2,
      availableThrough: 14,
      // includeName: true,
      // SRD: "As spell casters, clerics can use magic scrolls of spells on their spell list. They can also use items that may only be used by divine spell casters (e.g. some magic staves)."
      // PROPOSED: "Use scrolls from cleric spell list and items restricted to divine casters (e.g. some magic staves)."
    },
    {
      name: "Stronghold",
      description: "May build a stronghold; costs halved if in deity's favour. Attracts 5d6×10 devoted fighters (levels 1-2).",
      availableAt: 9,
      availableThrough: 14,
      // includeName: true,
      // SRD: "A cleric may construct a stronghold. If the cleric is in favour with their deity, the construction costs are halved, due to divine aid. When the stronghold is complete, 5d6 x 10 fighters of level 1-2 will arrive to serve the cleric. These followers are completely devoted to the cleric, never checking morale."
      // PROPOSED: "May build a stronghold; costs halved if in deity's favour. Attracts 5d6×10 devoted fighters (levels 1-2)."
    }
  ],

  // ── Fighter ────────────────────────────────────────────────────────────────
  Fighter: [
    {
      name: "Combat",
      description: "Fighters can use all types of weapons and armour.",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: "Fighters can use all types of weapons and armour."
      // PROPOSED: "Fighters can use all types of weapons and armour."
    },
    {
      name: "Stronghold",
      description: "May build a castle or stronghold and control surrounding lands; may receive a Baron/Baroness title.",
      availableAt: 9,
      availableThrough: 14,
      // includeName: true,
      // SRD: "Any time a fighter wishes (and has sufficient money), they can build a castle or stronghold and control the surrounding lands. A fighter may be granted a title such as Baron or Baroness. The land under the fighter's control is then known as a Barony."
      // PROPOSED: "May build a castle or stronghold and control surrounding lands; may receive a Baron/Baroness title."
    }
  ],

  // ── Magic-User ─────────────────────────────────────────────────────────────
  "Magic-User": [
    {
      name: "Arcane Magic",
      description: "Study of arcane lore; cast spells, conduct magical research, and wield powerful magic items.",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: "(section heading — details in sub-entries: Spell Casting, Magical Research, Using Magic Items)"
      // PROPOSED: "Study of arcane lore; cast spells, conduct magical research, and wield powerful magic items."
    },
    {
      name: "Spell Casting",
      description: "Own a spell book; memorize spells per day per level table. Start with 1 spell (referee's choice).",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: "Magic-users own spell books containing the formulae for arcane spells. The level progression table (below) shows both the number of spells in the magic-user's spell book and the number they may memorize. A 1st level magic-user has one spell in their spell book, selected by the referee (who may allow the player to choose)."
      // PROPOSED: "Own a spell book; memorize spells per day per level table. Start with 1 spell (referee's choice)."
    },
    {
      name: "Magical Research",
      description: "Any level; add spells to spell book or research magical effects. At 9th level: create magic items.",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: "A magic-user of any level may spend time and money on magical research. This allows them to add new spells to their spell book and to research other magical effects. When a magic-user reaches 9th level, they are also able to create magic items."
      // PROPOSED: "Any level; add spells to spell book or research magical effects. At 9th level: create magic items."
    },
    {
      name: "Using Magic Items",
      description: "Use scrolls from spell list and items restricted to arcane casters (e.g. magic wands).",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: "As spell casters, magic-users are able to use magic scrolls of spells on their spell list. They can also use items that may only be used by arcane spell casters (e.g. magic wands)."
      // PROPOSED: "Use scrolls from spell list and items restricted to arcane casters (e.g. magic wands)."
    },
    {
      name: "Combat",
      description: "Can only use daggers; cannot use shields or any armour.",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: "Magic-users can only use daggers and are unable to use shields or wear any kind of armour. This makes them very vulnerable in combat."
      // PROPOSED: "Can only use daggers; cannot use shields or any armour."
    },
    {
      name: "Stronghold",
      description: "May construct a stronghold (usually a tower); 1d6 apprentices of levels 1-3 arrive to study.",
      availableAt: 11,
      availableThrough: 14,
      // includeName: true,
      // SRD: "A magic-user may construct a stronghold (usually in the form of a tower). 1d6 apprentices of levels 1-3 will then arrive to study under the magic-user."
      // PROPOSED: "May construct a stronghold (usually a tower); 1d6 apprentices of levels 1-3 arrive to study."
    }
  ],

  // ── Thief ──────────────────────────────────────────────────────────────────
  Thief: [
    {
      name: "Combat",
      description: "Can only wear leather armour, no shields; can use any weapon.",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: "Valuing stealth above all, thieves can only wear leather armour and cannot use shields. They can use any weapon."
      // PROPOSED: "Can only wear leather armour, no shields; can use any weapon."
    },
    {
      name: "Back-stab",
      description: "When attacking an unaware opponent from behind, a thief receives a +4 bonus to hit and doubles any damage dealt.",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: "When attacking an unaware opponent from behind, a thief receives a +4 bonus to hit and doubles any damage dealt."
      // PROPOSED: "When attacking an unaware opponent from behind, a thief receives a +4 bonus to hit and doubles any damage dealt."
    },
    {
      name: "Thief Skills",
      description: "Climb sheer surfaces, find/remove traps, hear noise, hide in shadows, move silently, open locks, pick pockets.",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: "Thieves can use the following skills, with the chance of success shown below:" (CS, TR, HN, HS, MS, OL, PP — individual descriptions in Thief Skills section)
      // PROPOSED: "Climb sheer surfaces, find/remove traps, hear noise, hide in shadows, move silently, open locks, pick pockets."
    },
    {
      name: "Read Languages",
      description: "4th level or higher: 80% chance to read non-magical text in any language, including dead languages and codes.",
      availableAt: 4,
      availableThrough: 14,
      // includeName: true,
      // SRD: "A thief of 4th level or higher can read non-magical text in any language (including dead languages and basic codes) with 80% probability. If the roll fails, the thief may not try to read the same text again before gaining an experience level."
      // PROPOSED: "4th level or higher: 80% chance to read non-magical text in any language, including dead languages and codes."
    },
    {
      name: "Hideout",
      description: "Construct a secret hideout; attracts 2d6 loyal 1st-level apprentice thieves (potential Thieves' Guild).",
      availableAt: 9,
      availableThrough: 14,
      // includeName: true,
      // SRD: "A thief may construct a secret hideout, attracting 2d6 apprentice thieves of 1st level. Apprentices are usually loyal to the character, but are not automatically replaced if killed. The character may use their apprentices as the beginnings of a Thieves' Guild."
      // PROPOSED: "Construct a secret hideout; attracts 2d6 loyal 1st-level apprentice thieves (potential Thieves' Guild)."
    },
    {
      name: "Scroll Use",
      description: "10th level or higher: cast arcane spells from scrolls; 10% chance of unusual or deleterious effect.",
      availableAt: 10,
      availableThrough: 14,
      // includeName: true,
      // SRD: "A thief of 10th level or higher can cast arcane spells from scrolls. There is a 10% chance of error: an unusual or deleterious effect instead of the expected effect."
      // PROPOSED: "10th level or higher: cast arcane spells from scrolls; 10% chance of unusual or deleterious effect."
    }
  ],

  // ── Spellblade ─────────────────────────────────────────────────────────────
  // House-rules class — not in OSE SRD. Audit pending PLAN_RACE_ABILITIES_AUDIT.md Elf_RACE changes.
  // Intended to mirror Basic Elf class abilities minus racial features (Detect Secret Doors,
  // Immunity to Ghoul Paralysis, Infravision, Listening at Doors — those belong in Elf_RACE).
  Spellblade: [
    {
      name: "Arcane Magic",
      description: "Spellblades can cast arcane spells while wearing armor.",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: N/A (house rules class — mirror Elf class Arcane Magic)
      // PROPOSED: TBD (pending PLAN_RACE_ABILITIES_AUDIT.md Elf_RACE changes)
    },
    {
      name: "Combat Training",
      description: "Spellblades can use any weapon and armor, combining martial and magical abilities.",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: N/A (house rules class)
      // PROPOSED: TBD
    },
    {
      name: "Magical Research",
      description: "A spellblade may spend time and money on magical research.",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: N/A (house rules class — mirror Elf/Magic-User Magical Research)
      // PROPOSED: TBD (fold Magic Item Creation in at the appropriate level)
    },
    {
      name: "Magic Item Creation",
      description: "A spellblade can create magic items.",
      availableAt: 9,
      availableThrough: 14,
      // includeName: true,
      // SRD: N/A (house rules class — fold into Magical Research per plan)
      // PROPOSED: TBD (remove this entry once folded into Magical Research)
    }
  ],

  // ── Dwarf ──────────────────────────────────────────────────────────────────
  Dwarf: [
    {
      name: "Languages",
      description: "Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // SRD: stat block: "Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold"
      // PROPOSED: "Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold"
    },
    {
      name: "Combat",
      description: "Can use all types of armour; small or normal sized weapons only (no longbows or two-handed swords).",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // SRD: "Dwarves can use all types of armour. Their stature means they can only use small or normal sized weapons. They cannot use longbows or two-handed swords."
      // PROPOSED: "Can use all types of armour; small or normal sized weapons only (no longbows or two-handed swords)."
    },
    {
      name: "Detect Construction Tricks",
      description: "2-in-6 chance of detecting new construction, sliding walls, or sloping passages when searching.",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // SRD: "As expert miners, dwarves have a 2-in-6 chance of being able to detect new construction, sliding walls, or sloping passages when searching."
      // PROPOSED: "2-in-6 chance of detecting new construction, sliding walls, or sloping passages when searching."
    },
    {
      name: "Detect Room Traps",
      description: "2-in-6 chance of detecting non-magical room traps when searching.",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // SRD: "Due to their expertise with construction, dwarves have a 2-in-6 chance of detecting non-magical room traps when searching (see Dungeon Adventuring)."
      // PROPOSED: "2-in-6 chance of detecting non-magical room traps when searching."
    },
    {
      name: "Infravision",
      description: "60'",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // SRD: "Dwarves have infravision to 60' (see Darkness under Hazards and Challenges)."
      // PROPOSED: "60'"
    },
    {
      name: "Listening at Doors",
      description: "2-in-6 chance of hearing noises.",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // SRD: "Dwarves have a 2-in-6 chance of hearing noises (see Dungeon Adventuring)."
      // PROPOSED: "2-in-6 chance of hearing noises."
    },
    {
      name: "Resilience",
      description: "Bonus to saves vs Death/Wands/Spells based on CON (7-10: +2, 11-14: +3, 15-17: +4, 18: +5).",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      basicMode: false,
      // SRD: NOT a named class ability — CON save bonus is in the saving throw table header only.
      // PROPOSED: Keep for Advanced mode; basicMode: false suppresses it on Basic mode sheets.
    },
    {
      name: "Stronghold",
      description: "May construct a subterranean stronghold; other dwarves may come to establish a new clan.",
      availableAt: 9,
      availableThrough: 14,
      // includeName: true,
      // SRD: "A dwarf may construct a subterranean stronghold delved beneath hills or mountains. Other dwarves may come to live under the rule of the character, establishing a new clan."
      // PROPOSED: "May construct a subterranean stronghold; other dwarves may come to establish a new clan."
    }
  ],

  // ── Elf ────────────────────────────────────────────────────────────────────
  Elf: [
    {
      name: "Languages",
      description: "Alignment, Common, Elvish, Gnoll, Hobgoblin, Orcish",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // SRD: stat block: "Alignment, Common, Elvish, Gnoll, Hobgoblin, Orcish"
      // PROPOSED: "Alignment, Common, Elvish, Gnoll, Hobgoblin, Orcish"
    },
    {
      name: "Arcane Magic",
      description: "Elves can cast arcane spells and use magic scrolls and arcane wands.",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: "Elves cast spells as magic-users; carry spell books; can use magic scrolls and arcane wands." (section heading with Magical Research, Spell Casting, Using Magic Items sub-entries)
      // PROPOSED: "Elves can cast arcane spells and use magic scrolls and arcane wands."
    },
    {
      name: "Detect Secret Doors",
      description: "Elves have a 2-in-6 chance of locating secret or hidden doors when searching.",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // SRD: "Elves have a 2-in-6 chance of locating secret or hidden doors when searching (see Dungeon Adventuring)."
      // NOTE: 1-in-6 passive is the standard dungeon rule for ALL characters — not an Elf class ability.
      // PROPOSED: "Elves have a 2-in-6 chance of locating secret or hidden doors when searching."
    },
    {
      name: "Immunity to Ghoul Paralysis",
      description: "Elves are immune to the paralysing effect of ghouls' attacks.",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: "Elves are immune to the paralysing effect of ghouls' attacks."
      // PROPOSED: "Elves are immune to the paralysing effect of ghouls' attacks."
    },
    {
      name: "Infravision",
      description: "60'",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // SRD: "Elves have infravision to 60' (see Darkness under Hazards and Challenges)."
      // PROPOSED: "60'"
    },
    {
      name: "Listening at Doors",
      description: "2-in-6 chance of hearing noises.",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // SRD: "Elves have a 2-in-6 chance of hearing noises (see Dungeon Adventuring)."
      // PROPOSED: "2-in-6 chance of hearing noises."
    },
    {
      name: "Stronghold",
      description: "May construct a forest stronghold; forest animals within 5 miles become friendly.",
      availableAt: 9,
      availableThrough: 14,
      // includeName: true,
      // SRD: "An elf may construct a stronghold in the depths of the forest. Forest animals within a 5 mile radius will become friends with the elves. An elf ruler may only hire elven mercenaries."
      // PROPOSED: "May construct a forest stronghold; forest animals within 5 miles become friendly. May only hire elven mercenaries."
    }
  ],

  // ── Halfling ───────────────────────────────────────────────────────────────
  Halfling: [
    {
      name: "Languages",
      description: "Alignment, Common, Halfling",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // SRD: stat block: "Alignment, Common, Halfling"
      // PROPOSED: "Alignment, Common, Halfling"
    },
    {
      name: "Defensive Bonus",
      description: "+2 bonus to Armour Class when attacked by large opponents (greater than human-sized).",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: "Due to their small size, halflings gain a +2 bonus to Armour Class when attacked by large opponents (greater than human-sized)."
      // PROPOSED: "+2 bonus to Armour Class when attacked by large opponents (greater than human-sized)."
    },
    {
      name: "Hiding",
      description: "In woods or undergrowth, 90% chance; in dungeons, 2-in-6 (requires cover, motionless and silent).",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // SRD: "In woods or undergrowth, a halfling can hide with a 90% chance of success. In dungeons, a halfling can hide in normal lighting conditions with a 2-in-6 chance of success. There must be some form of cover (e.g. shadows) and the halfling must remain motionless and silent."
      // PROPOSED: "In woods or undergrowth, 90% chance; in dungeons, 2-in-6 (requires cover, motionless and silent)."
    },
    {
      name: "Initiative Bonus",
      description: "+1 to initiative rolls (optional rule).",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: "If using the optional rule for individual initiative (see Combat), halflings get a bonus of +1."
      // PROPOSED: "+1 to initiative rolls (optional rule)."
    },
    {
      name: "Listening at Doors",
      description: "2-in-6 chance of hearing noises.",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // SRD: "Halflings have a 2-in-6 chance of hearing noises (see Dungeon Adventuring)."
      // PROPOSED: "2-in-6 chance of hearing noises."
    },
    {
      name: "Missile Attack Bonus",
      description: "Halflings' accuracy grants them a +1 bonus to attack rolls with all missile weapons.",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // SRD: "Halflings' accuracy grants them a +1 bonus to attack rolls with all missile weapons."
      // PROPOSED: "Halflings' accuracy grants them a +1 bonus to attack rolls with all missile weapons."
    },
    {
      name: "Resilience",
      description: "Bonus to saves vs Death/Wands/Spells/Rods/Staves based on CON (same as Dwarf).",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      basicMode: false,
      // SRD: NOT a named class ability — CON save bonus is in the saving throw table only.
      // PROPOSED: Keep for Advanced mode; basicMode: false suppresses it on Basic mode sheets.
    },
    {
      name: "Stronghold",
      description: "May build a stronghold forming a new halfling community (Shire); the character becomes Sheriff.",
      availableAt: 9,
      availableThrough: 14,
      // includeName: true,
      // SRD: "Any time a halfling wishes (and has sufficient money), they may build a stronghold, which will form the basis of a new community of halflings. The leader of the community is called the Sheriff."
      // PROPOSED: "May build a stronghold forming a new halfling community (Shire); the character becomes Sheriff."
    }
  ],

  // ── Gnome ──────────────────────────────────────────────────────────────────
  // Source: OSE Advanced Fantasy p52-53. All descriptions reworded to avoid direct reproduction.
  Gnome: [
    {
      name: "Languages",
      description: "Alignment, Common, Gnomish, Dwarvish, Kobold, and the secret language of burrowing mammals",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // BOOK: "Languages: Alignment, Common, Gnomish, Dwarvish, Kobold, the secret language of burrowing mammals"
      // PROPOSED: "Alignment, Common, Gnomish, Dwarvish, Kobold, and the secret language of burrowing mammals"
    },
    {
      name: "Magical Research",
      description: "Add spells to spell book or research other effects; create magic items at 8th level.",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // BOOK: "A gnome of any level may spend time and money on magical research. This allows them to add new spells to their spell book and to research other magical effects. When a gnome reaches 8th level, they are also able to create magic items."
      // PROPOSED: "Add spells to spell book or research other effects; create magic items at 8th level."
    },
    {
      name: "Spell Casting",
      description: "Maintain arcane spell books; memorize spells per day per level table. Use illusionist spell list.",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // BOOK: "Gnomes carry spell books containing the formulae for arcane spells. The level progression table shows both the number of spells in the gnome's spell book and the number they may memorize. The list of spells available to gnomes is found on p130 (gnomes have the same spell selection as illusionists)."
      // PROPOSED: "Maintain arcane spell books; memorize spells per day per level table. Use illusionist spell list."
    },
    {
      name: "Using Magic Items",
      description: "May use scrolls from spell list and items restricted to arcane casters (e.g. magic wands).",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // BOOK: "As spell casters, gnomes are able to use magic scrolls of spells on their spell list. They can also use items that may only be used by arcane spell casters (e.g. magic wands)."
      // PROPOSED: "May use scrolls from spell list and items restricted to arcane casters (e.g. magic wands)."
    },
    {
      name: "Combat",
      description: "Leather armour and shields (sized for gnomes). Any small-sized weapon; no longbows or two-handed swords.",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // BOOK: "Gnomes can use leather armour and shields. Armour must be tailored to gnomes' small size. Similarly, they can use any weapon appropriate to their stature (as determined by the referee). They cannot use longbows or two-handed swords."
      // PROPOSED: "Leather armour and shields (sized for gnomes). Any small-sized weapon; no longbows or two-handed swords."
    },
    {
      name: "Defensive Bonus",
      description: "+2 bonus to Armour Class when attacked by large opponents (greater than human-sized).",
      availableAt: 1,
      availableThrough: 14,
      // includeName: true,
      // BOOK: "Due to their small size, gnomes gain a +2 bonus to Armour Class when attacked by large opponents (greater than human-sized)."
      // PROPOSED: "+2 bonus to Armour Class when attacked by large opponents (greater than human-sized)."
    },
    {
      name: "Detect Construction Tricks",
      description: "2-in-6 chance of detecting new construction, sliding walls, or sloping passages when searching.",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // BOOK: "As expert tunnellers, gnomes have a 2-in-6 chance of being able to detect new construction, sliding walls, or sloping passages when searching."
      // PROPOSED: "2-in-6 chance of detecting new construction, sliding walls, or sloping passages when searching."
    },
    {
      name: "Hiding",
      description: "Woodland cover 90%; dungeons 2-in-6 in shadows or behind cover; must remain motionless.",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // BOOK: "In woodland cover, a gnome can hide with a 90% chance of success. In dungeons, a gnome can hide in shadows or behind other forms of cover. The chance of success is 2-in-6. Hiding requires the gnome to be motionless."
      // PROPOSED: "Woodland cover 90%; dungeons 2-in-6 in shadows or behind cover; must remain motionless."
    },
    {
      name: "Infravision",
      description: "90'",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // BOOK: "Gnomes have infravision to 90' (see Darkness, p220)."
      // PROPOSED: "90'"
    },
    {
      name: "Listening at Doors",
      description: "2-in-6 chance of hearing noises.",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // BOOK: "Gnomes have a 2-in-6 chance of hearing noises (see Dungeon Adventuring, p222)."
      // PROPOSED: "2-in-6 chance of hearing noises."
    },
    {
      name: "Speak with Burrowing Mammals",
      description: "Know and speak the secret language of burrowing mammals (e.g. badgers, moles).",
      availableAt: 1,
      availableThrough: 14,
      includeName: true,
      // BOOK: "Gnomes often keep burrowing mammals such as badgers and moles as pets. They know the secret language of such creatures."
      // PROPOSED: "Know and speak the secret language of burrowing mammals (e.g. badgers, moles)."
    },
    {
      name: "Stronghold",
      description: "May construct an underground stronghold; other gnomes may come to live under the character's rule.",
      availableAt: 9,
      availableThrough: 14,
      // includeName: true,
      // BOOK: (not explicitly described in Advanced Fantasy p52-53 — general demihuman stronghold rule applies)
      // PROPOSED: "May construct an underground stronghold; other gnomes may come to live under the character's rule."
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
// Respects availableThrough: entries with availableThrough < level are excluded
// (use a replacement entry with a higher availableAt when an ability's text changes at a level)
export function getAbilitiesAtLevel(className, level) {
  const abilities = CLASS_ABILITIES[className] || [];
  return abilities.filter(ability =>
    ability.availableAt <= level &&
    (ability.availableThrough === undefined || ability.availableThrough >= level)
  );
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
