/**
 * gen-ui.js
 * UI logic for generator.html's unified race/class grid, levels 0–14.
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
    getClassFeatures,
    getBasicModeClassAbilities as getRacialBasic,
    applyRacialSaveModifiers,
    getRaceInfo,
    getMaxLevel,
    calculateModifier, formatModifier,
    meetsToughCharactersRequirements, meetsPrimeRequisiteRequirements,
    rollHitPoints as rollHPBasic,
    rollHitPoints as rollHPAdvanced,
    createCharacter, rollDiceGold, calcStartingGold,
    readAbilityScores as readScoresFromInputs,
    purchaseEquipment,
    getRandomBackground,
    getAllBackgroundTables,
    generateCharacterV3,
    CLASS_INFO,
} from './gen-core.js';
import { displayCharacterSheet }                  from './cs-sheet-page.js';

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
import { expandCompactV3, mergeAdvancedLanguages } from './cs-sheet-page.js';
import { compressToBase64Url, decompressFromBase64Url } from './cs-sheet-page.js';
import { PROG_CODE, CLS_CODE, RACE_CODE, RCM_CODE, progModeLabel } from './gen-core.js';
import { RAP_CODE, isSeparateRaceClassForPolicy } from './gen-core.js';

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
// Referee-facing restriction preset — no longer drives generation mechanics,
// only which grid cells are enabled. See PLAN_RACE_AS_CLASS_IN_ADVANCED.md.
//   'race-class'    (A) — Race-and-Class Only: separate race+class columns only
//   'race-as-class' (B) — Race-as-Class Only: Race-as-Class column + Human's separate classes
//   'both'          (C) — Both: everything enabled
let modePreset = 'race-as-class';

// Shared state
let selectedLevel = null;
let selectedClass = null;
let progressionMode = 'ose';
let primeRequisiteMode = 'user';
let hpRollingMode = 'normal'; // 'normal' | 'healthy' | 'blessed' | '5e'
let includeLevel0HP = false;
let useFixedScores = false;
let showUndeadNames = false;
let hideHumanRace   = false;   // show "Fighter" instead of "Human Fighter" for separate-class Human picks
let showQRCode = true;
// Purely cosmetic character-sheet branding — doesn't affect any game mechanics.
let sheetBranding = 'ose';     // 'ose' | 'dnd'
let basicAbilityOrdering = true;
let characterName = '';
// Campaign Name (Section 0) — identifies the referee's table, up to 64
// Unicode characters. Carried raw in localStorage/cp (both already have
// their own compression or aren't URL-length-constrained), but the
// generator.html URL param is gzip+base64url compressed via
// compressToBase64Url() to keep Campaign Profile links/QR codes compact —
// unlike characterName's plain `n` param, since this field can be longer
// and appears on every Campaign Profile link, not just one character's.
let campaignName = '';
let campaignNameCompressed = ''; // cache of compressToBase64Url(campaignName), kept in sync by updateCampaignNameCompressed()
// Default matches the Basic Mode Reset button — a brand-new visit (no saved
// settings, no URL params) should look identical to hitting that button.
let wealthPct = 20;

// Referee settings: per-tier starting-wealth method. See PLAN_STARTING_WEALTH_OVERHAUL.md.
// Each "dice" method is a general NdSides x mult roll (count/sides/mult all
// independently configurable per tier — no hardcoded dice count or implicit
// progression-mode coupling).
let l0WealthMethod = 'dice';       // 'dice' | 'fixed'
let l0DiceCount = 3, l0DiceSides = 6, l0DiceMult = 1;
let l0FixedGold = 0;
let l1WealthMethod = 'dice';       // 'dice' | 'fixed'
let l1DiceCount = 3, l1DiceSides = 6, l1DiceMult = 10;
let l1FixedGold = 0;
let l2PlusWealthMethod = 'xp-pct'; // 'xp-pct' | 'fixed' | 'dice'
let l2PlusDiceCount = 3, l2PlusDiceSides = 6, l2PlusDiceMult = 10;
let l2PlusFixedGold = 0;
let byXpWealthMethod = 'xp-pct';   // 'xp-pct' | 'fixed' | 'dice'
let byXpDiceCount = 3, byXpDiceSides = 6, byXpDiceMult = 10;
let byXpFixedGold = 0;

let noLevel0Equipment = true;
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

// Selected race for a level 1+ pick — set for both race-as-class picks
// (e.g. selectedClass = "Dwarf_CLASS", selectedRace = "Dwarf_RACE") and
// separate-class picks (e.g. selectedRace = "Human_RACE", selectedClass = "Fighter_CLASS").
let selectedRace = null;
let raceClassMode = 'strict';
// Spellblade is a house-rules fighter/magic-user hybrid, not part of Basic or
// Advanced core OSE — excluded by default so Basic Mode Reset is genuinely basic.
let excludeSpellblade = true;

// True when the currently-selected class is a race-as-class pick (CLASS_INFO
// classType === 'raceAsClass'), i.e. the Race-as-Class grid column was clicked
// rather than a separate class column. Drives isSeparateRaceClass for generation.
let isRaceAsClassPick = false;

// Referee setting: whether/when racial ability score adjustments apply across
// the level 0 -> 1 boundary. See PLAN_RACIAL_ADJUSTMENT_POLICY.md. Values:
// 'always' | 'separate-only' | 'never' (default, matches Basic Mode Reset) |
// 'from-separate' | 'from-level-1'.
let racialAdjustmentPolicy = 'never';

// Which policies apply the adjustment at level 0 itself (before any class is picked).
const L0_ADJUSTED_POLICIES = new Set(['always', 'separate-only']);

// ── Helpers ───────────────────────────────────────────────────────────────────
function getSettingsKey() { return 'generator'; } // single shared key

function getProgData(className, level, scores, classData, silent = false) {
    return getProgBasic({ className, level, abilityScores: scores, classData, silent });
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

// Picking a level explicitly should override "By XP" mode — otherwise the
// click updates selectedLevel but effectiveLevel keeps deriving from XP,
// making the level buttons appear to do nothing.
function revertToFixedLevelMode() {
    if (!xpMode) return;
    xpMode = false;
    const fixedRadio = document.getElementById('levelModeFixed');
    if (fixedRadio) fixedRadio.checked = true;
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
        revertToFixedLevelMode();
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
            revertToFixedLevelMode();
            updateUI(); saveCurrentSettings();
            if (autoGenerateOnLevelChange) generateCharacter();
        });
        container.appendChild(btn);
    }
}

// ── Mode Selector ─────────────────────────────────────────────────────────────
// Whether a race has a race-as-class package in CLASS_INFO (false for Human,
// or a race not yet generator-ready). The race-as-class CLASS_INFO key is
// always identical to the race name, so callers just reuse bareRace.
function hasRaceAsClassEntry(bareRace) {
    return Object.values(CLASS_INFO).some(c => c.classType === 'raceAsClass' && c.name === bareRace);
}

function setModePreset(newPreset) {
    modePreset = newPreset;
    const hideHumanRaceOption = document.getElementById('hideHumanRaceOption');
    if (hideHumanRaceOption) {
        const disabled = modePreset === 'race-as-class';
        hideHumanRaceOption.classList.toggle('section-greyed', disabled);
        const cb = document.getElementById('hideHumanRace');
        if (cb) cb.disabled = disabled;
    }
    // Load saved settings, then sync the current raceClassMode to its radio.
    const _saved = loadSettings(getSettingsKey());
    applySettings(_saved);
    if (!_saved) applySettings({ raceClassMode });

    updateUI();
}

function initializeModeSelector() {
    document.querySelectorAll('input[name="mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            setModePreset(e.target.value);
            saveCurrentSettings();
        });
    });
}

// ── Level 1+ build selection (shared: race-as-class picks and separate-class picks) ──
// The race-as-class CLASS_INFO key always matches the race name (e.g. Dwarf race
// picks the Dwarf class), so a race-as-class pick only needs the one name.
function selectBuild(bareRace) {
    document.querySelectorAll('.grid-button:not(.zero-race-btn)').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.zero-race-btn').forEach(b => b.classList.remove('selected'));
    isRaceAsClassPick = true;
    selectedRace  = `${bareRace}_RACE`;
    selectedClass = `${bareRace}_CLASS`;
}

function selectSeparateClass(bareRace, bareClass) {
    document.querySelectorAll('.grid-button:not(.zero-race-btn)').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.zero-race-btn').forEach(b => b.classList.remove('selected'));
    isRaceAsClassPick = false;
    selectedRace  = `${bareRace}_RACE`;
    selectedClass = `${bareClass}_CLASS`;
}

// ── Level 0 race selection (shared: grid's first column and the Random shortcuts) ──
function selectZeroRace(raceValue) {
    document.querySelectorAll('.grid-button:not(.zero-race-btn)').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.zero-race-btn').forEach(b => b.classList.remove('selected'));
    selectedRaceForZero = raceValue;
}

// ── Race/Class Grid ────────────────────────────────────────────────────────────
export function initializeRaceClassGrid() {
    const buttons = document.querySelectorAll('.grid-button:not(.zero-race-btn)');
    buttons.forEach(btn => {
        const fresh = btn.cloneNode(true);
        btn.parentNode.replaceChild(fresh, btn);
    });
    document.querySelectorAll('.grid-button:not(.zero-race-btn)').forEach(button => {
        button.addEventListener('click', () => {
            if (button.disabled) return;
            const bareRace = button.dataset.race;
            const isRaceAsClassColumn = button.dataset.class === 'RaceAsClass';

            if (!xpMode && selectedLevel === 0) {
                // First column at level 0: pick this race (no class yet).
                // Other columns are disabled at level 0 (see updateUI), so only
                // the Race-as-Class column is ever clickable here.
                selectZeroRace(`${bareRace}_RACE`);
                button.classList.add('selected');
            } else if (isRaceAsClassColumn) {
                if (!hasRaceAsClassEntry(bareRace)) return; // shouldn't happen — button would be disabled
                selectBuild(bareRace);
                button.classList.add('selected');
            } else {
                selectSeparateClass(bareRace, button.dataset.class);
                button.classList.add('selected');
            }
            updateUI(); saveCurrentSettings();
            if (autoGenerateOnClassChange) generateCharacter();
        });
    });
    // Default: Human Fighter. selectedRace/selectedClass are set to Human/Fighter
    // either way, but the DOM order matters: initialize() runs this while the page
    // still defaults to level 0 (selectedLevel is set to 0 by initializeLevelSelection()
    // before this runs), where Human Fighter is unavailable — a subsequent updateUI()
    // call would otherwise see this button both 'selected' and unavailable and null out
    // selectedRace/selectedClass entirely (its stale-selection cleanup path). Adding
    // 'selected' first and letting selectSeparateClass() immediately clear it again
    // avoids that: the variables end up set, the button ends up correctly unselected
    // at level 0, and switching to level 1+ leaves the (still-correct) variables intact.
    const humanFighter = document.querySelector('.grid-button[data-race="Human"][data-class="Fighter"]');
    if (humanFighter) {
        humanFighter.classList.add('selected');
        selectSeparateClass('Human', 'Fighter');
    }
}

// ── Zero-Level Race Selection ─────────────────────────────────────────────────
function initializeZeroLevelRaceSelection() {
    const container = document.getElementById('zeroRaceButtons');
    if (!container) return;
    container.querySelectorAll('.zero-race-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectZeroRace(btn.dataset.race);
            btn.classList.add('selected');
            saveCurrentSettings();
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
    if (selectedClass) {
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

    // One grid, always shown. Each cell's enabled/disabled state is computed from:
    // modePreset (A/B/C), raceClassMode restrictions, isZeroLevel, and CLASS_INFO/
    // RACE_INFO data — never from a mode-specific code path.
    document.querySelectorAll('.grid-button:not(.zero-race-btn)').forEach(button => {
        const bareRace = button.dataset.race;
        const raceKey  = `${bareRace}_RACE`;
        const isRaceAsClassColumn = button.dataset.class === 'RaceAsClass';
        let isAvailable;

        if (isZeroLevel) {
            // Only the Race-as-Class column matters at level 0 — it picks the race,
            // not a class. Separate-class columns are meaningless before level 1.
            isAvailable = isRaceAsClassColumn;
        } else if (isRaceAsClassColumn) {
            isAvailable = hasRaceAsClassEntry(bareRace) && modePreset !== 'race-class';
            if (isAvailable && (raceClassMode === 'strict' || raceClassMode === 'strict-human') && selectedLevel) {
                const maxLvl = CLASS_INFO[bareRace]?.maxLevel ?? 14;
                if (selectedLevel > maxLvl) isAvailable = false;
            }
        } else {
            // Separate-class columns: available to any race under presets A/C.
            // Under preset B (race-as-class only), only Human's separate classes work.
            const className = button.dataset.class;
            if (modePreset === 'race-as-class' && bareRace !== 'Human') {
                isAvailable = false;
            } else if (className === 'Spellblade' && excludeSpellblade) {
                // Referee-configurable: Spellblade is a house-rules hybrid, not part
                // of Basic or Advanced core OSE — Human's separate-class columns are
                // otherwise always available under preset B, so this needs its own
                // check rather than relying on modePreset/raceClassMode alone.
                isAvailable = false;
            } else {
                const allowNonTraditional = (raceClassMode === 'allow-all');
                const availableClasses = getAvailableClasses(bareRace, allowNonTraditional);
                isAvailable = availableClasses.includes(className);
                if (isAvailable && (raceClassMode === 'strict' || raceClassMode === 'strict-human') && selectedLevel) {
                    const maxLvl = getMaxLevel(raceKey, `${className}_CLASS`, false);
                    if (maxLvl !== null && selectedLevel > maxLvl) isAvailable = false;
                }
            }
        }

        button.disabled = !isAvailable;
        if (!isAvailable && button.classList.contains('selected')) {
            selectedRace = null; selectedClass = null;
            button.classList.remove('selected');
        }

        // The Race-as-Class column is available at both level 0 (picking a race
        // for selectedRaceForZero) and level 1+ (picking selectedRace/selectedClass
        // via isRaceAsClassPick) — two different variables sharing the same button.
        // Re-sync its 'selected' class to whichever one is relevant at this level
        // whenever the level changes without a grid click (e.g. a level button click).
        if (isRaceAsClassColumn && isAvailable) {
            const isSelected = isZeroLevel
                ? raceKey === selectedRaceForZero
                : (isRaceAsClassPick && raceKey === selectedRace);
            button.classList.toggle('selected', isSelected);
        }
    });

    // The zero-race-btn shortcuts (Random / Random Demihuman) share selectedRaceForZero
    // with the grid's Race-as-Class column, but selectBuild()/selectSeparateClass()
    // unconditionally clear their 'selected' class when making a level-1+ grid pick.
    // Always re-sync (not just when isZeroLevel) — updateUI() can run once with a
    // stale intermediate selectedLevel during initialize(), before URL params/saved
    // settings apply the real level, so a one-sided "only set when zero" sync could
    // leave a shortcut stuck 'selected' from that earlier pass.
    document.querySelectorAll('.zero-race-btn').forEach(b => {
        b.classList.toggle('selected', isZeroLevel && b.dataset.race === selectedRaceForZero);
    });

    // ── Common: Starting Wealth section ── configurable at any level; no longer
    // greyed based on the currently selected character level.
    const wealthPreview = document.getElementById('wealthPreview');
    if (wealthPreview) {
        if (selectedLevel && selectedLevel >= 2 && selectedClass) {
            try {
                const classData = getClassDataForMode(progressionMode);
                const progData  = getProgData(selectedClass, selectedLevel, { STR:10,INT:10,WIS:10,DEX:10,CON:10,CHA:10 }, classData, true);
                const xpForLevel = progData?.xpForCurrentLevel || 0;
                if (l2PlusWealthMethod === 'fixed') {
                    wealthPreview.textContent = `= ${l2PlusFixedGold.toLocaleString()} gp (fixed)`;
                } else if (l2PlusWealthMethod === 'dice') {
                    wealthPreview.textContent = `= ${l2PlusDiceCount}d${l2PlusDiceSides}\u00d7${l2PlusDiceMult} gp (rolled at generation)`;
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
            ? (xpAmount !== null && xpAmount >= 0 && !!(selectedRace && selectedClass))
            : (selectedLevel !== null && (selectedLevel === 0 || !!(selectedRace && selectedClass)));
        generateButton.disabled = !levelReady;
    }
}

// ── Generate Character (entry point) ─────────────────────────────────────────
export function generateCharacter() {
    runGenerate().catch(e => {
        if (e.code === 'TOO_MANY_ATTEMPTS' || e.code === 'LOW_HP') {
            const display = document.getElementById('characterDisplay');
            if (display) {
                const err = document.createElement('div');
                err.id = 'charGenError';
                err.style.cssText = 'font-family: Arial, sans-serif; max-width: 760px; padding: 40px 20px; text-align: center;';
                const header = e.code === 'LOW_HP' ? 'Character Did Not Become an Adventurer' : 'Could Not Generate Character';
                err.innerHTML = `<div style='font-size: 1.2em; font-weight: bold; color: #c00; margin-bottom: 12px;'>${header}</div><div>${e.message}</div>`;
                display.insertAdjacentElement('afterbegin', err);
                display.classList.add('visible');
            }
        } else {
            console.error('generation error:', e);
        }
    });
}

// Campaign-tier settings not needed to regenerate or level up this exact
// character — only stored so cs-sheet-page.js's buildGeneratorURL() ("Back
// to Generator") can reconstruct the referee's full ruleset later. Omitted
// when equal to the setting's own default, mirroring syncURLParams()'s
// omission thresholds so the encoding stays consistent either way.
//
// rap reuses the same RAP_CODE 2-char encoding generateCharacterV3() already
// writes for level-0 characters (cp.rap) — not the raw racialAdjustmentPolicy
// string — so both write paths agree on one field/format instead of the
// level-1+ path silently overwriting level 0's value with a different shape.
// No new field is needed for No Level 0 Equipment either: generateCharacterV3
// already writes cp.nl0 (1 when true, omitted when false) at both levels.
function buildCampaignRulesetCp() {
    return {
        ...(campaignName ? { cn: campaignName } : {}),
        ...(!excludeSpellblade ? { esb: 0 } : {}),
        // Always written (not omitted-when-default like most other fields
        // here) so the footer can show an explicit Racial Adjustment Policy
        // at every level, not just level 0 — matches generateCharacterV3's
        // own level-0 cp.rap, which is also always written.
        rap: RAP_CODE[racialAdjustmentPolicy],
        ...(l0WealthMethod !== 'dice' ? { l0wm: l0WealthMethod } : {}),
        ...(l0DiceCount !== 3 ? { l0dc: l0DiceCount } : {}),
        ...(l0DiceSides !== 6 ? { l0ds: l0DiceSides } : {}),
        ...(l0DiceMult !== 1 ? { l0dm: l0DiceMult } : {}),
        ...(l0FixedGold !== 0 ? { l0fg: l0FixedGold } : {}),
        ...(l1WealthMethod !== 'dice' ? { l1wm: l1WealthMethod } : {}),
        ...(l1DiceCount !== 3 ? { l1dc: l1DiceCount } : {}),
        ...(l1DiceSides !== 6 ? { l1ds: l1DiceSides } : {}),
        ...(l1DiceMult !== 10 ? { l1dm: l1DiceMult } : {}),
        ...(l1FixedGold !== 0 ? { l1fg: l1FixedGold } : {}),
        ...(l2PlusWealthMethod !== 'xp-pct' ? { l2wm: l2PlusWealthMethod } : {}),
        ...(l2PlusDiceCount !== 3 ? { l2dc: l2PlusDiceCount } : {}),
        ...(l2PlusDiceSides !== 6 ? { l2ds: l2PlusDiceSides } : {}),
        ...(l2PlusDiceMult !== 10 ? { l2dm: l2PlusDiceMult } : {}),
        ...(l2PlusFixedGold !== 0 ? { l2fg: l2PlusFixedGold } : {}),
        ...(byXpWealthMethod !== 'xp-pct' ? { xwm: byXpWealthMethod } : {}),
        ...(byXpDiceCount !== 3 ? { xdc: byXpDiceCount } : {}),
        ...(byXpDiceSides !== 6 ? { xds: byXpDiceSides } : {}),
        ...(byXpDiceMult !== 10 ? { xdm: byXpDiceMult } : {}),
        ...(byXpFixedGold !== 0 ? { xfg: byXpFixedGold } : {}),
    };
}

async function runGenerate() {
    document.getElementById('charGenError')?.remove();

    if (!xpMode && selectedLevel === 0) { await generateZeroLevel(); return; }

    // A race is always chosen alongside a class now — via the Race-as-Class
    // column or a separate-class column — so both are required to generate.
    // isSeparateRaceClass is policy-driven (not just !isRaceAsClassPick) so a
    // referee's Racial Adjustment Policy applies identically whether a character
    // is built directly at level 1+ or arrives there via the level 0 -> 1 step.
    // Shared with cs-sheet-page.js's level-up transition via shared-core.js so
    // the two paths can't silently diverge if a 6th policy is ever added.
    const isSeparateRaceClass = isSeparateRaceClassForPolicy(RAP_CODE[racialAdjustmentPolicy], isRaceAsClassPick);
    if (!selectedClass) { alert('Please select a class first!'); return; }
    if (!selectedRace) { alert('Please select a race first!'); return; }
    if (xpMode && (xpAmount === null || xpAmount < 0)) { alert('Please enter an XP amount.'); return; }
    if (!xpMode && !selectedLevel) { alert('Please select a level first!'); return; }

    const classData = getClassDataForMode(progressionMode);
    const effectiveLevel = xpMode ? classData.getLevelFromXP(selectedClass, xpAmount) : selectedLevel;
    const hasBlessed = selectedRace === 'Human_RACE' && raceClassMode !== 'strict';
    const hpMode = hpRollingMode === '5e' ? 2
        : (hpRollingMode === 'blessed' || hasBlessed) ? 1
        : hpRollingMode === 'healthy' ? 3 : 0;

    const fixedScoresForGen = useFixedScores ? readScoresFromInputs() : null;
    const _fixedAdj = fixedAdjustments;
    fixedAdjustments = null;

    // Direct level 2+ generation dispatches on l2PlusWealthMethod inside
    // generateCharacterV3 itself (xp-pct/fixed/dice all handled there). By XP
    // is its own independent tier (own dice/fixed/xp-pct, not borrowed from
    // Level 1 or Level 2+), computed here since it depends on the typed XP
    // value rather than a derived level's XP threshold.
    const _goldOverride = (fixedStartingGold !== null) ? fixedStartingGold
        : (xpMode && xpAmount !== null && byXpWealthMethod === 'dice')
            ? rollDiceGold(byXpDiceCount, byXpDiceSides, byXpDiceMult)
        : (xpMode && xpAmount !== null && byXpWealthMethod === 'fixed')
            ? byXpFixedGold
        : (xpMode && xpAmount !== null) ? calcStartingGold(xpAmount, wealthPct)
        : null;
    const cp = generateCharacterV3({
        level: effectiveLevel,
        race: selectedRace,
        isSeparateRaceClass,
        className: selectedClass, progressionMode, raceClassMode,
        minimums: readScoresFromInputs(), primeReqMode: primeRequisiteMode,
        hpMode, includeLevel0HP,
        fixedScores: fixedScoresForGen,
        fixedName: useFixedScores ? (document.getElementById('characterName')?.value.trim() || '') : '',
        fixedAdjustments: _fixedAdj,
        fixedOccupation: document.getElementById('zeroOccupation')?.value || null,
        wealthPct, fixedHPRolls, noLevel0Equipment, classData,
        fixedStartingGold: _goldOverride,
        l0WealthMethod, l0DiceCount, l0DiceSides, l0DiceMult, l0FixedGold,
        l1WealthMethod, l1DiceCount, l1DiceSides, l1DiceMult, l1FixedGold,
        l2PlusWealthMethod, l2PlusDiceCount, l2PlusDiceSides, l2PlusDiceMult, l2PlusFixedGold,
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
        ...(sheetBranding === 'dnd' ? { sb: 1 } : {}),
        wp: wealthPct, prm: primeRequisiteMode==='user'?0:parseInt(primeRequisiteMode),
        sm: ['STR','DEX','CON','INT','WIS','CHA'].map(a => readScoresFromInputs()[a] || 3),
        ...(isSeparateRaceClass && hideHumanRace ? { hhr: 1 } : {}),
        ...(adm != null ? { adm } : {}),
        ...buildCampaignRulesetCp(),
    };

    const SCRS = ['STR','DEX','CON','INT','WIS','CHA'];
    const rawScores = cp.s || [10,10,10,10,10,10];
    const racialMods = isSeparateRaceClass ? (getRaceInfo(selectedRace)?.abilityModifiers ?? {}) : {};
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
        extraSections: [
            { label:'Race/Class Restrictions', name:'editRaceClassMode', options:[
                { value:'strict',               label:'Strict OSE',                checked: raceClassMode==='strict' },
                { value:'strict-human',         label:'Strict + Human Abilities',  checked: raceClassMode==='strict-human' },
                { value:'traditional-extended', label:'Traditional Extended',       checked: raceClassMode==='traditional-extended' },
                { value:'allow-all',            label:'Allow All',                 checked: raceClassMode==='allow-all' },
            ]},
            { label:'AC Display Mode', name:'editACDisplayMode', options:[
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
        if (values.editRaceClassMode) raceClassMode=values.editRaceClassMode;
        document.querySelectorAll('input[name="raceClassMode"]').forEach(r=>{r.checked=r.value===raceClassMode;});
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
async function generateZeroLevel() {
    const fixedScoresForGen = useFixedScores ? readScoresFromInputs() : null;
    const fixedName   = document.getElementById('characterName')?.value.trim() || '';
    const _fixedAdj   = fixedAdjustments;
    fixedAdjustments  = null;
    const hpMode = hpRollingMode === 'healthy' ? 3 : hpRollingMode === 'blessed' ? 1 : 0;

    // Whether level 0 itself shows racial ability adjustments/minimums is now
    // governed by the referee's Racial Adjustment Policy (previously always true).
    const cp = generateCharacterV3({
        level: 0, race: selectedRaceForZero,
        isSeparateRaceClass: L0_ADJUSTED_POLICIES.has(racialAdjustmentPolicy),
        racialAdjustmentPolicy,
        progressionMode, raceClassMode,
        minimums: readScoresFromInputs(), primeReqMode: primeRequisiteMode,
        hpMode, fixedScores: fixedScoresForGen, fixedName,
        fixedOccupation: document.getElementById('zeroOccupation')?.value || null,
        fixedAdjustments: _fixedAdj,
        fixedStartingGold, noLevel0Equipment,
        l0WealthMethod, l0DiceCount, l0DiceSides, l0DiceMult, l0FixedGold,
    });
    fixedStartingGold = null;
    _scoreRollAttempts = cp.rr || 1;

    const adm = {'dac-matrix':1,'dual':2,'dual-matrix':3}[acDisplayMode];
    const fullCp = {
        ...cp,
        un: showUndeadNames?1:0, qr: showQRCode?1:0, ao: basicAbilityOrdering?1:0,
        ...(sheetBranding === 'dnd' ? { sb: 1 } : {}),
        prm: primeRequisiteMode==='user'?0:parseInt(primeRequisiteMode),
        sm: ['STR','DEX','CON','INT','WIS','CHA'].map(a => readScoresFromInputs()[a] || 3),
        ...(adm != null ? { adm } : {}),
        ...buildCampaignRulesetCp(),
    };

    const SCRS = ['STR','DEX','CON','INT','WIS','CHA'];
    const rawScores = cp.s || [10,10,10,10,10,10];
    const racialMods = L0_ADJUSTED_POLICIES.has(racialAdjustmentPolicy)
        ? (getRaceInfo(selectedRaceForZero || 'Human_RACE')?.abilityModifiers ?? {})
        : {};
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
        hpRolls: cp.hr || [], hpDice: [],
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
        mode: modePreset, acDisplayMode,
        progressionMode, primeRequisiteMode, hpRollingMode, includeLevel0HP,
        useFixedScores, showUndeadNames, hideHumanRace, basicAbilityOrdering, sheetBranding, wealthPct,
        noLevel0Equipment, xpMode, xpAmount,
        l0WealthMethod, l0DiceCount, l0DiceSides, l0DiceMult, l0FixedGold,
        l1WealthMethod, l1DiceCount, l1DiceSides, l1DiceMult, l1FixedGold,
        l2PlusWealthMethod, l2PlusDiceCount, l2PlusDiceSides, l2PlusDiceMult, l2PlusFixedGold,
        byXpWealthMethod, byXpDiceCount, byXpDiceSides, byXpDiceMult, byXpFixedGold,
        autoGenerateOnLevelChange, autoGenerateOnClassChange, autoGenerateOnLoad,
        selectedLevel, selectedClass, characterName: document.getElementById('characterName')?.value||'',
        scoreSTR: parseInt(document.getElementById('scoreSTR')?.value)||3,
        scoreINT: parseInt(document.getElementById('scoreINT')?.value)||3,
        scoreWIS: parseInt(document.getElementById('scoreWIS')?.value)||3,
        scoreDEX: parseInt(document.getElementById('scoreDEX')?.value)||3,
        scoreCON: parseInt(document.getElementById('scoreCON')?.value)||3,
        scoreCHA: parseInt(document.getElementById('scoreCHA')?.value)||3,
        raceClassMode, excludeSpellblade, selectedRace, selectedRaceForZero, racialAdjustmentPolicy,
        campaignName,
    });
    syncURLParams();
}

// Recompute campaignNameCompressed from the current campaignName, then
// re-sync the URL so the (now-stale) `cn` param picks up the fresh value.
// Compression is async (gzip via CompressionStream), so this can't happen
// inline inside syncURLParams() itself — call this on campaignName changes
// and let syncURLParams() read the cached result synchronously everywhere else.
//
// campaignNameVersion guards against a race on page load: localStorage
// restore and URL-param restore both touch campaignName/campaignNameCompressed
// in the same synchronous tick (URL always applied second, so it should always
// win — see initialize()), but their async compress/decompress calls can
// resolve in either order. Each async callback captures the version at the
// moment it was scheduled and no-ops if a newer update has since superseded it,
// so whichever restore ran last always wins regardless of resolution order.
let campaignNameVersion = 0;
async function updateCampaignNameCompressed() {
    const myVersion = ++campaignNameVersion;
    const compressed = campaignName ? await compressToBase64Url(campaignName) : '';
    if (myVersion !== campaignNameVersion) return; // superseded — discard
    campaignNameCompressed = compressed;
    syncURLParams();
}

// ── URL Sync ──────────────────────────────────────────────────────────────────
function syncURLParams() {
    const p = new URLSearchParams();
    p.set('mode', modePreset);
    if (campaignNameCompressed)                                    p.set('cn', campaignNameCompressed);
    if (progressionMode !== 'ose')                                 p.set('p', progressionMode);
    if (selectedLevel !== null)                                    p.set('l', String(selectedLevel));
    if (selectedClass)                                             p.set('c', selectedClass.replace('_CLASS',''));
    if (selectedRace)                                              p.set('r', selectedRace.replace('_RACE',''));
    if (raceClassMode !== 'strict')                                p.set('rcm', raceClassMode);
    if (!excludeSpellblade)                                        p.set('esb', '0');
    if (racialAdjustmentPolicy !== 'never')                        p.set('rap', racialAdjustmentPolicy);
    if (primeRequisiteMode !== 'user')                             p.set('prm', primeRequisiteMode);
    if (hpRollingMode !== 'normal')                                p.set('hpm', hpRollingMode);
    if (includeLevel0HP)                                           p.set('il', '1');
    if (showUndeadNames)                                           p.set('un', '1');
    if (hideHumanRace)                                             p.set('hhr', '1');
    if (!basicAbilityOrdering)                                     p.set('ao', '0');
    if (sheetBranding !== 'ose')                                   p.set('sb', sheetBranding);
    if (acDisplayMode !== 'aac')                                   p.set('adm', acDisplayMode);
    if (wealthPct !== 20)                                          p.set('wp', String(wealthPct));
    if (l0WealthMethod !== 'dice')                                 p.set('l0wm', l0WealthMethod);
    if (l0DiceCount !== 3)                                         p.set('l0dc', String(l0DiceCount));
    if (l0DiceSides !== 6)                                         p.set('l0ds', String(l0DiceSides));
    if (l0DiceMult !== 1)                                          p.set('l0dm', String(l0DiceMult));
    if (l0FixedGold !== 0)                                         p.set('l0fg', String(l0FixedGold));
    if (l1WealthMethod !== 'dice')                                 p.set('l1wm', l1WealthMethod);
    if (l1DiceCount !== 3)                                         p.set('l1dc', String(l1DiceCount));
    if (l1DiceSides !== 6)                                         p.set('l1ds', String(l1DiceSides));
    if (l1DiceMult !== 10)                                         p.set('l1dm', String(l1DiceMult));
    if (l1FixedGold !== 0)                                         p.set('l1fg', String(l1FixedGold));
    if (l2PlusWealthMethod !== 'xp-pct')                           p.set('l2wm', l2PlusWealthMethod);
    if (l2PlusDiceCount !== 3)                                     p.set('l2dc', String(l2PlusDiceCount));
    if (l2PlusDiceSides !== 6)                                     p.set('l2ds', String(l2PlusDiceSides));
    if (l2PlusDiceMult !== 10)                                     p.set('l2dm', String(l2PlusDiceMult));
    if (l2PlusFixedGold !== 0)                                     p.set('l2fg', String(l2PlusFixedGold));
    if (byXpWealthMethod !== 'xp-pct')                             p.set('xwm', byXpWealthMethod);
    if (byXpDiceCount !== 3)                                       p.set('xdc', String(byXpDiceCount));
    if (byXpDiceSides !== 6)                                       p.set('xds', String(byXpDiceSides));
    if (byXpDiceMult !== 10)                                       p.set('xdm', String(byXpDiceMult));
    if (byXpFixedGold !== 0)                                       p.set('xfg', String(byXpFixedGold));
    if (!noLevel0Equipment)                                        p.set('nl0e', '0');
    if (selectedLevel === 0 && selectedRaceForZero)                p.set('zr', selectedRaceForZero);
    if (autoGenerateOnLevelChange)                                 p.set('agl', '1');
    if (autoGenerateOnClassChange)                                 p.set('agc', '1');
    if (autoGenerateOnLoad)                                        p.set('ago', '1');
    const n = document.getElementById('characterName')?.value.trim();
    if (n) p.set('n', n);
    // Ability score minimums — only emit when any differ from defaults
    const scoreOrder = ['STR','INT','WIS','DEX','CON','CHA'];
    const scoreDefs  = { STR:3, INT:3, WIS:3, DEX:3, CON:3, CHA:3 };
    const scoreVals  = scoreOrder.map(a => parseInt(document.getElementById(`score${a}`)?.value) || scoreDefs[a]);
    if (scoreVals.some((v, i) => v !== scoreDefs[scoreOrder[i]])) {
        p.set('s', scoreVals.join(','));
    }
    window.history.replaceState({}, '', `${window.location.pathname}?${p.toString()}`);
}

// ── Share / QR Code ───────────────────────────────────────────────────────────

/**
 * Build a Campaign Profile link: the current generator.html URL with every
 * Character-tier param (level, class, race, name, zero-level race) stripped,
 * so the shared link always carries just the referee's ruleset — never a
 * specific character-in-progress, regardless of what's currently selected
 * in the grid or name field.
 */
function buildCampaignProfileURL() {
    const url = new URL(window.location.href);
    ['l', 'c', 'r', 'n', 'zr'].forEach(key => url.searchParams.delete(key));
    return url.toString();
}

function showShareQR() {
    const url = buildCampaignProfileURL();
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
    if (s.raceClassMode) {
        raceClassMode = s.raceClassMode;
        const RCM_IDS = {strict:'strictOSE','strict-human':'strictOSEHuman','traditional-extended':'traditionalExtended','allow-all':'allowAll'};
        document.querySelectorAll('input[name="raceClassMode"]').forEach(r=>{r.checked=false;});
        const _id = RCM_IDS[s.raceClassMode];
        if (_id) { const el=document.getElementById(_id); if(el) el.checked=true; }
    }
    if (s.excludeSpellblade!==undefined) { excludeSpellblade=s.excludeSpellblade; const _el=document.getElementById('excludeSpellblade'); if(_el) _el.checked=s.excludeSpellblade; }
    if (s.racialAdjustmentPolicy) {
        racialAdjustmentPolicy = s.racialAdjustmentPolicy;
        document.querySelectorAll('input[name="racialAdjustmentPolicy"]').forEach(r=>{r.checked=r.value===s.racialAdjustmentPolicy;});
        const tier1Value = L0_ADJUSTED_POLICIES.has(s.racialAdjustmentPolicy) ? 'applied' : 'not-applied';
        document.querySelectorAll('input[name="rapTier1"]').forEach(r=>{r.checked=r.value===tier1Value;});
        const appliedGroup = document.getElementById('rapTier2Applied');
        const notAppliedGroup = document.getElementById('rapTier2NotApplied');
        if (appliedGroup)    appliedGroup.classList.toggle('section-greyed', tier1Value !== 'applied');
        if (notAppliedGroup) notAppliedGroup.classList.toggle('section-greyed', tier1Value !== 'not-applied');
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
    if (s.sheetBranding!==undefined) { sheetBranding=s.sheetBranding; document.querySelectorAll('input[name="sheetBranding"]').forEach(r=>{r.checked=r.value===s.sheetBranding;}); }
    if (s.autoGenerateOnLevelChange!==undefined) { autoGenerateOnLevelChange=s.autoGenerateOnLevelChange; setBool('autoGenerateOnLevelChange','autoGenerateOnLevelChange'); }
    if (s.autoGenerateOnClassChange!==undefined) { autoGenerateOnClassChange=s.autoGenerateOnClassChange; setBool('autoGenerateOnClassChange','autoGenerateOnClassChange'); }
    if (s.autoGenerateOnLoad!==undefined)        { autoGenerateOnLoad=s.autoGenerateOnLoad;               setBool('autoGenerateOnLoad','autoGenerateOnLoad'); }
    if (s.wealthPct!==undefined)          { wealthPct=s.wealthPct; const _wp=document.getElementById('wealthPctInput'); if(_wp) _wp.value=s.wealthPct; const _xwp=document.getElementById('xpWealthPctInput'); if(_xwp) _xwp.value=s.wealthPct; }
    if (s.l0WealthMethod!==undefined) { l0WealthMethod=s.l0WealthMethod; document.querySelectorAll('input[name="l0WealthMethod"]').forEach(r=>{r.checked=r.value===s.l0WealthMethod;}); }
    if (s.l0DiceCount!==undefined) { l0DiceCount=s.l0DiceCount; const _el=document.getElementById('l0DiceCount'); if(_el) _el.value=s.l0DiceCount; }
    if (s.l0DiceSides!==undefined) { l0DiceSides=s.l0DiceSides; const _el=document.getElementById('l0DiceSides'); if(_el) _el.value=s.l0DiceSides; }
    if (s.l0DiceMult!==undefined)  { l0DiceMult=s.l0DiceMult;   const _el=document.getElementById('l0DiceMult');  if(_el) _el.value=s.l0DiceMult; }
    if (s.l0FixedGold!==undefined) { l0FixedGold=s.l0FixedGold; const _el=document.getElementById('l0FixedGold'); if(_el) _el.value=s.l0FixedGold; }
    if (s.l1WealthMethod!==undefined) { l1WealthMethod=s.l1WealthMethod; document.querySelectorAll('input[name="l1WealthMethod"]').forEach(r=>{r.checked=r.value===s.l1WealthMethod;}); }
    if (s.l1DiceCount!==undefined) { l1DiceCount=s.l1DiceCount; const _el=document.getElementById('l1DiceCount'); if(_el) _el.value=s.l1DiceCount; }
    if (s.l1DiceSides!==undefined) { l1DiceSides=s.l1DiceSides; const _el=document.getElementById('l1DiceSides'); if(_el) _el.value=s.l1DiceSides; }
    if (s.l1DiceMult!==undefined)  { l1DiceMult=s.l1DiceMult;   const _el=document.getElementById('l1DiceMult');  if(_el) _el.value=s.l1DiceMult; }
    if (s.l1FixedGold!==undefined) { l1FixedGold=s.l1FixedGold; const _el=document.getElementById('l1FixedGold'); if(_el) _el.value=s.l1FixedGold; }
    if (s.l2PlusWealthMethod!==undefined) { l2PlusWealthMethod=s.l2PlusWealthMethod; document.querySelectorAll('input[name="l2WealthMethod"]').forEach(r=>{r.checked=r.value===s.l2PlusWealthMethod;}); }
    if (s.l2PlusDiceCount!==undefined) { l2PlusDiceCount=s.l2PlusDiceCount; const _el=document.getElementById('l2DiceCount'); if(_el) _el.value=s.l2PlusDiceCount; }
    if (s.l2PlusDiceSides!==undefined) { l2PlusDiceSides=s.l2PlusDiceSides; const _el=document.getElementById('l2DiceSides'); if(_el) _el.value=s.l2PlusDiceSides; }
    if (s.l2PlusDiceMult!==undefined)  { l2PlusDiceMult=s.l2PlusDiceMult;   const _el=document.getElementById('l2DiceMult');  if(_el) _el.value=s.l2PlusDiceMult; }
    if (s.l2PlusFixedGold!==undefined) { l2PlusFixedGold=s.l2PlusFixedGold; const _el=document.getElementById('l2FixedGold'); if(_el) _el.value=s.l2PlusFixedGold; }
    if (s.byXpWealthMethod!==undefined)   { byXpWealthMethod=s.byXpWealthMethod; document.querySelectorAll('input[name="byXpWealthMethod"]').forEach(r=>{r.checked=r.value===s.byXpWealthMethod;}); }
    if (s.byXpDiceCount!==undefined) { byXpDiceCount=s.byXpDiceCount; const _el=document.getElementById('xpDiceCount'); if(_el) _el.value=s.byXpDiceCount; }
    if (s.byXpDiceSides!==undefined) { byXpDiceSides=s.byXpDiceSides; const _el=document.getElementById('xpDiceSides'); if(_el) _el.value=s.byXpDiceSides; }
    if (s.byXpDiceMult!==undefined)  { byXpDiceMult=s.byXpDiceMult;   const _el=document.getElementById('xpDiceMult');  if(_el) _el.value=s.byXpDiceMult; }
    if (s.byXpFixedGold!==undefined) { byXpFixedGold=s.byXpFixedGold; const _el=document.getElementById('xpFixedGold'); if(_el) _el.value=s.byXpFixedGold; }
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
        let sr = s.selectedRace;
        if (!sr) {
            // No race given — only safe to fill in if the class unambiguously
            // implies one (a race-as-class pick). A separate class alone
            // (e.g. Fighter) could belong to any race — don't guess.
            const bareClass = s.selectedClass.replace('_CLASS', '');
            sr = (CLASS_INFO[bareClass]?.classType === 'raceAsClass') ? `${bareClass}_RACE` : null;
        }
        if (sr) {
            selectedRace = sr; selectedClass = s.selectedClass;
            const bareRace = sr.replace('_RACE', '');
            isRaceAsClassPick = hasRaceAsClassEntry(bareRace) && `${bareRace}_CLASS` === s.selectedClass;
            document.querySelectorAll('.grid-button:not(.zero-race-btn)').forEach(b=>{
                const r = b.dataset.race ? `${b.dataset.race}_RACE` : null;
                const isRaceAsClassColumn = b.dataset.class === 'RaceAsClass';
                const matches = isRaceAsClassColumn
                    ? (isRaceAsClassPick && r===sr)
                    : (!isRaceAsClassPick && r===sr && `${b.dataset.class}_CLASS`===s.selectedClass);
                b.classList.toggle('selected', matches);
            });
        } else {
            // Ambiguous partial state — don't pair a new class with a stale
            // race/pick-type from a previous selection.
            selectedRace = null; selectedClass = null; isRaceAsClassPick = false;
            document.querySelectorAll('.grid-button:not(.zero-race-btn)').forEach(b=>b.classList.remove('selected'));
        }
    }
    if (s.selectedRaceForZero!==undefined) {
        selectedRaceForZero=s.selectedRaceForZero;
        document.querySelectorAll('.zero-race-btn').forEach(b=>b.classList.toggle('selected',b.dataset.race===s.selectedRaceForZero));
    }
    if (s.characterName!==undefined) { characterName=s.characterName; const el=document.getElementById('characterName'); if(el) el.value=s.characterName; }
    // Campaign Name — two possible sources: localStorage restore gives the raw
    // string directly; URL restore gives the compressed `cn` param and needs
    // async decompression. See updateCampaignNameCompressed()'s comment for why
    // both paths bump campaignNameVersion to guard against resolving out of order.
    if (s.campaignName!==undefined) {
        campaignName = s.campaignName;
        const el = document.getElementById('campaignName'); if (el) el.value = campaignName;
        updateCampaignNameCompressed();
    }
    if (s.campaignNameCompressed!==undefined) {
        campaignNameCompressed = s.campaignNameCompressed;
        const myVersion = ++campaignNameVersion;
        decompressFromBase64Url(s.campaignNameCompressed).then(name => {
            if (myVersion !== campaignNameVersion) return; // superseded — discard
            campaignName = name;
            const el = document.getElementById('campaignName'); if (el) el.value = name;
        }).catch(e => console.warn('OSE: could not decompress campaign name:', e));
    }
    ['STR','INT','WIS','DEX','CON','CHA'].forEach(a=>{
        const v=s[`score${a}`]; if(v!==undefined){ const el=document.getElementById(`score${a}`); if(el) el.value=v; }
    });
    updateModifiers();
}

function applyPreset(modeValue, overrides) {
    document.querySelectorAll('input[name="mode"]').forEach(r => { r.checked = r.value === modeValue; });
    setModePreset(modeValue);
    applySettings({
        progressionMode: 'ose', primeRequisiteMode: 'user',
        hpRollingMode: 'normal', includeLevel0HP: false,
        scoreSTR:3, scoreINT:3, scoreWIS:3, scoreDEX:3, scoreCON:3, scoreCHA:3,
        useFixedScores: false, noLevel0Equipment: true, excludeSpellblade: false,
        ...overrides,
    });
    saveCurrentSettings();
    updateUI();
}

const WEALTH_METHOD_DEFAULTS = {
    l0WealthMethod: 'dice', l0DiceCount: 3, l0DiceSides: 6, l0DiceMult: 1, l0FixedGold: 0,
    l1WealthMethod: 'dice', l1DiceCount: 3, l1DiceSides: 6, l1DiceMult: 10, l1FixedGold: 0,
    l2PlusWealthMethod: 'xp-pct', l2PlusDiceCount: 3, l2PlusDiceSides: 6, l2PlusDiceMult: 10, l2PlusFixedGold: 0,
    byXpWealthMethod: 'xp-pct', byXpDiceCount: 3, byXpDiceSides: 6, byXpDiceMult: 10, byXpFixedGold: 0,
};

function handleAuthorPreferred() {
    applyPreset('race-class', { progressionMode: 'smoothprog', primeRequisiteMode: '9', hpRollingMode: 'healthy', scoreCON: 9, wealthPct: 20, raceClassMode: 'traditional-extended', racialAdjustmentPolicy: 'always', ...WEALTH_METHOD_DEFAULTS });
}

function handleConventionMode() {
    applyPreset('both', { progressionMode: 'smoothprog', primeRequisiteMode: '13', hpRollingMode: 'healthy', includeLevel0HP: true, scoreCON: 9, wealthPct: 20, raceClassMode: 'allow-all', racialAdjustmentPolicy: 'always', ...WEALTH_METHOD_DEFAULTS });
}

// Resets only the Referee cluster (sections 1-6: mode preset, progression mode,
// minimum ability scores + "use these scores" toggle, race/class restrictions,
// racial adjustment policy, and the other referee options). Does not touch
// Player-cluster fields or their saved values — each reset button only affects
// its own cluster, so scoped resets are additive saves, never a storage wipe.
// Shared by the two mode-flavored reset buttons below, which only differ in
// modePresetValue, racialAdjustmentPolicyValue, and excludeSpellbladeValue.
function applyRefereeModeReset(modePresetValue, racialAdjustmentPolicyValue, excludeSpellbladeValue) {
    progressionMode='ose'; primeRequisiteMode='user'; raceClassMode='strict';
    hpRollingMode='normal'; includeLevel0HP=false; useFixedScores=false; noLevel0Equipment=true;
    excludeSpellblade=excludeSpellbladeValue; const _esbEl=document.getElementById('excludeSpellblade'); if(_esbEl) _esbEl.checked=excludeSpellbladeValue;
    document.querySelectorAll('input[name="hpRollingMode"]').forEach(r=>{r.checked=r.value==='normal';});
    xpMode=false; xpAmount=null; const _lmR=document.getElementById('levelModeFixed'); if(_lmR) _lmR.checked=true; const _xaR=document.getElementById('xpAmount'); if(_xaR) _xaR.value='';
    document.querySelectorAll('input[name="progressionMode"]').forEach(r=>{r.checked=r.value==='ose';});
    document.querySelectorAll('input[name="raceClassMode"]').forEach(r=>{r.checked=false;});
    const _rcmEl = document.getElementById('strictOSE'); if(_rcmEl) _rcmEl.checked=true;
    racialAdjustmentPolicy = racialAdjustmentPolicyValue;
    document.querySelectorAll('input[name="racialAdjustmentPolicy"]').forEach(r=>{r.checked=r.value===racialAdjustmentPolicyValue;});
    const tier1Value = L0_ADJUSTED_POLICIES.has(racialAdjustmentPolicyValue) ? 'applied' : 'not-applied';
    document.querySelectorAll('input[name="rapTier1"]').forEach(r=>{r.checked=r.value===tier1Value;});
    const _rapAppliedEl = document.getElementById('rapTier2Applied'); if(_rapAppliedEl) _rapAppliedEl.classList.toggle('section-greyed', tier1Value !== 'applied');
    const _rapNotAppliedEl = document.getElementById('rapTier2NotApplied'); if(_rapNotAppliedEl) _rapNotAppliedEl.classList.toggle('section-greyed', tier1Value !== 'not-applied');
    document.querySelectorAll('input[name="primeRequisiteMode"]').forEach(r=>{r.checked=r.value==='user';});
    wealthPct=20; const _wpR=document.getElementById('wealthPctInput'); if(_wpR) _wpR.value=20; const _xwpR=document.getElementById('xpWealthPctInput'); if(_xwpR) _xwpR.value=20;
    l0WealthMethod='dice'; l0DiceCount=3; l0DiceSides=6; l0DiceMult=1; l0FixedGold=0;
    l1WealthMethod='dice'; l1DiceCount=3; l1DiceSides=6; l1DiceMult=10; l1FixedGold=0;
    l2PlusWealthMethod='xp-pct'; l2PlusDiceCount=3; l2PlusDiceSides=6; l2PlusDiceMult=10; l2PlusFixedGold=0;
    byXpWealthMethod='xp-pct'; byXpDiceCount=3; byXpDiceSides=6; byXpDiceMult=10; byXpFixedGold=0;
    document.querySelectorAll('input[name="l0WealthMethod"]').forEach(r=>{r.checked=r.value==='dice';});
    document.querySelectorAll('input[name="l1WealthMethod"]').forEach(r=>{r.checked=r.value==='dice';});
    document.querySelectorAll('input[name="l2WealthMethod"]').forEach(r=>{r.checked=r.value==='xp-pct';});
    document.querySelectorAll('input[name="byXpWealthMethod"]').forEach(r=>{r.checked=r.value==='xp-pct';});
    const _l0dc=document.getElementById('l0DiceCount'); if(_l0dc) _l0dc.value=3;
    const _l0ds=document.getElementById('l0DiceSides'); if(_l0ds) _l0ds.value=6;
    const _l0dm=document.getElementById('l0DiceMult');  if(_l0dm) _l0dm.value=1;
    const _l0fg=document.getElementById('l0FixedGold'); if(_l0fg) _l0fg.value=0;
    const _l1dc=document.getElementById('l1DiceCount'); if(_l1dc) _l1dc.value=3;
    const _l1ds=document.getElementById('l1DiceSides'); if(_l1ds) _l1ds.value=6;
    const _l1dm=document.getElementById('l1DiceMult');  if(_l1dm) _l1dm.value=10;
    const _l1fg=document.getElementById('l1FixedGold'); if(_l1fg) _l1fg.value=0;
    const _l2dc=document.getElementById('l2DiceCount'); if(_l2dc) _l2dc.value=3;
    const _l2ds=document.getElementById('l2DiceSides'); if(_l2ds) _l2ds.value=6;
    const _l2dm=document.getElementById('l2DiceMult');  if(_l2dm) _l2dm.value=10;
    const _l2fg=document.getElementById('l2FixedGold'); if(_l2fg) _l2fg.value=0;
    const _xdc=document.getElementById('xpDiceCount');  if(_xdc) _xdc.value=3;
    const _xds=document.getElementById('xpDiceSides');  if(_xds) _xds.value=6;
    const _xdm=document.getElementById('xpDiceMult');   if(_xdm) _xdm.value=10;
    const _xfg=document.getElementById('xpFixedGold');  if(_xfg) _xfg.value=0;
    const _ufsEl=document.getElementById('useFixedScores'); if(_ufsEl) _ufsEl.checked=false;
    const _nl0eEl=document.getElementById('noLevel0Equipment'); if(_nl0eEl) _nl0eEl.checked=true;
    ['STR','INT','WIS','DEX','CON','CHA'].forEach(a=>{const el=document.getElementById(`score${a}`);if(el)el.value=3;});
    updateModifiers();
    // Reset the mode preset radio + hideHumanRaceOption greying directly rather
    // than via setModePreset(), which would reload (and re-clobber with) whatever
    // is still saved for this cluster before saveCurrentSettings() below runs.
    modePreset = modePresetValue;
    document.querySelectorAll('input[name="mode"]').forEach(r => { r.checked = r.value === modePresetValue; });
    const hideHumanRaceOption = document.getElementById('hideHumanRaceOption');
    if (hideHumanRaceOption) {
        const disabled = modePresetValue === 'race-as-class';
        hideHumanRaceOption.classList.toggle('section-greyed', disabled);
        const cb = document.getElementById('hideHumanRace'); if (cb) cb.disabled = disabled;
    }
    updateUI();
    saveCurrentSettings();
}

function handleBasicModeReset() {
    applyRefereeModeReset('race-as-class', 'never', true);
}

function handleAdvancedModeReset() {
    applyRefereeModeReset('race-class', 'separate-only', false);
}

// Resets only the Player cluster (sections 7-8: character name and the
// display/workflow options). Does not touch Referee-cluster fields. Shared by
// the two Player reset buttons below, which only differ in acDisplayModeValue,
// basicAbilityOrderingValue, and sheetBrandingValue.
function applyPlayerModeReset(acDisplayModeValue, basicAbilityOrderingValue, sheetBrandingValue) {
    showUndeadNames=false; hideHumanRace=false; basicAbilityOrdering=basicAbilityOrderingValue; acDisplayMode=acDisplayModeValue;
    sheetBranding=sheetBrandingValue;
    autoGenerateOnLevelChange=false; autoGenerateOnClassChange=false; autoGenerateOnLoad=false;
    document.querySelectorAll('input[name="acDisplayMode"]').forEach(r=>{r.checked=r.value===acDisplayModeValue;});
    document.querySelectorAll('input[name="sheetBranding"]').forEach(r=>{r.checked=r.value===sheetBrandingValue;});
    ['showUndeadNames','hideHumanRace','openInNewTab'].forEach(id=>{const el=document.getElementById(id);if(el)el.checked=false;});
    ['autoGenerateOnLevelChange','autoGenerateOnClassChange','autoGenerateOnLoad'].forEach(id=>{const el=document.getElementById(id);if(el)el.checked=false;});
    const aoEl=document.getElementById('basicAbilityOrdering'); if(aoEl) aoEl.checked=basicAbilityOrderingValue;
    const _nameEl=document.getElementById('characterName'); if(_nameEl) _nameEl.value='';
    characterName='';
    updateUI();
    saveCurrentSettings();
}

function handleResetPlayerSettings() {
    applyPlayerModeReset('aac', false, 'ose');
}

// 1981 B/X Mode Reset — Descending AC (with attack matrix, matching B/X's
// THAC0-and-tables play), the classic 1977 ability score ordering, and
// Dungeons & Dragons sheet branding, since that's the era and game this reset
// is meant to evoke.
function handleBXModeReset() {
    applyPlayerModeReset('dac-matrix', true, 'dnd');
}

// ── URL Params ────────────────────────────────────────────────────────────────
function readURLParams() {
    const p = new URLSearchParams(window.location.search);
    if (!p.toString()) return {};
    const s = {};
    if (p.has('cn'))    s.campaignNameCompressed = p.get('cn');
    if (p.has('mode'))  s.mode = p.get('mode');
    if (p.has('p'))     s.progressionMode = p.get('p');
    if (p.has('l'))     s.selectedLevel = parseInt(p.get('l'));
    if (p.has('c'))     s.selectedClass = p.get('c') + '_CLASS';
    if (p.has('r'))     s.selectedRace  = p.get('r') + '_RACE';
    if (p.has('rcm'))   s.raceClassMode = p.get('rcm');
    if (p.has('esb'))   s.excludeSpellblade = p.get('esb') !== '0';
    if (p.has('rap'))   s.racialAdjustmentPolicy = p.get('rap');
    if (p.has('prm'))   { const v=p.get('prm'); s.primeRequisiteMode = v==='0'?'user':v; }
    if (p.has('hpm'))   s.hpRollingMode = p.get('hpm');
    if (p.has('il'))    s.includeLevel0HP = p.get('il')==='1';
    if (p.has('un'))    s.showUndeadNames = p.get('un')==='1';
    if (p.has('hhr'))   s.hideHumanRace = p.get('hhr')==='1';
    if (p.has('ao'))    s.basicAbilityOrdering = p.get('ao')==='1';
    if (p.has('sb'))    s.sheetBranding = p.get('sb');
    if (p.has('adm'))   s.acDisplayMode = p.get('adm');
    if (p.has('wp'))    s.wealthPct = parseInt(p.get('wp'));
    if (p.has('l0wm'))  s.l0WealthMethod = p.get('l0wm');
    if (p.has('l0dc'))  s.l0DiceCount = parseInt(p.get('l0dc'));
    if (p.has('l0ds'))  s.l0DiceSides = parseInt(p.get('l0ds'));
    if (p.has('l0dm'))  s.l0DiceMult = parseInt(p.get('l0dm'));
    if (p.has('l0fg'))  s.l0FixedGold = parseInt(p.get('l0fg'));
    if (p.has('l1wm'))  s.l1WealthMethod = p.get('l1wm');
    if (p.has('l1dc'))  s.l1DiceCount = parseInt(p.get('l1dc'));
    if (p.has('l1ds'))  s.l1DiceSides = parseInt(p.get('l1ds'));
    if (p.has('l1dm'))  s.l1DiceMult = parseInt(p.get('l1dm'));
    if (p.has('l1fg'))  s.l1FixedGold = parseInt(p.get('l1fg'));
    if (p.has('l2wm'))  s.l2PlusWealthMethod = p.get('l2wm');
    if (p.has('l2dc'))  s.l2PlusDiceCount = parseInt(p.get('l2dc'));
    if (p.has('l2ds'))  s.l2PlusDiceSides = parseInt(p.get('l2ds'));
    if (p.has('l2dm'))  s.l2PlusDiceMult = parseInt(p.get('l2dm'));
    if (p.has('l2fg'))  s.l2PlusFixedGold = parseInt(p.get('l2fg'));
    if (p.has('xwm'))   s.byXpWealthMethod = p.get('xwm');
    if (p.has('xdc'))   s.byXpDiceCount = parseInt(p.get('xdc'));
    if (p.has('xds'))   s.byXpDiceSides = parseInt(p.get('xds'));
    if (p.has('xdm'))   s.byXpDiceMult = parseInt(p.get('xdm'));
    if (p.has('xfg'))   s.byXpFixedGold = parseInt(p.get('xfg'));
    // Default flipped to true (matches Basic Mode Reset) — only '0' (explicitly
    // off) needs encoding now, but old links with 'nl0e=1' still parse correctly.
    if (p.has('nl0e'))  s.noLevel0Equipment  = p.get('nl0e') !== '0';
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
    // Race/class mode
    document.querySelectorAll('input[name="raceClassMode"]').forEach(r=>{
        r.addEventListener('change',(e)=>{ raceClassMode=e.target.value; updateUI(); saveCurrentSettings(); });
    });
    document.getElementById('excludeSpellblade')?.addEventListener('change', (e) => {
        excludeSpellblade = e.target.checked;
        updateUI(); saveCurrentSettings();
    });
    // Racial Adjustment Policy — Tier 1 (does level 0 get it) toggles which
    // Tier-2 sub-group is enabled and picks that sub-group's first option.
    document.querySelectorAll('input[name="rapTier1"]').forEach(r=>{
        r.addEventListener('change',(e)=>{
            const applied = e.target.value === 'applied';
            const appliedGroup = document.getElementById('rapTier2Applied');
            const notAppliedGroup = document.getElementById('rapTier2NotApplied');
            if (appliedGroup)    appliedGroup.classList.toggle('section-greyed', !applied);
            if (notAppliedGroup) notAppliedGroup.classList.toggle('section-greyed', applied);
            racialAdjustmentPolicy = applied ? 'separate-only' : 'never';
            document.querySelectorAll('input[name="racialAdjustmentPolicy"]').forEach(cb=>{cb.checked=cb.value===racialAdjustmentPolicy;});
            saveCurrentSettings();
        });
    });
    // Racial Adjustment Policy — Tier 2 (the actual persisted value)
    document.querySelectorAll('input[name="racialAdjustmentPolicy"]').forEach(r=>{
        r.addEventListener('change',(e)=>{ racialAdjustmentPolicy=e.target.value; saveCurrentSettings(); });
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
    // Starting Wealth — shared dice-config wiring (count/sides/mult), one call
    // per tier (Level 0, Level 1, Level 2+ all use the same NdSides x mult shape).
    function wireDiceConfig(prefix, setCount, setSides, setMult) {
        document.getElementById(`${prefix}DiceCount`)?.addEventListener('change', (e) => {
            const v = Math.max(1, parseInt(e.target.value) || 1);
            e.target.value = v; setCount(v); updateUI(); saveCurrentSettings();
        });
        document.getElementById(`${prefix}DiceSides`)?.addEventListener('change', (e) => {
            setSides(parseInt(e.target.value)); updateUI(); saveCurrentSettings();
        });
        document.getElementById(`${prefix}DiceMult`)?.addEventListener('change', (e) => {
            const v = Math.max(1, parseInt(e.target.value) || 1);
            e.target.value = v; setMult(v); updateUI(); saveCurrentSettings();
        });
    }
    // Starting Wealth — Level 0
    document.querySelectorAll('input[name="l0WealthMethod"]').forEach(r => {
        r.addEventListener('change', (e) => { l0WealthMethod = e.target.value; saveCurrentSettings(); });
    });
    wireDiceConfig('l0', v=>l0DiceCount=v, v=>l0DiceSides=v, v=>l0DiceMult=v);
    document.getElementById('l0FixedGold')?.addEventListener('change', (e) => {
        l0FixedGold = Math.max(0, parseInt(e.target.value) || 0);
        e.target.value = l0FixedGold;
        saveCurrentSettings();
    });
    // Starting Wealth — Level 1
    document.querySelectorAll('input[name="l1WealthMethod"]').forEach(r => {
        r.addEventListener('change', (e) => { l1WealthMethod = e.target.value; saveCurrentSettings(); });
    });
    wireDiceConfig('l1', v=>l1DiceCount=v, v=>l1DiceSides=v, v=>l1DiceMult=v);
    document.getElementById('l1FixedGold')?.addEventListener('change', (e) => {
        l1FixedGold = Math.max(0, parseInt(e.target.value) || 0);
        e.target.value = l1FixedGold;
        saveCurrentSettings();
    });
    // Starting Wealth — Level 2+ (wealthPct is shared with By XP's %-of-XP
    // option below — both number inputs mirror the same underlying value).
    document.getElementById('wealthPctInput')?.addEventListener('change', () => {
        wealthPct = Math.max(0, parseInt(document.getElementById('wealthPctInput').value) || 0);
        document.getElementById('wealthPctInput').value = wealthPct;
        const _xwp = document.getElementById('xpWealthPctInput'); if (_xwp) _xwp.value = wealthPct;
        document.getElementById('l2WealthXpPct').checked = true;
        l2PlusWealthMethod = 'xp-pct';
        updateUI(); saveCurrentSettings();
    });
    document.querySelectorAll('input[name="l2WealthMethod"]').forEach(r => {
        r.addEventListener('change', (e) => { l2PlusWealthMethod = e.target.value; updateUI(); saveCurrentSettings(); });
    });
    wireDiceConfig('l2', v=>l2PlusDiceCount=v, v=>l2PlusDiceSides=v, v=>l2PlusDiceMult=v);
    document.getElementById('l2FixedGold')?.addEventListener('change', (e) => {
        l2PlusFixedGold = Math.max(0, parseInt(e.target.value) || 0);
        e.target.value = l2PlusFixedGold;
        updateUI(); saveCurrentSettings();
    });
    // Starting Wealth — By XP
    document.querySelectorAll('input[name="byXpWealthMethod"]').forEach(r => {
        r.addEventListener('change', (e) => { byXpWealthMethod = e.target.value; saveCurrentSettings(); });
    });
    wireDiceConfig('xp', v=>byXpDiceCount=v, v=>byXpDiceSides=v, v=>byXpDiceMult=v);
    document.getElementById('xpFixedGold')?.addEventListener('change', (e) => {
        byXpFixedGold = Math.max(0, parseInt(e.target.value) || 0);
        e.target.value = byXpFixedGold;
        saveCurrentSettings();
    });
    document.getElementById('xpWealthPctInput')?.addEventListener('change', () => {
        wealthPct = Math.max(0, parseInt(document.getElementById('xpWealthPctInput').value) || 0);
        document.getElementById('xpWealthPctInput').value = wealthPct;
        document.getElementById('wealthPctInput').value = wealthPct;
        document.getElementById('xpWealthPct').checked = true;
        byXpWealthMethod = 'xp-pct';
        updateUI(); saveCurrentSettings();
    });
    // AC Display Mode
    document.querySelectorAll('input[name="acDisplayMode"]').forEach(r=>{
        r.addEventListener('change',(e)=>{ acDisplayMode=e.target.value; saveCurrentSettings(); });
    });
    // Character Sheet Branding
    document.querySelectorAll('input[name="sheetBranding"]').forEach(r=>{
        r.addEventListener('change',(e)=>{ sheetBranding=e.target.value; saveCurrentSettings(); });
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
    document.getElementById('campaignName')?.addEventListener('change', (e)=>{
        campaignName = e.target.value.slice(0, 64);
        e.target.value = campaignName;
        updateCampaignNameCompressed();
        saveCurrentSettings();
    });
    document.getElementById('basicModeResetButton')?.addEventListener('click', handleBasicModeReset);
    document.getElementById('advancedModeResetButton')?.addEventListener('click', handleAdvancedModeReset);
    document.getElementById('resetPlayerSettingsButton')?.addEventListener('click', handleResetPlayerSettings);
    document.getElementById('bxModeResetButton')?.addEventListener('click', handleBXModeReset);
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
const VALID_MODE_PRESETS = ['race-class', 'race-as-class', 'both'];

export function initialize() {
    // Detect mode preset from URL first, then localStorage, default 'race-as-class'
    const urlMode = new URLSearchParams(window.location.search).get('mode');
    const savedSettings = loadSettings(getSettingsKey());
    if (VALID_MODE_PRESETS.includes(urlMode)) modePreset = urlMode;
    else if (savedSettings && VALID_MODE_PRESETS.includes(savedSettings.mode)) modePreset = savedSettings.mode;

    document.querySelectorAll('input[name="mode"]').forEach(r => { r.checked = r.value === modePreset; });

    initializeLevelSelection();
    initializeRaceClassGrid();
    initializeZeroLevelRaceSelection();
    initializeEventListeners();
    initializeModeSelector();
    updateModifiers();

    setModePreset(modePreset); // toggles UI, loads saved settings, updates grid enablement

    // URL params (read from the same window.location.search already consulted
    // above for modePreset, so its own 'mode' value can never differ) override
    // localStorage for everything else.
    const urlParams = readURLParams();
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
