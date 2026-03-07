// Character generation utilities

// Default ability names
const abilities = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
// Initialize a counter to track rerolls
let rerollCount = 0;
// Store current character data for PDF generation
let currentCharacter = null;

// Function to calculate hit points for 0-level character
function calculateHitPoints(conModifier, race = 'Human') {
    // Check if Advanced mode is enabled
    let isAdvanced = false;
    if (typeof document !== 'undefined') {
        // Browser: check checkbox
        const advancedCheckbox = document.getElementById('advanced');
        isAdvanced = advancedCheckbox ? advancedCheckbox.checked : false;
    } else if (typeof process !== 'undefined' && process.env) {
        // Node.js: check environment variable
        isAdvanced = process.env.ADVANCED === 'true';
    }
    
    // Use rollDice if available (Node.js), otherwise fall back to roll1d4 (browser)
    let hpRoll;
    
    // Humans get Blessed ability: roll twice, take best (only in Advanced mode)
    if (race === 'Human' && isAdvanced) {
        let roll1, roll2;
        if (typeof rollDice !== 'undefined') {
            roll1 = rollDice(1, 4);
            roll2 = rollDice(1, 4);
        } else if (typeof roll1d4 !== 'undefined') {
            roll1 = roll1d4();
            roll2 = roll1d4();
        } else {
            roll1 = Math.floor(Math.random() * 4) + 1;
            roll2 = Math.floor(Math.random() * 4) + 1;
        }
        hpRoll = Math.max(roll1, roll2);
    } else {
        // Non-humans roll once
        if (typeof rollDice !== 'undefined') {
            hpRoll = rollDice(1, 4);
        } else if (typeof roll1d4 !== 'undefined') {
            hpRoll = roll1d4();
        } else {
            hpRoll = Math.floor(Math.random() * 4) + 1;
        }
    }
    
    let hp = hpRoll + conModifier;
    return { roll: hpRoll, total: hp, isAdventurer: hp > 0 };
}

// Function to get background based on hit points
function getBackgroundByHitPoints(hitPoints) {
    // Cap hit points at 4 for occupation selection, minimum 1
    let hpForOccupation = Math.min(Math.max(hitPoints, 1), 4);
    let table = backgroundTables[hpForOccupation];
    
    // Use rollDice if available (Node.js), otherwise fall back to rollD12 (browser)
    let roll;
    if (typeof rollDice !== 'undefined') {
        roll = rollDice(1, 12);
    } else if (typeof rollD12 !== 'undefined') {
        roll = rollD12();
    } else {
        roll = Math.floor(Math.random() * 12) + 1;
    }
    
    return table[roll - 1]; // d12 roll (1-12) maps to array index (0-11)
}

// Function to calculate final AC with DEX modifier
function calculateArmorClass(armor, dexModifier) {
    let baseAC = armor === "Chain Mail" ? 14 : 10; // Chain mail AC 14, unarmored AC 10
    return baseAC + dexModifier;
}

// Function to generate a single character without displaying it
function generateSingleCharacter() {
    let total = 0;
    let results = [];
    let isValidArray = true;

    const strMin = parseInt(document.getElementById('strMin').value) || 3;
    const dexMin = parseInt(document.getElementById('dexMin').value) || 3;
    const conMin = parseInt(document.getElementById('conMin').value) || 3;
    const intMin = parseInt(document.getElementById('intMin').value) || 3;
    const wisMin = parseInt(document.getElementById('wisMin').value) || 3;
    const chaMin = parseInt(document.getElementById('chaMin').value) || 3;

    // Keep rolling until we get valid scores AND at least 1 HP
    do {
        total = 0;
        results = [];
        isValidArray = true;

        // Roll for each ability and calculate modifiers
        for (let i = 0; i < abilities.length; i++) {
            let roll = roll3d6();
            let modifier = getModifier(roll);
            total += modifier;

            // Push the roll details into results array
            results.push({
                ability: abilities[i],
                roll: roll,
                modifier: modifier
            });

            // Check if the roll meets the minimum requirements
            if (abilities[i] === "STR" && roll < strMin) isValidArray = false;
            if (abilities[i] === "DEX" && roll < dexMin) isValidArray = false;
            if (abilities[i] === "CON" && roll < conMin) isValidArray = false;
            if (abilities[i] === "INT" && roll < intMin) isValidArray = false;
            if (abilities[i] === "WIS" && roll < wisMin) isValidArray = false;
            if (abilities[i] === "CHA" && roll < chaMin) isValidArray = false;
        }

        // If ability scores are valid, generate race first, then check hit points
        if (isValidArray) {
            // Generate race early so we can use it for HP calculation
            const tempRace = rollRace();
            const conModifier = results.find(r => r.ability === "CON").modifier;
            const hitPoints = calculateHitPoints(conModifier, tempRace);
            
            // If character has less than 1 HP, they don't become an adventurer - reroll
            if (hitPoints.total < 1) {
                isValidArray = false;
            }
            
            // Check if character has at least one ability score of 9 or above
            const hasHighAbility = results.some(r => r.roll >= 9);
            if (!hasHighAbility) {
                isValidArray = false;
            }
            
            // Check "Tough Guys" mode requirements if enabled
            const toughGuysEnabled = document.getElementById('toughGuys') && document.getElementById('toughGuys').checked;
            if (toughGuysEnabled) {
                // Must have at least one of STR, DEX, INT, WIS at 13 or above
                const hasToughAbility = results.some(r => 
                    (r.ability === "STR" || r.ability === "DEX" || r.ability === "INT" || r.ability === "WIS") && 
                    r.roll >= 13
                );
                
                // Must have at least 2 HP
                const hasEnoughHP = hitPoints.total >= 2;
                
                if (!hasToughAbility || !hasEnoughHP) {
                    isValidArray = false;
                }
            }
        }
    } while (!isValidArray);

    // Generate 0-level character details (we know HP is at least 1 now)
    const race = rollRace();
    const name = getRandomName(race);
    const conModifier = results.find(r => r.ability === "CON").modifier;
    const dexModifier = results.find(r => r.ability === "DEX").modifier;
    const hitPoints = calculateHitPoints(conModifier, race);
    
    // Get background based on hit points (capped at 4, minimum 1)
    const background = getBackgroundByHitPoints(hitPoints.total);
    const armorClass = calculateArmorClass(background.armor, dexModifier);

    // Roll 3d6 for starting gold
    const startingGold = roll3d6();
    
    return {
        results,
        background,
        race,
        name,
        hitPoints,
        armorClass,
        startingGold,
        total: results.reduce((sum, r) => sum + r.modifier, 0)
    };
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        abilities,
        calculateHitPoints,
        getBackgroundByHitPoints,
        calculateArmorClass,
        generateSingleCharacter
    };
}
