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
    generateMarkdown,
    generateJSON,
    generateCountJSON
} from './canvas-generator.js';
import { displayCharacterSheet } from './shared-character-sheet.js';

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
    const displayRace = getRaceDisplayName(race);
    const strMin = parseInt(document.getElementById('strMin').value) || 3;
    const dexMin = parseInt(document.getElementById('dexMin').value) || 3;
    const conMin = parseInt(document.getElementById('conMin').value) || 3;
    const intMin = parseInt(document.getElementById('intMin').value) || 3;
    const wisMin = parseInt(document.getElementById('wisMin').value) || 3;
    const chaMin = parseInt(document.getElementById('chaMin').value) || 3;
    const advancedCheckbox = document.getElementById('advanced');
    const isAdvanced = advancedCheckbox ? advancedCheckbox.checked : false;
    const currentCharacter = getCurrentCharacter();
    const rerollCount = getRerollCount();
    const saves = currentCharacter.savingThrows || {};
    const racialAbilities = getAdvancedModeRacialAbilities(race);
    const items = Array.isArray(background.item) ? background.item : [background.item];
    const sanitize = (str) => (str || '').replace(/[/\\?%*:|"<>]/g, '-').trim();
    const modeLabel = isAdvanced ? 'Advanced' : 'Basic';

    // Build normalized sheet object for shared renderer
    const sheet = {
        title: isAdvanced ? 'OLD-SCHOOL ESSENTIALS ADVANCED' : 'OLD-SCHOOL ESSENTIALS',
        subtitle: 'RETRO ADVENTURE GAME',
        header: {
            columns: [
                { label: 'Character Name', value: name || 'Unknown', flex: 3 },
                { label: 'Race & Class', value: displayRace, flex: 2 },
                { label: 'Occupation', value: background.profession, flex: 3 },
                { label: 'HD', value: '1d4', flex: 1, center: true },
                { label: 'Level', value: '0', flex: 1, center: true }
            ]
        },
        combat: {
            maxHP: Math.max(1, hitPoints.total),
            initMod: results.find(r => r.ability === 'DEX').modifier
        },
        abilityScores: results.map(r => ({
            name: r.ability,
            score: r.roll,
            originalScore: (r.originalRoll !== undefined && r.originalRoll !== r.roll) ? r.originalRoll : null,
            effects: getModifierEffects(r.ability, r.modifier, r.roll)
        })),
        weaponsAndSkills: {
            weapon: background.weapon,
            classAttackBonus: currentCharacter.attackBonus !== undefined ? currentCharacter.attackBonus : 0,
            meleeMod: results.find(r => r.ability === 'STR').modifier,
            rangedMod: results.find(r => r.ability === 'DEX').modifier,
            thiefSkills: null
        },
        abilitiesSection: {
            header: 'RACIAL ABILITIES',
            racial: racialAbilities || [],
            class: []
        },
        savingThrows: {
            death: saves.Death || 14,
            wands: saves.Wands || 15,
            paralysis: saves.Paralysis || 16,
            breath: saves.Breath || 17,
            spells: saves.Spells || 18
        },
        experience: null,
        equipment: {
            armor: background.armor,
            items: items,
            startingAC: armorClass,
            startingGold: startingGold || 0
        },
        spellSlots: null,
        turnUndead: null,
        showUndeadNames: false,
        showQRCode: true,
        // Compact params v2 — used to generate a short QR-friendly URL
        cp: (() => {
            const RACE_TO_CODE = {
                'Human_RACE':'HU','Dwarf_RACE':'DW','Elf_RACE':'EL',
                'Halfling_RACE':'HA','Gnome_RACE':'GN'
            };
            const saves = currentCharacter?.savingThrows || {};
            return {
                v:2, m:'Z',
                r: RACE_TO_CODE[race] || 'HU',
                s: ['STR','DEX','CON','INT','WIS','CHA'].map(a => {
                    const r = results.find(r => r.ability === a);
                    return r ? r.roll : 10;
                }),
                sv: [saves.Death||14, saves.Wands||15, saves.Paralysis||16, saves.Breath||17, saves.Spells||18],
                h: Math.max(1, hitPoints.total),
                n: name || '',
                bg: background.profession || '',
                ar: background.armor || null,
                w: background.weapon || null,
                it: Array.isArray(background.item) ? background.item : (background.item ? [background.item] : []),
                g: startingGold || 0,
                ac: armorClass || 10,
                adv: isAdvanced ? 1 : 0,
                un: 0,
                qr: 1
            };
        })(),
        footer: `Total Modifiers: ${total} | Attempts: ${rerollCount} | Minimums: STR ${strMin}, DEX ${dexMin}, CON ${conMin}, INT ${intMin}, WIS ${wisMin}, CHA ${chaMin}`,
        printTitle: `OSE ${modeLabel} - ${sanitize(displayRace)} - 0-Level - ${sanitize(background.profession)} - ${sanitize(name)}`,
        openInNewTab: document.getElementById('openInNewTab')?.checked || false,
        autoPrint: document.getElementById('autoPrintInNewTab')?.checked || false
    };

    displayCharacterSheet(sheet, document.getElementById('result'), null);
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
