// Race ability adjustments and requirements for Advanced mode

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================
// Import shared race name mapping (loaded via script tag before this file)
// LEGACY_RACE_NAMES and normalizeRaceName are defined in shared-race-names.js

// ============================================================================
// RACE DATA
// ============================================================================

// Race ability adjustments (Advanced mode only)
const RACE_ADJUSTMENTS = {
    "Human_RACE": { STR: 0, DEX: 0, CON: 1, INT: 0, WIS: 0, CHA: 1 },
    "Dwarf_RACE": { STR: 0, DEX: 0, CON: 1, INT: 0, WIS: 0, CHA: -1 },
    "Elf_RACE": { STR: 0, DEX: 1, CON: -1, INT: 0, WIS: 0, CHA: 0 },
    "Gnome_RACE": { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
    "Halfling_RACE": { STR: -1, DEX: 1, CON: 0, INT: 0, WIS: 0, CHA: 0 }
};

// Race minimum ability requirements (Advanced mode only)
const RACE_MINIMUMS = {
    "Human_RACE": {},
    "Dwarf_RACE": { CON: 9 },
    "Elf_RACE": { INT: 9 },
    "Gnome_RACE": { CON: 9, INT: 9 },
    "Halfling_RACE": { CON: 9, DEX: 9 }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Get ability adjustments for a race (Advanced mode only)
function getRaceAdjustments(race) {
    const normalizedRace = normalizeRaceName(race);
    return RACE_ADJUSTMENTS[normalizedRace] || { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 };
}

// Get minimum requirements for a race (Advanced mode only)
function getRaceMinimums(race) {
    const normalizedRace = normalizeRaceName(race);
    return RACE_MINIMUMS[normalizedRace] || {};
}

// Apply race adjustments to ability scores
function applyRaceAdjustments(results, race, isAdvanced, humanRacialAbilities) {
    if (!isAdvanced) {
        return results; // No adjustments in classic mode
    }
    
    const normalizedRace = normalizeRaceName(race);
    
    // If race is Human and humanRacialAbilities is false, don't apply adjustments
    if (normalizedRace === "Human_RACE" && humanRacialAbilities === false) {
        return results;
    }
    
    // Get getModifier function from global scope or require it
    let getModifierFunc;
    if (typeof getModifier !== 'undefined') {
        getModifierFunc = getModifier;
    } else if (typeof require !== 'undefined') {
        getModifierFunc = require('./ose-modifiers.js').getModifier;
    }
    
    const adjustments = getRaceAdjustments(normalizedRace);
    const adjustedResults = results.map(result => {
        const adjustment = adjustments[result.ability] || 0;
        const adjustedRoll = result.roll + adjustment;
        const adjustedModifier = getModifierFunc(adjustedRoll);
        
        return {
            ability: result.ability,
            roll: adjustedRoll,
            modifier: adjustedModifier,
            originalRoll: result.roll,
            adjustment: adjustment
        };
    });
    
    return adjustedResults;
}

// Check if character meets race minimums (Advanced mode only)
function meetsRaceMinimums(results, race, isAdvanced) {
    if (!isAdvanced) {
        return true; // No requirements in classic mode
    }
    
    const normalizedRace = normalizeRaceName(race);
    const minimums = getRaceMinimums(normalizedRace);
    
    for (const [ability, minimum] of Object.entries(minimums)) {
        const abilityScore = results.find(r => r.ability === ability);
        if (abilityScore && abilityScore.roll < minimum) {
            return false;
        }
    }
    
    return true;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LEGACY_RACE_NAMES,
        RACE_ADJUSTMENTS,
        RACE_MINIMUMS,
        normalizeRaceName,
        getRaceAdjustments,
        getRaceMinimums,
        applyRaceAdjustments,
        meetsRaceMinimums
    };
}
