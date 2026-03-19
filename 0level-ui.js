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
import { getAdvancedModeRacialAbilities } from './shared-racial-abilities.js';
import {
    generateCanvasPNG,
    generateCanvasPDF,
    generateCanvasBulkPDF,
    generateMarkdown,
    generateJSON,
    generateCountJSON
} from './canvas-generator.js';

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
    
    // CSS helper strings
    const sectionHeader = `background-color: #000; color: #fff; padding: 4px 8px; font-weight: bold; font-size: 0.9em; letter-spacing: 0.05em;`;
    const box = `border: 1px solid #000; padding: 8px; font-size: 0.9em;`;
    const statBox = `border: 1px solid #000; padding: 6px; text-align: center; font-size: 0.85em;`;

    // Build HTML character sheet matching PDF canvas layout
    let resultHtml = `
        <div style='font-family: Arial, sans-serif; max-width: 760px;'>

        <!-- Header -->
        <div style='margin-bottom: 8px;'>
            <div style='font-size: 1.3em; font-weight: bold;'>${isAdvanced ? 'OLD-SCHOOL ESSENTIALS ADVANCED' : 'OLD-SCHOOL ESSENTIALS'}</div>
            <div style='font-size: 0.85em; color: #444;'>RETRO ADVENTURE GAME</div>
            <hr style='margin: 6px 0; border-color: #000;'>
            <div style='display: grid; grid-template-columns: 3fr 2fr 3fr 1fr 1fr; gap: 0; font-size: 0.85em;'>
                <div style='border: 1px solid #000; padding: 4px 8px;'>
                    <div style='font-weight: bold; font-size: 0.75em; color: #666; text-transform: uppercase;'>Character Name</div>
                    <div>${name || 'Unknown'}</div>
                </div>
                <div style='border: 1px solid #000; border-left: none; padding: 4px 8px;'>
                    <div style='font-weight: bold; font-size: 0.75em; color: #666; text-transform: uppercase;'>Race &amp; Class</div>
                    <div>${displayRace}</div>
                </div>
                <div style='border: 1px solid #000; border-left: none; padding: 4px 8px;'>
                    <div style='font-weight: bold; font-size: 0.75em; color: #666; text-transform: uppercase;'>Occupation</div>
                    <div>${background.profession}</div>
                </div>
                <div style='border: 1px solid #000; border-left: none; padding: 4px 8px; text-align: center;'>
                    <div style='font-weight: bold; font-size: 0.75em; color: #666; text-transform: uppercase;'>HD</div>
                    <div>1d4</div>
                </div>
                <div style='border: 1px solid #000; border-left: none; padding: 4px 8px; text-align: center;'>
                    <div style='font-weight: bold; font-size: 0.75em; color: #666; text-transform: uppercase;'>Level</div>
                    <div>0</div>
                </div>
            </div>
        </div>

        <!-- COMBAT -->
        <div style='${sectionHeader}'>COMBAT</div>
        <div style='display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin-bottom: 8px;'>
            <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>MAX HP</div>${Math.max(1, hitPoints.total)}</div>
            <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>CUR HP</div>&nbsp;</div>
            <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>INIT</div>${results.find(r => r.ability === "DEX").modifier >= 0 ? '+' : ''}${results.find(r => r.ability === "DEX").modifier}</div>
            <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>AC</div>&nbsp;</div>
        </div>

        <!-- Two column layout -->
        <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 8px;'>

            <!-- LEFT COLUMN -->
            <div>
                <!-- ABILITY SCORES -->
                <div style='${sectionHeader}'>ABILITY SCORES</div>
                <table style='width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 0.85em;'>
                    <tr style='background-color: #eee;'>
                        <th style='border: 1px solid #000; padding: 3px 6px; text-align: center; width: 20%;'>Ability</th>
                        <th style='border: 1px solid #000; padding: 3px 6px; text-align: center; width: 15%;'>Score</th>
                        <th style='border: 1px solid #000; padding: 3px 6px; text-align: left;'>Effects</th>
                    </tr>`;

    for (let result of results) {
        const effects = getModifierEffects(result.ability, result.modifier, result.roll);
        const scoreDisplay = (result.originalRoll !== undefined && result.originalRoll !== result.roll)
            ? `<span style='text-decoration:line-through; color:#999; font-size:0.85em; margin-right:4px;'>${result.originalRoll}</span>${result.roll}`
            : `${result.roll}`;
        resultHtml += `
                    <tr>
                        <td style='border: 1px solid #000; padding: 3px 6px; text-align: center; font-weight: bold;'>${result.ability}</td>
                        <td style='border: 1px solid #000; padding: 3px 6px; text-align: center;'>${scoreDisplay}</td>
                        <td style='border: 1px solid #000; padding: 3px 6px;'>${effects}</td>
                    </tr>`;
    }

    const attackBonusDisplay = currentCharacter.attackBonus !== undefined
        ? (currentCharacter.attackBonus >= 0 ? '+' + currentCharacter.attackBonus : currentCharacter.attackBonus)
        : '+0';
    const racialAbilities = getAdvancedModeRacialAbilities(race);

    resultHtml += `
                </table>

                <!-- WEAPONS AND SKILLS -->
                <div style='${sectionHeader}'>WEAPONS AND SKILLS</div>
                <div style='${box} margin-bottom: 8px; min-height: 60px;'>
                    <div><strong>Weapon:</strong> ${background.weapon}</div>
                    <div style='margin-top: 4px;'><strong>Attack Bonus:</strong> ${attackBonusDisplay} (0-level)</div>
                </div>

                <!-- RACIAL ABILITIES -->
                <div style='${sectionHeader}'>RACIAL ABILITIES</div>
                <div style='${box} min-height: 80px;'>`;

    if (racialAbilities && racialAbilities.length > 0) {
        resultHtml += `<ul style='margin: 0; padding-left: 18px;'>`;
        for (let ability of racialAbilities) {
            resultHtml += `<li style='margin-bottom: 2px;'>${ability}</li>`;
        }
        resultHtml += `</ul>`;
    } else {
        resultHtml += `<span style='color: #666;'>None</span>`;
    }

    const items = Array.isArray(background.item) ? background.item : [background.item];
    const saves = currentCharacter.savingThrows;

    resultHtml += `
                </div>
            </div>

            <!-- RIGHT COLUMN -->
            <div>
                <!-- SAVING THROWS -->
                <div style='${sectionHeader}'>SAVING THROWS</div>
                <div style='display: grid; grid-template-columns: repeat(5, 1fr); gap: 0; margin-bottom: 8px;'>
                    <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>Death</div>${saves ? saves.Death : 14}</div>
                    <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>Wands</div>${saves ? saves.Wands : 15}</div>
                    <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>Petrify</div>${saves ? saves.Paralysis : 16}</div>
                    <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>Breath</div>${saves ? saves.Breath : 17}</div>
                    <div style='${statBox}'><div style='font-weight:bold; font-size:0.8em;'>Spells</div>${saves ? saves.Spells : 18}</div>
                </div>

                <!-- EQUIPMENT AND ITEMS -->
                <div style='${sectionHeader}'>EQUIPMENT AND ITEMS</div>
                <div style='${box} margin-bottom: 8px;'>
                    <div><strong>Armor:</strong> ${background.armor}</div>
                    <div style='margin-top: 4px;'><strong>Items:</strong>
                        <ul style='margin: 2px 0; padding-left: 18px;'>`;

    for (let item of items) {
        resultHtml += `<li>${item}</li>`;
    }

    resultHtml += `
                        </ul>
                    </div>
                    <div style='border-top: 1px solid #ccc; margin-top: 6px; padding-top: 4px; line-height: 1.8em;'>
                        &nbsp;<br>&nbsp;<br>&nbsp;
                    </div>
                    <div style='margin-top: 4px; border-top: 1px solid #ccc; padding-top: 4px;'><strong>Starting AC:</strong> ${armorClass} &nbsp; <strong>Starting Gold:</strong> ${startingGold || 0} gp</div>
                </div>

                <!-- CLASS ABILITIES -->
                <div style='${sectionHeader}'>CLASS ABILITIES</div>
                <div style='${box} margin-bottom: 8px; min-height: 40px; color: #666;'>
                    None (0-level)
                </div>

                <!-- TREASURE -->
                <div style='${sectionHeader}'>TREASURE</div>
                <div style='${box} margin-bottom: 4px; line-height: 2em;'>
                    &nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;
                </div>
                <table style='width: 100%; border-collapse: collapse; font-size: 0.85em;'>`;

    for (let coin of ['PP', 'GP', 'EP', 'SP', 'CP']) {
        resultHtml += `
                    <tr>
                        <td style='background-color: #000; color: #fff; padding: 3px 8px; font-weight: bold; width: 40px;'>${coin}</td>
                        <td style='border: 1px solid #000; border-left: none; padding: 3px;'>&nbsp;</td>
                    </tr>`;
    }

    resultHtml += `
                </table>
            </div>
        </div>

        <!-- Footer -->
        <hr style='margin-top: 12px; border-color: #ccc;'>
        <p style='font-size: 0.8em; color: #666; margin: 4px 0;'>
            Total Modifiers: ${total} | Attempts: ${rerollCount} | Minimums: STR ${strMin}, DEX ${dexMin}, CON ${conMin}, INT ${intMin}, WIS ${wisMin}, CHA ${chaMin}
        </p>
        </div>
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
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                </style>
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
    generateCanvasPNG();
}

/**
 * Set race selection and generate PDF
 * @param {string} race - Race to generate
 */
export function setRaceAndGeneratePDF(race) {
    document.getElementById('forceRace').value = race === 'Demihuman' ? '' : race;
    document.getElementById('forceDemihuman').checked = race === 'Demihuman';
    generateCanvasPDF();
}

/**
 * Set race selection and generate bulk PDF
 * @param {string} race - Race to generate
 */
export function setRaceAndGenerateBulkPDF(race) {
    document.getElementById('forceRace').value = race === 'Demihuman' ? '' : race;
    document.getElementById('forceDemihuman').checked = race === 'Demihuman';
    generateCanvasBulkPDF();
}

/**
 * Set race selection and generate JSON
 * @param {string} race - Race to generate
 */
export function setRaceAndGenerateJSON(race) {
    document.getElementById('forceRace').value = race === 'Demihuman' ? '' : race;
    document.getElementById('forceDemihuman').checked = race === 'Demihuman';
    generateJSON();
}

/**
 * Set race selection and generate count JSON
 * @param {string} race - Race to generate
 * @param {number} count - Number of characters to generate
 */
export function setRaceAndGenerateCountJSON(race, count) {
    document.getElementById('forceRace').value = race === 'Demihuman' ? '' : race;
    document.getElementById('forceDemihuman').checked = race === 'Demihuman';
    generateCountJSON(count);
}

/**
 * Set race selection and generate Markdown
 * @param {string} race - Race to generate
 */
export function setRaceAndGenerateMarkdown(race) {
    document.getElementById('forceRace').value = race === 'Demihuman' ? '' : race;
    document.getElementById('forceDemihuman').checked = race === 'Demihuman';
    generateMarkdown();
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
