/**
 * advanced-ui.js
 * UI logic, state management, and event handlers for Advanced Mode
 */

import * as ClassDataOSE from './class-data-ose.js';
import * as ClassDataGygar from './class-data-gygar.js';
import * as ClassDataShared from './class-data-shared.js';
import { 
    calculateModifier, 
    formatModifier,
    getRaceDisplayName,
    getClassDisplayName,
    getAvailableClasses
} from './advanced-utils.js';
import {
    rollAbilitiesAdvanced,
    getRacialAbilities,
    createCharacterAdvanced,
    rollHitPoints
} from './advanced-character-gen.js';

// Make modules available globally for debugging
window.ClassDataOSE = ClassDataOSE;
window.ClassDataGygar = ClassDataGygar;
window.ClassDataShared = ClassDataShared;

// State variables
let selectedLevel = null;
let selectedRace = null;
let selectedClass = null;
let smoothifiedMode = true;
let allowNonTraditional = false;
let allowElfSpellbladePast10 = false;
let toughCharacters = false;
let includeLevel0HP = false;

/**
 * Initialize level selection (radio buttons 1-14)
 */
export function initializeLevelSelection() {
    const container = document.getElementById('levelSelection');
    for (let i = 1; i <= 14; i++) {
        const radioDiv = document.createElement('div');
        radioDiv.className = 'level-radio';
        
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'level';
        radio.id = `level${i}`;
        radio.value = i;
        
        // Set level 1 as default
        if (i === 1) {
            radio.checked = true;
            selectedLevel = 1;
        }
        
        const label = document.createElement('label');
        label.htmlFor = `level${i}`;
        label.textContent = i;
        
        radio.addEventListener('change', () => {
            selectedLevel = parseInt(radio.value);
            updateUI();
        });
        
        radioDiv.appendChild(radio);
        radioDiv.appendChild(label);
        container.appendChild(radioDiv);
    }
}

/**
 * Initialize race/class grid
 */
export function initializeRaceClassGrid() {
    const buttons = document.querySelectorAll('.grid-button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.disabled) return;
            
            // Deselect all buttons
            buttons.forEach(b => b.classList.remove('selected'));
            
            // Select clicked button
            button.classList.add('selected');
            selectedRace = button.dataset.race;
            selectedClass = button.dataset.class;
            
            // Add _RACE and _CLASS suffixes
            if (selectedRace && !selectedRace.endsWith('_RACE')) {
                selectedRace = `${selectedRace}_RACE`;
            }
            if (selectedClass && !selectedClass.endsWith('_CLASS')) {
                selectedClass = `${selectedClass}_CLASS`;
            }
            
            updateUI();
        });
    });
}

/**
 * Update UI based on selections
 */
export function updateUI() {
    // Show/hide Spellblade column based on mode
    const spellbladeHeader = document.getElementById('spellbladeHeader');
    const spellbladeButtons = document.querySelectorAll('[data-class="Spellblade"]');
    
    if (smoothifiedMode) {
        spellbladeHeader.style.display = '';
        spellbladeButtons.forEach(btn => {
            btn.parentElement.style.display = '';
        });
    } else {
        spellbladeHeader.style.display = 'none';
        spellbladeButtons.forEach(btn => {
            btn.parentElement.style.display = 'none';
            // Deselect if Spellblade was selected
            if (selectedClass === 'Spellblade_CLASS') {
                selectedClass = null;
                selectedRace = null;
                btn.classList.remove('selected');
            }
        });
    }

    // Enable/disable buttons based on traditional combinations
    const buttons = document.querySelectorAll('.grid-button');
    buttons.forEach(button => {
        const race = button.dataset.race;
        const className = button.dataset.class;
        
        // Get available classes for this race
        const availableClasses = getAvailableClasses(race, allowNonTraditional);
        
        // Check if this combination is available
        const isAvailable = availableClasses.includes(className);
        
        if (isAvailable) {
            button.disabled = false;
        } else {
            button.disabled = true;
            // Deselect if this was selected
            if (selectedRace === `${race}_RACE` && selectedClass === `${className}_CLASS`) {
                selectedRace = null;
                selectedClass = null;
                button.classList.remove('selected');
            }
        }
    });

    // Enable generate button if level, race, and class are selected
    const generateButton = document.getElementById('generateButton');
    generateButton.disabled = !(selectedLevel && selectedRace && selectedClass);
}

/**
 * Initialize all event listeners
 */
export function initializeEventListeners() {
    // Checkbox event listeners
    document.getElementById('smoothifiedMode').addEventListener('change', (e) => {
        smoothifiedMode = e.target.checked;
        updateUI();
    });

    document.getElementById('allowNonTraditional').addEventListener('change', (e) => {
        allowNonTraditional = e.target.checked;
        updateUI();
    });

    document.getElementById('allowElfSpellbladePast10').addEventListener('change', (e) => {
        allowElfSpellbladePast10 = e.target.checked;
    });

    document.getElementById('toughGuys').addEventListener('change', (e) => {
        toughCharacters = e.target.checked;
    });

    document.getElementById('includeLevel0HP').addEventListener('change', (e) => {
        includeLevel0HP = e.target.checked;
    });

    // Button event listeners
    document.getElementById('generateButton').addEventListener('click', generateCharacter);
}

/**
 * Generate character
 */
export function generateCharacter() {
    console.log('\n========================================');
    console.log('GENERATING ADVANCED MODE CHARACTER');
    console.log('========================================\n');
    
    if (!selectedLevel || !selectedRace || !selectedClass) {
        alert('Please select a level, race, and class first!');
        return;
    }
    
    console.log('Level:', selectedLevel);
    console.log('Race:', selectedRace, '(Display:', getRaceDisplayName(selectedRace) + ')');
    console.log('Class:', selectedClass, '(Display:', getClassDisplayName(selectedClass) + ')');
    console.log('Mode:', smoothifiedMode ? 'Smoothified' : 'Normal');
    console.log('Tough Characters:', toughCharacters);
    console.log('Include Level 0 HP:', includeLevel0HP);
    
    // Determine class data module
    const classData = smoothifiedMode ? ClassDataGygar : ClassDataOSE;
    console.log('Using class data:', smoothifiedMode ? 'Gygar (Smoothified)' : 'OSE (Normal)');
    
    // Get minimum scores (always 3 for Advanced Mode)
    const minimumScores = {
        STR: 3,
        INT: 3,
        WIS: 3,
        DEX: 3,
        CON: 3,
        CHA: 3
    };
    
    console.log('\n--- Rolling Ability Scores ---');
    console.log('Minimum scores:', minimumScores);
    console.log('Tough Characters:', toughCharacters);
    
    // Roll ability scores with racial adjustments
    const { baseScores, adjustedScores } = rollAbilitiesAdvanced(
        minimumScores,
        selectedRace,
        selectedClass,
        toughCharacters,
        false // primeRequisite13 - not used in Advanced Mode
    );
    
    console.log('Base scores (before racial adjustments):', baseScores);
    console.log('Adjusted scores (after racial adjustments):', adjustedScores);
    
    // Calculate modifiers from adjusted scores
    const abilityModifiers = {};
    for (const ability in adjustedScores) {
        abilityModifiers[ability] = calculateModifier(adjustedScores[ability]);
    }
    console.log('Ability modifiers (from adjusted scores):', abilityModifiers);
    
    // Roll hit points
    console.log('\n--- Rolling Hit Points ---');
    const conModifier = abilityModifiers.CON;
    console.log('CON modifier:', conModifier);
    console.log('Include Level 0 HP:', includeLevel0HP);
    
    const hp = rollHitPoints(
        selectedClass,
        selectedLevel,
        conModifier,
        classData,
        includeLevel0HP,
        false // healthyCharacters - not used in Advanced Mode
    );
    
    console.log('Total HP:', hp);
    
    // Get racial abilities
    console.log('\n--- Getting Racial Abilities ---');
    const racialAbilities = getRacialAbilities(selectedRace);
    console.log('Racial abilities:', racialAbilities);
    
    // Create character object
    console.log('\n--- Creating Character Object ---');
    const character = createCharacterAdvanced({
        level: selectedLevel,
        race: selectedRace,
        className: selectedClass,
        baseScores: baseScores,
        adjustedScores: adjustedScores,
        hp: hp,
        classData: classData,
        ClassDataShared: ClassDataShared,
        smoothifiedMode: smoothifiedMode
    });
    
    console.log('Character object created:', character);
    
    console.log('\n========================================');
    console.log('CHARACTER GENERATION COMPLETE');
    console.log('========================================\n');
    
    // Display character
    displayCharacter(character);
}

/**
 * Display character in HTML
 * @param {Object} character - Character object
 */
export function displayCharacter(character) {
    const characterInfo = document.getElementById('characterInfo');
    const characterDisplay = document.getElementById('characterDisplay');
    
    // Get display names
    const raceDisplay = getRaceDisplayName(character.race);
    const classDisplay = getClassDisplayName(character.class);
    const mode = smoothifiedMode ? 'Smoothified' : 'Normal';
    
    // Build racial adjustments display
    let racialAdjustmentsHTML = '';
    if (character.racialAdjustments) {
        const adjustments = [];
        for (const ability in character.racialAdjustments) {
            const adj = character.racialAdjustments[ability];
            if (adj !== 0) {
                adjustments.push(`${ability} ${formatModifier(adj)}`);
            }
        }
        if (adjustments.length > 0) {
            racialAdjustmentsHTML = `<p><strong>Racial Adjustments:</strong> ${adjustments.join(', ')}</p>`;
        }
    }
    
    const html = `
        <h3>Level ${character.level} ${raceDisplay} ${classDisplay} (${mode} Mode)</h3>
        
        ${racialAdjustmentsHTML}
        
        <h4>Ability Scores</h4>
        <table style="border-collapse: collapse; margin-bottom: 15px;">
            <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #ccc; padding: 8px;">Ability</th>
                <th style="border: 1px solid #ccc; padding: 8px;">Base</th>
                <th style="border: 1px solid #ccc; padding: 8px;">Adjusted</th>
                <th style="border: 1px solid #ccc; padding: 8px;">Modifier</th>
            </tr>
            ${['STR', 'INT', 'WIS', 'DEX', 'CON', 'CHA'].map(ability => `
                <tr>
                    <td style="border: 1px solid #ccc; padding: 8px;"><strong>${ability}</strong></td>
                    <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${character.baseScores[ability]}</td>
                    <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${character.adjustedScores[ability]}</td>
                    <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${formatModifier(character.abilityModifiers[ability])}</td>
                </tr>
            `).join('')}
        </table>
        
        <h4>Combat Stats</h4>
        <p>
            <strong>HP:</strong> ${character.hp.current}/${character.hp.max} &nbsp;
            <strong>AC:</strong> ${character.armorClass} &nbsp;
            <strong>Attack Bonus:</strong> ${character.attackBonus >= 0 ? '+' : ''}${character.attackBonus}
        </p>
        
        <h4>Saving Throws</h4>
        <p>
            <strong>Death/Poison:</strong> ${character.savingThrows.death} &nbsp;
            <strong>Wands:</strong> ${character.savingThrows.wands} &nbsp;
            <strong>Paralysis/Petrify:</strong> ${character.savingThrows.paralysis} &nbsp;
            <strong>Breath:</strong> ${character.savingThrows.breath} &nbsp;
            <strong>Spells:</strong> ${character.savingThrows.spells}
        </p>
        
        <h4>Experience</h4>
        <p>
            <strong>Current XP:</strong> ${character.xp.current} &nbsp;
            <strong>XP for Level ${character.level}:</strong> ${character.xp.forCurrentLevel} &nbsp;
            ${character.xp.forNextLevel ? `<strong>XP for Level ${character.level + 1}:</strong> ${character.xp.forNextLevel} &nbsp;` : '<strong>Maximum level reached!</strong> &nbsp;'}
            <strong>XP Bonus:</strong> ${character.xp.bonus >= 0 ? '+' : ''}${character.xp.bonus}%
        </p>
        
        ${character.spellSlots ? `
            <h4>Spell Slots</h4>
            <p>${Object.entries(character.spellSlots).filter(([_, slots]) => slots > 0).map(([level, slots]) => `<strong>Level ${level}:</strong> ${slots}`).join(' &nbsp; ')}</p>
        ` : ''}
        
        ${character.thiefSkills ? `
            <h4>Thief Skills</h4>
            <p>${Object.entries(character.thiefSkills).map(([skill, value]) => {
                // Convert camelCase to Title Case with spaces
                const displayName = skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return `<strong>${displayName}:</strong> ${value}%`;
            }).join(' &nbsp; ')}</p>
        ` : ''}
        
        ${character.turnUndead ? `
            <h4>Turn Undead</h4>
            <p>${Object.entries(character.turnUndead).map(([type, target]) => {
                // Display target value, handling null/undefined
                const displayTarget = target !== null && target !== undefined ? target : '-';
                return `<strong>${type}:</strong> ${displayTarget}`;
            }).join(' &nbsp; ')}</p>
        ` : ''}
        
        ${character.classAbilities && character.classAbilities.length > 0 ? `
            <h4>Class Abilities</h4>
            <ul>
                ${character.classAbilities.map(ability => `<li><strong>${ability.name}:</strong> ${ability.description}</li>`).join('')}
            </ul>
        ` : ''}
        
        ${character.racialAbilities && character.racialAbilities.length > 0 ? `
            <h4>Racial Abilities</h4>
            <ul>
                ${character.racialAbilities.map(ability => `<li>${ability}</li>`).join('')}
            </ul>
        ` : ''}
        
        <p style="margin-top: 20px;"><em>Check the browser console for detailed generation log.</em></p>
    `;
    
    characterInfo.innerHTML = html;
    characterDisplay.classList.add('visible');
    characterDisplay.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Initialize the UI
 */
export function initialize() {
    console.log('Advanced Mode: Class data modules loaded successfully');
    console.log('OSE module:', ClassDataOSE);
    console.log('Gygar module:', ClassDataGygar);
    console.log('Shared module:', ClassDataShared);
    
    initializeLevelSelection();
    initializeRaceClassGrid();
    initializeEventListeners();
    updateUI();
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
}
