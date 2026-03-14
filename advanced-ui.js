/**
 * advanced-ui.js
 * UI logic, state management, and event handlers for Advanced Mode
 */

import * as ClassDataOSE from './class-data-ose.js';
import * as ClassDataGygar from './class-data-gygar.js';
import * as ClassDataLL from './class-data-ll.js';
import * as ClassDataShared from './class-data-shared.js';
import { 
    calculateModifier, 
    formatModifier,
    getRaceDisplayName,
    getClassDisplayName,
    getAvailableClasses,
    readAbilityScores as readScoresFromInputs,
    getMinimumScores,
    getClassRequirements,
    getHitDiceSize,
    calculateXPBonus,
    getPrimeRequisites,
    applyRacialAdjustments
} from './advanced-utils.js';
import {
    rollAbilitiesAdvanced,
    getRacialAbilities,
    createCharacterAdvanced,
    rollHitPoints
} from './advanced-character-gen.js';
import { getRandomName } from './shared-names.js';
import { getRandomBackground } from './shared-backgrounds.js';
import { getModifierEffects } from './shared-modifier-effects.js';

// Make modules available globally for debugging
window.ClassDataOSE = ClassDataOSE;
window.ClassDataGygar = ClassDataGygar;
window.ClassDataLL = ClassDataLL;
window.ClassDataShared = ClassDataShared;

// State variables
let selectedLevel = null;
let selectedRace = null;
let selectedClass = null;
let progressionMode = 'smooth'; // 'ose', 'smooth', or 'll'
let raceClassMode = 'strict'; // 'strict', 'traditional-extended', 'allow-all'
let primeRequisiteMode = 'user'; // 'user', '9', '13'
let healthyCharacters = false;
let useFixedScores = false;
let showUndeadNames = false;
let includeLevel0HP = false;
let characterName = '';
let abilityScores = {
    STR: 3,
    INT: 3,
    WIS: 3,
    DEX: 3,
    CON: 3,
    CHA: 3
};

/**
 * Read ability scores from inputs and update state
 */
function readAbilityScores() {
    abilityScores = readScoresFromInputs();
    updateModifiers();
}

/**
 * Update ability modifiers display
 */
export function updateModifiers() {
    ['STR', 'INT', 'WIS', 'DEX', 'CON', 'CHA'].forEach(ability => {
        const score = parseInt(document.getElementById(`score${ability}`).value) || 3;
        const modifier = calculateModifier(score);
        document.getElementById(`mod${ability}`).textContent = formatModifier(modifier);
    });
    
    updateXPBonus();
}

/**
 * Update XP bonus display
 */
export function updateXPBonus() {
    if (!selectedClass) {
        document.getElementById('xpBonusDisplay').style.display = 'none';
        return;
    }
    
    const primeReqs = getPrimeRequisites(selectedClass);
    if (primeReqs.length === 0) {
        document.getElementById('xpBonusDisplay').style.display = 'none';
        return;
    }
    
    // For classes with multiple prime requisites (e.g., Spellblade: STR, INT)
    // Use the LOWEST bonus among all prime requisites
    let lowestBonus = 10; // Start with max possible bonus
    primeReqs.forEach(ability => {
        const score = parseInt(document.getElementById(`score${ability}`).value) || 3;
        const bonus = calculateXPBonus(score);
        lowestBonus = Math.min(lowestBonus, bonus);
    });
    
    const bonusText = lowestBonus >= 0 ? `+${lowestBonus}%` : `${lowestBonus}%`;
    document.getElementById('xpBonusText').textContent = bonusText;
    document.getElementById('xpBonusDisplay').style.display = 'block';
}

/**
 * Update Roll Abilities button state
 */
function updateRollButtonState() {
    const rollButton = document.getElementById('rollAbilitiesButton');
    rollButton.disabled = useFixedScores;
}

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
    
    // Set Human Fighter as default selection
    const humanFighterButton = document.querySelector('[data-race="Human"][data-class="Fighter"]');
    if (humanFighterButton) {
        humanFighterButton.classList.add('selected');
        selectedRace = 'Human_RACE';
        selectedClass = 'Fighter_CLASS';
    }
}


/**
 * Update UI based on selections
 */
export function updateUI() {
    // Spellblade is always available in Advanced Mode (both OSE and Smoothified)
    const spellbladeHeader = document.getElementById('spellbladeHeader');
    const spellbladeButtons = document.querySelectorAll('[data-class="Spellblade"]');
    
    // Always show Spellblade column in Advanced Mode
    spellbladeHeader.style.display = '';
    spellbladeButtons.forEach(btn => {
        btn.parentElement.style.display = '';
    });

    // Enable/disable buttons based on race/class mode
    const buttons = document.querySelectorAll('.grid-button');
    buttons.forEach(button => {
        const race = button.dataset.race;
        const className = button.dataset.class;
        
        // Determine allowNonTraditional based on raceClassMode
        let allowNonTraditional = false;
        if (raceClassMode === 'traditional-extended') {
            // Traditional + Spellblade for all races
            allowNonTraditional = false;
        } else if (raceClassMode === 'allow-all') {
            // All combinations allowed
            allowNonTraditional = true;
        }
        // else raceClassMode === 'strict' - use traditional combinations
        
        // Get available classes for this race
        const availableClasses = getAvailableClasses(race, allowNonTraditional);
        
        // Check if class is available for this race
        let isAvailable = availableClasses.includes(className);
        
        // For traditional-extended mode, Spellblade is only available for Human and Elf
        // (not all races like in allow-all mode)
        if (raceClassMode === 'traditional-extended' && className === 'Spellblade') {
            isAvailable = (race === 'Human' || race === 'Elf');
        }
        
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

    // Update XP bonus
    updateXPBonus();

    // Enable generate button if level, race, and class are selected
    const generateButton = document.getElementById('generateButton');
    generateButton.disabled = !(selectedLevel && selectedRace && selectedClass);
}

/**
 * Get race name for name generation (remove _RACE suffix)
 */
function getRaceForNameGeneration(raceName) {
    if (raceName && raceName.endsWith('_RACE')) {
        return raceName.replace('_RACE', '');
    }
    return raceName || 'Human';
}

/**
 * Handle Random Name button click
 */
function handleRandomName() {
    if (!selectedRace) {
        alert('Please select a race first!');
        return;
    }
    
    const race = getRaceForNameGeneration(selectedRace);
    const name = getRandomName(race);
    
    document.getElementById('characterName').value = name;
    characterName = name;
}

/**
 * Handle Set to Minimums button click
 */
function handleSetMinimums() {
    // Set all ability scores to 3
    document.getElementById('scoreSTR').value = 3;
    document.getElementById('scoreINT').value = 3;
    document.getElementById('scoreWIS').value = 3;
    document.getElementById('scoreDEX').value = 3;
    document.getElementById('scoreCON').value = 3;
    document.getElementById('scoreCHA').value = 3;
    
    updateModifiers();
}

/**
 * Handle Roll Abilities button click
 */
function handleRollAbilities() {
    // Get minimum scores from input fields (user-specified minimums)
    const userMinimums = readScoresFromInputs();
    
    // Get class requirements if a class is selected
    let classRequirements = {};
    if (selectedClass) {
        classRequirements = getClassRequirements(selectedClass);
    }
    
    // Merge minimums: use the higher of user minimum or class requirement
    const effectiveMinimums = { ...userMinimums };
    Object.keys(classRequirements).forEach(ability => {
        effectiveMinimums[ability] = Math.max(
            effectiveMinimums[ability] || 3,
            classRequirements[ability]
        );
    });
    
    // Apply prime requisite minimums based on mode
    if (primeRequisiteMode !== 'user' && selectedClass) {
        const primeReqs = getPrimeRequisites(selectedClass);
        const primeReqMinimum = parseInt(primeRequisiteMode); // '9' or '13'
        
        primeReqs.forEach(ability => {
            effectiveMinimums[ability] = Math.max(
                effectiveMinimums[ability] || 3,
                primeReqMinimum
            );
        });
    }
    
    // Roll abilities with racial adjustments
    const { baseScores, adjustedScores } = rollAbilitiesAdvanced(
        effectiveMinimums,
        selectedRace,
        selectedClass,
        false, // toughCharacters - removed from Advanced Mode
        false // primeRequisite13 - now handled above via primeRequisiteMode
    );
    
    // Update state with adjusted scores
    abilityScores = adjustedScores;
    
    // Update UI with base scores (before racial adjustments)
    document.getElementById('scoreSTR').value = baseScores.STR;
    document.getElementById('scoreINT').value = baseScores.INT;
    document.getElementById('scoreWIS').value = baseScores.WIS;
    document.getElementById('scoreDEX').value = baseScores.DEX;
    document.getElementById('scoreCON').value = baseScores.CON;
    document.getElementById('scoreCHA').value = baseScores.CHA;
    
    updateModifiers();
}

/**
 * Initialize all event listeners
 */
export function initializeEventListeners() {
    // Checkbox event listeners
    // Progression mode radio buttons
    document.querySelectorAll('input[name="progressionMode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            progressionMode = e.target.value;
            updateUI();
        });
    });

    // Prime Requisite Mode radio button listeners
    document.querySelectorAll('input[name="primeRequisiteMode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            primeRequisiteMode = e.target.value;
        });
    });

    document.getElementById('healthyCharacters').addEventListener('change', (e) => {
        healthyCharacters = e.target.checked;
    });

    document.getElementById('useFixedScores').addEventListener('change', (e) => {
        useFixedScores = e.target.checked;
        updateRollButtonState();
    });

    document.getElementById('showUndeadNames').addEventListener('change', (e) => {
        showUndeadNames = e.target.checked;
    });

    document.getElementById('includeLevel0HP').addEventListener('change', (e) => {
        includeLevel0HP = e.target.checked;
    });

    // Race/Class Mode radio button listeners
    document.querySelectorAll('input[name="raceClassMode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            raceClassMode = e.target.value;
            updateUI();
        });
    });

    // Ability score input listeners
    ['STR', 'INT', 'WIS', 'DEX', 'CON', 'CHA'].forEach(ability => {
        const input = document.getElementById(`score${ability}`);
        input.addEventListener('change', readAbilityScores);
        input.addEventListener('input', updateModifiers);
    });

    // Button event listeners
    document.getElementById('randomNameButton').addEventListener('click', handleRandomName);
    document.getElementById('setMinimumsButton').addEventListener('click', handleSetMinimums);
    document.getElementById('rollAbilitiesButton').addEventListener('click', handleRollAbilities);
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
    console.log('Progression Mode:', progressionMode);
    console.log('Prime Requisite Mode:', primeRequisiteMode);
    console.log('Healthy Characters:', healthyCharacters);
    console.log('Include Level 0 HP:', includeLevel0HP);
    console.log('Use Fixed Scores:', useFixedScores);
    
    // Determine class data module
    const classData = getClassDataForMode(progressionMode);
    console.log('Using class data:', progressionMode === 'smooth' ? 'Gygar (Smoothified)' : progressionMode === 'll' ? 'LL (Labyrinth Lord)' : 'OSE (Standard)');
    
    // Read character name AFTER determining if we're rolling or using fixed scores
    // (but before actually rolling, so it doesn't get cleared)
    characterName = document.getElementById('characterName').value.trim();
    
    // If no name provided, generate one
    if (!characterName) {
        const race = getRaceForNameGeneration(selectedRace);
        characterName = getRandomName(race);
        document.getElementById('characterName').value = characterName;
    }
    
    let baseScores, adjustedScores;
    
    // Always roll new ability scores unless useFixedScores is checked
    if (useFixedScores) {
        // Use scores from input fields
        console.log('\n--- Using Fixed Ability Scores ---');
        baseScores = readScoresFromInputs();
        console.log('Base scores (from inputs):', baseScores);
        
        // Apply racial adjustments
        adjustedScores = applyRacialAdjustments(baseScores, selectedRace);
        console.log('Adjusted scores (after racial adjustments):', adjustedScores);
    } else {
        // Roll ability scores using input fields as minimums
        const userMinimums = readScoresFromInputs();
        
        // Get class requirements if a class is selected
        let classRequirements = {};
        if (selectedClass) {
            classRequirements = getClassRequirements(selectedClass);
        }
        
        // Merge minimums: use the higher of user minimum or class requirement
        const effectiveMinimums = { ...userMinimums };
        Object.keys(classRequirements).forEach(ability => {
            effectiveMinimums[ability] = Math.max(
                effectiveMinimums[ability] || 3,
                classRequirements[ability]
            );
        });
        
        // Apply prime requisite minimums based on mode
        if (primeRequisiteMode !== 'user' && selectedClass) {
            const primeReqs = getPrimeRequisites(selectedClass);
            const primeReqMinimum = parseInt(primeRequisiteMode); // '9' or '13'
            
            primeReqs.forEach(ability => {
                effectiveMinimums[ability] = Math.max(
                    effectiveMinimums[ability] || 3,
                    primeReqMinimum
                );
            });
        }
        
        console.log('\n--- Rolling Ability Scores ---');
        console.log('User-specified minimums (from input fields):', userMinimums);
        console.log('Prime Requisite Mode:', primeRequisiteMode);
        console.log('Effective minimums (after all requirements):', effectiveMinimums);
        
        // Roll ability scores with racial adjustments
        const result = rollAbilitiesAdvanced(
            effectiveMinimums,
            selectedRace,
            selectedClass,
            false, // toughCharacters - removed from Advanced Mode
            false // primeRequisite13 - now handled above via primeRequisiteMode
        );
        
        baseScores = result.baseScores;
        adjustedScores = result.adjustedScores;
        
        console.log('Base scores (before racial adjustments):', baseScores);
        console.log('Adjusted scores (after racial adjustments):', adjustedScores);
    }
    
    // Calculate modifiers from adjusted scores
    const abilityModifiers = {};
    for (const ability in adjustedScores) {
        abilityModifiers[ability] = calculateModifier(adjustedScores[ability]);
    }
    console.log('Ability modifiers (from adjusted scores):', abilityModifiers);
    
    // Get racial abilities BEFORE rolling HP (needed for Blessed ability)
    console.log('\n--- Getting Racial Abilities ---');
    console.log('Race:', selectedRace);
    console.log('Race/Class Mode:', raceClassMode);
    const racialAbilitiesForBlessed = getRacialAbilities(selectedRace, raceClassMode);
    console.log('Racial abilities:', racialAbilitiesForBlessed);
    const hasBlessed = racialAbilitiesForBlessed.some(ability => ability.includes('Blessed'));
    console.log('Has Blessed ability:', hasBlessed);
    
    // Roll hit points
    console.log('\n--- Rolling Hit Points ---');
    const conModifier = abilityModifiers.CON;
    console.log('CON modifier:', conModifier);
    console.log('Include Level 0 HP:', includeLevel0HP);
    console.log('Blessed:', hasBlessed);
    
    const hp = rollHitPoints(
        selectedClass,
        selectedLevel,
        conModifier,
        classData,
        includeLevel0HP,
        false, // healthyCharacters - not used in Advanced Mode
        hasBlessed // blessed - roll HP twice, take best
    );
    
    console.log('Total HP:', hp);
    
    // Generate background based on HP
    const background = getRandomBackground(hp);
    console.log('Background:', background);
    
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
        progressionMode: progressionMode,
        raceClassMode: raceClassMode,
        name: characterName,
        background: background
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
    const mode = progressionMode === 'smooth' ? 'Smoothified' : progressionMode === 'll' ? 'Labyrinth Lord' : 'OSE Standard';
    
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
        <h3>${character.name || 'Unnamed Character'}</h3>
        <p><strong>Level ${character.level} ${raceDisplay} ${classDisplay}</strong> (${mode} Mode)</p>
        
        ${racialAdjustmentsHTML}
        
        ${character.background ? `
            <h4>Background</h4>
            <p>
                <strong>Profession:</strong> ${character.background.profession}<br>
                <strong>Starting Item(s):</strong> ${Array.isArray(character.background.item) ? character.background.item.join(', ') : character.background.item}<br>
                <strong>Weapon:</strong> ${character.background.weapon}<br>
                <strong>Armor:</strong> ${character.background.armor}
            </p>
        ` : ''}
        
        <h4>Ability Scores</h4>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
            <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #000; padding: 5px; text-align: center;">Ability</th>
                <th style="border: 1px solid #000; padding: 5px; text-align: center;">Score</th>
                <th style="border: 1px solid #000; padding: 5px; text-align: left;">Effects</th>
            </tr>
            ${['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(ability => `
            <tr>
                <td style="border: 1px solid #000; padding: 5px; text-align: center;"><strong>${ability}</strong></td>
                <td style="border: 1px solid #000; padding: 5px; text-align: center;">${character.adjustedScores[ability]}${character.baseScores[ability] !== character.adjustedScores[ability] ? ` (${character.baseScores[ability]})` : ''}</td>
                <td style="border: 1px solid #000; padding: 5px;">${getModifierEffects(ability, character.abilityModifiers[ability], character.adjustedScores[ability])}</td>
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
                // HD to monster name mapping
                const monsterNames = {
                    '1HD': 'Skeleton',
                    '2HD': 'Zombie',
                    '2*HD': 'Ghoul',
                    '3HD': 'Wight',
                    '4HD': 'Wraith',
                    '5HD': 'Mummy',
                    '6HD': 'Spectre',
                    '7-9HD': 'Vampire'
                };
                
                // Use monster name if checkbox is checked, otherwise use HD
                const displayType = showUndeadNames ? monsterNames[type] || type : type;
                
                // Display target value, handling null/undefined
                const displayTarget = target !== null && target !== undefined ? target : '-';
                return `<strong>${displayType}:</strong> ${displayTarget}`;
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
                <title>${character.name} - OSE Character</title>
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
                ${html}
            </body>
            </html>
        `);
        newWindow.document.close();
        
        // Clear the result div on main page
        characterInfo.innerHTML = '<p style="text-align: center;">Character opened in new tab.</p>';
        characterDisplay.classList.add('visible');
    } else {
        // Display in current page
        characterInfo.innerHTML = html;
        characterDisplay.classList.add('visible');
        characterDisplay.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Get class data module based on progression mode
 */
function getClassDataForMode(mode) {
    switch (mode) {
        case 'smooth':
            return ClassDataGygar;
        case 'll':
            return ClassDataLL;
        case 'ose':
        default:
            return ClassDataOSE;
    }
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
    updateRollButtonState();
    updateModifiers();
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
