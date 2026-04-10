# Plan: Merge Generators → `shared-generator.js`

## Goal

A single `generateCharacter(opts)` function that handles both Basic and Advanced modes at all
levels 0–14. Basic and Advanced are not separate code paths — they are the same flow with
narrow, explicitly-flagged conditionals at the points where the two modes genuinely differ.

Level 0 is not a separate mode. It is level 0 within Basic or Advanced.

---

## Current State

### Generator files (to merge)

| File | Role | Problems |
|------|------|---------|
| `gen-0level-gen.js` | Level 0 characters, both modes. | Separate from level 1–14 generators; duplicates ability rolling, HP, saves, attack bonus, name/background logic |
| `shared-basic-character-gen.js` | Basic level 1–14. | Pure thin wrappers — no substantive logic |
| `shared-advanced-character-gen.js` | Advanced level 1–14. | `rollAbilitiesAdvanced()` has its own inline reroll loop; `createCharacterAdvanced()` is the only real logic; imports stale race data from `shared-advanced-utils.js` |

### UI file — not merged

`gen-ui.js` — Combined Basic + Advanced UI. Calls all three generators. Updated last, once
the generators are unified.

### Prerequisite

Fix stale duplicate race data in `shared-advanced-utils.js` first
(see `PLAN_MERGE_CLASS_AND_RACE_DATA_FILES.md` Phase 1). The merged generator must read
from `RACE_INFO` — not from the stale inline tables in `shared-advanced-utils.js`.

---

## Architecture: One Function, Narrow Conditionals

The shared flow is nearly identical between Basic and Advanced. The differences are:

| Step | Basic | Advanced | Conditional |
|------|-------|----------|-------------|
| Roll ability scores | 3d6 each | 3d6 each | none |
| Apply racial stat adjustments | ❌ skip | ✅ `applyRacialAbilityModifiers()` | `if (isAdvanced)` |
| Check racial minimums | ❌ skip | ✅ `meetsRacialMinimums()` | `if (isAdvanced)` |
| Check user minimums / prime req filters | ✅ | ✅ | none |
| Roll HP (level 0) | 1d4 + CON mod | 1d4 + CON mod; Human + `humanRacialAbilities` → Blessed | `if (isAdvanced && race === 'Human_RACE' && humanRacialAbilities)` |
| Racial abilities | `getRaceAbilitiesAtLevel(race, level, 'basic')` | `getRaceAbilitiesAtLevel(race, level, 'advanced', humanRacialAbilities)` | mode string passed to existing helper |
| Class abilities (level 1+) | `getAbilitiesAtLevel(className, level)` | `getAbilitiesAtLevel(className, level)` | none |
| Saves | `calculateSavingThrows(level, race, con, isAdvanced, isGygar)` | same | none (isAdvanced already a param) |
| Attack bonus | `calculateAttackBonus(level, race, isAdvanced, isGygar)` | same | none |
| Name, background, AC, gold (level 0) | same | same | none |

The resulting function looks like:

```js
export async function generateCharacter(opts = {}) {
    const {
        mode = 'basic',            // 'basic' | 'advanced'
        level = 0,
        race: forcedRace = '',
        className = null,          // null at level 0; required at level 1+
        isGygar = false,
        humanRacialAbilities = false,
        minimums = {},
        primeReqMode = 'user',
        hpMode = 0,
        fixedScores = null,
        fixedAdjustments = null,
        fixedName = '',
        fixedOccupation = null,
    } = opts;

    const isAdvanced = mode === 'advanced';

    // — Roll or fix ability scores —————————————————————————————
    let scores, race, hp;
    if (fixedScores) {
        race = pickRace(forcedRace);
        scores = rawFromFixed(fixedScores);
        if (fixedAdjustments) {
            scores = applyFixedAdjustments(scores, fixedAdjustments);
        } else if (isAdvanced) {                   // ← isAdvanced conditional
            scores = applyRacialAbilityModifiers(scores, race, true, humanRacialAbilities);
        }
    } else {
        for (;;) {
            race = pickRace(forcedRace);
            scores = rollAbilityScores();
            if (isAdvanced && !meetsRacialMinimums(scores, race, true)) continue; // ← isAdvanced
            if (!passesFilters(scores, { minimums, primeReqMode })) continue;
            const conMod = scores.find(r => r.ability === 'CON').modifier;
            hp = rollHP(conMod, race, isAdvanced, humanRacialAbilities, hpMode); // ← isAdvanced inside
            if (level === 0 && hp.total < 1) continue;
            break;
        }
    }

    // — Racial abilities ———————————————————————————————————————
    const racialAbilities = level === 0 || isAdvanced
        ? getRaceAbilitiesAtLevel(race, level, mode, humanRacialAbilities)  // ← mode string
        : [];   // Basic level 1+: racial abilities replaced by class abilities

    // — Class abilities (level 1+) —————————————————————————————
    const classAbilities = level >= 1 && className
        ? getAbilitiesAtLevel(className.replace('_CLASS', ''), level)
        : [];

    // — Saves, attack, name, background, AC, gold ——————————————
    // (all shared — no conditionals)

    return { race, scores, racialAbilities, classAbilities, hp, saves, attackBonus, ... };
}
```

The only `isAdvanced` checks are:
1. `applyRacialAbilityModifiers` — Advanced only
2. `meetsRacialMinimums` — Advanced only
3. `rollHP` Blessed check — Advanced + Human + humanRacialAbilities
4. `getRaceAbilitiesAtLevel(..., mode, ...)` — passes mode string; no conditional needed

---

## Level 0 vs. Level 1+ differences (within the single function)

| | Level 0 (any mode) | Level 1+ (any mode) |
|--|--|--|
| HP die | 1d4 | Class HD from `HIT_DICE_PROGRESSIONS` |
| Saves | `savingThrowsLevel0` + racial modifiers | Class saves from classData |
| Attack bonus | `attackBonusLevel0` (–1 or 0 Gygar) | Class THAC0 from classData |
| AC | DEX mod + background armor (Chain Mail=14, else 10) | Class armor options |
| Background | `gen-backgrounds.js` | — |
| Starting gold | 3d6 gp (level 0) | From XP table (level 1+) |
| Class abilities | None | `getAbilitiesAtLevel(className, level)` |

These are already `if (level === 0)` checks — no mode conditional needed.

---

## `opts` API

```js
generateCharacter({
    mode: 'basic',             // 'basic' | 'advanced'
    level: 0,                  // 0–14
    race: '',                  // '' | 'Human_RACE' | 'Demihuman_RACE' | 'Dwarf_RACE' | ...
    className: null,           // null (level 0) | 'Fighter_CLASS' | 'Dwarf_CLASS' | ...
    isGygar: false,            // Smoothified/Gygar mode
    humanRacialAbilities: false, // Advanced mode optional human abilities
    minimums: {},              // { STR, DEX, ... } user-set per-ability minimums
    primeReqMode: 'user',      // 'user' | '9' | '13'
    hpMode: 0,                 // 0=standard | 1=everyone blessed | 3=reroll 1s/2s
    fixedScores: null,         // { STR, DEX, ... } — skip reroll loop
    fixedAdjustments: null,    // { STR, DEX, ... } — override racial adjustments (edit panel)
    fixedName: '',
    fixedOccupation: null,
})
```

**Race in Basic level 1+**: Basic demihumans (Dwarf_CLASS, Elf_CLASS etc.) — `className` IS
the race-as-class identifier. For demihumans, `race` is derived from `className` (strip
`_CLASS`, add `_RACE`). For human classes (Cleric, Fighter, etc.), `race = 'Human_RACE'`.

---

## Key Logic to Preserve

### `pickRace(forcedRace)` — from `gen-0level-gen.js`
- `''` → random: 1-in-4 demihuman, otherwise Human
- `'Demihuman_RACE'` → random from the four demihuman races
- `'Dwarf_RACE'` etc. → exact race

### `hpMode` — from `gen-0level-gen.js`
```
0 = standard 1d4
1 = everyone Blessed (roll twice, take best) — overrides per-character Blessed
3 = re-roll 1s and 2s
```
Per-character Blessed (Human + Advanced + humanRacialAbilities) is independent of `hpMode`.
`hpMode === 1` takes priority.

### Fixed scores / edit panel — from `gen-0level-gen.js`
Skip the reroll loop. If `fixedAdjustments` provided, apply those exact deltas instead of
racial modifiers (preserving `originalRoll` for strikethrough display in the UI).

### `RACE_TO_CODE` — from `gen-0level-gen.js`
Move to `RACE_INFO` as a `code:` field on each race entry. Remove from generator.

---

## Callers

| Caller | Current imports | After merge |
|--------|----------------|-------------|
| `gen-ui.js` | `generateZeroLevelCharacter` (gen-0level-gen), Basic wrappers (shared-basic-character-gen), Advanced wrappers (shared-advanced-character-gen) | Single `generateCharacter` from `shared-generator.js`; shims kept until gen-ui.js is updated |

---

## Work Order

### Phase 1 — Prerequisite ✅ DONE
Fix stale race data in `shared-advanced-utils.js`
(see `PLAN_MERGE_CLASS_AND_RACE_DATA_FILES.md` — all phases complete).

### Phase 2 — Add `code:` field to `RACE_INFO` ✅ DONE
Added `code: 'HU'/'DW'/'EL'/'GN'/'HA'` to each playable race in `RACE_INFO`.
Removed `RACE_TO_CODE` from `gen-0level-gen.js`; call site updated to
`getRaceInfo(race)?.code ?? 'HU'`.

### Phase 3 — Write `shared-generator.js` ✅ DONE
Single `generateCharacter(opts)` function written. Handles:
- Both modes via 4 narrow `isAdvanced` conditionals (see table above)
- Level 0 vs. level 1+ via `level === 0` conditionals
- Fixed scores / edit panel path (fixedScores + fixedAdjustments)
- Reroll loop with racial minimums, class requirements, user minimums, primeReqMode
- `hpMode` and per-character Blessed (Advanced + Human + humanRacialAbilities)
- Racial save modifiers applied on top of class saves at level 1+
- Basic demihuman class abilities via `getBasicModeClassAbilities` at level 1+
- `generateZeroLevelCharacter` shim: `opts => generateCharacter({ ...opts, level: 0 })`

Key design notes:
- `classData` must be provided in opts for level >= 1 (OSE/Gygar/LL module)
- Level 0 return shape matches the old `generateZeroLevelCharacter` exactly (compatible with gen-ui.js)
- Level 1+ return shape is new/unified; gen-ui.js updated in Phase 6
- Fixed the `calcLevel0HP` scope bug from gen-0level-gen.js (was referencing `humanRacialAbilities` from outer scope; now passed as explicit parameter)

### Phase 4 — Replace `gen-0level-gen.js` with shim ✅ DONE
`gen-0level-gen.js` replaced with re-export shim:
```js
export { generateCharacter, generateZeroLevelCharacter } from './shared-generator.js';
```
`RACE_TO_CODE` omitted — already removed in Phase 2; no callers remain.
`gen-ui.js` imports `generateZeroLevelCharacter` from this file — still works via shim.

### Phase 5 — Replace Basic and Advanced wrappers with shims ✅ DONE

`shared-basic-character-gen.js` — pure re-exports to canonical sources:
- `rollAbilities`, `rollAbilityScore` → `shared-ability-scores.js`
- `rollHitPoints`, `rollSingleDie`, `parseHitDice` → `shared-hit-points.js`
- `getClassProgressionData`, `getClassFeatures` → `shared-class-progression.js`
- `getClassAbilities` → `getBasicModeClassAbilities` from `shared-class-progression.js`
- `createCharacter` → `shared-character.js`

`shared-advanced-character-gen.js` — re-exports + three inline orchestrators:
- Simple re-exports: same sources as above; plus `applyRacialAdjustments`,
  `meetsRacialMinimums` from `shared-advanced-utils.js`
- `rollAbilitiesAdvanced` — kept inline; now passes `race` to `getClassRequirements`
  so per-race requirements are used (fixing the old union-fallback path)
- `getRacialAbilities` — kept inline; thin wrapper over `getAdvancedModeRacialAbilities`
- `createCharacterAdvanced` — kept inline; delegates to canonical helpers
- All three remain until gen-ui.js is updated in Phase 6

### Phase 6 — Update `gen-ui.js`, delete shims ✅ DONE
- `gen-ui.js` imports updated to point directly to canonical sources:
  - `rollAbilities` → `shared-ability-scores.js`
  - `rollHPBasic` / `rollHPAdvanced` → `rollHitPoints` from `shared-hit-points.js`
  - `getProgBasic` / `getProgAdvanced` → `getClassProgressionData` from `shared-class-progression.js`
  - `getClassFeatures`, `getRacialBasic` → `shared-class-progression.js`
  - `createCharacter` → `shared-character.js`
  - `generateZeroLevelCharacter` → `shared-generator.js`
  - `getAdvancedModeRacialAbilities` → `shared-racial-abilities.js`
  - `_applyRacialAdj`, `_meetsRacialMins`, `_getClassReqs`, `getRacialAdjustments` → `shared-advanced-utils.js`
- `rollAbilitiesAdvanced`, `getRacialAdvanced`, `createCharacterAdvanced` inlined directly in `gen-ui.js`
- `cs-sheet-page.js` dynamic imports of the shim files replaced with canonical sources
- `gen-0level-gen.js`, `shared-basic-character-gen.js`, `shared-advanced-character-gen.js` deleted

---

## Answered Questions

- **Single function or two**: Single `generateCharacter(opts)` — the differences are narrow
  enough that splitting into two functions would duplicate more code than the conditionals save.
- **`forcedRace` in Basic level 1+**: Not used. Level 1+ Basic takes `className` directly;
  `race` is derived from it for demihumans.
- **Reroll loop**: One loop handles both modes. The only mode-conditional inside it is
  `meetsRacialMinimums` (Advanced only).
- **Background/profession**: Level 0 only. Level 1+ characters do not get backgrounds.
- **`RACE_TO_CODE`**: Moves to `RACE_INFO[race].code` (Phase 2).
