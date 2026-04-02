/**
 * shared-sheet-builder.js
 *
 * Encoding constants used by BOTH gen-ui.js (to build compact-params URLs)
 * and cs-charactersheet.js (progModeLabel for display).
 *
 * Sheet spec assembly and hit-die tables that are only needed by
 * cs-charactersheet.js are inlined directly into cs-charactersheet.js.
 */

// ── Progression mode encode map ────────────────────────────────────────────────

/** Progression mode name → compact code (e.g. 'ose' → 'O') */
export const PROG_CODE = { ose:'O', smooth:'S', ll:'L' };

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

// ── Class / race / RCM encode maps ─────────────────────────────────────────────

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
