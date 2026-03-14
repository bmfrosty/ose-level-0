/**
 * 0level-ui.js
 * UI logic and display functions for 0-level character generator
 */

// Import character generation functions
import {
    generate0LevelCharacter,
    getCurrentCharacter,
    getRerollCount
} from './0level-character-gen.js';
import { getModifierEffects } from './shared-modifier-effects.js';

/**
 * Convert internal _RACE name to display name
 * @param {string} raceName - Race name with _RACE suffix
 * @returns {string} Display name without suffix
 */
function getRaceDisplayName(raceName) {
    if (raceName && raceName.endsWith("_RACE")) {
        return raceName.replace("_RACE", "");
    }
    return raceName || "Unknown";
}

/**
 * Display a 0-level character
 * @param {Array} results - Array of ability score objects
 * @param {number} total - Total of all modifiers
 * @param {Object} background - Background object
 * @param {Object} hitPoints - Hit points object
 * @param {number} armorClass - Armor class
 * @param {string} race - Character race (with _RACE suffix)
 * @param {string} name - Character name
 * @param {number} startingGold - Starting gold
 */
export function display0LevelCharacter(results, total, background, hitPoints, armorClass, race, name, startingGold) {
    // Convert race name for display
    const displayRace = getRaceDisplayName(race);
    // Get the minimum values from the input fields
    const strMin = parseInt(document.getElementById('strMin').value) || 3;
    const dexMin = parseInt(document.getElementById('dexMin').value) || 3;
    const conMin = parseInt(document.getElementById('conMin').value) || 3;
    const intMin = parseInt(document.getElementById('intMin').value) || 3;
    const wisMin = parseInt(document.getElementById('wisMin').value) || 3;
    const chaMin = parseInt(document.getElementById('chaMin').value) || 3;

    // Check if Advanced mode is enabled
    const advancedCheckbox = document.getElementById('advanced');
    const isAdvanced = advancedCheckbox ? advancedCheckbox.checked : false;
    
    // Get current character for saving throws and attack bonus
    const currentCharacter = getCurrentCharacter();
    const rerollCount = getRerollCount();
    
    // Import getRacialAbilities from global scope
    const getRacialAbilities = window.getRacialAbilities;
    
    // Build HTML for successful adventurer character - PDF-like layout (balanced for printing)
    let resultHtml = `
            <h2 style='text-align: left; margin: 8px 0; font-size: 1.4em;'>${isAdvanced ? 'OLD-SCHOOL ESSENTIALS ADVANCED' : 'OLD-SCHOOL ESSENTIALS'}</h2>
            <p style='margin: 2px 0; font-size: 0.95em;'>RETRO ADVENTURE GAME</p>
            <hr style='margin: 8px 0;'>
            
            <div style='margin: 12px 0;'>
                <p style='margin: 4px 0;'><strong>Character Name:</strong> ${name || 'Unknown'}</p>
                <p style='margin: 4px 0;'><strong>Race:</strong> ${displayRace} | <strong>Level:</strong> 0 | <strong>Occupation:</strong> ${background.profession} | <strong>HD:</strong> 1d4</p>
            </div>
            
            <h3 style='margin: 10px 0; font-size: 1.15em;'>COMBAT</h3>
            <div style='display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 12px;'>
                <div style='border: 1px solid #000; padding: 6px; text-align: center; font-size: 0.9em;'>
                    <strong>MAX HP</strong><br>${Math.max(1, hitPoints.total)}
                </div>
                <div style='border: 1px solid #000; padding: 6px; text-align: center; font-size: 0.9em;'>
                    <strong>CUR HP</strong><br>___
                </div>
                <div style='border: 1px solid #000; padding: 6px; text-align: center; font-size: 0.9em;'>
                    <strong>INIT</strong><br>${results.find(r => r.ability === "DEX").modifier >= 0 ? '+' : ''}${results.find(r => r.ability === "DEX").modifier}
                </div>
                <div style='border: 1px solid #000; padding: 6px; text-align: center; font-size: 0.9em;'>
                    <strong>AC</strong><br>${armorClass}
                </div>
            </div>
            
            <h3 style='margin: 10px 0; font-size: 1.15em;'>ABILITY SCORES</h3>
            <table style='width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 0.9em;'>
                <tr style='background-color: #f0f0f0;'>
                    <th style='border: 1px solid #000; padding: 5px; text-align: center;'>Ability</th>
                    <th style='border: 1px solid #000; padding: 5px; text-align: center;'>Score</th>
                    <th style='border: 1px solid #000; padding: 5px; text-align: left;'>Effects</th>
                </tr>`;
    
    for (let result of results) {
        const effects = getModifierEffects(result.ability, result.modifier, result.roll);
        resultHtml += `
                <tr>
                    <td style='border: 1px solid #000; padding: 5px; text-align: center;'><strong>${result.ability}</strong></td>
                    <td style='border: 1px solid #000; padding: 5px; text-align: center;'>${result.roll}${result.originalRoll !== undefined && result.originalRoll !== result.roll ? ` (${result.originalRoll})` : ''}</td>
                    <td style='border: 1px solid #000; padding: 5px;'>${effects}</td>
                </tr>`;
    }
    
    resultHtml += `
            </table>
            
            <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 12px;'>
                <div>
                    <h3 style='margin: 10px 0; font-size: 1.15em;'>WEAPONS AND SKILLS</h3>
                    <div style='border: 1px solid #000; padding: 9px; min-height: 65px; font-size: 0.9em;'>
                        <p style='margin: 4px 0;'><strong>Weapon:</strong> ${background.weapon}</p>
                        <p style='margin: 4px 0;'><strong>Attack Bonus:</strong> ${currentCharacter.attackBonus !== undefined ? (currentCharacter.attackBonus >= 0 ? '+' + currentCharacter.attackBonus : currentCharacter.attackBonus) : '+0'} (0-level)</p>
                    </div>
                    
                    <h3 style='margin: 10px 0; font-size: 1.15em;'>RACIAL ABILITIES</h3>
                    <div style='border: 1px solid #000; padding: 9px; min-height: 65px; font-size: 0.9em;'>`;
    
    const racialAbilities = getRacialAbilities(race);
    if (racialAbilities && racialAbilities.length > 0) {
        resultHtml += `<ul style='margin: 0; padding-left: 20px;'>`;
        for (let ability of racialAbilities) {
            resultHtml += `<li>${ability}</li>`;
        }
        resultHtml += `</ul>`;
    } else {
        resultHtml += `<p>None</p>`;
    }
    
    resultHtml += `
                    </div>
                </div>
                
                <div>
                    <h3 style='margin: 10px 0; font-size: 1.15em;'>SAVING THROWS</h3>
                    <div style='display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; margin-bottom: 12px; font-size: 0.9em;'>
                        <div style='border: 1px solid #000; padding: 4px; text-align: center;'><strong>Death</strong><br>${currentCharacter.savingThrows ? currentCharacter.savingThrows.Death : 14}</div>
                        <div style='border: 1px solid #000; padding: 4px; text-align: center;'><strong>Wands</strong><br>${currentCharacter.savingThrows ? currentCharacter.savingThrows.Wands : 15}</div>
                        <div style='border: 1px solid #000; padding: 4px; text-align: center;'><strong>Petrify</strong><br>${currentCharacter.savingThrows ? currentCharacter.savingThrows.Paralysis : 16}</div>
                        <div style='border: 1px solid #000; padding: 4px; text-align: center;'><strong>Breath</strong><br>${currentCharacter.savingThrows ? currentCharacter.savingThrows.Breath : 17}</div>
                        <div style='border: 1px solid #000; padding: 4px; text-align: center;'><strong>Spells</strong><br>${currentCharacter.savingThrows ? currentCharacter.savingThrows.Spells : 18}</div>
                    </div>
                    
                    <h3 style='margin: 10px 0; font-size: 1.15em;'>EQUIPMENT</h3>
                    <div style='border: 1px solid #000; padding: 9px; min-height: 110px; font-size: 0.9em;'>
                        <p style='margin: 4px 0;'><strong>Armor:</strong> ${background.armor}</p>
                        <p style='margin: 4px 0;'><strong>Item(s):</strong></p>
                        <ul style='margin: 4px 0; padding-left: 20px;'>`;
    
    const items = Array.isArray(background.item) ? background.item : [background.item];
    for (let item of items) {
        resultHtml += `<li>${item}</li>`;
    }
    
    resultHtml += `
                        </ul>
                        <p><strong>Starting AC:</strong> ${armorClass}</p>
                        <p><strong>Starting Gold:</strong> ${startingGold || 0} gp</p>
                    </div>
                </div>
            </div>
            
            <hr style='margin-top: 20px;'>
            <p style='font-size: 0.9em;'><strong>Generation Info:</strong> Total Modifiers: ${total} | Attempts: ${rerollCount} | Minimums: STR ${strMin}, DEX ${dexMin}, CON ${conMin}, INT ${intMin}, WIS ${wisMin}, CHA ${chaMin}</p>
    `;

    // Check if we should open in new tab
    const openInNewTabCheckbox = document.getElementById('openInNewTab');
    const openInNewTab = openInNewTabCheckbox ? openInNewTabCheckbox.checked : false;
    
    if (openInNewTab) {
        // Open in new tab
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${name} - OSE 0-Level Character</title>
            </head>
            <body>
                ${resultHtml}
            </body>
            </html>
        `);
        newWindow.document.close();
        
        // Clear the result div on main page
        document.getElementById('result').innerHTML = '<p style="text-align: center;">Character opened in new tab.</p>';
    } else {
        // Display in current page
        document.getElementById('result').innerHTML = resultHtml;
    }
}

/**
 * Set race selection and generate character
 * @param {string} race - Race to generate ('', 'Demihuman', or specific race)
 */
export function setRaceAndGenerate(race) {
    document.getElementById('forceRace').value = race === 'Demihuman' ? '' : race;
    document.getElementById('forceDemihuman').checked = race === 'Demihuman';
    generate0LevelCharacter();
}

/**
 * Set race selection and generate PNG
 * @param {string} race - Race to generate
 */
export function setRaceAndGeneratePNG(race) {
    document.getElementById('forceRace').value = race === 'Demihuman' ? '' : race;
    document.getElementById('forceDemihuman').checked = race === 'Demihuman';
    if (typeof window.generateCanvasPNG !== 'undefined') {
        window.generateCanvasPNG();
    }
}

/**
 * Set race selection and generate PDF
 * @param {string} race - Race to generate
 */
export function setRaceAndGeneratePDF(race) {
    document.getElementById('forceRace').value = race === 'Demihuman' ? '' : race;
    document.getElementById('forceDemihuman').checked = race === 'Demihuman';
    if (typeof window.generateCanvasPDF !== 'undefined') {
        window.generateCanvasPDF();
    }
}

/**
 * Set race selection and generate bulk PDF
 * @param {string} race - Race to generate
 */
export function setRaceAndGenerateBulkPDF(race) {
    document.getElementById('forceRace').value = race === 'Demihuman' ? '' : race;
    document.getElementById('forceDemihuman').checked = race === 'Demihuman';
    if (typeof window.generateCanvasBulkPDF !== 'undefined') {
        window.generateCanvasBulkPDF();
    }
}

/**
 * Set race selection and generate JSON
 * @param {string} race - Race to generate
 */
export function setRaceAndGenerateJSON(race) {
    document.getElementById('forceRace').value = race === 'Demihuman' ? '' : race;
    document.getElementById('forceDemihuman').checked = race === 'Demihuman';
    if (typeof window.generateJSON !== 'undefined') {
        window.generateJSON();
    }
}

/**
 * Set race selection and generate count JSON
 * @param {string} race - Race to generate
 * @param {number} count - Number of characters to generate
 */
export function setRaceAndGenerateCountJSON(race, count) {
    document.getElementById('forceRace').value = race === 'Demihuman' ? '' : race;
    document.getElementById('forceDemihuman').checked = race === 'Demihuman';
    if (typeof window.generateCountJSON !== 'undefined') {
        window.generateCountJSON(count);
    }
}

/**
 * Set race selection and generate Markdown
 * @param {string} race - Race to generate
 */
export function setRaceAndGenerateMarkdown(race) {
    document.getElementById('forceRace').value = race === 'Demihuman' ? '' : race;
    document.getElementById('forceDemihuman').checked = race === 'Demihuman';
    if (typeof window.generateMarkdown !== 'undefined') {
        window.generateMarkdown();
    }
}

/**
 * Initialize the 0-level UI
 * Sets up event handlers and generates initial character
 */
export function initialize() {
    // Make display function available globally for backward compatibility
    window.display0LevelCharacter = display0LevelCharacter;
    
    // Make button handler functions available globally
    window.setRaceAndGenerate = setRaceAndGenerate;
    window.setRaceAndGeneratePNG = setRaceAndGeneratePNG;
    window.setRaceAndGeneratePDF = setRaceAndGeneratePDF;
    window.setRaceAndGenerateBulkPDF = setRaceAndGenerateBulkPDF;
    window.setRaceAndGenerateJSON = setRaceAndGenerateJSON;
    window.setRaceAndGenerateCountJSON = setRaceAndGenerateCountJSON;
    window.setRaceAndGenerateMarkdown = setRaceAndGenerateMarkdown;
    
    // Generate initial character on page load with a small delay
    // This ensures all legacy scripts have finished loading
    setTimeout(() => {
        generate0LevelCharacter();
    }, 100);
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
}
