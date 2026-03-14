/**
 * basic-ui.js
 * UI logic, state management, and event handlers for Basic Mode
 */

import * as ClassDataOSE from './class-data-ose.js';
import * as ClassDataGygar from './class-data-gygar.js';
import * as ClassDataShared from './class-data-shared.js';
import { 
    calculateModifier, 
    formatModifier, 
    calculateXPBonus, 
    getPrimeRequisites,
    readAbilityScores as readScoresFromInputs,
    getMinimumScores,
    getClassRequirements,
    getHitDiceSize,
    getDemihumanLimits,
    meetsClassPrimeRequisites
} from './basic-utils.js';
import {
    rollAbilities,
    rollHitPoints,
    getClassProgressionData,
    getClassFeatures,
    getRacialAbilities,
    createCharacter
} from './basic-character-gen.js';
import { getRandomName } from './shared-names.js';
import { getRandomBackground } from './shared-backgrounds.js';
import { getModifierEffects } from './shared-modifier-effects.js';

// Make modules available globally for debugging
window.ClassDataOSE = ClassDataOSE;
window.ClassDataGygar = ClassDataGygar;
window.ClassDataShared = ClassDataShared;

// State variables
let selectedLevel = null;
let selectedClass = null;
let smoothifiedMode = true;
let allowDemihumanOverride = false;
let allowElfSpellbladePast10 = false;
let primeRequisite13 = false;
let healthyCharacters = false;
let includeLevel0HP = false;
let useFixedScores = false;
let showUndeadNames = false;
let characterName = '';

// Ability scores state
let abilityScores = {
    STR: 3,
    INT: 3,
    WIS: 3,
    DEX: 3,
    CON: 3,
    CHA: 3
};

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
 * Initialize class selection radio buttons
 */
export function initializeClassSelection() {
    const radios = document.querySelectorAll('input[name="class"]');
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            selectedClass = radio.value;
            // Add _CLASS suffix for consistency with class data files
            if (selectedClass && !selectedClass.endsWith('_CLASS')) {
                selectedClass = `${selectedClass}_CLASS`;
            }
            updateUI();
        });
    });
    
    // Set initial selected class (Fighter is checked by default in HTML)
    const checkedRadio = document.querySelector('input[name="class"]:checked');
    if (checkedRadio) {
        selectedClass = checkedRadio.value;
        // Add _CLASS suffix for consistency with class data files
        if (selectedClass && !selectedClass.endsWith('_CLASS')) {
            selectedClass = `${selectedClass}_CLASS`;
        }
    }
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
    
    if (!selectedClass) {
        reasons.push('No class selected');
    }
    
    if (selectedLevel && selectedClass) {
        const currentScores = readScoresFromInputs();
        
        const classReqs = getClassRequirements(selectedClass);
        Object.entries(classReqs).forEach(([ability, minScore]) => {
            if (currentScores[ability] < minScore) {
                reasons.push(`${ability} must be ≥ ${minScore} for ${selectedClass}`);
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
 * Update UI based on selections
 */
export function updateUI() {
    updateXPBonus();
    updateTestHPButton();
    
    // Show/hide Spellblade radio button based on mode
    const spellbladeRadio = document.getElementById('spellbladeRadio');
    const spellbladeInput = document.getElementById('classSpellblade');
    if (smoothifiedMode) {
        spellbladeRadio.style.display = 'inline-flex';
    } else {
        spellbladeRadio.style.display = 'none';
        if (selectedClass === 'Spellblade_CLASS') {
            // Switch to Fighter if Spellblade was selected
            selectedClass = 'Fighter_CLASS';
            document.getElementById('classFighter').checked = true;
            spellbladeInput.checked = false;
        }
    }

    // Disable class radio buttons if level exceeds limit (Normal Mode only)
    const demihumanLimits = getDemihumanLimits();
    
    if (!smoothifiedMode && !allowDemihumanOverride && selectedLevel) {
        document.querySelectorAll('input[name="class"]').forEach(radio => {
            const className = radio.value;
            const limit = demihumanLimits[className];
            if (limit && selectedLevel > limit) {
                radio.disabled = true;
                if (selectedClass === `${className}_CLASS`) {
                    // Switch to Fighter if current selection is disabled
                    selectedClass = 'Fighter_CLASS';
                    document.getElementById('classFighter').checked = true;
                    radio.checked = false;
                }
            } else {
                radio.disabled = false;
            }
        });
    } else {
        document.querySelectorAll('input[name="class"]').forEach(radio => {
            radio.disabled = false;
        });
    }

    // Enable generate button if level and class are selected
    const generateButton = document.getElementById('generateButton');
    generateButton.disabled = !(selectedLevel && selectedClass);
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
 * Get race name for name generation
 * Maps class names to race names for the name generator
 */
function getRaceForNameGeneration(className) {
    // Map demihuman classes to their race names
    const classToRace = {
        'Dwarf_CLASS': 'Dwarf',
        'Elf_CLASS': 'Elf',
        'Halfling_CLASS': 'Halfling',
        'Gnome_CLASS': 'Gnome',
        // All human classes map to Human
        'Cleric_CLASS': 'Human',
        'Fighter_CLASS': 'Human',
        'Magic-User_CLASS': 'Human',
        'Thief_CLASS': 'Human',
        'Spellblade_CLASS': 'Human'
    };
    
    return classToRace[className] || 'Human';
}

/**
 * Handle Random Name button click
 */
function handleRandomName() {
    if (!selectedClass) {
        alert('Please select a class first!');
        return;
    }
    
    const race = getRaceForNameGeneration(selectedClass);
    const name = getRandomName(race);
    
    document.getElementById('characterName').value = name;
    characterName = name;
}

/**
 * Read ability scores from inputs and update state
 */
function readAbilityScores() {
    abilityScores = readScoresFromInputs();
    updateModifiers();
}

/**
 * Handle Roll Abilities button click
 */
function handleRollAbilities() {
    // Get minimum scores from inputs (user-specified minimums)
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
    
    // Read Prime Requisite mode from radio buttons
    const primeReqMode = document.querySelector('input[name="primeRequisiteMode"]:checked')?.value || 'user';
    let primeReqValue = false; // Default: no prime requisite check
    
    if (primeReqMode === '9') {
        primeReqValue = 9; // Require prime requisite ≥ 9
    } else if (primeReqMode === '13') {
        primeReqValue = 13; // Require prime requisite ≥ 13
    }
    
    const scores = rollAbilities(effectiveMinimums, false, selectedClass, primeReqValue);
    
    // Update state
    abilityScores = scores;
    
    // Update UI
    document.getElementById('scoreSTR').value = scores.STR;
    document.getElementById('scoreINT').value = scores.INT;
    document.getElementById('scoreWIS').value = scores.WIS;
    document.getElementById('scoreDEX').value = scores.DEX;
    document.getElementById('scoreCON').value = scores.CON;
    document.getElementById('scoreCHA').value = scores.CHA;
    
    updateModifiers();
}

/**
 * Handle Test HP button click
 */
function handleTestHP() {
    if (!selectedLevel || !selectedClass) {
        alert('Please select a level and class first!');
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
    
    const progressionData = getClassProgressionData(
        selectedClass, 
        selectedLevel, 
        abilityScores, 
        classData
    );
    
    const classFeatures = getClassFeatures(
        selectedClass, 
        selectedLevel, 
        classData, 
        ClassDataShared
    );
}

/**
 * Generate character
 */
export function generateCharacter() {
    console.log('\n========================================');
    console.log('GENERATING CHARACTER');
    console.log('========================================\n');
    
    if (!selectedLevel || !selectedClass) {
        alert('Please select a level and class first!');
        return;
    }
    
    // If useFixedScores is checked, read current ability scores from inputs
    // Otherwise, roll new ability scores
    if (useFixedScores) {
        readAbilityScores();
    } else {
        // Roll new ability scores
        handleRollAbilities();
    }
    
    // Read character name AFTER rolling abilities (so it doesn't get cleared)
    characterName = document.getElementById('characterName').value.trim();
    
    // If no name provided, generate one
    if (!characterName) {
        const race = getRaceForNameGeneration(selectedClass);
        characterName = getRandomName(race);
        document.getElementById('characterName').value = characterName;
    }
    
    // Determine mode
    const mode = smoothifiedMode ? 'Smoothified' : 'Normal';
    const classData = smoothifiedMode ? ClassDataGygar : ClassDataOSE;
    
    // Roll hit points
    const conModifier = calculateModifier(abilityScores.CON);
    const hp = rollHitPoints(
        selectedClass,
        selectedLevel,
        conModifier,
        classData,
        includeLevel0HP,
        healthyCharacters
    );
    
    // Get class progression data
    const progressionData = getClassProgressionData(
        selectedClass,
        selectedLevel,
        abilityScores,
        classData
    );
    
    // Get class features
    const features = getClassFeatures(
        selectedClass,
        selectedLevel,
        classData,
        ClassDataShared
    );
    
    // Get racial abilities (for demihuman classes)
    const racialAbilities = getRacialAbilities(selectedClass);
    
    // Generate background based on HP
    const background = getRandomBackground(hp);
    console.log('Background:', background);
    
    // Create character object
    const character = createCharacter({
        level: selectedLevel,
        className: selectedClass,
        mode: mode,
        abilityScores: abilityScores,
        hp: hp,
        progressionData: progressionData,
        features: features,
        racialAbilities: racialAbilities,
        name: characterName,
        background: background
    });
    
    console.log('\n========================================');
    console.log('CHARACTER GENERATION COMPLETE');
    console.log('========================================\n');
    
    // Display character (placeholder for now)
    displayCharacter(character);
}

/**
 * Display character in HTML
 * @param {Object} character - Character object
 */
function displayCharacter(character) {
    const characterInfo = document.getElementById('characterInfo');
    const characterDisplay = document.getElementById('characterDisplay');
    
    const html = `
        <h3>${character.name || 'Unnamed Character'}</h3>
        <p><strong>Level ${character.level} ${character.class}</strong> (${character.mode} Mode)</p>
        
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
                <td style="border: 1px solid #000; padding: 5px; text-align: center;">${character.abilityScores[ability]}</td>
                <td style="border: 1px solid #000; padding: 5px;">${getModifierEffects(ability, character.abilityModifiers[ability], character.abilityScores[ability])}</td>
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

    document.getElementById('allowDemihumanOverride').addEventListener('change', (e) => {
        allowDemihumanOverride = e.target.checked;
        updateUI();
    });

    document.getElementById('allowElfSpellbladePast10').addEventListener('change', (e) => {
        allowElfSpellbladePast10 = e.target.checked;
        updateUI();
    });

    // Prime Requisite mode radio buttons (no longer using primeRequisite13 checkbox)
    // The radio buttons are read directly in handleRollAbilities()

    document.getElementById('healthyCharacters').addEventListener('change', (e) => {
        healthyCharacters = e.target.checked;
        updateTestHPButton();
    });

    document.getElementById('includeLevel0HP').addEventListener('change', (e) => {
        includeLevel0HP = e.target.checked;
        updateTestHPButton();
    });

    document.getElementById('useFixedScores').addEventListener('change', (e) => {
        useFixedScores = e.target.checked;
        updateRollButtonState();
    });

    document.getElementById('showUndeadNames').addEventListener('change', (e) => {
        showUndeadNames = e.target.checked;
    });

    // Button event listeners
    document.getElementById('randomNameButton').addEventListener('click', handleRandomName);
    document.getElementById('rollAbilitiesButton').addEventListener('click', handleRollAbilities);
    document.getElementById('testHPButton').addEventListener('click', handleTestHP);
    document.getElementById('generateButton').addEventListener('click', generateCharacter);
    document.getElementById('rollAndGenerateButton').addEventListener('click', handleRollAndGenerate);

    // Ability score input event listeners
    ['STR', 'INT', 'WIS', 'DEX', 'CON', 'CHA'].forEach(ability => {
        const input = document.getElementById(`score${ability}`);
        input.addEventListener('change', readAbilityScores);
        input.addEventListener('input', updateModifiers);
    });
}

/**
 * Initialize the UI
 */
export function initialize() {
    console.log('Class data modules loaded successfully');
    console.log('OSE module:', ClassDataOSE);
    console.log('Gygar module:', ClassDataGygar);
    console.log('Shared module:', ClassDataShared);
    
    initializeLevelSelection();
    initializeClassSelection();
    initializeEventListeners();
    updateRollButtonState();
    updateModifiers();
    updateUI();
}
