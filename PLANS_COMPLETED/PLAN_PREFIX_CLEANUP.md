# PLAN: Enforce gen-* / shared-* / cs-* Prefix Convention

## Status: ALL MAIN STEPS COMPLETE ✅

All four implementation steps plus the leaf-module collapse have been done.
The remaining open work is in **Bonus Cleanup** below.

---

## Background

The prefix rules are:

| Prefix | Meaning |
|--------|---------|
| `gen-*` | Only used by `gen-ui.js` or modules it depends on |
| `cs-*` | Only used by `cs-charactersheet.js` or modules it depends on |
| `shared-*` | **Both** controllers independently import from it |

The key word is **independently**. If G only uses a function as part of rendering a character sheet preview (i.e., as a side effect of C's concern), then G is not an independent consumer — that function belongs in `cs-*`.

---

## Completed Work

### ✅ Step 1 — `shared-character-sheet.js` → `cs-character-sheet.js`
Renamed. Both controllers import from it but for completely different functions —
`displayCharacterSheet` (G, inline preview) and `renderCharacterSheetHTML` (C, full page).
The `cs-*` prefix makes it clear this is character-sheet rendering logic.

### ✅ Step 2 — `shared-sheet-builder.js` split + `cs-sheet-builder.js` inlined
- Split: C-only exports (`buildSheetSpec`, `CLASS_HD_CODES`, `CODE_TO_PROG`) extracted.
- `cs-sheet-builder.js` was created as planned, then further **inlined directly into
  `cs-charactersheet.js`** (it was a single-parent leaf — no reason to keep it as a
  separate file).
- `shared-sheet-builder.js` now contains only the five genuinely-shared exports
  (`progModeLabel`, `PROG_CODE`, `CLS_CODE`, `RACE_CODE`, `RCM_CODE`).

### ✅ Step 3 — `shared-modifier-effects.js` → `cs-modifier-display.js`
`getModifier` and `calculateModifier` (shared-ability-scores.js) are equivalent.
- `gen-race-adjustments.js` updated to import `calculateModifier` from `shared-ability-scores.js`.
- `shared-modifier-effects.js` renamed to `cs-modifier-display.js` (only `getModifierEffects` remains).
- `cs-modifier-display.js` is kept as a separate file (not inlined) because it is a
  **dynamic `await import()`** — keeping it separate lets the browser defer parsing until
  a sheet is actually rendered.

### ✅ Step 4 — FUNCTION_AUDIT.md and FLOWCHART.md updated
All diagrams, tables, and notes reflect the current file layout.

### ✅ Leaf-module collapse — `gen-settings.js` inlined into `gen-ui.js`
`saveSettings` / `loadSettings` / `clearSettings` were only ever imported by `gen-ui.js`.
Inlined and the file deleted.

---

## File Change Summary (Actual)

| Before | After | Reason |
|--------|-------|--------|
| `shared-character-sheet.js` | `cs-character-sheet.js` ✅ | Not shared; both exports are character-sheet rendering |
| `shared-sheet-builder.js` (full) | `shared-sheet-builder.js` (encoding only) ✅ | Trimmed to only the parts G needs independently |
| `shared-modifier-effects.js` | `cs-modifier-display.js` ✅ | `getModifier` duplicated `calculateModifier`; only `getModifierEffects` remains, C-only |
| *(planned `cs-sheet-builder.js`)* | **inlined into `cs-charactersheet.js`** ✅ | Single-parent leaf — separate file unnecessary |
| `gen-settings.js` | **inlined into `gen-ui.js`** ✅ | Single-parent leaf — separate file unnecessary |

---

## Bonus Cleanup

### ✅ Bonus 2 — Dead `canRaceTakeClass` in `shared-racial-abilities.js` deleted

Confirmed unused (no file outside `shared-racial-abilities.js` itself imported it).
Deleted the function and its JSDoc. The surviving `canRaceTakeClass` in
`shared-class-data-shared.js` (3-arg version used internally by that module) is
unchanged.

### ⚠️ Bonus 1 — Duplicate `calculateXPBonus` — **different units, cannot simply consolidate**

| Location | Returns | Example for score 15 |
|----------|---------|----------------------|
| `shared-ability-scores.js` | Integer percentage (`5`) | `5` → "+5%" display label |
| `shared-class-data-shared.js` | Decimal fraction (`0.05`) | `0.05` → multiplied against XP total |

The two versions measure the same thing but in different units. A simple
drop-in replacement would break either the display layer or the XP math.

**To deduplicate properly:**
1. Pick one canonical unit (recommend: integer `%` matching `shared-ability-scores.js`).
2. Update `shared-class-data-shared.js` `XP_BONUS` table to integer values (`5` not `0.05`).
3. Update every call-site in `shared-class-progression.js` that multiplies by the result
   — divide by 100 at the use-site instead (e.g. `xp * calculateXPBonus(score) / 100`).
4. Remove `calculateXPBonus` from `shared-class-data-shared.js`; import from
   `shared-ability-scores.js` instead.
