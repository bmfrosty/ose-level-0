/**
 * gen-race-adjustments.js
 * Race ability adjustments and requirements for 0-Level and Advanced mode
 * ES6 Module - used by browser generators
 * 
 */

import { LEGACY_RACE_NAMES, normalizeRaceName } from './shared-race-names.js';
import { calculateModifier as getModifier } from './shared-ability-scores.js';

// ============================================================================
// RACE DATA
// ============================================================================

// Race ability adjustments (Advanced mode only)
export const RACE_ADJUSTMENTS = {
    "Human_RACE": { STR: 0, DEX: 0, CON: 1, INT: 0, WIS: 0, CHA: 1 },
    "Dwarf_RACE": { STR: 0, DEX: 0, CON: 1, INT: 0, WIS: 0, CHA: -1 },
    "Elf_RACE": { STR: 0, DEX: 1, CON: -1, INT: 0, WIS: 0, CHA: 0 },
    "Gnome_RACE": { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
    "Halfling_RACE": { STR: -1, DEX: 1, CON: 0, INT: 0, WIS: 0, CHA: 0 }
};

// Race minimum ability requirements (Advanced mode only)
export const RACE_MINIMUMS = {
    "Human_RACE": {},
    "Dwarf_RACE": { CON: 9 },
    "Elf_RACE": { INT: 9 },
    "Gnome_RACE": { CON: 9, INT: 9 },
    "Halfling_RACE": { CON: 9, DEX: 9 }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get ability adjustments for a race (Advanced mode only)
 * @param {string} race - Race name (with or without _RACE suffix)
 * @returns {Object} Adjustments object (e.g., {STR: 0, DEX: 0, CON: 1, ...})
 */
export function getRaceAdjustments(race) {
    const normalizedRace = normalizeRaceName(race);
    return RACE_ADJUSTMENTS[normalizedRace] || { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 };
}

/**
 * Get minimum requirements for a race (Advanced mode only)
 * @param {string} race - Race name (with or without _RACE suffix)
 * @returns {Object} Minimums object (e.g., {CON: 9})
 */
export function getRaceMinimums(race) {
    const normalizedRace = normalizeRaceName(race);
    return RACE_MINIMUMS[normalizedRace] || {};
}

/**
 * Apply race adjustments to ability score results array (0-level format)
 * @param {Array} results - Array of {ability, roll, modifier} objects
 * @param {string} race - Race name (with or without _RACE suffix)
 * @param {boolean} isAdvanced - Whether Advanced mode is enabled
 * @param {boolean} humanRacialAbilities - Whether Human racial abilities are enabled
 * @returns {Array} Adjusted results array
 */
export function applyRaceAdjustments(results, race, isAdvanced, humanRacialAbilities) {
    if (!isAdvanced) {
        return results; // No adjustments in classic mode
    }

    const normalizedRace = normalizeRaceName(race);

    // If race is Human and humanRacialAbilities is false, don't apply adjustments
    if (normalizedRace === "Human_RACE" && humanRacialAbilities === false) {
        return results;
    }

    const adjustments = getRaceAdjustments(normalizedRace);
    const adjustedResults = results.map(result => {
        const adjustment = adjustments[result.ability] || 0;
        const adjustedRoll = result.roll + adjustment;
        const adjustedModifier = getModifier(adjustedRoll);

        return {
            ability: result.ability,
            roll: adjustedRoll,
            modifier: adjustedModifier,
            originalRoll: result.roll,
            adjustment: adjustment
        };
    });

    return adjustedResults;
}

/**
 * Check if character meets race minimums (Advanced mode only)
 * @param {Array} results - Array of {ability, roll} objects
 * @param {string} race - Race name (with or without _RACE suffix)
 * @param {boolean} isAdvanced - Whether Advanced mode is enabled
 * @returns {boolean} True if all minimums are met
 */
export function meetsRaceMinimums(results, race, isAdvanced) {
    if (!isAdvanced) {
        return true; // No requirements in classic mode
    }

    const normalizedRace = normalizeRaceName(race);
    const minimums = getRaceMinimums(normalizedRace);

    for (const [ability, minimum] of Object.entries(minimums)) {
        const abilityScore = results.find(r => r.ability === ability);
        if (abilityScore && abilityScore.roll < minimum) {
            return false;
        }
    }

    return true;
}
