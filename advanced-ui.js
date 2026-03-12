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

// Make modules available globally for debugging
window.ClassDataOSE = ClassDataOSE;
window.ClassDataGygar = ClassDataGygar;
window.ClassDataShared = ClassDataShared;

// State variables
let selectedLevel = null;
let selectedRace = null;
let selectedClass = null;
let smoothifiedMode = true;
let raceClassMode = 'strict'; // 'strict', 'traditional-extended', 'allow-all'
let primeRequisite13 = false;
let healthyCharacters = false;
let useFixedScores = false;
let showUndeadNames = false;
let includeLevel0HP = false;
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
    updateTestHPButton();
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
    
    let totalBonus = 0;
    primeReqs.forEach(ability => {
        const score = parseInt(document.getElementById(`score${ability}`).value) || 3;
        totalBonus += calculateXPBonus(score);
    });
    const avgBonus = Math.floor(totalBonus / primeReqs.length);
    
    const bonusText = avgBonus >= 0 ? `+${avgBonus}%` : `${avgBonus}%`;
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
}

/**
 * Check if HP rolling is possible
 * @returns {Object} Object with canRoll boolean and reasons array
 */
function canRollHP() {
    const reasons = [];
    
    if (!selectedLevel) {
        reasons.push('No level selected');
    }
    
    if (!selectedRace) {
        reasons.push('No race selected');
    }
    
    if (!selectedClass) {
        reasons.push('No class selected');
    }
    
    if (selectedLevel && selectedRace && selectedClass) {
        const currentScores = readScoresFromInputs();
        
        const classReqs = getClassRequirements(selectedClass);
        Object.entries(classReqs).forEach(([ability, minScore]) => {
            if (currentScores[ability] < minScore) {
                reasons.push(`${ability} must be ≥ ${minScore} for ${getClassDisplayName(selectedClass)}`);
            }
        });
        
        if (healthyCharacters && !includeLevel0HP) {
            const conModifier = calculateModifier(currentScores.CON);
            const hitDiceSize = getHitDiceSize(selectedClass);
            const maxHP = hitDiceSize + conModifier;
            
            if (maxHP < 2) {
                reasons.push(`Healthy Characters impossible: max HP = ${maxHP} (1d${hitDiceSize} + ${formatModifier(conModifier)})`);
            }
        }
    }
    
    return {
        canRoll: reasons.length === 0,
        reasons: reasons
    };
}

/**
 * Update test HP button state
 */
export function updateTestHPButton() {
    const testHPButton = document.getElementById('testHPButton');
    const testHPWarning = document.getElementById('testHPWarning');
    const testHPWarningText = document.getElementById('testHPWarningText');
    
    const result = canRollHP();
    
    if (result.canRoll) {
        testHPButton.disabled = false;
        testHPWarning.style.display = 'none';
    } else {
        testHPButton.disabled = true;
        testHPWarning.style.display = 'block';
        testHPWarningText.textContent = result.reasons.join('; ');
    }
}

/**
 * Handle Test HP button click
 */
function handleTestHP() {
    if (!selectedLevel || !selectedRace || !selectedClass) {
        alert('Please select a level, race, and class first!');
        return;
    }
    
    readAbilityScores();
    
    const conModifier = calculateModifier(abilityScores.CON);
    const classData = smoothifiedMode ? ClassDataGygar : ClassDataOSE;
    
    const totalHP = rollHitPoints(
        selectedClass, 
        selectedLevel, 
        conModifier, 
        classData, 
        includeLevel0HP, 
        healthyCharacters
    );
    
    console.log('Test HP Roll:', totalHP);
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
        if (raceClassMode === 'traditional-extended' && className === 'Spellblade' && smoothifiedMode) {
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

    // Update XP bonus and Test HP button
    updateXPBonus();
    updateTestHPButton();

    // Enable generate button if level, race, and class are selected
    const generateButton = document.getElementById('generateButton');
    generateButton.disabled = !(selectedLevel && selectedRace && selectedClass);
}

/**
 * Handle Roll Abilities button click
 */
function handleRollAbilities() {
    // Get minimum scores (always 3 for Advanced Mode)
    const minimumScores = getMinimumScores();
    
    // Get class requirements if a class is selected
    let classRequirements = {};
    if (selectedClass) {
        classRequirements = getClassRequirements(selectedClass);
    }
    
    // Merge minimums: use the higher of user minimum or class requirement
    const effectiveMinimums = { ...minimumScores };
    Object.keys(classRequirements).forEach(ability => {
        effectiveMinimums[ability] = Math.max(
            effectiveMinimums[ability] || 3,
            classRequirements[ability]
        );
    });
    
    // Roll abilities with racial adjustments
    const { baseScores, adjustedScores } = rollAbilitiesAdvanced(
        effectiveMinimums,
        selectedRace,
        selectedClass,
        false, // toughCharacters - removed from Advanced Mode
        primeRequisite13
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
 * Handle Roll Abilities & Generate Character button click
 */
function handleRollAndGenerate() {
    // First, roll abilities
    handleRollAbilities();
    
    // Then generate character
    generateCharacter();
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

    document.getElementById('primeRequisite13').addEventListener('change', (e) => {
        primeRequisite13 = e.target.checked;
    });

    document.getElementById('healthyCharacters').addEventListener('change', (e) => {
        healthyCharacters = e.target.checked;
        updateTestHPButton();
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
        updateTestHPButton();
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
    document.getElementById('rollAbilitiesButton').addEventListener('click', handleRollAbilities);
    document.getElementById('testHPButton').addEventListener('click', handleTestHP);
    document.getElementById('generateButton').addEventListener('click', generateCharacter);
    document.getElementById('rollAndGenerateButton').addEventListener('click', handleRollAndGenerate);
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
    console.log('Prime Requisite 13+:', primeRequisite13);
    console.log('Healthy Characters:', healthyCharacters);
    console.log('Include Level 0 HP:', includeLevel0HP);
    console.log('Use Fixed Scores:', useFixedScores);
    
    // Determine class data module
    const classData = smoothifiedMode ? ClassDataGygar : ClassDataOSE;
    console.log('Using class data:', smoothifiedMode ? 'Gygar (Smoothified)' : 'OSE (Normal)');
    
    let baseScores, adjustedScores;
    
    if (useFixedScores) {
        // Use scores from input fields
        console.log('\n--- Using Fixed Ability Scores ---');
        baseScores = readScoresFromInputs();
        console.log('Base scores (from inputs):', baseScores);
        
        // Apply racial adjustments
        adjustedScores = applyRacialAdjustments(baseScores, selectedRace);
        console.log('Adjusted scores (after racial adjustments):', adjustedScores);
    } else {
        // Roll ability scores
        const minimumScores = getMinimumScores();
        
        console.log('\n--- Rolling Ability Scores ---');
        console.log('Minimum scores:', minimumScores);
        console.log('Prime Requisite 13+:', primeRequisite13);
        
        // Roll ability scores with racial adjustments
        const result = rollAbilitiesAdvanced(
            minimumScores,
            selectedRace,
            selectedClass,
            false, // toughCharacters - removed from Advanced Mode
            primeRequisite13
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
        smoothifiedMode: smoothifiedMode,
        raceClassMode: raceClassMode
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
