/**
 * shared-advanced-character-gen.js
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
} from './shared-advanced-utils.js';

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
    let totalAttempts = 0;
    while (true) {
        const { scores: baseScores, attempts } = rollAbilities(minimumScores, toughCharacters, className, primeRequisite13);
        totalAttempts += attempts;

        if (!meetsRacialMinimums(baseScores, race)) continue;

        const adjustedScores = applyRacialAdjustments(baseScores, race);

        const classReqs = getClassRequirements(className);
        let classOk = true;
        for (const ability in classReqs) {
            if (adjustedScores[ability] < classReqs[ability]) { classOk = false; break; }
        }
        if (!classOk) continue;

        return { baseScores, adjustedScores, attempts: totalAttempts };
    }
}

/**
 * Get racial abilities for a race (not class-dependent in Advanced Mode)
 * Passes values directly to avoid any DOM dependency.
 * @param {string} race - Race name (with _RACE suffix)
 * @param {string} raceClassMode - Race/class mode ('strict', 'strict-human', 'traditional-extended', 'allow-all')
 * @returns {Array} Array of racial ability strings
 */
export function getRacialAbilities(race, raceClassMode = 'strict') {
    console.log('[getRacialAbilities] Called with race:', race, 'raceClassMode:', raceClassMode);
    
    // Human racial abilities are enabled for all modes except pure 'strict'
    const humanAbilitiesEnabled = (raceClassMode === 'strict-human' || raceClassMode === 'traditional-extended' || raceClassMode === 'allow-all');
    console.log('[getRacialAbilities] humanAbilitiesEnabled:', humanAbilitiesEnabled);
    
    // Pass options directly — no DOM reading or manipulation needed
    const abilities = getAdvancedModeRacialAbilities(race, {
        isAdvanced: true,               // Always in Advanced Mode
        humanRacialAbilities: humanAbilitiesEnabled
    });
    
    console.log('[getRacialAbilities] Returned abilities:', abilities);
    return abilities;
}

/**
 * Roll hit points for a character (wrapper for shared function)
 * @param {string} className - Class name (with _CLASS suffix)
 * @param {number} level - Character level
 * @param {number} conModifier - CON modifier
 * @param {Object} classData - Class data module (OSE or Gygar)
 * @param {boolean} includeLevel0HP - Whether to include level 0 HP
 * @param {number} [hpMode=0] - HP rolling mode: 0=normal, 1=blessed, 2=5e, 3=re-roll 1s and 2s
 * @returns {number} Total HP
 */
export function rollHitPoints(className, level, conModifier, classData, includeLevel0HP, hpMode = 0, fixedRolls = null) {
    return sharedRollHitPoints({
        fixedRolls,
        className,
        level,
        conModifier,
        classData,
        includeLevel0HP,
        hpMode
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
