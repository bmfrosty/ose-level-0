// shared-core.js — single source of truth for all shared data and logic
//
// Inlines:
//   shared-ability-scores.js — ability score math (modifiers, XP bonus, roll helpers)
//   shared-abilities.js      — class/race data (CLASS_INFO, RACE_INFO), progression helpers
//   shared-hit-points.js     — HP rolling and parsing
//   shared-character.js      — character object creation, starting gold

// ── Ability score math ────────────────────────────────────────────────────────

/**
 * Calculate ability modifier (-3 to +3)
 * @param {number} score - Ability score (3-18)
 * @returns {number} Modifier (-3 to +3)
 */
export function calculateModifier(score) {
    if (score <= 3) return -3;
    if (score <= 5) return -2;
    if (score <= 8) return -1;
    if (score <= 12) return 0;
    if (score <= 15) return 1;
    if (score <= 17) return 2;
    return 3; // 18
}

/**
 * Format modifier for display (+1, -2, etc.)
 * @param {number} mod - Modifier value
 * @returns {string} Formatted modifier
 */
export function formatModifier(mod) {
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

/**
 * Calculate XP bonus from prime requisite (-20% to +10%)
 * @param {number} score - Prime requisite score
 * @returns {number} XP bonus percentage
 */
export function calculateXPBonus(score) {
    if (score <= 5) return -20;
    if (score <= 8) return -10;
    if (score <= 12) return 0;
    if (score <= 15) return 5;
    return 10; // 16+
}

/**
 * Check if scores meet Tough Characters requirements
 * At least ONE of STR/DEX/INT/WIS must be ≥ 13
 * @param {Object} scores - Ability scores object
 * @returns {boolean} True if requirements met
 */
export function meetsToughCharactersRequirements(scores) {
    return scores.STR >= 13 || scores.DEX >= 13 ||
           scores.INT >= 13 || scores.WIS >= 13;
}

/**
 * Check if scores meet prime requisite requirements for a class
 * All prime requisites for the class must be ≥ 13
 * @param {Object} scores - Ability scores object
 * @param {string} className - Class name
 * @returns {boolean} True if requirements met
 */
export function meetsPrimeRequisiteRequirements(scores, className) {
    const primeReqs = getPrimeRequisites(className);
    if (primeReqs.length === 0) return true; // No prime requisites
    return primeReqs.every(ability => scores[ability] >= 13);
}

/**
 * Roll a single die
 * @param {number} sides - Number of sides on the die
 * @returns {number} Die roll result
 */
export function rollSingleDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll multiple dice
 * @param {number} numDice - Number of dice to roll
 * @param {number} sides - Number of sides on each die
 * @returns {number} Total of all dice
 */
export function rollDice(numDice, sides) {
    let total = 0;
    for (let i = 0; i < numDice; i++) {
        total += rollSingleDie(sides);
    }
    return total;
}

/**
 * Roll a single ability score (3d6) — one roll, no retry.
 * Minimum enforcement is done by the caller (rollAbilities) for the full set.
 * @param {string} abilityName - Name of ability for logging
 * @returns {number} Ability score (3–18)
 */
export function rollAbilityScore(abilityName) {
    const rolls = [rollSingleDie(6), rollSingleDie(6), rollSingleDie(6)];
    const score = rolls[0] + rolls[1] + rolls[2];
    console.log(`  ${abilityName}: [${rolls.join(', ')}] = ${score}`);
    return score;
}

/**
 * Roll all ability scores
 * @param {Object} minimumScores - Minimum scores for each ability
 * @param {boolean} toughCharacters - Whether Tough Characters is enabled
 * @param {string} className - Class name (optional, for prime requisite check)
 * @param {boolean|number} primeRequisite13 - Whether prime requisites must be ≥ 13 (legacy boolean) OR minimum value (9 or 13)
 * @returns {Object} Ability scores object
 */
export function rollAbilities(minimumScores, toughCharacters, className = null, primeRequisite13 = false) {
    let scores;
    let setAttempts = 0;

    // Handle both legacy boolean and new number format
    let primeReqMinimum = null;
    if (primeRequisite13 === true) {
        primeReqMinimum = 13; // Legacy: true means ≥ 13
    } else if (typeof primeRequisite13 === 'number') {
        primeReqMinimum = primeRequisite13; // New: 9 or 13
    }

    console.log('=== Rolling Ability Scores ===');
    if (toughCharacters) {
        console.log('Tough Characters enabled: At least one of STR/DEX/INT/WIS must be ≥ 13');
    }
    if (primeReqMinimum && className) {
        const primeReqs = getPrimeRequisites(className);
        console.log(`Prime Requisite ≥ ${primeReqMinimum} enabled: At least one of ${primeReqs.join(', ')} must be ≥ ${primeReqMinimum} for ${className}`);
    }

    do {
        setAttempts++;
        if (setAttempts > 1) {
            console.log(`\nAttempt #${setAttempts} (previous set failed requirements):`);
        } else {
            console.log('\nRolling 3d6 for each ability:');
        }

        scores = {
            STR: rollAbilityScore('STR'),
            INT: rollAbilityScore('INT'),
            WIS: rollAbilityScore('WIS'),
            DEX: rollAbilityScore('DEX'),
            CON: rollAbilityScore('CON'),
            CHA: rollAbilityScore('CHA')
        };

        // Check individual minimums — if any fail, reroll the entire set
        const _ABILITIES = ['STR','INT','WIS','DEX','CON','CHA'];
        const _failedMins = _ABILITIES.filter(a => scores[a] < (minimumScores[a] || 3));
        if (_failedMins.length > 0) {
            console.log(`❌ Failed individual minimums: ${_failedMins.map(a => `${a}=${scores[a]}<${minimumScores[a]}`).join(', ')}`);
            continue;
        }

        // Check Tough Characters requirement
        if (toughCharacters && !meetsToughCharactersRequirements(scores)) {
            console.log('❌ Failed Tough Characters check (need at least one of STR/DEX/INT/WIS ≥ 13)');
            continue;
        }

        // Check Prime Requisite requirement
        if (primeReqMinimum && className) {
            const primeReqs = getPrimeRequisites(className);
            // Check if at least ONE prime requisite meets the minimum
            const meetsPR = primeReqs.some(ability => scores[ability] >= primeReqMinimum);
            if (!meetsPR) {
                const prValues = primeReqs.map(ability => `${ability}=${scores[ability]}`).join(', ');
                console.log(`❌ Failed Prime Requisite check (need at least one of ${primeReqs.join(', ')} ≥ ${primeReqMinimum}, got: ${prValues})`);
                continue;
            }
        }

        // All checks passed
        break;
    } while (true);

    if (setAttempts > 1) {
        console.log(`✅ Passed all requirements after ${setAttempts} attempts`);
    }

    console.log('\n=== Final Ability Scores ===');
    console.log(`STR: ${scores.STR} (${formatModifier(calculateModifier(scores.STR))})`);
    console.log(`INT: ${scores.INT} (${formatModifier(calculateModifier(scores.INT))})`);
    console.log(`WIS: ${scores.WIS} (${formatModifier(calculateModifier(scores.WIS))})`);
    console.log(`DEX: ${scores.DEX} (${formatModifier(calculateModifier(scores.DEX))})`);
    console.log(`CON: ${scores.CON} (${formatModifier(calculateModifier(scores.CON))})`);
    console.log(`CHA: ${scores.CHA} (${formatModifier(calculateModifier(scores.CHA))})`);
    console.log('==============================\n');

    return { scores, attempts: setAttempts };
}

// ── Class and race data ───────────────────────────────────────────────────────

const LEGACY_RACE_NAMES = {
    "Human": "Human_RACE",
    "Dwarf": "Dwarf_RACE",
    "Elf": "Elf_RACE",
    "Gnome": "Gnome_RACE",
    "Halfling": "Halfling_RACE"
};

function normalizeRaceName(raceName) {
    if (raceName.endsWith("_RACE")) return raceName;
    return LEGACY_RACE_NAMES[raceName] || raceName;
}

// Class descriptions and basic info
export const CLASS_INFO = {
  Cleric: {
    code: 'CL',
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
  }
};

// Helper function to get class info
export function getClassInfo(className) {
  return CLASS_INFO[className] || null;
}

export function getPrimeRequisites(className) {
    const base = (className || '').replace(/_CLASS$/, '');
    const raw = CLASS_INFO[base]?.primeRequisite ?? '';
    return raw ? raw.split(' and ').map(s => s.trim()) : [];
}

// Helper function to get class abilities
export function getClassAbilities(className) {
  return CLASS_INFO[className]?.abilities || [];
}

// Helper function to get abilities available at a specific level
// Respects availableThrough: entries with availableThrough < level are excluded
// (use a replacement entry with a higher availableAt when an ability's text changes at a level)
export function getAbilitiesAtLevel(className, level) {
  const abilities = CLASS_INFO[className]?.abilities || [];
  return abilities.filter(ability =>
    ability.availableAt <= level &&
    (ability.availableThrough === undefined || ability.availableThrough >= level)
  );
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
  canRaceTakeClass,
  meetsRequirements
};

/**
 * Get class progression data (saving throws, attack bonus, XP)
 * @param {Object} options - Progression options
 * @param {string} options.className - Class name (e.g., "Fighter")
 * @param {number} options.level - Character level
 * @param {Object} options.abilityScores - Ability scores object
 * @param {Object} options.classData - Class data module (OSE or Gygar)
 * @returns {Object} Progression data object
 */
export function getClassProgressionData(options) {
    const { className, level, abilityScores, classData } = options;
    
    console.log('\n=== Getting Class Progression Data ===');
    console.log(`Class: ${className}, Level: ${level}`);
    
    // className should already have _CLASS suffix
    
    // Get saving throws
    const savingThrows = classData.getSavingThrows(className, level);
    console.log('\nSaving Throws:');
    console.log(`  Death/Poison: ${savingThrows.death}`);
    console.log(`  Wands: ${savingThrows.wands}`);
    console.log(`  Paralysis/Petrify: ${savingThrows.paralysis}`);
    console.log(`  Breath Attacks: ${savingThrows.breath}`);
    console.log(`  Spells/Rods/Staves: ${savingThrows.spells}`);
    
    // Get attack bonus
    const attackBonus = classData.getAttackBonus(className, level);
    console.log(`\nAttack Bonus: ${attackBonus >= 0 ? '+' : ''}${attackBonus}`);
    
    // Get XP tracking
    const currentXP = 0;
    const xpForCurrentLevel = classData.getXPRequired(className, level);
    const xpForNextLevel = classData.getXPRequired(className, level + 1);
    const xpToNextLevel = xpForNextLevel ? xpForNextLevel - currentXP : null;
    
    console.log(`\nXP Tracking:`);
    console.log(`  Current XP: ${currentXP}`);
    console.log(`  XP for Level ${level}: ${xpForCurrentLevel}`);
    if (xpForNextLevel) {
        console.log(`  XP for Level ${level + 1}: ${xpForNextLevel}`);
        console.log(`  XP to Next Level: ${xpToNextLevel}`);
    } else {
        console.log(`  Maximum level reached!`);
    }
    
    // Calculate XP bonus from prime requisites
    const primeReqs = getPrimeRequisites(className);
    let xpBonus = 0;
    if (primeReqs.length > 0) {
        // OSE rule: bonus is determined by the LOWEST prime requisite score
        xpBonus = 10; // sentinel — will be replaced by actual minimum
        primeReqs.forEach(ability => {
            xpBonus = Math.min(xpBonus, calculateXPBonus(abilityScores[ability]));
        });
    }
    console.log(`  Prime Requisite XP Bonus: ${xpBonus >= 0 ? '+' : ''}${xpBonus}%`);
    
    console.log('======================================\n');
    
    return {
        savingThrows,
        attackBonus,
        currentXP,
        xpForCurrentLevel,
        xpForNextLevel,
        xpToNextLevel,
        xpBonus
    };
}

/**
 * Get class-specific features (spell slots, thief skills, turn undead, class abilities)
 * @param {Object} options - Features options
 * @param {string} options.className - Class name
 * @param {number} options.level - Character level
 * @param {Object} options.classData - Class data module (OSE or Gygar)
 * @param {Object} options.ClassDataShared - Shared class data module
 * @returns {Object} Features object
 */
export function getClassFeatures(options) {
    const { className, level, classData, ClassDataShared } = options;
    
    console.log('\n=== Getting Class-Specific Features ===');
    console.log(`Class: ${className}, Level: ${level}`);
    
    // className should already have _CLASS suffix
    
    const features = {
        spellSlots: null,
        thiefSkills: null,
        turnUndead: null,
        classAbilities: []
    };
    
    // Extract base class name without _CLASS suffix for comparisons
    const baseClassName = className.replace('_CLASS', '');
    
    // Spell slots for spellcasters
    const spellcasters = ['Cleric', 'Magic-User', 'Elf', 'Gnome', 'Spellblade'];
    if (spellcasters.includes(baseClassName)) {
        features.spellSlots = classData.getSpellSlots(className, level);
        console.log('\nSpell Slots:');
        if (features.spellSlots) {
            Object.entries(features.spellSlots).forEach(([spellLevel, slots]) => {
                if (slots > 0) {
                    console.log(`  Level ${spellLevel}: ${slots} slots`);
                }
            });
        } else {
            console.log('  No spell slots at this level');
        }
    }
    
    // Thief skills
    if (baseClassName === 'Thief') {
        features.thiefSkills = typeof classData.getThiefSkills === 'function'
            ? classData.getThiefSkills(level)
            : null;
        console.log('\nThief Skills:');
        if (features.thiefSkills) {
            Object.entries(features.thiefSkills).forEach(([skill, value]) => {
                console.log(`  ${skill}: ${value}%`);
            });
        }
    }
    
    // Turn undead for clerics
    if (baseClassName === 'Cleric') {
        // Use HD categories instead of monster names
        const undeadHDTypes = ['1HD', '2HD', '2*HD', '3HD', '4HD', '5HD', '6HD', '7-9HD'];
        features.turnUndead = {};
        console.log('\nTurn Undead:');
        undeadHDTypes.forEach(type => {
            const target = classData.getTurnUndead(level, type);
            features.turnUndead[type] = target;
            if (target === 'T') {
                console.log(`  ${type}: T (automatically turned)`);
            } else if (target === 'D') {
                console.log(`  ${type}: D (automatically destroyed)`);
            } else if (target === null || target === undefined) {
                console.log(`  ${type}: - (cannot turn)`);
            } else {
                console.log(`  ${type}: ${target}+ (roll 2d6)`);
            }
        });
    }
    
    // Class abilities (strip _CLASS suffix — CLASS_INFO keys are plain names like "Cleric", "Fighter")
    const allAbilities = ClassDataShared.getAbilitiesAtLevel(baseClassName, level);
    if (allAbilities && allAbilities.length > 0) {
        features.classAbilities = allAbilities;
        console.log('\nClass Abilities:');
        allAbilities.forEach(ability => {
            console.log(`  - ${ability.name}: ${ability.description}`);
        });
    }
    
    console.log('======================================\n');
    
    return features;
}

/**
 * Get CLASS ABILITIES for Basic Mode demihuman classes (displayed as 'CLASS ABILITIES')
 *
 * In Basic Mode, race = class (Dwarf class, Elf class, etc.) — there is no separate race.
 * These string-format abilities are shown in the single 'CLASS ABILITIES' section of the sheet.
 * Reads from CLASS_INFO[className].abilities in shared-class-data-shared.js (single source of truth).
 * @param {string} className - Class name with or without _CLASS suffix (e.g., "Dwarf", "Dwarf_CLASS")
 * @returns {Array} Array of formatted ability strings, or empty array if not a demihuman class
 */
export function getBasicModeClassAbilities(className) {
    console.log('\n=== Getting Basic Mode Class Abilities ===');
    console.log(`Class: ${className}`);

    const demihumanClasses = ['Dwarf', 'Elf', 'Halfling', 'Gnome'];

    // Strip _CLASS suffix so 'Dwarf_CLASS' -> 'Dwarf' matches CLASS_ABILITIES keys
    const baseClass = className.replace('_CLASS', '');

    if (!demihumanClasses.includes(baseClass)) {
        console.log('Not a demihuman class - no class abilities');
        console.log('==========================================\n');
        return [];
    }

    // Level 1 covers all abilities available from character creation.
    // Abilities with basicMode: false are for Advanced mode only.
    const abilities = getAbilitiesAtLevel(baseClass, 1)
        .filter(a => a.basicMode !== false)
        .map(a => a.includeName ? `${a.name}: ${a.description}` : a.description);

    console.log('\nClass Abilities:');
    abilities.forEach(ability => {
        console.log(`  - ${ability}`);
    });

    console.log('==========================================\n');

    return abilities;
}

// ============================================================================
// RACIAL CLASS LEVEL LIMITS (NORMAL MODE)
// ============================================================================
// Class level limits have been migrated into RACE_INFO[race].classLevelLimits.
// See each race entry below.
// In Smoothified Mode (Gygar), these limits are ignored.

/**
 * Get maximum level for a race/class combination
 * @param {string} race - The race name (with or without _RACE suffix)
 * @param {string} className - The class name
 * @param {boolean} isSmootified - Whether Smoothified Mode is enabled (ignores limits)
 * @returns {number|null} Maximum level, or null if unlimited or combination not allowed
 */
export function getMaxLevel(race, className, isSmootified = false) {
    // Smoothified Mode: no level limits
    if (isSmootified) {
        return null;  // null = unlimited
    }

    const normalizedRace = normalizeRaceName(race);
    const limits = RACE_INFO[normalizedRace]?.classLevelLimits;
    if (!limits) {
        return null;  // Unknown race, assume unlimited
    }

    const maxLevel = limits[className];
    return maxLevel !== undefined ? maxLevel : null;  // null = combination not allowed
}

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
        name: "Blessed",
        description: "Roll HP twice at each level, take the best result.",
        basicAvailableAt: 1,
        basicAvailableThrough: 14,
        advancedAvailableAt: 1,   // governs HP rolling at level 1, not level 0
        advancedAvailableThrough: 14,
        // includeName: true,
        humanOnly: true,
        // BOOK: "When rolling hit points (including at 1st level), the player of a human PC
        //        may roll twice and take the best result."
        // PROPOSED: "Roll HP twice at each level, take the best result."
      },
      {
        name: "Decisiveness",
        description: "Act first on tied initiative; +1 to individual initiative rolls.",
        basicAvailableAt: 0,
        basicAvailableThrough: 14,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        // includeName: true,
        humanOnly: true,
        // BOOK: "When an initiative roll is tied, humans act first, as if they had won
        //        initiative. If using the optional rule for individual initiative, humans get
        //        a bonus of +1 to initiative rolls."
        // PROPOSED: "Act first on tied initiative; +1 to individual initiative rolls."
      },
      {
        name: "Leadership",
        description: "All retainers and mercenaries gain +1 to loyalty and morale.",
        basicAvailableAt: 0,
        basicAvailableThrough: 14,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        // includeName: true,
        humanOnly: true,
        // BOOK: "All of a human's retainers and mercenaries gain a +1 bonus to loyalty
        //        and morale."
        // PROPOSED: "All retainers and mercenaries gain +1 to loyalty and morale."
      },
    ]
  },

  // ── Dwarf ──────────────────────────────────────────────────────────────────
  "Dwarf_RACE": {
    name: "Dwarf",
    code: "DW",
    description: "Stout, bearded underground-dwellers renowned for craftsmanship, stubbornness, and magic resistance.",
    abilityModifiers: { CON: 1, CHA: -1 },  // BOOK: "Ability modifiers: –1 CHA, +1 CON"
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
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD: stat block: "Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold"
      },
      {
        name: "Combat",
        description: "May only use small or normal weapons; no longbows or two-handed swords.",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        // includeName: true,
        // BOOK: "Due to their short height, dwarves can only use small or normal sized
        //        weapons. They cannot use longbows or two-handed swords."
        // PROPOSED: "May only use small or normal weapons; no longbows or two-handed swords."
      },
      {
        name: "Detect Construction Tricks",
        description: "2-in-6 chance to detect new construction, sliding walls, or sloping passages when searching.",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK: "As expert miners, dwarves have a 2-in-6 chance of being able to detect new
        //        construction, sliding walls, or sloping passages when searching."
        // PROPOSED: "2-in-6 chance to detect new construction, sliding walls, or sloping passages when searching."
      },
      {
        name: "Detect Room Traps",
        description: "2-in-6 chance to detect non-magical room traps when searching.",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK: "Due to their expertise with construction, dwarves have a 2-in-6 chance of
        //        detecting non-magical room traps when searching."
        // PROPOSED: "2-in-6 chance to detect non-magical room traps when searching."
      },
      {
        name: "Infravision",
        description: "60'",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK: "Dwarves have infravision to 60'."
      },
      {
        name: "Listening at Doors",
        description: "2-in-6 chance of hearing noises.",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK: "Dwarves have a 2-in-6 chance of hearing noises."
      },
      {
        name: "Resilience",
        description: "CON-based bonus to saves vs poison, spells, and wands/rods/staves (+0/+2/+3/+4/+5).",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        // includeName: true,
        saveModifier: {
          formula: "CON_RESILIENCE",
          appliesTo: ["Death", "Wands", "Spells"]
        },
        // BOOK: "Dwarves' natural constitution and resistance to magic grants them a bonus
        //        to saving throws versus poison, spells, and magic wands, rods, and staves.
        //        6 or lower: No bonus | 7–10: +2 | 11–14: +3 | 15–17: +4 | 18: +5"
        // PROPOSED: "CON-based bonus to saves vs poison, spells, and wands/rods/staves (+0/+2/+3/+4/+5)."
      },
    ]
  },

  // ── Elf ────────────────────────────────────────────────────────────────────
  "Elf_RACE": {
    name: "Elf",
    code: "EL",
    description: "Slender, fey demihumans with keen senses, an affinity for magic, and immunity to ghoul paralysis.",
    abilityModifiers: { DEX: 1, CON: -1 },  // BOOK: "Ability modifiers: –1 CON, +1 DEX"
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
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD: stat block: "Alignment, Common, Elvish, Gnoll, Hobgoblin, Orcish"
      },
      {
        name: "Detect Secret Doors",
        description: "2-in-6 chance to detect hidden or secret doors when actively searching.",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK: "Elves have keen eyes that allow them, when actively searching, to detect
        //        hidden and secret doors with a 2-in-6 chance."
        // PROPOSED: "2-in-6 chance to detect hidden or secret doors when actively searching."
      },
      {
        name: "Immunity to Ghoul Paralysis",
        description: "Immune to the paralysing effect of ghouls' attacks.",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        // includeName: true,
        // BOOK: "Elves are completely unaffected by the paralysis that ghouls can inflict."
        // PROPOSED: "Immune to the paralysing effect of ghouls' attacks."
      },
      {
        name: "Infravision",
        description: "60'",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK: "Elves have infravision to 60'."
      },
      {
        name: "Listening at Doors",
        description: "2-in-6 chance of hearing noises.",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK: "Elves have a 2-in-6 chance of hearing noises."
      },
    ]
  },

  // ── Gnome ──────────────────────────────────────────────────────────────────
  "Gnome_RACE": {
    name: "Gnome",
    code: "GN",
    description: "Small, bearded underground-dwellers with a love of machinery, gems, and burrowing animals.",
    abilityModifiers: {},  // no ability score modifiers
    minimums: { CON: 9, INT: 9 },  // BOOK: "Requirements: Minimum CON 9, minimum INT 9"
    availableIn: { basic: true, advanced: true },
    availableClasses: {
      advanced: ['Cleric', 'Fighter', 'Illusionist', 'Thief'],
      // BOOK: "Available Classes: Assassin, Cleric, Fighter, Illusionist, Thief"
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
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK: stat block: "Alignment, Common, Gnomish, Dwarvish, Kobold, the secret language of burrowing mammals"
      },
      {
        name: "Combat",
        description: "Armour must be tailored to size; only weapons appropriate to stature; no longbows or two-handed swords.",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        // includeName: true,
        // BOOK: "Armour must be tailored to gnomes' small size. Likewise, gnomes can only use
        //        weapons appropriate to their stature (as determined by the referee). They
        //        cannot use longbows or two-handed swords."
        // PROPOSED: "Armour must be tailored to size; only weapons appropriate to stature; no longbows or two-handed swords."
      },
      {
        name: "Defensive Bonus",
        description: "+2 bonus to Armour Class when attacked by large opponents (greater than human-sized).",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK: "Due to their small size, gnomes gain a +2 bonus to Armour Class when
        //        attacked by large opponents (greater than human-sized)."
        // PROPOSED: "+2 bonus to Armour Class when attacked by large opponents (greater than human-sized)."
      },
      {
        name: "Detect Construction Tricks",
        description: "2-in-6 chance to detect new construction, sliding walls, or sloping passages when searching.",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK: "As expert tunnellers, gnomes have a 2-in-6 chance of being able to detect
        //        new construction, sliding walls, or sloping passages when searching."
        // PROPOSED: "2-in-6 chance to detect new construction, sliding walls, or sloping passages when searching."
      },
      {
        name: "Infravision",
        description: "90'",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK: "Gnomes have infravision to 90'."
      },
      {
        name: "Listening at Doors",
        description: "2-in-6 chance of hearing noises.",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK: "Gnomes have a 2-in-6 chance of hearing noises."
      },
      {
        name: "Magic Resistance",
        description: "CON-based bonus to saves vs spells and wands/rods/staves (+0/+2/+3/+4/+5).",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        // includeName: true,
        saveModifier: {
          formula: "CON_MAGIC_RESISTANCE",
          appliesTo: ["Wands", "Spells"]
        },
        // BOOK: "Gnomes are naturally resistant to magic, gaining a bonus to saving throws
        //        versus spells and magic wands, rods, and staves. This bonus depends on a
        //        gnome's CON score: 6 or lower: No bonus | 7–10: +2 | 11–14: +3 | 15–17: +4 | 18: +5"
        // PROPOSED: "CON-based bonus to saves vs spells and wands/rods/staves (+0/+2/+3/+4/+5)."
      },
      {
        name: "Speak with Burrowing Mammals",
        description: "Know and speak the secret language of burrowing mammals (e.g. badgers, moles).",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        // includeName: true,
        // BOOK: "Gnomes often keep burrowing mammals such as badgers and moles as pets. They
        //        know the secret language of such creatures."
        // PROPOSED: "Know and speak the secret language of burrowing mammals (e.g. badgers, moles)."
      },
    ]
  },

  // ── Halfling ───────────────────────────────────────────────────────────────
  "Halfling_RACE": {
    name: "Halfling",
    code: "HA",
    description: "Small, rotund, and good-natured folk with keen aim, steady nerves, and a love of home comforts.",
    abilityModifiers: { STR: -1, DEX: 1 },  // BOOK: "Ability modifiers: –1 STR, +1 DEX"
    minimums: { CON: 9, DEX: 9 },           // BOOK: "Requirements: Minimum CON 9, minimum DEX 9"
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
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // SRD: stat block: "Alignment, Common, Halfling"
      },
      {
        name: "Combat",
        description: "Armour must be tailored to size; only weapons appropriate to stature; no longbows or two-handed swords.",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        // includeName: true,
        // BOOK: "Armour must be tailored to halflings' small size. Likewise, halflings can
        //        only use weapons appropriate to their stature (as determined by the referee).
        //        They cannot use longbows or two-handed swords."
        // PROPOSED: "Armour must be tailored to size; only weapons appropriate to stature; no longbows or two-handed swords."
      },
      {
        name: "Defensive Bonus",
        description: "+2 bonus to Armour Class when attacked by large opponents (greater than human-sized).",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK: "Due to their small size, halflings gain a +2 bonus to Armour Class when
        //        attacked by large opponents (greater than human-sized)."
        // PROPOSED: "+2 bonus to Armour Class when attacked by large opponents (greater than human-sized)."
      },
      {
        name: "Initiative Bonus",
        description: "+1 to initiative rolls (optional individual initiative rule).",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK: "If using the optional rule for individual initiative, halflings get a bonus
        //        of +1 to initiative rolls."
        // PROPOSED: "+1 to initiative rolls (optional individual initiative rule)."
      },
      {
        name: "Listening at Doors",
        description: "2-in-6 chance of hearing noises.",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK: "Halflings have a 2-in-6 chance of hearing noises."
      },
      {
        name: "Missile Attack Bonus",
        description: "+1 bonus to attack rolls with all missile weapons.",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        includeName: true,
        // BOOK: "Halflings' keen coordination grants them a +1 bonus to attack rolls with
        //        all missile weapons."
        // PROPOSED: "+1 bonus to attack rolls with all missile weapons."
      },
      {
        name: "Resilience",
        description: "CON-based bonus to saves vs poison, spells, and wands/rods/staves (+0/+2/+3/+4/+5).",
        basicAvailableAt: 0,
        basicAvailableThrough: 0,
        advancedAvailableAt: 0,
        advancedAvailableThrough: 14,
        // includeName: true,
        saveModifier: {
          formula: "CON_RESILIENCE",
          appliesTo: ["Death", "Wands", "Spells"]
        },
        // BOOK: "Halflings' natural constitution and resistance to magic grants them a bonus
        //        to saving throws versus poison, spells, and magic wands, rods, and staves.
        //        6 or lower: No bonus | 7–10: +2 | 11–14: +3 | 15–17: +4 | 18: +5"
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

// ============================================================================
// RACE_INFO HELPERS
// ============================================================================

/**
 * Get the RACE_INFO entry for a race (mirrors getClassInfo in shared-class-data-shared.js)
 * @param {string} race - Race name (with or without _RACE suffix)
 * @returns {Object|null} RACE_INFO entry, or null if not found
 */
export function getRaceInfo(race) {
    const normalizedRace = normalizeRaceName(race);
    return RACE_INFO[normalizedRace] || null;
}

/**
 * Get racial abilities visible at a given level in a given mode.
 * Filters on basicAvailableAt/Through or advancedAvailableAt/Through depending on mode.
 * Skips humanOnly entries unless humanRacialAbilities is true.
 * @param {string} race - Race name (with or without _RACE suffix)
 * @param {number} level - Character level (0–14)
 * @param {string} mode - 'basic' or 'advanced'
 * @param {boolean} [humanRacialAbilities] - Whether human racial abilities option is on
 * @returns {Array} Filtered array of ability entry objects
 */
export function getRaceAbilitiesAtLevel(race, level, mode = 'advanced', humanRacialAbilities = false) {
    const normalizedRace = normalizeRaceName(race);
    const raceData = RACE_INFO[normalizedRace];
    if (!raceData || !raceData.abilities) return [];

    const atKey   = mode === 'basic' ? 'basicAvailableAt'      : 'advancedAvailableAt';
    const throKey = mode === 'basic' ? 'basicAvailableThrough' : 'advancedAvailableThrough';

    return raceData.abilities.filter(a => {
        if (a.humanOnly && !humanRacialAbilities) return false;
        if (a[atKey] === undefined || a[throKey] === undefined) return false;
        return a[atKey] <= level && a[throKey] >= level;
    });
}

// ============================================================================
// RACIAL ABILITIES DATA (legacy — replaced by RACE_INFO above)
// ============================================================================

/**
 * Get racial abilities text for Advanced/0-Level Mode (returns array of lines)
 * In Advanced/0-Level Mode, race is separate from class
 * @param {string} race - The race name (e.g., "Dwarf_RACE", "Elf_RACE")
 * @param {Object} [options] - Optional overrides (bypass DOM reading)
 * @param {boolean} [options.isAdvanced] - Whether Advanced mode is active
 * @param {boolean} [options.humanRacialAbilities] - Whether human racial abilities are enabled
 * @returns {string[]} Array of racial ability descriptions
 */
export function getAdvancedModeRacialAbilities(race, options = {}) {
    let humanRacialAbilities = options.humanRacialAbilities;

    if (humanRacialAbilities === undefined) {
        if (typeof document !== 'undefined') {
            const humanAbilitiesCheckbox = document.getElementById('humanRacialAbilities');
            humanRacialAbilities = humanAbilitiesCheckbox ? humanAbilitiesCheckbox.checked : false;
        } else if (typeof process !== 'undefined' && process.env) {
            humanRacialAbilities = process.env.HUMAN_RACIAL_ABILITIES === 'true';
        }
    }

    // Level 0 is the level for race selection; show all abilities available at level 0.
    const abilities = getRaceAbilitiesAtLevel(race, 0, 'advanced', humanRacialAbilities);

    return abilities.map(a => {
        if (a.languages) {
            return `${a.name}: ${a.languages.join(', ')}`;
        }
        if (a.includeName) {
            return `${a.name}: ${a.description}`;
        }
        return a.description;
    });
}

// ============================================================================
// SAVING THROWS AND ATTACK BONUSES
// ============================================================================

// Saving throw tables for level 0 characters
// Same values for both Normal and Gygar modes at level 0
export const savingThrowsLevel0 = {
    Death: 14,
    Wands: 15,
    Paralysis: 16,
    Breath: 17,
    Spells: 18
};

// Attack bonus tables for level 0 characters
// Different values for Normal vs Gygar mode
export const attackBonusLevel0 = {
    Normal: -1,  // Penalty for untrained characters
    Gygar: 0     // No penalty in Gygar Mode (Castle Gygar house rules)
};

// ============================================================================
// SAVE FORMULA RESOLUTION
// ============================================================================

// CON-based bonus table shared by CON_RESILIENCE and CON_MAGIC_RESISTANCE formulas
const CON_BONUS_TABLE = [
    { max: 6,  bonus: 0 },
    { max: 10, bonus: 2 },
    { max: 14, bonus: 3 },
    { max: 17, bonus: 4 },
    { max: 18, bonus: 5 },
];

/**
 * Resolve a named save-modifier formula to a numeric bonus.
 * Replaces getDwarfResilienceBonus, getGnomeMagicResistanceBonus, getHalflingResilienceBonus.
 * @param {string} formula - Named formula key (e.g. "CON_RESILIENCE", "CON_MAGIC_RESISTANCE")
 * @param {Object} abilityScores - { STR, DEX, CON, INT, WIS, CHA } or array of {ability, roll}
 * @returns {number} Bonus value
 */
export function resolveFormula(formula, abilityScores) {
    // Accept either a plain object {CON: 12} or the results array [{ability:'CON', roll:12}]
    const con = Array.isArray(abilityScores)
        ? (abilityScores.find(r => r.ability === 'CON')?.roll ?? 10)
        : (abilityScores.CON ?? 10);

    if (formula === 'CON_RESILIENCE' || formula === 'CON_MAGIC_RESISTANCE') {
        for (const { max, bonus } of CON_BONUS_TABLE) {
            if (con <= max) return bonus;
        }
        return 5;
    }
    return 0;
}

/**
 * Apply racial save modifiers to a saves object, reading saveModifier entries from RACE_INFO.
 * Replaces calculateSavingThrows() for the racial-bonus portion.
 * Applies regardless of mode (Basic or Advanced) — save bonuses always apply.
 * @param {Object} saves - { Death, Wands, Paralysis, Breath, Spells } (mutated in place)
 * @param {string} race - Race name (with or without _RACE suffix)
 * @param {Object|Array} abilityScores - passed to resolveFormula
 * @returns {Object} The mutated saves object
 */
export function applyRacialSaveModifiers(saves, race, abilityScores) {
    const raceData = getRaceInfo(race);
    if (!raceData) return saves;

    for (const entry of raceData.abilities) {
        if (!entry.saveModifier) continue;
        const bonus = resolveFormula(entry.saveModifier.formula, abilityScores);
        if (bonus === 0) continue;
        for (const category of entry.saveModifier.appliesTo) {
            if (saves[category] !== undefined) saves[category] -= bonus;
        }
    }
    return saves;
}

/**
 * Calculate saving throws for a character.
 * Thin wrapper that builds base saves from savingThrowsLevel0 then calls applyRacialSaveModifiers.
 * @param {number} level - Character level
 * @param {string} race - Race name
 * @param {number} conScore - Constitution score
 * @param {boolean} isAdvanced - Whether Advanced mode is enabled
 * @param {boolean} isGygar - Whether Gygar/Smoothified mode is enabled
 * @returns {Object} Object with Death, Wands, Paralysis, Breath, Spells
 */
export function calculateSavingThrows(level, race, conScore, isAdvanced, isGygar) {
    const saves = {
        Death:    savingThrowsLevel0.Death,
        Wands:    savingThrowsLevel0.Wands,
        Paralysis:savingThrowsLevel0.Paralysis,
        Breath:   savingThrowsLevel0.Breath,
        Spells:   savingThrowsLevel0.Spells
    };
    return applyRacialSaveModifiers(saves, race, { CON: conScore });
}

// ============================================================================
// RACIAL ABILITY MODIFIERS AND MINIMUMS
// ============================================================================

/**
 * Apply racial ability score modifiers to a results array. Advanced mode only.
 * Reads abilityModifiers from RACE_INFO[race]. For Human, requires humanRacialAbilities.
 * Replaces applyRaceAdjustments() in gen-race-adjustments.js.
 * @param {Array} results - Array of {ability, roll, modifier} objects
 * @param {string} race - Race name (with or without _RACE suffix)
 * @param {boolean} isAdvanced - Must be true; returns results unchanged if false
 * @param {boolean} [humanRacialAbilities=false] - Required for Human modifiers to apply
 * @returns {Array} New array with adjustments applied (originalRoll set when delta != 0)
 */
export function applyRacialAbilityModifiers(results, race, isAdvanced, humanRacialAbilities = false) {
    if (!isAdvanced) return results;

    const raceData = getRaceInfo(race);
    if (!raceData) return results;

    const mods = raceData.abilityModifiers || {};
    if (Object.keys(mods).length === 0) return results;

    const normalizedRace = normalizeRaceName(race);
    if (normalizedRace === 'Human_RACE' && !humanRacialAbilities) return results;

    return results.map(r => {
        const delta = mods[r.ability] ?? 0;
        if (delta === 0) return r;
        const adjustedRoll = r.roll + delta;
        return {
            ability: r.ability,
            roll: adjustedRoll,
            modifier: calculateModifier(adjustedRoll),
            originalRoll: r.roll,
            adjustment: delta
        };
    });
}

/**
 * Check if a character's rolled scores meet the racial minimums. Advanced mode only.
 * Reads minimums from RACE_INFO[race].
 * Replaces meetsRaceMinimums() in gen-race-adjustments.js.
 * @param {Array} results - Array of {ability, roll} objects
 * @param {string} race - Race name (with or without _RACE suffix)
 * @param {boolean} isAdvanced - Returns true immediately if false
 * @returns {boolean}
 */
export function meetsRacialMinimums(results, race, isAdvanced) {
    if (!isAdvanced) return true;
    const raceData = getRaceInfo(race);
    if (!raceData) return true;
    const minimums = raceData.minimums || {};
    for (const [ability, minimum] of Object.entries(minimums)) {
        const r = results.find(r => r.ability === ability);
        if (r && r.roll < minimum) return false;
    }
    return true;
}

/**
 * Calculate attack bonus for a character
 * @param {number} level - Character level
 * @param {string} race - Race name
 * @param {boolean} isAdvanced - Whether Advanced mode is enabled
 * @param {boolean} isGygar - Whether Gygar/Smoothified mode is enabled
 * @returns {number} Attack bonus
 */
export function calculateAttackBonus(level, race, isAdvanced, isGygar) {
    // For level 0 characters
    if (level === 0) {
        // Gygar Mode: no penalty at level 0
        if (isGygar) {
            return attackBonusLevel0.Gygar;  // 0
        }
        // Normal Mode: penalty at level 0
        return attackBonusLevel0.Normal;  // -1
    }
    
    // Future: will use different tables for higher levels
    // For now, just return 0 for any level above 0
    return 0;
}

// ============================================================================
// ADVANCED MODE UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert internal _RACE name to display name
 * @param {string} raceName - Race name with _RACE suffix
 * @returns {string} Display name without suffix
 */
export function getRaceDisplayName(raceName) {
    if (raceName && raceName.endsWith("_RACE")) {
        return raceName.replace("_RACE", "");
    }
    return raceName || "Unknown";
}

/**
 * Convert internal _CLASS name to display name
 * @param {string} className - Class name with _CLASS suffix
 * @returns {string} Display name without suffix
 */
export function getClassDisplayName(className) {
    if (className && className.endsWith("_CLASS")) {
        return className.replace("_CLASS", "");
    }
    return className || "Unknown";
}

/**
 * Apply racial adjustments to ability scores
 * @param {Object} baseScores - Base ability scores
 * @param {string} race - Race name
 * @returns {Object} Adjusted ability scores
 */
export function applyRacialAdjustments(baseScores, race) {
    const adjustments = !race ? {} : (getRaceInfo(race)?.abilityModifiers ?? {});
    const adjusted = {};
    for (const ability in baseScores) {
        let score = baseScores[ability] + (adjustments[ability] || 0);
        score = Math.max(3, Math.min(18, score));
        adjusted[ability] = score;
    }
    return adjusted;
}

/**
 * Check if ability scores (plain object) meet racial minimums.
 * Used by Advanced mode generator when scores are a {STR, DEX, ...} object.
 * See also: meetsRacialMinimums (array-based, used by shared-generator.js).
 * @param {Object} scores - Ability scores (before racial adjustments)
 * @param {string} race - Race name
 * @returns {boolean} True if requirements met
 */
export function checkRacialMinimums(scores, race) {
    const minimums = !race ? {} : (getRaceInfo(race)?.minimums ?? {});
    for (const ability in minimums) {
        if (scores[ability] < minimums[ability]) return false;
    }
    return true;
}

/**
 * Get available classes for a race
 * @param {string} race - Race name
 * @param {boolean} allowNonTraditional - Allow non-traditional combinations
 * @returns {Array} Array of available class names
 */
export function getAvailableClasses(race, allowNonTraditional = false) {
    if (allowNonTraditional) {
        return ['Cleric', 'Fighter', 'Magic-User', 'Thief', 'Spellblade'];
    }
    // Accepts bare names ('Elf') or suffixed ('Elf_RACE') — getRaceInfo normalizes both.
    return getRaceInfo(race)?.availableClasses?.advanced ?? [];
}

/**
 * Get class ability requirements — advanced mode.
 * Accepts class names with or without the `_CLASS` suffix.
 * @param {string} className - Class name (with or without _CLASS suffix)
 * @param {string} [race] - Race name (bare or _RACE suffix). If provided, returns
 *   per-race requirements from CLASS_INFO[className].requirements[race].
 *   TODO (Phase 3): update caller (rollAbilitiesAdvanced) to pass race; make race required.
 * @returns {Object} Requirements object (e.g., {STR: 9, INT: 9})
 */
export function getClassRequirements(className, race) {
    if (!className) return {};
    const base = className.replace(/_CLASS$/, '');
    const classInfo = CLASS_INFO[base];
    if (!classInfo) return {};
    if (race) {
        const bareRace = race.replace(/_RACE$/, '');
        return classInfo.requirements?.[bareRace] ?? {};
    }
    // No race provided: return the union of all non-empty requirements across races.
    // (Safe approximation until callers pass race — correct for all current classes.)
    const allReqs = Object.values(classInfo.requirements ?? {});
    return Object.assign({}, ...allReqs);
}

// ── Hit points ────────────────────────────────────────────────────────────────

/**
 * Parse hit dice string (e.g., "3d8", "9d8+2*", "1d6")
 * @param {string} hitDiceString - Hit dice string to parse
 * @returns {Object} Parsed hit dice object
 */
export function parseHitDice(hitDiceString) {
    if (!hitDiceString) {
        console.error(`Hit dice string is null or undefined`);
        return { numDice: 1, sides: 8, bonus: 0, noConModifier: false };
    }

    // Remove asterisk and save whether it was present
    const noConModifier = hitDiceString.includes('*');
    const cleanString = hitDiceString.replace('*', '');

    // Parse the dice notation (e.g., "3d8+2" or "1d6")
    const match = cleanString.match(/(\d+)d(\d+)([+-]\d+)?/);

    if (!match) {
        console.error(`Invalid hit dice string: ${hitDiceString}`);
        return { numDice: 1, sides: 8, bonus: 0, noConModifier };
    }

    return {
        numDice: parseInt(match[1]),
        sides: parseInt(match[2]),
        bonus: match[3] ? parseInt(match[3]) : 0,
        noConModifier: noConModifier
    };
}

/**
 * Roll hit points for a character
 * @param {Object} options - HP rolling options
 * @param {string} options.className - Class name (e.g., "Fighter")
 * @param {number} options.level - Character level
 * @param {number} options.conModifier - CON modifier
 * @param {Object} options.classData - Class data module (OSE or Gygar)
 * @param {boolean} [options.includeLevel0HP=false] - Whether to include level 0 HP
 * @param {number} [options.hpMode=0] - HP rolling mode: 0=normal, 1=blessed, 2=5e, 3=re-roll 1s and 2s (all levels)
 * @param {number[]|null} [options.fixedRolls=null] - If provided, use these per-entry HP values instead of rolling
 * @returns {{ max: number, rolls: number[], dice: number[] }} HP result with per-level breakdown
 */
export function rollHitPoints(options) {
    const {
        className,
        level,
        conModifier,
        classData,
        includeLevel0HP = false,
        hpMode = 0,         // 0=normal, 1=blessed, 2=5e, 3=re-roll 1s and 2s
        fixedRolls = null   // array of per-entry HP; if set, skip random rolling
    } = options;

    const mode = hpMode;

    const modeLabel = ['normal', 'blessed', '5e', 'reroll12'][mode] || 'normal';
    console.log(`[HP Roll] mode=${modeLabel}`);
    if (mode === 1) console.log('[HP Roll] ✨ Blessed: rolling each die TWICE, taking the best result');
    if (mode === 2) console.log('[HP Roll] 🎲 5e: max at level 1, average at level 2+');

    // Helper: roll one die (used for normal and blessed modes only; 5e is deterministic)
    const rollDie = (sides, label) => {
        if (mode === 1) {
            const a = rollSingleDie(sides);
            const b = rollSingleDie(sides);
            const best = Math.max(a, b);
            console.log(`  ${label}: 1d${sides} blessed → [${a}, ${b}] took ${best}`);
            return best;
        }
        const r = rollSingleDie(sides);
        console.log(`  ${label}: 1d${sides} → ${r}`);
        return r;
    };

    // L0 is ALWAYS at rolls[0] / dice[0] — gives compact params a stable hr[] layout.
    // It counts toward totalHP only when includeLevel0HP=true.
    const rolls = [];   // per-entry final HP: [L0, L1, L2, ...]
    const dice  = [];   // die sides:          [4,  X,  X, ...]
    let totalHP = 0;

    // ─── Level 0 ──────────────────────────────────────────────────────────────
    dice.push(4);
    let backgroundHP;
    {
        let l0HP;
        if (fixedRolls && fixedRolls[0] !== undefined) {
            l0HP = fixedRolls[0];   // stored value is already the final HP
            console.log(`  L0${includeLevel0HP ? '' : ' (bg only)'}: fixed → ${l0HP}`);
        } else {
            // L0 is NEVER blessed — it determines background occupation
            let l0Die;
            do {
                l0Die = rollSingleDie(4);
                const lbl = includeLevel0HP ? 'L0' : 'L0 (bg only)';
                console.log(`  ${lbl}: 1d4 → ${l0Die} (unblessed — background selection roll)`);
                l0HP = Math.max(1, l0Die + conModifier);
            } while (mode === 3 && includeLevel0HP && l0Die <= 2);
        }
        rolls.push(l0HP);                       // always at index 0
        if (includeLevel0HP) totalHP += l0HP;   // only counts when requested
        backgroundHP = l0HP;
    }

    // ─── Levels 1–N ─────────────────────────────────────────────────────────
    for (let lvl = 1; lvl <= level; lvl++) {
        const hitDiceString = classData.getHitDice(className, lvl);
        const hitDice = parseHitDice(hitDiceString);
        const rollsIndex = lvl;   // L0 always occupies index 0

        // Past-max-HD levels (noConModifier=true) get a fixed incremental HP gain —
        // no die is ever rolled. Store sides=0 so the edit panel hides the 🎲 button.
        dice.push(hitDice.noConModifier ? 0 : (hitDice.sides || 0));

        let levelHP;
        if (fixedRolls && fixedRolls[rollsIndex] !== undefined) {
            levelHP = fixedRolls[rollsIndex];
            console.log(`  L${lvl}: fixed → ${levelHP}`);
        } else if (hitDice.noConModifier) {
            // Past max HD: fixed increment — compute delta vs previous level's bonus.
            const prevHd = parseHitDice(classData.getHitDice(className, lvl - 1));
            levelHP = Math.max(1, hitDice.bonus - prevHd.bonus);
        } else if (mode === 2) {
            // 5e mode: max die at level 1, average (floor(sides/2)+1) at level 2+
            const dieVal = lvl === 1 ? hitDice.sides : Math.floor(hitDice.sides / 2) + 1;
            levelHP = Math.max(1, hitDice.bonus + dieVal + conModifier);
            console.log(`  L${lvl}: 5e ${lvl===1?'max':'avg'} 1d${hitDice.sides} → ${dieVal} + conMod(${conModifier}) = ${levelHP}`);
        } else {
            // Normal or blessed: random rolling with do-while for L1 floor + re-roll 1s and 2s
            let dieRoll;
            do {
                dieRoll = hitDice.sides > 0 ? rollDie(hitDice.sides, `L${lvl}`) : 0;
                levelHP = hitDice.bonus + dieRoll + conModifier;
                if (levelHP < 1) levelHP = 1;
            } while (
                (lvl === 1 && !includeLevel0HP && levelHP < backgroundHP) ||
                (mode === 3 && dieRoll <= 2)
            );
        }

        rolls.push(levelHP);
        totalHP += levelHP;
    }

    const label = rolls.map((r,i) => `[${i===0 ? 'L0' : 'L'+i}:${r}]`).join(' ');
    console.log(`HP total: ${label} = ${totalHP}  (bg L0 hp=${backgroundHP}${mode===1?' ✨blessed':mode===2?' 🎲5e':''})`);
    return { max: totalHP, rolls, dice, backgroundHP };
}

// ── Character object creation ─────────────────────────────────────────────────

/**
 * Roll starting gold for a level 1 character.
 * OSE Standard / Smoothified: 3d6 × 10 gp
 * Labyrinth Lord: 3d8 × 10 gp
 * @param {string} progression - 'ose', 'smooth', or 'll'
 * @returns {number} Starting gold in gp
 */
export function rollStartingGold(progression) {
    const roll = (n, sides) =>
        Array.from({ length: n }, () => Math.ceil(Math.random() * sides))
             .reduce((a, b) => a + b, 0);
    return (progression === 'll' ? roll(3, 8) : roll(3, 6)) * 10;
}

/**
 * Calculate starting gold for a level 2+ character based on XP for their current level.
 * @param {number} xpForLevel - Minimum XP required to reach the character's current level
 * @param {number} pct - Wealth percentage (0, 25, 50, 75, or 100)
 * @returns {number} Starting gold in gp
 */
export function calcStartingGold(xpForLevel, pct) {
    if (!xpForLevel || pct === 0) return 0;
    return Math.floor(xpForLevel * pct / 100);
}

/**
 * Create comprehensive character object
 * @param {Object} options - Character generation options
 * @returns {Object} Complete character object
 */
export function createCharacter(options) {
    const {
        level,
        className,
        mode,
        abilityScores,
        hp,
        progressionData,
        features,
        racialAbilities,
        name,
        background,
        startingGold = null
    } = options;

    console.log('\n=== Creating Character Object ===');
    console.log(`Level ${level} ${className} (${mode} Mode)`);

    // Calculate ability modifiers
    const abilityModifiers = {};
    Object.keys(abilityScores).forEach(ability => {
        abilityModifiers[ability] = calculateModifier(abilityScores[ability]);
    });

    // Create character object
    const character = {
        // Basic info
        name: name || '',
        level: level,
        class: className,
        mode: mode,
        background: background || null,

        // Ability scores
        abilityScores: { ...abilityScores },
        abilityModifiers: { ...abilityModifiers },

        // Hit points
        hp: {
            current: hp,
            max: hp
        },

        // Combat stats
        savingThrows: { ...progressionData.savingThrows },
        attackBonus: progressionData.attackBonus,
        armorClass: 10, // Base AC (Ascending Armor Class) before DEX modifier and armor

        // Experience
        xp: {
            current: progressionData.currentXP,
            forCurrentLevel: progressionData.xpForCurrentLevel,
            forNextLevel: progressionData.xpForNextLevel,
            toNextLevel: progressionData.xpToNextLevel,
            bonus: progressionData.xpBonus
        },

        // Class features
        spellSlots: features.spellSlots,
        thiefSkills: features.thiefSkills,
        turnUndead: features.turnUndead,
        classAbilities: features.classAbilities,

        // Racial abilities (for demihuman classes)
        racialAbilities: racialAbilities,

        // Starting wealth
        startingGold: startingGold
    };

    console.log('\n--- Character Object Created ---');
    console.log(`Level: ${character.level}`);
    console.log(`Class: ${character.class}`);
    console.log(`Mode: ${character.mode}`);
    console.log(`HP: ${character.hp.current}/${character.hp.max}`);
    console.log(`Attack Bonus: ${character.attackBonus >= 0 ? '+' : ''}${character.attackBonus}`);
    console.log(`AC: ${character.armorClass}`);
    console.log(`XP: ${character.xp.current} (${character.xp.toNextLevel ? character.xp.toNextLevel + ' to next level' : 'max level'})`);
    console.log(`XP Bonus: ${character.xp.bonus >= 0 ? '+' : ''}${character.xp.bonus}%`);

    if (character.spellSlots) {
        console.log('Spell Slots: Yes');
    }
    if (character.thiefSkills) {
        console.log('Thief Skills: Yes');
    }
    if (character.turnUndead) {
        console.log('Turn Undead: Yes');
    }
    if (character.classAbilities && character.classAbilities.length > 0) {
        console.log(`Class Abilities: ${character.classAbilities.length}`);
    }
    if (character.racialAbilities && character.racialAbilities.length > 0) {
        console.log(`Racial Abilities: ${character.racialAbilities.length}`);
    }

    console.log('=================================\n');

    return character;
}

// ── Weapons and Armor ──────────────────────────────────────────────────────────

export const WEAPONS = {
  "Battle axe": { cost: 7, weight: 50, damage: "1d8", qualities: ["Melee", "Slow", "Two-handed"] },
  "Club": { cost: 3, weight: 50, damage: "1d4", qualities: ["Blunt", "Melee"] },
  "Crossbow": { cost: 30, weight: 50, damage: "1d6", qualities: ["Missile", "Reload", "Slow", "Two-handed"], ranges: { short: 80, medium: 160, long: 240 } },
  "Dagger": { cost: 3, weight: 10, damage: "1d4", qualities: ["Melee", "Missile"], ranges: { short: 10, medium: 20, long: 30 } },
  "Hand axe": { cost: 4, weight: 30, damage: "1d6", qualities: ["Melee", "Missile"], ranges: { short: 10, medium: 20, long: 30 } },
  "Holy water (vial)": { cost: 25, weight: 0, damage: "1d8", qualities: ["Missile", "Splash weapon"], ranges: { short: 10, medium: 30, long: 50 } },
  "Javelin": { cost: 1, weight: 20, damage: "1d4", qualities: ["Missile"], ranges: { short: 30, medium: 60, long: 90 } },
  "Lance": { cost: 5, weight: 120, damage: "1d6", qualities: ["Charge", "Melee"] },
  "Long bow": { cost: 40, weight: 30, damage: "1d6", qualities: ["Missile", "Two-handed"], ranges: { short: 70, medium: 140, long: 210 } },
  "Mace": { cost: 5, weight: 30, damage: "1d6", qualities: ["Blunt", "Melee"] },
  "Oil (flask), burning": { cost: 2, weight: 0, damage: "1d8", qualities: ["Missile", "Splash weapon"], ranges: { short: 10, medium: 30, long: 50 } },
  "Pole arm": { cost: 7, weight: 150, damage: "1d10", qualities: ["Brace", "Melee", "Slow", "Two-handed"] },
  "Short bow": { cost: 25, weight: 30, damage: "1d6", qualities: ["Missile", "Two-handed"], ranges: { short: 50, medium: 100, long: 150 } },
  "Short sword": { cost: 7, weight: 30, damage: "1d6", qualities: ["Melee"] },
  "Silver dagger": { cost: 30, weight: 10, damage: "1d4", qualities: ["Melee", "Missile"], ranges: { short: 10, medium: 20, long: 30 } },
  "Sling": { cost: 2, weight: 20, damage: "1d4", qualities: ["Blunt", "Missile"], ranges: { short: 40, medium: 80, long: 160 } },
  "Spear": { cost: 3, weight: 30, damage: "1d6", qualities: ["Brace", "Melee", "Missile"], ranges: { short: 20, medium: 40, long: 60 } },
  "Staff": { cost: 2, weight: 40, damage: "1d4", qualities: ["Blunt", "Melee", "Two-handed"] },
  "Sword": { cost: 10, weight: 60, damage: "1d8", qualities: ["Melee"] },
  "Torch": { cost: 1, weight: 0, damage: "1d4", qualities: ["Melee"] },
  "Two-handed sword": { cost: 15, weight: 150, damage: "1d10", qualities: ["Melee", "Slow", "Two-handed"] },
  "War hammer": { cost: 5, weight: 30, damage: "1d6", qualities: ["Blunt", "Melee"] }
};

export const AMMUNITION = {
  "Crossbow bolts (case of 30)": { cost: 10, weight: 0 },
  "Arrows (quiver of 20)": { cost: 5, weight: 0 },
  "Silver tipped arrow (1)": { cost: 5, weight: 0 },
  "Sling stones": { cost: 0, weight: 0 }
};

export const ARMOR = {
  "Unarmoured": { ac: { descending: 9, ascending: 10 }, cost: 0, weight: 0 },
  "Leather": { ac: { descending: 7, ascending: 12 }, cost: 20, weight: 200 },
  "Chain mail": { ac: { descending: 5, ascending: 14 }, cost: 40, weight: 400 },
  "Plate mail": { ac: { descending: 3, ascending: 16 }, cost: 60, weight: 500 },
  "Shield": { ac: { descending: -1, ascending: 1 }, cost: 10, weight: 100 },
  "Helmet": { ac: { descending: 0, ascending: 0 }, cost: 10, weight: 50 }
};

export const WEAPON_QUALITIES = {
  "Blunt": "May be used by clerics",
  "Brace": "When bracing against a charge, inflicts double damage",
  "Charge": "On horseback, moving at least 60' in a round and attacking inflicts double damage",
  "Melee": "Close quarters weapon",
  "Missile": "Thrown or fired weapon",
  "Reload": "Requires a round to reload between shots",
  "Slow": "The wielder acts last in each combat round",
  "Splash weapon": "On a successful hit, splashes all targets within 5'",
  "Two-handed": "Requires both hands; cannot be used with a shield"
};

export function getAllWeaponNames() { return Object.keys(WEAPONS); }
export function getAllArmorNames() { return Object.keys(ARMOR); }
export function getWeaponsByQuality(quality) {
  return Object.entries(WEAPONS).filter(([, d]) => d.qualities.includes(quality)).map(([n]) => n);
}
export function getBluntWeapons() { return getWeaponsByQuality("Blunt"); }
export function getMeleeWeapons() { return getWeaponsByQuality("Melee"); }
export function getMissileWeapons() { return getWeaponsByQuality("Missile"); }
export function getTwoHandedWeapons() { return getWeaponsByQuality("Two-handed"); }
export function weaponHasQuality(weaponName, quality) {
  const weapon = WEAPONS[weaponName]; return weapon ? weapon.qualities.includes(quality) : false;
}
export function getWeaponData(weaponName) { return WEAPONS[weaponName] || null; }
export function getArmorData(armorName) { return ARMOR[armorName] || null; }

export const ADVENTURING_GEAR = {
  "Backpack":                   { cost: 5 },
  "Crowbar":                    { cost: 10 },
  "Garlic":                     { cost: 5 },
  "Grappling hook":             { cost: 25 },
  "Hammer (small)":             { cost: 2 },
  "Holy symbol":                { cost: 25 },
  "Holy water (vial)":          { cost: 25 },
  "Iron spikes (12)":           { cost: 1 },
  "Lantern":                    { cost: 10 },
  "Mirror (hand-sized, steel)": { cost: 5 },
  "Oil (1 flask)":              { cost: 2 },
  "Pole (10' long, wooden)":    { cost: 1 },
  "Rations (iron, 7 days)":     { cost: 15 },
  "Rations (standard, 7 days)": { cost: 5 },
  "Rope (50')":                 { cost: 1 },
  "Sack (large)":               { cost: 2 },
  "Sack (small)":               { cost: 1 },
  "Stakes (3) and mallet":      { cost: 3 },
  "Thieves' tools":             { cost: 25 },
  "Tinder box (flint & steel)": { cost: 3 },
  "Torches (6)":                { cost: 1 },
  "Waterskin":                  { cost: 1 },
  "Wine (2 pints)":             { cost: 1 },
  "Wolfsbane (1 bunch)":        { cost: 10 }
};

// ── Sheet Builder — encoding constants (shared by gen-ui.js and cs-sheet-page.js) ──

/** Progression mode name → compact code (e.g. 'ose' → 'O') */
export const PROG_CODE = { ose:'O', smooth:'S', ll:'L' };

/**
 * Return a human-readable label for a progression mode.
 * Accepts either a mode key ('ose', 'smooth', 'll') or a compact code ('O', 'S', 'L').
 */
export function progModeLabel(mode) {
    if (mode === 'ose'    || mode === 'O') return 'OSE Standard';
    if (mode === 'smooth' || mode === 'S') return 'Smoothified';
    if (mode === 'll'     || mode === 'L') return 'Labyrinth Lord';
    return mode;
}

/** Full class name → compact code (e.g. 'Fighter_CLASS' → 'FI') */
export const CLS_CODE = Object.fromEntries(
    Object.entries(CLASS_INFO)
        .filter(([, c]) => c.code)
        .map(([key, c]) => [`${key}_CLASS`, c.code])
);

/** Full race name → compact code (e.g. 'Human_RACE' → 'HU') */
export const RACE_CODE = Object.fromEntries(
    Object.entries(RACE_INFO)
        .filter(([, r]) => r.code)
        .map(([key, r]) => [key, r.code])
);

/** Race/class mode → compact code (e.g. 'strict' → 'ST') */
export const RCM_CODE = {
    strict:'ST', 'strict-human':'SH', 'traditional-extended':'TE', 'allow-all':'AL'
};

// ── Class Progression Tables ───────────────────────────────────────────────────

const OSE_ATTACK_BONUS_PROGRESSIONS = {
    FIGHTER:    [0, 0, 0, 2, 2, 2, 5, 5, 5, 7, 7, 7, 9, 9],
    CLERIC:     [0, 0, 0, 0, 2, 2, 2, 2, 5, 5, 5, 5, 7, 7],
    MAGIC_USER: [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 5, 5, 5, 5]
};
const OSE_ATTACK_BONUS_SCALE = {
    "Fighter_CLASS":"FIGHTER","Thief_CLASS":"CLERIC","Magic-User_CLASS":"MAGIC_USER",
    "Cleric_CLASS":"CLERIC","Spellblade_CLASS":"FIGHTER","Dwarf_CLASS":"FIGHTER",
    "Elf_CLASS":"FIGHTER","Halfling_CLASS":"FIGHTER","Gnome_CLASS":"MAGIC_USER"
};
const OSE_SAVING_THROWS = {
    "Fighter_CLASS":    { death:[12,12,12,10,10,10, 8, 8, 8, 6, 6, 6, 4, 4], wands:[13,13,13,11,11,11, 9, 9, 9, 7, 7, 7, 5, 5], paralysis:[14,14,14,12,12,12,10,10,10, 8, 8, 8, 6, 6], breath:[15,15,15,13,13,13,10,10,10, 8, 8, 8, 5, 5], spells:[16,16,16,14,14,14,12,12,12,10,10,10, 8, 8] },
    "Thief_CLASS":      { death:[13,13,13,13,12,12,12,12,10,10,10,10, 8, 8], wands:[14,14,14,14,13,13,13,13,11,11,11,11, 9, 9], paralysis:[13,13,13,13,11,11,11,11, 9, 9, 9, 9, 7, 7], breath:[16,16,16,16,14,14,14,14,12,12,12,12,10,10], spells:[15,15,15,15,13,13,13,13,10,10,10,10, 8, 8] },
    "Magic-User_CLASS": { death:[13,13,13,13,13,11,11,11,11,11, 8, 8, 8, 8], wands:[14,14,14,14,14,12,12,12,12,12, 9, 9, 9, 9], paralysis:[13,13,13,13,13,11,11,11,11,11, 8, 8, 8, 8], breath:[16,16,16,16,16,14,14,14,14,14,11,11,11,11], spells:[15,15,15,15,15,12,12,12,12,12, 8, 8, 8, 8] },
    "Cleric_CLASS":     { death:[11,11,11,11, 9, 9, 9, 9, 6, 6, 6, 6, 3, 3], wands:[12,12,12,12,10,10,10,10, 7, 7, 7, 7, 5, 5], paralysis:[14,14,14,14,12,12,12,12, 9, 9, 9, 9, 7, 7], breath:[16,16,16,16,14,14,14,14,11,11,11,11, 8, 8], spells:[15,15,15,15,12,12,12,12, 9, 9, 9, 9, 7, 7] },
    "Spellblade_CLASS": { death:[12,12,12,10,10,10, 8, 8, 8, 6, 6, 6, 4, 4], wands:[13,13,13,11,11,11, 9, 9, 9, 7, 7, 7, 5, 5], paralysis:[13,13,13,11,11,11, 9, 9, 9, 8, 8, 8, 6, 6], breath:[15,15,15,13,13,13,10,10,10, 8, 8, 8, 6, 6], spells:[15,15,15,12,12,12,10,10,10, 8, 8, 8, 6, 6] },
    "Dwarf_CLASS":      { death:[ 8, 8, 8, 6, 6, 6, 4, 4, 4, 2, 2, 2, 2, 2], wands:[ 9, 9, 9, 7, 7, 7, 5, 5, 5, 3, 3, 3, 3, 3], paralysis:[10,10,10, 8, 8, 8, 6, 6, 6, 4, 4, 4, 4, 4], breath:[13,13,13,10,10,10, 7, 7, 7, 4, 4, 4, 4, 4], spells:[12,12,12,10,10,10, 8, 8, 8, 6, 6, 6, 6, 6] },
    "Elf_CLASS":        { death:[12,12,12,10,10,10, 8, 8, 8, 6, 6, 6, 4, 4], wands:[13,13,13,11,11,11, 9, 9, 9, 7, 7, 7, 5, 5], paralysis:[13,13,13,11,11,11, 9, 9, 9, 8, 8, 8, 6, 6], breath:[15,15,15,13,13,13,10,10,10, 8, 8, 8, 6, 6], spells:[15,15,15,12,12,12,10,10,10, 8, 8, 8, 6, 6] },
    "Halfling_CLASS":   { death:[ 8, 8, 8, 6, 6, 6, 4, 4, 4, 4, 4, 4, 4, 4], wands:[ 9, 9, 9, 7, 7, 7, 5, 5, 5, 5, 5, 5, 5, 5], paralysis:[10,10,10, 8, 8, 8, 6, 6, 6, 6, 6, 6, 6, 6], breath:[13,13,13,10,10,10, 7, 7, 7, 7, 7, 7, 7, 7], spells:[12,12,12,10,10,10, 8, 8, 8, 8, 8, 8, 8, 8] },
    "Gnome_CLASS":      { death:[ 8, 8, 8, 8, 8, 6, 6, 6, 6, 6, 6, 6, 6, 6], wands:[ 9, 9, 9, 9, 9, 7, 7, 7, 7, 7, 7, 7, 7, 7], paralysis:[10,10,10,10,10, 8, 8, 8, 8, 8, 8, 8, 8, 8], breath:[14,14,14,14,14,11,11,11,11,11,11,11,11,11], spells:[11,11,11,11,11, 9, 9, 9, 9, 9, 9, 9, 9, 9] },
};

const GYGAR_ATTACK_BONUS_PROGRESSIONS = {
    FIGHTER_SMOOTH:    [1, 2, 3, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9],
    CLERIC_SMOOTH:     [0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6, 7, 7],
    MAGIC_USER_SMOOTH: [0, 0, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5, 5, 5]
};
const GYGAR_ATTACK_BONUS_SCALE = {
    "Fighter_CLASS":"FIGHTER_SMOOTH","Thief_CLASS":"CLERIC_SMOOTH","Magic-User_CLASS":"MAGIC_USER_SMOOTH",
    "Cleric_CLASS":"CLERIC_SMOOTH","Spellblade_CLASS":"FIGHTER_SMOOTH","Dwarf_CLASS":"FIGHTER_SMOOTH",
    "Elf_CLASS":"FIGHTER_SMOOTH","Halfling_CLASS":"FIGHTER_SMOOTH","Gnome_CLASS":"MAGIC_USER_SMOOTH"
};
const GYGAR_SAVING_THROWS = {
    "Fighter_CLASS":    { death:[12,12,11,10,10, 9, 8, 8, 7, 6, 6, 5, 4, 4], wands:[13,13,12,11,11,10, 9, 9, 8, 7, 7, 6, 5, 5], paralysis:[14,14,13,12,12,11,10,10, 9, 8, 8, 7, 6, 6], breath:[15,15,14,13,12,11,10,10, 9, 8, 7, 6, 5, 5], spells:[16,16,15,14,14,13,12,12,11,10,10, 9, 8, 8] },
    "Thief_CLASS":      { death:[13,13,13,13,12,12,12,11,10,10,10, 9, 8, 8], wands:[14,14,14,14,13,13,13,12,11,11,11,10, 9, 9], paralysis:[13,13,13,12,11,11,11,10, 9, 9, 9, 8, 7, 7], breath:[16,16,16,15,14,14,14,13,12,12,12,11,10,10], spells:[15,15,15,14,13,13,12,11,10,10,10, 9, 8, 8] },
    "Magic-User_CLASS": { death:[13,13,13,13,12,11,11,11,10, 9, 8, 8, 8, 8], wands:[14,14,14,14,13,12,12,12,11,10, 9, 9, 9, 9], paralysis:[13,13,13,13,12,11,11,11,10, 9, 8, 8, 8, 8], breath:[16,16,16,16,15,14,14,14,13,12,11,11,11,11], spells:[15,15,15,14,13,12,12,11,10, 9, 8, 8, 8, 8] },
    "Cleric_CLASS":     { death:[11,11,11,10, 9, 9, 8, 7, 6, 6, 5, 4, 3, 3], wands:[12,12,12,11,10,10, 9, 8, 7, 7, 7, 6, 5, 5], paralysis:[14,14,14,13,12,12,11,10, 9, 9, 9, 8, 7, 7], breath:[16,16,16,15,14,14,13,12,11,11,10, 9, 8, 8], spells:[15,15,14,13,12,12,11,10, 9, 9, 9, 8, 7, 7] },
    "Spellblade_CLASS": { death:[12,12,11,10,10, 9, 8, 8, 7, 6, 6, 5, 4, 4], wands:[13,13,12,11,11,10, 9, 9, 8, 7, 7, 6, 5, 5], paralysis:[13,13,12,11,11,10, 9, 9, 9, 8, 8, 7, 6, 6], breath:[15,15,14,13,12,11,10,10, 9, 8, 7, 6, 5, 5], spells:[15,14,13,12,12,11,10,10, 9, 8, 8, 7, 6, 6] },
    "Dwarf_CLASS":      { death:[12,12,11,10,10, 9, 8, 8, 7, 6, 6, 5, 4, 4], wands:[13,13,12,11,11,10, 9, 9, 8, 7, 7, 6, 5, 5], paralysis:[14,14,13,12,12,11,10,10, 9, 8, 8, 7, 6, 6], breath:[15,15,14,13,12,11,10,10, 9, 8, 7, 6, 5, 5], spells:[16,16,15,14,14,13,12,12,11,10,10, 9, 8, 8] },
    "Elf_CLASS":        { death:[12,12,11,10,10, 9, 8, 8, 7, 6, 6, 5, 4, 4], wands:[13,13,12,11,11,10, 9, 9, 8, 7, 7, 6, 5, 5], paralysis:[13,13,12,11,11,10, 9, 9, 9, 8, 8, 7, 6, 6], breath:[15,15,14,13,12,11,10,10, 9, 8, 7, 6, 5, 5], spells:[15,15,14,12,12,11,10,10, 9, 8, 8, 7, 6, 6] },
    "Halfling_CLASS":   { death:[12,12,11,10,10, 9, 8, 8, 7, 6, 6, 5, 4, 4], wands:[13,13,12,11,11,10, 9, 9, 8, 7, 7, 6, 5, 5], paralysis:[14,14,13,12,12,11,10,10, 9, 8, 8, 7, 6, 6], breath:[15,15,14,13,12,11,10,10, 9, 8, 7, 6, 5, 5], spells:[16,16,15,14,14,13,12,12,11,10,10, 9, 8, 8] },
    "Gnome_CLASS":      { death:[13,13,13,13,12,11,11,11,10, 9, 8, 8, 8, 8], wands:[14,14,14,14,13,12,12,12,11,10, 9, 9, 9, 9], paralysis:[13,13,13,13,12,11,11,11,10, 9, 8, 8, 8, 8], breath:[16,16,16,16,15,14,14,14,13,12,11,11,11,11], spells:[15,15,15,14,13,12,12,11,10, 9, 8, 8, 8, 8] },
};

const LL_ATTACK_BONUS_PROGRESSIONS = {
    FIGHTER:    [0, 0, 1, 2, 3, 4, 5, 5, 6, 7, 7, 8, 9, 10],
    CLERIC:     [0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 4, 5, 6,  6],
    MAGIC_USER: [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4,  5]
};
const LL_ATTACK_BONUS_SCALE = {
    "Fighter_CLASS":"FIGHTER","Thief_CLASS":"CLERIC","Magic-User_CLASS":"MAGIC_USER",
    "Cleric_CLASS":"CLERIC","Spellblade_CLASS":"FIGHTER","Dwarf_CLASS":"FIGHTER",
    "Elf_CLASS":"FIGHTER","Halfling_CLASS":"FIGHTER","Gnome_CLASS":"MAGIC_USER"
};
const LL_SAVING_THROWS = {
    "Fighter_CLASS":    { death:[12,12,12,10,10,10, 8, 8, 8, 6, 6, 6, 4, 4], wands:[13,13,13,11,11,11, 9, 9, 9, 7, 7, 7, 5, 5], paralysis:[14,14,14,12,12,12,10,10,10, 8, 8, 8, 6, 6], breath:[15,15,15,13,13,13, 9, 9, 9, 7, 7, 7, 5, 5], spells:[16,16,16,14,14,14,12,12,12,10,10,10, 8, 8] },
    "Thief_CLASS":      { death:[13,13,13,13,12,12,12,12,10,10,10,10, 8, 8], wands:[14,14,14,14,13,13,13,13,11,11,11,11, 9, 9], paralysis:[13,13,13,13,11,11,11,11, 9, 9, 9, 9, 7, 7], breath:[16,16,16,16,14,14,14,14,12,12,12,12,10,10], spells:[15,15,15,15,13,13,13,13,10,10,10,10, 8, 8] },
    "Magic-User_CLASS": { death:[13,13,13,13,13,11,11,11,11,11, 9, 9, 9, 9], wands:[14,14,14,14,14,12,12,12,12,12, 9, 9, 9, 9], paralysis:[13,13,13,13,13,11,11,11,11,11, 8, 8, 8, 8], breath:[16,16,16,16,16,14,14,14,14,14,11,11,11,11], spells:[15,15,15,15,15,12,12,12,12,12, 8, 8, 8, 8] },
    "Cleric_CLASS":     { death:[11,11,11,11, 9, 9, 9, 9, 6, 6, 6, 6, 3, 3], wands:[12,12,12,12,10,10,10,10, 7, 7, 7, 7, 5, 5], paralysis:[14,14,14,14,12,12,12,12, 9, 9, 9, 9, 7, 7], breath:[16,16,16,16,14,14,14,14,11,11,11,11, 8, 8], spells:[15,15,15,15,12,12,12,12, 9, 9, 9, 9, 7, 7] },
    "Spellblade_CLASS": { death:[12,12,12,10,10,10, 8, 8, 8, 6, 6, 6, 4, 4], wands:[13,13,13,11,11,11, 9, 9, 9, 7, 7, 7, 5, 5], paralysis:[13,13,13,11,11,11, 9, 9, 9, 8, 8, 8, 6, 6], breath:[15,15,15,13,13,13,10,10,10, 8, 8, 8, 6, 6], spells:[15,15,15,12,12,12,10,10,10, 8, 8, 8, 6, 6] },
    "Dwarf_CLASS":      { death:[ 8, 8, 8, 6, 6, 6, 4, 4, 4, 2, 2, 2, 2, 2], wands:[ 9, 9, 9, 7, 7, 7, 5, 5, 5, 3, 3, 3, 3, 3], paralysis:[10,10,10, 8, 8, 8, 6, 6, 6, 4, 4, 4, 4, 4], breath:[13,13,13,10,10,10, 7, 7, 7, 4, 4, 4, 4, 4], spells:[12,12,12,10,10,10, 8, 8, 8, 6, 6, 6, 6, 6] },
    "Elf_CLASS":        { death:[12,12,12,10,10,10, 8, 8, 8, 6, 6, 6, 4, 4], wands:[13,13,13,11,11,11, 9, 9, 9, 7, 7, 7, 5, 5], paralysis:[13,13,13,11,11,11, 9, 9, 9, 8, 8, 8, 6, 6], breath:[15,15,15,13,13,13,10,10,10, 8, 8, 8, 6, 6], spells:[15,15,15,12,12,12,10,10,10, 8, 8, 8, 6, 6] },
    "Halfling_CLASS":   { death:[ 8, 8, 8, 6, 6, 6, 4, 4, 4, 4, 4, 4, 4, 4], wands:[ 9, 9, 9, 7, 7, 7, 5, 5, 5, 5, 5, 5, 5, 5], paralysis:[10,10,10, 8, 8, 8, 6, 6, 6, 6, 6, 6, 6, 6], breath:[13,13,13,10,10,10, 7, 7, 7, 7, 7, 7, 7, 7], spells:[12,12,12,10,10,10, 8, 8, 8, 8, 8, 8, 8, 8] },
    "Gnome_CLASS":      { death:[ 8, 8, 8, 8, 8, 6, 6, 6, 6, 6, 6, 6, 6, 6], wands:[ 9, 9, 9, 9, 9, 7, 7, 7, 7, 7, 7, 7, 7, 7], paralysis:[10,10,10,10,10, 8, 8, 8, 8, 8, 8, 8, 8, 8], breath:[14,14,14,14,14,11,11,11,11,11,11,11,11,11], spells:[11,11,11,11,11, 9, 9, 9, 9, 9, 9, 9, 9, 9] },
};

export function getXPRequired(className, level) {
    const xpArray = XP_REQUIREMENTS[className];
    if (!xpArray) return null;
    if (level < 1 || level > xpArray.length) return null;
    return xpArray[level - 1];
}

export function getHitDice(className, level) {
    const scale = HIT_DICE_SCALE[className];
    if (!scale) return null;
    const progression = HIT_DICE_PROGRESSIONS[scale];
    if (!progression) return null;
    if (level < 1 || level > progression.length) return null;
    return progression[level - 1];
}

export function getThiefSkills(level) {
    if (level < 1 || level > 14) return null;
    const i = level - 1;
    return {
        climbSheerSurfaces: `${THIEF_SKILLS.climbSheerSurfaces[i]}%`,
        findRemoveTraps:    `${THIEF_SKILLS.findRemoveTraps[i]}%`,
        hearNoise:          `1-${THIEF_SKILLS.hearNoise[i]} on 1d6`,
        hideInShadows:      `${THIEF_SKILLS.hideInShadows[i]}%`,
        moveSilently:       `${THIEF_SKILLS.moveSilently[i]}%`,
        openLocks:          `${THIEF_SKILLS.openLocks[i]}%`,
        pickPockets:        `${THIEF_SKILLS.pickPockets[i]}%`
    };
}

export function getTurnUndead(level, undeadType) {
    if (level < 1 || level > 14) return null;
    const tableLevel = level >= 11 ? 11 : level;
    const turnTable = TURN_UNDEAD[tableLevel];
    if (!turnTable) return null;
    return turnTable[undeadType] !== undefined ? turnTable[undeadType] : null;
}

export function getLevelFromXP(className, xp) {
    const xpArray = XP_REQUIREMENTS[className];
    if (!xpArray) return 1;
    for (let i = xpArray.length - 1; i >= 0; i--) {
        if (xp >= xpArray[i]) return i + 1;
    }
    return 1;
}

export function getXPToNextLevel(className, currentXP) {
    const xpArray = XP_REQUIREMENTS[className];
    if (!xpArray) return null;
    const currentLevel = getLevelFromXP(className, currentXP);
    const maxLevel = xpArray.length;
    if (currentLevel >= maxLevel) return null;
    const nextLevelXP = getXPRequired(className, currentLevel + 1);
    return nextLevelXP - currentXP;
}

function _makeGetAttackBonus(ATTACK_BONUS_PROGRESSIONS, ATTACK_BONUS_SCALE) {
    return function getAttackBonus(className, level) {
        const scale = ATTACK_BONUS_SCALE[className];
        if (!scale) return null;
        const progression = ATTACK_BONUS_PROGRESSIONS[scale];
        if (!progression) return null;
        const maxLevel = (XP_REQUIREMENTS[className] || []).length || progression.length;
        if (level < 1 || level > maxLevel) return null;
        return progression[level - 1];
    };
}

function _makeGetSavingThrows(SAVING_THROWS) {
    return function getSavingThrows(className, level) {
        const savesObj = SAVING_THROWS[className];
        if (!savesObj) return null;
        if (level < 1 || level > savesObj.death.length) return null;
        return {
            death:    savesObj.death[level - 1],
            wands:    savesObj.wands[level - 1],
            paralysis:savesObj.paralysis[level - 1],
            breath:   savesObj.breath[level - 1],
            spells:   savesObj.spells[level - 1]
        };
    };
}

// Spell slots — OSE/LL: Spellblade capped at level 10. Gygar: no cap (house rule).
function _makeGetSpellSlots(spellbladeLevelCap) {
    return function getSpellSlots(className, level) {
        const spellType = SPELL_SLOT_SCALE[className];
        if (!spellType) return null;
        const baseSlots = spellType === "DIVINE" ? DIVINE_SPELL_SLOTS : ARCANE_SPELL_SLOTS;
        if (className === "Gnome_CLASS") {
            if (level < 1 || level > 14) return null;
            const result = {};
            for (let i = 1; i <= 4; i++) result[i] = baseSlots[i][level - 1];
            return result;
        }
        if (className === "Spellblade_CLASS" && spellbladeLevelCap) {
            if (level < 1 || level > spellbladeLevelCap) return null;
        }
        if (level < 1 || level > 14) return null;
        const result = {};
        for (const [spellLevel, slots] of Object.entries(baseSlots)) {
            result[spellLevel] = slots[level - 1];
        }
        return result;
    };
}

export const PROGRESSION_TABLES = {
    ose: {
        ATTACK_BONUS_PROGRESSIONS: OSE_ATTACK_BONUS_PROGRESSIONS,
        ATTACK_BONUS_SCALE:        OSE_ATTACK_BONUS_SCALE,
        SAVING_THROWS:             OSE_SAVING_THROWS,
        getHitDice, getXPRequired, getThiefSkills, getTurnUndead, getLevelFromXP, getXPToNextLevel,
        getAttackBonus:  _makeGetAttackBonus(OSE_ATTACK_BONUS_PROGRESSIONS, OSE_ATTACK_BONUS_SCALE),
        getSavingThrows: _makeGetSavingThrows(OSE_SAVING_THROWS),
        getSpellSlots:   _makeGetSpellSlots(10),
    },
    gygar: {
        ATTACK_BONUS_PROGRESSIONS: GYGAR_ATTACK_BONUS_PROGRESSIONS,
        ATTACK_BONUS_SCALE:        GYGAR_ATTACK_BONUS_SCALE,
        SAVING_THROWS:             GYGAR_SAVING_THROWS,
        getHitDice, getXPRequired, getThiefSkills, getTurnUndead, getLevelFromXP, getXPToNextLevel,
        getAttackBonus:  _makeGetAttackBonus(GYGAR_ATTACK_BONUS_PROGRESSIONS, GYGAR_ATTACK_BONUS_SCALE),
        getSavingThrows: _makeGetSavingThrows(GYGAR_SAVING_THROWS),
        getSpellSlots:   _makeGetSpellSlots(null),
    },
    ll: {
        ATTACK_BONUS_PROGRESSIONS: LL_ATTACK_BONUS_PROGRESSIONS,
        ATTACK_BONUS_SCALE:        LL_ATTACK_BONUS_SCALE,
        SAVING_THROWS:             LL_SAVING_THROWS,
        getHitDice, getXPRequired, getThiefSkills, getTurnUndead, getLevelFromXP, getXPToNextLevel,
        getAttackBonus:  _makeGetAttackBonus(LL_ATTACK_BONUS_PROGRESSIONS, LL_ATTACK_BONUS_SCALE),
        getSavingThrows: _makeGetSavingThrows(LL_SAVING_THROWS),
        getSpellSlots:   _makeGetSpellSlots(10),
    },
};
