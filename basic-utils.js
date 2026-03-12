/**
 * basic-utils.js
 * Utility functions for Basic Mode character generation
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
 * @param {string} className - Class name
 * @returns {Object} Requirements object (e.g., {CON: 9})
 */
export function getClassRequirements(className) {
    const requirements = {
        'Cleric': {},
        'Fighter': {},
        'Magic-User': {},
        'Thief': {},
        'Dwarf': { CON: 9 },
        'Elf': { INT: 9 },
        'Halfling': { CON: 9, DEX: 9 },
        'Gnome': { INT: 9 },
        'Spellblade': { STR: 9, INT: 9 }
    };
    return requirements[className] || {};
}

/**
 * Get hit dice size for a class
 * @param {string} className - Class name
 * @returns {number} Hit dice size (4, 6, or 8)
 */
export function getHitDiceSize(className) {
    const hitDiceSizes = {
        'Cleric': 6,
        'Fighter': 8,
        'Magic-User': 4,
        'Thief': 4,
        'Dwarf': 8,
        'Elf': 6,
        'Halfling': 6,
        'Gnome': 4,
        'Spellblade': 6
    };
    return hitDiceSizes[className] || 8;
}

/**
 * Get demihuman level limits (Normal Mode only)
 * @returns {Object} Level limits by class
 */
export function getDemihumanLimits() {
    return {
        'Dwarf': 12,
        'Elf': 10,
        'Halfling': 8,
        'Gnome': 8
    };
}
