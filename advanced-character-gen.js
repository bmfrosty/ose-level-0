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
 * @param {string} raceClassMode - Race/class mode ('strict', 'traditional-extended', 'allow-all')
 * @returns {Array} Array of racial ability strings
 */
export function getRacialAbilities(race, raceClassMode = 'strict') {
    console.log('[getRacialAbilities] Called with race:', race, 'raceClassMode:', raceClassMode);
    
    // For humans, only return abilities if level caps are lifted
    const humanAbilitiesEnabled = (raceClassMode === 'traditional-extended' || raceClassMode === 'allow-all');
    console.log('[getRacialAbilities] humanAbilitiesEnabled:', humanAbilitiesEnabled);
    
    // Import from global scope (loaded via script tag in browser)
    if (typeof window !== 'undefined' && typeof window.getRacialAbilities !== 'undefined') {
        console.log('[getRacialAbilities] window.getRacialAbilities exists');
        
        // racial-abilities.js checks for BOTH 'advanced' and 'humanRacialAbilities' checkboxes
        // We need to create/set both
        
        const originalAdvancedCheckbox = document.getElementById('advanced');
        const originalHumanCheckbox = document.getElementById('humanRacialAbilities');
        console.log('[getRacialAbilities] originalAdvancedCheckbox:', originalAdvancedCheckbox);
        console.log('[getRacialAbilities] originalHumanCheckbox:', originalHumanCheckbox);
        
        // Create temp checkboxes
        const tempAdvancedCheckbox = document.createElement('input');
        tempAdvancedCheckbox.type = 'checkbox';
        tempAdvancedCheckbox.id = 'advanced';
        tempAdvancedCheckbox.checked = true; // Always true for Advanced Mode
        
        const tempHumanCheckbox = document.createElement('input');
        tempHumanCheckbox.type = 'checkbox';
        tempHumanCheckbox.id = 'humanRacialAbilities';
        tempHumanCheckbox.checked = humanAbilitiesEnabled;
        
        // Add temp checkboxes if they don't exist
        if (!originalAdvancedCheckbox) {
            console.log('[getRacialAbilities] Adding temp advanced checkbox, checked: true');
            document.body.appendChild(tempAdvancedCheckbox);
        }
        
        if (!originalHumanCheckbox) {
            console.log('[getRacialAbilities] Adding temp human checkbox, checked:', humanAbilitiesEnabled);
            document.body.appendChild(tempHumanCheckbox);
        } else {
            console.log('[getRacialAbilities] Original human checkbox exists, setting checked to:', humanAbilitiesEnabled);
            originalHumanCheckbox.checked = humanAbilitiesEnabled;
        }
        console.log('[getRacialAbilities] Calling window.getRacialAbilities with:', race);
        const abilities = window.getRacialAbilities(race);
        console.log('[getRacialAbilities] Returned abilities:', abilities);
        
        // Clean up temp checkboxes
        if (!originalAdvancedCheckbox && tempAdvancedCheckbox.parentNode) {
            console.log('[getRacialAbilities] Removing temp advanced checkbox');
            tempAdvancedCheckbox.parentNode.removeChild(tempAdvancedCheckbox);
        }
        
        if (!originalHumanCheckbox && tempHumanCheckbox.parentNode) {
            console.log('[getRacialAbilities] Removing temp human checkbox');
            tempHumanCheckbox.parentNode.removeChild(tempHumanCheckbox);
        }
        
        return abilities;
    }
    
    console.log('[getRacialAbilities] window.getRacialAbilities not found, returning empty array');
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
        raceClassMode = 'strict'
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
        racialAbilities: racialAbilities
    });
    
    // Add Advanced Mode specific properties
    character.race = race;
    character.baseScores = baseScores;
    character.adjustedScores = adjustedScores;
    character.racialAdjustments = racialAdjustments;
    character.racialAbilities = racialAbilities;
    
    return character;
}
