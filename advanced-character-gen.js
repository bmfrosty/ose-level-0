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

// Import shared racial abilities
import {
    getAdvancedModeRacialAbilities
} from './shared-racial-abilities.js';

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
 * Simplified wrapper that uses the imported ES6 module function
 * @param {string} race - Race name (with _RACE suffix)
 * @param {string} raceClassMode - Race/class mode ('strict', 'traditional-extended', 'allow-all')
 * @returns {Array} Array of racial ability strings
 */
export function getRacialAbilities(race, raceClassMode = 'strict') {
    console.log('[getRacialAbilities] Called with race:', race, 'raceClassMode:', raceClassMode);
    
    // For humans, only return abilities if level caps are lifted
    const humanAbilitiesEnabled = (raceClassMode === 'traditional-extended' || raceClassMode === 'allow-all');
    console.log('[getRacialAbilities] humanAbilitiesEnabled:', humanAbilitiesEnabled);
    
    // The shared function checks document.getElementById('humanRacialAbilities')
    // We need to temporarily set this checkbox if it exists
    if (typeof document !== 'undefined') {
        const humanCheckbox = document.getElementById('humanRacialAbilities');
        const advancedCheckbox = document.getElementById('advanced');
        
        // Store original values
        const originalHumanValue = humanCheckbox ? humanCheckbox.checked : null;
        const originalAdvancedValue = advancedCheckbox ? advancedCheckbox.checked : null;
        
        // Set checkboxes for the function call
        if (humanCheckbox) {
            humanCheckbox.checked = humanAbilitiesEnabled;
        }
        if (advancedCheckbox) {
            advancedCheckbox.checked = true; // Always true for Advanced Mode
        }
        
        // Call the imported function
        const abilities = getAdvancedModeRacialAbilities(race);
        
        // Restore original values
        if (humanCheckbox && originalHumanValue !== null) {
            humanCheckbox.checked = originalHumanValue;
        }
        if (advancedCheckbox && originalAdvancedValue !== null) {
            advancedCheckbox.checked = originalAdvancedValue;
        }
        
        console.log('[getRacialAbilities] Returned abilities:', abilities);
        return abilities;
    }
    
    // Fallback for non-browser environments
    return getAdvancedModeRacialAbilities(race);
}

/**
 * Roll hit points for a character (wrapper for shared function)
 * @param {string} className - Class name (with _CLASS suffix)
 * @param {number} level - Character level
 * @param {number} conModifier - CON modifier
 * @param {Object} classData - Class data module (OSE or Gygar)
 * @param {boolean} includeLevel0HP - Whether to include level 0 HP
 * @param {boolean} healthyCharacters - Whether Healthy Characters is enabled
 * @param {boolean} blessed - Whether character has Blessed ability (roll twice, take best)
 * @returns {number} Total HP
 */
export function rollHitPoints(className, level, conModifier, classData, includeLevel0HP, healthyCharacters, blessed = false) {
    return sharedRollHitPoints({
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
 * @param {string} options.raceClassMode - Race/class mode ('strict', 'traditional-extended', 'allow-all')
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
        smoothifiedMode,
        raceClassMode = 'strict',
        name,
        background
    } = options;
    
    // Get racial adjustments for display
    const racialAdjustments = getRacialAdjustments(race);
    
    // Get class progression data (using adjusted scores)
    const progression = getClassProgressionData(className, level, adjustedScores, classData);
    
    // Get class features
    const features = getClassFeatures(className, level, classData, ClassDataShared);
    
    // Get racial abilities (pass raceClassMode for human abilities)
    const racialAbilities = getRacialAbilities(race, raceClassMode);
    
    // Create character object using shared function
    const character = sharedCreateCharacter({
        level,
        className,
        mode: smoothifiedMode ? 'Smoothified' : 'Normal',
        abilityScores: adjustedScores,
        hp,
        progressionData: progression,
        features: features,
        racialAbilities: racialAbilities,
        name: name,
        background: background
    });
    
    // Add Advanced Mode specific properties
    character.race = race;
    character.baseScores = baseScores;
    character.adjustedScores = adjustedScores;
    character.racialAdjustments = racialAdjustments;
    character.racialAbilities = racialAbilities;
    
    return character;
}
