// Main character generation logic

function generate0LevelCharacter() {
    rerollCount++; // Increment the counter on every call

    let total = 0;
    let results = [];
    let isValidArray = true;

    const strMin = parseInt(document.getElementById('strMin').value) || 3;
    const dexMin = parseInt(document.getElementById('dexMin').value) || 3;
    const conMin = parseInt(document.getElementById('conMin').value) || 3;
    const intMin = parseInt(document.getElementById('intMin').value) || 3;
    const wisMin = parseInt(document.getElementById('wisMin').value) || 3;
    const chaMin = parseInt(document.getElementById('chaMin').value) || 3;

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

    // If any roll fails to meet the minimums, reroll
    if (!isValidArray) {
        generate0LevelCharacter();
        return;
    }

    // Generate race early (before HP calculation)
    const race = rollRace();
    
    // Check if Advanced mode is enabled
    const advancedCheckbox = document.getElementById('advanced');
    const isAdvanced = advancedCheckbox ? advancedCheckbox.checked : false;
    
    // Check if human racial abilities are enabled
    const humanAbilitiesCheckbox = document.getElementById('humanRacialAbilities');
    const humanRacialAbilities = humanAbilitiesCheckbox ? humanAbilitiesCheckbox.checked : true;
    
    // Apply race adjustments if Advanced mode
    const adjustedResults = applyRaceAdjustments(results, race, isAdvanced, humanRacialAbilities);
    
    // Check race minimums if Advanced mode
    if (!meetsRaceMinimums(adjustedResults, race, isAdvanced)) {
        generate0LevelCharacter();
        return;
    }
    
    // Generate 0-level character details (use adjusted results)
    const conModifier = adjustedResults.find(r => r.ability === "CON").modifier;
    const dexModifier = adjustedResults.find(r => r.ability === "DEX").modifier;
    const hitPoints = calculateHitPoints(conModifier, race);
    
    // If character has less than 1 HP, they don't become an adventurer - reroll automatically
    if (hitPoints.total < 1) {
        generate0LevelCharacter();
        return;
    }
    
    // Check if character has at least one ability score of 9 or above
    const hasHighAbility = results.some(r => r.roll >= 9);
    if (!hasHighAbility) {
        generate0LevelCharacter();
        return;
    }
    
    // Check "Tough Guys" mode requirements if enabled
    const toughGuysEnabled = document.getElementById('toughGuys').checked;
    if (toughGuysEnabled) {
        // Must have at least one of STR, DEX, INT, WIS at 13 or above
        const hasToughAbility = results.some(r => 
            (r.ability === "STR" || r.ability === "DEX" || r.ability === "INT" || r.ability === "WIS") && 
            r.roll >= 13
        );
        
        // Must have at least 2 HP
        const hasEnoughHP = hitPoints.total >= 2;
        
        if (!hasToughAbility || !hasEnoughHP) {
            generate0LevelCharacter();
            return;
        }
    }
    
    // Get background based on hit points (capped at 4, minimum 1)
    const background = getBackgroundByHitPoints(hitPoints.total);
    const armorClass = calculateArmorClass(background.armor, dexModifier);

    // Generate name (race already determined above)
    const name = getRandomName(race);

    // Roll 3d6 for starting gold
    const startingGold = roll3d6();
    
    // Check if Gygar mode is enabled
    const gygarCheckbox = document.getElementById('gygar');
    const isGygar = gygarCheckbox ? gygarCheckbox.checked : true;
    
    // Calculate saving throws and attack bonus
    const conScore = adjustedResults.find(r => r.ability === "CON").roll;
    const savingThrows = calculateSavingThrows(0, race, conScore, isAdvanced, isGygar);
    const attackBonus = calculateAttackBonus(0, race, isAdvanced, isGygar);

    // Store character data for PDF generation (use adjusted results)
    currentCharacter = {
        results: adjustedResults,
        total: adjustedResults.reduce((sum, r) => sum + r.modifier, 0),
        background: background,
        hitPoints: hitPoints,
        armorClass: armorClass,
        race: race,
        name: name,
        startingGold: startingGold,
        level: 0,
        attackBonus: attackBonus,
        savingThrows: savingThrows
    };

    // Display results if all rolls are valid (use adjusted results)
    const adjustedTotal = adjustedResults.reduce((sum, r) => sum + r.modifier, 0);
    display0LevelCharacter(adjustedResults, adjustedTotal, background, hitPoints, armorClass, race, name, startingGold);
}

// Auto-generate character on page load
window.onload = function() {
    // Generate a random character on page load
    generate0LevelCharacter();
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generate0LevelCharacter
    };
}
