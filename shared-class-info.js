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
      },
      {
        name: "Combat",
        description: "Can use all armour; blunt weapons only (club, mace, sling, staff, war hammer).",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Holy Symbol",
        description: "A cleric must carry a holy symbol.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Deity Disfavour",
        description: "Must be faithful to alignment, clergy, and religion; falling from deity's favour may incur penalties.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Magical Research",
        description: "Any level; create new spells or magical effects for the deity. At 9th level: also create magic items.",
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
      },
      {
        name: "Turn Undead",
        description: "Invoke deity's power to repel undead encountered; roll 2d6 vs undead HD on turning table.",
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
      },
      {
        name: "Spell Casting",
        description: "Once a cleric has proven their faith (from 2nd level), the character may pray to receive spells.",
        availableAt: 2,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Using Magic Items",
        description: "Use scrolls from cleric spell list and items restricted to divine casters (e.g. some magic staves).",
        availableAt: 2,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Stronghold",
        description: "May build a stronghold; costs halved if in deity's favour. Attracts 5d6×10 devoted fighters (levels 1-2).",
        availableAt: 9,
        availableThrough: 14,
        // includeName: true,
        raceOverrides: {
          "Human":   { description: "May build a stronghold; costs halved if in deity's favour. Attracts 5d6×10 devoted fighters (levels 1–2)." },
          "Dwarf":   { description: "May build a dwarven shrine-fortress; costs halved if in deity's favour. Attracts 5d6×10 devoted dwarven fighters (levels 1–2). Dwarven mercenaries only." },
          "Elf":     { description: "May build an elven temple or sylvan shrine; costs halved if in deity's favour. Attracts 5d6×10 devoted elven fighters (levels 1–2). Elvish mercenaries only." },
          "Gnome":   { description: "May build a gnomish temple-stronghold; costs halved if in deity's favour. Attracts 5d6×10 devoted gnomish fighters (levels 1–2). Gnomish mercenaries only." },
          "Halfling":{ description: "May build a halfling shrine-hall; costs halved if in deity's favour. Attracts 5d6×10 devoted halfling fighters (levels 1–2). Halfling mercenaries only." },
        },
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
      },
      {
        name: "Combat",
        description: "Fighters can use all types of weapons and armour.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Stronghold",
        description: "May build a castle or stronghold and control surrounding lands at any time (not restricted to 9th level).",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
        raceOverrides: {
          "Human":   { description: "May build a castle or stronghold and control surrounding lands at any time." },
          "Dwarf":   { description: "May build a subterranean keep or dwarven hall at any time and control surrounding territory. Dwarven mercenaries only." },
          "Elf":     { description: "May build a woodland stronghold or sylvan keep at any time and control surrounding lands. Elvish mercenaries only." },
          "Gnome":   { description: "May build a subterranean complex or gnomish hall at any time and control surrounding territory. Gnomish mercenaries only." },
          "Halfling":{ description: "May build a fortified shire-hall or burrow-mound at any time and control surrounding lands. Halfling mercenaries only." },
        },
        // NOTE: The SRD puts Stronghold in its own section (any time), unlike most classes where it's under After Reaching 9th Level.
      },
      {
        name: "Baron Title",
        description: "At 9th level, may be granted the title of Baron or Baroness; the controlled land is known as a Barony.",
        availableAt: 9,
        availableThrough: 14,
        // includeName: true,
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
      },
      {
        name: "Spell Casting",
        description: "Own a spell book; memorize spells per day per level table. Start with 1 spell (referee's choice).",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Magical Research",
        description: "Any level; add spells to spell book or research magical effects. At 9th level: create magic items.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Using Magic Items",
        description: "Use scrolls from spell list and items restricted to arcane casters (e.g. magic wands).",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Combat",
        description: "Can only use daggers; cannot use shields or any armour.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Stronghold",
        description: "May construct a stronghold (usually a tower); 1d6 apprentices of levels 1-3 arrive to study.",
        availableAt: 11,
        availableThrough: 14,
        // includeName: true,
        raceOverrides: {
          "Human":   { description: "May construct an arcane tower or sanctum; 1d6 apprentice magic-users (levels 1–3) arrive to study." },
          "Dwarf":   { description: "May construct an underground arcane vault or stone tower; 1d6 apprentice magic-users (levels 1–3) arrive to study. Dwarven apprentices preferred." },
          "Elf":     { description: "May construct a forest tower or hidden elven sanctum; 1d6 apprentice magic-users (levels 1–3) arrive to study. Elvish apprentices preferred." },
          "Gnome":   { description: "May construct an underground arcane workshop or gnomish tower; 1d6 apprentice magic-users (levels 1–3) arrive to study. Gnomish apprentices preferred." },
          "Halfling":{ description: "May construct a hidden arcane burrow or halfling tower; 1d6 apprentice magic-users (levels 1–3) arrive to study. Halfling apprentices preferred." },
        },
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
      },
      {
        name: "Combat",
        description: "Can only wear leather armour, no shields; can use any weapon.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Back-stab",
        description: "When attacking an unaware opponent from behind, a thief receives a +4 bonus to hit and doubles any damage dealt.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Thief Skills",
        description: "Climb sheer surfaces, find/remove traps, hear noise, hide in shadows, move silently, open locks, pick pockets.",
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
      },
      {
        name: "Read Languages",
        description: "4th level or higher: 80% chance to read non-magical text in any language, including dead languages and codes.",
        availableAt: 4,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Hideout",
        description: "Construct a secret hideout; attracts 2d6 loyal 1st-level apprentice thieves (potential Thieves' Guild).",
        availableAt: 9,
        availableThrough: 14,
        // includeName: true,
        raceOverrides: {
          "Human":   { description: "Construct a secret urban hideout; attracts 2d6 loyal 1st-level apprentice thieves (potential Thieves' Guild)." },
          "Dwarf":   { description: "Construct a secret underground hideout in a dwarven settlement; attracts 2d6 loyal dwarven apprentice thieves (potential Thieves' Guild)." },
          "Elf":     { description: "Construct a hidden woodland hideout; attracts 2d6 loyal elvish apprentice thieves (potential Thieves' Guild). Elvish apprentices preferred." },
          "Gnome":   { description: "Construct a hidden underground hideout; attracts 2d6 loyal gnomish apprentice thieves (potential Thieves' Guild)." },
          "Halfling":{ description: "Construct a secret burrow-hideout in a halfling settlement; attracts 2d6 loyal halfling apprentice thieves (potential Thieves' Guild)." },
        },
      },
      {
        name: "Scroll Use",
        description: "10th level or higher: cast arcane spells from scrolls; 10% chance of unusual or deleterious effect.",
        availableAt: 10,
        availableThrough: 14,
        // includeName: true,
      }
    ]
  },

  Spellblade: {
    code: 'SB',
    page: 48,  // Elf class — Spellblade is a custom variant
    pageNote: 'Custom class based on Elf',
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
      },
      {
        name: "Combat",
        description: "Spellblades can use any weapon and all types of armour.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Spell Casting",
        description: "Spellblades own spell books containing arcane spell formulae; may cast arcane spells while wearing armour.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Magical Research",
        description: "A spellblade of any level may spend time and money on magical research, adding new spells to their spell book or researching other magical effects. At 9th level, may also create magic items.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Using Magic Items",
        description: "As arcane spell casters, spellblades can use magic scrolls from their spell list and items restricted to arcane casters (e.g. magic wands).",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Stronghold",
        description: "May construct a stronghold.",
        availableAt: 9,
        availableThrough: 14,
        // includeName: true,
        raceOverrides: {
          "Human":   { description: "May construct a fortified arcane tower; 3d2 fighters, 1d3 magic-users, and 1d2 spellblades (all L1–2) arrive to serve." },
          "Elf":     { description: "May construct a forest stronghold; 3d2 fighters, 1d3 magic-users, and 1d2 spellblades (all L1–2) arrive. Forest animals become friendly. Elven mercenaries only." },
          "Dwarf":   { description: "May construct a subterranean arcane stronghold; 3d2 dwarven fighters, 1d3 magic-users, and 1d2 spellblades (all L1–2) serve. Dwarven mercenaries only." },
          "Gnome":   { description: "May construct a subterranean stronghold; 3d2 gnomish fighters, 1d3 magic-users, and 1d2 spellblades (all L1–2) arrive to serve. Gnomish mercenaries only." },
          "Halfling":{ description: "May construct a halfling community stronghold; 3d2 halfling fighters, 1d3 magic-users, and 1d2 spellblades (all L1–2) arrive to serve." },
        },
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
      },
      {
        name: "Combat",
        description: "Can use all types of armour; small or normal sized weapons only (no longbows or two-handed swords).",
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
      },
      {
        name: "Detect Construction Tricks",
        description: "2-in-6 chance of detecting new construction, sliding walls, or sloping passages when searching.",
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
      },
      {
        name: "Detect Room Traps",
        description: "2-in-6 chance of detecting non-magical room traps when searching.",
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
      },
      {
        name: "Infravision",
        description: "60'",
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
      },
      {
        name: "Listening at Doors",
        description: "2-in-6 chance of hearing noises.",
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
      },
      {
        name: "Stronghold",
        description: "May construct a subterranean stronghold; other dwarves may come to establish a new clan. Only dwarven mercenaries may be hired; specialists and retainers of any race may be hired.",
        availableAt: 9,
        availableThrough: 14,
        // includeName: true,
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
      },
      {
        name: "Combat",
        description: "Elves can use all types of weapons and armour.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Detect Secret Doors",
        description: "Elves have a 2-in-6 chance of locating secret or hidden doors when searching.",
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
        // NOTE: 1-in-6 passive is the standard dungeon rule for ALL characters — not an Elf class ability.
      },
      {
        name: "Immunity to Ghoul Paralysis",
        description: "Elves are immune to the paralysing effect of ghouls' attacks.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Infravision",
        description: "60'",
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
      },
      {
        name: "Listening at Doors",
        description: "2-in-6 chance of hearing noises.",
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
      },
      {
        name: "Magical Research",
        description: "An elf of any level may spend time and money on magical research, adding new spells to their spell book or researching other magical effects.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Magical Research (Magic Items)",
        description: "May create magic items.",
        availableAt: 9,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Spell Casting",
        description: "Elves carry spell books; a 1st level elf has one spell. Elves have the same spell selection as magic-users.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Using Magic Items",
        description: "As spell casters, elves can use magic scrolls and items usable only by arcane spell casters (e.g. magic wands).",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Stronghold",
        description: "May construct a forest stronghold; forest animals within 5 miles become friendly. Only elven mercenaries may be hired; specialists and retainers of any race may be hired.",
        availableAt: 9,
        availableThrough: 14,
        // includeName: true,
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
      },
      {
        name: "Combat",
        description: "Can use all armour and any weapon, but must be tailored to halfling size; no longbows or two-handed swords.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Defensive Bonus",
        description: "+2 bonus to Armour Class when attacked by large opponents (greater than human-sized).",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Hiding",
        description: "In woods or undergrowth, 90% chance; in dungeons, 2-in-6 (requires cover, motionless and silent).",
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
      },
      {
        name: "Initiative Bonus",
        description: "+1 to initiative rolls (optional rule).",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Listening at Doors",
        description: "2-in-6 chance of hearing noises.",
        availableAt: 1,
        availableThrough: 14,
        includeName: true,
      },
      {
        name: "Missile Attack Bonus",
        description: "Halflings' accuracy grants them a +1 bonus to attack rolls with all missile weapons.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
      },
      {
        name: "Stronghold",
        description: "May build a stronghold forming a new halfling community (Shire) at any time; the character becomes Sheriff.",
        availableAt: 1,
        availableThrough: 14,
        // includeName: true,
        // NOTE: The SRD puts Stronghold in its own section (any time), unlike most classes where it's under After Reaching 9th Level.
      }
    ]
  },

  Gnome: {
    code: 'GN',
    page: 52,
    name: "Gnome",
    description: "",        // TODO: fill in from book p52
    primeRequisite: "DEX and INT",
    hitDieType: "d4",
    maxLevel: 8,
    armor: [],              // TODO: fill in from book p52
    armorDescription: "",
    weapons: [],            // TODO: fill in from book p52
    weaponDescription: "",
    availableIn: { basic: true, advanced: false },
    availableRaces: {
      basic: ["Gnome"],
      advanced: [],         // TODO: fill in from book p52
    },
    requirements: {},       // TODO: fill in from book p52
    abilities: []           // TODO: fill in from book p52
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
