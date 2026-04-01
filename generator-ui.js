/**
 * generator-ui.js
 * Combined UI logic for Basic + Advanced modes on generator.html
 * Replaces basic-ui.js + advanced-ui.js
 */

// ── Imports ───────────────────────────────────────────────────────────────────
import * as ClassDataOSE    from './class-data-ose.js';
import * as ClassDataGygar  from './class-data-gygar.js';
import * as ClassDataLL     from './class-data-ll.js';
import * as ClassDataShared from './class-data-shared.js';

// Shared utils (identical in both utils files — import from basic)
import {
    calculateModifier,
    formatModifier,
    getPrimeRequisites,
    readAbilityScores as readScoresFromInputs,
    getMinimumScores,
    getClassRequirements,
    getHitDiceSize,
    getDemihumanLimits,
    meetsClassPrimeRequisites
} from './basic-utils.js';

// Advanced-only utils
import {
    getRaceDisplayName,
    getClassDisplayName,
    getAvailableClasses,
    applyRacialAdjustments
} from './advanced-utils.js';

// Basic character generation (aliased to avoid name collisions)
import {
    rollAbilities,
    rollHitPoints        as rollHPBasic,
    getClassProgressionData as getProgBasic,
    getClassFeatures,
    getRacialAbilities   as getRacialBasic,
    createCharacter
} from './basic-character-gen.js';

// Advanced character generation (aliased to avoid name collisions)
import {
    rollAbilitiesAdvanced,
    getRacialAbilities   as getRacialAdvanced,
    createCharacterAdvanced,
    rollHitPoints        as rollHPAdvanced,
    getClassProgressionData as getProgAdvanced
} from './advanced-character-gen.js';

import { rollStartingGold, calcStartingGold }    from './shared-character.js';
import { purchaseEquipment }                      from './shared-equipment.js';
import { getRandomName }                          from './shared-names.js';
import { getRandomBackground, getAllBackgroundTables } from './shared-backgrounds.js';
import { getModifierEffects }                     from './shared-modifier-effects.js';
import { displayCharacterSheet }                  from './shared-character-sheet.js';
import { getMaxLevel, getAdvancedModeRacialAbilities } from './shared-racial-abilities.js';
import { generateZeroLevelCharacter }             from './shared-0level-gen.js';
import { saveSettings, loadSettings, clearSettings } from './shared-settings.js';
import { buildOptionsLine } from './shared-compact-codes.js';
import { buildSheetSpec, CLASS_HD, PROG_CODE, CLS_CODE, RACE_CODE, RCM_CODE, sanitize } from './shared-sheet-builder.js';

// ── State ─────────────────────────────────────────────────────────────────────
// Top-level mode toggle
let mode = 'basic'; // 'basic' | 'advanced'

// Shared state
let selectedLevel = null;
let selectedClass = null;
let progressionMode = 'ose';
let primeRequisiteMode = 'user';
let healthyCharacters = false;
let includeLevel0HP = false;
let useFixedScores = false;
let showUndeadNames = false;
let hideHumanRace   = false;   // Advanced mode: show "Fighter" instead of "Human Fighter"
let showQRCode = true;
let basicAbilityOrdering = true;
let characterName = '';
let wealthPct = 50;
let autoGenerateOnLevelChange = false;
let autoGenerateOnClassChange = false;
let autoGenerateOnLoad = false;
let fixedHPRolls = null;
let fixedStartingGold = null;
let fixedAdjustments = null; // { STR,INT,WIS,DEX,CON,CHA } racial/custom adjustments from edit panel
let openTabInBackground = false;
let selectedRaceForZero = '';
let acDisplayMode = 'aac'; // 'aac' | 'dac-matrix' | 'dual' | 'dual-matrix'
let abilityScores = { STR:3, INT:3, WIS:3, DEX:3, CON:3, CHA:3 };
let _scoreRollAttempts = 1;  // set each time rollAbilities / rollAbilitiesAdvanced is called

// Basic-only state
let demihumanLimits = 'standard';

// Advanced-only state
let selectedRace = null;
let raceClassMode = 'strict';

// ── Helpers ───────────────────────────────────────────────────────────────────
function getSettingsKey() { return 'generator'; } // single shared key

/** Derive effective demihuman level limits from raceClassMode in basic mode */
function getEffectiveDemihumanLimits() {
    return (mode === 'basic')
        ? (raceClassMode === 'traditional-extended' ? 'extended' : 'standard')
        : demihumanLimits;
}

function getProgData(className, level, scores, classData) {
    return mode === 'basic'
        ? getProgBasic(className, level, scores, classData)
        : getProgAdvanced(className, level, scores, classData);
}

function getClassDataForMode(pm) {
    if (pm === 'smooth') return ClassDataGygar;
    if (pm === 'll')     return ClassDataLL;
    return ClassDataOSE;
}

function readAbilityScores() { abilityScores = readScoresFromInputs(); }

// ── Ability Scores UI ─────────────────────────────────────────────────────────
export function updateModifiers() {
    ['STR','INT','WIS','DEX','CON','CHA'].forEach(a => {
        const score = parseInt(document.getElementById(`score${a}`).value) || 3;
        document.getElementById(`mod${a}`).textContent = formatModifier(calculateModifier(score));
    });
}

// ── Level Selection ───────────────────────────────────────────────────────────
export function initializeLevelSelection() {
    const container = document.getElementById('levelSelection');
    container.innerHTML = '';

    const btn0 = document.createElement('button');
    btn0.className = 'level-btn selected';
    btn0.textContent = '0';
    btn0.dataset.level = '0';
    selectedLevel = 0;
    btn0.addEventListener('click', () => {
        container.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
        btn0.classList.add('selected');
        selectedLevel = 0;
        updateUI(); saveCurrentSettings();
        if (autoGenerateOnLevelChange) generateCharacter();
    });
    container.appendChild(btn0);

    for (let i = 1; i <= 14; i++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        btn.textContent = i;
        btn.dataset.level = i;
        btn.addEventListener('click', () => {
            container.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedLevel = parseInt(btn.dataset.level);
            updateUI(); saveCurrentSettings();
            if (autoGenerateOnLevelChange) generateCharacter();
        });
        container.appendChild(btn);
    }
}

// ── Mode Selector ─────────────────────────────────────────────────────────────
function switchMode(newMode) {
    mode = newMode;
    // Show/hide mode-specific sections
    const basicSections  = document.querySelectorAll('.basic-only');
    const advSections    = document.querySelectorAll('.advanced-only');
    basicSections.forEach(el => el.style.display = (mode === 'basic')    ? '' : 'none');
    advSections.forEach(el   => el.style.display = (mode === 'advanced') ? '' : 'none');
    // Swap accent colour on the container
    const container = document.getElementById('generatorContainer');
    if (container) {
        container.classList.toggle('mode-basic',    mode === 'basic');
        container.classList.toggle('mode-advanced', mode === 'advanced');
    }

    // Load this mode's saved settings, then re-init character selector
    applySettings(loadSettings(getSettingsKey()));

    if (mode === 'basic') {
        initializeClassSelection();
    } else {
        initializeRaceClassGrid();
    }
    updateUI();
}

function initializeModeSelector() {
    document.querySelectorAll('input[name="mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            switchMode(e.target.value);
            saveCurrentSettings();
        });
    });
}

// ── Basic: Class Selection ────────────────────────────────────────────────────
export function initializeClassSelection() {
    const buttons = document.querySelectorAll('.class-button');
    // Remove old listeners by cloning
    buttons.forEach(btn => {
        const fresh = btn.cloneNode(true);
        btn.parentNode.replaceChild(fresh, btn);
    });
    document.querySelectorAll('.class-button').forEach(button => {
        button.addEventListener('click', () => {
            if (button.disabled) return;
            document.querySelectorAll('.class-button').forEach(b => b.classList.remove('selected'));
            button.classList.add('selected');
            selectedClass = button.dataset.class;
            if (selectedClass && !selectedClass.endsWith('_CLASS')) selectedClass += '_CLASS';
            updateUI(); saveCurrentSettings();
            if (autoGenerateOnClassChange) generateCharacter();
        });
    });
    // Default: Fighter
    const fighter = document.querySelector('.class-button[data-class="Fighter"]');
    if (fighter) { fighter.classList.add('selected'); selectedClass = 'Fighter_CLASS'; }
}

// ── Advanced: Race/Class Grid ─────────────────────────────────────────────────
export function initializeRaceClassGrid() {
    const buttons = document.querySelectorAll('.grid-button:not(.zero-race-btn)');
    buttons.forEach(btn => {
        const fresh = btn.cloneNode(true);
        btn.parentNode.replaceChild(fresh, btn);
    });
    document.querySelectorAll('.grid-button:not(.zero-race-btn)').forEach(button => {
        button.addEventListener('click', () => {
            if (button.disabled) return;
            document.querySelectorAll('.grid-button:not(.zero-race-btn)').forEach(b => b.classList.remove('selected'));
            button.classList.add('selected');
            selectedRace = button.dataset.race;
            selectedClass = button.dataset.class;
            if (selectedRace && !selectedRace.endsWith('_RACE'))   selectedRace  += '_RACE';
            if (selectedClass && !selectedClass.endsWith('_CLASS')) selectedClass += '_CLASS';
            updateUI(); saveCurrentSettings();
            if (autoGenerateOnClassChange) generateCharacter();
        });
    });
    // Default: Human Fighter
    const humanFighter = document.querySelector('.grid-button[data-race="Human"][data-class="Fighter"]');
    if (humanFighter) {
        humanFighter.classList.add('selected');
        selectedRace = 'Human_RACE'; selectedClass = 'Fighter_CLASS';
    }
}

// ── Zero-Level Race Selection ─────────────────────────────────────────────────
function initializeZeroLevelRaceSelection() {
    const container = document.getElementById('zeroRaceButtons');
    if (!container) return;
    container.querySelectorAll('.zero-race-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.zero-race-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedRaceForZero = btn.dataset.race;
            if (autoGenerateOnClassChange) generateCharacter();
        });
    });

    // Populate occupation dropdown with all professions sorted alphabetically
    const sel = document.getElementById('zeroOccupation');
    if (sel) {
        const tables = getAllBackgroundTables();
        // Gather all professions with their HP tier
        const all = [];
        for (const [hp, list] of Object.entries(tables)) {
            list.forEach(bg => all.push({ profession: bg.profession, hp: parseInt(hp) }));
        }
        all.sort((a, b) => a.profession.localeCompare(b.profession));
        all.forEach(({ profession }) => {
            const opt = document.createElement('option');
            opt.value = profession;
            opt.textContent = profession;
            sel.appendChild(opt);
        });
    }
}

// ── updateUI ──────────────────────────────────────────────────────────────────
export function updateUI() {
    const isZeroLevel = selectedLevel === 0;

    // ── Common: Zero-level vs 1+ section visibility ──
    const zeroSec = document.getElementById('zeroLevelSection');
    if (zeroSec) zeroSec.classList.toggle('section-greyed', !isZeroLevel);

    if (mode === 'basic') {
        // Basic: classSection + demihumanLimitSection
        const classSec = document.getElementById('classSection');
        if (classSec) classSec.classList.toggle('section-greyed', isZeroLevel);
        // Note: demihumanLimitSection is intentionally NOT greyed — the setting must
        // remain accessible at level 0 so it carries through to the character sheet.

        // Enforce demihuman level limits on class buttons
        const limits = getDemihumanLimits();
        if (getEffectiveDemihumanLimits() === 'standard' && selectedLevel) {
            document.querySelectorAll('.class-button').forEach(button => {
                const cn = button.dataset.class;
                const limit = limits[cn];
                if (limit && selectedLevel > limit) {
                    button.disabled = true;
                    if (selectedClass === `${cn}_CLASS`) {
                        selectedClass = 'Fighter_CLASS';
                        const fb = document.querySelector('.class-button[data-class="Fighter"]');
                        if (fb) { button.classList.remove('selected'); fb.classList.add('selected'); }
                    }
                } else {
                    button.disabled = false;
                }
            });
        } else {
            document.querySelectorAll('.class-button').forEach(b => { b.disabled = false; });
        }
    } else {
        // Advanced: raceClassSection
        const rcSec = document.getElementById('raceClassSection');
        if (rcSec) rcSec.classList.toggle('section-greyed', isZeroLevel);

        // Spellblade column always visible in Advanced
        const sbHeader = document.getElementById('spellbladeHeader');
        if (sbHeader) sbHeader.style.display = '';
        document.querySelectorAll('[data-class="Spellblade"]').forEach(btn => {
            if (btn.parentElement) btn.parentElement.style.display = '';
        });

        // Enable/disable grid buttons based on raceClassMode + level limits
        document.querySelectorAll('.grid-button:not(.zero-race-btn)').forEach(button => {
            const race = button.dataset.race;
            const className = button.dataset.class;
            const allowNonTraditional = (raceClassMode === 'allow-all');
            const availableClasses = getAvailableClasses(race, allowNonTraditional);
            let isAvailable = availableClasses.includes(className);
            if (raceClassMode === 'traditional-extended' && className === 'Spellblade') {
                isAvailable = (race === 'Human' || race === 'Elf');
            }
            if (isAvailable && (raceClassMode === 'strict' || raceClassMode === 'strict-human') && selectedLevel) {
                const maxLvl = getMaxLevel(`${race}_RACE`, `${className}_CLASS`, false);
                if (maxLvl !== null && selectedLevel > maxLvl) isAvailable = false;
            }
            button.disabled = !isAvailable;
            if (!isAvailable && selectedRace === `${race}_RACE` && selectedClass === `${className}_CLASS`) {
                selectedRace = null; selectedClass = null;
                button.classList.remove('selected');
            }
        });
    }

    // ── Common: Starting Wealth section ──
    const wealthSection = document.getElementById('startingWealthSection');
    const wealthPreview = document.getElementById('wealthPreview');
    if (wealthSection && wealthPreview) {
        const showWealth = selectedLevel && selectedLevel >= 2;
        wealthSection.classList.toggle('section-greyed', !showWealth);
        if (showWealth && selectedClass) {
            try {
                const classData = getClassDataForMode(progressionMode);
                const progData  = getProgData(selectedClass, selectedLevel, { STR:10,INT:10,WIS:10,DEX:10,CON:10,CHA:10 }, classData);
                const xpForLevel = progData?.xpForCurrentLevel || 0;
                wealthPreview.textContent = (xpForLevel > 0 && wealthPct > 0)
                    ? `= ${calcStartingGold(xpForLevel, wealthPct).toLocaleString()} gp (${wealthPct}% of ${xpForLevel.toLocaleString()} XP)`
                    : (wealthPct === 0 ? '= 0 gp' : '');
            } catch { wealthPreview.textContent = ''; }
        } else {
            wealthPreview.textContent = '';
        }
    }

    // ── Common: Generate button ──
    const generateButton = document.getElementById('generateButton');
    if (generateButton) {
        const isReady = selectedLevel !== null && (
            selectedLevel === 0 ||
            (mode === 'basic'    ? !!selectedClass : !!(selectedRace && selectedClass))
        );
        generateButton.disabled = !isReady;
    }
}

// ── Roll Abilities ────────────────────────────────────────────────────────────
function handleRollAbilities(silent = false) {
    const userMins = readScoresFromInputs();
    const classReqs = selectedClass ? getClassRequirements(selectedClass) : {};
    const effMins = { ...userMins };
    Object.keys(classReqs).forEach(a => { effMins[a] = Math.max(effMins[a] || 3, classReqs[a]); });

    if (primeRequisiteMode !== 'user' && selectedClass) {
        const prMin = parseInt(primeRequisiteMode);
        getPrimeRequisites(selectedClass).forEach(a => { effMins[a] = Math.max(effMins[a] || 3, prMin); });
    }

    if (mode === 'basic') {
        const { scores, attempts } = rollAbilities(effMins, false, selectedClass, primeRequisiteMode !== 'user' ? parseInt(primeRequisiteMode) : false);
        abilityScores = scores;
        _scoreRollAttempts = attempts;
        if (!silent) {
            ['STR','INT','WIS','DEX','CON','CHA'].forEach(a => { document.getElementById(`score${a}`).value = scores[a]; });
            updateModifiers();
        }
    } else {
        const { baseScores, adjustedScores, attempts } = rollAbilitiesAdvanced(effMins, selectedRace, selectedClass, false, false);
        abilityScores = adjustedScores;
        _scoreRollAttempts = attempts;
        if (!silent) {
            ['STR','INT','WIS','DEX','CON','CHA'].forEach(a => { document.getElementById(`score${a}`).value = baseScores[a]; });
            updateModifiers();
        }
    }
}

// ── Random Name ───────────────────────────────────────────────────────────────
function handleRandomName() {
    let race = 'Human';
    if (mode === 'basic' && selectedClass) {
        const classToRace = {
            'Dwarf_CLASS':'Dwarf','Elf_CLASS':'Elf','Halfling_CLASS':'Halfling','Gnome_CLASS':'Gnome',
            'Cleric_CLASS':'Human','Fighter_CLASS':'Human','Magic-User_CLASS':'Human','Thief_CLASS':'Human','Spellblade_CLASS':'Human'
        };
        race = classToRace[selectedClass] || 'Human';
    } else if (mode === 'advanced' && selectedRace) {
        race = selectedRace.replace('_RACE', '');
    }
    const name = getRandomName(race);
    document.getElementById('characterName').value = name;
    characterName = name;
}

// ── Zero-level wrapper ────────────────────────────────────────────────────────
async function generateZeroLevelChar() {
    const fixedScores = useFixedScores ? readScoresFromInputs() : null;
    const fixedName   = document.getElementById('characterName')?.value.trim() || '';
    const selectedOccupation = document.getElementById('zeroOccupation')?.value || '';
    const _fixedAdj = fixedAdjustments;
    fixedAdjustments = null;
    const opts = {
        race:                selectedRaceForZero,
        isAdvanced:          mode === 'advanced',
        humanRacialAbilities: true,
        isGygar:             progressionMode === 'gygar',
        minimums:            readScoresFromInputs(),
        primeReqMode:        primeRequisiteMode,
        healthyChars:        healthyCharacters,
        fixedScores,
        fixedName,
        fixedOccupation:     selectedOccupation || null,
        fixedAdjustments:    _fixedAdj,
    };
    console.log('[generateZeroLevelChar] Called with opts:', opts);
    const char = await generateZeroLevelCharacter(opts);
    _scoreRollAttempts = char.attempts || 1;
    console.log('[generateZeroLevelChar] Character generated:', char);
    const racialAbilities = getAdvancedModeRacialAbilities(char.race);
    console.log('[generateZeroLevelChar] Racial abilities:', racialAbilities);
    displayZeroLevelCharacter(char);
}

// ── Generate Character (dispatcher) ──────────────────────────────────────────
export function generateCharacter() {
    if (selectedLevel === 0) {
        generateZeroLevelChar().catch(e => console.error('0-level gen error:', e));
        return;
    }
    if (mode === 'basic') generateBasicCharacter();
    else                  generateAdvancedCharacter();
}

// ── Basic: Generate Character ─────────────────────────────────────────────────
function generateBasicCharacter() {
    if (!selectedLevel || !selectedClass) { alert('Please select a level and class first!'); return; }

    if (useFixedScores) {
        readAbilityScores();
        characterName = document.getElementById('characterName').value.trim();
        if (!characterName) {
            const classToRace = { 'Dwarf_CLASS':'Dwarf','Elf_CLASS':'Elf','Halfling_CLASS':'Halfling','Gnome_CLASS':'Gnome' };
            characterName = getRandomName(classToRace[selectedClass] || 'Human');
            document.getElementById('characterName').value = characterName;
        }
    } else {
        handleRollAbilities(true);
        const classToRace = { 'Dwarf_CLASS':'Dwarf','Elf_CLASS':'Elf','Halfling_CLASS':'Halfling','Gnome_CLASS':'Gnome' };
        characterName = getRandomName(classToRace[selectedClass] || 'Human');
    }

    // Apply custom adjustments from edit panel (preserves base scores for strikethrough display)
    let _preAdjScores = null;
    if (fixedAdjustments && Object.values(fixedAdjustments).some(v => v !== 0)) {
        _preAdjScores = { ...abilityScores };
        for (const a of ['STR','INT','WIS','DEX','CON','CHA']) {
            abilityScores[a] = Math.max(3, Math.min(18, abilityScores[a] + (fixedAdjustments[a] || 0)));
        }
    }
    fixedAdjustments = null;

    const displayMode = progressionMode === 'smooth' ? 'Smoothified' : progressionMode === 'll' ? 'Labyrinth Lord' : 'OSE Standard';
    const classData = getClassDataForMode(progressionMode);
    const conMod = calculateModifier(abilityScores.CON);

    const DEMIHUMAN_CLASSES = ['Dwarf_CLASS','Elf_CLASS','Halfling_CLASS','Gnome_CLASS'];
    const hasBlessed = !DEMIHUMAN_CLASSES.includes(selectedClass) && raceClassMode !== 'strict';
    const hpResult = rollHPBasic(selectedClass, selectedLevel, conMod, classData, includeLevel0HP, healthyCharacters, fixedHPRolls, hasBlessed);
    const progressionData = getProgBasic(selectedClass, selectedLevel, abilityScores, classData);
    const features = getClassFeatures(selectedClass, selectedLevel, classData, ClassDataShared);
    const racialAbilities = getRacialBasic(selectedClass);
    const background = getRandomBackground(hpResult.backgroundHP);

    let startingGold;
    if (fixedStartingGold !== null) { startingGold = fixedStartingGold; }
    else if (selectedLevel === 1)   { startingGold = rollStartingGold(progressionMode); }
    else                            { startingGold = calcStartingGold(progressionData.xpForCurrentLevel, wealthPct); }

    const dexMod = calculateModifier(abilityScores.DEX);
    const purchased = purchaseEquipment(selectedClass, startingGold, dexMod, background, progressionMode);

    const character = createCharacter({ level: selectedLevel, className: selectedClass, mode: displayMode,
        abilityScores, hp: hpResult.max, progressionData, features, racialAbilities, name: characterName, background, startingGold });
    character.hpRolls = hpResult.rolls;
    character.hpDice  = hpResult.dice;
    character.startingGold = startingGold;
    character.blessed = hasBlessed;
    if (_preAdjScores) character.originalScores = _preAdjScores;

    // Append human racial abilities to class abilities for basic human classes
    // Must be {name, description} objects to match the classAbilities renderer in shared-character-sheet.js
    if (hasBlessed) {
        const humanAbilities = [
            { name: 'Blessed',       description: 'Roll HP twice, take best at each level (does not apply to level 0 HP roll)' },
            { name: 'Decisiveness',  description: 'Act first on tied initiative (+1 to individual initiative)' },
            { name: 'Leadership',    description: 'Retainers/mercenaries +1 loyalty and morale' },
        ];
        character.classAbilities = [...(character.classAbilities || []), ...humanAbilities];
    }

    fixedHPRolls = null; fixedStartingGold = null;

    displayBasicCharacter(character, purchased);
}

// buildSheetSpec, CLASS_HD, PROG_CODE, CLS_CODE, RACE_CODE, RCM_CODE, sanitize
// are imported from './shared-sheet-builder.js' (see Imports section above).

/** Read current global display options (called once per displayXxx invocation). */
function sheetOpts() {
    return {
        showUndeadNames, showQRCode, abilityOrder: basicAbilityOrdering ? 1 : 0,
        openInNewTab:  document.getElementById('openInNewTab')?.checked||false,
        autoPrint:     document.getElementById('autoPrintInNewTab')?.checked||false,
        backgroundTab: openTabInBackground,
        acDisplayMode,
    };
}

function displayBasicCharacter(character, purchased) {
    const displayClass = character.class.replace('_CLASS', '');
    const xpBonus  = character.xp.bonus >= 0 ? `+${character.xp.bonus}%` : `${character.xp.bonus}%`;
    const hasRacial = character.racialAbilities?.length > 0;
    const hasClass  = character.classAbilities?.length  > 0;
    const hdStr    = `1d${CLASS_HD[character.class]||6}`;

    const sd = {
        title:    'OLD-SCHOOL ESSENTIALS',
        subtitle: `RETRO ADVENTURE GAME &nbsp;·&nbsp; ${character.mode} Mode`,
        name: character.name, occupation: character.background?.profession,
        raceClass: displayClass, level: character.level,
        hd: hdStr, xpBonus,
        maxHP: character.hp.max, initMod: character.abilityModifiers.DEX,
        abilityScores: ['STR','DEX','CON','INT','WIS','CHA'].map(a => ({
            name:a, score: character.abilityScores[a],
            originalScore: (character.originalScores && character.originalScores[a] !== character.abilityScores[a])
                ? character.originalScores[a] : null,
            effects: getModifierEffects(a, character.abilityModifiers[a], character.abilityScores[a])
        })),
        weapon: purchased.weapon, classAttackBonus: character.attackBonus,
        meleeMod: character.abilityModifiers.STR, rangedMod: character.abilityModifiers.DEX,
        thiefSkills: character.thiefSkills,
        abilitiesHeader: (hasRacial&&hasClass)?'RACIAL & CLASS ABILITIES':hasRacial?'RACIAL ABILITIES':'CLASS ABILITIES',
        racialAbilities: character.racialAbilities, classAbilities: character.classAbilities,
        savingThrows: character.savingThrows,
        experience: { current: character.xp.current, forLevel: character.level,
            forLevelXP: character.xp.forCurrentLevel, forNext: character.xp.forNextLevel, bonus: xpBonus },
        equipment: { armor: purchased.armor||null, shield: purchased.shield||false, items: purchased.items,
            startingAC: purchased.startingAC, startingGold: purchased.goldRemaining, startingHD: hdStr },
        spellSlots: character.spellSlots, turnUndead: character.turnUndead,
        cp: { v:2, m:'B', p: PROG_CODE[progressionMode]||'S', c: CLS_CODE[selectedClass]||'FI', l: character.level,
            s: ['STR','DEX','CON','INT','WIS','CHA'].map(a => character.abilityScores[a]),
            h: character.hp.max, hr: character.hpRolls||[], hd: character.hpDice||[],
            il: includeLevel0HP?1:0, n: character.name||'', bg: character.background?.profession||'',
            ar: purchased.armor||null, sh: purchased.shield?1:0, w: purchased.weapon||null,
            it: purchased.items||[], g: purchased.goldRemaining||0, ac: purchased.startingAC||10,
            dl: getEffectiveDemihumanLimits() === 'extended' ? 1 : 0,
            bl: character.blessed ? 1 : 0,
            un: showUndeadNames?1:0, qr: showQRCode?1:0, ap: document.getElementById('autoPrintInNewTab')?.checked?1:0,
            hc: healthyCharacters?1:0, wp: wealthPct, prm: primeRequisiteMode==='user'?0:parseInt(primeRequisiteMode),
            ao: basicAbilityOrdering?1:0,
            rr: _scoreRollAttempts, sm: ['STR','DEX','CON','INT','WIS','CHA'].map(a => readScoresFromInputs()[a] || 3),
            ...({'dac-matrix':1,'dual':2,'dual-matrix':3}[acDisplayMode] != null ? {adm:{'dac-matrix':1,'dual':2,'dual-matrix':3}[acDisplayMode]} : {}) },
        footer: (() => {
            const sm = ['STR','DEX','CON','INT','WIS','CHA'].map(a => readScoresFromInputs()[a] || 3);
            const o = buildOptionsLine({ m:'B', p: PROG_CODE[progressionMode]||'S', l: character.level,
                bl: character.blessed?1:0, dl: getEffectiveDemihumanLimits()==='extended'?1:0,
                hc: healthyCharacters?1:0, il: includeLevel0HP?1:0,
                prm: primeRequisiteMode==='user'?0:parseInt(primeRequisiteMode), wp: wealthPct,
                rr: _scoreRollAttempts, sm, fs: useFixedScores?1:0 });
            return `Level ${character.level} ${displayClass} &nbsp;·&nbsp; ${character.mode} Mode` +
                   (o ? `<br><small style="opacity:0.7;">${o}</small>` : '');
        })(),
        printTitle: `OSE Basic - ${sanitize(displayClass)} - Level ${character.level} - ${sanitize(character.background?.profession||'')} - ${sanitize(character.name)}`,
    };

    const spec = buildSheetSpec(sd, sheetOpts());
    spec.editState = {
        level: character.level, progressionMode, name: character.name||'',
        STR: character.originalScores?.STR ?? character.abilityScores.STR,
        INT: character.originalScores?.INT ?? character.abilityScores.INT,
        WIS: character.originalScores?.WIS ?? character.abilityScores.WIS,
        DEX: character.originalScores?.DEX ?? character.abilityScores.DEX,
        CON: character.originalScores?.CON ?? character.abilityScores.CON,
        CHA: character.originalScores?.CHA ?? character.abilityScores.CHA,
        adjSTR: character.originalScores?.STR != null ? character.abilityScores.STR - character.originalScores.STR : 0,
        adjINT: character.originalScores?.INT != null ? character.abilityScores.INT - character.originalScores.INT : 0,
        adjWIS: character.originalScores?.WIS != null ? character.abilityScores.WIS - character.originalScores.WIS : 0,
        adjDEX: character.originalScores?.DEX != null ? character.abilityScores.DEX - character.originalScores.DEX : 0,
        adjCON: character.originalScores?.CON != null ? character.abilityScores.CON - character.originalScores.CON : 0,
        adjCHA: character.originalScores?.CHA != null ? character.abilityScores.CHA - character.originalScores.CHA : 0,
        hpRolls: character.hpRolls||[], hpDice: character.hpDice||[], startingGold: character.startingGold||0,
        includeLevel0HP, showUndeadNames, showQRCode, conModifier: calculateModifier(character.abilityScores.CON),
        extraSections: [
            { label:'6. Demihuman Level Limits', name:'editDemihumanLimits', options:[
                { value:'standard', label:'Standard Limits', checked: demihumanLimits==='standard' },
                { value:'extended', label:'Extended to Level 14', checked: demihumanLimits==='extended' }
            ]},
            { label:'7. AC Display Mode', name:'editACDisplayMode', options:[
                { value:'aac', label:'Ascending Armor Class (AAC)', checked: acDisplayMode==='aac' },
                { value:'dac-matrix', label:'Descending AC with Attack Matrix', checked: acDisplayMode==='dac-matrix' },
                { value:'dual', label:'Dual Format (AAC and DAC)', checked: acDisplayMode==='dual' },
                { value:'dual-matrix', label:'Dual Format with Attack Matrix', checked: acDisplayMode==='dual-matrix' },
            ]},
        ]
    };
    spec.onEditUpdate = (values) => {
        selectedLevel = values.level; progressionMode = values.progressionMode; characterName = values.name;
        abilityScores = { STR:values.STR, INT:values.INT, WIS:values.WIS, DEX:values.DEX, CON:values.CON, CHA:values.CHA };
        const _adjVals = { STR:values.adjSTR||0, INT:values.adjINT||0, WIS:values.adjWIS||0, DEX:values.adjDEX||0, CON:values.adjCON||0, CHA:values.adjCHA||0 };
        fixedAdjustments = Object.values(_adjVals).some(v => v !== 0) ? _adjVals : null;
        if (values.editDemihumanLimits) demihumanLimits = values.editDemihumanLimits;
        if (values.editACDisplayMode) { acDisplayMode = values.editACDisplayMode; document.querySelectorAll('input[name="acDisplayMode"]').forEach(r => { r.checked = r.value===acDisplayMode; }); }
        includeLevel0HP = values.includeLevel0HP||false; showUndeadNames = values.showUndeadNames||false; showQRCode = values.showQRCode??true;
        fixedHPRolls = values.hpRolls?.length ? [...values.hpRolls] : null;
        fixedStartingGold = (values.startingGold!=null) ? parseInt(values.startingGold) : null;
        ['STR','INT','WIS','DEX','CON','CHA'].forEach(a => { const el=document.getElementById(`score${a}`); if(el) el.value=values[a]; });
        const nameEl = document.getElementById('characterName'); if(nameEl) nameEl.value = characterName;
        document.querySelectorAll('.level-btn').forEach(b => b.classList.toggle('selected', parseInt(b.dataset.level)===selectedLevel));
        document.querySelectorAll('input[name="progressionMode"]').forEach(r => { r.checked = r.value===progressionMode; });
        document.querySelectorAll('input[name="demihumanLimits"]').forEach(r => { r.checked = r.value===demihumanLimits; });
        const l0El=document.getElementById('includeLevel0HP'); if(l0El) l0El.checked=includeLevel0HP;
        const unEl=document.getElementById('showUndeadNames');  if(unEl) unEl.checked=showUndeadNames;
        useFixedScores=true; const fixEl=document.getElementById('useFixedScores'); if(fixEl) fixEl.checked=true;
        generateCharacter();
    };
    displayCharacterSheet(spec, document.getElementById('characterInfo'), document.getElementById('characterDisplay'));
}

// ── Advanced: Generate Character ──────────────────────────────────────────────
function generateAdvancedCharacter() {
    if (!selectedLevel || !selectedRace || !selectedClass) { alert('Please select a level, race, and class first!'); return; }

    const classData = getClassDataForMode(progressionMode);
    let baseScores, adjustedScores;

    if (useFixedScores) {
        characterName = document.getElementById('characterName').value.trim();
        if (!characterName) {
            characterName = getRandomName(selectedRace.replace('_RACE',''));
            document.getElementById('characterName').value = characterName;
        }
        baseScores = readScoresFromInputs();
        if (fixedAdjustments) {
            adjustedScores = {};
            for (const a of ['STR','INT','WIS','DEX','CON','CHA']) {
                adjustedScores[a] = baseScores[a] + (fixedAdjustments[a] || 0);
            }
        } else {
            adjustedScores = applyRacialAdjustments(baseScores, selectedRace);
        }
    } else {
        characterName = getRandomName(selectedRace.replace('_RACE',''));
        const userMins = readScoresFromInputs();
        const classReqs = getClassRequirements(selectedClass);
        const effMins = { ...userMins };
        Object.keys(classReqs).forEach(a => { effMins[a] = Math.max(effMins[a]||3, classReqs[a]); });
        if (primeRequisiteMode !== 'user') {
            const prMin = parseInt(primeRequisiteMode);
            getPrimeRequisites(selectedClass).forEach(a => { effMins[a] = Math.max(effMins[a]||3, prMin); });
        }
        const result = rollAbilitiesAdvanced(effMins, selectedRace, selectedClass, false, false);
        baseScores = result.baseScores; adjustedScores = result.adjustedScores;
        _scoreRollAttempts = result.attempts || 1;
    }

    const abilityModifiers = {};
    for (const a in adjustedScores) abilityModifiers[a] = calculateModifier(adjustedScores[a]);

    const racialAbilitiesForBlessed = getRacialAdvanced(selectedRace, raceClassMode);
    const hasBlessed = racialAbilitiesForBlessed.some(ab => ab.includes('Blessed'));

    const hpResult = rollHPAdvanced(selectedClass, selectedLevel, abilityModifiers.CON, classData, includeLevel0HP, false, hasBlessed, fixedHPRolls);
    const background = getRandomBackground(hpResult.backgroundHP);
    const progressionData = getProgAdvanced(selectedClass, selectedLevel, adjustedScores, classData);

    let startingGold;
    if (fixedStartingGold !== null)  { startingGold = fixedStartingGold; }
    else if (selectedLevel === 1)    { startingGold = rollStartingGold(progressionMode); }
    else                             { startingGold = calcStartingGold(progressionData?.xpForCurrentLevel||0, wealthPct); }

    const purchased = purchaseEquipment(selectedClass, startingGold, abilityModifiers.DEX, background, progressionMode);
    const character = createCharacterAdvanced({ level: selectedLevel, race: selectedRace, className: selectedClass,
        baseScores, adjustedScores, hp: hpResult.max, classData, ClassDataShared, progressionMode, raceClassMode, name: characterName, background });
    character.hpRolls = hpResult.rolls; character.hpDice = hpResult.dice; character.startingGold = startingGold;
    fixedHPRolls = null; fixedStartingGold = null; fixedAdjustments = null;

    displayAdvancedCharacter(character, purchased);
}

function displayAdvancedCharacter(character, purchased) {
    const raceDisplay  = getRaceDisplayName(character.race);
    const classDisplay = getClassDisplayName(character.class);
    const modeLabel    = progressionMode==='smooth'?'Smoothified':progressionMode==='ll'?'Labyrinth Lord':'OSE Standard';
    const xpBonus      = character.xp.bonus>=0?`+${character.xp.bonus}%`:`${character.xp.bonus}%`;
    const hasRacial    = character.racialAbilities?.length>0, hasClass = character.classAbilities?.length>0;
    const adjArr = ['STR','DEX','CON','INT','WIS','CHA'].map(a=>character.adjustedScores[a]);
    const baseArr = ['STR','DEX','CON','INT','WIS','CHA'].map(a=>character.baseScores[a]);
    const hasAdj = adjArr.some((v,i)=>v!==baseArr[i]);
    const raceClassDisplay = (hideHumanRace && raceDisplay==='Human')
        ? classDisplay
        : (raceDisplay===classDisplay ? raceDisplay : `${raceDisplay} ${classDisplay}`);
    const hdStr = `1d${CLASS_HD[character.class]||6}`;

    const sd = {
        title:    'OLD-SCHOOL ESSENTIALS ADVANCED',
        subtitle: `RETRO ADVENTURE GAME &nbsp;·&nbsp; ${modeLabel} Mode`,
        name: character.name, occupation: character.background?.profession,
        raceClass: raceClassDisplay, level: character.level,
        hd: hdStr, xpBonus,
        maxHP: character.hp.max, initMod: character.abilityModifiers.DEX,
        abilityScores: ['STR','DEX','CON','INT','WIS','CHA'].map(a=>({
            name:a, score:character.adjustedScores[a],
            originalScore:(character.baseScores[a]!==character.adjustedScores[a])?character.baseScores[a]:null,
            effects:getModifierEffects(a,character.abilityModifiers[a],character.adjustedScores[a])
        })),
        weapon: purchased.weapon, classAttackBonus: character.attackBonus,
        meleeMod: character.abilityModifiers.STR, rangedMod: character.abilityModifiers.DEX,
        thiefSkills: character.thiefSkills,
        abilitiesHeader: (hasRacial&&hasClass)?'RACIAL & CLASS ABILITIES':hasRacial?'RACIAL ABILITIES':'CLASS ABILITIES',
        racialAbilities: character.racialAbilities, classAbilities: character.classAbilities,
        savingThrows: character.savingThrows,
        experience: { current:character.xp.current, forLevel:character.level,
            forLevelXP:character.xp.forCurrentLevel, forNext:character.xp.forNextLevel, bonus:xpBonus },
        equipment: { armor:purchased.armor||null, shield:purchased.shield||false, items:purchased.items,
            startingAC:purchased.startingAC, startingGold:purchased.goldRemaining, startingHD:hdStr },
        spellSlots: character.spellSlots, turnUndead: character.turnUndead,
        cp: { v:2, m:'A', p:PROG_CODE[progressionMode]||'S', r:RACE_CODE[selectedRace]||'HU', c:CLS_CODE[selectedClass]||'FI', l:character.level,
            s:adjArr, ...(hasAdj?{bs:baseArr}:{}), h:character.hp.max, hr:character.hpRolls||[], hd:character.hpDice||[],
            il:includeLevel0HP?1:0, n:character.name||'', bg:character.background?.profession||'',
            ar:purchased.armor||null, sh:purchased.shield?1:0, w:purchased.weapon||null, it:purchased.items||[],
            g:purchased.goldRemaining||0, ac:purchased.startingAC||10, rcm:RCM_CODE[raceClassMode]||'SH',
            un:showUndeadNames?1:0, qr:showQRCode?1:0, ap:document.getElementById('autoPrintInNewTab')?.checked?1:0,
            hc:healthyCharacters?1:0, wp:wealthPct, prm:primeRequisiteMode==='user'?0:parseInt(primeRequisiteMode), ao:basicAbilityOrdering?1:0,
            ...(hideHumanRace?{hhr:1}:{}),
            rr: _scoreRollAttempts, sm: ['STR','DEX','CON','INT','WIS','CHA'].map(a => readScoresFromInputs()[a] || 3),
            ...({'dac-matrix':1,'dual':2,'dual-matrix':3}[acDisplayMode] != null ? {adm:{'dac-matrix':1,'dual':2,'dual-matrix':3}[acDisplayMode]} : {}) },
        footer: (() => {
            const sm = ['STR','DEX','CON','INT','WIS','CHA'].map(a => readScoresFromInputs()[a] || 3);
            const o = buildOptionsLine({ m:'A', p:PROG_CODE[progressionMode]||'S', l:character.level,
                rcm:RCM_CODE[raceClassMode]||'SH', hc:healthyCharacters?1:0, il:includeLevel0HP?1:0,
                prm:primeRequisiteMode==='user'?0:parseInt(primeRequisiteMode), wp:wealthPct,
                rr: _scoreRollAttempts, sm, fs: useFixedScores?1:0 });
            return `Level ${character.level} ${raceDisplay} ${classDisplay} &nbsp;·&nbsp; ${modeLabel} Mode` +
                   (o ? `<br><small style="opacity:0.7;">${o}</small>` : '');
        })(),
        printTitle: `OSE Advanced - ${sanitize(raceDisplay)} - ${sanitize(classDisplay)} - Level ${character.level} - ${sanitize(character.background?.profession||'')} - ${sanitize(character.name)}`,
    };

    const spec = buildSheetSpec(sd, sheetOpts());
    spec.editState = {
        level:character.level, progressionMode, name:character.name||'',
        STR:character.baseScores.STR, INT:character.baseScores.INT, WIS:character.baseScores.WIS,
        DEX:character.baseScores.DEX, CON:character.baseScores.CON, CHA:character.baseScores.CHA,
        adjSTR:character.adjustedScores.STR-character.baseScores.STR,
        adjINT:character.adjustedScores.INT-character.baseScores.INT,
        adjWIS:character.adjustedScores.WIS-character.baseScores.WIS,
        adjDEX:character.adjustedScores.DEX-character.baseScores.DEX,
        adjCON:character.adjustedScores.CON-character.baseScores.CON,
        adjCHA:character.adjustedScores.CHA-character.baseScores.CHA,
        hpRolls:character.hpRolls||[], hpDice:character.hpDice||[], startingGold:character.startingGold||0,
        includeLevel0HP, showUndeadNames, showQRCode, conModifier:calculateModifier(character.adjustedScores.CON),
        extraSections:[
            {label:'6. Race/Class Restrictions',name:'editRaceClassMode',options:[
                {value:'strict',label:'Strict OSE',checked:raceClassMode==='strict'},
                {value:'strict-human',label:'Strict + Human Abilities',checked:raceClassMode==='strict-human'},
                {value:'traditional-extended',label:'Traditional Extended',checked:raceClassMode==='traditional-extended'},
                {value:'allow-all',label:'Allow All',checked:raceClassMode==='allow-all'}
            ]},
            {label:'7. AC Display Mode',name:'editACDisplayMode',options:[
                {value:'aac',label:'Ascending Armor Class (AAC)',checked:acDisplayMode==='aac'},
                {value:'dac-matrix',label:'Descending AC with Attack Matrix',checked:acDisplayMode==='dac-matrix'},
                {value:'dual',label:'Dual Format (AAC and DAC)',checked:acDisplayMode==='dual'},
                {value:'dual-matrix',label:'Dual Format with Attack Matrix',checked:acDisplayMode==='dual-matrix'},
            ]},
        ]
    };
    spec.onEditUpdate = (values) => {
        selectedLevel=values.level; progressionMode=values.progressionMode; characterName=values.name;
        abilityScores={STR:values.STR,INT:values.INT,WIS:values.WIS,DEX:values.DEX,CON:values.CON,CHA:values.CHA};
        const _adjValsAdv = { STR:values.adjSTR||0, INT:values.adjINT||0, WIS:values.adjWIS||0, DEX:values.adjDEX||0, CON:values.adjCON||0, CHA:values.adjCHA||0 };
        fixedAdjustments = Object.values(_adjValsAdv).some(v => v !== 0) ? _adjValsAdv : null;
        if(values.editRaceClassMode) raceClassMode=values.editRaceClassMode;
        if(values.editACDisplayMode) { acDisplayMode=values.editACDisplayMode; document.querySelectorAll('input[name="acDisplayMode"]').forEach(r=>{r.checked=r.value===acDisplayMode;}); }
        includeLevel0HP=values.includeLevel0HP||false; showUndeadNames=values.showUndeadNames||false; showQRCode=values.showQRCode??true;
        fixedHPRolls=values.hpRolls?.length?[...values.hpRolls]:null;
        fixedStartingGold=(values.startingGold!=null)?parseInt(values.startingGold):null;
        ['STR','INT','WIS','DEX','CON','CHA'].forEach(a=>{const el=document.getElementById(`score${a}`);if(el)el.value=values[a];});
        const nameEl=document.getElementById('characterName'); if(nameEl) nameEl.value=characterName;
        document.querySelectorAll('.level-btn').forEach(b=>b.classList.toggle('selected',parseInt(b.dataset.level)===selectedLevel));
        document.querySelectorAll('input[name="progressionMode"]').forEach(r=>{r.checked=r.value===progressionMode;});
        document.querySelectorAll('input[name="raceClassMode"]').forEach(r=>{r.checked=r.value===raceClassMode;});
        const l0El=document.getElementById('includeLevel0HP'); if(l0El) l0El.checked=includeLevel0HP;
        const unEl=document.getElementById('showUndeadNames');  if(unEl) unEl.checked=showUndeadNames;
        useFixedScores=true; const fixEl=document.getElementById('useFixedScores'); if(fixEl) fixEl.checked=true;
        generateCharacter();
    };
    displayCharacterSheet(spec, document.getElementById('characterInfo'), document.getElementById('characterDisplay'));
}

function displayZeroLevelCharacter(char) {
    const racialAbilities = getAdvancedModeRacialAbilities(char.race);
    const raceDisplay = char.race.replace('_RACE','');
    const modeLabel   = mode==='advanced' ? (progressionMode==='smooth'?'Smoothified':progressionMode==='ll'?'Labyrinth Lord':'OSE Standard') : '';
    const sv = char.savingThrows;
    const ABILITIES = ['STR','DEX','CON','INT','WIS','CHA'];
    const adjArr  = ABILITIES.map(a=>char.results.find(r=>r.ability===a).roll);
    const baseArr = ABILITIES.map(a=>{ const r=char.results.find(x=>x.ability===a); return r.originalRoll ?? r.roll; });
    const hasAdj  = adjArr.some((v,i)=>v!==baseArr[i]);
    const svArr   = [sv.Death,sv.Wands,sv.Paralysis,sv.Breath,sv.Spells];
    const isAdv   = mode==='advanced';

    const sd = {
        title:    isAdv ? 'OLD-SCHOOL ESSENTIALS ADVANCED' : 'OLD-SCHOOL ESSENTIALS',
        subtitle: isAdv ? `RETRO ADVENTURE GAME &nbsp;·&nbsp; ${modeLabel} Mode` : 'RETRO ADVENTURE GAME',
        name: char.name, occupation: char.background.profession,
        raceClass: '', level: '0', hd: '', xpBonus: '',
        maxHP: char.hitPoints.total, initMod: char.results.find(r=>r.ability==='DEX').modifier,
        abilityScores: ABILITIES.map(a=>{const r=char.results.find(x=>x.ability===a);return{name:a,score:r.roll,originalScore:(r.originalRoll!==undefined&&r.originalRoll!==r.roll)?r.originalRoll:null,effects:getModifierEffects(a,r.modifier,r.roll)};}),
        weapon: char.background.weapon, classAttackBonus: char.attackBonus||0,
        meleeMod: char.results.find(r=>r.ability==='STR').modifier,
        rangedMod: char.results.find(r=>r.ability==='DEX').modifier,
        thiefSkills: null,
        abilitiesHeader: 'RACIAL ABILITIES',
        racialAbilities: racialAbilities||[], classAbilities: [],
        savingThrows: {death:sv.Death,wands:sv.Wands,paralysis:sv.Paralysis,breath:sv.Breath,spells:sv.Spells},
        experience: null,
        equipment: {armor:char.background.armor||null,items:char.background.item||[],
            startingAC:char.armorClass,startingGold:char.startingGold,startingHD:'1d4'},
        spellSlots: null, turnUndead: null,
        cp: { v:2, m:isAdv?'A':'B', l:0, r:char.raceCode, p:(PROG_CODE[progressionMode]||'O'),
            s:adjArr, ...(hasAdj?{bs:baseArr}:{}), sv:svArr, h:char.hitPoints.total, hr:[char.hitPoints.total], hd:[4],
            n:char.name, bg:char.background.profession, ar:char.background.armor||null,
            w:char.background.weapon||null, it:char.background.item||[], g:char.startingGold, ac:char.armorClass,
            bl:raceClassMode!=='strict'?1:0, hc:healthyCharacters?1:0,
            ...(isAdv?{rcm:(RCM_CODE[raceClassMode]||'ST')}:{dl:getEffectiveDemihumanLimits()==='extended'?1:0}),
            prm:primeRequisiteMode==='user'?0:parseInt(primeRequisiteMode),
            rr:_scoreRollAttempts, sm:['STR','DEX','CON','INT','WIS','CHA'].map(a=>readScoresFromInputs()[a]||3),
            un:showUndeadNames?1:0, qr:showQRCode?1:0, ap:document.getElementById('autoPrintInNewTab')?.checked?1:0, ao:basicAbilityOrdering?1:0,
            ...({'dac-matrix':1,'dual':2,'dual-matrix':3}[acDisplayMode] != null ? {adm:{'dac-matrix':1,'dual':2,'dual-matrix':3}[acDisplayMode]} : {}) },
        footer: (() => {
            const sm = ['STR','DEX','CON','INT','WIS','CHA'].map(a => readScoresFromInputs()[a] || 3);
            const o = buildOptionsLine({ m:isAdv?'A':'B', p:PROG_CODE[progressionMode]||'O', l:0,
                ...(isAdv?{rcm:RCM_CODE[raceClassMode]||'ST'}:{bl:raceClassMode!=='strict'?1:0, dl:getEffectiveDemihumanLimits()==='extended'?1:0}),
                hc:healthyCharacters?1:0,
                prm:primeRequisiteMode==='user'?0:parseInt(primeRequisiteMode),
                rr:_scoreRollAttempts, sm, fs:useFixedScores?1:0 });
            return `0-Level ${raceDisplay}${isAdv?` &nbsp;·&nbsp; ${modeLabel} Mode`:''}` +
                   (o ? `<br><small style="opacity:0.7;">${o}</small>` : '');
        })(),
        printTitle: `OSE ${isAdv?'Advanced':'Basic'} - ${sanitize(raceDisplay)} - 0-Level - ${sanitize(char.background.profession)} - ${sanitize(char.name)}`,
    };

    // Build base/adj maps for editState
    const _0lvlBase = {}, _0lvlAdj = {};
    ABILITIES.forEach((a, i) => { _0lvlBase[a] = baseArr[i]; _0lvlAdj[`adj${a}`] = adjArr[i] - baseArr[i]; });

    const spec = buildSheetSpec(sd, sheetOpts());
    spec.editState = {
        level: 0, progressionMode, name: char.name||'',
        STR:_0lvlBase.STR, INT:_0lvlBase.INT, WIS:_0lvlBase.WIS,
        DEX:_0lvlBase.DEX, CON:_0lvlBase.CON, CHA:_0lvlBase.CHA,
        ..._0lvlAdj,
        hpRolls:[], hpDice:[],  // no HP editing for 0-level
        startingGold: char.startingGold||0,
        conModifier: char.results.find(r=>r.ability==='CON').modifier,
        showUndeadNames, showQRCode,
        includeLevel0HP: false,
    };
    spec.onEditUpdate = (values) => {
        characterName = values.name;
        abilityScores = { STR:values.STR, INT:values.INT, WIS:values.WIS, DEX:values.DEX, CON:values.CON, CHA:values.CHA };
        const _adjVals0 = { STR:values.adjSTR||0, INT:values.adjINT||0, WIS:values.adjWIS||0, DEX:values.adjDEX||0, CON:values.adjCON||0, CHA:values.adjCHA||0 };
        fixedAdjustments = Object.values(_adjVals0).some(v => v !== 0) ? _adjVals0 : null;
        showUndeadNames = values.showUndeadNames||false; showQRCode = values.showQRCode??true;
        ['STR','INT','WIS','DEX','CON','CHA'].forEach(a => { const el=document.getElementById(`score${a}`); if(el) el.value=values[a]; });
        const nameEl = document.getElementById('characterName'); if(nameEl) nameEl.value = characterName;
        useFixedScores = true; const fixEl=document.getElementById('useFixedScores'); if(fixEl) fixEl.checked=true;
        generateZeroLevelChar().catch(e => console.error('0-level edit gen error:', e));
    };
    displayCharacterSheet(spec, document.getElementById('characterInfo'), document.getElementById('characterDisplay'));
}

// ── Settings Persistence ──────────────────────────────────────────────────────
function saveCurrentSettings() {
    saveSettings(getSettingsKey(), {
        mode, acDisplayMode,
        progressionMode, primeRequisiteMode, healthyCharacters, includeLevel0HP,
        useFixedScores, showUndeadNames, hideHumanRace, basicAbilityOrdering, wealthPct,
        autoGenerateOnLevelChange, autoGenerateOnClassChange, autoGenerateOnLoad,
        selectedLevel, selectedClass, characterName: document.getElementById('characterName')?.value||'',
        scoreSTR: parseInt(document.getElementById('scoreSTR')?.value)||3,
        scoreINT: parseInt(document.getElementById('scoreINT')?.value)||3,
        scoreWIS: parseInt(document.getElementById('scoreWIS')?.value)||3,
        scoreDEX: parseInt(document.getElementById('scoreDEX')?.value)||3,
        scoreCON: parseInt(document.getElementById('scoreCON')?.value)||6,
        scoreCHA: parseInt(document.getElementById('scoreCHA')?.value)||3,
        // Both mode-specific fields always saved so switching modes preserves them
        demihumanLimits, raceClassMode, selectedRace,
    });
    syncURLParams();
}

// ── URL Sync ──────────────────────────────────────────────────────────────────
function syncURLParams() {
    const p = new URLSearchParams();
    p.set('mode', mode);
    if (progressionMode !== 'ose')                                 p.set('p', progressionMode);
    if (selectedLevel !== null)                                    p.set('l', String(selectedLevel));
    if (selectedClass)                                             p.set('c', selectedClass.replace('_CLASS',''));
    if (mode === 'advanced' && selectedRace)                       p.set('r', selectedRace.replace('_RACE',''));
    if (mode === 'basic' && demihumanLimits !== 'standard')        p.set('dl', demihumanLimits);
    if (mode === 'advanced' && raceClassMode !== 'strict')         p.set('rcm', raceClassMode);
    if (primeRequisiteMode !== 'user')                             p.set('prm', primeRequisiteMode);
    if (healthyCharacters)                                         p.set('hc', '1');
    if (includeLevel0HP)                                           p.set('il', '1');
    if (showUndeadNames)                                           p.set('un', '1');
    if (hideHumanRace && mode === 'advanced')                      p.set('hhr', '1');
    if (!basicAbilityOrdering)                                     p.set('ao', '0');
    if (wealthPct !== 50)                                          p.set('wp', String(wealthPct));
    if (autoGenerateOnLevelChange)                                 p.set('agl', '1');
    if (autoGenerateOnClassChange)                                 p.set('agc', '1');
    if (autoGenerateOnLoad)                                        p.set('ago', '1');
    const n = document.getElementById('characterName')?.value.trim();
    if (n) p.set('n', n);
    // Ability score minimums — only emit when any differ from defaults
    const scoreOrder = ['STR','INT','WIS','DEX','CON','CHA'];
    const scoreDefs  = { STR:3, INT:3, WIS:3, DEX:3, CON:6, CHA:3 };
    const scoreVals  = scoreOrder.map(a => parseInt(document.getElementById(`score${a}`)?.value) || scoreDefs[a]);
    if (scoreVals.some((v, i) => v !== scoreDefs[scoreOrder[i]])) {
        p.set('s', scoreVals.join(','));
    }
    window.history.replaceState({}, '', `${window.location.pathname}?${p.toString()}`);
}

// ── Share / QR Code ───────────────────────────────────────────────────────────
function showShareQR() {
    const url = window.location.href;
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}`;

    document.getElementById('shareModal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'shareModal';

    const backdrop = document.createElement('div');
    backdrop.className = 'share-modal-backdrop';
    backdrop.addEventListener('click', () => modal.remove());

    const box = document.createElement('div');
    box.className = 'share-modal-box';

    const heading = document.createElement('h3');
    heading.style.marginTop = '0';
    heading.textContent = '📱 Share this Configuration';

    const img = document.createElement('img');
    img.src = qrSrc;
    img.alt = 'QR Code';
    img.style.cssText = 'display:block;margin:0 auto 12px;border:1px solid #ccc;';

    const urlBox = document.createElement('div');
    urlBox.style.cssText = 'word-break:break-all;font-size:10px;color:#555;background:#f5f5f5;padding:8px;border-radius:3px;margin-bottom:12px;user-select:all;';
    urlBox.textContent = url;

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'roll-button';
    copyBtn.style.marginTop = '0';
    copyBtn.textContent = '📋 Copy Link';
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(url);
            copyBtn.textContent = '✅ Copied!';
            setTimeout(() => { copyBtn.textContent = '📋 Copy Link'; }, 2000);
        } catch { copyBtn.textContent = '❌ Failed'; }
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'roll-button';
    closeBtn.style.marginTop = '0';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', () => modal.remove());

    btnRow.appendChild(copyBtn);
    btnRow.appendChild(closeBtn);
    box.appendChild(heading);
    box.appendChild(img);
    box.appendChild(urlBox);
    box.appendChild(btnRow);
    modal.appendChild(backdrop);
    modal.appendChild(box);
    document.body.appendChild(modal);
}

function applySettings(s) {
    if (!s) return;
    if (s.progressionMode) { progressionMode=s.progressionMode; document.querySelectorAll('input[name="progressionMode"]').forEach(r=>{r.checked=r.value===s.progressionMode;}); }
    if (s.demihumanLimits) { demihumanLimits=s.demihumanLimits; document.querySelectorAll('input[name="demihumanLimits"]').forEach(r=>{r.checked=r.value===s.demihumanLimits;}); }
    if (s.raceClassMode) {
        raceClassMode = s.raceClassMode;
        // Basic + Advanced share name="raceClassMode" — set all false, then check active section's radio
        document.querySelectorAll('input[name="raceClassMode"]').forEach(r=>{r.checked=false;});
        const RCM_IDS_BASIC = {strict:'basicStrict','strict-human':'basicStrictHuman','traditional-extended':'basicTraditionalExtended'};
        const RCM_IDS_ADV   = {strict:'strictOSE','strict-human':'strictOSEHuman','traditional-extended':'traditionalExtended','allow-all':'allowAll'};
        const _id = (mode==='basic' ? RCM_IDS_BASIC : RCM_IDS_ADV)[s.raceClassMode];
        if (_id) { const el=document.getElementById(_id); if(el) el.checked=true; }
    }
    if (s.primeRequisiteMode!==undefined) { primeRequisiteMode=s.primeRequisiteMode; document.querySelectorAll('input[name="primeRequisiteMode"]').forEach(r=>{r.checked=r.value===s.primeRequisiteMode;}); }
    const setBool = (k, id) => { if(s[k]!==undefined){ const el=document.getElementById(id); if(el) el.checked=s[k]; }};
    if (s.healthyCharacters!==undefined)         { healthyCharacters=s.healthyCharacters;                 setBool('healthyCharacters','healthyCharacters'); }
    if (s.includeLevel0HP!==undefined)           { includeLevel0HP=s.includeLevel0HP;                     setBool('includeLevel0HP','includeLevel0HP'); }
    if (s.useFixedScores!==undefined)            { useFixedScores=s.useFixedScores;                       setBool('useFixedScores','useFixedScores'); }
    if (s.showUndeadNames!==undefined)           { showUndeadNames=s.showUndeadNames;                     setBool('showUndeadNames','showUndeadNames'); }
    if (s.hideHumanRace!==undefined)             { hideHumanRace=s.hideHumanRace;                       setBool('hideHumanRace','hideHumanRace'); }
    if (s.acDisplayMode!==undefined) { acDisplayMode=s.acDisplayMode; document.querySelectorAll('input[name="acDisplayMode"]').forEach(r=>{r.checked=r.value===s.acDisplayMode;}); }
    if (s.basicAbilityOrdering!==undefined)      { basicAbilityOrdering=s.basicAbilityOrdering;           setBool('basicAbilityOrdering','basicAbilityOrdering'); }
    if (s.autoGenerateOnLevelChange!==undefined) { autoGenerateOnLevelChange=s.autoGenerateOnLevelChange; setBool('autoGenerateOnLevelChange','autoGenerateOnLevelChange'); }
    if (s.autoGenerateOnClassChange!==undefined) { autoGenerateOnClassChange=s.autoGenerateOnClassChange; setBool('autoGenerateOnClassChange','autoGenerateOnClassChange'); }
    if (s.autoGenerateOnLoad!==undefined)        { autoGenerateOnLoad=s.autoGenerateOnLoad;               setBool('autoGenerateOnLoad','autoGenerateOnLoad'); }
    if (s.wealthPct!==undefined) { wealthPct=s.wealthPct; document.querySelectorAll('input[name="wealthPct"]').forEach(r=>{r.checked=parseInt(r.value)===s.wealthPct;}); }
    if (s.selectedLevel!==undefined&&s.selectedLevel!==null) {
        selectedLevel=s.selectedLevel;
        document.querySelectorAll('.level-btn').forEach(b=>b.classList.toggle('selected',parseInt(b.dataset.level)===s.selectedLevel));
    }
    if (s.selectedClass) {
        selectedClass=s.selectedClass;
        document.querySelectorAll('.class-button').forEach(b=>{ const c=b.dataset.class?`${b.dataset.class}_CLASS`:null; b.classList.toggle('selected',c===s.selectedClass); });
    }
    if (s.selectedRace&&s.selectedClass) {
        selectedRace=s.selectedRace; selectedClass=s.selectedClass;
        document.querySelectorAll('.grid-button:not(.zero-race-btn)').forEach(b=>{
            const r=b.dataset.race?`${b.dataset.race}_RACE`:null, c=b.dataset.class?`${b.dataset.class}_CLASS`:null;
            b.classList.toggle('selected',r===s.selectedRace&&c===s.selectedClass);
        });
    }
    if (s.characterName!==undefined) { characterName=s.characterName; const el=document.getElementById('characterName'); if(el) el.value=s.characterName; }
    ['STR','INT','WIS','DEX','CON','CHA'].forEach(a=>{
        const v=s[`score${a}`]; if(v!==undefined){ const el=document.getElementById(`score${a}`); if(el) el.value=v; }
    });
    updateModifiers();
}

function handleResetSettings() {
    clearSettings(getSettingsKey());
    progressionMode='ose'; primeRequisiteMode='user'; demihumanLimits='standard'; raceClassMode='strict';
    healthyCharacters=false; includeLevel0HP=false; useFixedScores=false; showUndeadNames=false; hideHumanRace=false;
    basicAbilityOrdering=true; wealthPct=50; acDisplayMode='aac';
    document.querySelectorAll('input[name="acDisplayMode"]').forEach(r=>{r.checked=r.value==='aac';});
    autoGenerateOnLevelChange=false; autoGenerateOnClassChange=false; autoGenerateOnLoad=false;
    document.querySelectorAll('input[name="progressionMode"]').forEach(r=>{r.checked=r.value==='ose';});
    document.querySelectorAll('input[name="demihumanLimits"]').forEach(r=>{r.checked=r.value==='standard';});
    // Basic + Advanced share name="raceClassMode" — set all to false first, then check only the active section's radio
    document.querySelectorAll('input[name="raceClassMode"]').forEach(r=>{r.checked=false;});
    const _rcmId = mode==='basic' ? 'basicStrict' : 'strictOSE';
    const _rcmEl = document.getElementById(_rcmId); if(_rcmEl) _rcmEl.checked=true;
    document.querySelectorAll('input[name="primeRequisiteMode"]').forEach(r=>{r.checked=r.value==='user';});
    document.querySelectorAll('input[name="wealthPct"]').forEach(r=>{r.checked=parseInt(r.value)===50;});
    ['healthyCharacters','useFixedScores','showUndeadNames','hideHumanRace','openInNewTab','autoPrintInNewTab'].forEach(id=>{const el=document.getElementById(id);if(el)el.checked=false;});
    ['autoGenerateOnLevelChange','autoGenerateOnClassChange','autoGenerateOnLoad'].forEach(id=>{const el=document.getElementById(id);if(el)el.checked=false;});
    const aoEl=document.getElementById('basicAbilityOrdering'); if(aoEl) aoEl.checked=true;
    ['STR','INT','WIS','DEX','CON','CHA'].forEach(a=>{const el=document.getElementById(`score${a}`);if(el)el.value=(a==='CON'?6:3);});
    updateModifiers(); updateUI();
    // Clear the URL back to bare pathname — no stale params after reset
    window.history.replaceState({}, '', window.location.pathname);
}

// ── URL Params ────────────────────────────────────────────────────────────────
function readURLParams() {
    const p = new URLSearchParams(window.location.search);
    if (!p.toString()) return {};
    const s = {};
    if (p.has('mode'))  s.mode = p.get('mode');
    if (p.has('p'))     s.progressionMode = p.get('p');
    if (p.has('l'))     s.selectedLevel = parseInt(p.get('l'));
    if (p.has('c'))     s.selectedClass = p.get('c') + '_CLASS';
    if (p.has('r'))     s.selectedRace  = p.get('r') + '_RACE';
    if (p.has('dl'))    s.demihumanLimits = p.get('dl');
    if (p.has('rcm'))   s.raceClassMode = p.get('rcm');
    if (p.has('prm'))   { const v=p.get('prm'); s.primeRequisiteMode = v==='0'?'user':v; }
    if (p.has('hc'))    s.healthyCharacters = p.get('hc')==='1';
    if (p.has('il'))    s.includeLevel0HP = p.get('il')==='1';
    if (p.has('un'))    s.showUndeadNames = p.get('un')==='1';
    if (p.has('hhr'))   s.hideHumanRace = p.get('hhr')==='1';
    if (p.has('ao'))    s.basicAbilityOrdering = p.get('ao')==='1';
    if (p.has('wp'))    s.wealthPct = parseInt(p.get('wp'));
    if (p.has('agl'))   s.autoGenerateOnLevelChange = p.get('agl')==='1';
    if (p.has('agc'))   s.autoGenerateOnClassChange = p.get('agc')==='1';
    if (p.has('ago'))   s.autoGenerateOnLoad = p.get('ago')==='1';
    if (p.has('n'))     s.characterName = p.get('n');
    if (p.has('s')) {
        const scores = p.get('s').split(',').map(Number);
        // Order matches syncURLParams: STR, INT, WIS, DEX, CON, CHA (1977 order)
        if (scores.length===6) { ['STR','INT','WIS','DEX','CON','CHA'].forEach((a,i)=>{ s[`score${a}`]=scores[i]; }); }
    }
    if (p.has('zr'))    s.selectedRaceForZero = p.get('zr');
    if (p.has('ot'))    { const el=document.getElementById('openInNewTab');      if(el) el.checked=p.get('ot')==='1'; }
    if (p.has('ap'))    { const el=document.getElementById('autoPrintInNewTab'); if(el) el.checked=p.get('ap')==='1'; }
    return s;
}

// ── Event Listeners ───────────────────────────────────────────────────────────
export function initializeEventListeners() {
    // Progression mode
    document.querySelectorAll('input[name="progressionMode"]').forEach(r=>{
        r.addEventListener('change',(e)=>{ progressionMode=e.target.value; updateUI(); saveCurrentSettings(); });
    });
    // Demihuman limits (basic)
    document.querySelectorAll('input[name="demihumanLimits"]').forEach(r=>{
        r.addEventListener('change',(e)=>{ demihumanLimits=e.target.value; updateUI(); saveCurrentSettings(); });
    });
    // Race/class mode (advanced)
    document.querySelectorAll('input[name="raceClassMode"]').forEach(r=>{
        r.addEventListener('change',(e)=>{ raceClassMode=e.target.value; updateUI(); saveCurrentSettings(); });
    });
    // Prime requisite mode
    document.querySelectorAll('input[name="primeRequisiteMode"]').forEach(r=>{
        r.addEventListener('change',(e)=>{ primeRequisiteMode=e.target.value; saveCurrentSettings(); });
    });
    // Wealth %
    document.querySelectorAll('input[name="wealthPct"]').forEach(r=>{
        r.addEventListener('change',(e)=>{ wealthPct=parseInt(e.target.value); updateUI(); saveCurrentSettings(); });
    });
    // AC Display Mode
    document.querySelectorAll('input[name="acDisplayMode"]').forEach(r=>{
        r.addEventListener('change',(e)=>{ acDisplayMode=e.target.value; saveCurrentSettings(); });
    });
    // Checkboxes
    const boolListeners = [
        ['healthyCharacters',       v=>{ healthyCharacters=v;           }],
        ['includeLevel0HP',         v=>{ includeLevel0HP=v;             }],
        ['useFixedScores',          v=>{ useFixedScores=v; }],
        ['showUndeadNames',         v=>{ showUndeadNames=v;             }],
        ['hideHumanRace',          v=>{ hideHumanRace=v;               }],
        ['basicAbilityOrdering',    v=>{ basicAbilityOrdering=v;        }],
        ['autoGenerateOnLevelChange',v=>{ autoGenerateOnLevelChange=v;  }],
        ['autoGenerateOnClassChange',v=>{ autoGenerateOnClassChange=v;  }],
        ['autoGenerateOnLoad',       v=>{ autoGenerateOnLoad=v;         }],
    ];
    boolListeners.forEach(([id, fn]) => {
        document.getElementById(id)?.addEventListener('change', e=>{ fn(e.target.checked); saveCurrentSettings(); });
    });
    // Ability scores
    ['STR','INT','WIS','DEX','CON','CHA'].forEach(a=>{
        const inp = document.getElementById(`score${a}`);
        inp?.addEventListener('change', ()=>{ readAbilityScores(); saveCurrentSettings(); });
        inp?.addEventListener('input', updateModifiers);
    });
    // Buttons
    document.getElementById('characterName')?.addEventListener('change', ()=>saveCurrentSettings());
    document.getElementById('randomNameButton')?.addEventListener('click', handleRandomName);
    document.getElementById('resetSettingsButton')?.addEventListener('click', handleResetSettings);
    document.getElementById('generateButton')?.addEventListener('click', e=>{
        openTabInBackground = !!(e.ctrlKey||e.metaKey);
        generateCharacter();
    });
    document.getElementById('shareButton')?.addEventListener('click', showShareQR);
}

// ── Initialize ────────────────────────────────────────────────────────────────
export function initialize() {
    // Detect mode from URL first, then localStorage, default 'basic'
    const urlMode = new URLSearchParams(window.location.search).get('mode');
    if (urlMode === 'basic' || urlMode === 'advanced') mode = urlMode;

    // Apply mode radio
    document.querySelectorAll('input[name="mode"]').forEach(r => { r.checked = r.value === mode; });
    switchMode(mode); // shows/hides sections, loads saved settings, inits char selector

    initializeLevelSelection();
    initializeZeroLevelRaceSelection();
    initializeEventListeners();
    initializeModeSelector();
    updateModifiers();

    // URL params override localStorage (applied after applySettings inside switchMode)
    const urlParams = readURLParams();
    if (urlParams.mode && urlParams.mode !== mode) {
        mode = urlParams.mode;
        document.querySelectorAll('input[name="mode"]').forEach(r => { r.checked = r.value === mode; });
        switchMode(mode);
    }
    if (Object.keys(urlParams).length) applySettings(urlParams);

    updateUI();
    if (autoGenerateOnLoad) generateCharacter();
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
}
