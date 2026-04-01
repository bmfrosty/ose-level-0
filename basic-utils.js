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
 * Get minimum scores for rolling from the DOM input fields in section 5.
 * @returns {Object} Minimum scores object
 */
export function getMinimumScores() {
    return {
        STR: parseInt(document.getElementById('scoreSTR')?.value) || 3,
        INT: parseInt(document.getElementById('scoreINT')?.value) || 3,
        WIS: parseInt(document.getElementById('scoreWIS')?.value) || 3,
        DEX: parseInt(document.getElementById('scoreDEX')?.value) || 3,
        CON: parseInt(document.getElementById('scoreCON')?.value) || 3,
        CHA: parseInt(document.getElementById('scoreCHA')?.value) || 3
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

/**
 * Get class prime requisites
 * @param {string} className - Class name
 * @returns {Array<string>} Array of prime requisite ability names
 */
export function getClassPrimeRequisites(className) {
    const primeRequisites = {
        'Cleric': ['WIS'],
        'Fighter': ['STR'],
        'Magic-User': ['INT'],
        'Thief': ['DEX'],
        'Dwarf': ['STR'],
        'Elf': ['INT', 'STR'],
        'Halfling': ['DEX', 'STR'],
        'Gnome': ['INT'],
        'Spellblade': ['INT', 'STR']
    };
    return primeRequisites[className] || [];
}

/**
 * Check if ability scores meet class prime requisite requirements
 * @param {Object} scores - Ability scores object
 * @param {string} className - Class name
 * @param {number} minimum - Minimum score required (9 or 13)
 * @returns {boolean} True if requirements met
 */
export function meetsClassPrimeRequisites(scores, className, minimum) {
    const primeReqs = getClassPrimeRequisites(className);
    
    // If no prime requisites defined, always pass
    if (primeReqs.length === 0) {
        return true;
    }
    
    // Check if at least one prime requisite meets the minimum
    return primeReqs.some(ability => scores[ability] >= minimum);
}
