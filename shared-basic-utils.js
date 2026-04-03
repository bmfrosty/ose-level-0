/**
 * shared-basic-utils.js
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
 * Get class ability requirements
 * @param {string} className - Class name (with or without _CLASS suffix)
 * @returns {Object} Requirements object (e.g., {CON: 9})
 */
export function getClassRequirements(className) {
    // Normalize: strip _CLASS suffix so both 'Dwarf' and 'Dwarf_CLASS' work
    const base = (className || '').replace(/_CLASS$/, '');
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
    return requirements[base] || {};
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

