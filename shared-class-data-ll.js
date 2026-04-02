/**
 * Labyrinth Lord Class Progression Data
 * 
 * This module contains Labyrinth Lord-specific to-hit bonuses and saving throws
 * for the 3 core classes: Fighter, Cleric, and Magic-User.
 * 
 * Note: This data is for to-hit and saving throws only. HP progression and titles
 * are not used from this data - they come from the standard OSE/Gygar data.
 * 
 * Data includes:
 * - Attack bonuses (ascending, levels 1-14)
 * - Saving throws (5 categories, levels 1-14)
 */

// ============================================================================
// ATTACK BONUS PROGRESSIONS (Ascending, Labyrinth Lord)
// ============================================================================
// Labyrinth Lord uses different to-hit progressions than OSE
//
// From the Labyrinth Lord data provided:
// Fighter: 0, 0, +1, +2, +3, +4, +5, +5, +6, +7, +7, +8, +9, +10 (levels 1-14)
// Cleric: 0, 0, 0, +1, +1, +2, +2, +2, +3, +3, +4, +5, +6, +6 (levels 1-14)
// Magic-User: 0, 0, 0, +1, +1, +1, +1, +2, +2, +2, +3, +3, +4, +5 (levels 1-14)

export const ATTACK_BONUS_PROGRESSIONS = {
  FIGHTER: [0, 0, 1, 2, 3, 4, 5, 5, 6, 7, 7, 8, 9, 10],
  CLERIC: [0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 4, 5, 6, 6],
  MAGIC_USER: [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4, 5]
};

// Map each class to its attack bonus progression
export const ATTACK_BONUS_SCALE = {
  "Fighter_CLASS": "FIGHTER",
  "Thief_CLASS": "CLERIC",  // Thief uses Cleric progression in LL
  "Magic-User_CLASS": "MAGIC_USER",
  "Cleric_CLASS": "CLERIC",
  "Spellblade_CLASS": "FIGHTER",
  "Dwarf_CLASS": "FIGHTER",
  "Elf_CLASS": "FIGHTER",
  "Halfling_CLASS": "FIGHTER",
  "Gnome_CLASS": "MAGIC_USER"
};

// ============================================================================
// SAVING THROWS (5 Categories, Levels 1-14, Labyrinth Lord)
// ============================================================================
// Categories: Death/Poison, Wands, Paralysis/Petrify, Breath Attacks, Spells/Rods/Staves
//
// NOTE: All saving throws have been verified to match Labyrinth Lord data.
// Fighter, Magic-User, Thief, Cleric, Dwarf, Elf, Halfling, Gnome, and Spellblade
// all use the same saving throws as OSE.

export const SAVING_THROWS = {
  "Fighter_CLASS": {
    death: [12, 12, 12, 10, 10, 10, 8, 8, 8, 6, 6, 6, 4, 4],
    wands: [13, 13, 13, 11, 11, 11, 9, 9, 9, 7, 7, 7, 5, 5],
    paralysis: [14, 14, 14, 12, 12, 12, 10, 10, 10, 8, 8, 8, 6, 6],
    breath: [15, 15, 15, 13, 13, 13, 9, 9, 9, 7, 7, 7, 5, 5],
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
    death: [13, 13, 13, 13, 13, 11, 11, 11, 11, 11, 9, 9, 9, 9],
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
  "Spellblade_CLASS": {
    death: [12, 12, 12, 10, 10, 10, 8, 8, 8, 6, 6, 6, 4, 4],
    wands: [13, 13, 13, 11, 11, 11, 9, 9, 9, 7, 7, 7, 5, 5],
    paralysis: [13, 13, 13, 11, 11, 11, 9, 9, 9, 8, 8, 8, 6, 6],
    breath: [15, 15, 15, 13, 13, 13, 10, 10, 10, 8, 8, 8, 6, 6],
    spells: [15, 15, 15, 12, 12, 12, 10, 10, 10, 8, 8, 8, 6, 6]
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
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get attack bonus for a specific class and level (Labyrinth Lord)
 * @param {string} className - The class name
 * @param {number} level - The character level (1-14)
 * @returns {number|null} Attack bonus (ascending), or null if invalid
 */
export function getAttackBonus(className, level) {
  const scale = ATTACK_BONUS_SCALE[className];
  if (!scale) return null;
  
  const progression = ATTACK_BONUS_PROGRESSIONS[scale];
  if (!progression) return null;
  
  if (level < 1 || level > 14) return null;
  return progression[level - 1];
}

/**
 * Get all saving throws for a specific class and level (Labyrinth Lord)
 * @param {string} className - The class name
 * @param {number} level - The character level (1-14)
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

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  ATTACK_BONUS_PROGRESSIONS,
  ATTACK_BONUS_SCALE,
  SAVING_THROWS,
  getAttackBonus,
  getSavingThrows
};
