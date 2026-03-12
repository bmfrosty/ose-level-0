/**
 * advanced-character-gen.js
 * Character generation functions for Advanced Mode
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
    getClassFeatures as sharedGetClassFeatures
} from './shared-class-progression.js';

// Import shared character utilities
import {
    createCharacter as sharedCreateCharacter
} from './shared-character.js';

// Import advanced-specific utilities
import {
    applyRacialAdjustments,
    meetsRacialMinimums,
    getClassRequirements,
    getRacialAdjustments
} from './advanced-utils.js';

// Re-export for backward compatibility
export {
    rollAbilityScore,
    rollAbilities,
    rollSingleDie,
    parseHitDice,
    applyRacialAdjustments,
    meetsRacialMinimums
};

/**
 * Roll ability scores for Advanced Mode with racial adjustments
 * @param {Object} minimumScores - Minimum scores object
 * @param {string} race - Race name (with _RACE suffix)
 * @param {string} className - Class name (with _CLASS suffix)
 * @param {boolean} toughCharacters - Whether Tough Characters is enabled
 * @param {boolean} primeRequisite13 - Whether to require prime requisite ≥ 13
 * @returns {Object} Object with baseScores and adjustedScores
 */
export function rollAbilitiesAdvanced(minimumScores, race, className, toughCharacters, primeRequisite13) {
    // Roll base ability scores
    const baseScores = rollAbilities(minimumScores, toughCharacters, className, primeRequisite13);
    
    // Check if base scores meet racial minimums
    if (!meetsRacialMinimums(baseScores, race)) {
        // Re-roll if racial minimums not met
        return rollAbilitiesAdvanced(minimumScores, race, className, toughCharacters, primeRequisite13);
    }
    
    // Apply racial adjustments
    const adjustedScores = applyRacialAdjustments(baseScores, race);
    
    // Check if adjusted scores meet class requirements
    const classReqs = getClassRequirements(className);
    for (const ability in classReqs) {
        if (adjustedScores[ability] < classReqs[ability]) {
            // Re-roll if class requirements not met after adjustments
            return rollAbilitiesAdvanced(minimumScores, race, className, toughCharacters, primeRequisite13);
        }
    }
    
    return {
        baseScores,
        adjustedScores
    };
}

/**
 * Get racial abilities for a race (not class-dependent in Advanced Mode)
 * @param {string} race - Race name (with _RACE suffix)
 * @returns {Array} Array of racial ability strings
 */
export function getRacialAbilities(race) {
    // Import from global scope (loaded via script tag in browser)
    if (typeof window !== 'undefined' && typeof window.getRacialAbilities !== 'undefined') {
        return window.getRacialAbilities(race);
    }
    
    // Fallback: empty array
    return [];
}

/**
 * Roll hit points for a character (wrapper for shared function)
 * @param {string} className - Class name (with _CLASS suffix)
 * @param {number} level - Character level
 * @param {number} conModifier - CON modifier
 * @param {Object} classData - Class data module (OSE or Gygar)
 * @param {boolean} includeLevel0HP - Whether to include level 0 HP
 * @param {boolean} healthyCharacters - Whether Healthy Characters is enabled
 * @returns {number} Total HP
 */
export function rollHitPoints(className, level, conModifier, classData, includeLevel0HP, healthyCharacters) {
    return sharedRollHitPoints({
        className,
        level,
        conModifier,
        classData,
        includeLevel0HP,
        healthyCharacters
    });
}

/**
 * Get class progression data (wrapper for shared function)
 * @param {string} className - Class name (with _CLASS suffix)
 * @param {number} level - Character level
 * @param {Object} abilityScores - Ability scores object (adjusted scores)
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
 * Get class-specific features (wrapper for shared function)
 * @param {string} className - Class name (with _CLASS suffix)
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

/**
 * Create comprehensive character object for Advanced Mode
 * @param {Object} options - Character generation options
 * @param {number} options.level - Character level
 * @param {string} options.race - Race name (with _RACE suffix)
 * @param {string} options.className - Class name (with _CLASS suffix)
 * @param {Object} options.baseScores - Base ability scores (before racial adjustments)
 * @param {Object} options.adjustedScores - Adjusted ability scores (after racial adjustments)
 * @param {number} options.hp - Hit points
 * @param {Object} options.classData - Class data module
 * @param {Object} options.ClassDataShared - Shared class data module
 * @param {boolean} options.smoothifiedMode - Whether Smoothified Mode is enabled
 * @returns {Object} Complete character object
 */
export function createCharacterAdvanced(options) {
    const {
        level,
        race,
        className,
        baseScores,
        adjustedScores,
        hp,
        classData,
        ClassDataShared,
        smoothifiedMode
    } = options;
    
    // Get racial adjustments for display
    const racialAdjustments = getRacialAdjustments(race);
    
    // Get class progression data (using adjusted scores)
    const progression = getClassProgressionData(className, level, adjustedScores, classData);
    
    // Get class features
    const features = getClassFeatures(className, level, classData, ClassDataShared);
    
    // Get racial abilities
    const racialAbilities = getRacialAbilities(race);
    
    // Create character object using shared function
    const character = sharedCreateCharacter({
        level,
        className,
        abilityScores: adjustedScores,
        hp,
        classData,
        ClassDataShared,
        smoothifiedMode
    });
    
    // Add Advanced Mode specific properties
    character.race = race;
    character.baseScores = baseScores;
    character.adjustedScores = adjustedScores;
    character.racialAdjustments = racialAdjustments;
    character.racialAbilities = racialAbilities;
    
    return character;
}
