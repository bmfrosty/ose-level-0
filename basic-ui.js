/**
 * basic-ui.js
 * UI logic, state management, and event handlers for Basic Mode
 */

import * as ClassDataOSE from './class-data-ose.js';
import * as ClassDataGygar from './class-data-gygar.js';
import * as ClassDataLL from './class-data-ll.js';
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
import { displayCharacterSheet } from './shared-character-sheet.js';

// Make modules available globally for debugging
window.ClassDataOSE = ClassDataOSE;
window.ClassDataGygar = ClassDataGygar;
window.ClassDataLL = ClassDataLL;
window.ClassDataShared = ClassDataShared;

// State variables
let selectedLevel = null;
let selectedClass = null;
let progressionMode = 'smooth'; // 'ose', 'smooth', or 'll'
let demihumanLimits = 'standard'; // 'standard' or 'extended'
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
 * Initialize class selection buttons
 */
export function initializeClassSelection() {
    const buttons = document.querySelectorAll('.class-button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.disabled) return;
            
            // Deselect all buttons
            buttons.forEach(b => b.classList.remove('selected'));
            
            // Select clicked button
            button.classList.add('selected');
            selectedClass = button.dataset.class;
            
            // Add _CLASS suffix for consistency with class data files
            if (selectedClass && !selectedClass.endsWith('_CLASS')) {
                selectedClass = `${selectedClass}_CLASS`;
            }
            
            updateUI();
        });
    });
    
    // Set Fighter as default selection
    const fighterButton = document.querySelector('[data-class="Fighter"]');
    if (fighterButton) {
        fighterButton.classList.add('selected');
        selectedClass = 'Fighter_CLASS';
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
    // Test HP button no longer exists - this function is kept for compatibility
    // but does nothing
}

/**
 * Update UI based on selections
 */
export function updateUI() {
    updateXPBonus();
    updateTestHPButton();
    
    // Disable class radio buttons if level exceeds limit (standard limits only)
    const limits = getDemihumanLimits();
    
    if (demihumanLimits === 'standard' && selectedLevel) {
        document.querySelectorAll('.class-button').forEach(button => {
            const className = button.dataset.class;
            const limit = limits[className];
            if (limit && selectedLevel > limit) {
                button.disabled = true;
                if (selectedClass === `${className}_CLASS`) {
                    // Switch to Fighter if current selection is disabled
                    selectedClass = 'Fighter_CLASS';
                    const fighterButton = document.querySelector('[data-class="Fighter"]');
                    if (fighterButton) {
                        button.classList.remove('selected');
                        fighterButton.classList.add('selected');
                    }
                }
            } else {
                button.disabled = false;
            }
        });
    } else {
        document.querySelectorAll('.class-button').forEach(button => {
            button.disabled = false;
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
    const classData = getClassDataForMode(progressionMode);
    
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
    
    // Name handling: if using fixed scores, respect what's in the field;
    // otherwise always generate a new random name each time
    if (useFixedScores) {
        characterName = document.getElementById('characterName').value.trim();
        if (!characterName) {
            const race = getRaceForNameGeneration(selectedClass);
            characterName = getRandomName(race);
            document.getElementById('characterName').value = characterName;
        }
    } else {
        const race = getRaceForNameGeneration(selectedClass);
        characterName = getRandomName(race);
        document.getElementById('characterName').value = characterName;
    }
    
    // Determine mode
    const mode = progressionMode === 'smooth' ? 'Smoothified' : progressionMode === 'll' ? 'Labyrinth Lord' : 'OSE Standard';
    const classData = getClassDataForMode(progressionMode);
    
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
 * Display character using the shared character sheet module
 * @param {Object} character - Character object
 */
function displayCharacter(character) {
    const displayClass = character.class.replace('_CLASS', '');
    const xpBonus = character.xp.bonus >= 0 ? `+${character.xp.bonus}%` : `${character.xp.bonus}%`;
    const items = character.background
        ? (Array.isArray(character.background.item) ? character.background.item : [character.background.item])
        : [];
    const hasRacial = character.racialAbilities && character.racialAbilities.length > 0;
    const hasClass = character.classAbilities && character.classAbilities.length > 0;
    const sanitize = (str) => (str || '').replace(/[/\\?%*:|"<>]/g, '-').trim();

    const sheet = {
        title: 'OLD-SCHOOL ESSENTIALS',
        subtitle: `RETRO ADVENTURE GAME &nbsp;·&nbsp; ${character.mode} Mode`,
        header: {
            columns: [
                { label: 'Character Name', value: character.name || 'Unknown', flex: 3 },
                { label: 'Class', value: displayClass, flex: 2 },
                { label: 'Level', value: character.level, flex: 1, center: true },
                { label: 'XP Bonus', value: xpBonus, flex: 1, center: true }
            ]
        },
        combat: {
            maxHP: character.hp.max,
            initMod: character.abilityModifiers.DEX
        },
        abilityScores: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(a => ({
            name: a,
            score: character.abilityScores[a],
            originalScore: null,
            effects: getModifierEffects(a, character.abilityModifiers[a], character.abilityScores[a])
        })),
        weaponsAndSkills: {
            weapon: character.background?.weapon || null,
            classAttackBonus: character.attackBonus,
            meleeMod: character.abilityModifiers.STR,
            rangedMod: character.abilityModifiers.DEX,
            thiefSkills: character.thiefSkills || null
        },
        abilitiesSection: {
            header: (hasRacial && hasClass) ? 'RACIAL & CLASS ABILITIES' : hasRacial ? 'RACIAL ABILITIES' : 'CLASS ABILITIES',
            racial: character.racialAbilities || [],
            class: character.classAbilities || []
        },
        savingThrows: character.savingThrows,
        experience: {
            current: character.xp.current,
            forLevel: character.level,
            forLevelXP: character.xp.forCurrentLevel,
            forNext: character.xp.forNextLevel,
            bonus: xpBonus
        },
        equipment: {
            armor: character.background?.armor || null,
            items: items,
            startingAC: character.armorClass,
            startingGold: null
        },
        spellSlots: character.spellSlots || null,
        turnUndead: character.turnUndead || null,
        showUndeadNames: showUndeadNames,
        footer: `Level ${character.level} ${displayClass} &nbsp;·&nbsp; ${character.mode} Mode`,
        printTitle: `OSE Basic - ${sanitize(displayClass)} - Level ${character.level} - ${sanitize(character.background?.profession || '')} - ${sanitize(character.name)}`,
        openInNewTab: document.getElementById('openInNewTab')?.checked || false,
        autoPrint: document.getElementById('autoPrintInNewTab')?.checked || false
    };

    displayCharacterSheet(
        sheet,
        document.getElementById('characterInfo'),
        document.getElementById('characterDisplay')
    );
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
 * Initialize all event listeners
 */
export function initializeEventListeners() {
    // Progression mode radio buttons
    document.querySelectorAll('input[name="progressionMode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            progressionMode = e.target.value;
            updateUI();
        });
    });

    // Demihuman limits radio buttons
    document.querySelectorAll('input[name="demihumanLimits"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            demihumanLimits = e.target.value;
            updateUI();
        });
    });

    // Prime Requisite mode radio buttons (read directly in handleRollAbilities())

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
    document.getElementById('setMinimumsButton').addEventListener('click', handleSetMinimums);
    document.getElementById('rollAbilitiesButton').addEventListener('click', handleRollAbilities);
    document.getElementById('generateButton').addEventListener('click', generateCharacter);

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
