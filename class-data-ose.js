/**
 * OSE Standard Class Progression Data
 * 
 * This module contains all level-dependent progression data for the 4 core OSE Standard classes:
 * Fighter, Thief, Magic-User, and Cleric.
 * 
 * Data includes:
 * - XP requirements (levels 1-14)
 * - Hit Dice progressions (levels 1-14)
 * - Attack bonuses (ascending, levels 1-14)
 * - Saving throws (5 categories, levels 1-14)
 * - Spell slots (for Cleric and Magic-User)
 * - Thief skills (7 skills, levels 1-14)
 * - Turn Undead table (for Cleric)
 */

import { 
  CLASS_INFO,
  XP_REQUIREMENTS,
  HIT_DICE_PROGRESSIONS,
  HIT_DICE_SCALE,
  ARCANE_SPELL_SLOTS,
  DIVINE_SPELL_SLOTS,
  THIEF_SKILLS,
  TURN_UNDEAD,
  SPELL_SLOT_SCALE
} from './class-data-shared.js';

// XP_REQUIREMENTS and HIT_DICE_SCALE are now imported from shared data

// ============================================================================
// ATTACK BONUS PROGRESSIONS (Ascending)
// ============================================================================
// OSE uses THAC0 (descending), but we convert to ascending attack bonus:
// THAC0 19 = +0, THAC0 17 = +2, THAC0 14 = +5, THAC0 12 = +7, THAC0 10 = +9
//
// There are 3 distinct progression scales in OSE:
// - FIGHTER_PROGRESSION: Fast progression (Fighter, Dwarf, Elf, Halfling, Spellblade)
// - CLERIC_PROGRESSION: Medium progression (Cleric, Thief)
// - MAGIC_USER_PROGRESSION: Slow progression (Magic-User, Gnome)

export const ATTACK_BONUS_PROGRESSIONS = {
  // Fighter progression: +2 at 4th, +5 at 7th, +7 at 10th, +9 at 13th
  FIGHTER: [0, 0, 0, 2, 2, 2, 5, 5, 5, 7, 7, 7, 9, 9],
  // Cleric/Thief progression: +2 at 5th, +5 at 9th, +7 at 13th
  CLERIC: [0, 0, 0, 0, 2, 2, 2, 2, 5, 5, 5, 5, 7, 7],
  // Magic-User progression: +2 at 6th, +5 at 11th
  MAGIC_USER: [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 5, 5, 5, 5]
};

// Map each class to its attack bonus progression
export const ATTACK_BONUS_SCALE = {
  "Fighter_CLASS": "FIGHTER",
  "Thief_CLASS": "CLERIC",
  "Magic-User_CLASS": "MAGIC_USER",
  "Cleric_CLASS": "CLERIC",
  "Dwarf_CLASS": "FIGHTER",
  "Elf_CLASS": "FIGHTER",  // Extended to level 14
  "Halfling_CLASS": "FIGHTER",
  "Gnome_CLASS": "MAGIC_USER",
  "Spellblade_CLASS": "FIGHTER"  // Extended to level 14
};

// ============================================================================
// SAVING THROWS (5 Categories, Levels 1-14)
// ============================================================================
// Categories: Death/Poison, Wands, Paralysis/Petrify, Breath Attacks, Spells/Rods/Staves

export const SAVING_THROWS = {
  "Fighter_CLASS": {
    death: [12, 12, 12, 10, 10, 10, 8, 8, 8, 6, 6, 6, 4, 4],
    wands: [13, 13, 13, 11, 11, 11, 9, 9, 9, 7, 7, 7, 5, 5],
    paralysis: [14, 14, 14, 12, 12, 12, 10, 10, 10, 8, 8, 8, 6, 6],
    breath: [15, 15, 15, 13, 13, 13, 10, 10, 10, 8, 8, 8, 5, 5],
    spells: [16, 16, 16, 14, 14, 14, 12, 12, 12, 10, 10, 10, 8, 8]
  },
  "Thief_CLASS": {
    death: [13, 13, 13, 13, 12, 12, 12, 12, 10, 10, 10, 10, 8, 8],
    wands: [14, 14, 14, 14, 13, 13, 13, 13, 11, 11, 11, 11, 9, 9],
    paralysis: [13, 13, 13, 13, 11, 11, 11, 11, 9, 9, 9, 9, 7, 7],
    breath: [16, 16, 16, 16, 14, 14, 14, 14, 12, 12, 12, 12, 10, 10],
    spells: [15, 15, 15, 15, 13, 13, 13, 13, 10, 10, 10, 10, 8, 8]
  },
  "Magic-User_CLASS": {
    death: [13, 13, 13, 13, 13, 11, 11, 11, 11, 11, 8, 8, 8, 8],
    wands: [14, 14, 14, 14, 14, 12, 12, 12, 12, 12, 9, 9, 9, 9],
    paralysis: [13, 13, 13, 13, 13, 11, 11, 11, 11, 11, 8, 8, 8, 8],
    breath: [16, 16, 16, 16, 16, 14, 14, 14, 14, 14, 11, 11, 11, 11],
    spells: [15, 15, 15, 15, 15, 12, 12, 12, 12, 12, 8, 8, 8, 8]
  },
  "Cleric_CLASS": {
    death: [11, 11, 11, 11, 9, 9, 9, 9, 6, 6, 6, 6, 3, 3],
    wands: [12, 12, 12, 12, 10, 10, 10, 10, 7, 7, 7, 7, 5, 5],
    paralysis: [14, 14, 14, 14, 12, 12, 12, 12, 9, 9, 9, 9, 7, 7],
    breath: [16, 16, 16, 16, 14, 14, 14, 14, 11, 11, 11, 11, 8, 8],
    spells: [15, 15, 15, 15, 12, 12, 12, 12, 9, 9, 9, 9, 7, 7]
  },
  "Dwarf_CLASS": {
    death: [8, 8, 8, 6, 6, 6, 4, 4, 4, 2, 2, 2, 2, 2],
    wands: [9, 9, 9, 7, 7, 7, 5, 5, 5, 3, 3, 3, 3, 3],
    paralysis: [10, 10, 10, 8, 8, 8, 6, 6, 6, 4, 4, 4, 4, 4],
    breath: [13, 13, 13, 10, 10, 10, 7, 7, 7, 4, 4, 4, 4, 4],
    spells: [12, 12, 12, 10, 10, 10, 8, 8, 8, 6, 6, 6, 6, 6]
  },
  "Elf_CLASS": {
    death: [12, 12, 12, 10, 10, 10, 8, 8, 8, 6, 6, 6, 4, 4],
    wands: [13, 13, 13, 11, 11, 11, 9, 9, 9, 7, 7, 7, 5, 5],
    paralysis: [13, 13, 13, 11, 11, 11, 9, 9, 9, 8, 8, 8, 6, 6],
    breath: [15, 15, 15, 13, 13, 13, 10, 10, 10, 8, 8, 8, 6, 6],
    spells: [15, 15, 15, 12, 12, 12, 10, 10, 10, 8, 8, 8, 6, 6]
  },
  "Halfling_CLASS": {
    death: [8, 8, 8, 6, 6, 6, 4, 4, 4, 4, 4, 4, 4, 4],
    wands: [9, 9, 9, 7, 7, 7, 5, 5, 5, 5, 5, 5, 5, 5],
    paralysis: [10, 10, 10, 8, 8, 8, 6, 6, 6, 6, 6, 6, 6, 6],
    breath: [13, 13, 13, 10, 10, 10, 7, 7, 7, 7, 7, 7, 7, 7],
    spells: [12, 12, 12, 10, 10, 10, 8, 8, 8, 8, 8, 8, 8, 8]
  },
  "Gnome_CLASS": {
    death: [8, 8, 8, 8, 8, 6, 6, 6, 6, 6, 6, 6, 6, 6],
    wands: [9, 9, 9, 9, 9, 7, 7, 7, 7, 7, 7, 7, 7, 7],
    paralysis: [10, 10, 10, 10, 10, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    breath: [14, 14, 14, 14, 14, 11, 11, 11, 11, 11, 11, 11, 11, 11],
    spells: [11, 11, 11, 11, 11, 9, 9, 9, 9, 9, 9, 9, 9, 9]
  },
  "Spellblade_CLASS": {
    death: [12, 12, 12, 10, 10, 10, 8, 8, 8, 6, 6, 6, 4, 4],
    wands: [13, 13, 13, 11, 11, 11, 9, 9, 9, 7, 7, 7, 5, 5],
    paralysis: [13, 13, 13, 11, 11, 11, 9, 9, 9, 8, 8, 8, 6, 6],
    breath: [15, 15, 15, 13, 13, 13, 10, 10, 10, 8, 8, 8, 6, 6],
    spells: [15, 15, 15, 12, 12, 12, 10, 10, 10, 8, 8, 8, 6, 6]
  }
};

// SPELL_SLOT_SCALE, THIEF_SKILLS, and TURN_UNDEAD are all imported from shared data

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get XP required for a specific class and level
 * @param {string} className - The class name
 * @param {number} level - The character level (1-14 for humans, varies for demihumans)
 * @returns {number|null} XP required, or null if invalid
 */
export function getXPRequired(className, level) {
  const xpArray = XP_REQUIREMENTS[className];
  if (!xpArray) return null;
  if (level < 1 || level > xpArray.length) return null;
  return xpArray[level - 1];
}

/**
 * Get Hit Dice for a specific class and level
 * @param {string} className - The class name
 * @param {number} level - The character level (varies by class)
 * @returns {string|null} Hit dice string (e.g., "3d8", "9d8+2*"), or null if invalid
 */
export function getHitDice(className, level) {
  const scale = HIT_DICE_SCALE[className];
  if (!scale) return null;
  
  const progression = HIT_DICE_PROGRESSIONS[scale];
  if (!progression) return null;
  
  if (level < 1 || level > progression.length) return null;
  return progression[level - 1];
}

/**
 * Get attack bonus for a specific class and level
 * @param {string} className - The class name
 * @param {number} level - The character level (varies by class)
 * @returns {number|null} Attack bonus (ascending), or null if invalid
 */
export function getAttackBonus(className, level) {
  const scale = ATTACK_BONUS_SCALE[className];
  if (!scale) return null;
  
  const progression = ATTACK_BONUS_PROGRESSIONS[scale];
  if (!progression) return null;
  
  // Get max level for this class
  const xpArray = XP_REQUIREMENTS[className];
  const maxLevel = xpArray ? xpArray.length : 14;
  
  if (level < 1 || level > maxLevel) return null;
  return progression[level - 1];
}

/**
 * Get all saving throws for a specific class and level
 * @param {string} className - The class name
 * @param {number} level - The character level (varies by class)
 * @returns {object|null} Object with death, wands, paralysis, breath, spells properties, or null if invalid
 */
export function getSavingThrows(className, level) {
  const savesObj = SAVING_THROWS[className];
  if (!savesObj) return null;
  if (level < 1 || level > savesObj.death.length) return null;
  
  return {
    death: savesObj.death[level - 1],
    wands: savesObj.wands[level - 1],
    paralysis: savesObj.paralysis[level - 1],
    breath: savesObj.breath[level - 1],
    spells: savesObj.spells[level - 1]
  };
}

/**
 * Get spell slots for a specific class and level
 * @param {string} className - The class name (Cleric, Magic-User, Elf, Gnome, Spellblade)
 * @param {number} level - The character level (varies by class)
 * @returns {object|null} Object with spell level keys, or null if invalid
 */
export function getSpellSlots(className, level) {
  // Determine which spell progression to use
  const spellType = SPELL_SLOT_SCALE[className];
  if (!spellType) return null;
  
  const baseSlots = spellType === "DIVINE" ? DIVINE_SPELL_SLOTS : ARCANE_SPELL_SLOTS;
  
  // Handle special cases
  if (className === "Gnome_CLASS") {
    // Gnome uses 4 spell levels (illusionist)
    if (level < 1 || level > 14) return null;
    const result = {};
    for (let i = 1; i <= 4; i++) {
      result[i] = baseSlots[i][level - 1];
    }
    return result;
  }
  
  if (className === "Spellblade_CLASS") {
    // Spellblade max level 10, uses 5 spell levels
    if (level < 1 || level > 10) return null;
    const result = {};
    for (let i = 1; i <= 5; i++) {
      result[i] = baseSlots[i][level - 1];
    }
    return result;
  }
  
  // Standard progression
  if (level < 1 || level > 14) return null;
  const result = {};
  for (const [spellLevel, slots] of Object.entries(baseSlots)) {
    result[spellLevel] = slots[level - 1];
  }
  return result;
}

/**
 * Get thief skills for a specific level
 * @param {number} level - The character level (1-14)
 * @returns {object|null} Object with all thief skill values, or null if invalid
 */
export function getThiefSkills(level) {
  if (level < 1 || level > 14) return null;
  
  return {
    climbSheerSurfaces: THIEF_SKILLS.climbSheerSurfaces[level - 1],
    findRemoveTraps: THIEF_SKILLS.findRemoveTraps[level - 1],
    hearNoise: THIEF_SKILLS.hearNoise[level - 1],
    hideInShadows: THIEF_SKILLS.hideInShadows[level - 1],
    moveSilently: THIEF_SKILLS.moveSilently[level - 1],
    openLocks: THIEF_SKILLS.openLocks[level - 1],
    pickPockets: THIEF_SKILLS.pickPockets[level - 1]
  };
}

/**
 * Get turn undead result for a specific cleric level and undead type
 * @param {number} level - The cleric level (1-14, levels 11+ use same table)
 * @param {string} undeadType - The undead type (1HD, 2HD, 2*HD, 3HD, 4HD, 5HD, 6HD, 7-9HD)
 * @returns {number|string|null} Number needed on 2d6, "T" for automatic turn, "D" for automatic destroy, null if cannot turn
 */
export function getTurnUndead(level, undeadType) {
  if (level < 1 || level > 14) return null;
  
  // Levels 11+ use the same table
  const tableLevel = level >= 11 ? 11 : level;
  const turnTable = TURN_UNDEAD[tableLevel];
  
  if (!turnTable) return null;
  return turnTable[undeadType] !== undefined ? turnTable[undeadType] : null;
}

/**
 * Get the current level for a given class and XP total
 * @param {string} className - The class name
 * @param {number} xp - The total XP
 * @returns {number} The current level (varies by class max level)
 */
export function getLevelFromXP(className, xp) {
  const xpArray = XP_REQUIREMENTS[className];
  if (!xpArray) return 1;
  
  for (let i = xpArray.length - 1; i >= 0; i--) {
    if (xp >= xpArray[i]) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Get XP needed to reach the next level
 * @param {string} className - The class name
 * @param {number} currentXP - The current XP total
 * @returns {number|null} XP needed for next level, or null if at max level
 */
export function getXPToNextLevel(className, currentXP) {
  const xpArray = XP_REQUIREMENTS[className];
  if (!xpArray) return null;
  
  const currentLevel = getLevelFromXP(className, currentXP);
  const maxLevel = xpArray.length;
  
  if (currentLevel >= maxLevel) return null; // Max level
  
  const nextLevelXP = getXPRequired(className, currentLevel + 1);
  return nextLevelXP - currentXP;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  XP_REQUIREMENTS,        // Re-exported from shared
  HIT_DICE_PROGRESSIONS,  // Re-exported from shared
  HIT_DICE_SCALE,         // Re-exported from shared
  ATTACK_BONUS_PROGRESSIONS,
  ATTACK_BONUS_SCALE,
  SAVING_THROWS,
  SPELL_SLOT_SCALE,       // Re-exported from shared
  THIEF_SKILLS,           // Re-exported from shared
  TURN_UNDEAD,            // Re-exported from shared
  getXPRequired,
  getHitDice,
  getAttackBonus,
  getSavingThrows,
  getSpellSlots,
  getThiefSkills,
  getTurnUndead,
  getLevelFromXP,
  getXPToNextLevel
};
