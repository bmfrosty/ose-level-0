/**
 * gen-ui.js
 * Combined UI logic for Basic + Advanced modes on generator.html
 * Replaces basic-ui.js + advanced-ui.js
 */

// ── Imports ───────────────────────────────────────────────────────────────────
// gen-core.js — all gen logic + re-exports everything from shared-core.js
import * as _genCore from './gen-core.js';
import {
    PROGRESSION_TABLES,
    getRaceDisplayName,
    getClassDisplayName,
    getAvailableClasses,
    getClassProgressionData as getProgBasic,
    getClassProgressionData as getProgAdvanced,
    getClassFeatures,
    getBasicModeClassAbilities as getRacialBasic,
    getAdvancedModeRacialAbilities,
    applyRacialSaveModifiers,
    getRaceInfo,
    applyRacialAdjustments as _applyRacialAdj,
    checkRacialMinimums   as _meetsRacialMins,
    getClassRequirements  as _getClassReqs,
    getMaxLevel,
    calculateModifier, formatModifier, rollAbilities,
    meetsToughCharactersRequirements, meetsPrimeRequisiteRequirements,
    getPrimeRequisites,
    rollHitPoints as rollHPBasic,
    rollHitPoints as rollHPAdvanced,
    createCharacter, rollStartingGold, calcStartingGold,
    readAbilityScores as readScoresFromInputs,
    getClassRequirements,
    getDemihumanLimits,
    purchaseEquipment,
    getRandomName, getRandomBackground,
    getAllBackgroundTables,
    generateCharacterV3,
} from './gen-core.js';
import { displayCharacterSheet }                  from './cs-sheet-page.js';
// ── Advanced helpers (inlined from former shared-advanced-character-gen.js) ────

function getRacialAdvanced(race, raceClassMode = 'strict') {
    return getAdvancedModeRacialAbilities(race, {
        isAdvanced: true,
        humanRacialAbilities: raceClassMode !== 'strict',
    });
}

function rollAbilitiesAdvanced(minimumScores, race, className, toughCharacters, primeRequisite13) {
    let totalAttempts = 0;
    while (true) {
        const { scores: baseScores, attempts } = rollAbilities(minimumScores, toughCharacters, className, primeRequisite13);
        totalAttempts += attempts;
        if (!_meetsRacialMins(baseScores, race)) continue;
        const adjustedScores = _applyRacialAdj(baseScores, race);
        const classReqs = _getClassReqs(className, race);
        if (Object.entries(classReqs).some(([ab, min]) => adjustedScores[ab] < min)) continue;
        return { baseScores, adjustedScores, attempts: totalAttempts };
    }
}

// ── Settings helpers (inlined from gen-settings.js — single-parent leaf) ──────
const _SETTINGS_PREFIX = 'ose_settings_';
function saveSettings(pageKey, values) {
    try { localStorage.setItem(_SETTINGS_PREFIX + pageKey, JSON.stringify(values)); }
    catch (e) { console.warn('OSE: could not save settings:', e); }
}
function loadSettings(pageKey) {
    try { const raw = localStorage.getItem(_SETTINGS_PREFIX + pageKey); return raw ? JSON.parse(raw) : null; }
    catch (e) { console.warn('OSE: could not load settings:', e); return null; }
}
function clearSettings(pageKey) {
    try { localStorage.removeItem(_SETTINGS_PREFIX + pageKey); }
    catch (e) { console.warn('OSE: could not clear settings:', e); }
}
import { expandCompactV3, mergeAdvancedLanguages } from './cs-sheet-page.js';
import { PROG_CODE, CLS_CODE, RACE_CODE, RCM_CODE, progModeLabel } from './gen-core.js';

// ── Dark mode (persisted separately — never reset by settings reset) ──────────
let darkMode = localStorage.getItem('theme') === 'dark'; // default light

function applyDarkMode() {
    document.body.classList.toggle('dark-mode', darkMode);
    const btn = document.getElementById('darkModeToggle');
    if (btn) btn.textContent = darkMode ? '☀ Light' : '☽ Dark';
}

function handleDarkModeToggle() {
    darkMode = !darkMode;
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    applyDarkMode();
}

// ── State ─────────────────────────────────────────────────────────────────────
// Top-level mode toggle
let mode = 'basic'; // 'basic' | 'advanced'

// Shared state
let selectedLevel = null;
let selectedClass = null;
let progressionMode = 'ose';
let primeRequisiteMode = 'user';
let hpRollingMode = 'normal'; // 'normal' | 'healthy' | 'blessed' | '5e'
let includeLevel0HP = false;
let useFixedScores = false;
let showUndeadNames = false;
let hideHumanRace   = false;   // Advanced mode: show "Fighter" instead of "Human Fighter"
let showQRCode = true;
let basicAbilityOrdering = true;
let characterName = '';
let wealthPct = 50;
let wealthRollAsLevel1 = false;
let noLevel0Equipment = false;
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
let xpMode = false;     // true → derive level from xpAmount for each class
let xpAmount = null;    // XP value when xpMode is true

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

function getProgData(className, level, scores, classData, silent = false) {
    return mode === 'basic'
        ? getProgBasic({ className, level, abilityScores: scores, classData, silent })
        : getProgAdvanced({ className, level, abilityScores: scores, classData, silent });
}

function getClassDataForMode(pm) {
    return PROGRESSION_TABLES[pm] ?? PROGRESSION_TABLES.ose;
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
    const hideHumanRaceOption = document.getElementById('hideHumanRaceOption');
    if (hideHumanRaceOption) {
        hideHumanRaceOption.classList.toggle('section-greyed', mode === 'basic');
        const cb = document.getElementById('hideHumanRace');
        if (cb) cb.disabled = (mode === 'basic');
    }
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
        all.forEach(({ profession, hp }) => {
            const opt = document.createElement('option');
            opt.value = profession;
            opt.textContent = `${profession} (HP ${hp})`;
            sel.appendChild(opt);
        });
    }
}

// ── XP mode helpers ───────────────────────────────────────────────────────────
function getEffectiveLevel(className) {
    if (!xpMode || xpAmount === null || !className || !selectedClass) return selectedLevel;
    const classData = getClassDataForMode(progressionMode);
    return classData.getLevelFromXP(className, xpAmount);
}

function updateXPPreview() {
    const el = document.getElementById('xpLevelPreview');
    if (!el) return;
    if (!xpMode || xpAmount === null || xpAmount < 0) { el.textContent = ''; return; }
    const classData = getClassDataForMode(progressionMode);
    if (mode === 'basic' && selectedClass) {
        const lvl = classData.getLevelFromXP(selectedClass, xpAmount);
        el.textContent = `→ Level ${lvl}`;
    } else if (mode === 'advanced' && selectedClass) {
        const lvl = classData.getLevelFromXP(selectedClass, xpAmount);
        el.textContent = `→ Level ${lvl}`;
    } else {
        el.textContent = '';
    }
}

// ── updateUI ──────────────────────────────────────────────────────────────────
export function updateUI() {
    const isZeroLevel = !xpMode && selectedLevel === 0;

    // ── Level buttons: in XP mode, highlight the derived level ──
    if (xpMode) {
        const effLvl = (xpAmount !== null && selectedClass)
            ? getEffectiveLevel(selectedClass)
            : null;
        document.querySelectorAll('.level-btn').forEach(b => {
            b.classList.toggle('selected', effLvl !== null && parseInt(b.dataset.level) === effLvl);
        });
    }

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
                const progData  = getProgData(selectedClass, selectedLevel, { STR:10,INT:10,WIS:10,DEX:10,CON:10,CHA:10 }, classData, true);
                const xpForLevel = progData?.xpForCurrentLevel || 0;
                if (wealthRollAsLevel1) {
                    wealthPreview.textContent = `= 3d6\u00d710 gp (rolled at generation, like Level\u00a01)`;
                } else {
                    wealthPreview.textContent = (xpForLevel > 0 && wealthPct > 0)
                        ? `= ${calcStartingGold(xpForLevel, wealthPct).toLocaleString()} gp (${wealthPct}% of ${xpForLevel.toLocaleString()} XP)`
                        : (wealthPct === 0 ? '= 0 gp' : '');
                }
            } catch { wealthPreview.textContent = ''; }
        } else {
            wealthPreview.textContent = '';
        }
    }

    // ── XP mode: enable/disable input, update preview ──
    const xpInput = document.getElementById('xpAmount');
    if (xpInput) xpInput.disabled = !xpMode;
    updateXPPreview();

    // ── Common: Generate button ──
    const generateButton = document.getElementById('generateButton');
    if (generateButton) {
        const levelReady = xpMode
            ? (xpAmount !== null && xpAmount >= 0 && (mode === 'basic' ? !!selectedClass : !!(selectedRace && selectedClass)))
            : (selectedLevel !== null && (selectedLevel === 0 || (mode === 'basic' ? !!selectedClass : !!(selectedRace && selectedClass))));
        generateButton.disabled = !levelReady;
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

// ── Generate Character (entry point) ─────────────────────────────────────────
export function generateCharacter() {
    runGenerate().catch(e => console.error('generation error:', e));
}

async function runGenerate() {
    const isAdv = mode === 'advanced';

    if (!xpMode && selectedLevel === 0) { await generateZeroLevel(isAdv); return; }

    if (!selectedClass) { alert('Please select a class first!'); return; }
    if (isAdv && !selectedRace) { alert('Please select a race first!'); return; }
    if (xpMode && (xpAmount === null || xpAmount < 0)) { alert('Please enter an XP amount.'); return; }
    if (!xpMode && !selectedLevel) { alert('Please select a level first!'); return; }

    const classData = getClassDataForMode(progressionMode);
    const effectiveLevel = xpMode ? classData.getLevelFromXP(selectedClass, xpAmount) : selectedLevel;
    const DEMIHUMAN_CLASSES = ['Dwarf_CLASS','Elf_CLASS','Halfling_CLASS','Gnome_CLASS'];
    const hasBlessed = isAdv
        ? selectedRace === 'Human_RACE' && raceClassMode !== 'strict'
        : !DEMIHUMAN_CLASSES.includes(selectedClass) && raceClassMode !== 'strict';
    const hpMode = hpRollingMode === '5e' ? 2
        : (hpRollingMode === 'blessed' || hasBlessed) ? 1
        : hpRollingMode === 'healthy' ? 3 : 0;

    const fixedScoresForGen = useFixedScores ? readScoresFromInputs() : null;
    const _fixedAdj = fixedAdjustments;
    fixedAdjustments = null;

    const _goldOverride = (fixedStartingGold !== null) ? fixedStartingGold
        : (wealthRollAsLevel1 && effectiveLevel > 1) ? rollStartingGold(progressionMode)
        : (xpMode && xpAmount !== null && effectiveLevel > 1) ? calcStartingGold(xpAmount, wealthPct)
        : null;
    const cp = generateCharacterV3({
        mode, level: effectiveLevel,
        race: isAdv ? selectedRace : '',
        className: selectedClass, progressionMode, raceClassMode,
        minimums: readScoresFromInputs(), primeReqMode: primeRequisiteMode,
        hpMode, includeLevel0HP,
        fixedScores: fixedScoresForGen,
        fixedName: useFixedScores ? (document.getElementById('characterName')?.value.trim() || '') : '',
        fixedAdjustments: _fixedAdj,
        fixedOccupation: document.getElementById('zeroOccupation')?.value || null,
        wealthPct, fixedHPRolls, noLevel0Equipment, classData,
        fixedStartingGold: _goldOverride,
    });
    fixedHPRolls = null; fixedStartingGold = null;
    _scoreRollAttempts = cp.rr || 1;

    // Write generated name to input only when using fixed scores and the box was empty
    if (useFixedScores) {
        const nameEl = document.getElementById('characterName');
        if (nameEl && !nameEl.value.trim()) nameEl.value = cp.n || '';
    }

    const adm = {'dac-matrix':1,'dual':2,'dual-matrix':3}[acDisplayMode];
    const fullCp = {
        ...cp,
        un: showUndeadNames?1:0, qr: showQRCode?1:0, ao: basicAbilityOrdering?1:0,
        wp: wealthPct, prm: primeRequisiteMode==='user'?0:parseInt(primeRequisiteMode),
        sm: ['STR','DEX','CON','INT','WIS','CHA'].map(a => readScoresFromInputs()[a] || 3),
        ...(!isAdv ? { dl: getEffectiveDemihumanLimits()==='extended'?1:0 } : {}),
        ...(isAdv && hideHumanRace ? { hhr: 1 } : {}),
        ...(adm != null ? { adm } : {}),
    };

    const SCRS = ['STR','DEX','CON','INT','WIS','CHA'];
    const rawScores = cp.s || [10,10,10,10,10,10];
    const racialMods = isAdv ? (getRaceInfo(selectedRace)?.abilityModifiers ?? {}) : {};
    const saArr = cp.sa || Array(6).fill(0);
    const totalAdj = SCRS.map((a, i) => (racialMods[a] || 0) + saArr[i]);
    const conIdx = SCRS.indexOf('CON');

    const spec = await expandCompactV3(fullCp, {}, { silent: true });
    const dispOpts = sheetOpts();
    spec.openInNewTab  = dispOpts.openInNewTab;
    spec.backgroundTab = dispOpts.backgroundTab;
    spec.editState = {
        level: effectiveLevel, progressionMode, name: cp.n || '',
        ...Object.fromEntries(SCRS.map((a, i) => [a, rawScores[i]])),
        ...Object.fromEntries(SCRS.map((a, i) => [`adj${a}`, totalAdj[i]])),
        hpRolls: cp.hr || [], hpDice: cp.hd || [], startingGold: cp.g || 0,
        includeLevel0HP, showUndeadNames, showQRCode,
        conModifier: calculateModifier(rawScores[conIdx] + totalAdj[conIdx]),
        extraSections: isAdv ? [
            { label:'6. Race/Class Restrictions', name:'editRaceClassMode', options:[
                { value:'strict',               label:'Strict OSE',                checked: raceClassMode==='strict' },
                { value:'strict-human',         label:'Strict + Human Abilities',  checked: raceClassMode==='strict-human' },
                { value:'traditional-extended', label:'Traditional Extended',       checked: raceClassMode==='traditional-extended' },
                { value:'allow-all',            label:'Allow All',                 checked: raceClassMode==='allow-all' },
            ]},
            { label:'7. AC Display Mode', name:'editACDisplayMode', options:[
                { value:'aac',        label:'Ascending Armor Class (AAC)',         checked: acDisplayMode==='aac' },
                { value:'dac-matrix', label:'Descending AC with Attack Matrix',    checked: acDisplayMode==='dac-matrix' },
                { value:'dual',       label:'Dual Format (AAC and DAC)',           checked: acDisplayMode==='dual' },
                { value:'dual-matrix',label:'Dual Format with Attack Matrix',      checked: acDisplayMode==='dual-matrix' },
            ]},
        ] : [
            { label:'6. Demihuman Level Limits', name:'editDemihumanLimits', options:[
                { value:'standard', label:'Standard Limits',       checked: demihumanLimits==='standard' },
                { value:'extended', label:'Extended to Level 14',  checked: demihumanLimits==='extended' },
            ]},
            { label:'7. AC Display Mode', name:'editACDisplayMode', options:[
                { value:'aac',        label:'Ascending Armor Class (AAC)',         checked: acDisplayMode==='aac' },
                { value:'dac-matrix', label:'Descending AC with Attack Matrix',    checked: acDisplayMode==='dac-matrix' },
                { value:'dual',       label:'Dual Format (AAC and DAC)',           checked: acDisplayMode==='dual' },
                { value:'dual-matrix',label:'Dual Format with Attack Matrix',      checked: acDisplayMode==='dual-matrix' },
            ]},
        ],
    };
    const _onEditUpdate = (values) => {
        selectedLevel=values.level; progressionMode=values.progressionMode; characterName=values.name;
        abilityScores={STR:values.STR,INT:values.INT,WIS:values.WIS,DEX:values.DEX,CON:values.CON,CHA:values.CHA};
        const _adjVals={STR:values.adjSTR||0,INT:values.adjINT||0,WIS:values.adjWIS||0,DEX:values.adjDEX||0,CON:values.adjCON||0,CHA:values.adjCHA||0};
        fixedAdjustments=Object.values(_adjVals).some(v=>v!==0)?_adjVals:null;
        if (isAdv) {
            if (values.editRaceClassMode) raceClassMode=values.editRaceClassMode;
            document.querySelectorAll('input[name="raceClassMode"]').forEach(r=>{r.checked=r.value===raceClassMode;});
        } else {
            if (values.editDemihumanLimits) demihumanLimits=values.editDemihumanLimits;
            document.querySelectorAll('input[name="demihumanLimits"]').forEach(r=>{r.checked=r.value===demihumanLimits;});
        }
        if (values.editACDisplayMode) { acDisplayMode=values.editACDisplayMode; document.querySelectorAll('input[name="acDisplayMode"]').forEach(r=>{r.checked=r.value===acDisplayMode;}); }
        includeLevel0HP=values.includeLevel0HP||false; showUndeadNames=values.showUndeadNames||false; showQRCode=values.showQRCode??true;
        fixedHPRolls=values.hpRolls?.length?[...values.hpRolls]:null;
        fixedStartingGold=(values.startingGold!=null)?parseInt(values.startingGold):null;
        ['STR','INT','WIS','DEX','CON','CHA'].forEach(a=>{const el=document.getElementById(`score${a}`);if(el)el.value=values[a];});
        const _nameEl=document.getElementById('characterName'); if(_nameEl) _nameEl.value=characterName;
        document.querySelectorAll('.level-btn').forEach(b=>b.classList.toggle('selected',parseInt(b.dataset.level)===selectedLevel));
        document.querySelectorAll('input[name="progressionMode"]').forEach(r=>{r.checked=r.value===progressionMode;});
        const l0El=document.getElementById('includeLevel0HP'); if(l0El) l0El.checked=includeLevel0HP;
        const unEl=document.getElementById('showUndeadNames'); if(unEl) unEl.checked=showUndeadNames;
        useFixedScores=true; const fixEl=document.getElementById('useFixedScores'); if(fixEl) fixEl.checked=true;
        runGenerate().catch(e=>console.error('edit regen error:', e));
    };
    spec.onEditUpdate = _onEditUpdate;
    displayCharacterSheet(spec, document.getElementById('characterInfo'), document.getElementById('characterDisplay'));
}

// ── Level-0 generation ────────────────────────────────────────────────────────
async function generateZeroLevel(isAdv) {
    const fixedScoresForGen = useFixedScores ? readScoresFromInputs() : null;
    const fixedName   = document.getElementById('characterName')?.value.trim() || '';
    const _fixedAdj   = fixedAdjustments;
    fixedAdjustments  = null;
    const hpMode = hpRollingMode === 'healthy' ? 3 : hpRollingMode === 'blessed' ? 1 : 0;

    const cp = generateCharacterV3({
        mode, level: 0, race: selectedRaceForZero,
        progressionMode, raceClassMode,
        minimums: readScoresFromInputs(), primeReqMode: primeRequisiteMode,
        hpMode, fixedScores: fixedScoresForGen, fixedName,
        fixedOccupation: document.getElementById('zeroOccupation')?.value || null,
        fixedAdjustments: _fixedAdj,
        fixedStartingGold,
    });
    fixedStartingGold = null;
    _scoreRollAttempts = cp.rr || 1;

    const adm = {'dac-matrix':1,'dual':2,'dual-matrix':3}[acDisplayMode];
    const fullCp = {
        ...cp,
        un: showUndeadNames?1:0, qr: showQRCode?1:0, ao: basicAbilityOrdering?1:0,
        prm: primeRequisiteMode==='user'?0:parseInt(primeRequisiteMode),
        sm: ['STR','DEX','CON','INT','WIS','CHA'].map(a => readScoresFromInputs()[a] || 3),
        ...(!isAdv ? { dl: getEffectiveDemihumanLimits()==='extended'?1:0 } : {}),
        ...(adm != null ? { adm } : {}),
    };

    const SCRS = ['STR','DEX','CON','INT','WIS','CHA'];
    const rawScores = cp.s || [10,10,10,10,10,10];
    const racialMods = isAdv ? (getRaceInfo(selectedRaceForZero || 'Human_RACE')?.abilityModifiers ?? {}) : {};
    const saArr = cp.sa || Array(6).fill(0);
    const totalAdj = SCRS.map((a, i) => (racialMods[a] || 0) + saArr[i]);
    const base0 = Object.fromEntries(SCRS.map((a, i) => [a, rawScores[i]]));
    const adj0  = Object.fromEntries(SCRS.map((a, i) => [`adj${a}`, totalAdj[i]]));

    const spec = await expandCompactV3(fullCp, {}, { silent: true });
    const dispOpts = sheetOpts();
    spec.openInNewTab  = dispOpts.openInNewTab;
    spec.backgroundTab = dispOpts.backgroundTab;
    spec.editState = {
        level: 0, progressionMode, name: cp.n || '',
        ...base0, ...adj0,
        hpRolls: [], hpDice: [],
        startingGold: cp.g || 0,
        conModifier: calculateModifier(rawScores[SCRS.indexOf('CON')] + totalAdj[SCRS.indexOf('CON')]),
        showUndeadNames, showQRCode, includeLevel0HP: false,
    };
    spec.onEditUpdate = (values) => {
        characterName=values.name;
        abilityScores={STR:values.STR,INT:values.INT,WIS:values.WIS,DEX:values.DEX,CON:values.CON,CHA:values.CHA};
        const _adjVals={STR:values.adjSTR||0,INT:values.adjINT||0,WIS:values.adjWIS||0,DEX:values.adjDEX||0,CON:values.adjCON||0,CHA:values.adjCHA||0};
        fixedAdjustments=Object.values(_adjVals).some(v=>v!==0)?_adjVals:null;
        showUndeadNames=values.showUndeadNames||false; showQRCode=values.showQRCode??true;
        ['STR','INT','WIS','DEX','CON','CHA'].forEach(a=>{const el=document.getElementById(`score${a}`);if(el)el.value=values[a];});
        const _nameEl=document.getElementById('characterName'); if(_nameEl) _nameEl.value=characterName;
        useFixedScores=true; const fixEl=document.getElementById('useFixedScores'); if(fixEl) fixEl.checked=true;
        runGenerate().catch(e=>console.error('0-level edit gen error:', e));
    };
    displayCharacterSheet(spec, document.getElementById('characterInfo'), document.getElementById('characterDisplay'));
}

// ── resolveScores / assembleCharacter / displayBasicCharacter / displayAdvancedCharacter / displayZeroLevelCharacter
// moved to legacy-functions.txt

function sheetOpts() {
    return {
        showUndeadNames, showQRCode, abilityOrder: basicAbilityOrdering ? 1 : 0,
        openInNewTab:  document.getElementById('openInNewTab')?.checked||false,
        backgroundTab: openTabInBackground,
        acDisplayMode,
    };
}

// displayBasicCharacter / displayAdvancedCharacter / displayZeroLevelCharacter
// moved to legacy-functions.txt
// ── Settings Persistence ──────────────────────────────────────────────────────
function saveCurrentSettings() {
    saveSettings(getSettingsKey(), {
        mode, acDisplayMode,
        progressionMode, primeRequisiteMode, hpRollingMode, includeLevel0HP,
        useFixedScores, showUndeadNames, hideHumanRace, basicAbilityOrdering, wealthPct,
        wealthRollAsLevel1, noLevel0Equipment, xpMode, xpAmount,
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
    if (hpRollingMode !== 'normal')                                p.set('hpm', hpRollingMode);
    if (includeLevel0HP)                                           p.set('il', '1');
    if (showUndeadNames)                                           p.set('un', '1');
    if (hideHumanRace && mode === 'advanced')                      p.set('hhr', '1');
    if (!basicAbilityOrdering)                                     p.set('ao', '0');
    if (wealthPct !== 50)                                          p.set('wp', String(wealthPct));
    if (wealthRollAsLevel1)                                        p.set('l1w', '1');
    if (noLevel0Equipment)                                         p.set('nl0e', '1');
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
    if (s.hpRollingMode!==undefined) { hpRollingMode=s.hpRollingMode; document.querySelectorAll('input[name="hpRollingMode"]').forEach(r=>{r.checked=r.value===s.hpRollingMode;}); }
    if (s.includeLevel0HP!==undefined)           { includeLevel0HP=s.includeLevel0HP;                     setBool('includeLevel0HP','includeLevel0HP'); }
    if (s.useFixedScores!==undefined)            { useFixedScores=s.useFixedScores;                       setBool('useFixedScores','useFixedScores'); }
    if (s.showUndeadNames!==undefined)           { showUndeadNames=s.showUndeadNames;                     setBool('showUndeadNames','showUndeadNames'); }
    if (s.hideHumanRace!==undefined)             { hideHumanRace=s.hideHumanRace;                       setBool('hideHumanRace','hideHumanRace'); }
    if (s.acDisplayMode!==undefined) { acDisplayMode=s.acDisplayMode; document.querySelectorAll('input[name="acDisplayMode"]').forEach(r=>{r.checked=r.value===s.acDisplayMode;}); }
    if (s.basicAbilityOrdering!==undefined)      { basicAbilityOrdering=s.basicAbilityOrdering;           setBool('basicAbilityOrdering','basicAbilityOrdering'); }
    if (s.autoGenerateOnLevelChange!==undefined) { autoGenerateOnLevelChange=s.autoGenerateOnLevelChange; setBool('autoGenerateOnLevelChange','autoGenerateOnLevelChange'); }
    if (s.autoGenerateOnClassChange!==undefined) { autoGenerateOnClassChange=s.autoGenerateOnClassChange; setBool('autoGenerateOnClassChange','autoGenerateOnClassChange'); }
    if (s.autoGenerateOnLoad!==undefined)        { autoGenerateOnLoad=s.autoGenerateOnLoad;               setBool('autoGenerateOnLoad','autoGenerateOnLoad'); }
    if (s.wealthPct!==undefined)          { wealthPct=s.wealthPct; const _wp=document.getElementById('wealthPctInput'); if(_wp) _wp.value=s.wealthPct; }
    if (s.wealthRollAsLevel1!==undefined) { wealthRollAsLevel1=s.wealthRollAsLevel1; const _wm=document.getElementById(s.wealthRollAsLevel1?'wealthModeLevel1':'wealthModePct'); if(_wm) _wm.checked=true; }
    if (s.noLevel0Equipment!==undefined)  { noLevel0Equipment=s.noLevel0Equipment;   setBool('noLevel0Equipment','noLevel0Equipment'); }
    if (s.xpMode!==undefined) {
        xpMode=s.xpMode;
        const _lm=document.getElementById(s.xpMode?'levelModeXP':'levelModeFixed'); if(_lm) _lm.checked=true;
    }
    if (s.xpAmount!==undefined) { xpAmount=s.xpAmount; const _xa=document.getElementById('xpAmount'); if(_xa) _xa.value=s.xpAmount??''; }
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

function applyPreset(overrides) {
    document.querySelectorAll('input[name="mode"]').forEach(r => { r.checked = r.value === 'advanced'; });
    switchMode('advanced');
    applySettings({
        progressionMode: 'ose', primeRequisiteMode: 'user',
        hpRollingMode: 'normal', includeLevel0HP: false,
        scoreSTR:3, scoreINT:3, scoreWIS:3, scoreDEX:3, scoreCON:6, scoreCHA:3,
        ...overrides,
    });
    saveCurrentSettings();
    updateUI();
}

function handleAuthorPreferred() {
    applyPreset({ progressionMode: 'smoothprog', primeRequisiteMode: '9', hpRollingMode: 'healthy', scoreCON: 9, wealthPct: 20, wealthRollAsLevel1: false, raceClassMode: 'traditional-extended' });
}

function handleConventionMode() {
    applyPreset({ progressionMode: 'smoothprog', primeRequisiteMode: '13', hpRollingMode: 'healthy', includeLevel0HP: true, scoreCON: 9, wealthPct: 20, wealthRollAsLevel1: false, raceClassMode: 'allow-all' });
}

function handleResetSettings() {
    clearSettings(getSettingsKey());
    progressionMode='ose'; primeRequisiteMode='user'; demihumanLimits='standard'; raceClassMode='strict';
    hpRollingMode='normal'; includeLevel0HP=false; useFixedScores=false; showUndeadNames=false; hideHumanRace=false;
    basicAbilityOrdering=true; wealthPct=50; acDisplayMode='aac';
    document.querySelectorAll('input[name="hpRollingMode"]').forEach(r=>{r.checked=r.value==='normal';});
    document.querySelectorAll('input[name="acDisplayMode"]').forEach(r=>{r.checked=r.value==='aac';});
    autoGenerateOnLevelChange=false; autoGenerateOnClassChange=false; autoGenerateOnLoad=false;
    xpMode=false; xpAmount=null; const _lmR=document.getElementById('levelModeFixed'); if(_lmR) _lmR.checked=true; const _xaR=document.getElementById('xpAmount'); if(_xaR) _xaR.value='';
    document.querySelectorAll('input[name="progressionMode"]').forEach(r=>{r.checked=r.value==='ose';});
    document.querySelectorAll('input[name="demihumanLimits"]').forEach(r=>{r.checked=r.value==='standard';});
    // Basic + Advanced share name="raceClassMode" — set all to false first, then check only the active section's radio
    document.querySelectorAll('input[name="raceClassMode"]').forEach(r=>{r.checked=false;});
    const _rcmId = mode==='basic' ? 'basicStrict' : 'strictOSE';
    const _rcmEl = document.getElementById(_rcmId); if(_rcmEl) _rcmEl.checked=true;
    document.querySelectorAll('input[name="primeRequisiteMode"]').forEach(r=>{r.checked=r.value==='user';});
    wealthPct=50; wealthRollAsLevel1=false; const _wpR=document.getElementById('wealthPctInput'); if(_wpR) _wpR.value=50; const _wmR=document.getElementById('wealthModePct'); if(_wmR) _wmR.checked=true;
    noLevel0Equipment=false;
    ['useFixedScores','showUndeadNames','hideHumanRace','openInNewTab','noLevel0Equipment'].forEach(id=>{const el=document.getElementById(id);if(el)el.checked=false;});
    ['autoGenerateOnLevelChange','autoGenerateOnClassChange','autoGenerateOnLoad'].forEach(id=>{const el=document.getElementById(id);if(el)el.checked=false;});
    const aoEl=document.getElementById('basicAbilityOrdering'); if(aoEl) aoEl.checked=true;
    ['STR','INT','WIS','DEX','CON','CHA'].forEach(a=>{const el=document.getElementById(`score${a}`);if(el)el.value=3;});
    const _nameEl=document.getElementById('characterName'); if(_nameEl) _nameEl.value='';
    characterName='';
    updateModifiers();
    document.querySelectorAll('input[name="mode"]').forEach(r => { r.checked = r.value === 'advanced'; });
    switchMode('advanced');
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
    if (p.has('hpm'))   s.hpRollingMode = p.get('hpm');
    if (p.has('il'))    s.includeLevel0HP = p.get('il')==='1';
    if (p.has('un'))    s.showUndeadNames = p.get('un')==='1';
    if (p.has('hhr'))   s.hideHumanRace = p.get('hhr')==='1';
    if (p.has('ao'))    s.basicAbilityOrdering = p.get('ao')==='1';
    if (p.has('wp'))    s.wealthPct = parseInt(p.get('wp'));
    if (p.has('l1w'))   s.wealthRollAsLevel1 = p.get('l1w') === '1';
    if (p.has('nl0e'))  s.noLevel0Equipment  = p.get('nl0e') === '1';
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
    // Level mode: fixed vs XP
    document.querySelectorAll('input[name="levelMode"]').forEach(r => {
        r.addEventListener('change', (e) => {
            xpMode = e.target.value === 'xp';
            updateUI(); saveCurrentSettings();
        });
    });
    document.getElementById('xpAmount')?.addEventListener('input', () => {
        const v = parseInt(document.getElementById('xpAmount').value);
        xpAmount = isNaN(v) ? null : Math.max(0, v);
        updateUI(); saveCurrentSettings();
    });
    // Wealth % — number input + roll-as-level-1 radio pair
    document.getElementById('wealthPctInput')?.addEventListener('change', () => {
        wealthPct = Math.max(0, parseInt(document.getElementById('wealthPctInput').value) || 0);
        document.getElementById('wealthPctInput').value = wealthPct;
        document.getElementById('wealthModePct').checked = true;
        wealthRollAsLevel1 = false;
        updateUI(); saveCurrentSettings();
    });
    document.querySelectorAll('input[name="wealthMode"]').forEach(r => {
        r.addEventListener('change', (e) => {
            wealthRollAsLevel1 = e.target.value === 'level1';
            if (!wealthRollAsLevel1) wealthPct = Math.max(0, parseInt(document.getElementById('wealthPctInput')?.value) || 50);
            updateUI(); saveCurrentSettings();
        });
    });
    // AC Display Mode
    document.querySelectorAll('input[name="acDisplayMode"]').forEach(r=>{
        r.addEventListener('change',(e)=>{ acDisplayMode=e.target.value; saveCurrentSettings(); });
    });
    // HP Rolling Mode
    document.querySelectorAll('input[name="hpRollingMode"]').forEach(r=>{
        r.addEventListener('change',(e)=>{ hpRollingMode=e.target.value; saveCurrentSettings(); });
    });
    // Checkboxes
    const boolListeners = [
        ['includeLevel0HP',          v=>{ includeLevel0HP=v;            }],
        ['noLevel0Equipment',        v=>{ noLevel0Equipment=v;          }],
        ['useFixedScores',           v=>{ useFixedScores=v;             }],
        ['showUndeadNames',          v=>{ showUndeadNames=v;            }],
        ['hideHumanRace',            v=>{ hideHumanRace=v;              }],
        ['basicAbilityOrdering',     v=>{ basicAbilityOrdering=v;       }],
        // wealthRollAsLevel1 is now a radio button — handled by wealthMode listener above
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
    document.getElementById('authorPreferredButton')?.addEventListener('click', handleAuthorPreferred);
    document.getElementById('conventionModeButton')?.addEventListener('click', handleConventionMode);
    document.getElementById('darkModeToggle')?.addEventListener('click', handleDarkModeToggle);
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

    applyDarkMode();
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
