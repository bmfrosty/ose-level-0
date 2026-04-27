// shared-class-info.js — CLASS_INFO: all class definitions with abilities, metadata, and requirements

export const CLASS_INFO = {
  Cleric: {
    code: 'CL',
    page: 36,
    name: "Cleric",
    description: "Clerics are adventurers sworn to the service of a deity. They are trained for battle and channel the power of their deity.",
    primeRequisite: "WIS",
    hitDieType: "d6",
    maxLevel: 14,
    armor: ["Leather", "Chain mail", "Plate mail", "Shield"],
    armorDescription: "Any, including shields",
    weapons: ["Club", "Mace", "Sling", "Staff", "War hammer"],
    weaponDescription: "Any blunt weapons",
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
    },
    abilities: [
      {
        name: "Languages",
        languages: ["Alignment", "Common"],
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
        // SRD: stat block: "Alignment, Common"
      },
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
        description: "A cleric must carry a holy symbol.",
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
        includeName: true,
        // SRD: "A cleric of any level may spend time and money on magical research. This allows them to create new spells or other magical effects associated with their deity. When a cleric reaches 9th level, they are also able to create magic items."
        // PROPOSED: "Any level; create new spells or magical effects for the deity. At 9th level: also create magic items."
      },
      {
        name: "Turn Undead",
        description: "Invoke deity's power to repel undead encountered; roll 2d6 vs undead HD on turning table.",
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
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
        raceOverrides: {
          "Human":   { /* PROPOSED: TBD */ },
          "Dwarf":   { /* PROPOSED: TBD */ },
          "Elf":     { /* PROPOSED: TBD */ },
          "Gnome":   { /* PROPOSED: TBD */ },
          "Halfling":{ /* PROPOSED: TBD */ }
        },
        // SRD: "A cleric may construct a stronghold. If the cleric is in favour with their deity, the construction costs are halved, due to divine aid. When the stronghold is complete, 5d6 x 10 fighters of level 1-2 will arrive to serve the cleric. These followers are completely devoted to the cleric, never checking morale."
        // PROPOSED: "May build a stronghold; costs halved if in deity's favour. Attracts 5d6×10 devoted fighters (levels 1-2)."
      }
    ]
  },

  Fighter: {
    code: 'FI',
    page: 50,
    name: "Fighter",
    description: "Fighters are adventurers dedicated to mastering the arts of combat and war. In a group of adventurers, the role of fighters is to battle monsters and to defend other characters.",
    primeRequisite: "STR",
    hitDieType: "d8",
    maxLevel: 14,
    armor: ["Leather", "Chain mail", "Plate mail", "Shield"],
    armorDescription: "Any, including shields",
    weapons: ["Battle axe", "Club", "Crossbow", "Dagger", "Hand axe", "Javelin", "Lance", "Long bow", "Mace", "Pole arm", "Short bow", "Short sword", "Silver dagger", "Sling", "Spear", "Staff", "Sword", "Torch", "Two-handed sword", "War hammer"],
    weaponDescription: "Any",
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
    },
    abilities: [
      {
        name: "Languages",
        languages: ["Alignment", "Common"],
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
        // SRD: stat block: "Alignment, Common"
      },
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
        description: "May build a castle or stronghold and control surrounding lands at any time (not restricted to 9th level).",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
        raceOverrides: {
          "Human":   { /* PROPOSED: TBD */ },
          "Dwarf":   { /* PROPOSED: TBD */ },
          "Elf":     { /* PROPOSED: TBD */ },
          "Gnome":   { /* PROPOSED: TBD */ },
          "Halfling":{ /* PROPOSED: TBD */ }
        },
        // SRD: "Any time a fighter wishes (and has sufficient money), they can build a castle or stronghold and control the surrounding lands." (== Stronghold == section — NOT under After Reaching 9th Level)
        // PROPOSED: "May build a castle or stronghold and control surrounding lands at any time (not restricted to 9th level)."
        // NOTE: The SRD puts Stronghold in its own section (any time), unlike most classes where it's under After Reaching 9th Level.
      },
      {
        name: "Baron Title",
        description: "At 9th level, may be granted the title of Baron or Baroness; the controlled land is known as a Barony.",
        availableAt: 9,
        availableThrough: 14,
        // includeName: true,
        // SRD: "A fighter may be granted a title such as Baron or Baroness. The land under the fighter's control is then known as a Barony." (Under After Reaching 9th Level)
        // PROPOSED: "At 9th level, may be granted the title of Baron or Baroness; the controlled land is known as a Barony."
      }
    ]
  },

  "Magic-User": {
    code: 'MU',
    page: 66,
    name: "Magic-User",
    description: "Magic-users are adventurers who study arcane secrets and cast spells. Magic-users are able to cast a greater number of increasingly powerful spells as they advance in level.",
    primeRequisite: "INT",
    hitDieType: "d4",
    maxLevel: 14,
    armor: [],
    armorDescription: "None",
    weapons: ["Dagger", "Staff"],
    weaponDescription: "Dagger only",
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
    },
    abilities: [
      {
        name: "Languages",
        languages: ["Alignment", "Common"],
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
        // SRD: stat block: "Alignment, Common"
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
        raceOverrides: {
          "Human":   { /* PROPOSED: TBD */ },
          "Dwarf":   { /* PROPOSED: TBD */ },
          "Elf":     { /* PROPOSED: TBD */ },
          "Gnome":   { /* PROPOSED: TBD */ },
          "Halfling":{ /* PROPOSED: TBD */ }
        },
        // SRD: "A magic-user may construct a stronghold (usually in the form of a tower). 1d6 apprentices of levels 1-3 will then arrive to study under the magic-user."
        // PROPOSED: "May construct a stronghold (usually a tower); 1d6 apprentices of levels 1-3 arrive to study."
      }
    ]
  },

  Thief: {
    code: 'TH',
    page: 74,
    name: "Thief",
    description: "Thieves are adventurers who live by their skills of deception and stealth. They have a range of specialised adventuring skills unavailable to other characters.",
    primeRequisite: "DEX",
    hitDieType: "d4",
    maxLevel: 14,
    armor: ["Leather"],
    armorDescription: "Leather only, no shields",
    weapons: ["Battle axe", "Club", "Crossbow", "Dagger", "Hand axe", "Javelin", "Lance", "Long bow", "Mace", "Pole arm", "Short bow", "Short sword", "Silver dagger", "Sling", "Spear", "Staff", "Sword", "Torch", "Two-handed sword", "War hammer"],
    weaponDescription: "Any",
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
    },
    abilities: [
      {
        name: "Languages",
        languages: ["Alignment", "Common"],
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
        // SRD: stat block: "Alignment, Common"
      },
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
        includeName: true,
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
        raceOverrides: {
          "Human":   { /* PROPOSED: TBD */ },
          "Dwarf":   { /* PROPOSED: TBD */ },
          "Elf":     { /* PROPOSED: TBD */ },
          "Gnome":   { /* PROPOSED: TBD */ },
          "Halfling":{ /* PROPOSED: TBD */ }
        },
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
    ]
  },

  Spellblade: {
    code: 'SB',
    page: null,  // house-rules class, not in the book
    name: "Spellblade",
    description: "Spellblades are adventurers who combine martial prowess with arcane magic. They can fight in armor while casting spells, making them versatile combatants.",
    primeRequisite: "INT and STR",
    hitDieType: "d6",
    maxLevel: 14,
    armor: ["Leather", "Chain mail", "Plate mail", "Shield"],
    armorDescription: "Any, including shields",
    weapons: ["Battle axe", "Club", "Crossbow", "Dagger", "Hand axe", "Javelin", "Lance", "Long bow", "Mace", "Pole arm", "Short bow", "Short sword", "Silver dagger", "Sling", "Spear", "Staff", "Sword", "Torch", "Two-handed sword", "War hammer"],
    weaponDescription: "Any",
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
    },
    abilities: [
      {
        name: "Languages",
        languages: ["Alignment", "Common"],
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
        // SRD: N/A (house rules class)
      },
      {
        name: "Combat",
        description: "Spellblades can use any weapon and all types of armour.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
        // SRD: N/A (house rules class)
        // PROPOSED: "Spellblades can use any weapon and all types of armour."
      },
      {
        name: "Spell Casting",
        description: "Spellblades own spell books containing arcane spell formulae; may cast arcane spells while wearing armour.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
        // SRD: N/A (house rules class)
        // PROPOSED: "Spellblades own spell books containing arcane spell formulae; may cast arcane spells while wearing armour."
      },
      {
        name: "Magical Research",
        description: "A spellblade of any level may spend time and money on magical research, adding new spells to their spell book or researching other magical effects. At 9th level, may also create magic items.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
        // SRD: N/A (house rules class)
        // PROPOSED: "A spellblade of any level may spend time and money on magical research, adding new spells to their spell book or researching other magical effects. At 9th level, may also create magic items."
      },
      {
        name: "Using Magic Items",
        description: "As arcane spell casters, spellblades can use magic scrolls from their spell list and items restricted to arcane casters (e.g. magic wands).",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
        // SRD: N/A (house rules class)
        // PROPOSED: "As arcane spell casters, spellblades can use magic scrolls from their spell list and items restricted to arcane casters (e.g. magic wands)."
      },
      {
        name: "Stronghold",
        description: "May construct a stronghold.",
        availableAt: 9,
        availableThrough: 14,
        // includeName: true,
        raceOverrides: {
          "Human":   { /* PROPOSED: TBD */ },
          "Dwarf":   { /* PROPOSED: TBD */ },
          "Elf":     { /* PROPOSED: TBD */ },
          "Gnome":   { /* PROPOSED: TBD */ },
          "Halfling":{ /* PROPOSED: TBD */ }
        },
        // SRD: N/A (house rules class)
        // PROPOSED: TBD — stronghold details not yet defined per race for this house-rules class
      }
    ]
  },

  Dwarf: {
    code: 'DW',
    page: 46,
    name: "Dwarf",
    maxLevel: 12,
    description: "Dwarves are stout, bearded demihumans who average a height of approximately 4' and weigh about 150 pounds. Dwarves typically live in underground strongholds and have a great love of fine craftsmanship, gold, and warfare.",
    primeRequisite: "STR",
    hitDieType: "d8",
    armor: ["Leather", "Chain mail", "Plate mail", "Shield"],
    armorDescription: "Any appropriate to size, including shields",
    weapons: ["Battle axe", "Club", "Crossbow", "Dagger", "Hand axe", "Javelin", "Lance", "Mace", "Pole arm", "Short bow", "Short sword", "Silver dagger", "Sling", "Spear", "Staff", "Sword", "Torch", "War hammer"],
    weaponDescription: "Any, but not longbows or two-handed swords",
    weaponRestrictions: "Cannot use Long bow or Two-handed sword (too large)",
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
    },
    abilities: [
      {
        name: "Languages",
        languages: ["Alignment", "Common", "Dwarvish", "Gnomish", "Goblin", "Kobold"],
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
        // SRD: stat block: "Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold"
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
        name: "Stronghold",
        description: "May construct a subterranean stronghold; other dwarves may come to establish a new clan. Only dwarven mercenaries may be hired; specialists and retainers of any race may be hired.",
        availableAt: 9,
        availableThrough: 14,
        // includeName: true,
        // SRD: "A dwarf may construct a subterranean stronghold delved beneath hills or mountains. Other dwarves may come to live under the rule of the character, establishing a new clan. A dwarf ruler may only hire dwarven mercenaries. Specialists and retainers of any race may be hired."
        // PROPOSED: "May construct a subterranean stronghold; other dwarves may come to establish a new clan. Only dwarven mercenaries may be hired; specialists and retainers of any race may be hired."
      }
    ]
  },

  Elf: {
    code: 'EL',
    page: 48,
    name: "Elf",
    maxLevel: 10,
    description: "Elves are slender, fey demihumans with pointed ears. They typically weigh about 120 pounds and are between 5 and 5½ feet tall. Elves are seldom met in human settlements, preferring to feast and make merry in the woods.",
    primeRequisite: "INT and STR",
    hitDieType: "d6",
    armor: ["Leather", "Chain mail", "Plate mail", "Shield"],
    armorDescription: "Any, including shields",
    weapons: ["Battle axe", "Club", "Crossbow", "Dagger", "Hand axe", "Javelin", "Lance", "Long bow", "Mace", "Pole arm", "Short bow", "Short sword", "Silver dagger", "Sling", "Spear", "Staff", "Sword", "Torch", "Two-handed sword", "War hammer"],
    weaponDescription: "Any",
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
    },
    abilities: [
      {
        name: "Languages",
        languages: ["Alignment", "Common", "Elvish", "Gnoll", "Hobgoblin", "Orcish"],
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
        // SRD: stat block: "Alignment, Common, Elvish, Gnoll, Hobgoblin, Orcish"
      },
      {
        name: "Combat",
        description: "Elves can use all types of weapons and armour.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
        // SRD: "Elves can use all types of weapons and armour."
        // PROPOSED: "Elves can use all types of weapons and armour."
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
        name: "Magical Research",
        description: "An elf of any level may spend time and money on magical research, adding new spells to their spell book or researching other magical effects.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
        // SRD: "An elf of any level may spend time and money on magical research. This allows them to add new spells to their spell book and to research other magical effects. When an elf reaches 9th level, they are also able to create magic items."
        // PROPOSED: "An elf of any level may spend time and money on magical research, adding new spells to their spell book or researching other magical effects."
      },
      {
        name: "Magical Research (Magic Items)",
        description: "May create magic items.",
        availableAt: 9,
        availableThrough: 14,
        // includeName: true,
        // SRD: "When an elf reaches 9th level, they are also able to create magic items."
        // PROPOSED: "May create magic items."
      },
      {
        name: "Spell Casting",
        description: "Elves carry spell books; a 1st level elf has one spell. Elves have the same spell selection as magic-users.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
        // SRD: "Elves carry spell books containing the formulae for arcane spells. The level progression table shows both the number of spells in the elf's spell book and the number they may memorize, determined by the character's experience level. Thus, a 1st level elf has one spell in their spell book, selected by the referee (who may allow the player to choose). The list of spells available to elves is found in Magic-User Spells (elves have the same spell selection as magic-users)."
        // PROPOSED: "Elves carry spell books; a 1st level elf has one spell. Elves have the same spell selection as magic-users."
      },
      {
        name: "Using Magic Items",
        description: "As spell casters, elves can use magic scrolls and items usable only by arcane spell casters (e.g. magic wands).",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
        // SRD: "As spell casters, elves are able to use magic scrolls of spells on their spell list. They can also use items that may only be used by arcane spell casters (e.g. magic wands)."
        // PROPOSED: "As spell casters, elves can use magic scrolls and items usable only by arcane spell casters (e.g. magic wands)."
      },
      {
        name: "Stronghold",
        description: "May construct a forest stronghold; forest animals within 5 miles become friendly. Only elven mercenaries may be hired; specialists and retainers of any race may be hired.",
        availableAt: 9,
        availableThrough: 14,
        // includeName: true,
        // SRD: "An elf may construct a stronghold in the depths of the forest. Forest animals within a 5 mile radius will become friends with the elves. An elf ruler may only hire elven mercenaries. Specialists and retainers of any race may be hired."
        // PROPOSED: "May construct a forest stronghold; forest animals within 5 miles become friendly. Only elven mercenaries may be hired; specialists and retainers of any race may be hired."
      }
    ]
  },

  Halfling: {
    code: 'HA',
    page: 56,
    name: "Halfling",
    maxLevel: 8,
    description: "Halflings are small, rotund demihumans with curly hair on their heads and feet. They weigh about 60 pounds and are around 3' tall. Halflings are a friendly and welcoming folk. Above all, they love the comforts of home and are not known for their bravery.",
    primeRequisite: "DEX and STR",
    hitDieType: "d6",
    armor: ["Leather", "Chain mail", "Plate mail", "Shield"],
    armorDescription: "Any appropriate to size, including shields",
    weapons: ["Battle axe", "Club", "Crossbow", "Dagger", "Hand axe", "Javelin", "Lance", "Mace", "Pole arm", "Short bow", "Short sword", "Silver dagger", "Sling", "Spear", "Staff", "Sword", "Torch", "War hammer"],
    weaponDescription: "Any appropriate to size, but not longbows or two-handed swords",
    weaponRestrictions: "Weapons must be appropriate to size",
    armorRestrictions: "Armor must be appropriate to size",
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
    },
    abilities: [
      {
        name: "Languages",
        languages: ["Alignment", "Common", "Halfling"],
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
        // SRD: stat block: "Alignment, Common, Halfling"
      },
      {
        name: "Combat",
        description: "Can use all armour and any weapon, but must be tailored to halfling size; no longbows or two-handed swords.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
        // SRD: "Halflings can use all types of armour, but it must be tailored to their small size. Similarly, they can use any weapon appropriate to their stature (as determined by the referee). They cannot use longbows or two-handed swords."
        // PROPOSED: "Can use all armour and any weapon, but must be tailored to halfling size; no longbows or two-handed swords."
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
        name: "Stronghold",
        description: "May build a stronghold forming a new halfling community (Shire) at any time; the character becomes Sheriff.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
        // SRD: "Any time a halfling wishes (and has sufficient money), they may build a stronghold, which will form the basis of a new community of halflings. Halfling communities—known as Shires—are typically located in gentle countryside of little rivers and rolling hills. The leader of the community is called the Sheriff." (== Stronghold == section — NOT under After Reaching 9th Level)
        // PROPOSED: "May build a stronghold forming a new halfling community (Shire) at any time; the character becomes Sheriff."
        // NOTE: The SRD puts Stronghold in its own section (any time), unlike most classes where it's under After Reaching 9th Level.
      }
    ]
  },

  Gnome: {
    code: 'GN',
    page: 52,
    name: "Gnome",
    maxLevel: 8,
    description: "Gnomes are a race of short demihumans with long noses and beards, cousins of the dwarves. They prefer to dwell in underground complexes in forests or foothills. They love mining, precious stones, and machinery. Gnomes are typically around 3½' tall and weigh around 100 pounds.",
    primeRequisite: "DEX and INT",
    hitDieType: "d4",
    armor: ["Leather", "Shield"],
    armorDescription: "Leather armour and shields (must be tailored to gnome size)",
    weapons: ["Any appropriate to size"],
    weaponDescription: "Any weapon appropriate to size (referee's discretion); no longbows or two-handed swords",
    weaponRestrictions: "Cannot use longbows or two-handed swords (too large)",
    armorRestrictions: "Leather armour and shields only; must be tailored to gnome size",
    availableIn: {
      basic: true,    // Available in Basic Mode (race-as-class)
      advanced: false // NOT available in Advanced Mode (use Gnome race + other classes)
    },
    availableRaces: {
      basic: ["Gnome"],
      advanced: ["Gnome"]
    },
    requirements: {
      Gnome: { CON: 9 }  // Book: "Minimum CON 9" only — no minimum INT/DEX (those are prime requisites, not minimums)
    },
    abilities: [
      {
        name: "Languages",
        languages: ["Alignment", "Common", "Gnomish", "Dwarvish", "Kobold", "Burrowing mammals"],
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
        // BOOK: "Languages: Alignment, Common, Gnomish, Dwarvish, Kobold, the secret language of burrowing mammals"
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
        description: "May construct an underground stronghold; burrowing mammals within 5 miles become friendly (warn of intruders, carry messages). Only gnomish soldiers may be hired; retainers and specialists of any race may be hired.",
        availableAt: 8,
        availableThrough: 14,
        // includeName: true,
        // BOOK: "A gnome has the option of creating an underground stronghold that will attract gnomes from far and wide. Because of gnomes' connection with burrowing mammals, all such creatures within 5 miles of the stronghold will become friends with the gnomes. They may warn of intruders, carry messages and news, and so on. In exchange for this friendship, the gnome must protect the animals from harm. Gnome rulers can hire members of other races in the capacity of retainers or specialists, but only soldiers of gnomish stock may be hired."
        // PROPOSED: "May construct an underground stronghold; burrowing mammals within 5 miles become friendly (warn of intruders, carry messages). Only gnomish soldiers may be hired; retainers and specialists of any race may be hired."
      }
    ]
  },

  // ── Advanced classes (and future Basic expansion) ─────────────────────────
  // These entries are stubs. Abilities must be filled in from the book.

  Acrobat: {
    code: 'AC',
    page: 28,
    name: "Acrobat",
    description: "",  // TODO: fill in from book p28
    primeRequisite: "DEX",  // TODO: confirm from book p28
    hitDieType: "d6",       // TODO: confirm from book p28
    maxLevel: 14,
    armor: [],              // TODO: fill in from book p28
    armorDescription: "TODO",
    weapons: [],            // TODO: fill in from book p28
    weaponDescription: "TODO",
    availableIn: { basic: true, advanced: true },
    availableRaces: {
      basic: ["Human"],
      advanced: [],         // TODO: fill in from book p28
    },
    requirements: {},       // TODO: fill in from book p28
    abilities: []           // TODO: fill in from book p28
  },

  Assassin: {
    code: 'AS',
    page: 30,
    name: "Assassin",
    description: "",  // TODO: fill in from book p30
    primeRequisite: "STR and DEX",  // TODO: confirm from book p30
    hitDieType: "d6",               // TODO: confirm from book p30
    maxLevel: 14,
    armor: [],              // TODO: fill in from book p30
    armorDescription: "TODO",
    weapons: [],            // TODO: fill in from book p30
    weaponDescription: "TODO",
    availableIn: { basic: true, advanced: true },
    availableRaces: {
      basic: ["Human"],
      advanced: [],         // TODO: fill in from book p30
    },
    requirements: {},       // TODO: fill in from book p30
    abilities: []           // TODO: fill in from book p30
  },

  Barbarian: {
    code: 'BA',
    page: 32,
    name: "Barbarian",
    description: "",  // TODO: fill in from book p32
    primeRequisite: "STR",  // TODO: confirm from book p32
    hitDieType: "d8",       // TODO: confirm from book p32
    maxLevel: 14,
    armor: [],              // TODO: fill in from book p32
    armorDescription: "TODO",
    weapons: [],            // TODO: fill in from book p32
    weaponDescription: "TODO",
    availableIn: { basic: true, advanced: true },
    availableRaces: {
      basic: ["Human"],
      advanced: [],         // TODO: fill in from book p32
    },
    requirements: {},       // TODO: fill in from book p32
    abilities: []           // TODO: fill in from book p32
  },

  Bard: {
    code: 'BD',
    page: 34,
    name: "Bard",
    description: "",  // TODO: fill in from book p34
    primeRequisite: "CHA",  // TODO: confirm from book p34
    hitDieType: "d6",       // TODO: confirm from book p34
    maxLevel: 14,
    armor: [],              // TODO: fill in from book p34
    armorDescription: "TODO",
    weapons: [],            // TODO: fill in from book p34
    weaponDescription: "TODO",
    availableIn: { basic: true, advanced: true },
    availableRaces: {
      basic: ["Human"],
      advanced: [],         // TODO: fill in from book p34
    },
    requirements: {},       // TODO: fill in from book p34
    abilities: []           // TODO: fill in from book p34
  },

  Druid: {
    code: 'DV',
    page: 40,
    name: "Druid",
    description: "",  // TODO: fill in from book p40
    primeRequisite: "WIS",  // TODO: confirm from book p40
    hitDieType: "d6",       // TODO: confirm from book p40
    maxLevel: 14,
    armor: [],              // TODO: fill in from book p40
    armorDescription: "TODO",
    weapons: [],            // TODO: fill in from book p40
    weaponDescription: "TODO",
    availableIn: { basic: true, advanced: true },
    availableRaces: {
      basic: ["Human"],
      advanced: [],         // TODO: fill in from book p40
    },
    requirements: {},       // TODO: fill in from book p40
    abilities: []           // TODO: fill in from book p40
  },

  Illusionist: {
    code: 'IL',
    page: 62,
    name: "Illusionist",
    description: "",  // TODO: fill in from book p62
    primeRequisite: "INT",  // TODO: confirm from book p62
    hitDieType: "d4",       // TODO: confirm from book p62
    maxLevel: 14,
    armor: [],
    armorDescription: "None",
    weapons: [],            // TODO: fill in from book p62
    weaponDescription: "TODO",
    availableIn: { basic: true, advanced: true },
    availableRaces: {
      basic: ["Human"],
      advanced: [],         // TODO: fill in from book p62
    },
    requirements: {},       // TODO: fill in from book p62
    abilities: []           // TODO: fill in from book p62
  },

  Knight: {
    code: 'KN',
    page: 64,
    name: "Knight",
    description: "",  // TODO: fill in from book p64
    primeRequisite: "STR",  // TODO: confirm from book p64
    hitDieType: "d8",       // TODO: confirm from book p64
    maxLevel: 14,
    armor: [],              // TODO: fill in from book p64
    armorDescription: "TODO",
    weapons: [],            // TODO: fill in from book p64
    weaponDescription: "TODO",
    availableIn: { basic: true, advanced: true },
    availableRaces: {
      basic: ["Human"],
      advanced: [],         // TODO: fill in from book p64
    },
    requirements: {},       // TODO: fill in from book p64
    abilities: []           // TODO: fill in from book p64
  },

  Paladin: {
    code: 'PA',
    page: 68,
    name: "Paladin",
    description: "",  // TODO: fill in from book p68
    primeRequisite: "STR and WIS",  // TODO: confirm from book p68
    hitDieType: "d8",               // TODO: confirm from book p68
    maxLevel: 14,
    armor: [],              // TODO: fill in from book p68
    armorDescription: "TODO",
    weapons: [],            // TODO: fill in from book p68
    weaponDescription: "TODO",
    availableIn: { basic: true, advanced: true },
    availableRaces: {
      basic: ["Human"],
      advanced: [],         // TODO: fill in from book p68
    },
    requirements: {},       // TODO: fill in from book p68
    abilities: []           // TODO: fill in from book p68
  },

  Ranger: {
    code: 'RA',
    page: 70,
    name: "Ranger",
    description: "",  // TODO: fill in from book p70
    primeRequisite: "STR",  // TODO: confirm from book p70
    hitDieType: "d8",       // TODO: confirm from book p70
    maxLevel: 14,
    armor: [],              // TODO: fill in from book p70
    armorDescription: "TODO",
    weapons: [],            // TODO: fill in from book p70
    weaponDescription: "TODO",
    availableIn: { basic: true, advanced: true },
    availableRaces: {
      basic: ["Human"],
      advanced: [],         // TODO: fill in from book p70
    },
    requirements: {},       // TODO: fill in from book p70
    abilities: []           // TODO: fill in from book p70
  },

  // ── Basic-only race-as-class entries (class name matches race name) ────────

  Drow: {
    code: 'DK',
    page: 38,
    name: "Drow",
    description: "",  // TODO: fill in from book p38
    primeRequisite: "TODO",   // fill in from book p38
    hitDieType: "d6",         // TODO: confirm from book p38
    maxLevel: 14,             // TODO: confirm from book p38
    armor: [],                // TODO: fill in from book p38
    armorDescription: "TODO",
    weapons: [],              // TODO: fill in from book p38
    weaponDescription: "TODO",
    availableIn: {
      basic: true,    // race-as-class in Basic mode
      advanced: false // use Drow_RACE + class in Advanced mode
    },
    availableRaces: {
      basic: ["Drow"],
      advanced: []
    },
    requirements: { Drow: {} },  // TODO: fill in from book p38
    abilities: []                // TODO: fill in from book p38
  },

  Duergar: {
    code: 'DG',
    page: 44,
    name: "Duergar",
    description: "",  // TODO: fill in from book p44
    primeRequisite: "STR",    // TODO: confirm from book p44
    hitDieType: "d8",         // TODO: confirm from book p44
    maxLevel: 12,             // TODO: confirm from book p44
    armor: [],                // TODO: fill in from book p44
    armorDescription: "TODO",
    weapons: [],              // TODO: fill in from book p44
    weaponDescription: "TODO",
    availableIn: {
      basic: true,    // race-as-class in Basic mode
      advanced: false // use Duergar_RACE + class in Advanced mode
    },
    availableRaces: {
      basic: ["Duergar"],
      advanced: []
    },
    requirements: { Duergar: {} },  // TODO: fill in from book p44
    abilities: []                   // TODO: fill in from book p44
  },

  "Half-Elf": {
    code: 'HE',
    page: 54,
    name: "Half-Elf",
    description: "",  // TODO: fill in from book p54
    primeRequisite: "TODO",   // fill in from book p54
    hitDieType: "d6",         // TODO: confirm from book p54
    maxLevel: 14,             // TODO: confirm from book p54
    armor: [],                // TODO: fill in from book p54
    armorDescription: "TODO",
    weapons: [],              // TODO: fill in from book p54
    weaponDescription: "TODO",
    availableIn: {
      basic: true,    // race-as-class in Basic mode
      advanced: false // use Half-Elf_RACE + class in Advanced mode
    },
    availableRaces: {
      basic: ["Half-Elf"],
      advanced: []
    },
    requirements: { "Half-Elf": {} },  // TODO: fill in from book p54
    abilities: []                      // TODO: fill in from book p54
  },

  "Half-Orc": {
    code: 'HO',
    page: 60,
    name: "Half-Orc",
    description: "",  // TODO: fill in from book p60
    primeRequisite: "STR",    // TODO: confirm from book p60
    hitDieType: "d8",         // TODO: confirm from book p60
    maxLevel: 14,             // TODO: confirm from book p60
    armor: [],                // TODO: fill in from book p60
    armorDescription: "TODO",
    weapons: [],              // TODO: fill in from book p60
    weaponDescription: "TODO",
    availableIn: {
      basic: true,    // race-as-class in Basic mode
      advanced: false // use Half-Orc_RACE + class in Advanced mode
    },
    availableRaces: {
      basic: ["Half-Orc"],
      advanced: []
    },
    requirements: { "Half-Orc": {} },  // TODO: fill in from book p60
    abilities: []                      // TODO: fill in from book p60
  },

  Svirfneblin: {
    code: 'SV',
    page: 72,
    name: "Svirfneblin",
    description: "",  // TODO: fill in from book p72
    primeRequisite: "TODO",   // fill in from book p72
    hitDieType: "d6",         // TODO: confirm from book p72
    maxLevel: 8,              // TODO: confirm from book p72
    armor: [],                // TODO: fill in from book p72
    armorDescription: "TODO",
    weapons: [],              // TODO: fill in from book p72
    weaponDescription: "TODO",
    availableIn: {
      basic: true,    // race-as-class in Basic mode
      advanced: false // use Svirfneblin_RACE + class in Advanced mode
    },
    availableRaces: {
      basic: ["Svirfneblin"],
      advanced: []
    },
    requirements: { Svirfneblin: {} },  // TODO: fill in from book p72
    abilities: []                       // TODO: fill in from book p72
  },

};
