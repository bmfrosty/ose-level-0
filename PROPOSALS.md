# Proposals — Path to Single Source of Truth

## Goal

All class data lives in one `CLASS_INFO` const. All race data lives in one `RACE_INFO` const.
No hardcoded tables elsewhere duplicate what those consts already know. No wrapper functions
exist purely to re-expose data already accessible via `CLASS_INFO` or `RACE_INFO`.

---

## Status Summary

| # | Proposal | Status |
|---|----------|--------|
| 1 | Fix import bug: `getMaxLevel` + `getAdvancedModeRacialAbilities` in gen-ui.js | ✅ Done |
| 2 | Fix `getPrimeRequisites` Gnome bug; derive from `CLASS_INFO` | ✅ Done |
| 3 | Derive `RACE_CODE` from `RACE_INFO[race].code`; add `code:` to `CLASS_INFO`, derive `CLS_CODE` | ✅ Done |
| 4 | Remove duplicate `calculateXPBonus` | ✅ Done |
| 5 | Delete `getRacialAdjustments` + `getRacialMinimums` thin wrappers | ✅ Done |
| 6 | Delete the re-export blocks from both utils files | ✅ Done |
| 7 | Inline `_pending-delete/` files into `shared-abilities.js` and delete them | ✅ Done |
| 8 | Absorb `shared-advanced-utils.js` into `shared-abilities.js` | ✅ Done |
| 9 | Standardize score representation (results array vs plain object) | 🔲 Pending |
| 10 | Merge `shared-hit-points.js` + `shared-abilities.js` + `shared-ability-scores.js` + `shared-character.js` → `shared-core.js` | ✅ Done |
| 11 | Merge `cs-compact-codes.js` + `cs-url-codec.js` into `cs-sheet-renderer.js` | ✅ Done |
| 12 | Consolidate `shared-class-data-ose.js` / `gygar` / `ll` into `shared-class-data.js` | ✅ Done |

---

## Completed

### 1. Bug: gen-ui.js imports from wrong module ✅

`getMaxLevel` and `getAdvancedModeRacialAbilities` were imported from `shared-generator.js`
which did not export them. Both now correctly imported from `shared-abilities.js`.

### 2. `getPrimeRequisites` — derived from `CLASS_INFO` ✅

`getPrimeRequisites` is now exported from `shared-abilities.js`, derived from
`CLASS_INFO[base].primeRequisite` by splitting on `" and "`. The hardcoded table in
`shared-ability-scores.js` is now a private (unexported) local — still used internally
by `meetsPrimeRequisiteRequirements` and `rollAbilities`, which can't import from
`shared-abilities.js` without a circular dependency.

`gen-ui.js` and `cs-sheet-page.js` both now get `getPrimeRequisites` from `shared-abilities.js`.

### 4. Duplicate `calculateXPBonus` ✅

`shared-class-data-shared.js` (and its duplicate XP_BONUS table) are deleted.
`shared-abilities.js` re-exports `calculateXPBonus` from `shared-ability-scores.js`.

### 5. `getRacialAdjustments` / `getRacialMinimums` thin wrappers ✅

`shared-advanced-utils.js` is deleted. The wrappers are gone. Callers use
`getRaceInfo(race)?.abilityModifiers` / `?.minimums` directly, or the named helpers
(`applyRacialAdjustments`, `checkRacialMinimums`) now in `shared-abilities.js`.

### 6. Re-export blocks from utils files ✅

`shared-advanced-utils.js` is deleted entirely.
`shared-basic-utils.js` now exports only its three real functions:
`readAbilityScores`, `getClassRequirements`, `getDemihumanLimits`.

### 7. Inline `_pending-delete/` into `shared-abilities.js` ✅

`shared-class-data-shared.js`, `shared-class-progression.js`, `shared-racial-abilities.js`
are all deleted. Their full content is inlined directly into `shared-abilities.js`.
`shared-race-names.js` was also inlined (`LEGACY_RACE_NAMES` / `normalizeRaceName` as
private locals) and deleted.

`shared-class-data-ose.js` and `shared-class-data-gygar.js` were updated to import from
`shared-abilities.js` instead of `shared-class-data-shared.js`.

### 8. Absorb `shared-advanced-utils.js` into `shared-abilities.js` ✅

All six functions (`getRaceDisplayName`, `getClassDisplayName`, `applyRacialAdjustments`,
`checkRacialMinimums`, `getAvailableClasses`, `getClassRequirements`) now live in
`shared-abilities.js`. `shared-advanced-utils.js` is deleted.

---

## Completed (not originally listed)

### Import routing: `displayCharacterSheet` ✅

`gen-ui.js` previously imported `displayCharacterSheet` directly from `cs-sheet-renderer.js`,
making that a direct gen dependency on a cs-prefixed module. It is now re-exported via
`cs-sheet-page.js`, so `gen-ui.js` only needs one cs import point.

### `shared-ability-scores.js` re-exported via `shared-abilities.js` ✅

`calculateModifier`, `calculateXPBonus`, `getPrimeRequisites` are now re-exported from
`shared-abilities.js`. `cs-sheet-page.js` no longer imports `shared-ability-scores.js`
directly — it gets these via `shared-abilities.js`.

---

### 10. Merge four shared modules → `shared-core.js` ✅

`shared-ability-scores.js`, `shared-abilities.js`, `shared-hit-points.js`, and
`shared-character.js` were all inlined into a single new file `shared-core.js`. This is now
the single source of truth for all shared data and logic: ability score math, class/race data
(`CLASS_INFO`, `RACE_INFO`), progression helpers, HP rolling, and character creation.

All callers updated (`gen-core.js`, `gen-ui.js`, `cs-sheet-page.js`, `shared-sheet-builder.js`,
`shared-class-data.js`). All four source files deleted. Neither controller imports `shared-core.js`
directly — they reach it through `shared-class-data.js` which re-exports it via
`export * from './shared-core.js'`.

### 11. Merge `cs-compact-codes.js` + `cs-url-codec.js` → `cs-sheet-renderer.js` ✅

Both cs-only codec modules were inlined into `cs-sheet-renderer.js`. `cs-sheet-page.js` now
imports all codec and URL functions from one module. Dynamic imports of `encodeCompactParams` /
`decodeCompactParams` changed from `./cs-compact-codes.js` to `./cs-sheet-renderer.js` (the
browser resolves the already-cached module). Both source files deleted.

### 12. Consolidate class-data files → `shared-class-data.js` (Option A) ✅

`shared-class-data-ose.js`, `shared-class-data-gygar.js`, and `shared-class-data-ll.js` were
merged into `shared-class-data.js`. All mode-specific progression data is bundled into a
`PROGRESSION_TABLES = { ose, gygar, ll }` export; each value is a mode-bound object with
`getAttackBonus`, `getSavingThrows`, `getSpellSlots`, and the shared progression functions.

`cs-sheet-page.js` dynamic import simplified to always `await import('./shared-class-data.js')`;
`gen-ui.js` three static imports reduced to one. `shared-class-data.js` re-exports everything
from `shared-core.js`. All three source files deleted.

---

### 3. Derive `RACE_CODE` and `CLS_CODE` from `CLASS_INFO` / `RACE_INFO` ✅

Already done (completed before this session). `shared-sheet-builder.js` imports
`CLASS_INFO` and `RACE_INFO` from `shared-core.js` (via `shared-class-data.js`) and derives
both maps dynamically. `CLASS_INFO` has a `code:` field on every entry.

---

## Pending

### 9. Standardize score representation (long-term)

Two different shapes exist for ability scores:

| Shape | Where used | Example |
|-------|-----------|---------|
| **Plain object** | `gen-ui.js`, `cs-sheet-page.js` compact params | `{ STR: 14, DEX: 10, ... }` |
| **Results array** | `shared-generator.js` internally | `[{ ability: 'STR', score: 14, modifier: 1, ... }]` |

This mismatch is why `shared-core.js` has both `applyRacialAbilityModifiers` (results-array
form, internal to generator) and `applyRacialAdjustments` (plain-object form, used by gen-ui.js).

**Option A (recommended):** Standardize on plain objects everywhere. The results array is an
internal `gen-core.js` detail — it already exposes only plain objects from its return
value. Change the internal helpers (`applyRacialAbilityModifiers`, `meetsRacialMinimums`) to
accept plain objects and remove the plain-object duplicates.

**Option B:** Standardize on results arrays everywhere. Higher effort; requires updating
`cs-sheet-page.js` and `gen-ui.js` compact-param paths.

---


## Relationship to Existing Plans

| Plan | Status | Relationship |
|------|--------|-------------|
| `PLAN_MERGE_CLASS_AND_RACE_DATA_FILES.md` | Complete | All phases done |
| `PLAN_CLASS_ABILITIES_AUDIT.md` | Active | User review of `includeName` / wording — independent of all proposals here |
