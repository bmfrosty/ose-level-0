/**
 * advanced-utils.js
 * Utility functions for Advanced Mode character generation
 */

// Import shared ability score utilities
import {
    calculateModifier,
    formatModifier,
    calculateXPBonus,
    getPrimeRequisites,
    meetsToughCharactersRequirements,
    meetsPrimeRequisiteRequirements
} from './shared-ability-scores.js';

// Re-export shared functions for backward compatibility
export {
    calculateModifier,
    formatModifier,
    calculateXPBonus,
    getPrimeRequisites,
    meetsToughCharactersRequirements,
    meetsPrimeRequisiteRequirements
};

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
 * Get racial ability score adjustments
 * @param {string} race - Race name (with or without _RACE suffix)
 * @returns {Object} Adjustments object (e.g., {CON: 1, CHA: -1})
 */
export function getRacialAdjustments(race) {
    // Handle null/undefined race
    if (!race) {
        return { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 };
    }
    
    // Normalize race name
    const raceName = race.endsWith('_RACE') ? race : `${race}_RACE`;
    
    const adjustments = {
        'Human_RACE': { STR: 0, DEX: 0, CON: 1, INT: 0, WIS: 0, CHA: 1 },
        'Dwarf_RACE': { STR: 0, DEX: 0, CON: 1, INT: 0, WIS: 0, CHA: -1 },
        'Elf_RACE': { STR: 0, DEX: 1, CON: -1, INT: 0, WIS: 0, CHA: 0 },
        'Gnome_RACE': { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
        'Halfling_RACE': { STR: -1, DEX: 1, CON: 0, INT: 0, WIS: 0, CHA: 0 }
    };
    
    return adjustments[raceName] || { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 };
}

/**
 * Get racial minimum ability score requirements
 * @param {string} race - Race name (with or without _RACE suffix)
 * @returns {Object} Requirements object (e.g., {CON: 9})
 */
export function getRacialMinimums(race) {
    // Handle null/undefined race
    if (!race) {
        return {};
    }
    
    // Normalize race name
    const raceName = race.endsWith('_RACE') ? race : `${race}_RACE`;
    
    const minimums = {
        'Human_RACE': {},
        'Dwarf_RACE': { CON: 9 },
        'Elf_RACE': { INT: 9 },
        'Gnome_RACE': { CON: 9, INT: 9 },
        'Halfling_RACE': { CON: 9, DEX: 9 }
    };
    
    return minimums[raceName] || {};
}

/**
 * Apply racial adjustments to ability scores
 * @param {Object} baseScores - Base ability scores
 * @param {string} race - Race name
 * @returns {Object} Adjusted ability scores
 */
export function applyRacialAdjustments(baseScores, race) {
    const adjustments = getRacialAdjustments(race);
    const adjusted = {};
    
    for (const ability in baseScores) {
        let score = baseScores[ability] + (adjustments[ability] || 0);
        // Enforce limits: 3-18
        score = Math.max(3, Math.min(18, score));
        adjusted[ability] = score;
    }
    
    return adjusted;
}

/**
 * Check if ability scores meet racial minimums
 * @param {Object} scores - Ability scores (before racial adjustments)
 * @param {string} race - Race name
 * @returns {boolean} True if requirements met
 */
export function meetsRacialMinimums(scores, race) {
    const minimums = getRacialMinimums(race);
    
    for (const ability in minimums) {
        if (scores[ability] < minimums[ability]) {
            return false;
        }
    }
    
    return true;
}

/**
 * Read ability scores from input fields
 * @returns {Object} Ability scores object
 */
export function readAbilityScores() {
    return {
        STR: parseInt(document.getElementById('scoreSTR').value) || 3,
        INT: parseInt(document.getElementById('scoreINT').value) || 3,
        WIS: parseInt(document.getElementById('scoreWIS').value) || 3,
        DEX: parseInt(document.getElementById('scoreDEX').value) || 3,
        CON: parseInt(document.getElementById('scoreCON').value) || 3,
        CHA: parseInt(document.getElementById('scoreCHA').value) || 3
    };
}

/**
 * Get minimum scores for rolling (always 3)
 * @returns {Object} Minimum scores object
 */
export function getMinimumScores() {
    return {
        STR: 3,
        INT: 3,
        WIS: 3,
        DEX: 3,
        CON: 3,
        CHA: 3
    };
}

/**
 * Get class ability requirements
 * @param {string} className - Class name (with or without _CLASS suffix)
 * @returns {Object} Requirements object (e.g., {STR: 9})
 */
export function getClassRequirements(className) {
    // Handle null/undefined className
    if (!className) {
        return {};
    }
    
    // Normalize class name
    const normalizedClass = className.endsWith('_CLASS') ? className : `${className}_CLASS`;
    
    const requirements = {
        'Cleric_CLASS': {},
        'Fighter_CLASS': {},
        'Magic-User_CLASS': {},
        'Thief_CLASS': {},
        'Spellblade_CLASS': { STR: 9, INT: 9 }
    };
    
    return requirements[normalizedClass] || {};
}

/**
 * Get hit dice size for a class
 * @param {string} className - Class name (with or without _CLASS suffix)
 * @returns {number} Hit dice size (4, 6, or 8)
 */
export function getHitDiceSize(className) {
    // Normalize class name
    const normalizedClass = className.endsWith('_CLASS') ? className : `${className}_CLASS`;
    
    const hitDiceSizes = {
        'Cleric_CLASS': 6,
        'Fighter_CLASS': 8,
        'Magic-User_CLASS': 4,
        'Thief_CLASS': 4,
        'Spellblade_CLASS': 6
    };
    
    return hitDiceSizes[normalizedClass] || 8;
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
    
    const traditionalCombinations = {
        'Human': ['Cleric', 'Fighter', 'Magic-User', 'Thief', 'Spellblade'],
        'Human_RACE': ['Cleric', 'Fighter', 'Magic-User', 'Thief', 'Spellblade'],
        'Dwarf': ['Cleric', 'Fighter'],
        'Dwarf_RACE': ['Cleric', 'Fighter'],
        'Elf': ['Fighter', 'Magic-User', 'Spellblade'],
        'Elf_RACE': ['Fighter', 'Magic-User', 'Spellblade'],
        'Gnome': ['Cleric', 'Fighter', 'Thief'],
        'Gnome_RACE': ['Cleric', 'Fighter', 'Thief'],
        'Halfling': ['Fighter', 'Thief'],
        'Halfling_RACE': ['Fighter', 'Thief']
    };
    
    return traditionalCombinations[race] || [];
}
