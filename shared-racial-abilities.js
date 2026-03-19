// Racial abilities and bonuses for OSE characters
// Extracted from names-tables.js for better code organization
// ES6 Module

// ============================================================================
// IMPORTS
// ============================================================================
import { LEGACY_RACE_NAMES, normalizeRaceName } from './shared-race-names.js';

// ============================================================================
// RACIAL CLASS LEVEL LIMITS (NORMAL MODE)
// ============================================================================
// Maximum level by race and class for Normal Mode (OSE Advanced Fantasy)
// In Smoothified Mode (Gygar), these limits are ignored

export const RACIAL_CLASS_LEVEL_LIMITS = {
    "Drow_RACE": {
        "Acrobat_CLASS": 10,
        "Assassin_CLASS": 10,
        "Cleric_CLASS": 11,  // May be NPC-only at referee's option
        "Fighter_CLASS": 7,
        "Knight_CLASS": 9,
        "Magic-User_CLASS": 9,
        "Ranger_CLASS": 9,
        "Thief_CLASS": 11
    },
    "Duergar_RACE": {
        "Assassin_CLASS": 9,
        "Cleric_CLASS": 8,  // May be NPC-only at referee's option
        "Fighter_CLASS": 9,
        "Thief_CLASS": 9
    },
    "Dwarf_RACE": {
        "Assassin_CLASS": 9,
        "Cleric_CLASS": 8,  // May be NPC-only at referee's option
        "Fighter_CLASS": 10,
        "Thief_CLASS": 9
    },
    "Elf_RACE": {
        "Acrobat_CLASS": 10,
        "Assassin_CLASS": 10,
        "Cleric_CLASS": 7,  // May be NPC-only at referee's option
        "Druid_CLASS": 8,   // May be NPC-only at referee's option
        "Fighter_CLASS": 7,
        "Knight_CLASS": 11,
        "Magic-User_CLASS": 11,
        "Ranger_CLASS": 11,
        "Spellblade_CLASS": 10,
        "Thief_CLASS": 10
    },
    "Gnome_RACE": {
        "Assassin_CLASS": 6,
        "Cleric_CLASS": 7,  // May be NPC-only at referee's option
        "Fighter_CLASS": 6,
        "Illusionist_CLASS": 7,
        "Thief_CLASS": 8
    },
    "Half-Elf_RACE": {
        "Acrobat_CLASS": 12,
        "Assassin_CLASS": 11,
        "Bard_CLASS": 12,
        "Cleric_CLASS": 5,
        "Druid_CLASS": 12,
        "Fighter_CLASS": 8,
        "Knight_CLASS": 12,
        "Magic-User_CLASS": 8,
        "Paladin_CLASS": 12,
        "Ranger_CLASS": 8,
        "Thief_CLASS": 12
    },
    "Halfling_RACE": {
        "Druid_CLASS": 6,  // May be NPC-only at referee's option
        "Fighter_CLASS": 6,
        "Thief_CLASS": 8
    },
    "Half-Orc_RACE": {
        "Acrobat_CLASS": 8,
        "Assassin_CLASS": 8,
        "Cleric_CLASS": 4,
        "Fighter_CLASS": 10,
        "Thief_CLASS": 8
    },
    "Svirfneblin_RACE": {
        "Assassin_CLASS": 8,
        "Cleric_CLASS": 7,  // May be NPC-only at referee's option
        "Fighter_CLASS": 6,
        "Illusionist_CLASS": 7,
        "Thief_CLASS": 8
    },
    "Human_RACE": {
        // Humans have a maximum level of 14 in all classes
        "Acrobat_CLASS": 14,
        "Assassin_CLASS": 14,
        "Bard_CLASS": 14,
        "Cleric_CLASS": 14,
        "Druid_CLASS": 14,
        "Fighter_CLASS": 14,
        "Illusionist_CLASS": 14,
        "Knight_CLASS": 14,
        "Magic-User_CLASS": 14,
        "Paladin_CLASS": 14,
        "Ranger_CLASS": 14,
        "Thief_CLASS": 14,
        "Spellblade_CLASS": 14
    }
};

/**
 * Get maximum level for a race/class combination
 * @param {string} race - The race name (with or without _RACE suffix)
 * @param {string} className - The class name
 * @param {boolean} isSmootified - Whether Smoothified Mode is enabled (ignores limits)
 * @returns {number|null} Maximum level, or null if unlimited or combination not allowed
 */
export function getMaxLevel(race, className, isSmootified = false) {
    // Smoothified Mode: no level limits
    if (isSmootified) {
        return null;  // null = unlimited
    }
    
    const normalizedRace = normalizeRaceName(race);
    
    // Look up race/class combination
    const raceLimits = RACIAL_CLASS_LEVEL_LIMITS[normalizedRace];
    if (!raceLimits) {
        return null;  // Unknown race, assume unlimited
    }
    
    const maxLevel = raceLimits[className];
    return maxLevel !== undefined ? maxLevel : null;  // null = combination not allowed
}

/**
 * Check if a race can take a specific class
 * @param {string} race - The race name (with or without _RACE suffix)
 * @param {string} className - The class name
 * @param {boolean} allowNonTraditional - Whether to allow non-traditional combinations
 * @returns {boolean} True if the combination is allowed
 */
export function canRaceTakeClass(race, className, allowNonTraditional = false) {
    // If non-traditional combinations are allowed, any race can take any class
    if (allowNonTraditional) {
        return true;
    }
    
    const normalizedRace = normalizeRaceName(race);
    
    // Humans can take any class
    if (normalizedRace === "Human_RACE") {
        return true;
    }
    
    // Check if race has this class in their level limits
    const raceLimits = RACIAL_CLASS_LEVEL_LIMITS[normalizedRace];
    if (!raceLimits) {
        return false;  // Unknown race
    }
    
    return raceLimits[className] !== undefined;
}

// ============================================================================
// RACIAL ABILITIES DATA
// ============================================================================

/**
 * Get racial abilities text for Advanced/0-Level Mode (returns array of lines)
 * In Advanced/0-Level Mode, race is separate from class
 * @param {string} race - The race name (e.g., "Dwarf_RACE", "Elf_RACE")
 * @returns {string[]} Array of racial ability descriptions
 */
export function getAdvancedModeRacialAbilities(race) {
    const normalizedRace = normalizeRaceName(race);
    // Check if Advanced mode is enabled
    let isAdvanced = false;
    let humanRacialAbilities = false;
    
    if (typeof document !== 'undefined') {
        // Browser: check checkboxes
        const advancedCheckbox = document.getElementById('advanced');
        const humanAbilitiesCheckbox = document.getElementById('humanRacialAbilities');
        isAdvanced = advancedCheckbox ? advancedCheckbox.checked : false;
        humanRacialAbilities = humanAbilitiesCheckbox ? humanAbilitiesCheckbox.checked : false;
    } else if (typeof process !== 'undefined' && process.env) {
        // Node.js: check environment variables
        isAdvanced = process.env.ADVANCED === 'true';
        humanRacialAbilities = process.env.HUMAN_RACIAL_ABILITIES === 'true';
    }
    
    const RACIAL_ABILITIES = {
        "Human_RACE": (isAdvanced && humanRacialAbilities) ? [
            "Blessed: Roll HP twice, take best (including at 0th and 1st level)",
            "Decisiveness: Act first on tied initiative (+1 to individual initiative)",
            "Leadership: Retainers/mercenaries +1 loyalty and morale"
        ] : [],
        "Dwarf_RACE": [
            "Languages: Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold",
            "Small/normal weapons only (no longbows or two-handed swords)",
            "Detect construction tricks 2-in-6",
            "Detect room traps 2-in-6",
            "Infravision 60'",
            "Listen at doors 2-in-6",
            "Resilience: Bonus to Death/Wands/Spells saves based on CON"
        ],
        "Elf_RACE": [
            "Languages: Alignment, Common, Elvish, Gnoll, Hobgoblin, Orcish",
            "Detect secret doors 2-in-6 when actively searching",
            "Infravision 60'",
            "Listen at doors 2-in-6",
            "Immunity to ghoul paralysis"
        ],
        "Gnome_RACE": [
            "Languages: Alignment, Common, Dwarvish, Gnomish, Kobold, burrowing mammals",
            "Small/normal weapons only (no longbows or two-handed swords)",
            "Detect construction tricks 2-in-6",
            "Infravision 90'",
            "Listen at doors 2-in-6",
            "+2 AC vs large opponents",
            "Magic Resistance: Bonus to saves vs spells/wands/rods/staves based on CON"
        ],
        "Halfling_RACE": [
            "Languages: Alignment, Common, Halfling",
            "Small/normal weapons only (no longbows or two-handed swords)",
            "Listen at doors 2-in-6",
            "+1 to missile attack rolls",
            "+2 AC vs large opponents",
            "Resilience: Bonus to Death/Wands/Spells saves based on CON"
        ]
    };
    return RACIAL_ABILITIES[normalizedRace] || [];
}

/**
 * Legacy function for backward compatibility
 * @returns {string} Common demihuman abilities description
 */
export function getCommonDemihumanAbilities() {
    return "All demihumans speak additional native languages and have a 2-in-6 chance of hearing noises when listening at a door.";
}

// ============================================================================
// SAVING THROWS AND ATTACK BONUSES
// ============================================================================

// Saving throw tables for level 0 characters
// Same values for both Normal and Gygar modes at level 0
export const savingThrowsLevel0 = {
    Death: 14,
    Wands: 15,
    Paralysis: 16,
    Breath: 17,
    Spells: 18
};

// Attack bonus tables for level 0 characters
// Different values for Normal vs Gygar mode
export const attackBonusLevel0 = {
    Normal: -1,  // Penalty for untrained characters
    Gygar: 0     // No penalty in Gygar Mode (Castle Gygar house rules)
};

/**
 * Calculate Dwarf Resilience bonus based on CON score
 * Applies in both Basic and Advanced modes for Level 0 Dwarves
 * @param {number} conScore - Constitution score
 * @returns {number} Resilience bonus
 */
export function getDwarfResilienceBonus(conScore) {
    if (conScore <= 6) return 0;
    if (conScore >= 7 && conScore <= 10) return 2;
    if (conScore >= 11 && conScore <= 14) return 3;
    if (conScore >= 15 && conScore <= 17) return 4;
    if (conScore >= 18) return 5;
    return 0; // Fallback
}

/**
 * Calculate Gnome Magic Resistance bonus based on CON score
 * Applies in both Basic and Advanced modes for Level 0 Gnomes
 * @param {number} conScore - Constitution score
 * @returns {number} Magic Resistance bonus
 */
export function getGnomeMagicResistanceBonus(conScore) {
    if (conScore <= 6) return 0;
    if (conScore >= 7 && conScore <= 10) return 2;
    if (conScore >= 11 && conScore <= 14) return 3;
    if (conScore >= 15 && conScore <= 17) return 4;
    if (conScore >= 18) return 5;
    return 0; // Fallback
}

/**
 * Calculate Halfling Resilience bonus based on CON score
 * Applies in both Basic and Advanced modes for Level 0 Halflings
 * Same formula as Dwarf Resilience but applies to different save categories
 * @param {number} conScore - Constitution score
 * @returns {number} Resilience bonus
 */
export function getHalflingResilienceBonus(conScore) {
    if (conScore <= 6) return 0;
    if (conScore >= 7 && conScore <= 10) return 2;
    if (conScore >= 11 && conScore <= 14) return 3;
    if (conScore >= 15 && conScore <= 17) return 4;
    if (conScore >= 18) return 5;
    return 0; // Fallback
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate saving throws for a character
 * @param {number} level - Character level
 * @param {string} race - Race name
 * @param {number} conScore - Constitution score
 * @param {boolean} isAdvanced - Whether Advanced mode is enabled
 * @param {boolean} isGygar - Whether Gygar/Smoothified mode is enabled
 * @returns {Object} Object with Death, Wands, Paralysis, Breath, Spells
 */
export function calculateSavingThrows(level, race, conScore, isAdvanced, isGygar) {
    const normalizedRace = normalizeRaceName(race);
    // Start with base values for level 0
    // (Future: will use different tables for higher levels)
    const saves = {
        Death: savingThrowsLevel0.Death,
        Wands: savingThrowsLevel0.Wands,
        Paralysis: savingThrowsLevel0.Paralysis,
        Breath: savingThrowsLevel0.Breath,
        Spells: savingThrowsLevel0.Spells
    };
    
    // Apply Dwarf Resilience bonus if race is Dwarf (both Basic and Advanced modes)
    if (normalizedRace === "Dwarf_RACE") {
        const resilienceBonus = getDwarfResilienceBonus(conScore);
        // Resilience applies to Death, Wands, and Spells (not Paralysis or Breath)
        saves.Death -= resilienceBonus;
        saves.Wands -= resilienceBonus;
        saves.Spells -= resilienceBonus;
    }
    
    // Apply Gnome Magic Resistance bonus if race is Gnome (both Basic and Advanced modes)
    if (normalizedRace === "Gnome_RACE") {
        const magicResistanceBonus = getGnomeMagicResistanceBonus(conScore);
        // Magic Resistance applies to Wands and Spells only
        saves.Wands -= magicResistanceBonus;
        saves.Spells -= magicResistanceBonus;
    }
    
    // Apply Halfling Resilience bonus if race is Halfling (both Basic and Advanced modes)
    if (normalizedRace === "Halfling_RACE") {
        const resilienceBonus = getHalflingResilienceBonus(conScore);
        // Halfling Resilience applies to Death (poison), Wands, and Spells
        saves.Death -= resilienceBonus;
        saves.Wands -= resilienceBonus;
        saves.Spells -= resilienceBonus;
    }
    
    return saves;
}

/**
 * Calculate attack bonus for a character
 * @param {number} level - Character level
 * @param {string} race - Race name
 * @param {boolean} isAdvanced - Whether Advanced mode is enabled
 * @param {boolean} isGygar - Whether Gygar/Smoothified mode is enabled
 * @returns {number} Attack bonus
 */
export function calculateAttackBonus(level, race, isAdvanced, isGygar) {
    // For level 0 characters
    if (level === 0) {
        // Gygar Mode: no penalty at level 0
        if (isGygar) {
            return attackBonusLevel0.Gygar;  // 0
        }
        // Normal Mode: penalty at level 0
        return attackBonusLevel0.Normal;  // -1
    }
    
    // Future: will use different tables for higher levels
    // For now, just return 0 for any level above 0
    return 0;
}
