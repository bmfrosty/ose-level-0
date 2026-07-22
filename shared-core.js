// shared-core.js — shared data and logic, re-exported as a single import point
//
// Imports:
//   shared-class-info.js     — CLASS_INFO: all class definitions with abilities and metadata
//   shared-race-info.js      — RACE_INFO: all race definitions with abilities and level limits
//
// Inlines:
//   shared-ability-scores.js — ability score math (modifiers, XP bonus, roll helpers)
//   shared-hit-points.js     — HP rolling and parsing
//   shared-character.js      — character object creation, starting gold


import { CLASS_INFO } from './shared-class-info.js';
import { RACE_INFO, showDescriptionAnyway } from './shared-race-info.js';
export { CLASS_INFO, RACE_INFO };

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
    if (toughCharacters) console.log('Tough Characters enabled: At least one of STR/DEX/INT/WIS must be ≥ 13');
    if (primeReqMinimum && className) {
        console.log(`Prime Requisite ≥ ${primeReqMinimum} enabled: At least one of ${getPrimeRequisites(className).join(', ')} must be ≥ ${primeReqMinimum} for ${className}`);
    }

    do {
        setAttempts++;
        if (setAttempts > 1) console.log(`\nAttempt #${setAttempts} (previous set failed requirements):`);
        else console.log('\nRolling 3d6 for each ability:');

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
            if (!primeReqs.some(ability => scores[ability] >= primeReqMinimum)) {
                console.log(`❌ Failed Prime Requisite check (need at least one of ${primeReqs.join(', ')} ≥ ${primeReqMinimum}, got: ${primeReqs.map(a => `${a}=${scores[a]}`).join(', ')})`);
                continue;
            }
        }

        // All checks passed
        break;
    } while (true);

    if (setAttempts > 1) console.log(`✅ Passed all requirements after ${setAttempts} attempts`);
    console.log('\n=== Final Ability Scores ===');
    ['STR','INT','WIS','DEX','CON','CHA'].forEach(a => console.log(`${a}: ${scores[a]} (${formatModifier(calculateModifier(scores[a]))})`));
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
export function getAbilitiesAtLevel(className, level, { includeLookahead = false } = {}) {
  const abilities = CLASS_INFO[className]?.abilities || [];
  const current = abilities.filter(ability =>
    ability.availableAt <= level &&
    (ability.availableThrough === undefined || ability.availableThrough >= level)
  );
  if (!includeLookahead) return current;
  const next = level + 1;
  const upcoming = abilities
    .filter(ability =>
      ability.availableAt === next &&
      (ability.availableThrough === undefined || ability.availableThrough >= next)
    )
    .map(ability => ({ ...ability, notAvailableUntil: next }));
  return [...current, ...upcoming];
}

// Helper function to check if a race can take a class
export function canRaceTakeClass(className, race, mode = "basic") {
  const classInfo = CLASS_INFO[className];
  if (!classInfo) return false;

  if (mode === "basic") {
    // Basic mode: race-as-class only — the class IS the race (Dwarf/Elf/etc.)
    // or a human-only class. classLevelLimits is an Advanced-mode concept
    // and doesn't apply here.
    return !!classInfo.availableIn?.basic && (classInfo.classType === 'raceAsClass'
      ? classInfo.name === race
      : race === 'Human');
  }

  const raceInfo = getRaceInfo(race);
  if (!raceInfo?.showInGenerator) return false;
  return raceInfo.classLevelLimits?.[`${className}_CLASS`] !== undefined
    && !!CLASS_INFO[className]?.showInGenerator;
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

export const SMOOTHPROG_THIEF_SKILLS = {
  climbSheerSurfaces: [87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 99],
  findRemoveTraps:    [20, 24, 28, 33, 37, 46, 55, 65, 74, 83, 92, 97, 98, 99],
  hearNoise:          [33, 41, 50, 54, 58, 62, 67, 71, 75, 79, 83, 87, 91, 95],
  hearNoiseFormat:    'pct',
  hideInShadows:      [10, 15, 20, 25, 30, 36, 45, 55, 65, 75, 85, 90, 95, 99],
  moveSilently:       [25, 30, 34, 39, 43, 48, 58, 67, 77, 87, 96, 97, 98, 99],
  openLocks:          [25, 29, 33, 38, 42, 51, 60, 70, 79, 88, 97, 98, 98, 99],
  pickPockets:        [30, 34, 38, 43, 47, 51, 60, 70, 79, 88, 97, 107, 116, 125]
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
    const { className, level, abilityScores, classData, silent = false } = options;
    const log = silent ? () => {} : console.log.bind(console);

    log('\n=== Getting Class Progression Data ===');
    log(`Class: ${className}, Level: ${level}`);

    // className should already have _CLASS suffix

    // Get saving throws
    const savingThrows = classData.getSavingThrows(className, level);
    log('\nSaving Throws:');
    log(`  Death/Poison: ${savingThrows.death}`);
    log(`  Wands: ${savingThrows.wands}`);
    log(`  Paralysis/Petrify: ${savingThrows.paralysis}`);
    log(`  Breath Attacks: ${savingThrows.breath}`);
    log(`  Spells/Rods/Staves: ${savingThrows.spells}`);

    // Get attack bonus
    const attackBonus = classData.getAttackBonus(className, level);
    log(`\nAttack Bonus: ${attackBonus >= 0 ? '+' : ''}${attackBonus}`);

    // Get XP tracking
    const currentXP = 0;
    const xpForCurrentLevel = classData.getXPRequired(className, level);
    const xpForNextLevel = classData.getXPRequired(className, level + 1);
    const xpToNextLevel = xpForNextLevel ? xpForNextLevel - currentXP : null;

    log(`\nXP Tracking:`);
    log(`  Current XP: ${currentXP}`);
    log(`  XP for Level ${level}: ${xpForCurrentLevel}`);
    if (xpForNextLevel) {
        log(`  XP for Level ${level + 1}: ${xpForNextLevel}`);
        log(`  XP to Next Level: ${xpToNextLevel}`);
    } else {
        log(`  Maximum level reached!`);
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
    log(`  Prime Requisite XP Bonus: ${xpBonus >= 0 ? '+' : ''}${xpBonus}%`);

    log('======================================\n');

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
    const { className, level, classData, ClassDataShared, silent = false } = options;
    const log = silent ? () => {} : console.log.bind(console);

    log('\n=== Getting Class-Specific Features ===');
    log(`Class: ${className}, Level: ${level}`);

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
        log('\nSpell Slots:');
        if (features.spellSlots) {
            Object.entries(features.spellSlots).forEach(([spellLevel, slots]) => {
                if (slots > 0) log(`  Level ${spellLevel}: ${slots} slots`);
            });
        } else {
            log('  No spell slots at this level');
        }
    }

    // Thief skills
    if (baseClassName === 'Thief') {
        features.thiefSkills = typeof classData.getThiefSkills === 'function'
            ? classData.getThiefSkills(level)
            : null;
        log('\nThief Skills:');
        if (features.thiefSkills) {
            Object.entries(features.thiefSkills).forEach(([skill, value]) => {
                log(`  ${skill}: ${value}%`);
            });
        }
    }

    // Turn undead for clerics
    if (baseClassName === 'Cleric') {
        // Use HD categories instead of monster names
        const undeadHDTypes = ['1HD', '2HD', '2*HD', '3HD', '4HD', '5HD', '6HD', '7-9HD'];
        features.turnUndead = {};
        log('\nTurn Undead:');
        undeadHDTypes.forEach(type => {
            const target = classData.getTurnUndead(level, type);
            features.turnUndead[type] = target;
            if (target === 'T') log(`  ${type}: T (automatically turned)`);
            else if (target === 'D') log(`  ${type}: D (automatically destroyed)`);
            else if (target === null || target === undefined) log(`  ${type}: - (cannot turn)`);
            else log(`  ${type}: ${target}+ (roll 2d6)`);
        });
    }

    // Class abilities (strip _CLASS suffix — CLASS_INFO keys are plain names like "Cleric", "Fighter")
    const allAbilities = ClassDataShared.getAbilitiesAtLevel(baseClassName, level, { includeLookahead: true });
    if (allAbilities && allAbilities.length > 0) {
        features.classAbilities = allAbilities.map(a => {
            const mapped = (a.languages && a.description === undefined)
                ? { ...a, description: a.languages.join(', ') }
                : a;
            if (mapped.notAvailableUntil !== undefined) {
                return { ...mapped, description: mapped.description + ` <em style="color:#888;">(not available until level ${mapped.notAvailableUntil})</em>` };
            }
            return mapped;
        });
        log('\nClass Abilities:');
        features.classAbilities.forEach(ability => {
            log(`  - ${ability.name}: ${ability.description}`);
        });
    }

    log('======================================\n');

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
export function getBasicModeClassAbilities(className, { silent = false } = {}) {
    const log = silent ? () => {} : console.log.bind(console);

    log('\n=== Getting Basic Mode Class Abilities ===');
    log(`Class: ${className}`);

    const demihumanClasses = ['Dwarf', 'Elf', 'Halfling', 'Gnome'];

    // Strip _CLASS suffix so 'Dwarf_CLASS' -> 'Dwarf' matches CLASS_ABILITIES keys
    const baseClass = className.replace('_CLASS', '');

    if (!demihumanClasses.includes(baseClass)) {
        log('Not a demihuman class - no class abilities');
        log('==========================================\n');
        return [];
    }

    // Level 1 covers all abilities available from character creation.
    // Abilities with basicMode: false are for Advanced mode only.
    const abilities = getAbilitiesAtLevel(baseClass, 1)
        .filter(a => a.basicMode !== false)
        .map(a => a.includeName ? `${a.name}: ${a.description}` : a.description);

    log('\nClass Abilities:');
    abilities.forEach(ability => {
        log(`  - ${ability}`);
    });

    log('==========================================\n');

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
export function getRaceAbilitiesAtLevel(race, level, mode = 'advanced', humanRacialAbilities = false, { includeLookahead = false } = {}) {
    const normalizedRace = normalizeRaceName(race);
    const raceData = RACE_INFO[normalizedRace];
    if (!raceData || !raceData.abilities) return [];

    const atKey   = mode === 'basic' ? 'basicAvailableAt'      : 'advancedAvailableAt';
    const throKey = mode === 'basic' ? 'basicAvailableThrough' : 'advancedAvailableThrough';

    const passesLevel = (a, lvl) => {
        if (a.humanOnly && !humanRacialAbilities) return false;
        if (a[atKey] === undefined || a[throKey] === undefined) return false;
        return a[atKey] <= lvl && a[throKey] >= lvl;
    };

    const current = raceData.abilities
        .filter(a => passesLevel(a, level))
        .map(a => a.applyOnly ? { ...a, alreadyApplied: true } : a);
    if (!includeLookahead) return current;

    const next = level + 1;
    const upcoming = raceData.abilities
        .filter(a => {
            if (a.humanOnly && !humanRacialAbilities) return false;
            if (a[atKey] === undefined || a[throKey] === undefined) return false;
            return a[atKey] === next && a[throKey] >= next;
        })
        .map(a => ({ ...a, notAvailableUntil: next, ...(a.applyOnly ? { alreadyApplied: true } : {}) }));
    return [...current, ...upcoming];
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
 * @param {number}  [options.level] - Character level (default 0); abilities with advancedAvailableAt > level are excluded
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

    const abilities = getRaceAbilitiesAtLevel(race, options.level ?? 0, 'advanced', humanRacialAbilities, { includeLookahead: true });

    const formatted = abilities.map(a => {
        let text;
        if (a.languages) {
            text = `<strong>${a.name}</strong>: ${a.languages.join(', ')}`;
        } else if (a.hideDescription && !showDescriptionAnyway) {
            text = a.includeName ? `<strong>${a.name}</strong>*` : `${a.name}*`;
        } else if (a.includeName) {
            text = `<strong>${a.name}</strong>: ${a.description}`;
        } else {
            text = a.description;
        }
        if (a.notAvailableUntil !== undefined) {
            text += ` <em style="color:#888;">(not available until level ${a.notAvailableUntil})</em>`;
        } else if (a.alreadyApplied) {
            text += ` <em style="color:#888;">(already applied)</em>`;
        }
        return text;
    });
    if (formatted.length) {
        const page = getRaceInfo(race)?.page;
        const pageRef = page ? ` p${page}` : '';
        formatted.push(`\x00footnote:* See OSE Advanced Fantasy Player's Tome${pageRef} for details`);
    }
    return formatted;
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
 * @param {Object} saves - save-category keys (e.g. Death/Wands/Paralysis/Breath/Spells or
 *   death/wands/paralysis/breath/spells) mapped to numeric target values (mutated in place).
 *   Matched against RACE_INFO's saveModifier.appliesTo case-insensitively, since the level-0
 *   path (savingThrowsLevel0) and the level-1+ class-progression tables use different casing
 *   for the same categories.
 * @param {string} race - Race name (with or without _RACE suffix)
 * @param {Object|Array} abilityScores - passed to resolveFormula
 * @returns {Object} The mutated saves object
 */
export function applyRacialSaveModifiers(saves, race, abilityScores) {
    const raceData = getRaceInfo(race);
    if (!raceData) return saves;

    const saveKeys = Object.keys(saves);
    for (const entry of raceData.abilities) {
        if (!entry.saveModifier) continue;
        const bonus = resolveFormula(entry.saveModifier.formula, abilityScores);
        if (bonus === 0) continue;
        for (const category of entry.saveModifier.appliesTo) {
            const key = saveKeys.find(k => k.toLowerCase() === category.toLowerCase());
            if (key !== undefined) saves[key] -= bonus;
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
 * @param {boolean} isSmoothprog - Whether Smoothified progression mode is enabled
 * @returns {Object} Object with Death, Wands, Paralysis, Breath, Spells
 */
export function calculateSavingThrows(race, conScore) {
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

/**
 * Check if a character's rolled scores meet the racial minimums. Advanced mode only.
 * Reads minimums from RACE_INFO[race].
 * Replaces meetsRaceMinimums() in gen-race-adjustments.js.
 * @param {Array} results - Array of {ability, roll} objects
 * @param {string} race - Race name (with or without _RACE suffix)
 * @param {boolean} isAdvanced - Returns true immediately if false
 * @returns {boolean}
 */

/**
 * Calculate attack bonus for a character
 * @param {number} level - Character level
 * @param {string} race - Race name
 * @param {boolean} isAdvanced - Whether Advanced mode is enabled
 * @param {boolean} isSmoothprog - Whether Smoothified progression mode is enabled
 * @returns {number} Attack bonus
 */
export function calculateAttackBonus(level, race, isAdvanced, isSmoothprog) {
    // For level 0 characters
    if (level === 0) {
        // Gygar Mode: no penalty at level 0
        if (isSmoothprog) {
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
export function applyRacialAdjustments(baseScores, race, isAdvanced = true, humanRacialAbilities = false) {
    if (!isAdvanced) return { ...baseScores };
    const raceData = getRaceInfo(race);
    if (!raceData) return { ...baseScores };
    const mods = raceData.abilityModifiers || {};
    if (Object.keys(mods).length === 0) return { ...baseScores };
    if (normalizeRaceName(race) === 'Human_RACE' && !humanRacialAbilities) return { ...baseScores };
    const adjusted = {};
    for (const ability in baseScores) {
        adjusted[ability] = Math.max(3, Math.min(18, baseScores[ability] + (mods[ability] || 0)));
    }
    return adjusted;
}

/**
 * Check if ability scores meet racial minimums (plain object form).
 * Caller is responsible for gating to Advanced mode only.
 * @param {Object} scores - Ability scores as {STR, DEX, ...}
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
        // Bypasses per-race restrictions entirely: every generator-ready plainClass,
        // regardless of race. (raceAsClass entries like Dwarf/Elf/Halfling are excluded —
        // this mode is about which of the 5 core classes any race can take, not about
        // taking on a different demihuman race-as-class.)
        return Object.entries(CLASS_INFO)
            .filter(([, c]) => c.showInGenerator && c.classType !== 'raceAsClass')
            .map(([name]) => name);
    }
    // Accepts bare names ('Elf') or suffixed ('Elf_RACE') — getRaceInfo normalizes both.
    const raceInfo = getRaceInfo(race);
    if (!raceInfo?.showInGenerator) return [];
    const limits = raceInfo.classLevelLimits ?? {};
    return Object.keys(limits)
        .map(key => key.replace(/_CLASS$/, ''))
        .filter(className => CLASS_INFO[className]?.showInGenerator);
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
 * @param {number} [options.hpMode=0] - HP rolling mode governing THIS roll: 0=normal, 1=blessed, 2=5e, 3=re-roll 1s and 2s (all levels). A character's own racial Blessed does not combine/stack with this — see gen-core.js's `blessed` derivation, which resolves the two into a single effective mode *before* calling here (Blessed wins if eligible), so this function only ever needs to handle one mode at a time. The referee's raw chosen mode is still stored separately in `cp.hm` regardless of what's passed here — see the callers.
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
    let l0FloorHP;  // actual CON-modified L0 HP — used as L1 HP floor (NOT the raw die)
    let l0RawHP;    // l0Die + conModifier before clamping; undefined for fixed rolls
    {
        let l0HP;
        let l0Die;
        if (fixedRolls && fixedRolls[0] !== undefined) {
            l0HP = fixedRolls[0];   // stored value is already the final HP
            console.log(`  L0${includeLevel0HP ? '' : ' (bg only)'}: fixed → ${l0HP}`);
        } else {
            // L0 is NEVER blessed — it determines background occupation
            do {
                l0Die = rollSingleDie(4);
                l0HP = Math.max(1, l0Die + conModifier);
                const lbl = includeLevel0HP ? 'L0' : 'L0 (bg only)';
                const modStr = conModifier !== 0 ? ` + CON ${conModifier >= 0 ? '+' : ''}${conModifier} = ${l0HP}` : '';
                console.log(`  ${lbl}: 1d4 → ${l0Die}${modStr} (unblessed; raw roll selects background tier)`);
            } while (mode === 3 && includeLevel0HP && l0Die <= 2);
            l0RawHP = l0Die + conModifier;
        }
        rolls.push(l0HP);                       // always at index 0
        if (includeLevel0HP) totalHP += l0HP;   // only counts when requested
        backgroundHP = l0Die ?? l0HP;           // raw die selects background tier; fallback for fixed rolls
        l0FloorHP    = l0HP;                    // CON-adjusted L0 HP — floor for L1 re-roll
    }

    // ─── Levels 1–N ─────────────────────────────────────────────────────────
    let l1RawHP, l1Die, l1Sides;
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
                (lvl === 1 && !includeLevel0HP && levelHP < l0FloorHP) ||
                (mode === 3 && dieRoll <= 2)
            );
            if (lvl === 1) {
                l1RawHP = hitDice.bonus + dieRoll + conModifier;
                l1Die   = dieRoll;
                l1Sides = hitDice.sides;
            }
        }

        rolls.push(levelHP);
        totalHP += levelHP;
    }

    const label = rolls.map((r,i) => `[${i===0 ? 'L0' : 'L'+i}:${r}]`).join(' ');
    console.log(`HP total: ${label} = ${totalHP}  (bg L0 hp=${backgroundHP}${mode===1?' ✨blessed':mode===2?' 🎲5e':mode===3?' 🎲reroll12':''})`);
    return { max: totalHP, rolls, dice, backgroundHP, l0RawHP, l1RawHP, l1Die, l1Sides };
}

// ── Character object creation ─────────────────────────────────────────────────

/**
 * Roll starting gold as NdSides × mult gp — the general dice-roll formula
 * shared by the Level 0, Level 1, and Level 2+ "Dice roll" wealth methods.
 * Each tier configures its own count/sides/mult independently (no more
 * hardcoded dice count or implicit progression-mode coupling).
 * @param {number} count - number of dice to roll
 * @param {number} sides - die type (4, 6, 8, 10, or 12)
 * @param {number} mult  - multiplier applied to the total roll
 * @returns {number} Starting gold in gp
 */
export function rollDiceGold(count = 3, sides = 6, mult = 1) {
    const roll = Array.from({ length: count }, () => Math.ceil(Math.random() * sides)).reduce((a, b) => a + b, 0);
    return roll * mult;
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
        startingGold = null,
        race = null
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

        // Combat stats — race defaults to null for any caller that doesn't supply
        // it, giving no racial save modifier (same as a race with none). Level 0
        // applies this same saveModifier logic via calculateSavingThrows() instead
        // — see that function's own doc comment.
        savingThrows: race ? applyRacialSaveModifiers({ ...progressionData.savingThrows }, race, abilityScores)
                            : { ...progressionData.savingThrows },
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
    if (character.spellSlots) console.log('Spell Slots: Yes');
    if (character.thiefSkills) console.log('Thief Skills: Yes');
    if (character.turnUndead) console.log('Turn Undead: Yes');
    if (character.classAbilities && character.classAbilities.length > 0) console.log(`Class Abilities: ${character.classAbilities.length}`);
    if (character.racialAbilities && character.racialAbilities.length > 0) console.log(`Racial Abilities: ${character.racialAbilities.length}`);
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
  "Rock, Thrown 10/30/50": { cost: 0.1, weight: 10, damage: "1d3", qualities: ["Melee", "Missile"], ranges: { short: 10, medium: 30, long: 50 } },
  "Short bow": { cost: 25, weight: 30, damage: "1d6", qualities: ["Missile", "Two-handed"], ranges: { short: 50, medium: 100, long: 150 } },
  "Short sword": { cost: 7, weight: 30, damage: "1d6", qualities: ["Melee"] },
  "Silver dagger": { cost: 30, weight: 10, damage: "1d4", qualities: ["Melee", "Missile"], ranges: { short: 10, medium: 20, long: 30 } },
  "Sling": { cost: 2, weight: 20, damage: "1d4", qualities: ["Blunt", "Missile"], ranges: { short: 40, medium: 80, long: 160 } },
  "Spear": { cost: 3, weight: 30, damage: "1d6", qualities: ["Brace", "Melee", "Missile"], ranges: { short: 20, medium: 40, long: 60 } },
  "Staff": { cost: 2, weight: 40, damage: "1d4", qualities: ["Blunt", "Melee", "Two-handed"] },
  "Sword": { cost: 10, weight: 60, damage: "1d8", qualities: ["Melee"] },
  "Torch": { cost: 1, weight: 0, damage: "1d4", qualities: ["Melee"] },
  "Two-handed sword": { cost: 15, weight: 150, damage: "1d10", qualities: ["Melee", "Slow", "Two-handed"] },
  "War hammer": { cost: 5, weight: 30, damage: "1d6", qualities: ["Blunt", "Melee"] },
  // Entangle (from the Teamster background's own flavor text) isn't a
  // mechanical WEAPON_QUALITIES entry anywhere else in this table — no
  // special-condition rules exist to hook it into, so it's flavor-only here.
  // `reach` (feet) is a melee-weapon-only field distinct from `ranges`
  // (OSE's three-tier short/medium/long to-hit bands for Missile-quality
  // weapons) — a Whip strikes at a distance without being thrown, so it
  // doesn't fit that shape. Not consumed anywhere in the app yet (no
  // reach-based to-hit rules implemented); reference/flavor only for now.
  "Whip": { cost: 5, weight: 20, damage: "1d2", qualities: ["Melee"], reach: 5 },
  "Bull Whip": { cost: 10, weight: 30, damage: "1d2", qualities: ["Melee"], reach: 10 }
};

export const AMMUNITION = {
  "Crossbow bolts (case of 30)": { cost: 10, weight: 0 },
  "Arrows (quiver of 20)": { cost: 5, weight: 0 },
  "Silver tipped arrow (1)": { cost: 5, weight: 0 },
  "Sling stones": { cost: 0, weight: 0 }
};

export const ARMOR = {
  "Unarmoured": { ac: { descending: 9, ascending: 10 }, cost: 0, weight: 0 },
  "Gambeson": { ac: { descending: 8, ascending: 11 }, cost: 10, weight: 100 },
  "Leather": { ac: { descending: 7, ascending: 12 }, cost: 20, weight: 200 },
  "Scale mail": { ac: { descending: 6, ascending: 13 }, cost: 30, weight: 300 },
  "Chain mail": { ac: { descending: 5, ascending: 14 }, cost: 40, weight: 400 },
  "Banded mail": { ac: { descending: 4, ascending: 15 }, cost: 50, weight: 450 },
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
export const PROG_CODE = { ose:'O', smoothprog:'S', ll:'L' };

/**
 * Return a human-readable label for a progression mode.
 * Accepts either a mode key ('ose', 'smooth', 'll') or a compact code ('O', 'S', 'L').
 */
export function progModeLabel(mode) {
    if (mode === 'ose'    || mode === 'O') return 'Standard B/X Progressions';
    if (mode === 'smoothprog' || mode === 'S') return 'Smoothified Progressions';
    if (mode === 'll'     || mode === 'L') return 'Labyrinth Lord Progressions';
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

// Racial Adjustment Policy — governs whether/when racial ability score
// adjustments apply across the level 0 -> 1 boundary. Recorded as cp.rap:
// unconditionally at level 0 (generateCharacterV3), and at level 1+ when
// non-default (gen-ui.js's buildCampaignRulesetCp, for "Back to Generator"
// link reconstruction only — not used by any level 1+ generation mechanics).
// See PLAN_RACIAL_ADJUSTMENT_POLICY.md.
export const RAP_CODE = {
    always:'AA', 'separate-only':'SO', never:'NV', 'from-separate':'FS', 'from-level-1':'F1'
};

/**
 * Single source of truth for the Racial Adjustment Policy's level 1+ formula —
 * used identically for direct level 1+ generation (gen-ui.js) and the level
 * 0 -> 1 transition (cs-sheet-page.js), so the two paths can't silently diverge
 * if a 6th policy is ever added. Keyed on the persisted 2-char RAP_CODE value.
 * @param {string} rapCode - one of RAP_CODE's values (AA/SO/NV/FS/F1)
 * @param {boolean} isRaceAsClassPick - true if the race-as-class column/button was picked
 * @returns {boolean} isSeparateRaceClass for that pick under that policy
 */
export function isSeparateRaceClassForPolicy(rapCode, isRaceAsClassPick) {
    switch (rapCode) {
        case 'AA': case 'F1': return true;
        case 'NV': return false;
        case 'SO': case 'FS': default: return !isRaceAsClassPick;
    }
}

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

function _makeGetThiefSkills(table) {
    return function getThiefSkills(level) {
        if (level < 1 || level > 14) return null;
        const i = level - 1;
        return {
            climbSheerSurfaces: `${table.climbSheerSurfaces[i]}%`,
            findRemoveTraps:    `${table.findRemoveTraps[i]}%`,
            hearNoise:          table.hearNoiseFormat === 'pct'
                                    ? `${table.hearNoise[i]}%`
                                    : `1-${table.hearNoise[i]} on 1d6`,
            hideInShadows:      `${table.hideInShadows[i]}%`,
            moveSilently:       `${table.moveSilently[i]}%`,
            openLocks:          `${table.openLocks[i]}%`,
            pickPockets:        `${table.pickPockets[i]}%`
        };
    };
}

export const getThiefSkills = _makeGetThiefSkills(THIEF_SKILLS);

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
    smoothprog: {
        ATTACK_BONUS_PROGRESSIONS: GYGAR_ATTACK_BONUS_PROGRESSIONS,
        ATTACK_BONUS_SCALE:        GYGAR_ATTACK_BONUS_SCALE,
        SAVING_THROWS:             GYGAR_SAVING_THROWS,
        getHitDice, getXPRequired, getTurnUndead, getLevelFromXP, getXPToNextLevel,
        getThiefSkills:  _makeGetThiefSkills(SMOOTHPROG_THIEF_SKILLS),
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

// ── Equipment purchasing ───────────────────────────────────────────────────────

export const DUNGEONEERING_BUNDLE = [
    { name: "Backpack",                   cost: 5 },
    { name: "Tinder box (flint & steel)", cost: 3 },
    { name: "Torches (6)",                cost: 1 },
    { name: "Rope (50')",                 cost: 1 },
    { name: "Waterskin",                  cost: 1 },
    { name: "Crowbar",                    cost: 10 },
];

// A handful of background `item` entries are just a differently-worded
// version of a DUNGEONEERING_BUNDLE entry (Sailor/Teamster/Executioner's
// "50' Rope" vs. the bundle's own "Rope (50')") — without this, the bundle
// purchase below would buy a redundant second rope on top of the free one,
// same class of bug as the original redundant-ammo-purchase this PR fixed.
const BACKGROUND_ITEM_NAME_ALIASES = { "50' Rope": "Rope (50')" };

export const CLASS_SPECIFIC_GEAR = {
    "Cleric": [{ name: "Holy symbol",    cost: 25 }],
    "Thief":  [{ name: "Thieves' tools", cost: 25 }],
};

export const WEAPON_PRIORITY = {
    "Fighter":    ["Sword", "Short sword", "Mace", "Hand axe", "Dagger"],
    "Dwarf":      ["Sword", "Short sword", "Mace", "Hand axe", "Dagger"],
    "Elf":        ["Sword", "Short sword", "Mace", "Hand axe", "Dagger"],
    "Gnome":      ["Sword", "Short sword", "Mace", "Hand axe", "Dagger"],
    "Halfling":   ["Sword", "Short sword", "Mace", "Hand axe", "Dagger"],
    "Spellblade": ["Sword", "Short sword", "Mace", "Hand axe", "Dagger"],
    "Cleric":     ["Mace", "War hammer", "Club", "Staff", "Sling"],
    "Magic-User": ["Dagger", "Staff"],
    "Thief":      ["Sword", "Short sword", "Dagger", "Club"],
};

export const ARMOR_PRIORITY = ["Plate mail", "Banded mail", "Chain mail", "Scale mail", "Leather", "Gambeson"];

// Races whose Combat racial ability says "no longbows or two-handed swords"
// (Dwarf, Halfling, Gnome) — they get the largest equivalent weapon they can
// actually use instead: a Sword (or Short sword — see SHORT_SWORD_LIMITED_RACES)
// in place of a Two-handed sword, a Short bow in place of a Long bow.
export const SMALL_RACE_WEAPON_RESTRICTED_RACES = new Set(["Dwarf_RACE", "Halfling_RACE", "Gnome_RACE"]);

// Halfling and Gnome (deliberately not Dwarf, who uses a Sword normally per
// their Combat ability) default to a Short sword instead of a Sword — but
// only when the referee's limitSmallRaceShortSword house rule is on. Shared
// by purchaseEquipment()'s own default weapon choice and
// substituteSmallRaceWeapon()'s Two-handed-sword substitution below, so the
// two can't disagree about what a Halfling/Gnome's "normal" sword is.
const SHORT_SWORD_LIMITED_RACES = new Set(["Halfling_RACE", "Gnome_RACE"]);

/**
 * Substitute a weapon a small race can't use (Longbow, Two-handed sword) with
 * the largest equivalent it can (Short bow, Sword or Short sword — see
 * SHORT_SWORD_LIMITED_RACES), per that race's Combat ability. Accepts either a
 * bare WEAPONS-table name or a background-style display string (e.g.
 * "Longbow (1d6) + 10 arrows") — any trailing text after the weapon name is
 * preserved, with the damage die rewritten to match the replacement weapon's
 * own entry in WEAPONS.
 * @param {string} weaponText - weapon name or display string
 * @param {string} race - race name (with or without _RACE suffix)
 * @param {boolean} [limitSmallRaceShortSword] - referee house rule, see SHORT_SWORD_LIMITED_RACES
 * @returns {string} substituted weapon text, or the original if no substitution applies
 */
export function substituteSmallRaceWeapon(weaponText, race, limitSmallRaceShortSword = false) {
    const normalizedRace = normalizeRaceName(race);
    if (!weaponText || !SMALL_RACE_WEAPON_RESTRICTED_RACES.has(normalizedRace)) return weaponText;

    const swordReplacement = SHORT_SWORD_LIMITED_RACES.has(normalizedRace) && limitSmallRaceShortSword
        ? "Short sword" : "Sword";
    const substitutions = [
        { restricted: "Long bow",         replacement: "Short bow",      weaponsKey: "Short bow" },
        { restricted: "Longbow",          replacement: "Shortbow",       weaponsKey: "Short bow" },
        { restricted: "Two-handed sword", replacement: swordReplacement, weaponsKey: swordReplacement },
    ];
    for (const { restricted, replacement, weaponsKey } of substitutions) {
        if (!weaponText.startsWith(restricted)) continue;
        const suffix = weaponText.slice(restricted.length);
        const replacementDamage = WEAPONS[weaponsKey]?.damage;
        const rewrittenSuffix = replacementDamage ? suffix.replace(/\(\d+d\d+\)/, `(${replacementDamage})`) : suffix;
        return `${replacement}${rewrittenSuffix}`;
    }
    return weaponText;
}

// Aliases between background weapon display-string spelling and the WEAPONS
// table's own key spelling. Two kinds:
//   1. Pure spelling/casing variants (Longbow -> Long bow, plural "daggers"
//      from the "N x daggers" quantity-prefix stripping -> Dagger).
//   2. Deliberate equivalences for flavor-only civilian tools with no
//      WEAPONS entry of their own, so purchaseEquipment() can still resolve
//      a class-legality/cost check for them instead of always treating them
//      as valueless — mapped to the closest real weapon by damage die and
//      handling (e.g. a Pitchfork behaves like a Spear, a Walking stick like
//      a Club). This doesn't rename the display string (still shown as
//      "Pitchfork (1d6)", not "Spear") — only the mechanical lookup changes.
const BACKGROUND_WEAPON_NAME_ALIASES = {
    Longbow: "Long bow", Shortbow: "Short bow", Shortsword: "Short sword",
    daggers: "Dagger",
    Awl: "Dagger", "Jewelled dagger": "Dagger", Razor: "Dagger",
    Scissors: "Dagger", "Stage sword": "Dagger",
    "Belaying pin": "Club", Hammer: "Club", "Walking stick": "Club",
    "Pick axe": "Hand axe", Pitchfork: "Spear",
    Rock: "Rock, Thrown 10/30/50",
};

// A handful of the flavor-item equivalences above share their alias
// target's damage/qualities for combat purposes but aren't actually worth
// the same — a Jewelled dagger is worth far more than a plain Dagger, a
// Stage sword (a theatrical prop) far less. Consulted in two places:
// crediting an unusable item's cash value (weaponCredit's !bgWeaponUsable
// branch), and buyMeleeWeapon's sell-for-upgrade check for a class-legal
// item (sold toward a better weapon rather than wielded, when that's an
// improvement) — never affects damage/legality, which still comes from
// the WEAPONS entry via BACKGROUND_WEAPON_NAME_ALIASES. Items aliased
// above but not listed here (Scissors, Belaying pin, Walking stick,
// Pitchfork, the "daggers" plural) are worth the same as their alias
// target — no override needed. Whip isn't aliased at all (it's its own
// WEAPONS entry) but is listed here at its own real cost anyway, purely to
// opt it into the sell-for-upgrade check below — a TWO_HANDED_CANDIDATE_CLASS
// with a background Whip sells it toward their preferred weapon (a Sword)
// whenever that's affordable, rather than being stuck with a 1d2 weapon
// while carrying enough gold to buy something better.
const BACKGROUND_WEAPON_VALUE_OVERRIDES = {
    "Jewelled dagger": 25, "Stage sword": 1, Awl: 1, Razor: 2, Hammer: 2, "Pick axe": 5,
    Whip: 5,
};

/**
 * Strip a background weapon display string down to its bare name — a
 * leading "N x " quantity prefix and everything from the first "(" onward
 * (damage die, ammo suffix, etc.) — with no alias applied yet. Shared by
 * normalizeBackgroundWeaponName() (which applies BACKGROUND_WEAPON_NAME_ALIASES
 * on top) and callers that need to know whether an alias substitution
 * actually happened (compare this against the normalized key).
 * @param {string} weaponText - background weapon display string
 * @returns {string} bare name, pre-alias
 */
function getBackgroundWeaponBareName(weaponText) {
    let name = weaponText.replace(/^\d+\s*x\s*/i, '');
    const parenIdx = name.indexOf('(');
    if (parenIdx !== -1) name = name.slice(0, parenIdx).trim();
    return name;
}

/**
 * Extract a background weapon's leading "N x " quantity prefix (e.g.
 * Juggler's "3 x daggers"), defaulting to 1 when there isn't one. Used to
 * scale the unusable-item credit in purchaseEquipment() — a class that
 * can't use any of the 3 daggers should be credited for all 3, not just
 * one.
 * @param {string} weaponText - background weapon display string
 * @returns {number} quantity, defaulting to 1
 */
function getBackgroundWeaponQuantity(weaponText) {
    const match = weaponText.match(/^(\d+)\s*x\s*/i);
    return match ? parseInt(match[1], 10) : 1;
}

/**
 * Reduce a background weapon's display string (e.g. "Longbow (1d6) + 10
 * arrows", "Sword (1d8)") to whatever WEAPONS-table key it might correspond
 * to, so purchaseEquipment() can recognize a background weapon that's
 * already class-legal instead of buying a redundant duplicate. Applies
 * BACKGROUND_WEAPON_NAME_ALIASES (including the deliberate flavor-item
 * equivalences documented there) on top of getBackgroundWeaponBareName().
 * Returns a best-guess name whether or not it turns out to exist in
 * WEAPONS — callers must check that themselves. A handful of background
 * weapons still have no real or equivalent WEAPONS entry and simply won't
 * match.
 * @param {string} weaponText - background weapon display string
 * @returns {string} best-guess WEAPONS-table key
 */
function normalizeBackgroundWeaponName(weaponText) {
    const name = getBackgroundWeaponBareName(weaponText);
    return BACKGROUND_WEAPON_NAME_ALIASES[name] || name;
}

// Weapons usable by literally every class, regardless of that class's own
// CLASS_INFO weapons list — both for background-weapon recognition and
// general purchase eligibility (WEAPON_PRIORITY fallback lists are
// per-class and unaffected, so this doesn't make any class default to
// shopping for these; it only makes them legal to already own/buy).
const UNIVERSALLY_USABLE_WEAPONS = new Set(["Staff", "Rock, Thrown 10/30/50"]);

// Weapons usable by any class only when inherited from their own
// background — narrower than UNIVERSALLY_USABLE_WEAPONS: not added to
// `allowedWeapons` at all, so a class can't shop for one, but a background
// that happens to hand them one is still honored instead of being treated
// as unusable.
const BACKGROUND_UNIVERSAL_WEAPONS = new Set(["Whip", "Bull Whip"]);

// Full-bundle ammunition each background's partial starter ammo (e.g.
// Hunter's "10 arrows", Innkeeper's "10 bolts") is proportionally valued
// against — Arrows (quiver of 20) 5gp -> 0.25gp/arrow; Crossbow bolts
// (case of 30) 10gp -> 0.3333gp/bolt.
const AMMO_BUNDLES = {
    arrows: { bundleName: "Arrows (quiver of 20)", bundleQty: 20 },
    bolts:  { bundleName: "Crossbow bolts (case of 30)", bundleQty: 30 },
};

/**
 * Parse a background weapon's "+ N ammoType" suffix (e.g. "Longbow (1d6) +
 * 10 arrows") into its display fragment and cash value proportional to the
 * matching full purchasable bundle. Returns null when there's no such
 * suffix or the ammo word isn't a recognized AMMO_BUNDLES type.
 * @param {string} weaponText - substituted background weapon display string
 * @returns {?{detail: string, qty: number, value: number, bundleName: string, bundleCost: number}}
 */
function parseBackgroundAmmo(weaponText) {
    const match = weaponText?.match(/\+\s*(\d+)\s+(\S+)\s*$/);
    if (!match) return null;
    const qty = parseInt(match[1], 10);
    const bundle = AMMO_BUNDLES[match[2].toLowerCase()];
    const bundleCost = bundle ? AMMUNITION[bundle.bundleName]?.cost : null;
    if (!bundle || bundleCost == null) return null;
    return {
        detail: `${qty} ${match[2]}`, qty,
        // Rounded to 2 decimals (matches the app's fractional-gold precision
        // elsewhere) — a straight fraction (e.g. 10/30 bolts) doesn't
        // terminate cleanly and would otherwise leak repeating-decimal noise
        // (33.333333333333336gp) into gold and every downstream log line.
        value: Math.round((qty / bundle.bundleQty) * bundleCost * 100) / 100,
        bundleName: bundle.bundleName, bundleCost,
    };
}

/**
 * Some background `item` entries represent cash or a sellable valuable
 * rather than a physical thing to carry — the Money Lender's bare "50gp",
 * or the Jeweller's "Ostentatious Jewellery (25gp)" (a named valuable with
 * its worth stated inline, same convention as a weapon's damage die). Both
 * convert straight to starting gold; there's no "wear/wield it instead"
 * alternative for either the way there is for weapons/armor, so unlike
 * BACKGROUND_WEAPON_VALUE_OVERRIDES this always converts, unconditionally.
 * @param {string} itemText - background item display string
 * @returns {?number} gold value if this item is cash/a priced valuable, else null
 */
function extractBackgroundItemCashValue(itemText) {
    const bareCash = itemText.match(/^(\d+)\s*gp$/i);
    if (bareCash) return parseInt(bareCash[1], 10);
    const valuable = itemText.match(/\((\d+)\s*gp\)\s*$/i);
    if (valuable) return parseInt(valuable[1], 10);
    return null;
}

// Aliases between background *armor* display-string spelling and the ARMOR
// table's own key spelling — every background's armor field is either
// "Unarmored" (American spelling; ARMOR's own "no armor" entry is spelled
// "Unarmoured") or "Chain Mail" (capital M; ARMOR's key is "Chain mail").
const BACKGROUND_ARMOR_NAME_ALIASES = { "Unarmored": "Unarmoured", "Chain Mail": "Chain mail" };

/**
 * Reduce a background's armor field to whatever ARMOR-table key it
 * corresponds to. Unlike weapons, background armor values are always
 * complete ARMOR-table names (no damage-die/quantity suffix to strip) — this
 * only exists to bridge the spelling/casing mismatch above.
 * @param {string} armorText - background armor field, e.g. "Chain Mail"
 * @returns {string} ARMOR-table key
 */
function normalizeBackgroundArmorName(armorText) {
    return BACKGROUND_ARMOR_NAME_ALIASES[armorText] || armorText;
}

// Classes whose default melee loadout is a one-handed weapon + Shield (Sword,
// or Short sword for Halfling/Gnome under limitSmallRaceShortSword — see
// SHORT_SWORD_LIMITED_RACES), and who (except Dwarf/Halfling/Gnome — see
// resolveWantsTwoHanded() below) may instead prefer a two-handed weapon,
// forgoing the shield — see purchaseEquipment()'s wantsTwoHanded param.
export const TWO_HANDED_CANDIDATE_CLASSES = new Set(["Fighter", "Dwarf", "Elf", "Gnome", "Halfling", "Spellblade"]);

// Classes purchaseEquipment() also gives a race-sized ranged weapon (Long bow,
// or Short bow for Dwarf/Halfling/Gnome). A superset of TWO_HANDED_CANDIDATE_CLASSES
// — also includes Thief, who per the SRD "can use any weapon" but has no shield
// at all (Leather armour only), so Thief is deliberately NOT in
// TWO_HANDED_CANDIDATE_CLASSES: there's no shield for a two-handed weapon to
// cost them, so that preference logic doesn't apply, only the ranged purchase.
export const RANGED_WEAPON_CANDIDATE_CLASSES = new Set([...TWO_HANDED_CANDIDATE_CLASSES, "Thief"]);

// The only background ranged weapons "good enough" to satisfy a
// RANGED_WEAPON_CANDIDATE_CLASSES member's ranged slot outright — a Sling or
// Crossbow background leaves that slot unclaimed instead, so the class still
// buys its own preferred, race-sized bow. See purchaseEquipment()'s
// bgWeaponForRanged/bgWeaponUnclaimed.
const DEDICATED_RANGED_WEAPONS = new Set(["Long bow", "Short bow"]);

// Referee-facing control over the two-handed weapon roll — persisted as
// cp.wpm (omitted when 'random', the default).
export const WEAPON_PREFERENCE_CODE = { random: 'R', 'always-shield': 'S', 'always-two-handed': 'T' };
export const CODE_TO_WEAPON_PREFERENCE = Object.fromEntries(Object.entries(WEAPON_PREFERENCE_CODE).map(([k, v]) => [v, k]));

/**
 * Decide whether a level 1+ character prefers a two-handed weapon over a
 * one-handed weapon + shield, given the referee's Weapon Preference setting.
 * Single source of truth used identically by direct level 1+ generation
 * (gen-core.js) and the level 0 -> 1 class-up transition (cs-sheet-page.js),
 * so the two paths can't silently diverge — see isSeparateRaceClassForPolicy()
 * for the same pattern applied to Racial Adjustment Policy.
 *
 * Dwarf, Halfling, and Gnome always return false — they can't wield an actual
 * Two-handed sword, and there's no benefit to using their own Sword two-handed
 * just to lose the shield, so they have no two-handed option at all regardless
 * of the referee's Weapon Preference setting.
 * @param {string} weaponPreferenceMode - 'random' | 'always-shield' | 'always-two-handed'
 * @param {string} className - Full class name e.g. 'Fighter_CLASS'
 * @param {string} race - Race name (with or without _RACE suffix)
 * @returns {boolean}
 */
export function resolveWantsTwoHanded(weaponPreferenceMode, className, race) {
    const baseClass = className.replace(/_CLASS$/, '');
    if (!TWO_HANDED_CANDIDATE_CLASSES.has(baseClass)) return false;
    if (SMALL_RACE_WEAPON_RESTRICTED_RACES.has(normalizeRaceName(race))) return false;
    if (weaponPreferenceMode === 'always-shield') return false;
    if (weaponPreferenceMode === 'always-two-handed') return true;
    return Math.random() < (1 / 3);
}

/**
 * Purchase starting equipment for a character.
 * @param {string} className   - Full class name e.g. 'Fighter_CLASS'
 * @param {number} startingGold - Starting gold (generation input, not goldRemaining)
 * @param {number} dexModifier  - DEX ability modifier (numeric bonus/penalty, post-racial)
 * @param {Object} background   - Background entry { weapon, armor, item }
 * @param {string} progression  - Progression mode key ('ose'|'smooth'|'ll') — reserved
 * @param {string} [race]       - Race name, used to substitute a too-large background
 *                                weapon (Longbow, Two-handed sword) for a small race —
 *                                see substituteSmallRaceWeapon() — and to determine the
 *                                two-handed-weapon and ranged-weapon choices below. Omit
 *                                for no substitution.
 * @param {boolean} [wantsTwoHanded] - For TWO_HANDED_CANDIDATE_CLASSES only, and never for
 *                                Dwarf/Halfling/Gnome (see SHORT_SWORD_LIMITED_RACES comment):
 *                                this character prefers a two-handed weapon over a one-handed
 *                                weapon + shield. Rolled once at character creation and
 *                                persisted (cp.th) rather than re-rolled on every render.
 * @param {boolean} [limitSmallRaceShortSword] - Referee house rule: Halfling and Gnome (not
 *                                Dwarf) use a Short sword instead of a Sword as their default
 *                                melee weapon. Persisted as cp.ssw — see callers.
 * @param {number} [strModifier] - STR ability modifier (numeric bonus/penalty, post-racial). For
 *                                RANGED_WEAPON_CANDIDATE_CLASSES only: when this is > dexModifier,
 *                                the melee weapon is bought before the ranged weapon (default);
 *                                when dexModifier is higher, ranged is bought first instead, so
 *                                a gold-limited character gets whichever weapon suits them best.
 * @returns {{ weapons, armor, shield, items, startingAC, goldRemaining }}
 */
export function purchaseEquipment(className, startingGold, dexModifier, background, progression, race, wantsTwoHanded = false, limitSmallRaceShortSword = false, strModifier = 0) {
    let gold = startingGold;
    const result = {
        weapons: [], armor: null, shield: false,
        items: [], startingAC: 10 + dexModifier, goldRemaining: 0
    };
    // Per-item purchase log for the console breakdown at the bottom of this
    // function — every gold-spending line below pushes here alongside its
    // `gold -=` so the log can never drift out of sync with what was actually
    // charged. Background-carried-through items are logged too (at 0gp) so
    // it's clear they weren't skipped, just free.
    const purchaseLog = [];

    const baseClass = className.replace(/_CLASS$/, '');
    const classInfo = CLASS_INFO[baseClass];

    // Does the background's own weapon happen to already be one this class can
    // use? If so it satisfies a purchase slot for free instead of also buying
    // a redundant duplicate (e.g. a Hunter's background Longbow shouldn't sit
    // next to a freshly-bought Long bow). Checked against the *substituted*
    // form (a small race's Longbow is already a Shortbow by the time this
    // matters) via normalizeBackgroundWeaponName() — most background weapons
    // (Stage sword, Rock, Walking stick, etc.) are flavor-only civilian items
    // with no WEAPONS entry at all, so this simply won't match for them.
    const substitutedBgWeapon = background?.weapon ? substituteSmallRaceWeapon(background.weapon, race, limitSmallRaceShortSword) : null;
    const bgWeaponKey  = substitutedBgWeapon ? normalizeBackgroundWeaponName(substitutedBgWeapon) : null;
    const bgWeaponData = bgWeaponKey ? WEAPONS[bgWeaponKey] : null;
    const bgAmmo = substitutedBgWeapon ? parseBackgroundAmmo(substitutedBgWeapon) : null;
    // Staff is usable by every class outright (both for background
    // recognition and general purchase eligibility below) — broader than
    // BACKGROUND_UNIVERSAL_WEAPONS, which only covers background carry-through.
    const allowedWeapons = new Set([...(classInfo?.weapons || []), ...UNIVERSALLY_USABLE_WEAPONS]);
    // Whip is usable by any class if their background happens to provide
    // one, even though it's not on that class's own weapons list and isn't
    // something they'd otherwise shop for — narrower than making it
    // universally purchasable.
    const bgWeaponUsable = !!(bgWeaponData && (allowedWeapons.has(bgWeaponKey) || BACKGROUND_UNIVERSAL_WEAPONS.has(bgWeaponKey)));
    // True for any ranged-only weapon (Long bow, Short bow, Crossbow, Sling) —
    // dual-use throwables like Dagger/Hand axe/Spear also carry "Missile" but
    // are fundamentally melee weapons (they also carry "Melee"), so they must
    // not claim the ranged slot and block the character from getting an
    // actual bow. Being ranged-only doesn't by itself mean "good enough" to
    // claim the ranged slot outright — see DEDICATED_RANGED_WEAPONS below,
    // which narrows this further to just Long bow/Short bow.
    const bgWeaponIsRanged = !!(bgWeaponData?.qualities?.includes("Missile") && !bgWeaponData?.qualities?.includes("Melee"));

    if (!classInfo) {
        // Still show the background's flavor items even for an unrecognized class.
        if (substitutedBgWeapon) result.items.push(`${substitutedBgWeapon} (background)`);
        if (background?.armor)  result.items.push(`${background.armor} (background)`);
        const bgItemsUnknown = Array.isArray(background?.item) ? background.item : (background?.item ? [background.item] : []);
        bgItemsUnknown.forEach(i => { if (i) result.items.push(i); });
        result.goldRemaining = gold; return result;
    }

    const allowedArmors  = (classInfo.armor || []).filter(a => a !== "Shield");
    const allowsShield   = (classInfo.armor || []).includes("Shield");
    const isSmallRace     = SMALL_RACE_WEAPON_RESTRICTED_RACES.has(normalizeRaceName(race));
    const isTwoHandedCandidate = TWO_HANDED_CANDIDATE_CLASSES.has(baseClass);
    const isRangedCandidate    = RANGED_WEAPON_CANDIDATE_CLASSES.has(baseClass);

    // The background weapon satisfies the ranged slot only if this class
    // actually has one (RANGED_WEAPON_CANDIDATE_CLASSES) and the weapon is a
    // dedicated bow (Long bow/Short bow) — a Fighter-type still buys their own
    // preferred bow over a background Sling or Crossbow (weaker/non-martial
    // ranged options), which are left unclaimed by either slot for these
    // classes rather than treated as "good enough." Any other class-legal
    // background weapon — melee, dual-use throwable, or ranged for a class
    // with no separate ranged slot (Cleric, Magic-User) — satisfies the
    // single melee/primary slot, matching how those classes always worked.
    const bgWeaponIsDedicatedRanged = bgWeaponIsRanged && DEDICATED_RANGED_WEAPONS.has(bgWeaponKey);
    const bgWeaponForRanged = bgWeaponUsable && isRangedCandidate && bgWeaponIsDedicatedRanged;
    const bgWeaponUnclaimed = isRangedCandidate && bgWeaponIsRanged && !bgWeaponIsDedicatedRanged;
    const bgWeaponForMelee  = bgWeaponUsable && !bgWeaponForRanged && !bgWeaponUnclaimed;

    // Weapon pricing credit: if the character doesn't end up with the exact
    // weapon their background lists — either downgraded by race substitution
    // (a small race's Longbow became a cheaper Short bow) or entirely unusable
    // by this class (a Cleric's background Sword) — credit the gold value gap
    // instead of silently absorbing it. bgWeaponUnclaimed (a background
    // Sling/Crossbow this class *could* use but the tool prefers not to
    // auto-equip over its own preferred bow) is excluded — that weapon isn't
    // actually unusable, just not auto-selected, so no credit applies. Only
    // meaningful when the background weapon is a real WEAPONS-table item to
    // begin with — most backgrounds (Rock, Walking stick, etc.) are
    // flavor-only with no WEAPONS entry and nothing to credit. When the
    // weapon is entirely unusable its starter ammo (bgAmmo) is credited too,
    // at its own proportional value — see parseBackgroundAmmo() — since
    // there's no bow left to fire it from either. When the weapon is
    // downgraded-but-still-usable, its ammo is handled separately in
    // buyRangedWeapon() (sell it toward a full bundle, or just keep it).
    let weaponCredit = 0;
    if (background?.weapon) {
        const originalKey     = normalizeBackgroundWeaponName(background.weapon);
        const originalCost    = WEAPONS[originalKey]?.cost;
        const bareName        = getBackgroundWeaponBareName(substitutedBgWeapon);
        const substitutedCost = BACKGROUND_WEAPON_VALUE_OVERRIDES[bareName] ?? bgWeaponData?.cost;
        if (!bgWeaponUsable) {
            // Credit every copy, not just one — Juggler's "3 x daggers" is
            // worth 3x a single Dagger's cost when a Cleric can't use any
            // of them.
            const quantity = getBackgroundWeaponQuantity(background.weapon);
            if (!bgWeaponUnclaimed) weaponCredit = (substitutedCost ?? 0) * quantity + (bgAmmo?.value ?? 0);
        } else if (originalKey !== bgWeaponKey && originalCost != null && substitutedCost != null) {
            weaponCredit = Math.max(0, originalCost - substitutedCost);
        }
    }
    gold += weaponCredit;

    // Only shown as a loose flavor item when it doesn't satisfy an actual
    // equipment slot above and wasn't cashed out above — once claimed as the
    // melee/ranged weapon or credited as gold, it's represented that way
    // instead (see buyMeleeWeapon/buyRangedWeapon and weaponCredit above).
    if (substitutedBgWeapon && !bgWeaponForMelee && !bgWeaponForRanged && weaponCredit === 0) {
        result.items.push(`${substitutedBgWeapon} (background)`);
    } else if (weaponCredit > 0 && !bgWeaponUsable) {
        purchaseLog.push(`${substitutedBgWeapon} — unusable by ${baseClass}, credited +${weaponCredit}gp instead`);
    } else if (weaponCredit > 0) {
        // Downgraded-but-still-usable case (bgWeaponForRanged/bgWeaponForMelee
        // already claimed it and logged its own "0gp (background)" line) —
        // this credit is a price-gap bonus on top of keeping the weapon, not
        // a replacement for it, so the wording must not say "unusable" or
        // "instead" here.
        const originalKeyForLog = normalizeBackgroundWeaponName(background.weapon);
        purchaseLog.push(`${bgWeaponKey} downgraded from ${originalKeyForLog} for a small race — credited +${weaponCredit}gp price difference`);
    }
    const bgArmorKey = background?.armor ? normalizeBackgroundArmorName(background.armor) : null;
    const bgArmorUsable = !!(bgArmorKey && bgArmorKey !== 'Unarmoured' && ARMOR[bgArmorKey] && allowedArmors.includes(bgArmorKey));
    const armorCredit = (bgArmorKey && bgArmorKey !== 'Unarmoured' && !bgArmorUsable) ? (ARMOR[bgArmorKey]?.cost ?? 0) : 0;
    gold += armorCredit;
    if (background?.armor && !bgArmorUsable && armorCredit === 0) {
        // "Unarmored" (nothing to claim or credit) or a genuinely unrecognized
        // armor string — shown as-is, same as always.
        result.items.push(`${background.armor} (background)`);
    } else if (armorCredit > 0) {
        purchaseLog.push(`${background.armor} — unusable by ${baseClass}, credited +${armorCredit}gp instead`);
    }
    // bgArmorUsable armor is claimed for free below (see the armor-purchase
    // loop), not shown as a flavor item — it's represented as result.armor.
    const bgItems = Array.isArray(background?.item) ? background.item : (background?.item ? [background.item] : []);
    bgItems.forEach(i => {
        if (!i) return;
        const cashValue = extractBackgroundItemCashValue(i);
        if (cashValue != null) {
            gold += cashValue;
            purchaseLog.push(`${i} — converted to +${cashValue}gp starting gold`);
        } else {
            result.items.push(i);
        }
    });

    // Name of the melee weapon actually purchased, tracked separately from
    // result.weapons (which may also gain a ranged weapon below) so the
    // shield-skip check only ever looks at the melee weapon's own WEAPONS
    // quality — a purchased bow also carries "Two-handed" (needs both hands
    // to draw) but doesn't preclude carrying a shield on the back.
    let meleeWeaponName = null;
    // The cost of whichever weapon this class would buy if there were no
    // background weapon at all — used only to decide whether selling a
    // near-worthless background item (see UNIVERSALLY_USABLE_WEAPONS below)
    // is what bridges the gap to affording it. Doesn't mutate anything.
    const getPreferredMeleeCost = () => {
        if (isTwoHandedCandidate) {
            const preferred = isSmallRace
                ? (SHORT_SWORD_LIMITED_RACES.has(normalizeRaceName(race)) && limitSmallRaceShortSword ? "Short sword" : "Sword")
                : (wantsTwoHanded ? "Two-handed sword" : "Sword");
            if (allowedWeapons.has(preferred) && WEAPONS[preferred]) return WEAPONS[preferred].cost;
        }
        for (const wName of (WEAPON_PRIORITY[baseClass] || [])) {
            if (allowedWeapons.has(wName) && WEAPONS[wName]) return WEAPONS[wName].cost;
        }
        return null;
    };

    const buyMeleeWeapon = () => {
        if (bgWeaponForMelee) {
            const bareName = getBackgroundWeaponBareName(substitutedBgWeapon);
            // A near-worthless combat item (a Rock, 0.1gp — via
            // UNIVERSALLY_USABLE_WEAPONS) or a valuable heirloom whose true
            // worth is captured by BACKGROUND_WEAPON_VALUE_OVERRIDES (a
            // Jewelled dagger, worth 25gp despite fighting exactly like a
            // 3gp Dagger) doesn't lock the character into wielding it over
            // a real weapon — it's sold whenever the class has (or, with
            // its sale price added in, would have) a real preferred weapon
            // to spend the money on instead. Sale happens even when the
            // preferred weapon was already affordable without any help —
            // simply dropping the item without credit or a flavor mention
            // would both lose its value and make it vanish from the sheet,
            // which is exactly the failure mode this whole credit mechanism
            // exists to avoid (see weaponCredit above). Only when there's
            // no affordable preferred weapon even with the item's help does
            // it stay unsold, kept and wielded for free (the else branch
            // below) — nothing gained by selling it in that case.
            const isNearWorthless = UNIVERSALLY_USABLE_WEAPONS.has(bgWeaponKey) && bgWeaponData.cost > 0 && bgWeaponData.cost < 1;
            const saleValue = BACKGROUND_WEAPON_VALUE_OVERRIDES[bareName] ?? (isNearWorthless ? bgWeaponData.cost : null);
            let claimForFree = true;
            if (saleValue != null) {
                const preferredCost = getPreferredMeleeCost();
                if (preferredCost != null && (gold >= preferredCost || gold + saleValue >= preferredCost)) {
                    gold += saleValue;
                    purchaseLog.push(`${substitutedBgWeapon} sold for ${saleValue}gp`);
                    claimForFree = false;
                }
            }
            if (!claimForFree) {
                // Falls through to the normal purchase logic below instead
                // of claiming/returning — the now-affordable (or
                // always-affordable) preferred weapon gets bought there.
            } else {
                // When the background weapon only matches via a
                // BACKGROUND_WEAPON_NAME_ALIASES equivalence (e.g. a
                // Farmer's "Pitchfork" treated as a Spear) rather than being
                // the real thing, show both names — "Pitchfork (1d6) (as
                // Spear)" — so the flavor name isn't silently replaced by the
                // mechanical one. The damage die stays in the displayed
                // string (not stripped) so the sheet template's own
                // damage-die detection renders it verbatim instead of
                // failing a WEAPONS[name] lookup on the combined string and
                // showing no damage at all. Exception: when the WEAPONS key
                // is just the bare name's own fuller/canonical form (e.g.
                // "Rock" -> "Rock, Thrown 10/30/50"), it's the same item,
                // not a substitution — show the flavor text as-is, no
                // "(as ...)" suffix. A literal match (e.g. Weaponsmith's
                // "Sword (1d8)") collapses to the bare key so the sheet's
                // own damage-die lookup re-derives "(1d8)" instead of
                // showing a redundant background tag — UNLESS the
                // background text carries something beyond a plain damage
                // die (Teamster's "Whip (1d2, hits entangle)"), which has no
                // other home and would otherwise vanish entirely.
                const isPlainDamageForm = bareName === bgWeaponKey
                    && substitutedBgWeapon === `${bgWeaponKey} (${bgWeaponData.damage})`;
                const displayName = isPlainDamageForm ? bgWeaponKey
                    : bareName === bgWeaponKey ? substitutedBgWeapon
                    : bgWeaponKey.startsWith(bareName) ? substitutedBgWeapon
                    : `${substitutedBgWeapon} (as ${bgWeaponKey})`;
                result.weapons.push(displayName);
                meleeWeaponName = bgWeaponKey;
                purchaseLog.push(`${displayName} — 0gp (background)`);
                return;
            }
        }
        if (isTwoHandedCandidate) {
            const preferred = isSmallRace
                ? (SHORT_SWORD_LIMITED_RACES.has(normalizeRaceName(race)) && limitSmallRaceShortSword ? "Short sword" : "Sword")
                : (wantsTwoHanded ? "Two-handed sword" : "Sword");
            if (allowedWeapons.has(preferred) && WEAPONS[preferred] && WEAPONS[preferred].cost <= gold) {
                result.weapons.push(preferred); gold -= WEAPONS[preferred].cost; result.items.push(preferred);
                meleeWeaponName = preferred;
                purchaseLog.push(`${preferred} — ${WEAPONS[preferred].cost}gp`);
                return;
            }
        }
        // Fall back to the generic priority list if the preferred weapon
        // couldn't be afforded (or this class has no two-handed preference at
        // all) — keeps a low-gold character armed with whatever they can
        // afford instead of ending up weaponless.
        for (const wName of (WEAPON_PRIORITY[baseClass] || [])) {
            if (allowedWeapons.has(wName) && WEAPONS[wName] && WEAPONS[wName].cost <= gold) {
                result.weapons.push(wName); gold -= WEAPONS[wName].cost; result.items.push(wName);
                meleeWeaponName = wName;
                purchaseLog.push(`${wName} — ${WEAPONS[wName].cost}gp`);
                break;
            }
        }
    };

    // A Long bow, Short bow, or Sling needs ammo to actually shoot — bought
    // alongside it (gold permitting) whether it was freshly purchased or
    // recognized from the background. Sling stones are free
    // (AMMUNITION["Sling stones"].cost === 0) but still listed so a freshly
    // bought Sling shows its ammo like the bows do. Crossbow is never
    // claimed via bgWeaponForRanged (see DEDICATED_RANGED_WEAPONS) and never
    // appears in rangedFallbackChain below, so buyAmmoFor() is only ever
    // called with "Long bow", "Short bow", or "Sling".
    const AMMO_FOR_WEAPON = { "Long bow": "Arrows (quiver of 20)", "Short bow": "Arrows (quiver of 20)", "Sling": "Sling stones" };
    const buyAmmoFor = (weaponName) => {
        const ammo = AMMO_FOR_WEAPON[weaponName];
        if (ammo && AMMUNITION[ammo] && AMMUNITION[ammo].cost <= gold) {
            result.items.push(ammo); gold -= AMMUNITION[ammo].cost;
            purchaseLog.push(`${ammo} — ${AMMUNITION[ammo].cost}gp`);
        }
    };

    // RANGED_WEAPON_CANDIDATE_CLASSES also get a ranged weapon sized for
    // their race — Long bow normally, Short bow for Dwarf/Halfling/Gnome
    // (same "no longbows" restriction as their Combat ability) — falling
    // back to a cheaper option when the preferred one isn't affordable,
    // same pattern as the melee WEAPON_PRIORITY fallback loop.
    const rangedFallbackChain = isSmallRace ? ["Short bow", "Sling"] : ["Long bow", "Short bow", "Sling"];
    const buyRangedWeapon = () => {
        if (!isRangedCandidate) return;
        if (bgWeaponForRanged) {
            result.weapons.push(bgWeaponKey);
            purchaseLog.push(`${bgWeaponKey} — 0gp (background)`);
            // The background's own weapon text already includes its ammo (e.g.
            // Hunter's "Longbow (1d6) + 10 arrows") — never buy a fresh
            // "Arrows (quiver of 20)" *on top of* it for free (that would
            // silently charge for ammo the character already had). Instead,
            // sell the partial starter ammo at its proportional value (see
            // parseBackgroundAmmo()) and put that credit toward a full
            // bundle, so the character only pays the net difference — e.g.
            // Hunter's 10 arrows (2.5gp) toward a 5gp quiver of 20 nets 2.5gp.
            // If even the discounted bundle isn't affordable, fall back to
            // just keeping the original partial ammo for free. Only the ammo
            // fragment is ever pushed as an item, never the full
            // "Shortbow (1d6) + 10 arrows" string — that contains a
            // damage-die notation, which the sheet template sweeps into the
            // Weapons box as its own slot, duplicating the bow already listed
            // via result.weapons above.
            if (bgAmmo) {
                const netCost = bgAmmo.bundleCost - bgAmmo.value;
                if (netCost <= gold) {
                    gold -= netCost;
                    result.items.push(bgAmmo.bundleName);
                    purchaseLog.push(`${bgAmmo.bundleName} — ${bgAmmo.bundleCost}gp, net ${netCost}gp after selling starting ${bgAmmo.detail} (background) for ${bgAmmo.value}gp`);
                } else {
                    result.items.push(`${bgAmmo.detail} (background)`);
                    purchaseLog.push(`${bgAmmo.detail} — 0gp (background, net ${netCost}gp upgrade to ${bgAmmo.bundleName} not affordable)`);
                }
            }
            return;
        }
        for (const rName of rangedFallbackChain) {
            if (allowedWeapons.has(rName) && WEAPONS[rName] && WEAPONS[rName].cost <= gold) {
                result.weapons.push(rName); gold -= WEAPONS[rName].cost; result.items.push(rName);
                purchaseLog.push(`${rName} — ${WEAPONS[rName].cost}gp`);
                buyAmmoFor(rName);
                break;
            }
        }
    };

    // A character who's better at range than melee (DEX modifier > STR
    // modifier) buys their ranged weapon first, so limited gold favors
    // whichever weapon actually suits them; otherwise melee comes first.
    if (isRangedCandidate && dexModifier > strModifier) {
        buyRangedWeapon();
        buyMeleeWeapon();
    } else {
        buyMeleeWeapon();
        buyRangedWeapon();
    }

    // A Magic-User tries to own both their primary weapon (usually a
    // Dagger, or whatever they ended up with above) AND a Staff — a
    // spell-focus/walking-stick item as much as a weapon — rather than
    // just one or the other. This is a deliberate second purchase, gold
    // permitting, specific to Magic-User (not a general "every class buys
    // two weapons" rule); Staff itself is legal for every class (see
    // UNIVERSALLY_USABLE_WEAPONS) but only Magic-User actively shops for one.
    if (baseClass === "Magic-User" && meleeWeaponName !== "Staff" && WEAPONS["Staff"] && WEAPONS["Staff"].cost <= gold) {
        result.weapons.push("Staff"); gold -= WEAPONS["Staff"].cost; result.items.push("Staff");
        purchaseLog.push(`Staff — ${WEAPONS["Staff"].cost}gp (Magic-User owns both)`);
    }

    // Unlike a class-legal background weapon (always used as-is, no
    // auto-upgrade), armor is the one slot where the character's own gold
    // can buy something strictly better than the free background piece —
    // so check whether they can actually afford an upgrade before settling
    // for it. No credit for "passing up" the free armor: nothing of value
    // is lost by choosing to pay for better gear instead of wearing worse
    // free gear, unlike the class-illegal case where the background armor
    // is unusable no matter what.
    const bestAffordableArmor = ARMOR_PRIORITY.find(aName => allowedArmors.includes(aName) && ARMOR[aName] && ARMOR[aName].cost <= gold);
    const bgArmorAC = bgArmorUsable ? ARMOR[bgArmorKey].ac.ascending : -Infinity;
    const bestAffordableAC = bestAffordableArmor ? ARMOR[bestAffordableArmor].ac.ascending : -Infinity;
    if (bgArmorUsable && bgArmorAC >= bestAffordableAC) {
        result.armor = bgArmorKey;
        purchaseLog.push(`${bgArmorKey} — 0gp (background)`);
    } else if (bestAffordableArmor) {
        result.armor = bestAffordableArmor; gold -= ARMOR[bestAffordableArmor].cost;
        purchaseLog.push(`${bestAffordableArmor} — ${ARMOR[bestAffordableArmor].cost}gp${bgArmorUsable ? ` (better than free background ${bgArmorKey})` : ''}`);
    }

    // No shield with a two-handed melee weapon in hand (a literal Two-handed
    // sword, or anything else with the WEAPONS "Two-handed" quality) — deliberately
    // checks only meleeWeaponName, not the whole result.weapons array, since a
    // purchased bow also carries "Two-handed" but doesn't preclude a shield.
    const wieldingTwoHanded = WEAPONS[meleeWeaponName]?.qualities?.includes("Two-handed") ?? false;
    if (allowsShield && !wieldingTwoHanded && ARMOR["Shield"] && ARMOR["Shield"].cost <= gold) {
        result.shield = true; gold -= ARMOR["Shield"].cost;
        purchaseLog.push(`Shield — ${ARMOR["Shield"].cost}gp`);
    }

    // Names already sitting for free in result.items from the bgItems loop
    // above — either verbatim (Acolyte's background "Holy symbol" exactly
    // matches CLASS_SPECIFIC_GEAR's Cleric entry) or under a differently-
    // worded alias (Sailor/Teamster/Executioner's "50' Rope" vs.
    // DUNGEONEERING_BUNDLE's "Rope (50')") — skipped below in both fixed
    // purchase lists so a background item is never bought a second time,
    // same class of bug as the original redundant-ammo-purchase this PR fixed.
    const bgProvidedItemNames = new Set([...bgItems, ...bgItems.map(i => BACKGROUND_ITEM_NAME_ALIASES[i]).filter(Boolean)]);

    for (const { name, cost } of (CLASS_SPECIFIC_GEAR[baseClass] || [])) {
        if (bgProvidedItemNames.has(name)) continue;
        if (cost <= gold) { result.items.push(name); gold -= cost; purchaseLog.push(`${name} — ${cost}gp`); }
    }

    for (const { name, cost } of DUNGEONEERING_BUNDLE) {
        if (bgProvidedItemNames.has(name)) continue;
        if (cost <= gold) { result.items.push(name); gold -= cost; purchaseLog.push(`${name} — ${cost}gp`); }
    }

    if (ARMOR["Helmet"] && ARMOR["Helmet"].cost <= gold) {
        result.items.push("Helmet"); gold -= ARMOR["Helmet"].cost;
        purchaseLog.push(`Helmet — ${ARMOR["Helmet"].cost}gp`);
    }

    const armorAC  = result.armor ? ARMOR[result.armor].ac.ascending : 10;
    result.startingAC    = armorAC + dexModifier + (result.shield ? 1 : 0);
    result.goldRemaining = gold;

    console.log('\n=== Equipment Purchases ===');
    console.log(`Starting gold: ${startingGold} gp`);
    if (purchaseLog.length) {
        console.log('Purchase breakdown:');
        purchaseLog.forEach(line => console.log(`  - ${line}`));
    }
    if (result.weapons.length) console.log(`Weapons: ${result.weapons.join(', ')}`);
    if (result.armor)          console.log(`Armor: ${result.armor}`);
    if (result.shield)         console.log(`Shield: yes`);
    const purchasedItems = result.items.filter(i => !i.includes('(background)'));
    if (purchasedItems.length) console.log(`Items: ${purchasedItems.join(', ')}`);
    // Rounded for this debug line only (result.goldRemaining itself stays
    // unrounded — the sheet's own displayed "Starting Gold" line already
    // rounds via cs-core.js's formatGold()). Ammo-value credits (see
    // parseBackgroundAmmo()) can otherwise leave float noise here even
    // though the credit itself was already rounded to 2 decimals.
    console.log(`AC: ${result.startingAC}  |  Gold remaining: ${Math.round(result.goldRemaining * 100) / 100} gp`);
    console.log('===========================\n');

    return result;
}

// ── Background tables ──────────────────────────────────────────────────────────

export const backgroundTables = {
    1: [
        { profession: "Acolyte",                item: ["Incense", "Holy symbol"],          weapon: "Mace (1d6)",                  armor: "Unarmored" },
        { profession: "Actor",                  item: ["2 x Masks", "2 x Costumes"],       weapon: "Stage sword (1d4)",            armor: "Unarmored" },
        { profession: "Alchemist's Apprentice", item: ["Potion of Healing"],               weapon: "Club (1d4)",                  armor: "Unarmored" },
        { profession: "Artist",                 item: ["Parchment", "Paint", "Brush"],     weapon: "Hammer (1d4)",                armor: "Unarmored" },
        { profession: "Beggar",                 item: ["Wooden bowl"],                     weapon: "Walking stick (1d4)",         armor: "Unarmored" },
        { profession: "Jeweller",               item: ["Ostentatious Jewellery (25gp)"],   weapon: "Dagger (1d4)",                armor: "Unarmored" },
        { profession: "Juggler",                item: ["Juggling balls"],                  weapon: "3 x daggers (1d4)",           armor: "Unarmored" },
        { profession: "Money Lender",           item: ["50gp"],                            weapon: "Mace (1d6)",                  armor: "Unarmored" },
        { profession: "Scribe",                 item: ["3 x Parchment", "Ink pot", "Quill"], weapon: "Staff (1d4)",               armor: "Unarmored" },
        { profession: "Trumpet Player",         item: ["Trumpet"],                         weapon: "Rock (1d3)",                  armor: "Unarmored" },
        { profession: "Wealthy Heir",           item: ["Signet ring", "Perfume"],          weapon: "Jewelled dagger (1d4)",       armor: "Unarmored" },
        { profession: "Wizard's Apprentice",    item: ["Spell book (1 random cantrip)"],   weapon: "Dagger (1d4)",                armor: "Unarmored" }
    ],
    2: [
        { profession: "Butcher",    item: ["Dried meat (5 days' iron rations)"],    weapon: "2 x daggers (1d4)",           armor: "Unarmored" },
        { profession: "Butler",     item: ["Livery", "Silver serving tray"],        weapon: "Hand axe (1d6)",              armor: "Unarmored" },
        { profession: "Cook",       item: ["Salt", "Skillet", "Onion"],             weapon: "Dagger (1d4)",                armor: "Unarmored" },
        { profession: "Fletcher",   item: ["Bag of feathers"],                      weapon: "Shortbow (1d6) + 10 arrows",  armor: "Unarmored" },
        { profession: "Gambler",    item: ["Dice"],                                 weapon: "Club (1d4)",                  armor: "Unarmored" },
        { profession: "Horse Thief",item: ["A horse"],                              weapon: "Spear (1d6)",                 armor: "Unarmored" },
        { profession: "Innkeeper",  item: ["3 x Bottles of wine"],                  weapon: "Crossbow (1d6) + 10 bolts",   armor: "Unarmored" },
        { profession: "Navigator",  item: ["Compass", "Parchment", "Chalk"],        weapon: "Crossbow (1d6) + 10 bolts",   armor: "Unarmored" },
        { profession: "Shepherd",   item: ["Pole (10' long, wooden)"],              weapon: "Sling (1d4) + 10 stones",     armor: "Unarmored" },
        { profession: "Tailor",     item: ["Needle", "Thread", "Bag of buttons"],   weapon: "Scissors (1d4)",              armor: "Unarmored" },
        { profession: "Trader",     item: ["Rare, fragrant spices"],                weapon: "Crossbow (1d6) + 10 bolts",   armor: "Unarmored" },
        { profession: "Weaver",     item: ["Hand Loom", "Yarn"],                    weapon: "Scissors (1d4)",              armor: "Unarmored" }
    ],
    3: [
        { profession: "Bowyer",       item: ["Saw"],                                 weapon: "Longbow (1d6) + 10 arrows",   armor: "Unarmored" },
        { profession: "Cooper",       item: ["Barrel"],                              weapon: "Hammer (1d4)",                armor: "Unarmored" },
        { profession: "Executioner",  item: ["50' Rope"],                            weapon: "Battle axe (1d8)",            armor: "Unarmored" },
        { profession: "Fisher",       item: ["Net"],                                 weapon: "Spear (1d6)",                 armor: "Unarmored" },
        { profession: "Groom",        item: ["Brush"],                               weapon: "Pitchfork (1d6)",             armor: "Unarmored" },
        { profession: "Hermit",       item: ["Spell book (1 random cantrip)"],       weapon: "Staff (1d4)",                 armor: "Unarmored" },
        { profession: "Kennel Master",item: ["A dog"],                               weapon: "Staff (1d4)",                 armor: "Unarmored" },
        { profession: "Leatherworker",item: ["A bearskin"],                          weapon: "Awl (1d4)",                   armor: "Unarmored" },
        { profession: "Limner",       item: ["Lantern", "2 x Oil flasks", "Paint"],  weapon: "Staff (1d4)",                 armor: "Unarmored" },
        { profession: "Sailor",       item: ["Bottle of rum", "50' Rope"],           weapon: "Belaying pin (1d4)",          armor: "Unarmored" },
        { profession: "Teamster",     item: ["50' Rope"],                            weapon: "Whip (1d2, hits entangle)",   armor: "Unarmored" },
        { profession: "Trapper",      item: ["Bear trap"],                           weapon: "Club (1d4)",                  armor: "Unarmored" }
    ],
    4: [
        { profession: "Armourer",      item: [],                                      weapon: "War hammer (1d6)",            armor: "Chain Mail" },
        { profession: "Barber Surgeon",item: ["Bottle of strong spirits"],            weapon: "Razor (1d4)",                 armor: "Unarmored" },
        { profession: "Blacksmith",    item: ["Tongs", "Apron"],                      weapon: "War hammer (1d6)",            armor: "Unarmored" },
        { profession: "Carpenter",     item: ["Saw"],                                 weapon: "Hand axe (1d6)",              armor: "Unarmored" },
        { profession: "Farmer",        item: ["A pig"],                               weapon: "Pitchfork (1d6)",             armor: "Unarmored" },
        { profession: "Forester",      item: ["Tent"],                                weapon: "Shortbow (1d6) + 10 arrows",  armor: "Unarmored" },
        { profession: "Hunter",        item: ["Whistle"],                             weapon: "Longbow (1d6) + 10 arrows",   armor: "Unarmored" },
        { profession: "Mason",         item: ["A bag of rocks"],                      weapon: "Rock (1d4)",                  armor: "Unarmored" },
        { profession: "Miner",         item: ["Lantern", "2 x Oil flasks"],           weapon: "Pick axe (1d6)",              armor: "Unarmored" },
        { profession: "Shipwright",    item: ["Pot of tar"],                          weapon: "Hand axe (1d6)",              armor: "Unarmored" },
        { profession: "Squire",        item: ["Pole (10' long, wooden)", "Flag"],     weapon: "Shortsword (1d6)",            armor: "Unarmored" },
        { profession: "Weaponsmith",   item: ["Tongs", "Apron"],                      weapon: "Sword (1d8)",                 armor: "Unarmored" }
    ]
};

export function getRandomBackground(hitPoints) {
    const hpForOccupation = Math.min(Math.max(hitPoints, 1), 4);
    const table = backgroundTables[hpForOccupation];
    if (!table) {
        console.warn(`No background table found for HP: ${hpForOccupation}`);
        return { profession: 'Unknown', item: ['None'], weapon: 'Club (1d4)', armor: 'Unarmored' };
    }
    return table[Math.floor(Math.random() * 12)];
}

export function getBackgroundByIndex(hitPoints, index) {
    const hpForOccupation = Math.min(Math.max(hitPoints, 1), 4);
    const table = backgroundTables[hpForOccupation];
    if (!table || index < 0 || index >= table.length) {
        return { profession: 'Unknown', item: ['None'], weapon: 'Club (1d4)', armor: 'Unarmored' };
    }
    return table[index];
}

export function getBackgroundTable(hitPoints) {
    return backgroundTables[Math.min(Math.max(hitPoints, 1), 4)] || [];
}

export function getAllBackgroundTables() {
    return backgroundTables;
}

export function getBackgroundByProfession(profession) {
    for (const hp of [1, 2, 3, 4]) {
        const found = backgroundTables[hp].find(bg => bg.profession === profession);
        if (found) return found;
    }
    return null;
}

export function getDemihumanLimits() {
    return Object.fromEntries(
        ['Dwarf', 'Elf', 'Halfling', 'Gnome'].map(c => [c, CLASS_INFO[c].maxLevel])
    );
}

