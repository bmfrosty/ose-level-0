// Racial abilities and bonuses for OSE characters
// Extracted from names-tables.js for better code organization

// Function to get racial abilities text (returns array of lines)
function getRacialAbilities(race) {
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
    
    const abilities = {
        "Human": (isAdvanced && humanRacialAbilities) ? [
            "Blessed: Roll HP twice, take best (including at 1st level)",
            "Decisiveness: Act first on tied initiative (+1 to individual initiative)",
            "Leadership: Retainers/mercenaries +1 loyalty and morale"
        ] : [],
        "Dwarf": [
            "Languages: Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold",
            "Small/normal weapons only (no longbows or two-handed swords)",
            "Detect construction tricks 2-in-6",
            "Detect room traps 2-in-6",
            "Infravision 60'",
            "Listen at doors 2-in-6",
            "Resilience: Bonus to Death/Wands/Spells saves based on CON (7-10: +2, 11-14: +3, 15-17: +4, 18: +5)"
        ],
        "Elf": [
            "Languages: Alignment, Common, Elvish, Gnoll, Hobgoblin, Orcish",
            "Detect secret doors 2-in-6 when actively searching",
            "Infravision 60'",
            "Listen at doors 2-in-6",
            "Immunity to ghoul paralysis"
        ],
        "Gnome": [
            "Languages: Alignment, Common, Dwarvish, Gnomish, Kobold, burrowing mammals",
            "Small/normal weapons only (no longbows or two-handed swords)",
            "Detect construction tricks 2-in-6",
            "Infravision 90'",
            "Listen at doors 2-in-6",
            "+2 AC vs large opponents",
            "Magic Resistance: Bonus to saves vs spells/wands/rods/staves based on CON (7-10: +2, 11-14: +3, 15-17: +4, 18: +5)"
        ],
        "Halfling": [
            "Languages: Alignment, Common, Halfling",
            "Small/normal weapons only (no longbows or two-handed swords)",
            "Listen at doors 2-in-6",
            "+1 to missile attack rolls",
            "+2 AC vs large opponents",
            "Resilience: Bonus to Death/Wands/Spells saves based on CON (7-10: +2, 11-14: +3, 15-17: +4, 18: +5)"
        ]
    };
    return abilities[race] || [];
}

// Legacy function for backward compatibility
function getCommonDemihumanAbilities() {
    return "All demihumans speak additional native languages and have a 2-in-6 chance of hearing noises when listening at a door.";
}

// Saving throw tables for level 0 characters
// Same values for both Normal and Gygar modes at level 0
const savingThrowsLevel0 = {
    Death: 14,
    Wands: 15,
    Paralysis: 16,
    Breath: 17,
    Spells: 18
};

// Attack bonus tables for level 0 characters
// Different values for Normal vs Gygar mode
const attackBonusLevel0 = {
    Normal: -1,  // Penalty for untrained characters
    Gygar: 0     // No penalty in Gygar Mode (Castle Gygar house rules)
};

// Calculate Dwarf Resilience bonus based on CON score
// Applies in both Basic and Advanced modes for Level 0 Dwarves
function getDwarfResilienceBonus(conScore) {
    if (conScore <= 6) return 0;
    if (conScore >= 7 && conScore <= 10) return 2;
    if (conScore >= 11 && conScore <= 14) return 3;
    if (conScore >= 15 && conScore <= 17) return 4;
    if (conScore >= 18) return 5;
    return 0; // Fallback
}

// Calculate Gnome Magic Resistance bonus based on CON score
// Applies in both Basic and Advanced modes for Level 0 Gnomes
function getGnomeMagicResistanceBonus(conScore) {
    if (conScore <= 6) return 0;
    if (conScore >= 7 && conScore <= 10) return 2;
    if (conScore >= 11 && conScore <= 14) return 3;
    if (conScore >= 15 && conScore <= 17) return 4;
    if (conScore >= 18) return 5;
    return 0; // Fallback
}

// Calculate Halfling Resilience bonus based on CON score
// Applies in both Basic and Advanced modes for Level 0 Halflings
// Same formula as Dwarf Resilience but applies to different save categories
function getHalflingResilienceBonus(conScore) {
    if (conScore <= 6) return 0;
    if (conScore >= 7 && conScore <= 10) return 2;
    if (conScore >= 11 && conScore <= 14) return 3;
    if (conScore >= 15 && conScore <= 17) return 4;
    if (conScore >= 18) return 5;
    return 0; // Fallback
}

// Calculate saving throws for a character
// Inputs: level, race, CON score, isAdvanced, isGygar
// Output: Object with Death, Wands, Paralysis, Breath, Spells
function calculateSavingThrows(level, race, conScore, isAdvanced, isGygar) {
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
    if (race === "Dwarf") {
        const resilienceBonus = getDwarfResilienceBonus(conScore);
        // Resilience applies to Death, Wands, and Spells (not Paralysis or Breath)
        saves.Death -= resilienceBonus;
        saves.Wands -= resilienceBonus;
        saves.Spells -= resilienceBonus;
    }
    
    // Apply Gnome Magic Resistance bonus if race is Gnome (both Basic and Advanced modes)
    if (race === "Gnome") {
        const magicResistanceBonus = getGnomeMagicResistanceBonus(conScore);
        // Magic Resistance applies to Wands and Spells only
        saves.Wands -= magicResistanceBonus;
        saves.Spells -= magicResistanceBonus;
    }
    
    // Apply Halfling Resilience bonus if race is Halfling (both Basic and Advanced modes)
    if (race === "Halfling") {
        const resilienceBonus = getHalflingResilienceBonus(conScore);
        // Halfling Resilience applies to Death (poison), Wands, and Spells
        saves.Death -= resilienceBonus;
        saves.Wands -= resilienceBonus;
        saves.Spells -= resilienceBonus;
    }
    
    return saves;
}

// Calculate attack bonus for a character
// Inputs: level, race, isAdvanced, isGygar
// Output: Number (attack bonus)
function calculateAttackBonus(level, race, isAdvanced, isGygar) {
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

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getRacialAbilities,
        getCommonDemihumanAbilities,
        savingThrowsLevel0,
        attackBonusLevel0,
        getDwarfResilienceBonus,
        getGnomeMagicResistanceBonus,
        getHalflingResilienceBonus,
        calculateSavingThrows,
        calculateAttackBonus
    };
}
