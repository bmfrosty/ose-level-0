t// Character display functions

function display0LevelCharacter(results, total, background, hitPoints, armorClass, race, name, startingGold) {
    // Get the minimum values from the input fields
    const strMin = parseInt(document.getElementById('strMin').value) || 3;
    const dexMin = parseInt(document.getElementById('dexMin').value) || 3;
    const conMin = parseInt(document.getElementById('conMin').value) || 3;
    const intMin = parseInt(document.getElementById('intMin').value) || 3;
    const wisMin = parseInt(document.getElementById('wisMin').value) || 3;
    const chaMin = parseInt(document.getElementById('chaMin').value) || 3;

    // All characters passed to this function are guaranteed to be valid adventurers
    // due to automatic rerolling in main-generator.js (lines 48-51: rerolls if hitPoints.total < 1)
    
    // Build HTML for successful adventurer character
    let resultHtml = `
        <h2 style='text-align: center;'>0-Level Character</h2>
        <div style='text-align: center; margin-bottom: 20px;'>
            <h3>Name: ${name || 'Unknown'}</h3>
            <h3>Race: ${race || 'Human'}</h3>
            <h3>Occupation: ${background.profession}</h3>
            <h3>Hit Points: ${Math.max(1, hitPoints.total)}</h3>
            <p>Hit Point Roll: ${hitPoints.roll} + CON modifier (${results.find(r => r.ability === "CON").modifier}) = ${hitPoints.total}${hitPoints.total < 1 ? ' (minimum 1)' : ''}</p>
        </div>
    `;

    // Build HTML for the results table with modifier effects
    resultHtml += "<table><tr><th>Ability</th><th>Roll</th><th>Modifier</th><th>Effects</th></tr>";
    for (let result of results) {
        const effects = getModifierEffects(result.ability, result.modifier, result.roll);
        resultHtml += `<tr><td>${result.ability}</td><td>${result.roll}</td><td>${result.modifier}</td><td style='text-align: left; padding-left: 10px;'>${effects}</td></tr>`;
    }
    resultHtml += "</table>";

    // Display equipment and combat info
    resultHtml += `
        <div style='text-align: center; margin-top: 20px;'>
            <h3>Equipment & Combat</h3>
            <p><strong>Armor:</strong> ${background.armor}</p>
            <p><strong>Armor Class:</strong> ${armorClass}</p>
            <p><strong>Weapon:</strong> ${background.weapon}</p>
            <p><strong>Item(s):</strong> ${Array.isArray(background.item) ? background.item.join(', ') : background.item}</p>
            <p><strong>Starting Gold:</strong> ${startingGold || 'Not rolled'} gp</p>
            <p><strong>Attack Bonus:</strong> +0</p>
            <p><strong>Saving Throws:</strong> As Normal Human</p>
    `;
    
    // Add racial abilities if not human
    const racialAbilities = getRacialAbilities(race);
    if (racialAbilities && racialAbilities.length > 0) {
        resultHtml += `<p><strong>Racial Abilities:</strong></p><ul style='text-align: left; display: inline-block;'>`;
        for (let ability of racialAbilities) {
            resultHtml += `<li>${ability}</li>`;
        }
        resultHtml += `</ul>`;
    }
    
    resultHtml += `</div>`;

    // Display the minimum values used and generation info
    resultHtml += `
        <h3 style='text-align: center;'>Total Modifiers Combined: ${total}</h3>
        <p style='text-align: center;'>It took <strong>${rerollCount}</strong> attempts to generate valid scores.</p>
        <p style='text-align: center;'>Minimum values used: <br>
            <strong>STR:</strong> ${strMin}, 
            <strong>DEX:</strong> ${dexMin}, 
            <strong>CON:</strong> ${conMin}, <br>
            <strong>INT:</strong> ${intMin}, 
            <strong>WIS:</strong> ${wisMin}, 
            <strong>CHA:</strong> ${chaMin}.
        </p>`;

    // Display the final results
    document.getElementById('result').innerHTML = resultHtml;

    // Reset reroll counter for the next generation
    rerollCount = 0;
}
