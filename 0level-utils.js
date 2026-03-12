/**
 * 0level-utils.js
 * Utility functions for 0-level character generation
 */

// Import shared ability score utilities
import {
    calculateModifier,
    formatModifier,
    rollSingleDie,
    rollDice
} from './shared-ability-scores.js';

// Re-export shared functions for backward compatibility
export {
    calculateModifier,
    formatModifier,
    rollSingleDie,
    rollDice
};

/**
 * Roll 3d6 for ability score
 * @returns {number} Ability score (3-18)
 */
export function roll3d6() {
    return rollDice(3, 6);
}

/**
 * Roll 1d4 for hit points
 * @returns {number} HP roll (1-4)
 */
export function roll1d4() {
    return rollSingleDie(4);
}

/**
 * Roll 1d12 for background table
 * @returns {number} Background roll (1-12)
 */
export function rollD12() {
    return rollSingleDie(12);
}

/**
 * Calculate hit points for 0-level character
 * @param {number} conModifier - Constitution modifier
 * @param {string} race - Character race (default: 'Human')
 * @param {boolean} isAdvanced - Whether Advanced mode is enabled
 * @returns {Object} HP result {roll, total, isAdventurer}
 */
export function calculateHitPoints(conModifier, race = 'Human', isAdvanced = false) {
    let hpRoll;
    
    // Humans get Blessed ability: roll twice, take best (only in Advanced mode)
    if (race === 'Human' && isAdvanced) {
        const roll1 = roll1d4();
        const roll2 = roll1d4();
        hpRoll = Math.max(roll1, roll2);
    } else {
        // Non-humans roll once
        hpRoll = roll1d4();
    }
    
    const hp = hpRoll + conModifier;
    return { 
        roll: hpRoll, 
        total: hp, 
        isAdventurer: hp > 0 
    };
}

/**
 * Calculate final AC with DEX modifier
 * @param {string} armor - Armor type ("Chain Mail" or other)
 * @param {number} dexModifier - Dexterity modifier
 * @returns {number} Armor Class
 */
export function calculateArmorClass(armor, dexModifier) {
    const baseAC = armor === "Chain Mail" ? 14 : 10; // Chain mail AC 14, unarmored AC 10
    return baseAC + dexModifier;
}

/**
 * Get minimum scores for rolling (from input fields or defaults)
 * @returns {Object} Minimum scores object
 */
export function getMinimumScores() {
    if (typeof document === 'undefined') {
        // Node.js environment: return defaults
        return {
            STR: 3,
            DEX: 3,
            CON: 3,
            INT: 3,
            WIS: 3,
            CHA: 3
        };
    }
    
    // Browser environment: read from input fields
    return {
        STR: parseInt(document.getElementById('strMin')?.value) || 3,
        DEX: parseInt(document.getElementById('dexMin')?.value) || 3,
        CON: parseInt(document.getElementById('conMin')?.value) || 3,
        INT: parseInt(document.getElementById('intMin')?.value) || 3,
        WIS: parseInt(document.getElementById('wisMin')?.value) || 3,
        CHA: parseInt(document.getElementById('chaMin')?.value) || 3
    };
}

/**
 * Check if ability scores meet minimum requirements
 * @param {Object} scores - Ability scores object
 * @param {Object} minimums - Minimum scores object
 * @returns {boolean} True if all minimums met
 */
export function meetsMinimumRequirements(scores, minimums) {
    return scores.STR >= minimums.STR &&
           scores.DEX >= minimums.DEX &&
           scores.CON >= minimums.CON &&
           scores.INT >= minimums.INT &&
           scores.WIS >= minimums.WIS &&
           scores.CHA >= minimums.CHA;
}

/**
 * Check if character has at least one ability score of 9 or above
 * @param {Object} scores - Ability scores object
 * @returns {boolean} True if at least one score ≥ 9
 */
export function hasHighAbility(scores) {
    return Object.values(scores).some(score => score >= 9);
}

/**
 * Check if scores meet "Born Adventurers" requirements
 * At least ONE of STR/DEX/INT/WIS must be ≥ 13
 * @param {Object} scores - Ability scores object
 * @returns {boolean} True if requirements met
 */
export function meetsBornAdventurersRequirements(scores) {
    return scores.STR >= 13 || scores.DEX >= 13 || 
           scores.INT >= 13 || scores.WIS >= 13;
}

/**
 * Check if HP meets "Healthy Characters" requirement
 * HP must be ≥ 2
 * @param {number} hp - Hit points total
 * @returns {boolean} True if HP ≥ 2
 */
export function meetsHealthyCharactersRequirement(hp) {
    return hp >= 2;
}
