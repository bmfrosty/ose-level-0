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
    const allAbilities = ClassDataShared.getAbilitiesAtLevel(baseClassName, level);
    if (allAbilities && allAbilities.length > 0) {
        features.classAbilities = allAbilities.map(a =>
            (a.languages && a.description === undefined)
                ? { ...a, description: a.languages.join(', ') }
                : a
        );
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
export function getRaceAbilitiesAtLevel(race, level, mode = 'advanced', humanRacialAbilities = false) {
    const normalizedRace = normalizeRaceName(race);
    const raceData = RACE_INFO[normalizedRace];
    if (!raceData || !raceData.abilities) return [];

    const atKey   = mode === 'basic' ? 'basicAvailableAt'      : 'advancedAvailableAt';
    const throKey = mode === 'basic' ? 'basicAvailableThrough' : 'advancedAvailableThrough';

    return raceData.abilities.filter(a => {
        if (a.applyOnly) return false;
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

    let needsSourceFootnote = false;
    const formatted = abilities.map(a => {
        if (a.languages) {
            return `${a.name}: ${a.languages.join(', ')}`;
        }
        if (a.hideDescription && !showDescriptionAnyway) {
            needsSourceFootnote = true;
            return `${a.name}*`;
        }
        if (a.includeName) {
            return `${a.name}: ${a.description}`;
        }
        return a.description;
    });
    if (needsSourceFootnote) {
        formatted.push('\x00footnote:* See OSE Advanced Fantasy Player\'s Tome for details');
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
 * @param {boolean} isSmoothprog - Whether Smoothified progression mode is enabled
 * @returns {Object} Object with Death, Wands, Paralysis, Breath, Spells
 */
export function calculateSavingThrows(level, race, conScore, isAdvanced, isSmoothprog) {
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
export const PROG_CODE = { ose:'O', smoothprog:'S', ll:'L' };

/**
 * Return a human-readable label for a progression mode.
 * Accepts either a mode key ('ose', 'smooth', 'll') or a compact code ('O', 'S', 'L').
 */
export function progModeLabel(mode) {
    if (mode === 'ose'    || mode === 'O') return 'OSE Standard';
    if (mode === 'smoothprog' || mode === 'S') return 'Smoothified';
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
    smoothprog: {
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

// ── Equipment purchasing ───────────────────────────────────────────────────────

export const DUNGEONEERING_BUNDLE = [
    { name: "Backpack",                   cost: 5 },
    { name: "Tinder box (flint & steel)", cost: 3 },
    { name: "Torches (6)",                cost: 1 },
    { name: "Rope (50')",                 cost: 1 },
    { name: "Waterskin",                  cost: 1 },
    { name: "Crowbar",                    cost: 10 },
];

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

export const ARMOR_PRIORITY = ["Plate mail", "Chain mail", "Leather"];

/**
 * Purchase starting equipment for a character.
 * @param {string} className   - Full class name e.g. 'Fighter_CLASS'
 * @param {number} startingGold - Starting gold (generation input, not goldRemaining)
 * @param {number} dexModifier  - DEX modifier (displayed score, post-racial)
 * @param {Object} background   - Background entry { weapon, armor, item }
 * @param {string} progression  - Progression mode key ('ose'|'smooth'|'ll') — reserved
 * @returns {{ weapons, armor, shield, items, startingAC, goldRemaining }}
 */
export function purchaseEquipment(className, startingGold, dexModifier, background, progression) {
    let gold = startingGold;
    const result = {
        weapons: [], armor: null, shield: false,
        items: [], startingAC: 10 + dexModifier, goldRemaining: 0
    };

    if (background?.weapon) result.items.push(`${background.weapon} (background)`);
    if (background?.armor)  result.items.push(`${background.armor} (background)`);
    const bgItems = Array.isArray(background?.item) ? background.item : (background?.item ? [background.item] : []);
    bgItems.forEach(i => { if (i) result.items.push(i); });

    const baseClass = className.replace(/_CLASS$/, '');
    const classInfo = CLASS_INFO[baseClass];
    if (!classInfo) { result.goldRemaining = gold; return result; }

    const allowedWeapons = new Set(classInfo.weapons || []);
    const allowedArmors  = (classInfo.armor || []).filter(a => a !== "Shield");
    const allowsShield   = (classInfo.armor || []).includes("Shield");

    if (background?.weapon && allowedWeapons.has(background.weapon)) {
        result.weapons.push(background.weapon);
    } else {
        for (const wName of (WEAPON_PRIORITY[baseClass] || [])) {
            if (allowedWeapons.has(wName) && WEAPONS[wName] && WEAPONS[wName].cost <= gold) {
                result.weapons.push(wName); gold -= WEAPONS[wName].cost; result.items.push(wName); break;
            }
        }
    }

    for (const aName of ARMOR_PRIORITY) {
        if (allowedArmors.includes(aName) && ARMOR[aName] && ARMOR[aName].cost <= gold) {
            result.armor = aName; gold -= ARMOR[aName].cost; break;
        }
    }

    if (allowsShield && ARMOR["Shield"] && ARMOR["Shield"].cost <= gold) {
        result.shield = true; gold -= ARMOR["Shield"].cost;
    }

    for (const { name, cost } of (CLASS_SPECIFIC_GEAR[baseClass] || [])) {
        if (cost <= gold) { result.items.push(name); gold -= cost; }
    }

    for (const { name, cost } of DUNGEONEERING_BUNDLE) {
        if (cost <= gold) { result.items.push(name); gold -= cost; }
    }

    if (ARMOR["Helmet"] && ARMOR["Helmet"].cost <= gold) {
        result.items.push("Helmet"); gold -= ARMOR["Helmet"].cost;
    }

    const armorAC  = result.armor ? ARMOR[result.armor].ac.ascending : 10;
    result.startingAC    = armorAC + dexModifier + (result.shield ? 1 : 0);
    result.goldRemaining = gold;

    console.log('\n=== Equipment Purchases ===');
    console.log(`Starting gold: ${startingGold} gp`);
    if (result.weapons.length) console.log(`Weapons: ${result.weapons.join(', ')}`);
    if (result.armor)          console.log(`Armor: ${result.armor}`);
    if (result.shield)         console.log(`Shield: yes`);
    const purchasedItems = result.items.filter(i => !i.includes('(background)'));
    if (purchasedItems.length) console.log(`Items: ${purchasedItems.join(', ')}`);
    console.log(`AC: ${result.startingAC}  |  Gold remaining: ${result.goldRemaining} gp`);
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
        { profession: "Weaver",     item: ["Hand Loom", "Yarn"],                    weapon: "Scissors (1d3)",              armor: "Unarmored" }
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
        { profession: "Trapper",      item: ["Bear trap (1d6)"],                     weapon: "Club (1d4)",                  armor: "Unarmored" }
    ],
    4: [
        { profession: "Armourer",      item: ["Chain mail"],                          weapon: "War hammer (1d6)",            armor: "Chain Mail" },
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

