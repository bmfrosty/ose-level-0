/**
 * cs-sheet-page.js
 * (formerly cs-charactersheet.js)
 *
 * Page controller for charactersheet.html.
 * Decodes the ?d= URL parameter, expands compact params, renders the sheet,
 * and wires up the Modify / Edit Sheet Options / Level Up panels.
 *
 * Public API used by charactersheet.html:
 *   initCharacterSheet()       — entry point
 *
 * Public API used by gen-ui.js:
 *   expandCompactV2(cp)        — expand decoded compact params to a sheet spec
 *   renderFromCompactParams()  — render into a DOM element (used by generator preview)
 *   compressToBase64Url()      — re-exported for callers that need URL encoding
 */

import { renderCharacterSheetHTML } from './cs-sheet-renderer.js';
import { buildOptionsLine }         from './cs-compact-codes.js';
import { progModeLabel }            from './shared-sheet-builder.js';
import { compressToBase64Url, decompressFromBase64Url } from './cs-url-codec.js';

export { compressToBase64Url } from './cs-url-codec.js';

// ── Constants ──────────────────────────────────────────────────────────────────
const PROG_TO_CODE = { ose:'O', smooth:'S', ll:'L' };

// ── Inlined from cs-sheet-builder.js (single-parent leaf — no separate file needed) ──

/** Sides of the hit die, keyed by full class name */
const CLASS_HD = {
    Fighter_CLASS:8, Cleric_CLASS:6, 'Magic-User_CLASS':4, Thief_CLASS:4,
    Spellblade_CLASS:6, Dwarf_CLASS:8, Elf_CLASS:6, Halfling_CLASS:6, Gnome_CLASS:4
};

/** Compact code → progression mode name (e.g. 'O' → 'ose') */
const CODE_TO_PROG = { O:'ose', S:'smooth', L:'ll' };

/**
 * Build the spec object passed to `renderFromCompactParams` / `displayCharacterSheet`
 * from a normalised sheet-data (sd) object and an options (opts) bag.
 */
function buildSheetSpec(sd, opts) {
    return {
        title:    sd.title,
        subtitle: sd.subtitle,
        header: { columns: [
            { label:'Character Name', value: sd.name||'Unknown', flex:2.8 },
            { label:'Occupation',     value: sd.occupation||'—', flex:2.2 },
            { label:'Race/Class',     value: sd.raceClass,       flex:2 },
            { label:'Level',          value: sd.level, flex:1, center:true },
            { label:'HD',             value: sd.hd,    flex:1, center:true },
            { label:'XP Bonus',       value: sd.xpBonus, flex:1, center:true },
        ]},
        combat:          { maxHP: sd.maxHP, initMod: sd.initMod },
        abilityScores:   sd.abilityScores,
        weaponsAndSkills: {
            weapon:          sd.weapon||null,
            classAttackBonus:sd.classAttackBonus,
            meleeMod:        sd.meleeMod,
            rangedMod:       sd.rangedMod,
            thiefSkills:     sd.thiefSkills||null,
        },
        abilitiesSection: {
            header: sd.abilitiesHeader,
            racial: sd.racialAbilities||[],
            class:  sd.classAbilities||[],
        },
        savingThrows: sd.savingThrows,
        experience:   sd.experience,
        equipment:    sd.equipment,
        spellSlots:   sd.spellSlots||null,
        turnUndead:   sd.turnUndead||null,
        showUndeadNames: opts.showUndeadNames,
        showQRCode:      opts.showQRCode,
        abilityOrder:    opts.abilityOrder,
        cp:              sd.cp,
        footer:          sd.footer,
        printTitle:      sd.printTitle,
        openInNewTab:    opts.openInNewTab,
        autoPrint:       opts.autoPrint,
        backgroundTab:   opts.backgroundTab,
        acDisplayMode:   opts.acDisplayMode || 'aac',
    };
}
const ABILITIES    = ['STR','DEX','CON','INT','WIS','CHA'];
const ADM_MAP      = { 0:'aac', 1:'dac-matrix', 2:'dual', 3:'dual-matrix' };

/** Shared CON modifier helper (matches shared-hit-points.js logic). */
const getConMod = s => s >= 15 ? 1 : s >= 13 ? 1 : s <= 6 ? -1 : s <= 8 ? -1 : 0;

// ── expandCompactV2 ────────────────────────────────────────────────────────────

/**
 * Expand a compact v2 params object into a full sheet spec ready for
 * renderCharacterSheetHTML.
 */
export async function expandCompactV2(cp) {
    const CODE_TO_CLASS = { FI:'Fighter_CLASS', CL:'Cleric_CLASS', MU:'Magic-User_CLASS',
                            TH:'Thief_CLASS',   SB:'Spellblade_CLASS', DW:'Dwarf_CLASS',
                            EL:'Elf_CLASS',     HA:'Halfling_CLASS',   GN:'Gnome_CLASS' };
    const CODE_TO_RACE  = { HU:'Human_RACE', DW:'Dwarf_RACE', EL:'Elf_RACE',
                            HA:'Halfling_RACE', GN:'Gnome_RACE' };
    const CODE_TO_RCM   = { ST:'strict', SH:'strict-human', TE:'traditional-extended', AL:'allow-all' };

    const mode  = cp.m;
    const prog  = CODE_TO_PROG[cp.p] || 'smooth';
    const race  = CODE_TO_RACE[cp.r] || 'Human_RACE';
    const cls   = CODE_TO_CLASS[cp.c] || 'Fighter_CLASS';
    const level = cp.l ?? 1;
    const rcm   = CODE_TO_RCM[cp.rcm] || 'strict';

    const adjArr  = cp.s  || [10,10,10,10,10,10];
    const baseArr = cp.bs || adjArr;
    const adj = {}, base = {};
    ABILITIES.forEach((a, i) => { adj[a] = adjArr[i]; base[a] = baseArr[i]; });

    const { calculateModifier } = await import('./shared-ability-scores.js');
    const { getModifierEffects } = await import('./cs-modifier-display.js');
    const mods = {};
    ABILITIES.forEach(a => mods[a] = calculateModifier(adj[a]));

    const classDataMod = await import(
        prog === 'll' ? './shared-class-data-ll.js' :
        prog === 'ose' ? './shared-class-data-ose.js' : './shared-class-data-gygar.js'
    );
    const ClassDataShared = await import('./shared-class-data-shared.js');

    const abilityScoresSheet = ABILITIES.map((a, i) => ({
        name: a, score: adjArr[i],
        originalScore: baseArr[i] !== adjArr[i] ? baseArr[i] : null,
        effects: getModifierEffects(a, mods[a], adjArr[i])
    }));

    // ── Shared strings (single definition for all levels/modes) ──────────────
    const isAdv     = mode === 'A';
    const modeLabel = progModeLabel(cp.p || 'O');
    const title     = isAdv ? 'OLD-SCHOOL ESSENTIALS ADVANCED' : 'OLD-SCHOOL ESSENTIALS';
    const subtitle  = `RETRO ADVENTURE GAME &nbsp;·&nbsp; ${modeLabel} Mode`;
    const buildFooter = (identity) => {
        const o      = buildOptionsLine(cp);
        const modPfx = cp.mx ? 'Modified ' : '';
        return `${modPfx}${identity} &nbsp;·&nbsp; ${modeLabel} Mode` +
               (o ? `<br><small style="opacity:0.7;">${o}</small>` : '');
    };

    // ── Level 0 ──────────────────────────────────────────────────────────────
    if (level === 0) {
        const { getAdvancedModeRacialAbilities } = await import('./shared-racial-abilities.js');
        const racialAbilities = getAdvancedModeRacialAbilities(race);
        const raceDisplay = race.replace('_RACE', '');
        const sv = cp.sv || [14, 15, 16, 17, 18];
        return {
            title, subtitle,
            header: { columns: [
                { label:'Character Name', value:cp.n||'Unknown', flex:3 },
                { label:'Occupation',     value:cp.bg||'',       flex:2 },
                { label:'Race/Class',     value:'',              flex:2 },
                { label:'Level',          value:'0',             flex:1, center:true },
                { label:'HD',             value:'',              flex:1, center:true },
                { label:'XP Bonus',       value:'',              flex:1, center:true },
            ]},
            combat: { maxHP:cp.h||1, initMod:mods.DEX },
            abilityScores: abilityScoresSheet,
            weaponsAndSkills: { weapon:cp.w||null, classAttackBonus: prog==='smooth' ? 0 : -1,
                                meleeMod:mods.STR, rangedMod:mods.DEX, thiefSkills:null },
            abilitiesSection: { header:'RACIAL ABILITIES', racial:racialAbilities||[], class:[] },
            savingThrows: { death:sv[0], wands:sv[1], paralysis:sv[2], breath:sv[3], spells:sv[4] },
            experience: null,
            equipment: { armor:cp.ar||null, items:cp.it||[], startingAC:cp.ac||10,
                         startingGold:cp.g||0, startingHD:'1d4' },
            spellSlots: null, turnUndead: null,
            showUndeadNames: !!cp.un, showQRCode: cp.qr !== 0, abilityOrder: cp.ao ?? 1,
            cp,
            footer: buildFooter(`0-Level ${raceDisplay}`),
            printTitle: `OSE ${isAdv?'Advanced':'Basic'} - ${raceDisplay} - 0-Level - ${cp.bg||''} - ${cp.n||''}`,
            autoPrint: !!cp.ap,
        };
    }

    // ── L1+ characters (Basic & Advanced merged) ──────────────────────────────
    let character, raceDisplay, clsDisplay, raceClassDisplay;

    if (isAdv) {
        const { getRaceDisplayName, getClassDisplayName } = await import('./shared-advanced-utils.js');
        const { createCharacterAdvanced } = await import('./shared-advanced-character-gen.js');
        character = createCharacterAdvanced({
            level, race, className: cls,
            baseScores: base, adjustedScores: adj,
            hp: cp.h, classData: classDataMod, ClassDataShared,
            progressionMode: prog, raceClassMode: rcm,
            name: cp.n, background: { profession: cp.bg }
        });
        raceDisplay = getRaceDisplayName(race);
        clsDisplay  = getClassDisplayName(cls);
        raceClassDisplay = (cp.hhr && raceDisplay === 'Human') ? clsDisplay
            : (raceDisplay === clsDisplay ? raceDisplay : `${raceDisplay} ${clsDisplay}`);
    } else {
        const { getClassProgressionData, getClassFeatures,
                getClassAbilities, createCharacter } = await import('./shared-basic-character-gen.js');
        const progData = getClassProgressionData(cls, level, adj, classDataMod);
        const features = getClassFeatures(cls, level, classDataMod, ClassDataShared);
        const racial   = getClassAbilities(cls);
        character = createCharacter({
            level, className: cls, mode: modeLabel,
            abilityScores: adj, hp: cp.h,
            progressionData: progData, features, racialAbilities: racial,
            name: cp.n, background: { profession: cp.bg }, startingGold: cp.g || 0
        });
        // Basic mode: add Blessed / human racial abilities when cp.bl is set
        if (cp.bl) {
            const humanAbilities = [
                { name: 'Blessed',      description: 'Roll HP twice, take best at each level (does not apply to level 0 HP roll)' },
                { name: 'Decisiveness', description: 'Act first on tied initiative (+1 to individual initiative)' },
                { name: 'Leadership',   description: 'Retainers/mercenaries +1 loyalty and morale' },
            ];
            character.classAbilities = [...(character.classAbilities || []), ...humanAbilities];
        }
        raceDisplay = clsDisplay = cls.replace('_CLASS', '');
        raceClassDisplay = clsDisplay;
    }

    // XP bonus — lowest prime requisite score wins
    const { calculateXPBonus, getPrimeRequisites } =
        await import(isAdv ? './shared-advanced-utils.js' : './shared-basic-utils.js');
    const primeReqs = getPrimeRequisites(cls);
    let xpBonusNum = primeReqs.length > 0 ? 10 : 0;
    primeReqs.forEach(a => { xpBonusNum = Math.min(xpBonusNum, calculateXPBonus(adj[a] || 10)); });
    const xpBonusStr = xpBonusNum >= 0 ? `+${xpBonusNum}%` : `${xpBonusNum}%`;
    const hasRacial  = (character.racialAbilities || []).length > 0;
    const hasClass   = (character.classAbilities  || []).length > 0;
    // In Basic mode, demihuman classes are race-as-class.
    // Their class abilities ARE their racial abilities, so label the section "CLASS ABILITIES".
    const BASIC_DEMIHUMAN_CLASSES = ['Dwarf_CLASS','Elf_CLASS','Halfling_CLASS','Gnome_CLASS'];
    const isBasicDemihuman = !isAdv && BASIC_DEMIHUMAN_CLASSES.includes(cls);

    const hdSides = CLASS_HD[cp.c] || 6;
    const sd = {
        title, subtitle,
        name: cp.n, occupation: cp.bg,
        raceClass: raceClassDisplay, level, hd: `1d${hdSides}`, xpBonus: xpBonusStr,
        maxHP: cp.h, initMod: mods.DEX,
        abilityScores: abilityScoresSheet,
        weapon: cp.w, classAttackBonus: character.attackBonus || 0,
        meleeMod: mods.STR, rangedMod: mods.DEX, thiefSkills: character.thiefSkills || null,
        abilitiesHeader: (hasRacial && hasClass) ? 'RACIAL & CLASS ABILITIES'
                         : hasRacial ? (isBasicDemihuman ? 'CLASS ABILITIES' : 'RACIAL ABILITIES') : 'CLASS ABILITIES',
        racialAbilities: character.racialAbilities || [],
        classAbilities:  character.classAbilities  || [],
        savingThrows: character.savingThrows,
        experience: { current: character.xp.current, forLevel: level,
                      forLevelXP: character.xp.forCurrentLevel,
                      forNext: character.xp.forNextLevel, bonus: xpBonusStr },
        equipment: { armor: cp.ar || null, shield: !!cp.sh, items: cp.it || [],
                     startingAC: cp.ac || 10, startingGold: cp.g || 0, startingHD: `1d${hdSides}` },
        spellSlots: character.spellSlots || null,
        turnUndead: character.turnUndead || null,
        cp,
        footer: buildFooter(isAdv ? `Level ${level} ${raceDisplay} ${clsDisplay}` : `Level ${level} ${clsDisplay}`),
        printTitle: isAdv
            ? `OSE Advanced - ${raceDisplay} - ${clsDisplay} - Level ${level} - ${cp.bg || ''} - ${cp.n || ''}`
            : `OSE Basic - ${clsDisplay} - Level ${level} - ${cp.bg || ''} - ${cp.n || ''}`,
    };

    const opts = {
        showUndeadNames: !!cp.un, showQRCode: cp.qr !== 0, abilityOrder: cp.ao ?? 1,
        openInNewTab: false, autoPrint: !!cp.ap, backgroundTab: false,
        acDisplayMode: ADM_MAP[cp.adm] || 'aac',
    };
    return buildSheetSpec(sd, opts);
}

// ── buildGeneratorURL ──────────────────────────────────────────────────────────

/**
 * Reconstruct a generator.html URL with the settings that were used to
 * generate this character, so the user can go back and roll another.
 *
 * @param {Object} cp - Decoded compact params v2 object (post-decodeCompactParams)
 * @returns {string} URL string like "generator.html?mode=basic&p=ose&l=1&c=Fighter…"
 */
function buildGeneratorURL(cp) {
    const CODE_TO_PROG_KEY   = { O:'ose', S:'smooth', L:'ll' };
    const CODE_TO_CLASS_NAME = {
        FI:'Fighter', CL:'Cleric', MU:'Magic-User', TH:'Thief',
        SB:'Spellblade', DW:'Dwarf', EL:'Elf', HA:'Halfling', GN:'Gnome'
    };
    const CODE_TO_RACE_NAME  = { HU:'Human', DW:'Dwarf', EL:'Elf', HA:'Halfling', GN:'Gnome' };
    const CODE_TO_RCM        = { ST:'strict', SH:'strict-human', TE:'traditional-extended', AL:'allow-all' };

    const isAdv = cp.m === 'A';
    const p = new URLSearchParams();

    // Mode
    p.set('mode', isAdv ? 'advanced' : 'basic');

    // Progression mode (omit if OSE — that's the default)
    const progKey = CODE_TO_PROG_KEY[cp.p] || 'smooth';
    if (progKey !== 'ose') p.set('p', progKey);

    // Level
    if (cp.l != null) p.set('l', String(cp.l));

    // Class (not applicable at level 0 — no class has been chosen yet)
    if (cp.l !== 0 && cp.c) {
        const cn = CODE_TO_CLASS_NAME[cp.c];
        if (cn) p.set('c', cn);
    }

    // Race (advanced mode, level 1+ only)
    if (isAdv && cp.r && cp.l !== 0) {
        const rn = CODE_TO_RACE_NAME[cp.r];
        if (rn) p.set('r', rn);
    }

    // Zero-level race selection
    if (cp.l === 0 && cp.r) {
        const rn = CODE_TO_RACE_NAME[cp.r];
        if (rn) p.set('zr', rn);
    }

    // Basic: demihuman limits
    if (!isAdv && cp.dl) p.set('dl', 'extended');

    // Advanced: race/class mode (omit if strict — that's the default)
    if (isAdv && cp.rcm) {
        const rcm = CODE_TO_RCM[cp.rcm];
        if (rcm && rcm !== 'strict') p.set('rcm', rcm);
    }
    // Basic: blessed flag → infer strict-human raceClassMode
    if (!isAdv && cp.bl) p.set('rcm', 'strict-human');

    // Prime req mode (0 = 'user' = default → omit)
    if (cp.prm) p.set('prm', String(cp.prm));

    // Boolean generator options
    if (cp.il)        p.set('il', '1');
    if (cp.un)        p.set('un', '1');
    if (isAdv && cp.hhr) p.set('hhr', '1');

    // Ability ordering (default 1 = 1977 order → only emit when 0 = modern)
    if (cp.ao === 0) p.set('ao', '0');

    // Wealth percent (default 50 → omit)
    if (cp.wp != null && cp.wp !== 50) p.set('wp', String(cp.wp));

    // HP mode → hpm generator URL param (0=normal=omit, 1=blessed, 2=5e, 3=reroll12)
    if (cp.hm === 1) p.set('hpm', 'blessed');
    else if (cp.hm === 2) p.set('hpm', '5e');
    else if (cp.hm === 3) p.set('hpm', 'healthy');

    // Character name (pre-fills the name field)
    if (cp.n) p.set('n', cp.n);

    // Score minimums: cp.sm is stored as [STR, DEX, CON, INT, WIS, CHA]
    // but the generator URL s= param is in [STR, INT, WIS, DEX, CON, CHA] order
    if (Array.isArray(cp.sm) && cp.sm.length === 6) {
        const [str, dex, con, int_, wis, cha] = cp.sm;
        // Generator defaults: STR=3,INT=3,WIS=3,DEX=3,CON=6,CHA=3
        const defaults = [3, 3, 3, 3, 6, 3];
        const reordered = [str, int_, wis, dex, con, cha];
        if (reordered.some((v, i) => v !== defaults[i])) {
            p.set('s', reordered.join(','));
        }
    }

    return `generator.html?${p.toString()}`;
}

// ── initEditPanel ──────────────────────────────────────────────────────────────

/**
 * Initialise both the Modify Character panel and the Level Up panel.
 * @param {Object} decoded - Fully decoded (no codes) compact params v2 object
 */
function initEditPanel(decoded) {
    const isZeroLevel = decoded.l === 0;

    const modifyBtn   = document.getElementById('toggleModifyBtn');
    const sheetOptBtn = document.getElementById('toggleSheetOptsBtn');
    const levelUpBtn  = document.getElementById('toggleLevelUpBtn');
    const modifyPanel = document.getElementById('modify-panel');
    const sheetPanel  = document.getElementById('sheet-opts-panel');
    const lupPanel    = document.getElementById('level-up-panel');

    const closeAll = () => {
        modifyPanel.style.display = 'none';
        sheetPanel.style.display  = 'none';
        lupPanel.style.display    = 'none';
    };

    modifyBtn.style.display = '';
    modifyBtn.addEventListener('click', () => {
        const wasOpen = modifyPanel.style.display === 'block';
        closeAll();
        if (!wasOpen) { modifyPanel.style.display = 'block'; modifyPanel.scrollIntoView({ behavior:'smooth' }); }
    });

    sheetOptBtn.style.display = '';
    sheetOptBtn.addEventListener('click', () => {
        const wasOpen = sheetPanel.style.display === 'block';
        closeAll();
        if (!wasOpen) { sheetPanel.style.display = 'block'; sheetPanel.scrollIntoView({ behavior:'smooth' }); }
    });

    levelUpBtn.style.display = '';
    levelUpBtn.addEventListener('click', () => {
        const wasOpen = lupPanel.style.display === 'block';
        closeAll();
        if (!wasOpen) { lupPanel.style.display = 'block'; lupPanel.scrollIntoView({ behavior:'smooth' }); }
    });

    document.getElementById('ep-cancel-btn').addEventListener('click',  () => { modifyPanel.style.display = 'none'; });
    document.getElementById('so-cancel-btn').addEventListener('click',  () => { sheetPanel.style.display  = 'none'; });
    document.getElementById('lup-cancel-btn').addEventListener('click', () => { lupPanel.style.display    = 'none'; });

    // ── Modify Character panel ─────────────────────────────────────────────────

    if (isZeroLevel) {
        document.getElementById('ep-prog-section').style.display = 'none';
    } else {
        const curProg  = CODE_TO_PROG[decoded.p] || 'ose';
        const progRadio = document.querySelector(`input[name="ep-prog"][value="${curProg}"]`);
        if (progRadio) progRadio.checked = true;
    }

    document.getElementById('ep-name').value = decoded.n || '';

    const finalScores   = decoded.s  || [10,10,10,10,10,10];
    const baseScoresArr = decoded.bs || finalScores;
    const abilityInputs = document.getElementById('ep-ability-inputs');
    ABILITIES.forEach((ab, i) => {
        const base  = baseScoresArr[i];
        const adj   = finalScores[i] - base;
        const final = finalScores[i];
        const div = document.createElement('div');
        div.style.cssText = 'display:flex;align-items:center;gap:4px;';
        div.innerHTML = `
            <label style="font-weight:bold;min-width:35px;font-size:11px;">${ab}</label>
            <span id="ep-base-${ab}" data-base="${base}"
                style="width:42px;display:inline-block;text-align:center;font-size:12px;font-weight:bold;color:#333;background:#e8e8e8;border:1px solid #ccc;border-radius:3px;padding:3px 0;">${base}</span>
            <span style="font-size:10px;color:#888;">±adj</span>
            <input type="number" id="ep-adj-${ab}" value="${adj}" min="-10" max="10" step="1"
                style="width:36px;padding:3px;text-align:center;font-size:12px;color:#444;background:#fafafa;border:1px solid #b0b0b0;border-radius:3px;">
            <span style="font-size:11px;color:#555;font-weight:bold;">=</span>
            <span id="ep-final-${ab}" style="font-size:13px;font-weight:bold;color:#111;min-width:20px;">${final}</span>`;
        abilityInputs.appendChild(div);
        const baseEl  = div.querySelector(`#ep-base-${ab}`);
        const adjInp  = div.querySelector(`#ep-adj-${ab}`);
        const finalEl = div.querySelector(`#ep-final-${ab}`);
        const updateFinal = () => {
            const b = parseInt(baseEl?.dataset.base) || 3;
            const a = parseInt(adjInp?.value) || 0;
            if (finalEl) finalEl.textContent = b + a;
        };
        adjInp?.addEventListener('input', updateFinal);
    });

    const hpSec        = document.getElementById('ep-hp-section');
    const hpRollsData  = decoded.hr && decoded.hr.length > 0 ? decoded.hr : null;
    const hpDiceData   = decoded.hd || [];
    const conScoreInit = decoded.s ? decoded.s[2] : 10;

    if (hpRollsData) {
        const conMod0 = getConMod(conScoreInit);
        hpSec.innerHTML =
            `<strong>HP per Level:</strong> <span style="font-size:10px;color:#555;margin-left:8px;">CON mod: ${conMod0>=0?'+':''}${conMod0} &nbsp;·&nbsp; 🎲 rerolls 1 die</span>` +
            `<div id="ep-hp-rolls-wrap" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;"></div>`;
        const wrap = hpSec.querySelector('#ep-hp-rolls-wrap');
        hpRollsData.forEach((hp, i) => {
            const isL0  = i === 0;
            const label = isL0 ? 'L0' : `L${i}`;
            const sides = hpDiceData[i] || 0;
            const cell  = document.createElement('div');
            cell.style.cssText = 'display:flex;align-items:center;gap:3px;';
            cell.innerHTML =
                `<label style="font-size:11px;min-width:22px;font-weight:bold;color:#444;text-align:right;">${label}:</label>` +
                `<input type="number" class="ep-edit-hp" data-index="${i}" value="${hp}" min="1" max="99"` +
                ` style="width:38px;padding:3px;text-align:center;border:1px solid #ccc;border-radius:3px;font-size:12px;font-weight:bold;">` +
                (sides > 0 ? `<button class="reroll-btn ep-hp-reroll" data-index="${i}" data-sides="${sides}" title="Reroll 1d${sides}+CON">🎲</button>` : '');
            wrap.appendChild(cell);
        });
        hpSec.querySelectorAll('.ep-hp-reroll').forEach(rb => {
            rb.addEventListener('click', () => {
                const idx      = parseInt(rb.dataset.index);
                const sides    = parseInt(rb.dataset.sides);
                const conScore = parseInt(document.getElementById('ep-base-CON')?.dataset.base) || conScoreInit;
                const hpVal    = Math.max(1, Math.floor(Math.random() * sides) + 1 + getConMod(conScore));
                const inp = hpSec.querySelector(`.ep-edit-hp[data-index='${idx}']`);
                if (inp) inp.value = hpVal;
            });
        });
    } else {
        hpSec.innerHTML =
            `<strong>Total HP:</strong>` +
            `<input type="number" id="ep-hp" min="1" max="999" value="${decoded.h || 1}"` +
            ` style="margin-left:8px;width:60px;text-align:center;font-size:12px;font-weight:bold;padding:3px;border:1px solid #ccc;border-radius:3px;">` +
            `<button class="reroll-btn" id="ep-reroll-hp" title="Roll new HP" style="margin-left:4px;">🎲 Reroll</button>`;
        hpSec.querySelector('#ep-reroll-hp').addEventListener('click', () => {
            const sides    = CLASS_HD[decoded.c] || 6;
            const lvl      = decoded.l || 1;
            const conScore = parseInt(document.getElementById('ep-base-CON')?.dataset.base) || conScoreInit;
            const conMod   = getConMod(conScore);
            let total = 0;
            for (let i = 0; i < lvl; i++) total += Math.max(1, Math.floor(Math.random() * sides) + 1 + conMod);
            hpSec.querySelector('#ep-hp').value = Math.max(1, total);
        });
    }

    const admVal  = decoded.adm || 0;
    const admRadio = document.querySelector(`input[name="ep-adm"][value="${admVal}"]`);
    if (admRadio) admRadio.checked = true;

    document.getElementById('ep-undead').checked = !!decoded.un;
    document.getElementById('ep-qr').checked     = decoded.qr !== 0;

    // ── Apply Changes (Modify Character) ──────────────────────────────────────
    document.getElementById('ep-apply-btn').addEventListener('click', async () => {
        const { encodeCompactParams } = await import('./cs-compact-codes.js');

        const newProg = document.querySelector('input[name="ep-prog"]:checked')?.value
            || CODE_TO_PROG[decoded.p] || 'ose';

        const newBaseScores = ABILITIES.map(a => {
            const v = parseInt(document.getElementById('ep-base-' + a)?.dataset.base);
            return isNaN(v) ? 10 : Math.min(18, Math.max(3, v));
        });
        const newAdjVals = ABILITIES.map(a => {
            const v = parseInt(document.getElementById('ep-adj-' + a)?.value);
            return isNaN(v) ? 0 : Math.max(-10, Math.min(10, v));
        });
        const newScores  = ABILITIES.map((a, i) => Math.max(3, Math.min(18, newBaseScores[i] + newAdjVals[i])));
        const hasAnyAdj  = newAdjVals.some(v => v !== 0);

        const hpRollInputs = document.querySelectorAll('#ep-hp-section .ep-edit-hp');
        let newHp, newHpRolls;
        if (hpRollInputs.length > 0) {
            newHpRolls = Array.from(hpRollInputs).map(inp => Math.max(1, parseInt(inp.value) || 1));
            newHp = newHpRolls.reduce((a, b, i) => (i === 0 && !decoded.il) ? a : a + b, 0);
        } else {
            newHp      = Math.max(1, parseInt(document.querySelector('#ep-hp-section #ep-hp')?.value) || decoded.h || 1);
            newHpRolls = decoded.hr || [];
        }

        const newCp = { ...decoded, p: PROG_TO_CODE[newProg], s: newScores, h: newHp,
                        hr: newHpRolls, mx: 1, ap: 0 };
        if (hasAnyAdj) { newCp.bs = newBaseScores; } else { delete newCp.bs; }

        const encoded = encodeCompactParams(newCp);
        const b64url  = await compressToBase64Url(JSON.stringify(encoded));
        window.location.href = `charactersheet.html?d=${b64url}`;
    });

    // ── Apply Options (Sheet Options) ─────────────────────────────────────────
    document.getElementById('so-apply-btn').addEventListener('click', async () => {
        const { encodeCompactParams } = await import('./cs-compact-codes.js');
        const newAdm = parseInt(document.querySelector('input[name="ep-adm"]:checked')?.value || '0');
        const newCp  = { ...decoded,
            n:  document.getElementById('ep-name').value || decoded.n,
            un: document.getElementById('ep-undead').checked ? 1 : 0,
            qr: document.getElementById('ep-qr').checked    ? 1 : 0,
            ap: 0 };
        if (newAdm) newCp.adm = newAdm; else delete newCp.adm;

        // Clear equipment: null out weapon, armor, shield, items, and gold;
        // reset AC to 10 (unarmored). Attack bonus, melee/ranged modifiers, and
        // thief skills are computed from class/level/scores and remain untouched.
        if (document.getElementById('ep-clear-equipment')?.checked) {
            newCp.w  = null;   // weapon
            newCp.ar = null;   // armor
            newCp.sh = 0;      // shield
            newCp.it = [];     // items (includes helmet, gear, etc.)
            newCp.g  = 0;      // gold remaining
            newCp.ac = 10;     // reset AC to unarmored base
        }

        const encoded = encodeCompactParams(newCp);
        const b64url  = await compressToBase64Url(JSON.stringify(encoded));
        window.location.href = `charactersheet.html?d=${b64url}`;
    });

    // ── Level Up panel ─────────────────────────────────────────────────────────
    if (isZeroLevel) {
        // Level 0 → 1: class selection required
        const isAdv    = decoded.m === 'A';
        const raceCode = decoded.r || 'HU';

        const advHumanClasses = [
            { code:'FI', name:'Fighter',    sides:8 },
            { code:'CL', name:'Cleric',     sides:6 },
            { code:'MU', name:'Magic-User', sides:4 },
            { code:'TH', name:'Thief',      sides:4 },
            { code:'SB', name:'Spellblade', sides:6 },
        ];
        const basicHumanClasses = [
            { code:'FI', name:'Fighter',    sides:8 },
            { code:'CL', name:'Cleric',     sides:6 },
            { code:'MU', name:'Magic-User', sides:4 },
            { code:'TH', name:'Thief',      sides:4 },
        ];
        const basicDemihumanClass = {
            DW:[{ code:'DW', name:'Dwarf',    sides:8 }],
            EL:[{ code:'EL', name:'Elf',      sides:6 }],
            HA:[{ code:'HA', name:'Halfling', sides:6 }],
            GN:[{ code:'GN', name:'Gnome',    sides:4 }],
        };

        const availableClasses = isAdv
            ? advHumanClasses
            : (basicDemihumanClass[raceCode] || basicHumanClasses);

        const lupLevelBtns = document.getElementById('lup-level-btns');
        lupLevelBtns.innerHTML =
            `<div style="margin-bottom:8px;font-size:12px;font-weight:bold;color:#4A148C;">Level 0 → Level 1 &nbsp;—&nbsp; choose a class:</div>` +
            `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">` +
            availableClasses.map(c =>
                `<button class="ose-level-btn lup-class-btn" data-code="${c.code}" data-sides="${c.sides}">${c.name}</button>`
            ).join('') + `</div>`;

        let selectedClassCode = null;
        lupLevelBtns.querySelectorAll('.lup-class-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                lupLevelBtns.querySelectorAll('.lup-class-btn').forEach(b => b.classList.remove('sel'));
                btn.classList.add('sel');
                selectedClassCode = btn.dataset.code;
            });
        });

        document.getElementById('lup-undead').checked = !!decoded.un;
        document.getElementById('lup-qr').checked     = decoded.qr !== 0;

        document.getElementById('lup-apply-btn').addEventListener('click', async () => {
            if (!selectedClassCode) { alert('Please select a class first!'); return; }

            const { encodeCompactParams }               = await import('./cs-compact-codes.js');
            const { parseHitDice }                      = await import('./shared-hit-points.js');
            const { HIT_DICE_PROGRESSIONS, HIT_DICE_SCALE } = await import('./shared-class-data-shared.js');

            const CODE_TO_CLASS_LU = {
                FI:'Fighter_CLASS', CL:'Cleric_CLASS', MU:'Magic-User_CLASS',
                TH:'Thief_CLASS',   SB:'Spellblade_CLASS', DW:'Dwarf_CLASS',
                EL:'Elf_CLASS',     HA:'Halfling_CLASS',   GN:'Gnome_CLASS'
            };

            const className = CODE_TO_CLASS_LU[selectedClassCode] || 'Fighter_CLASS';
            const conScore  = decoded.s ? decoded.s[2] : 10;
            const conMod    = getConMod(conScore);
            const l0HP      = decoded.h || 1;

            const getHdStr = (cls, lvl) => {
                const scale = HIT_DICE_SCALE[cls];
                const prog  = scale ? HIT_DICE_PROGRESSIONS[scale] : null;
                return prog ? (prog[lvl - 1] || null) : null;
            };
            const hdStr = getHdStr(className, 1);
            const hd    = parseHitDice(hdStr);
            const sides = hd.sides || CLASS_HD[selectedClassCode] || 6;

            let l1HP;
            do {
                l1HP = Math.max(1, Math.floor(Math.random() * sides) + 1 + conMod);
            } while (l1HP < l0HP);

            const newMode = isAdv ? 'A' : 'B';
            const newCp = {
                v:2, m: newMode, p: decoded.p || 'O', r: decoded.r || 'HU',
                c: selectedClassCode, l: 1,
                s: decoded.s || [10,10,10,10,10,10],
                h: l1HP, hr: [l0HP, l1HP], hd: [4, sides], il: 0,
                n: decoded.n||'', bg: decoded.bg||'',
                ar: decoded.ar||null, sh: 0, w: decoded.w||null, it: decoded.it||[],
                g: decoded.g||0, ac: decoded.ac||10,
                un: document.getElementById('lup-undead').checked ? 1 : 0,
                qr: document.getElementById('lup-qr').checked    ? 1 : 0,
                ap: 0,
                ...(newMode === 'A' ? { rcm:'SH' } : {}),
            };

            const encoded = encodeCompactParams(newCp);
            const b64url  = await compressToBase64Url(JSON.stringify(encoded));
            window.location.href = `charactersheet.html?d=${b64url}`;
        });

    } else {
        // Level 1+ → Level N+1
        const curLevel = decoded.l || 1;

        const MAX_LEVEL_BY_CODE = { FI:14, CL:14, MU:14, TH:14, SB:14, DW:12, EL:10, HA:8, GN:8 };
        const classMaxLevel = MAX_LEVEL_BY_CODE[decoded.c] || 14;
        const levelUpBtn2 = document.getElementById('toggleLevelUpBtn');
        if (curLevel >= classMaxLevel) { if (levelUpBtn2) levelUpBtn2.style.display = 'none'; return; }

        const nextLevel    = curLevel + 1;
        const lupLevelBtns = document.getElementById('lup-level-btns');
        lupLevelBtns.innerHTML =
            `<span style="font-size:13px;font-weight:bold;color:#4A148C;">Level ${curLevel} → Level ${nextLevel}</span>`;

        document.getElementById('lup-undead').checked = !!decoded.un;
        document.getElementById('lup-qr').checked     = decoded.qr !== 0;

        document.getElementById('lup-apply-btn').addEventListener('click', async () => {
            const { encodeCompactParams }               = await import('./cs-compact-codes.js');
            const { parseHitDice }                      = await import('./shared-hit-points.js');
            const { HIT_DICE_PROGRESSIONS, HIT_DICE_SCALE } = await import('./shared-class-data-shared.js');

            const CODE_TO_CLASS_LU = {
                FI:'Fighter_CLASS', CL:'Cleric_CLASS', MU:'Magic-User_CLASS',
                TH:'Thief_CLASS',   SB:'Spellblade_CLASS', DW:'Dwarf_CLASS',
                EL:'Elf_CLASS',     HA:'Halfling_CLASS',   GN:'Gnome_CLASS'
            };

            const newLevel  = curLevel + 1;
            const newUn     = document.getElementById('lup-undead').checked ? 1 : 0;
            const newQr     = document.getElementById('lup-qr').checked     ? 1 : 0;
            const conScore  = decoded.s ? decoded.s[2] : 10;
            const conMod    = getConMod(conScore);
            const className = CODE_TO_CLASS_LU[decoded.c] || 'Fighter_CLASS';

            const getHdStr = (cls, lvl) => {
                const scale = HIT_DICE_SCALE[cls];
                const prog  = scale ? HIT_DICE_PROGRESSIONS[scale] : null;
                return prog ? (prog[lvl - 1] || null) : null;
            };

            let newHpRolls = [...(decoded.hr || [])];
            let newHpDice  = [...(decoded.hd || [])];

            if (newLevel > curLevel) {
                const l0HP  = newHpRolls[0] || 1;
                // hm: 0=normal, 1=blessed, 2=5e, 3=re-roll 1s and 2s
                const hpMode = decoded.hm || 0;
                for (let lvl = curLevel + 1; lvl <= newLevel; lvl++) {
                    const hdStr = getHdStr(className, lvl);
                    const hd    = parseHitDice(hdStr);
                    let lvlHP;
                    if (hd.noConModifier) {
                        const prevHd = parseHitDice(getHdStr(className, lvl - 1));
                        lvlHP = Math.max(1, hd.bonus - prevHd.bonus);
                    } else {
                        const minHP = (lvl === 1 && !decoded.il) ? l0HP : 1;
                        if (hpMode === 2) {
                            // 5e: max die at L1, average (floor(sides/2)+1) at L2+
                            const dieVal = (lvl === 1) ? hd.sides : Math.floor(hd.sides / 2) + 1;
                            lvlHP = Math.max(minHP, dieVal + conMod);
                        } else if (hpMode === 1) {
                            // Blessed: roll twice, take best
                            do {
                                const r1 = Math.max(1, Math.floor(Math.random() * hd.sides) + 1 + conMod);
                                const r2 = Math.max(1, Math.floor(Math.random() * hd.sides) + 1 + conMod);
                                lvlHP = Math.max(r1, r2);
                            } while (lvlHP < minHP);
                        } else if (hpMode === 3) {
                            // Re-roll 1s and 2s: re-roll die if it shows 1 or 2
                            let dieRoll;
                            do {
                                dieRoll = Math.floor(Math.random() * hd.sides) + 1;
                            } while (dieRoll <= 2);
                            lvlHP = Math.max(minHP, dieRoll + conMod);
                        } else {
                            // Normal: single roll
                            do {
                                lvlHP = Math.max(1, Math.floor(Math.random() * hd.sides) + 1 + conMod);
                            } while (lvlHP < minHP);
                        }
                    }
                    newHpRolls.push(lvlHP);
                    newHpDice.push(hd.noConModifier ? 0 : hd.sides);
                }
            }

            const newHp = newHpRolls.reduce((a, b, i) => (i === 0 && !decoded.il) ? a : a + b, 0);
            const newCp = { ...decoded, l: newLevel, hr: newHpRolls, hd: newHpDice,
                            h: newHp, un: newUn, qr: newQr, ap: 0 };

            const encoded = encodeCompactParams(newCp);
            const b64url  = await compressToBase64Url(JSON.stringify(encoded));
            window.location.href = `charactersheet.html?d=${b64url}`;
        });
    }
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Render a character sheet from decoded compact params into the given element.
 * If editPanelEl is provided and decodedForEdit is set, the edit panels are initialised.
 */
export async function renderFromCompactParams(cp, contentEl, opts = {}) {
    const sheet = await expandCompactV2(cp);
    document.title       = sheet.printTitle || 'Character Sheet';
    contentEl.innerHTML  = renderCharacterSheetHTML(sheet);

    if (sheet.autoPrint) setTimeout(() => window.print(), 400);

    if (opts.initEditPanels && cp) initEditPanel(cp);

    if (sheet.showQRCode !== false) {
        const qrImg  = document.getElementById('ose-qr-img');
        const qrLink = document.getElementById('ose-qr-link');

        // The QR code is meant for sharing / scanning on another device, so it
        // must never trigger auto-print.  If the current URL has ap:1 embedded,
        // re-encode a copy with ap:0 so the scanned URL just shows the sheet.
        let shareUrl = window.location.href;
        if (cp && cp.ap) {
            try {
                const { encodeCompactParams } = await import('./cs-compact-codes.js');
                const shareCp = { ...cp, ap: 0 };
                const encoded = encodeCompactParams(shareCp);
                const b64url  = await compressToBase64Url(JSON.stringify(encoded));
                shareUrl = `${window.location.origin}${window.location.pathname}?d=${b64url}`;
            } catch (e) { /* fall back to current URL on any error */ }
        }

        if (qrLink) qrLink.href = shareUrl;
        if (qrImg) {
            try {
                const { default: QRCode } = await import('https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm');
                const dataUrl = await QRCode.toDataURL(shareUrl, {
                    margin: 1, color: { dark:'#000000ff', light:'#ffffffff' }
                });
                qrImg.src = dataUrl;
            } catch (e) { console.warn('QR code generation failed:', e); }
        }
    }

    return sheet;
}

/**
 * Entry point for charactersheet.html.
 * Reads the ?d= URL param, decompresses, decodes compact params, and renders.
 */
export async function initCharacterSheet() {
    const errorEl   = document.getElementById('error');
    const contentEl = document.getElementById('sheet-content');

    const params     = new URLSearchParams(window.location.search);
    const compressed = params.get('d');
    const legacy     = params.get('data');

    try {
        let decodedCp = null;

        if (compressed) {
            const json   = await decompressFromBase64Url(compressed);
            const parsed = JSON.parse(json);
            console.log('[charactersheet] Decompressed URL data:\n' + JSON.stringify(parsed, null, 2));

            if (parsed.v === 2) {
                const { decodeCompactParams } = await import('./cs-compact-codes.js');
                decodedCp = decodeCompactParams(parsed);
                console.log('[charactersheet] Decoded compact params:\n' + JSON.stringify(decodedCp, null, 2));
                await renderFromCompactParams(decodedCp, contentEl,
                    { initEditPanels: true });

                // Wire up "Back to Generator" link with settings from this character
                const genBtn = document.getElementById('backToGeneratorBtn');
                if (genBtn) {
                    genBtn.href = buildGeneratorURL(decodedCp);
                    genBtn.style.display = '';
                }
            } else {
                // Legacy v1 sheet object
                document.title      = parsed.printTitle || 'Character Sheet';
                contentEl.innerHTML = renderCharacterSheetHTML(parsed);
                if (parsed.autoPrint) setTimeout(() => window.print(), 400);
            }
        } else if (legacy) {
            const parsed = JSON.parse(legacy);
            document.title      = parsed.printTitle || 'Character Sheet';
            contentEl.innerHTML = renderCharacterSheetHTML(parsed);
            if (parsed.autoPrint) setTimeout(() => window.print(), 400);
        } else {
            errorEl.style.display = 'block';
            errorEl.textContent   = 'No character data found in URL. Please generate a character and click "Print / Save as PDF".';
        }
    } catch (e) {
        errorEl.style.display = 'block';
        errorEl.textContent   = 'Error loading character data: ' + e.message;
        console.error('charactersheet error:', e);
    }
}
