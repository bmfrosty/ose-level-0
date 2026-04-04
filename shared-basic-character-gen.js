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
    getBasicModeClassAbilities
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
 * Get class abilities for demihuman classes in Basic mode (wrapper for shared function)
 * @param {string} className - Class name
 * @returns {Array} Array of class ability strings, or empty array if not demihuman
 */
export function getClassAbilities(className) {
    return getBasicModeClassAbilities(className);
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
    // NOTE: This is the BASIC MODE wrapper around the shared getClassFeatures.
    // In Basic mode, demihuman classes (Dwarf, Elf, Halfling, Gnome) are race-as-class.
    // Their abilities are displayed via racialAbilities (getClassAbilities below),
    // so we clear classAbilities here to prevent them appearing twice on the sheet.
    const features = sharedGetClassFeatures({ className, level, classData, ClassDataShared });
    const BASIC_DEMIHUMAN_CLASSES = ['Dwarf_CLASS', 'Elf_CLASS', 'Halfling_CLASS', 'Gnome_CLASS'];
    if (BASIC_DEMIHUMAN_CLASSES.includes(className)) {
        features.classAbilities = []; // racial abilities shown via racialAbilities section
    }
    return features;
}
