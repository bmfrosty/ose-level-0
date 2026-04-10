# Plan: Merge Class and Race Data Files → `shared-abilities.js`

## Goal

Consolidate all class and race data — and their helpers — into a single file `shared-abilities.js`.
Eliminate duplicate hardcoded race data tables scattered across multiple files.

---

## Current State

### Data files (to merge)

| File | What it exports | Problem |
|------|----------------|---------|
| `shared-class-data-shared.js` | `CLASS_INFO` (with `abilities:`), XP/HD tables, spell slots, thief skills, turn undead, `getClassInfo()`, `getClassAbilities()`, `getAbilitiesAtLevel()`, etc. | Source of truth for class data — correct |
| `shared-class-progression.js` | `getClassProgressionData()`, `getClassFeatures()`, `getBasicModeClassAbilities()` | Logic functions that read `CLASS_INFO`; thin wrappers over `shared-class-data-shared.js` |
| `shared-racial-abilities.js` | `RACE_INFO`, `RACIAL_CLASS_LEVEL_LIMITS`, `getRaceInfo()`, `getRaceAbilitiesAtLevel()`, `getAdvancedModeRacialAbilities()`, `resolveFormula()`, `applyRacialSaveModifiers()`, `applyRacialAbilityModifiers()`, `meetsRacialMinimums()`, `calculateSavingThrows()`, `calculateAttackBonus()`, `getMaxLevel()`, `savingThrowsLevel0`, `attackBonusLevel0` | Source of truth for race data — correct |

### Duplicate / stale data (to remove)

| File | Function | Problem |
|------|----------|---------|
| `shared-advanced-utils.js` | `getRacialAdjustments()` | Hardcoded table — duplicates `RACE_INFO[race].abilityModifiers` |
| `shared-advanced-utils.js` | `getRacialMinimums()` | Hardcoded table — duplicates `RACE_INFO[race].minimums`; Gnome still has `INT: 9` (corrected in `RACE_INFO`) |
| `shared-advanced-utils.js` | `applyRacialAdjustments()` | Uses the above stale table |
| `shared-advanced-utils.js` | `meetsRacialMinimums()` | Uses the above stale table |
| `shared-advanced-utils.js` | `getAvailableClasses()` / `traditionalCombinations` | Hardcoded race→classes map — duplicates the inverse of `CLASS_INFO[className].availableRaces.advanced`; should read from `RACE_INFO[race].availableClasses` (field to be added) |
| `shared-advanced-utils.js` | `getClassRequirements()` | Hardcoded class requirements — duplicates `CLASS_INFO[className].requirements`; only lists Advanced classes (Spellblade STR 9, INT 9) |
| `shared-basic-utils.js` | `getClassRequirements()` | Hardcoded class requirements — duplicates `CLASS_INFO[className].requirements`; includes demihuman classes; has `Gnome: { INT: 9 }` which is wrong (Gnome has no INT minimum) |
| `shared-basic-utils.js` | `getDemihumanLimits()` | Hardcoded Basic demihuman class max levels — `CLASS_INFO` has no `maxLevel` field yet; needs adding |

### Files that stay separate (not merged)

| File | Reason |
|------|--------|
| `shared-class-data-ose.js` | Level-dependent OSE tables (saves, attack, XP, spell slots) — mode-specific, not shared data |
| `shared-class-data-gygar.js` | Level-dependent Gygar tables — mode-specific |
| `shared-class-data-ll.js` | Level-dependent Low-Level tables — mode-specific |
| `shared-race-names.js` | Small utility (`normalizeRaceName`, `LEGACY_RACE_NAMES`) — imported by `shared-racial-abilities.js`; can stay as-is |

---

## Target Architecture

```
shared-abilities.js
├── CLASS_INFO          (from shared-class-data-shared.js)
├── RACE_INFO           (from shared-racial-abilities.js)
├── RACIAL_CLASS_LEVEL_LIMITS  (from shared-racial-abilities.js)
├── XP/HD/spell/thief/undead tables  (from shared-class-data-shared.js)
├── savingThrowsLevel0, attackBonusLevel0  (from shared-racial-abilities.js)
│
├── Class helpers:
│   getClassInfo(), getClassAbilities(), getAbilitiesAtLevel(),
│   getClassProgressionData(), getClassFeatures(), getBasicModeClassAbilities(),
│   calculateXPBonus(), canRaceTakeClass(), meetsRequirements(),
│   getMaxLevel()
│
└── Race helpers:
    getRaceInfo(), getRaceAbilitiesAtLevel(), getAdvancedModeRacialAbilities(),
    resolveFormula(), applyRacialSaveModifiers(), calculateSavingThrows(),
    applyRacialAbilityModifiers(), meetsRacialMinimums(),
    calculateAttackBonus()
```

### Callers to update after merge

| File | Current imports | Change needed |
|------|----------------|---------------|
| `shared-advanced-character-gen.js` | `shared-racial-abilities.js`, `shared-advanced-utils.js` (racialAdjustments), `shared-class-progression.js` | Point to `shared-abilities.js`; remove `shared-advanced-utils.js` racial function imports |
| `shared-basic-character-gen.js` | `shared-class-progression.js` | Point to `shared-abilities.js` |
| `gen-0level-gen.js` | `shared-racial-abilities.js` | Point to `shared-abilities.js` |
| `gen-ui.js` | `shared-class-data-shared.js`, `shared-racial-abilities.js`, `shared-class-progression.js` (via gen wrappers) | Point to `shared-abilities.js` |
| `cs-sheet-page.js` | Various | Audit and update |

---

## Phase 1 — Extend `CLASS_INFO` and `RACE_INFO` with missing fields ✅ DONE

Before fixing the stale utility functions, add the missing fields they expose as needing a
home. These are pure data additions — no logic changes.

1. ✅ Add `maxLevel: N` to every `CLASS_INFO` entry in `shared-class-data-shared.js`:
   - Human classes (Cleric, Fighter, Magic-User, Thief, Spellblade): `maxLevel: 14`
   - Dwarf: `maxLevel: 12`, Elf: `maxLevel: 10`, Halfling: `maxLevel: 8`, Gnome: `maxLevel: 8`

2. ✅ Add `availableClasses: { advanced: [...] }` to every `RACE_INFO` entry in
   `shared-racial-abilities.js` — the traditional Advanced mode race+class combinations:
   - `Human_RACE`:    `['Cleric', 'Fighter', 'Magic-User', 'Thief', 'Spellblade']`
   - `Dwarf_RACE`:    `['Cleric', 'Fighter', 'Thief']`
   - `Elf_RACE`:      `['Fighter', 'Magic-User', 'Spellblade']`
   - `Gnome_RACE`:    `['Cleric', 'Fighter', 'Illusionist', 'Thief']`
   - `Halfling_RACE`: `['Fighter', 'Thief']`
   - Gnome discrepancy resolved: Illusionist IS traditional — confirmed by COPYRIGHTED file.
     Old `traditionalCombinations` was wrong (omitted Illusionist).
   - Also fixed: `Gnome_RACE.minimums` updated to `{ CON: 9, INT: 9 }` per COPYRIGHTED file.
   - Also fixed: `Halfling_RACE.minimums` confirmed `{ CON: 9, DEX: 9 }` per COPYRIGHTED file.
   - Stale `⚠️` warning comments on verified ability modifiers cleaned up.

3. ✅ Verified `CLASS_INFO[className].requirements` has Spellblade's requirements correctly set:
   `Human: { INT: 9, STR: 9 }, Elf: { INT: 9, STR: 9 }` — correct.

## Phase 2 — Fix stale duplicate data in utility files ✅ DONE

Replace every hardcoded inline table with a read from `CLASS_INFO` or `RACE_INFO`.
Exported function signatures must stay the same — callers must not break.

4. ✅ `shared-advanced-utils.js` — `getRacialAdjustments(race)`:
   `return getRaceInfo(race)?.abilityModifiers ?? {}`

5. ✅ `shared-advanced-utils.js` — `getRacialMinimums(race)`:
   `return getRaceInfo(race)?.minimums ?? {}`

6. ✅ `shared-advanced-utils.js` — `applyRacialAdjustments(baseScores, race)`:
   No body change needed — already delegates to `getRacialAdjustments(race)`.

7. ✅ `shared-advanced-utils.js` — `meetsRacialMinimums(scores, race)`:
   No body change needed — already delegates to `getRacialMinimums(race)`.

8. ✅ `shared-advanced-utils.js` — `getAvailableClasses(race, allowNonTraditional)`:
   `return getRaceInfo(race)?.availableClasses?.advanced ?? []`
   Also fixed: Gnome now correctly includes Illusionist (was missing from old hardcoded table).

9. ✅ `shared-advanced-utils.js` — `getClassRequirements(className, race?)`:
   Now reads from `CLASS_INFO[className].requirements[race]` when race is provided.
   Added optional `race` parameter — callers without race get union of all race requirements
   (safe approximation; correct for all current classes). Caller update deferred to Phase 3.

10. ✅ `shared-basic-utils.js` — `getClassRequirements(className)`:
    Reads `CLASS_INFO[base].requirements[race]` where race = class name for demihumans,
    `'Human'` for human classes. Fixed wrong `Gnome: { INT: 9 }` (now correctly `{ CON: 9 }`
    from `CLASS_INFO['Gnome'].requirements['Gnome']`).

11. ✅ `shared-basic-utils.js` — `getDemihumanLimits()`:
    `Object.fromEntries(['Dwarf','Elf','Halfling','Gnome'].map(c => [c, CLASS_INFO[c].maxLevel]))`

## Phase 3 — Create `shared-abilities.js`

12. Create `shared-abilities.js` that re-exports everything from the source files:
    ```js
    export * from './shared-class-data-shared.js';
    export * from './shared-class-progression.js';
    export * from './shared-racial-abilities.js';
    ```
    Safe first step — all callers can update their import path without code changes.
13. Verify all callers work with the new import path.

## Phase 4 — Inline the source files into `shared-abilities.js`

14. Inline contents of `shared-class-data-shared.js` directly into `shared-abilities.js`
15. Inline contents of `shared-class-progression.js`
16. Inline contents of `shared-racial-abilities.js`
17. Delete the three source files; update all import sites

## Phase 5 — Evaluate and clean up utility files

18. After Phase 2, assess what remains in `shared-advanced-utils.js`:
    - `getRaceDisplayName`, `getClassDisplayName` — simple string manipulation; can stay or
      inline at call sites
    - `getAvailableClasses`, `getClassRequirements`, `getDemihumanLimits` — now thin wrappers
      over `CLASS_INFO`/`RACE_INFO`; consider moving into `shared-abilities.js` alongside the data
    - `applyRacialAdjustments`, `meetsRacialMinimums` — signature differs from `shared-racial-abilities.js`
      equivalents (plain object vs. results array); standardise on one format when merging generators
19. After Phase 2, assess `shared-basic-utils.js` — remaining unique content is
    `readAbilityScores()` (DOM-dependent) and re-exports from `shared-ability-scores.js`.
    May be deletable once generators are merged.

---

## Known Issues / Decisions Needed

- **Two shapes for scores**: `applyRacialAdjustments(baseScores, race)` in `shared-advanced-utils.js`
  takes a plain `{STR, DEX, ...}` object; `applyRacialAbilityModifiers(results, race, isAdvanced)`
  in `shared-racial-abilities.js` takes a results array. Both must survive Phase 2.
  Standardise on one format when merging generators (see `PLAN_MERGE_GENERATORS.md`).
- **Gnome + Illusionist**: ✅ Resolved. Illusionist is confirmed traditional by COPYRIGHTED-gnome-race.txt.
  `RACE_INFO["Gnome_RACE"].availableClasses.advanced` includes Illusionist.
  `traditionalCombinations` in `shared-advanced-utils.js` will be fixed in Phase 2 step 8.
- **`getClassRequirements` in Advanced utils**: caller (`rollAbilitiesAdvanced`) has access
  to the race — update the call site to pass race so requirements can be looked up per
  `CLASS_INFO[className].requirements[race]`. Defer to Phase 2 step 9.
