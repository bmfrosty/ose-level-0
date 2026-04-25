// shared-race-info.js — RACE_INFO: all race definitions with abilities, modifiers, and class level limits

// ============================================================================
// RACE_INFO — single source of truth for all race data
//
// Mirrors CLASS_INFO in shared-class-data-shared.js. Every race is a fully
// self-contained object. Fields:
//
//   name              — display name
//   code              — two-letter race code used in character sheet encoding (e.g. 'HU', 'DW')
//   description       — short race description
//   abilityModifiers  — racial ability score adjustments (Advanced mode only; never apply in Basic)
//   minimums          — minimum ability score requirements to play this race
//   availableIn       — which modes this race may be selected in
//   availableClasses  — { advanced: [...] } traditional Advanced mode class combinations
//   classLevelLimits  — { "Fighter_CLASS": 10, ... } max level per class (Normal mode only)
//   abilities         — array of ability entries (same structure as CLASS_INFO[].abilities)
//
// abilities entry fields:
//   name                   — ability name
//   description            — ability text (≤120 chars; reworded from source; not copied verbatim)
//   languages              — string[] — use instead of description for Languages entries
//   basicAvailableAt       — first level shown on Basic sheets (0 for all racial abilities)
//   basicAvailableThrough  — last level shown on Basic sheets:
//                             0 = demihuman abilities replaced by class abilities at level 1
//                            14 = persists through all levels
//   advancedAvailableAt    — first level shown on Advanced sheets (0 for all racial abilities)
//   advancedAvailableThrough — last level shown on Advanced sheets (usually 14)
//   includeName            — if true (uncommented): renders as "Name: description"
//                            if commented out: renders description standalone
//   saveModifier           — { formula, appliesTo } — applied mechanically regardless of display level
//   humanOnly              — if true: suppressed unless "human racial abilities" option is on
//
// BOOK: comments quote verbatim source text (do not reproduce in description strings)
// PROPOSED: comments are the intended description for user review
// ============================================================================

export const showDescriptionAnyway = false; // set true to force-show descriptions regardless of hideDescription

export const RACE_INFO = {

  // ── Human ──────────────────────────────────────────────────────────────────
  "Human_RACE": {
    name: "Human",
    code: "HU",
    description: "Versatile and ambitious, humans may choose any class and advance without level limits.",
    abilityModifiers: { CON: 1, CHA: 1 },  // Advanced mode only; only applied when humanRacialAbilities is on
    minimums: {},
    availableIn: { basic: true, advanced: true },
    availableClasses: {
      advanced: ['Cleric', 'Fighter', 'Magic-User', 'Thief', 'Spellblade'],
    },
    classLevelLimits: {
      // Humans have no level limits — 14 in all classes
      "Acrobat_CLASS": 14, "Assassin_CLASS": 14, "Bard_CLASS": 14,
      "Cleric_CLASS": 14, "Druid_CLASS": 14, "Fighter_CLASS": 14,
      "Illusionist_CLASS": 14, "Knight_CLASS": 14, "Magic-User_CLASS": 14,
      "Paladin_CLASS": 14, "Ranger_CLASS": 14, "Thief_CLASS": 14, "Spellblade_CLASS": 14,
    },
    abilities: [
      {
        name: "Languages",
        languages: ["Alignment", "Common"],
        hideDescription: false,
        basicAvailableAt: 0,
        basicAvailableThrough: 14,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD:      stat block: "Alignment, Common"
        // BOOK:     stat block: "Alignment, Common"
      },
      {
        name: "Blessed",
        description: "Roll HP twice at each level, take the best result.",
        hideDescription: true,
        basicAvailableAt: 1,
        basicAvailableThrough: 14,
        advancedAvailableAt: 1,   // governs HP rolling at level 1, not level 0
        advancedAvailableThrough: 14,
        includeName: true,
        humanOnly: true,
        // BOOK:     "When rolling hit points (including at 1st level), the player of a human PC may roll twice and take the best result."
        // PROPOSED: "Roll HP twice at each level, take the best result."
      },
      {
        name: "Decisiveness",
        description: "Act first on tied initiative; +1 to individual initiative rolls.",
        hideDescription: true,
        basicAvailableAt: 0,
        basicAvailableThrough: 14,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        humanOnly: true,
        // BOOK:     "When an initiative roll is tied, humans act first, as if they had won initiative. If using the optional rule for individual initiative, humans get a bonus of +1 to initiative rolls."
        // PROPOSED: "Act first on tied initiative; +1 to individual initiative rolls."
      },
      {
        name: "Leadership",
        description: "All retainers and mercenaries gain +1 to loyalty and morale.",
        hideDescription: true,
        basicAvailableAt: 0,
        basicAvailableThrough: 14,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        humanOnly: true,
        // BOOK:     "All of a human's retainers and mercenaries gain a +1 bonus to loyalty and morale."
        // PROPOSED: "All retainers and mercenaries gain +1 to loyalty and morale."
      },
    ]
  },

  // ── Dwarf ──────────────────────────────────────────────────────────────────
  "Dwarf_RACE": {
    name: "Dwarf",
    code: "DW",
    description: "Stout, bearded underground-dwellers renowned for craftsmanship, stubbornness, and magic resistance.",
    abilityModifiers: { CON: 1, CHA: -1 },  // BOOK:     "Ability modifiers: –1 CHA, +1 CON"
    minimums: { CON: 9 },
    availableIn: { basic: true, advanced: true },
    availableClasses: {
      advanced: ['Cleric', 'Fighter', 'Thief'],
    },
    classLevelLimits: {
      // BOOK: Assassin 9th, Cleric 8th, Fighter 10th, Thief 9th
      "Assassin_CLASS": 9, "Cleric_CLASS": 8, "Fighter_CLASS": 10, "Thief_CLASS": 9,
    },
    abilities: [
      {
        name: "Languages",
        languages: ["Alignment", "Common", "Dwarvish", "Gnomish", "Goblin", "Kobold"],
        hideDescription: false,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD:      stat block: "Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold"
        // BOOK:     stat block: "Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold"
      },
      {
        name: "Combat",
        description: "Dwarves use any armour but only small or normal sized weapons; no longbows or two-handed swords.",
        hideDescription: false,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD:      "Dwarves can use all types of armour. Their stature means they can only use small or normal sized weapons. They cannot use longbows or two-handed swords."
        // BOOK:     "Due to their short height, dwarves can only use small or normal sized weapons. They cannot use longbows or two-handed swords."
        // PROPOSED: "Dwarves use any armour but only small or normal sized weapons; no longbows or two-handed swords."
      },
      {
        name: "Detect Construction Tricks",
        description: "As expert miners, 2-in-6 chance to detect new construction, sliding walls, or sloping passages.",
        hideDescription: false,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD:      "As expert miners, dwarves have a 2-in-6 chance of being able to detect new construction, sliding walls, or sloping passages when searching."
        // BOOK:     "As expert miners, dwarves have a 2-in-6 chance of being able to detect new construction, sliding walls, or sloping passages when searching."
        // PROPOSED: "As expert miners, 2-in-6 chance to detect new construction, sliding walls, or sloping passages."
      },
      {
        name: "Detect Room Traps",
        description: "Construction expertise gives a 2-in-6 chance to detect non-magical room traps when searching.",
        hideDescription: false,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD:      "Due to their expertise with construction, dwarves have a 2-in-6 chance of detecting non-magical room traps when searching."
        // BOOK:     "Due to their expertise with construction, dwarves have a 2-in-6 chance of detecting non-magical room traps when searching."
        // PROPOSED: "Construction expertise gives a 2-in-6 chance to detect non-magical room traps when searching."
      },
      {
        name: "Infravision",
        description: "Dwarves have infravision to 60'.",
        hideDescription: false,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD:      "Dwarves have infravision to 60'."
        // BOOK:     "Dwarves have infravision to 60'."
        // PROPOSED: "Dwarves have infravision to 60'."
      },
      {
        name: "Listening at Doors",
        description: "Dwarves have a 2-in-6 chance of hearing noises.",
        hideDescription: false,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD:      "Dwarves have a 2-in-6 chance of hearing noises."
        // BOOK:     "Dwarves have a 2-in-6 chance of hearing noises."
        // PROPOSED: "Dwarves have a 2-in-6 chance of hearing noises."
      },
      {
        name: "Resilience",
        description: "CON-based bonus to saves vs poison, spells, and wands/rods/staves (+0/+2/+3/+4/+5).",
        hideDescription: true,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        applyOnly: true,
        saveModifier: {
          formula: "CON_RESILIENCE",
          appliesTo: ["Death", "Wands", "Spells"]
        },
        // BOOK:     "Dwarves' natural constitution and resistance to magic grants them a bonus to saving throws versus poison, spells, and magic wands, rods, and staves. 6 or lower: No bonus | 7–10: +2 | 11–14: +3 | 15–17: +4 | 18: +5"
        // PROPOSED: "CON-based bonus to saves vs poison, spells, and wands/rods/staves (+0/+2/+3/+4/+5)."
      },
    ]
  },

  // ── Elf ────────────────────────────────────────────────────────────────────
  "Elf_RACE": {
    name: "Elf",
    code: "EL",
    description: "Slender, fey demihumans with keen senses, an affinity for magic, and immunity to ghoul paralysis.",
    abilityModifiers: { DEX: 1, CON: -1 },  // BOOK:     "Ability modifiers: –1 CON, +1 DEX"
    minimums: { INT: 9 },
    availableIn: { basic: true, advanced: true },
    availableClasses: {
      advanced: ['Fighter', 'Magic-User', 'Spellblade'],
    },
    classLevelLimits: {
      // BOOK: Acrobat 10th, Assassin 10th, Cleric 7th, Druid 8th, Fighter 7th,
      //       Knight 11th, Magic-User 11th, Ranger 11th, Thief 10th
      "Acrobat_CLASS": 10, "Assassin_CLASS": 10, "Cleric_CLASS": 7, "Druid_CLASS": 8,
      "Fighter_CLASS": 7, "Knight_CLASS": 11, "Magic-User_CLASS": 11,
      "Ranger_CLASS": 11, "Spellblade_CLASS": 10, "Thief_CLASS": 10,
    },
    abilities: [
      {
        name: "Languages",
        languages: ["Alignment", "Common", "Elvish", "Gnoll", "Hobgoblin", "Orcish"],
        hideDescription: false,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD:      stat block: "Alignment, Common, Elvish, Gnoll, Hobgoblin, Orcish"
        // BOOK:     stat block: "Alignment, Common, Elvish, Gnoll, Hobgoblin, Orcish"
      },
      {
        name: "Detect Secret Doors",
        description: "Elves have a 2-in-6 chance of locating secret or hidden doors when searching.",
        hideDescription: false,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD:      "Elves have a 2-in-6 chance of locating secret or hidden doors when searching."
        // BOOK:     "Elves have keen eyes that allow them, when actively searching, to detect hidden and secret doors with a 2-in-6 chance."
        // PROPOSED: "Elves have a 2-in-6 chance of locating secret or hidden doors when searching."
      },
      {
        name: "Immunity to Ghoul Paralysis",
        description: "Elves are immune to the paralysing effect of ghouls' attacks.",
        hideDescription: false,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD:      "Elves are immune to the paralysing effect of ghouls' attacks."
        // BOOK:     "Elves are completely unaffected by the paralysis that ghouls can inflict."
        // PROPOSED: "Elves are immune to the paralysing effect of ghouls' attacks."
      },
      {
        name: "Infravision",
        description: "Elves have infravision to 60'.",
        hideDescription: false,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD:      "Elves have infravision to 60'."
        // BOOK:     "Elves have infravision to 60'."
        // PROPOSED: "Elves have infravision to 60'."
      },
      {
        name: "Listening at Doors",
        description: "Elves have a 2-in-6 chance of hearing noises.",
        hideDescription: false,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD:      "Elves have a 2-in-6 chance of hearing noises."
        // BOOK:     "Elves have a 2-in-6 chance of hearing noises."
        // PROPOSED: "Elves have a 2-in-6 chance of hearing noises."
      },
    ]
  },

  // ── Gnome ──────────────────────────────────────────────────────────────────
  "Gnome_RACE": {
    name: "Gnome",
    code: "GN",
    description: "Small, bearded underground-dwellers with a love of machinery, gems, and burrowing animals.",
    abilityModifiers: {},  // no ability score modifiers
    minimums: { CON: 9, INT: 9 },  // BOOK:     "Requirements: Minimum CON 9, minimum INT 9"
    availableIn: { basic: true, advanced: true },
    availableClasses: {
      advanced: ['Cleric', 'Fighter', 'Illusionist', 'Thief'],
      // BOOK:     "Available Classes: Assassin, Cleric, Fighter, Illusionist, Thief"
      // Illusionist is confirmed traditional (classLevelLimits max 7th)
    },
    classLevelLimits: {
      // BOOK: Assassin 6th, Cleric 7th, Fighter 6th, Illusionist 7th, Thief 8th
      "Assassin_CLASS": 6, "Cleric_CLASS": 7, "Fighter_CLASS": 6,
      "Illusionist_CLASS": 7, "Thief_CLASS": 8,
    },
    abilities: [
      {
        name: "Languages",
        languages: ["Alignment", "Common", "Gnomish", "Dwarvish", "Kobold", "Burrowing mammals"],
        hideDescription: true,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK:     stat block: "Alignment, Common, Gnomish, Dwarvish, Kobold, the secret language of burrowing mammals"
      },
      {
        name: "Combat",
        description: "Armour must be tailored to size; only weapons appropriate to stature; no longbows or two-handed swords.",
        hideDescription: true,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK:     "Armour must be tailored to gnomes' small size. Likewise, gnomes can only use weapons appropriate to their stature (as determined by the referee). They cannot use longbows or two-handed swords."
        // PROPOSED: "Armour must be tailored to size; only weapons appropriate to stature; no longbows or two-handed swords."
      },
      {
        name: "Defensive Bonus",
        description: "+2 bonus to Armour Class when attacked by large opponents (greater than human-sized).",
        hideDescription: true,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK:     "Due to their small size, gnomes gain a +2 bonus to Armour Class when attacked by large opponents (greater than human-sized)."
        // PROPOSED: "+2 bonus to Armour Class when attacked by large opponents (greater than human-sized)."
      },
      {
        name: "Detect Construction Tricks",
        description: "2-in-6 chance to detect new construction, sliding walls, or sloping passages when searching.",
        hideDescription: true,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK:     "As expert tunnellers, gnomes have a 2-in-6 chance of being able to detect new construction, sliding walls, or sloping passages when searching."
        // PROPOSED: "2-in-6 chance to detect new construction, sliding walls, or sloping passages when searching."
      },
      {
        name: "Infravision",
        description: "90'",
        hideDescription: true,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK:     "Gnomes have infravision to 90'."
      },
      {
        name: "Listening at Doors",
        description: "2-in-6 chance of hearing noises.",
        hideDescription: true,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK:     "Gnomes have a 2-in-6 chance of hearing noises."
      },
      {
        name: "Magic Resistance",
        description: "CON-based bonus to saves vs spells and wands/rods/staves (+0/+2/+3/+4/+5).",
        hideDescription: true,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        applyOnly: true,
        saveModifier: {
          formula: "CON_MAGIC_RESISTANCE",
          appliesTo: ["Wands", "Spells"]
        },
        // BOOK:     "Gnomes are naturally resistant to magic, gaining a bonus to saving throws versus spells and magic wands, rods, and staves. This bonus depends on a gnome's CON score: 6 or lower: No bonus | 7–10: +2 | 11–14: +3 | 15–17: +4 | 18: +5"
        // PROPOSED: "CON-based bonus to saves vs spells and wands/rods/staves (+0/+2/+3/+4/+5)."
      },
      {
        name: "Speak with Burrowing Mammals",
        description: "Know and speak the secret language of burrowing mammals (e.g. badgers, moles).",
        hideDescription: true,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK:     "Gnomes often keep burrowing mammals such as badgers and moles as pets. They know the secret language of such creatures."
        // PROPOSED: "Know and speak the secret language of burrowing mammals (e.g. badgers, moles)."
      },
    ]
  },

  // ── Halfling ───────────────────────────────────────────────────────────────
  "Halfling_RACE": {
    name: "Halfling",
    code: "HA",
    description: "Small, rotund, and good-natured folk with keen aim, steady nerves, and a love of home comforts.",
    abilityModifiers: { STR: -1, DEX: 1 },  // BOOK:     "Ability modifiers: –1 STR, +1 DEX"
    minimums: { CON: 9, DEX: 9 },           // BOOK:     "Requirements: Minimum CON 9, minimum DEX 9"
    availableIn: { basic: true, advanced: true },
    availableClasses: {
      advanced: ['Fighter', 'Thief'],
    },
    classLevelLimits: {
      // BOOK: Druid 6th, Fighter 6th, Thief 8th
      "Druid_CLASS": 6, "Fighter_CLASS": 6, "Thief_CLASS": 8,
    },
    abilities: [
      {
        name: "Languages",
        languages: ["Alignment", "Common", "Halfling"],
        hideDescription: false,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD:      stat block: "Alignment, Common, Halfling"
        // BOOK:     stat block: "Alignment, Common, Halfling"
      },
      {
        name: "Combat",
        description: "Halflings use any armour or weapon sized for them; no longbows or two-handed swords.",
        hideDescription: false,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD:      "Halflings can use all types of armour, but it must be tailored to their small size. Similarly, they can use any weapon appropriate to their stature (as determined by the referee). They cannot use longbows or two-handed swords."
        // BOOK:     "Armour must be tailored to halflings' small size. Likewise, halflings can only use weapons appropriate to their stature (as determined by the referee). They cannot use longbows or two-handed swords."
        // PROPOSED: "Halflings use any armour or weapon sized for them; no longbows or two-handed swords."
      },
      {
        name: "Defensive Bonus",
        description: "+2 Armour Class bonus when attacked by large opponents (greater than human-sized).",
        hideDescription: false,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD:      "Due to their small size, halflings gain a +2 bonus to Armour Class when attacked by large opponents (greater than human-sized)."
        // BOOK:     "Due to their small size, halflings gain a +2 bonus to Armour Class when attacked by large opponents (greater than human-sized)."
        // PROPOSED: "+2 Armour Class bonus when attacked by large opponents (greater than human-sized)."
      },
      {
        name: "Initiative Bonus",
        description: "If using the optional rule for individual initiative, halflings get a bonus of +1 to initiative rolls.",
        hideDescription: false,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD:      "If using the optional rule for individual initiative, halflings get a bonus of +1 to initiative rolls."
        // BOOK:     "If using the optional rule for individual initiative, halflings get a bonus of +1 to initiative rolls."
        // PROPOSED: "If using the optional rule for individual initiative, halflings get a bonus of +1 to initiative rolls."
      },
      {
        name: "Listening at Doors",
        description: "Halflings have a 2-in-6 chance of hearing noises.",
        hideDescription: false,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD:      "Halflings have a 2-in-6 chance of hearing noises."
        // BOOK:     "Halflings have a 2-in-6 chance of hearing noises."
        // PROPOSED: "Halflings have a 2-in-6 chance of hearing noises."
      },
      {
        name: "Missile Attack Bonus",
        description: "Halflings' accuracy grants them a +1 bonus to attack rolls with all missile weapons.",
        hideDescription: false,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD:      "Halflings' accuracy grants them a +1 bonus to attack rolls with all missile weapons."
        // BOOK:     "Halflings' keen coordination grants them a +1 bonus to attack rolls with all missile weapons."
        // PROPOSED: "Halflings' accuracy grants them a +1 bonus to attack rolls with all missile weapons."
      },
      {
        name: "Resilience",
        description: "CON-based bonus to saves vs poison, spells, and wands/rods/staves (+0/+2/+3/+4/+5).",
        hideDescription: true,
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        applyOnly: true,
        saveModifier: {
          formula: "CON_RESILIENCE",
          appliesTo: ["Death", "Wands", "Spells"]
        },
        // BOOK:     "Halflings' natural constitution and resistance to magic grants them a bonus to saving throws versus poison, spells, and magic wands, rods, and staves. 6 or lower: No bonus | 7–10: +2 | 11–14: +3 | 15–17: +4 | 18: +5"
        // PROPOSED: "CON-based bonus to saves vs poison, spells, and wands/rods/staves (+0/+2/+3/+4/+5)."
      },
    ]
  },

  // ── NPC / Rare Races (level limits only — no ability data yet) ────────────
  "Drow_RACE": {
    name: "Drow",
    availableIn: { basic: false, advanced: false },  // NPC only
    classLevelLimits: {
      "Acrobat_CLASS": 10, "Assassin_CLASS": 10, "Cleric_CLASS": 11,
      "Fighter_CLASS": 7, "Knight_CLASS": 9, "Magic-User_CLASS": 9,
      "Ranger_CLASS": 9, "Thief_CLASS": 11,
    },
  },
  "Duergar_RACE": {
    name: "Duergar",
    availableIn: { basic: false, advanced: false },  // NPC only
    classLevelLimits: {
      "Assassin_CLASS": 9, "Cleric_CLASS": 8, "Fighter_CLASS": 9, "Thief_CLASS": 9,
    },
  },
  "Half-Elf_RACE": {
    name: "Half-Elf",
    availableIn: { basic: false, advanced: false },  // NPC only
    classLevelLimits: {
      "Acrobat_CLASS": 12, "Assassin_CLASS": 11, "Bard_CLASS": 12, "Cleric_CLASS": 5,
      "Druid_CLASS": 12, "Fighter_CLASS": 8, "Knight_CLASS": 12, "Magic-User_CLASS": 8,
      "Paladin_CLASS": 12, "Ranger_CLASS": 8, "Thief_CLASS": 12,
    },
  },
  "Half-Orc_RACE": {
    name: "Half-Orc",
    availableIn: { basic: false, advanced: false },  // NPC only
    classLevelLimits: {
      "Acrobat_CLASS": 8, "Assassin_CLASS": 8, "Cleric_CLASS": 4,
      "Fighter_CLASS": 10, "Thief_CLASS": 8,
    },
  },
  "Svirfneblin_RACE": {
    name: "Svirfneblin",
    availableIn: { basic: false, advanced: false },  // NPC only
    classLevelLimits: {
      "Assassin_CLASS": 8, "Cleric_CLASS": 7, "Fighter_CLASS": 6,
      "Illusionist_CLASS": 7, "Thief_CLASS": 8,
    },
  },

};
