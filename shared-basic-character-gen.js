/**
 * shared-basic-character-gen.js
 * Character generation functions for Basic Mode
 */

// Import shared ability score utilities
import {
    rollAbilityScore,
    rollAbilities
} from './shared-ability-scores.js';

// Import shared hit points utilities
import {
    rollSingleDie,
    parseHitDice,
    rollHitPoints as sharedRollHitPoints
} from './shared-hit-points.js';

// Import shared class progression utilities
import {
    getClassProgressionData as sharedGetClassProgressionData,
    getClassFeatures as sharedGetClassFeatures,
    getBasicModeRacialAbilities
} from './shared-class-progression.js';

// Import shared character utilities
import {
    createCharacter as sharedCreateCharacter
} from './shared-character.js';

// Re-export for backward compatibility
export {
    rollAbilityScore,
    rollAbilities,
    rollSingleDie,
    parseHitDice
};

/**
 * Roll hit points for a character (wrapper for shared function)
 * @param {string} className - Class name
 * @param {number} level - Character level
 * @param {number} conModifier - CON modifier
 * @param {Object} classData - Class data module (OSE or Gygar)
 * @param {boolean} includeLevel0HP - Whether to include level 0 HP
 * @param {boolean} healthyCharacters - Whether Healthy Characters is enabled
 * @returns {number} Total HP
 */
export function rollHitPoints(className, level, conModifier, classData, includeLevel0HP, healthyCharacters, blessed = false, fixedRolls = null) {
    return sharedRollHitPoints({
        fixedRolls,
        className,
        level,
        conModifier,
        classData,
        includeLevel0HP,
        healthyCharacters,
        blessed
    });
}

/**
 * Get class progression data (wrapper for shared function)
 * @param {string} className - Class name
 * @param {number} level - Character level
 * @param {Object} abilityScores - Ability scores object
 * @param {Object} classData - Class data module (OSE or Gygar)
 * @returns {Object} Progression data object
 */
export function getClassProgressionData(className, level, abilityScores, classData) {
    return sharedGetClassProgressionData({
        className,
        level,
        abilityScores,
        classData
    });
}

/**
 * Get racial abilities for demihuman classes (wrapper for shared function)
 * @param {string} className - Class name
 * @returns {Array} Array of racial ability strings, or empty array if not demihuman
 */
export function getRacialAbilities(className) {
    return getBasicModeRacialAbilities(className);
}

/**
 * Create comprehensive character object (wrapper for shared function)
 * @param {Object} options - Character generation options
 * @returns {Object} Complete character object
 */
export function createCharacter(options) {
    return sharedCreateCharacter(options);
}

/**
 * Get class-specific features (wrapper for shared function)
 * @param {string} className - Class name
 * @param {number} level - Character level
 * @param {Object} classData - Class data module (OSE or Gygar)
 * @param {Object} ClassDataShared - Shared class data module
 * @returns {Object} Features object
 */
export function getClassFeatures(className, level, classData, ClassDataShared) {
    return sharedGetClassFeatures({
        className,
        level,
        classData,
        ClassDataShared
    });
}
