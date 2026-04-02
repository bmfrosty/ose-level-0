/**
 * shared-sheet-builder.js
 *
 * Shared constants and the buildSheetSpec() function used by both
 * gen-ui.js (live generator) and charactersheet.html (saved sheet viewer).
 *
 * Centralising these ensures the two rendering paths can never silently diverge
 * in header structure, field names, or lookup tables.
 */

// ── Hit-dice lookup tables ─────────────────────────────────────────────────────

/** Sides of the hit die, keyed by full class name — used by gen-ui.js */
export const CLASS_HD = {
    Fighter_CLASS:8, Cleric_CLASS:6, 'Magic-User_CLASS':4, Thief_CLASS:4,
    Spellblade_CLASS:6, Dwarf_CLASS:8, Elf_CLASS:6, Halfling_CLASS:6, Gnome_CLASS:4
};

/** Sides of the hit die, keyed by compact class code — used by charactersheet.html */
export const CLASS_HD_CODES = { FI:8, CL:6, MU:4, TH:4, SB:6, DW:8, EL:6, HA:6, GN:4 };

// ── Progression mode maps ──────────────────────────────────────────────────────

/** Progression mode name → compact code (e.g. 'ose' → 'O') */
export const PROG_CODE = { ose:'O', smooth:'S', ll:'L' };

/** Compact code → progression mode name (e.g. 'O' → 'ose') */
export const CODE_TO_PROG = { O:'ose', S:'smooth', L:'ll' };

/**
 * Return a human-readable label for a progression mode.
 * Accepts either a mode key ('ose', 'smooth', 'll') or a compact code ('O', 'S', 'L').
 * Used by both cs-charactersheet.js and gen-ui.js so the label lives in one place.
 */
export function progModeLabel(mode) {
    if (mode === 'ose'    || mode === 'O') return 'OSE Standard';
    if (mode === 'smooth' || mode === 'S') return 'Smoothified';
    if (mode === 'll'     || mode === 'L') return 'Labyrinth Lord';
    return mode; // pass-through for unknown values
}

// ── Class / race / RCM code maps ───────────────────────────────────────────────

/** Full class name → compact code (e.g. 'Fighter_CLASS' → 'FI') */
export const CLS_CODE = {
    Fighter_CLASS:'FI', Cleric_CLASS:'CL', 'Magic-User_CLASS':'MU', Thief_CLASS:'TH',
    Spellblade_CLASS:'SB', Dwarf_CLASS:'DW', Elf_CLASS:'EL', Halfling_CLASS:'HA', Gnome_CLASS:'GN'
};

/** Full race name → compact code (e.g. 'Human_RACE' → 'HU') */
export const RACE_CODE = {
    Human_RACE:'HU', Dwarf_RACE:'DW', Elf_RACE:'EL', Halfling_RACE:'HA', Gnome_RACE:'GN'
};

/** Race/class mode → compact code (e.g. 'strict' → 'ST') */
export const RCM_CODE = {
    strict:'ST', 'strict-human':'SH', 'traditional-extended':'TE', 'allow-all':'AL'
};

// ── Utility ────────────────────────────────────────────────────────────────────

/** Strip characters that would make invalid filenames / URL segments */

// ── Sheet spec builder ─────────────────────────────────────────────────────────
/**
 * Build the spec object passed to `displayCharacterSheet` from a normalised
 * sheet-data (sd) object and an options (opts) bag.
 *
 * sd fields
 * ---------
 *   title, subtitle                    — page title strings
 *   name, occupation                   — character name + background profession
 *   raceClass, level, hd, xpBonus      — 6-column header values
 *   maxHP, initMod                     — combat block
 *   abilityScores[]                    — array of { name, score, originalScore, effects }
 *   weapon, classAttackBonus,
 *     meleeMod, rangedMod, thiefSkills — weapons & skills section
 *   abilitiesHeader,
 *     racialAbilities[], classAbilities[] — abilities section
 *   savingThrows                       — { death, wands, paralysis, breath, spells }
 *   experience                         — null for 0-level; otherwise XP object
 *   equipment                          — { armor, shield, items, startingAC,
 *                                          startingGold, startingHD }
 *   spellSlots, turnUndead             — null when not applicable
 *   cp                                 — compact-code object (for QR / re-encode)
 *   footer, printTitle                 — display strings
 *
 * opts fields
 * -----------
 *   showUndeadNames, showQRCode        — display flags
 *   abilityOrder                       — 0 = modern, 1 = 1977
 *   openInNewTab, autoPrint,
 *     backgroundTab                    — print/tab flags (false for saved sheets)
 */
export function buildSheetSpec(sd, opts) {
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
