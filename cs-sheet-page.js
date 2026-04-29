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
 *   expandCompactV3(cp)        — expand decoded compact params to a sheet spec
 *   displayCharacterSheet()    — re-exported from cs-core.js
 *   compressToBase32()         — re-exported for callers that need URL encoding
 */

import * as csCore from './cs-core.js';
import {
    renderCharacterSheetHTML,
    buildOptionsLine, compressToBase32, decompressFromBase32,
    compressToBase64Url, decompressFromBase64Url,
    progModeLabel,
    PROGRESSION_TABLES, calculateModifier, getModifierEffects,
    getAdvancedModeRacialAbilities, getRaceDisplayName, getClassDisplayName,
    getClassProgressionData, getClassFeatures, getBasicModeClassAbilities,
    getRaceInfo, CLASS_INFO,
    createCharacter, calculateXPBonus, getPrimeRequisites,
    encodeCompactParams, decodeCompactParams,
    parseHitDice, HIT_DICE_PROGRESSIONS, HIT_DICE_SCALE,
    ARMOR, purchaseEquipment, getBackgroundByProfession,
    calculateSavingThrows, rollStartingGold,
} from './cs-core.js';

export { compressToBase32 } from './cs-core.js';
export { displayCharacterSheet } from './cs-core.js';

// ── Constants ──────────────────────────────────────────────────────────────────
const PROG_TO_CODE = { ose:'O', smoothprog:'S', ll:'L' };

/**
 * Merge Languages entries from class abilities into the racial Languages string.
 * For Advanced mode: Languages belongs solely in the racial abilities section.
 * Class languages are merged in, sorted alphabetically, deduplicated.
 * Language entries are then removed from classAbilities.
 * Mutates both arrays in place.
 *
 * @param {string[]} racialAbilities - Already-formatted strings (e.g. "<strong>Languages</strong>: Alignment, Common, Elvish, ...")
 * @param {Object[]} classAbilities  - Raw ability objects; may include { name:'Languages', languages:[...] }
 */
export function mergeAdvancedLanguages(racialAbilities, classAbilities) {
    const classLangEntries = classAbilities.filter(a => a.name === 'Languages' && Array.isArray(a.languages));
    if (classLangEntries.length === 0) return;

    const classLangs = classLangEntries.flatMap(a => a.languages);

    const LANG_PREFIX = '<strong>Languages</strong>:';
    const racialLangIdx = racialAbilities.findIndex(s => typeof s === 'string' && s.startsWith(LANG_PREFIX));
    let racialLangs = [];
    if (racialLangIdx !== -1) {
        racialLangs = racialAbilities[racialLangIdx].slice(LANG_PREFIX.length).trim().split(',').map(s => s.trim()).filter(Boolean);
    }

    const merged = [...new Set([...racialLangs, ...classLangs])].sort((a, b) => a.localeCompare(b));
    const newEntry = `${LANG_PREFIX} ${merged.join(', ')}`;

    if (racialLangIdx !== -1) {
        racialAbilities[racialLangIdx] = newEntry;
    } else {
        racialAbilities.push(newEntry);
    }

    const toRemove = new Set(classLangEntries);
    for (let i = classAbilities.length - 1; i >= 0; i--) {
        if (toRemove.has(classAbilities[i])) classAbilities.splice(i, 1);
    }
}

// ── Inlined from cs-sheet-builder.js (single-parent leaf — no separate file needed) ──

/** Sides of the hit die, keyed by full class name */
const CLASS_HD = {
    Fighter_CLASS:8, Cleric_CLASS:6, 'Magic-User_CLASS':4, Thief_CLASS:4,
    Spellblade_CLASS:6, Dwarf_CLASS:8, Elf_CLASS:6, Halfling_CLASS:6, Gnome_CLASS:4
};

const CODE_TO_CLASSNAME = {
    FI:'Fighter_CLASS', CL:'Cleric_CLASS', MU:'Magic-User_CLASS',
    TH:'Thief_CLASS',   SB:'Spellblade_CLASS', DW:'Dwarf_CLASS',
    EL:'Elf_CLASS',     HA:'Halfling_CLASS',   GN:'Gnome_CLASS',
};

/** Derive the die sides for hr[levelIndex]: 4 for L0, class HD for L1+, 0 for fixed-bonus levels. */
function getDieSidesForLevel(classCode, levelIndex) {
    if (levelIndex === 0) return 4;
    const className = CODE_TO_CLASSNAME[classCode];
    if (!className) return 6;
    const scale = HIT_DICE_SCALE[className];
    const prog  = scale ? HIT_DICE_PROGRESSIONS[scale] : null;
    const hdStr = prog ? (prog[levelIndex - 1] || null) : null;
    if (!hdStr) return CLASS_HD[className] || 6;
    const hd = parseHitDice(hdStr);
    return hd.noConModifier ? 0 : (hd.sides || CLASS_HD[className] || 6);
}

/** Compact code → progression mode name (e.g. 'O' → 'ose') */
const CODE_TO_PROG = { O:'ose', S:'smoothprog', L:'ll' };

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
            weapons:         sd.weapons||[],
            classAttackBonus:sd.classAttackBonus,
            meleeMod:        sd.meleeMod,
            rangedMod:       sd.rangedMod,
            thiefSkills:     sd.thiefSkills||null,
        },
        abilitiesSection: {
            header:    sd.abilitiesHeader,
            racial:    sd.racialAbilities||[],
            class:     sd.classAbilities||[],
            classPage:     sd.classPage ?? null,
            classPageNote: sd.classPageNote ?? null,
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
        backgroundTab:   opts.backgroundTab,
        acDisplayMode:   opts.acDisplayMode || 'aac',
    };
}
const ABILITIES    = ['STR','DEX','CON','INT','WIS','CHA'];
const ADM_MAP      = { 0:'aac', 1:'dac-matrix', 2:'dual', 3:'dual-matrix' };

/** Shared CON modifier helper (matches shared-hit-points.js logic). */
const getConMod = s => s >= 15 ? 1 : s >= 13 ? 1 : s <= 6 ? -1 : s <= 8 ? -1 : 0;

// ── expandCompactV3 ────────────────────────────────────────────────────────────

/**
 * Expand a compact v3 params object into a full sheet spec ready for
 * renderCharacterSheetHTML. v2 params are upgraded to v3 by initCharacterSheet
 * before reaching this function.
 */
export async function expandCompactV3(cp, precomp = {}, { silent = false } = {}) {
    const CODE_TO_CLASS = { FI:'Fighter_CLASS', CL:'Cleric_CLASS', MU:'Magic-User_CLASS',
                            TH:'Thief_CLASS',   SB:'Spellblade_CLASS', DW:'Dwarf_CLASS',
                            EL:'Elf_CLASS',     HA:'Halfling_CLASS',   GN:'Gnome_CLASS' };
    const CODE_TO_RACE  = { HU:'Human_RACE', DW:'Dwarf_RACE', EL:'Elf_RACE',
                            HA:'Halfling_RACE', GN:'Gnome_RACE' };
    const CODE_TO_RCM   = { ST:'strict', SH:'strict-human', TE:'traditional-extended', AL:'allow-all' };

    const mode  = cp.m;
    const prog  = CODE_TO_PROG[cp.p] || 'smoothprog';
    const race  = CODE_TO_RACE[cp.r] || 'Human_RACE';
    const cls   = CODE_TO_CLASS[cp.c] || 'Fighter_CLASS';
    const level = cp.l ?? 1;
    const rcm   = CODE_TO_RCM[cp.rcm] || 'strict';

    let adjArr, baseArr;
    if (cp.v === 3) {
        // v3: s = raw rolled scores; racial derived from r; sa = extra adjustments beyond racial
        baseArr = cp.s || [10,10,10,10,10,10];
        let racialMods3 = {};
        if (cp.m === 'A') {
            // Human ability mods only apply when human racial abilities are enabled (rcm !== 'strict')
            const humanAbilitiesOn = race !== 'Human_RACE' || rcm !== 'strict';
            if (humanAbilitiesOn) racialMods3 = getRaceInfo(race)?.abilityModifiers ?? {};
        }
        const sa3 = cp.sa || Array(6).fill(0);
        adjArr = baseArr.map((v, i) => Math.max(3, Math.min(18, v + (racialMods3[ABILITIES[i]] || 0) + sa3[i])));
    } else {
        // v2: s = adjusted scores; bs = pre-adjustment base scores
        adjArr  = cp.s  || [10,10,10,10,10,10];
        baseArr = cp.bs || adjArr;
    }
    const adj = {}, base = {};
    ABILITIES.forEach((a, i) => { adj[a] = adjArr[i]; base[a] = baseArr[i]; });

    const classData = PROGRESSION_TABLES[prog] ?? PROGRESSION_TABLES.smoothprog;
    const ClassDataShared = csCore;
    const mods = {};
    ABILITIES.forEach(a => mods[a] = calculateModifier(adj[a]));

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
        const racialAbilities = getAdvancedModeRacialAbilities(race, { isAdvanced: isAdv, humanRacialAbilities: rcm !== 'strict' });
        const raceDisplay = race.replace('_RACE', '');

        let sv, l0Weapons, l0Items, l0Armor, l0AC;
        if (cp.v === 3) {
            // v3: derive saves and equipment from stored params
            const conScore = adjArr[2];
            const rawSaves = calculateSavingThrows(0, race, conScore, isAdv, prog === 'smoothprog');
            sv = [rawSaves.Death, rawSaves.Wands, rawSaves.Paralysis, rawSaves.Breath, rawSaves.Spells];
            const bg = getBackgroundByProfession(cp.bg || '') || {};
            l0Weapons = [];
            const bgItems = Array.isArray(bg.item) ? bg.item : (bg.item ? [bg.item] : []);
            l0Items   = [...(bg.weapon ? [`${bg.weapon} (background)`] : []), ...bgItems];
            l0Armor   = (bg.armor && bg.armor !== 'Unarmored') ? bg.armor : null;
            const armorAC = l0Armor ? (ARMOR[l0Armor]?.ac?.ascending ?? 10) : 10;
            l0AC = armorAC + mods.DEX;
        } else {
            sv        = cp.sv || [14, 15, 16, 17, 18];
            l0Weapons = cp.w  || [];
            l0Items   = cp.it || [];
            l0Armor   = cp.ar || null;
            l0AC      = cp.ac || 10;
        }

        console.log('\n=== Level 0 Character ===');
        console.log(`Race: ${raceDisplay}  |  Background: ${cp.bg||'(none)'}  |  Mode: ${modeLabel}${isAdv ? '' : ' Basic'}`);

        const logableAbilities = racialAbilities.filter(a => !a.startsWith('\x00footnote:'));
        if (logableAbilities.length) {
            console.log('\nRacial Abilities:');
            logableAbilities.forEach(a => console.log(`  - ${a}`));
        } else {
            console.log('\nRacial Abilities: (none displayed)');
        }

        console.log('\nSaving Throws:');
        console.log(`  Death/Poison: ${sv[0]}  |  Wands: ${sv[1]}  |  Paralysis/Petrify: ${sv[2]}  |  Breath: ${sv[3]}  |  Spells: ${sv[4]}`);

        console.log('\nBackground Equipment:');
        if (l0Armor) console.log(`  Armor: ${l0Armor}`);
        if (l0Items.length) console.log(`  Items: ${l0Items.join(', ')}`);
        console.log(`  AC: ${l0AC}  |  HP: ${cp.h||1}  |  Gold: ${cp.g||0} gp`);
        console.log('========================\n');

        return {
            title, subtitle,
            header: { columns: [
                { label:'Character Name', value:cp.n||'Unknown', flex:3 },
                { label:'Occupation',     value:cp.bg||'',       flex:2 },
                { label:'Race/Class',     value:raceDisplay,     flex:2 },
                { label:'Level',          value:'0',             flex:1, center:true },
                { label:'HD',             value:'1d4',           flex:1, center:true },
                { label:'XP Bonus',       value:'',              flex:1, center:true },
            ]},
            combat: { maxHP:cp.h||1, initMod:mods.DEX },
            abilityScores: abilityScoresSheet,
            weaponsAndSkills: { weapons:l0Weapons, classAttackBonus: prog==='smoothprog' ? 0 : -1,
                                meleeMod:mods.STR, rangedMod:mods.DEX, thiefSkills:null },
            abilitiesSection: { header:'RACIAL ABILITIES', racial:racialAbilities||[], class:[] },
            savingThrows: { death:sv[0], wands:sv[1], paralysis:sv[2], breath:sv[3], spells:sv[4] },
            experience: null,
            equipment: { armor:l0Armor, items:l0Items, startingAC:l0AC,
                         startingGold:cp.g||0, startingHD:'1d4' },
            spellSlots: null, turnUndead: null,
            showUndeadNames: !!cp.un, showQRCode: cp.qr !== 0, abilityOrder: cp.ao ?? 1,
            cp,
            footer: buildFooter(`0-Level ${raceDisplay}`),
            printTitle: `OSE ${isAdv?'Advanced':'Basic'} - ${raceDisplay} - 0-Level - ${cp.bg||''} - ${cp.n||''}`,
        };
    }

    // ── L1+ characters (Basic & Advanced merged) ──────────────────────────────
    let character, raceDisplay, clsDisplay, raceClassDisplay;
    const BASIC_DEMIHUMAN_CLASSES = ['Dwarf_CLASS','Elf_CLASS','Halfling_CLASS','Gnome_CLASS'];

    if (isAdv) {
        if (precomp.character) {
            character = precomp.character;
        } else {
            const progData = precomp.progData ?? getClassProgressionData({ className: cls, level, abilityScores: adj, classData: classData, silent });
            const features = precomp.features ?? getClassFeatures({ className: cls, level, classData: classData, ClassDataShared });
            const humanAbilitiesEnabled = rcm !== 'strict';
            const racialAbilities = getAdvancedModeRacialAbilities(race, { isAdvanced: true, humanRacialAbilities: humanAbilitiesEnabled, level });
            mergeAdvancedLanguages(racialAbilities, features.classAbilities);
            character = createCharacter({
                level, className: cls, mode: prog === 'smoothprog' ? 'Smoothified' : 'Normal',
                abilityScores: adj, hp: cp.h,
                progressionData: progData, features, racialAbilities,
                name: cp.n, background: { profession: cp.bg },
            });
            character.race              = race;
            character.baseScores        = base;
            character.adjustedScores    = adj;
            character.racialAdjustments = getRaceInfo(race)?.abilityModifiers ?? {};
            character.racialAbilities   = racialAbilities;
        }
        const logable = (character.racialAbilities || []).filter(a => !a.startsWith('\x00footnote:'));
        if (logable.length) {
            console.log('\nRacial Abilities:');
            logable.forEach(a => console.log(`  - ${a}`));
        }
        raceDisplay = getRaceDisplayName(race);
        clsDisplay  = getClassDisplayName(cls);
        raceClassDisplay = (cp.hhr && raceDisplay === 'Human') ? clsDisplay
            : (raceDisplay === clsDisplay ? raceDisplay : `${raceDisplay} ${clsDisplay}`);
    } else {
        if (precomp.character) {
            character = precomp.character;
        } else {
            const progData = precomp.progData ?? getClassProgressionData({ className: cls, level, abilityScores: adj, classData: classData, silent });
            const features = precomp.features ?? getClassFeatures({ className: cls, level, classData: classData, ClassDataShared });
            character = createCharacter({
                level, className: cls, mode: modeLabel,
                abilityScores: adj, hp: cp.h,
                progressionData: progData, features, racialAbilities: [],
                name: cp.n, background: { profession: cp.bg }, startingGold: cp.g || 0
            });
            if (rcm !== 'strict' && !BASIC_DEMIHUMAN_CLASSES.includes(cls)) {
                const humanAbilities = [
                    { name: 'Blessed',      description: 'Roll HP twice, take best at each level (does not apply to level 0 HP roll)' },
                    { name: 'Decisiveness', description: 'Act first on tied initiative (+1 to individual initiative)' },
                    { name: 'Leadership',   description: 'Retainers/mercenaries +1 loyalty and morale' },
                ];
                character.classAbilities = [...(character.classAbilities || []), ...humanAbilities];
                console.log('\nHuman Racial Abilities (Basic mode):');
                humanAbilities.forEach(a => console.log(`  - ${a.name}: ${a.description}`));
            }
        }
        raceDisplay = clsDisplay = cls.replace('_CLASS', '');
        raceClassDisplay = clsDisplay;
    }

    // XP bonus — lowest prime requisite score wins
    const primeReqs = getPrimeRequisites(cls);
    let xpBonusNum = primeReqs.length > 0 ? 10 : 0;
    primeReqs.forEach(a => { xpBonusNum = Math.min(xpBonusNum, calculateXPBonus(adj[a] || 10)); });
    const xpBonusStr = xpBonusNum >= 0 ? `+${xpBonusNum}%` : `${xpBonusNum}%`;
    const hasRacial  = (character.racialAbilities || []).length > 0;
    const hasClass   = (character.classAbilities  || []).length > 0;
    const isBasicDemihuman = !isAdv && BASIC_DEMIHUMAN_CLASSES.includes(cls);

    const hdSides = CLASS_HD[CODE_TO_CLASSNAME[cp.c]] || 6;

    // ── Equipment: v3 derives at render time; v2 reads stored fields ──────────
    let eqWeapons, eqArmor, eqShield, eqItems, eqAC, eqGoldRemaining;
    if (cp.v === 3) {
        const bg  = cp.nl0 ? null : (getBackgroundByProfession(cp.bg || '') || {});
        const eq  = purchaseEquipment(cls, cp.g || 0, mods.DEX, bg, prog);
        eqWeapons      = eq.weapons;
        eqArmor        = eq.armor;
        eqShield       = eq.shield;
        eqItems        = eq.items;
        eqAC           = eq.startingAC;
        eqGoldRemaining = eq.goldRemaining;
    } else {
        eqWeapons      = cp.w  || [];
        eqArmor        = cp.ar || null;
        eqShield       = !!cp.sh;
        eqItems        = cp.it || [];
        eqAC           = cp.ac || 10;
        eqGoldRemaining = cp.g || 0;
    }

    const sd = {
        title, subtitle,
        name: cp.n, occupation: cp.bg,
        raceClass: raceClassDisplay, level, hd: `1d${hdSides}`, xpBonus: xpBonusStr,
        maxHP: cp.h, initMod: mods.DEX,
        abilityScores: abilityScoresSheet,
        weapons: eqWeapons, classAttackBonus: character.attackBonus || 0,
        meleeMod: mods.STR, rangedMod: mods.DEX, thiefSkills: character.thiefSkills || null,
        abilitiesHeader: (hasRacial && hasClass) ? 'RACIAL & CLASS ABILITIES'
                         : hasRacial ? (isBasicDemihuman ? 'CLASS ABILITIES' : 'RACIAL ABILITIES') : 'CLASS ABILITIES',
        racialAbilities: character.racialAbilities || [],
        classAbilities:  character.classAbilities  || [],
        classPage:       CLASS_INFO[cls.replace('_CLASS', '')]?.page ?? null,
        classPageNote:   CLASS_INFO[cls.replace('_CLASS', '')]?.pageNote ?? null,
        savingThrows: character.savingThrows,
        experience: { current: character.xp.current, forLevel: level,
                      forLevelXP: character.xp.forCurrentLevel,
                      forNext: character.xp.forNextLevel, bonus: xpBonusStr },
        equipment: { armor: eqArmor, shield: eqShield, items: eqItems,
                     startingAC: eqAC, startingGold: eqGoldRemaining, startingHD: `1d${hdSides}` },
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
        openInNewTab: false, backgroundTab: false,
        acDisplayMode: ADM_MAP[cp.adm] || 'aac',
    };
    return buildSheetSpec(sd, opts);
}

// ── buildGeneratorURL ──────────────────────────────────────────────────────────

/**
 * Reconstruct a generator.html URL with the settings that were used to
 * generate this character, so the user can go back and roll another.
 *
 * @param {Object} cp - Decoded compact params object (post-decodeCompactParams)
 * @returns {string} URL string like "generator.html?mode=basic&p=ose&l=1&c=Fighter…"
 */
function buildGeneratorURL(cp) {
    const CODE_TO_PROG_KEY   = { O:'ose', S:'smoothprog', L:'ll' };
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
    const progKey = CODE_TO_PROG_KEY[cp.p] || 'smoothprog';
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

    // Race/class mode (omit if strict — that's the default)
    if (cp.rcm) {
        const rcmVal = CODE_TO_RCM[cp.rcm];
        if (rcmVal && rcmVal !== 'strict') p.set('rcm', rcmVal);
    }

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
            const sides = getDieSidesForLevel(decoded.c, i);
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
                        hr: newHpRolls, mx: 1 };
        delete newCp.hd;
        if (hasAnyAdj) { newCp.bs = newBaseScores; } else { delete newCp.bs; }

        const encoded = encodeCompactParams(newCp);
        const b32    = await compressToBase32(JSON.stringify(encoded));
        window.location.href = `charactersheet.html?d=${b32}`;
    });

    // ── Apply Options (Sheet Options) ─────────────────────────────────────────
    document.getElementById('so-apply-btn').addEventListener('click', async () => {
        const newAdm = parseInt(document.querySelector('input[name="ep-adm"]:checked')?.value || '0');
        const newCp  = { ...decoded,
            n:  document.getElementById('ep-name').value || decoded.n,
            un: document.getElementById('ep-undead').checked ? 1 : 0,
            qr: document.getElementById('ep-qr').checked    ? 1 : 0,
        };
        delete newCp.hd;
        if (newAdm) newCp.adm = newAdm; else delete newCp.adm;

        // Clear equipment: null out weapon, armor, shield, items, and gold;
        // reset AC to 10 (unarmored). Attack bonus, melee/ranged modifiers, and
        // thief skills are computed from class/level/scores and remain untouched.
        if (document.getElementById('ep-clear-equipment')?.checked) {
            newCp.w  = [];     // weapons
            newCp.ar = null;   // armor
            newCp.sh = 0;      // shield
            newCp.it = [];     // items (includes helmet, gear, etc.)
            newCp.g  = 0;      // gold remaining
            newCp.ac = 10;     // reset AC to unarmored base
        }

        const encoded = encodeCompactParams(newCp);
        const b32    = await compressToBase32(JSON.stringify(encoded));
        window.location.href = `charactersheet.html?d=${b32}`;
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

            const hpMode0 = decoded.hm || 0;
            const DEMIHUMAN_CODES_L01 = new Set(['DW','EL','HA','GN']);
            const hasBlessed0 = decoded.rcm && decoded.rcm !== 'ST'
                && (decoded.m === 'A' ? decoded.r === 'HU' : !DEMIHUMAN_CODES_L01.has(selectedClassCode));
            const effMode0 = hasBlessed0 ? 1 : hpMode0;
            const roll = () => Math.floor(Math.random() * sides) + 1;

            let l1HP;
            if (effMode0 === 2) {
                l1HP = Math.max(l0HP, sides + conMod);
            } else if (effMode0 === 1) {
                do {
                    l1HP = Math.max(l0HP, Math.max(roll(), roll()) + conMod);
                } while (l1HP < l0HP);
            } else if (effMode0 === 3) {
                let d;
                do { d = roll(); } while (d <= 2);
                l1HP = Math.max(l0HP, d + conMod);
            } else {
                do {
                    l1HP = Math.max(1, roll() + conMod);
                } while (l1HP < l0HP);
            }

            const newMode = isAdv ? 'A' : 'B';
            const lupProg = decoded.p === 'S' ? 'smoothprog' : 'ose';
            const newCp = {
                v:3, m: newMode, p: decoded.p || 'O', r: decoded.r || 'HU',
                c: selectedClassCode, l: 1,
                s: decoded.s || [10,10,10,10,10,10],
                h: l1HP, hr: [l0HP, l1HP], il: 0,
                n: decoded.n||'', bg: decoded.bg||'',
                g: rollStartingGold(lupProg),
                un: document.getElementById('lup-undead').checked ? 1 : 0,
                qr: document.getElementById('lup-qr').checked    ? 1 : 0,
                rcm: decoded.rcm || 'ST',
                ...(hpMode0 > 0 ? { hm: hpMode0 } : {}),
            };

            const encoded = encodeCompactParams(newCp);
            const b32    = await compressToBase32(JSON.stringify(encoded));
            window.location.href = `charactersheet.html?d=${b32}`;
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
            const rollLog = [];

            if (newLevel > curLevel) {
                const l0HP   = newHpRolls[0] || 1;
                const hpMode = decoded.hm || 0;
                const DEMIHUMAN_CODES_BL = new Set(['DW','EL','HA','GN']);
                const hasBlessed = decoded.rcm && decoded.rcm !== 'ST'
                    && (decoded.m === 'A' ? decoded.r === 'HU' : !DEMIHUMAN_CODES_BL.has(decoded.c));
                const effectiveHpMode = hasBlessed ? 1 : hpMode;
                const roll   = sides => Math.floor(Math.random() * sides) + 1;

                for (let lvl = curLevel + 1; lvl <= newLevel; lvl++) {
                    const hdStr = getHdStr(className, lvl);
                    const hd    = parseHitDice(hdStr);
                    let lvlHP;
                    if (hd.noConModifier) {
                        const prevHd = parseHitDice(getHdStr(className, lvl - 1));
                        lvlHP = Math.max(1, hd.bonus - prevHd.bonus);
                        rollLog.push(`  L${lvl}: fixed +${lvlHP} hp (no die roll)`);
                    } else {
                        const sides = hd.sides;
                        const minHP = (lvl === 1 && !decoded.il) ? l0HP : 1;
                        const conStr = conMod >= 0 ? `+${conMod}` : `${conMod}`;
                        if (effectiveHpMode === 2) {
                            const dieVal = (lvl === 1) ? sides : Math.floor(sides / 2) + 1;
                            lvlHP = Math.max(minHP, dieVal + conMod);
                            rollLog.push(`  L${lvl}: 5e-style ${dieVal} CON ${conStr} = ${lvlHP}`);
                        } else if (effectiveHpMode === 1) {
                            let r1, r2;
                            do {
                                r1 = roll(sides); r2 = roll(sides);
                                lvlHP = Math.max(minHP, Math.max(r1, r2) + conMod);
                            } while (lvlHP < minHP);
                            rollLog.push(`  L${lvl}: Blessed 1d${sides} — rolled ${r1} and ${r2}, kept ${Math.max(r1,r2)} CON ${conStr} = ${lvlHP}`);
                        } else if (effectiveHpMode === 3) {
                            let d;
                            do { d = roll(sides); } while (d <= 2);
                            lvlHP = Math.max(minHP, d + conMod);
                            rollLog.push(`  L${lvl}: 1d${sides} (re-roll 1s/2s) rolled ${d} CON ${conStr} = ${lvlHP}`);
                        } else {
                            let d;
                            do { d = roll(sides); lvlHP = Math.max(1, d + conMod); } while (lvlHP < minHP);
                            rollLog.push(`  L${lvl}: 1d${sides} rolled ${d} CON ${conStr} = ${lvlHP}`);
                        }
                    }
                    newHpRolls.push(lvlHP);
                }
            }

            const newHp = newHpRolls.reduce((a, b, i) => (i === 0 && !decoded.il) ? a : a + b, 0);
            const newCp = { ...decoded, l: newLevel, hr: newHpRolls,
                            h: newHp, un: newUn, qr: newQr };

            if (rollLog.length) {
                sessionStorage.setItem('levelUpNotice', JSON.stringify({
                    from: curLevel, to: newLevel, lines: rollLog, totalHP: newHp
                }));
            }

            delete newCp.hd;
            const encoded = encodeCompactParams(newCp);
            const b32    = await compressToBase32(JSON.stringify(encoded));
            window.location.href = `charactersheet.html?d=${b32}`;
        });
    }
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Render a character sheet from decoded compact params into the given element.
 * If editPanelEl is provided and decodedForEdit is set, the edit panels are initialised.
 */
export async function renderFromCompactParams(cp, contentEl, opts = {}) {
    const sheet = await expandCompactV3(cp);
    document.title       = sheet.printTitle || 'Character Sheet';
    contentEl.innerHTML  = renderCharacterSheetHTML(sheet);

    if (opts.initEditPanels && cp) initEditPanel(cp);

    if (sheet.showQRCode !== false) {
        const qrImg  = document.getElementById('ose-qr-img');
        const qrLink = document.getElementById('ose-qr-link');

        const shareUrl = window.location.href;
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
            // Detect encoding: base32 uses only A-Z and 2-7; base64url uses lowercase/- /_
            const isBase32 = /^[A-Z2-7]+$/.test(compressed);
            const json   = isBase32
                ? await decompressFromBase32(compressed)
                : await decompressFromBase64Url(compressed);
            const parsed = JSON.parse(json);
            console.log('[charactersheet] Decompressed URL data:\n' + JSON.stringify(parsed, null, 2));

            if (parsed.v === 2 || parsed.v === 3) {
                if (parsed.v === 2) {
                    // Upgrade v2 → v3 in-place before decoding
                    if (parsed.bs !== undefined) { parsed.s = parsed.bs; delete parsed.bs; }
                    if (parsed.bl !== undefined && parsed.rcm === undefined) {
                        parsed.rcm = parsed.bl ? 'SH' : 'ST';
                    }
                    delete parsed.bl;
                    delete parsed.sv;
                    delete parsed.ap;
                    delete parsed.ar;
                    delete parsed.sh;
                    delete parsed.w;
                    delete parsed.it;
                    delete parsed.ac;
                    delete parsed.de;
                    delete parsed.hd;
                    parsed.v = 3;
                }
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

                // Show level-up HP notice if one was stored by the previous page
                const rawNotice = sessionStorage.getItem('levelUpNotice');
                if (rawNotice) {
                    sessionStorage.removeItem('levelUpNotice');
                    try {
                        const n = JSON.parse(rawNotice);
                        console.log(`\n=== Level Up: ${n.from} → ${n.to} ===`);
                        n.lines.forEach(l => console.log(l));
                        console.log(`  Total HP now: ${n.totalHP}`);
                        console.log('========================\n');

                        const banner = document.createElement('div');
                        banner.style.cssText = 'margin:8px 0;padding:8px 12px;background:#e8f5e9;border:1px solid #a5d6a7;border-radius:4px;font-size:13px;';
                        banner.innerHTML = `<strong>Level ${n.from} → ${n.to}:</strong> ${n.lines.map(l => l.trim()).join(' &nbsp;·&nbsp; ')} &nbsp;·&nbsp; Total HP: ${n.totalHP}`;
                        contentEl.insertBefore(banner, contentEl.firstChild);
                    } catch (_) {}
                }
            } else {
                // Legacy v1 sheet object
                document.title      = parsed.printTitle || 'Character Sheet';
                contentEl.innerHTML = renderCharacterSheetHTML(parsed);
            }
        } else if (legacy) {
            const parsed = JSON.parse(legacy);
            document.title      = parsed.printTitle || 'Character Sheet';
            contentEl.innerHTML = renderCharacterSheetHTML(parsed);
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
