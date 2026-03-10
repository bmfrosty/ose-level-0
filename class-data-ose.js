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

import { CLASS_INFO } from './class-data-shared.js';

// ============================================================================
// XP REQUIREMENTS BY CLASS (Levels 1-14)
// ============================================================================

export const XP_REQUIREMENTS = {
  Fighter: [0, 2000, 4000, 8000, 16000, 32000, 64000, 120000, 240000, 360000, 480000, 600000, 720000, 840000],
  Thief: [0, 1200, 2400, 4800, 9600, 20000, 40000, 80000, 160000, 280000, 400000, 520000, 640000, 760000],
  "Magic-User": [0, 2500, 5000, 10000, 20000, 40000, 80000, 150000, 300000, 450000, 600000, 750000, 900000, 1050000],
  Cleric: [0, 1500, 3000, 6000, 12000, 25000, 50000, 100000, 200000, 300000, 400000, 500000, 600000, 700000],
  Dwarf: [0, 2200, 4400, 8800, 17000, 35000, 70000, 140000, 270000, 400000, 530000, 660000],
  Elf: [0, 4000, 8000, 16000, 32000, 64000, 120000, 250000, 400000, 600000],
  Halfling: [0, 2000, 4000, 8000, 16000, 32000, 64000, 120000],
  Gnome: [0, 3000, 6000, 12000, 30000, 60000, 120000, 240000],
  Spellblade: [0, 4000, 8000, 16000, 32000, 64000, 120000, 250000, 400000, 600000]
};

// ============================================================================
// HIT DICE PROGRESSIONS (Levels 1-14)
// ============================================================================
// There are 4 distinct hit dice progressions in OSE:
// - D8_PROGRESSION: Fighter types (Fighter, Dwarf)
// - D6_PROGRESSION: Cleric types (Cleric, Elf, Halfling, Spellblade)
// - D4_PROGRESSION: Magic-User types (Magic-User, Thief, Gnome)
//
// After 9th level, CON modifiers no longer apply (marked with *)
// Different classes have different post-9th level HP gains

export const HIT_DICE_PROGRESSIONS = {
  // d8 progression: +2 HP per level after 9th (Fighter)
  D8_2: ["1d8", "2d8", "3d8", "4d8", "5d8", "6d8", "7d8", "8d8", "9d8", "9d8+2*", "9d8+4*", "9d8+6*", "9d8+8*", "9d8+10*"],
  // d8 progression: +3 HP per level after 9th (Dwarf)
  D8_3: ["1d8", "2d8", "3d8", "4d8", "5d8", "6d8", "7d8", "8d8", "9d8", "9d8+3*", "9d8+6*", "9d8+9*"],
  // d6 progression: +1 HP per level after 9th (Cleric, Halfling)
  D6_1: ["1d6", "2d6", "3d6", "4d6", "5d6", "6d6", "7d6", "8d6", "9d6", "9d6+1*", "9d6+2*", "9d6+3*", "9d6+4*", "9d6+5*"],
  // d6 progression: +2 HP at 10th level only (Elf, Spellblade)
  D6_2: ["1d6", "2d6", "3d6", "4d6", "5d6", "6d6", "7d6", "8d6", "9d6", "9d6+2*"],
  // d4 progression: +1 HP per level after 9th (Magic-User, Gnome)
  D4_1: ["1d4", "2d4", "3d4", "4d4", "5d4", "6d4", "7d4", "8d4", "9d4", "9d4+1*", "9d4+2*", "9d4+3*", "9d4+4*", "9d4+5*"],
  // d4 progression: +2 HP per level after 9th (Thief)
  D4_2: ["1d4", "2d4", "3d4", "4d4", "5d4", "6d4", "7d4", "8d4", "9d4", "9d4+2*", "9d4+4*", "9d4+6*", "9d4+8*", "9d4+10*"]
};

// Map each class to its hit dice progression
export const HIT_DICE_SCALE = {
  Fighter: "D8_2",
  Thief: "D4_2",
  "Magic-User": "D4_1",
  Cleric: "D6_1",
  Dwarf: "D8_3",
  Elf: "D6_2",
  Halfling: "D6_1",  // Uses D6_1 but stops at level 8
  Gnome: "D4_1",     // Uses D4_1 but stops at level 8
  Spellblade: "D6_2"
};

// Legacy export for backward compatibility - dynamically generated from progressions
export const HIT_DICE = {
  get Fighter() { return HIT_DICE_PROGRESSIONS.D8_2; },
  get Thief() { return HIT_DICE_PROGRESSIONS.D4_2; },
  get "Magic-User"() { return HIT_DICE_PROGRESSIONS.D4_1; },
  get Cleric() { return HIT_DICE_PROGRESSIONS.D6_1; },
  get Dwarf() { return HIT_DICE_PROGRESSIONS.D8_3; },
  get Elf() { return HIT_DICE_PROGRESSIONS.D6_2; },
  get Halfling() { return HIT_DICE_PROGRESSIONS.D6_1.slice(0, 8); },
  get Gnome() { return HIT_DICE_PROGRESSIONS.D4_1.slice(0, 8); },
  get Spellblade() { return HIT_DICE_PROGRESSIONS.D6_2; }
};

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
  Fighter: "FIGHTER",
  Thief: "CLERIC",
  "Magic-User": "MAGIC_USER",
  Cleric: "CLERIC",
  Dwarf: "FIGHTER",
  Elf: "FIGHTER",
  Halfling: "FIGHTER",
  Gnome: "MAGIC_USER",
  Spellblade: "FIGHTER"
};

// Legacy export for backward compatibility - dynamically generated from progressions
export const ATTACK_BONUS = {
  get Fighter() { return ATTACK_BONUS_PROGRESSIONS.FIGHTER; },
  get Thief() { return ATTACK_BONUS_PROGRESSIONS.CLERIC; },
  get "Magic-User"() { return ATTACK_BONUS_PROGRESSIONS.MAGIC_USER; },
  get Cleric() { return ATTACK_BONUS_PROGRESSIONS.CLERIC; },
  get Dwarf() { return ATTACK_BONUS_PROGRESSIONS.FIGHTER.slice(0, 12); },
  get Elf() { return ATTACK_BONUS_PROGRESSIONS.FIGHTER.slice(0, 10); },
  get Halfling() { return ATTACK_BONUS_PROGRESSIONS.FIGHTER.slice(0, 8); },
  get Gnome() { return ATTACK_BONUS_PROGRESSIONS.MAGIC_USER.slice(0, 8); },
  get Spellblade() { return ATTACK_BONUS_PROGRESSIONS.FIGHTER.slice(0, 10); }
};

// ============================================================================
// SAVING THROWS (5 Categories, Levels 1-14)
// ============================================================================
// Categories: Death/Poison, Wands, Paralysis/Petrify, Breath Attacks, Spells/Rods/Staves

export const SAVING_THROWS = {
  Fighter: {
    death: [12, 12, 12, 10, 10, 10, 8, 8, 8, 6, 6, 6, 4, 4],
    wands: [13, 13, 13, 11, 11, 11, 9, 9, 9, 7, 7, 7, 5, 5],
    paralysis: [14, 14, 14, 12, 12, 12, 10, 10, 10, 8, 8, 8, 6, 6],
    breath: [15, 15, 15, 13, 13, 13, 10, 10, 10, 8, 8, 8, 5, 5],
    spells: [16, 16, 16, 14, 14, 14, 12, 12, 12, 10, 10, 10, 8, 8]
  },
  Thief: {
    death: [13, 13, 13, 13, 12, 12, 12, 12, 10, 10, 10, 10, 8, 8],
    wands: [14, 14, 14, 14, 13, 13, 13, 13, 11, 11, 11, 11, 9, 9],
    paralysis: [13, 13, 13, 13, 11, 11, 11, 11, 9, 9, 9, 9, 7, 7],
    breath: [16, 16, 16, 16, 14, 14, 14, 14, 12, 12, 12, 12, 10, 10],
    spells: [15, 15, 15, 15, 13, 13, 13, 13, 10, 10, 10, 10, 8, 8]
  },
  "Magic-User": {
    death: [13, 13, 13, 13, 13, 11, 11, 11, 11, 11, 8, 8, 8, 8],
    wands: [14, 14, 14, 14, 14, 12, 12, 12, 12, 12, 9, 9, 9, 9],
    paralysis: [13, 13, 13, 13, 13, 11, 11, 11, 11, 11, 8, 8, 8, 8],
    breath: [16, 16, 16, 16, 16, 14, 14, 14, 14, 14, 11, 11, 11, 11],
    spells: [15, 15, 15, 15, 15, 12, 12, 12, 12, 12, 8, 8, 8, 8]
  },
  Cleric: {
    death: [11, 11, 11, 11, 9, 9, 9, 9, 6, 6, 6, 6, 3, 3],
    wands: [12, 12, 12, 12, 10, 10, 10, 10, 7, 7, 7, 7, 5, 5],
    paralysis: [14, 14, 14, 14, 12, 12, 12, 12, 9, 9, 9, 9, 7, 7],
    breath: [16, 16, 16, 16, 14, 14, 14, 14, 11, 11, 11, 11, 8, 8],
    spells: [15, 15, 15, 15, 12, 12, 12, 12, 9, 9, 9, 9, 7, 7]
  },
  Dwarf: {
    death: [8, 8, 8, 6, 6, 6, 4, 4, 4, 2, 2, 2],
    wands: [9, 9, 9, 7, 7, 7, 5, 5, 5, 3, 3, 3],
    paralysis: [10, 10, 10, 8, 8, 8, 6, 6, 6, 4, 4, 4],
    breath: [13, 13, 13, 10, 10, 10, 7, 7, 7, 4, 4, 4],
    spells: [12, 12, 12, 10, 10, 10, 8, 8, 8, 6, 6, 6]
  },
  Elf: {
    death: [12, 12, 12, 10, 10, 10, 8, 8, 8, 6],
    wands: [13, 13, 13, 11, 11, 11, 9, 9, 9, 7],
    paralysis: [13, 13, 13, 11, 11, 11, 9, 9, 9, 8],
    breath: [15, 15, 15, 13, 13, 13, 10, 10, 10, 8],
    spells: [15, 15, 15, 12, 12, 12, 10, 10, 10, 8]
  },
  Halfling: {
    death: [8, 8, 8, 6, 6, 6, 4, 4],
    wands: [9, 9, 9, 7, 7, 7, 5, 5],
    paralysis: [10, 10, 10, 8, 8, 8, 6, 6],
    breath: [13, 13, 13, 10, 10, 10, 7, 7],
    spells: [12, 12, 12, 10, 10, 10, 8, 8]
  },
  Gnome: {
    death: [8, 8, 8, 8, 8, 6, 6, 6],
    wands: [9, 9, 9, 9, 9, 7, 7, 7],
    paralysis: [10, 10, 10, 10, 10, 8, 8, 8],
    breath: [14, 14, 14, 14, 14, 11, 11, 11],
    spells: [11, 11, 11, 11, 11, 9, 9, 9]
  },
  Spellblade: {
    death: [12, 12, 12, 10, 10, 10, 8, 8, 8, 6],
    wands: [13, 13, 13, 11, 11, 11, 9, 9, 9, 7],
    paralysis: [13, 13, 13, 11, 11, 11, 9, 9, 9, 8],
    breath: [15, 15, 15, 13, 13, 13, 10, 10, 10, 8],
    spells: [15, 15, 15, 12, 12, 12, 10, 10, 10, 8]
  }
};

// ============================================================================
// SPELL SLOTS (Cleric and Magic-User)
// ============================================================================
// Each spell level is an array of 14 values (one per character level)
// 0 means no spells of that level available

export const SPELL_SLOTS = {
  Cleric: {
    1: [0, 1, 2, 2, 2, 2, 2, 3, 3, 4, 4, 5, 5, 6],
    2: [0, 0, 0, 1, 2, 2, 2, 3, 3, 4, 4, 5, 5, 5],
    3: [0, 0, 0, 0, 0, 1, 2, 2, 3, 3, 4, 4, 5, 5],
    4: [0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5],
    5: [0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4]
  },
  "Magic-User": {
    1: [1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4],
    2: [0, 0, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4],
    3: [0, 0, 0, 0, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4],
    4: [0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 3, 3, 3, 4],
    5: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 3, 3],
    6: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3]
  },
  Elf: {
    1: [1, 2, 2, 2, 2, 2, 3, 3, 3, 3],
    2: [0, 0, 1, 2, 2, 2, 2, 3, 3, 3],
    3: [0, 0, 0, 0, 1, 2, 2, 2, 3, 3],
    4: [0, 0, 0, 0, 0, 0, 1, 2, 2, 3],
    5: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2]
  },
  Gnome: {
    1: [1, 2, 2, 2, 2, 2, 3, 3],
    2: [0, 0, 1, 2, 2, 2, 2, 3],
    3: [0, 0, 0, 0, 1, 2, 2, 2],
    4: [0, 0, 0, 0, 0, 0, 1, 2]
  },
  Spellblade: {
    1: [1, 2, 2, 2, 2, 2, 3, 3, 3, 3],
    2: [0, 0, 1, 2, 2, 2, 2, 3, 3, 3],
    3: [0, 0, 0, 0, 1, 2, 2, 2, 3, 3],
    4: [0, 0, 0, 0, 0, 0, 1, 2, 2, 3],
    5: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2]
  }
};

// ============================================================================
// THIEF SKILLS (7 Skills, Levels 1-14)
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
// TURN UNDEAD TABLE (Cleric)
// ============================================================================
// Rows: Cleric levels 1-11+ (11 rows)
// Columns: Undead types by HD (1 HD, 2 HD, 2* HD, 3 HD, 4 HD, 5 HD, 6 HD, 7-9 HD)
// Values: Number needed on 2d6, "T" = automatic turn, "D" = automatic destroy, null = cannot turn

export const TURN_UNDEAD = {
  // Level 1
  1: { "1HD": 7, "2HD": 9, "2*HD": 11, "3HD": null, "4HD": null, "5HD": null, "6HD": null, "7-9HD": null },
  // Level 2
  2: { "1HD": "T", "2HD": 7, "2*HD": 9, "3HD": 11, "4HD": null, "5HD": null, "6HD": null, "7-9HD": null },
  // Level 3
  3: { "1HD": "T", "2HD": "T", "2*HD": 7, "3HD": 9, "4HD": 11, "5HD": null, "6HD": null, "7-9HD": null },
  // Level 4
  4: { "1HD": "D", "2HD": "T", "2*HD": "T", "3HD": 7, "4HD": 9, "5HD": 11, "6HD": null, "7-9HD": null },
  // Level 5
  5: { "1HD": "D", "2HD": "D", "2*HD": "T", "3HD": "T", "4HD": 7, "5HD": 9, "6HD": 11, "7-9HD": null },
  // Level 6
  6: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "T", "4HD": "T", "5HD": 7, "6HD": 9, "7-9HD": 11 },
  // Level 7
  7: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "D", "4HD": "T", "5HD": "T", "6HD": 7, "7-9HD": 9 },
  // Level 8
  8: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "D", "4HD": "D", "5HD": "T", "6HD": "T", "7-9HD": 7 },
  // Level 9
  9: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "D", "4HD": "D", "5HD": "D", "6HD": "T", "7-9HD": "T" },
  // Level 10
  10: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "D", "4HD": "D", "5HD": "D", "6HD": "D", "7-9HD": "T" },
  // Level 11+
  11: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "D", "4HD": "D", "5HD": "D", "6HD": "D", "7-9HD": "D" }
};

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
  const slotsObj = SPELL_SLOTS[className];
  if (!slotsObj) return null;
  
  // Check if level is valid for this class's spell progression
  const firstSpellLevel = Object.values(slotsObj)[0];
  if (level < 1 || level > firstSpellLevel.length) return null;
  
  const result = {};
  for (const [spellLevel, slots] of Object.entries(slotsObj)) {
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
  XP_REQUIREMENTS,
  HIT_DICE_PROGRESSIONS,
  HIT_DICE_SCALE,
  HIT_DICE,
  ATTACK_BONUS_PROGRESSIONS,
  ATTACK_BONUS_SCALE,
  ATTACK_BONUS,
  SAVING_THROWS,
  SPELL_SLOTS,
  THIEF_SKILLS,
  TURN_UNDEAD,
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
