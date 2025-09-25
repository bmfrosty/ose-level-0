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

    // Generate 0-level character details
    const conModifier = results.find(r => r.ability === "CON").modifier;
    const dexModifier = results.find(r => r.ability === "DEX").modifier;
    const hitPoints = calculateHitPoints(conModifier);
    
    // Get background based on hit points (capped at 4, minimum 1)
    const background = getBackgroundByHitPoints(hitPoints.total);
    const armorClass = calculateArmorClass(background.armor, dexModifier);

    // Generate race and name
    const race = rollRace();
    const name = getRandomName(race);

    // Roll 3d6 for starting gold
    const startingGold = roll3d6();

    // Store character data for PDF generation
    currentCharacter = {
        results: results,
        total: total,
        background: background,
        hitPoints: hitPoints,
        armorClass: armorClass,
        race: race,
        name: name,
        startingGold: startingGold
    };

    // Display results if all rolls are valid
    display0LevelCharacter(results, total, background, hitPoints, armorClass, race, name, startingGold);
}

// Auto-generate character on page load
window.onload = function() {
    document.getElementById('generateButton').click();
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generate0LevelCharacter
    };
}
