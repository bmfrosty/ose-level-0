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
    rollHitPoints,
    getClassProgressionData
} from './advanced-character-gen.js';
import { rollStartingGold, calcStartingGold } from './shared-character.js';
import { purchaseEquipment } from './shared-equipment.js';
import { getRandomName } from './shared-names.js';
import { getRandomBackground } from './shared-backgrounds.js';
import { getModifierEffects } from './shared-modifier-effects.js';
import { displayCharacterSheet } from './shared-character-sheet.js';
import { getMaxLevel } from './shared-racial-abilities.js';

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
let raceClassMode = 'strict-human'; // 'strict', 'strict-human', 'traditional-extended', 'allow-all'
let primeRequisiteMode = 'user'; // 'user', '9', '13'
let healthyCharacters = false;
let useFixedScores = false;
let showUndeadNames = false;
let showQRCode = true;
let includeLevel0HP = false;
let characterName = '';
let wealthPct = 50; // Starting wealth % for level 2+ characters
let fixedHPRolls = null;      // set by edit panel; null = roll normally
let fixedStartingGold = null; // set by edit panel; null = roll/calculate normally
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
 * Initialize level selection (styled buttons 1-14)
 */
export function initializeLevelSelection() {
    const container = document.getElementById('levelSelection');
    for (let i = 1; i <= 14; i++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn' + (i === 1 ? ' selected' : '');
        btn.textContent = i;
        btn.dataset.level = i;
        
        if (i === 1) selectedLevel = 1;
        
        btn.addEventListener('click', () => {
            container.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedLevel = parseInt(btn.dataset.level);
            updateUI();
            generateCharacter();
        });
        
        container.appendChild(btn);
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
            generateCharacter();
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
        if (raceClassMode === 'allow-all') {
            // All combinations allowed
            allowNonTraditional = true;
        }
        // 'strict', 'strict-human', 'traditional-extended' all use traditional combinations
        
        // Get available classes for this race
        const availableClasses = getAvailableClasses(race, allowNonTraditional);
        
        // Check if class is available for this race
        let isAvailable = availableClasses.includes(className);
        
        // For traditional-extended mode, Spellblade is only available for Human and Elf
        // (not all races like in allow-all mode)
        if (raceClassMode === 'traditional-extended' && className === 'Spellblade') {
            isAvailable = (race === 'Human' || race === 'Elf');
        }

        // In Strict OSE Rules modes (strict, strict-human), enforce per-race/class level caps.
        // getMaxLevel returns null for unlimited, or a number for the cap.
        // isSmootified=false because Strict modes always use OSE level limits.
        if (isAvailable && (raceClassMode === 'strict' || raceClassMode === 'strict-human') && selectedLevel) {
            const maxLevel = getMaxLevel(`${race}_RACE`, `${className}_CLASS`, false);
            if (maxLevel !== null && selectedLevel > maxLevel) {
                isAvailable = false;
            }
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

    // Show/hide Starting Wealth section (level 2+ only) and update preview
    const wealthSection = document.getElementById('startingWealthSection');
    const wealthPreview = document.getElementById('wealthPreview');
    if (selectedLevel && selectedLevel >= 2) {
        wealthSection.style.display = 'block';
        if (selectedClass) {
            try {
                const classData = getClassDataForMode(progressionMode);
                const progData = getClassProgressionData(selectedClass, selectedLevel, { STR:10,INT:10,WIS:10,DEX:10,CON:10,CHA:10 }, classData);
                const xpForLevel = progData?.xpForCurrentLevel || 0;
                if (xpForLevel > 0 && wealthPct > 0) {
                    const gp = calcStartingGold(xpForLevel, wealthPct);
                    wealthPreview.textContent = `= ${gp.toLocaleString()} gp (${wealthPct}% of ${xpForLevel.toLocaleString()} XP)`;
                } else if (wealthPct === 0) {
                    wealthPreview.textContent = '= 0 gp';
                } else {
                    wealthPreview.textContent = '';
                }
            } catch (e) {
                wealthPreview.textContent = '';
            }
        } else {
            wealthPreview.textContent = '';
        }
    } else {
        wealthSection.style.display = 'none';
        wealthPreview.textContent = '';
    }

    // Enable generate button if level, race, and class are selected
    const generateButton = document.getElementById('generateButton');
    if (generateButton) generateButton.disabled = !(selectedLevel && selectedRace && selectedClass);
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

    // Wealth % radio buttons
    document.querySelectorAll('input[name="wealthPct"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            wealthPct = parseInt(e.target.value);
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
    const generateButton = document.getElementById('generateButton');
    if (generateButton) generateButton.addEventListener('click', generateCharacter);
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
    
    // Name handling: if using fixed scores, respect what's in the field;
    // otherwise always generate a new random name each time
    if (useFixedScores) {
        characterName = document.getElementById('characterName').value.trim();
        if (!characterName) {
            const race = getRaceForNameGeneration(selectedRace);
            characterName = getRandomName(race);
            document.getElementById('characterName').value = characterName;
        }
    } else {
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
    
    const hpResult = rollHitPoints(
        selectedClass,
        selectedLevel,
        conModifier,
        classData,
        includeLevel0HP,
        false, // healthyCharacters - not used in Advanced Mode
        hasBlessed, // blessed - roll HP twice, take best
        fixedHPRolls  // may be null (rolls normally) or array (uses fixed values)
    );
    const hp = hpResult.max;

    console.log('Total HP:', hp);
    
    // Generate background based on L0 HP (always rolled even when includeLevel0HP=false)
    const background = getRandomBackground(hpResult.backgroundHP);
    console.log('Background:', background);
    
    // Compute starting gold (uses fixedStartingGold if set from edit panel)
    const progressionData = getClassProgressionData(selectedClass, selectedLevel, adjustedScores, classData);
    let startingGold;
    if (fixedStartingGold !== null) {
        startingGold = fixedStartingGold;
    } else if (selectedLevel === 1) {
        startingGold = rollStartingGold(progressionMode);
    } else {
        startingGold = calcStartingGold(progressionData?.xpForCurrentLevel || 0, wealthPct);
    }
    console.log('Starting Gold:', startingGold);

    // Purchase equipment
    const dexModifier = abilityModifiers.DEX;
    const purchased = purchaseEquipment(selectedClass, startingGold, dexModifier, background, progressionMode);
    console.log('Purchased equipment:', purchased);

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

    // Store per-level HP breakdown and starting gold on the character
    character.hpRolls = hpResult.rolls;
    character.hpDice  = hpResult.dice;
    character.startingGold = startingGold;
    // Reset overrides now that generation is complete
    fixedHPRolls = null;
    fixedStartingGold = null;

    console.log('Character object created:', character);
    
    console.log('\n========================================');
    console.log('CHARACTER GENERATION COMPLETE');
    console.log('========================================\n');
    
    // Display character
    displayCharacter(character, purchased);
}

/**
 * Display character using the shared character sheet module
 * @param {Object} character - Character object
 * @param {Object} purchased - Result from purchaseEquipment()
 */
export function displayCharacter(character, purchased) {
    const raceDisplay = getRaceDisplayName(character.race);
    const classDisplay = getClassDisplayName(character.class);
    const mode = progressionMode === 'smooth' ? 'Smoothified' : progressionMode === 'll' ? 'Labyrinth Lord' : 'OSE Standard';
    const xpBonus = character.xp.bonus >= 0 ? `+${character.xp.bonus}%` : `${character.xp.bonus}%`;
    const hasRacial = character.racialAbilities && character.racialAbilities.length > 0;
    const hasClass = character.classAbilities && character.classAbilities.length > 0;
    const sanitize = (str) => (str || '').replace(/[/\\?%*:|"<>]/g, '-').trim();
    const raceClassDisplay = raceDisplay === classDisplay ? raceDisplay : `${raceDisplay} ${classDisplay}`;

    const sheet = {
        title: 'OLD-SCHOOL ESSENTIALS ADVANCED',
        subtitle: `RETRO ADVENTURE GAME &nbsp;·&nbsp; ${mode} Mode`,
        header: {
            columns: [
                { label: 'Character Name', value: character.name || 'Unknown', flex: 3 },
                { label: 'Background', value: character.background?.profession || '—', flex: 2 },
                { label: 'Race & Class', value: raceClassDisplay, flex: 2 },
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
            score: character.adjustedScores[a],
            originalScore: (character.baseScores[a] !== character.adjustedScores[a]) ? character.baseScores[a] : null,
            effects: getModifierEffects(a, character.abilityModifiers[a], character.adjustedScores[a])
        })),
        weaponsAndSkills: {
            weapon: purchased.weapon || null,
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
            armor: purchased.armor || null,
            shield: purchased.shield || false,
            items: purchased.items,
            startingAC: purchased.startingAC,
            startingGold: purchased.goldRemaining
        },
        spellSlots: character.spellSlots || null,
        turnUndead: character.turnUndead || null,
        showUndeadNames: showUndeadNames,
        showQRCode: showQRCode,
        // Compact params v2 — used to generate a short QR-friendly URL
        cp: (() => {
            const RACE_TO_CODE = {
                'Human_RACE':'HU','Dwarf_RACE':'DW','Elf_RACE':'EL',
                'Halfling_RACE':'HA','Gnome_RACE':'GN'
            };
            const CLASS_TO_CODE = {
                'Fighter_CLASS':'FI','Cleric_CLASS':'CL','Magic-User_CLASS':'MU',
                'Thief_CLASS':'TH','Spellblade_CLASS':'SB','Dwarf_CLASS':'DW',
                'Elf_CLASS':'EL','Halfling_CLASS':'HA','Gnome_CLASS':'GN'
            };
            const PROG_TO_CODE = {'ose':'O','smooth':'S','ll':'L'};
            const RCM_TO_CODE = {'strict':'ST','strict-human':'SH','traditional-extended':'TE','allow-all':'AL'};
            const adjArr = ['STR','DEX','CON','INT','WIS','CHA'].map(a => character.adjustedScores[a]);
            const baseArr = ['STR','DEX','CON','INT','WIS','CHA'].map(a => character.baseScores[a]);
            const hasRacialAdj = adjArr.some((v, i) => v !== baseArr[i]);
            return {
                v:2, m:'A',
                p: PROG_TO_CODE[progressionMode] || 'S',
                r: RACE_TO_CODE[selectedRace] || 'HU',
                c: CLASS_TO_CODE[selectedClass] || 'FI',
                l: character.level,
                s: adjArr,
                ...(hasRacialAdj ? { bs: baseArr } : {}),
                h: character.hp.max,
                hr: character.hpRolls || [],
                hd: character.hpDice || [],
                il: includeLevel0HP ? 1 : 0,
                n: character.name || '',
                bg: character.background?.profession || '',
                ar: purchased.armor || null,
                sh: purchased.shield ? 1 : 0,
                w: purchased.weapon || null,
                it: purchased.items || [],
                g: typeof purchased.goldRemaining === 'number' ? purchased.goldRemaining : 0,
                ac: purchased.startingAC || 10,
                rcm: RCM_TO_CODE[raceClassMode] || 'SH',
                un: showUndeadNames ? 1 : 0,
                qr: showQRCode ? 1 : 0,
                hc: healthyCharacters ? 1 : 0,
                wp: wealthPct,
                prm: primeRequisiteMode === 'user' ? 0 : parseInt(primeRequisiteMode)
            };
        })(),
        footer: `Level ${character.level} ${raceDisplay} ${classDisplay} &nbsp;·&nbsp; ${mode} Mode`,
        printTitle: `OSE Advanced - ${sanitize(raceDisplay)} - ${sanitize(classDisplay)} - Level ${character.level} - ${sanitize(character.background?.profession || '')} - ${sanitize(character.name)}`,
        openInNewTab: document.getElementById('openInNewTab')?.checked || false,
        autoPrint: document.getElementById('autoPrintInNewTab')?.checked || false,
        editState: {
            level: character.level,
            progressionMode: progressionMode,
            name: character.name || '',
            STR: character.baseScores.STR,
            INT: character.baseScores.INT,
            WIS: character.baseScores.WIS,
            DEX: character.baseScores.DEX,
            CON: character.baseScores.CON,
            CHA: character.baseScores.CHA,
            hpRolls: character.hpRolls || [],
            hpDice: character.hpDice || [],
            startingGold: character.startingGold || 0,
            includeLevel0HP: includeLevel0HP,
            showUndeadNames: showUndeadNames,
            showQRCode: showQRCode,
            conModifier: calculateModifier(character.adjustedScores.CON),
            extraSections: [
                {
                    label: '6. Race/Class Restrictions',
                    name: 'editRaceClassMode',
                    options: [
                        { value: 'strict', label: 'Strict OSE', checked: raceClassMode === 'strict' },
                        { value: 'strict-human', label: 'Strict + Human Abilities', checked: raceClassMode === 'strict-human' },
                        { value: 'traditional-extended', label: 'Traditional Extended', checked: raceClassMode === 'traditional-extended' },
                        { value: 'allow-all', label: 'Allow All', checked: raceClassMode === 'allow-all' }
                    ]
                }
            ]
        },
        onEditUpdate: (values) => {
            // Update module-level state
            selectedLevel = values.level;
            progressionMode = values.progressionMode;
            characterName = values.name;
            abilityScores = { STR: values.STR, INT: values.INT, WIS: values.WIS, DEX: values.DEX, CON: values.CON, CHA: values.CHA };
            if (values.editRaceClassMode) raceClassMode = values.editRaceClassMode;
            // L0 is always at index 0 — no prepend/slice needed when toggling includeLevel0HP
            includeLevel0HP = values.includeLevel0HP || false;
            showUndeadNames = values.showUndeadNames || false;
            showQRCode = values.showQRCode ?? true;
            fixedHPRolls = (values.hpRolls && values.hpRolls.length > 0) ? [...values.hpRolls] : null;
            fixedStartingGold = (values.startingGold !== null && values.startingGold !== undefined)
                ? parseInt(values.startingGold) : null;

            // Sync DOM so generateCharacter() picks up the edited base scores
            ['STR', 'INT', 'WIS', 'DEX', 'CON', 'CHA'].forEach(a => {
                const inp = document.getElementById(`score${a}`);
                if (inp) inp.value = values[a];
            });
            const nameEl = document.getElementById('characterName');
            if (nameEl) nameEl.value = characterName;
            document.querySelectorAll('.level-btn').forEach(btn => {
                btn.classList.toggle('selected', parseInt(btn.dataset.level) === selectedLevel);
            });
            document.querySelectorAll('input[name="progressionMode"]').forEach(r => {
                r.checked = r.value === progressionMode;
            });
            document.querySelectorAll('input[name="raceClassMode"]').forEach(r => {
                r.checked = r.value === raceClassMode;
            });
            const l0El = document.getElementById('includeLevel0HP');
            if (l0El) l0El.checked = includeLevel0HP;
            const undeadEl = document.getElementById('showUndeadNames');
            if (undeadEl) undeadEl.checked = showUndeadNames;

            // Lock scores so regeneration uses the edited values
            useFixedScores = true;
            const fixedEl = document.getElementById('useFixedScores');
            if (fixedEl) fixedEl.checked = true;
            updateRollButtonState();
            generateCharacter();
        }
    };

    displayCharacterSheet(
        sheet,
        document.getElementById('characterInfo'),
        document.getElementById('characterDisplay')
    );
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
    generateCharacter();
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
}
