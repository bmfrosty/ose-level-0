// Race ability adjustments and requirements for Advanced mode

// Get ability adjustments for a race (Advanced mode only)
function getRaceAdjustments(race) {
    const adjustments = {
        "Human": { STR: 0, DEX: 0, CON: 1, INT: 0, WIS: 0, CHA: 1 },
        "Dwarf": { STR: 0, DEX: 0, CON: 1, INT: 0, WIS: 0, CHA: -1 },
        "Elf": { STR: 0, DEX: 1, CON: -1, INT: 0, WIS: 0, CHA: 0 },
        "Gnome": { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
        "Halfling": { STR: -1, DEX: 1, CON: 0, INT: 0, WIS: 0, CHA: 0 }
    };
    return adjustments[race] || { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 };
}

// Get minimum requirements for a race (Advanced mode only)
function getRaceMinimums(race) {
    const minimums = {
        "Human": {},
        "Dwarf": { CON: 9 },
        "Elf": { INT: 9 },
        "Gnome": { CON: 9, INT: 9 },
        "Halfling": { CON: 9, DEX: 9 }
    };
    return minimums[race] || {};
}

// Apply race adjustments to ability scores
function applyRaceAdjustments(results, race, isAdvanced) {
    if (!isAdvanced) {
        return results; // No adjustments in classic mode
    }
    
    // Get getModifier function from global scope or require it
    let getModifierFunc;
    if (typeof getModifier !== 'undefined') {
        getModifierFunc = getModifier;
    } else if (typeof require !== 'undefined') {
        getModifierFunc = require('./ose-modifiers.js').getModifier;
    }
    
    const adjustments = getRaceAdjustments(race);
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
    
    const minimums = getRaceMinimums(race);
    
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
        getRaceAdjustments,
        getRaceMinimums,
        applyRaceAdjustments,
        meetsRaceMinimums
    };
}
