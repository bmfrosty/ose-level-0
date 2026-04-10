# Naming Conflicts in Shared Modules

Audit of functions with the same name that do different things, or wrappers that obscure which module is the real implementation.

---

## 1. `rollHitPoints` — 3 versions, **parameter order bug**

| File | Signature |
|------|-----------|
| `shared-hit-points.js` | `rollHitPoints(options)` — canonical options-object implementation |
| `shared-basic-character-gen.js` | `rollHitPoints(className, level, conMod, classData, inclL0, healthy, **fixedRolls=null, blessed=false**)` |
| `shared-advanced-character-gen.js` | `rollHitPoints(className, level, conMod, classData, inclL0, healthy, **blessed=false, fixedRolls=null**)` |

**Bug:** `blessed` and `fixedRolls` are in **opposite order** between basic and advanced wrappers.  
Callers in `gen-ui.js` import each with an alias (`rollHPBasic`, `rollHPAdvanced`) and call them differently — so it accidentally works, but it's a footgun.

### Recommendation
Pick one canonical order and apply it to both wrappers. Suggested: `(..., blessed=false, fixedRolls=null)` (matching advanced), since `fixedRolls` is the less commonly used override.

---

## 2. `getRacialAbilities` — completely different semantics

| File | Signature | What it does |
|------|-----------|--------------|
| `shared-basic-character-gen.js` | `getRacialAbilities(className)` | Takes a **class name** (bare, e.g. `"Elf"`), returns basic-mode racial ability text via `getBasicModeRacialAbilities` |
| `shared-advanced-character-gen.js` | `getRacialAbilities(race, raceClassMode='strict')` | Takes a **race name** (e.g. `"Human_RACE"`), returns advanced-mode ability strings via `getAdvancedModeRacialAbilities` |

These are two completely different operations behind the same name. `gen-ui.js` imports both under different aliases (`getRacialBasic`, `getRacialAdvanced`) but `cs-sheet-page.js` might encounter confusion.

### Understanding the conceptual difference

In **advanced mode**, race and class are fully separate:
- A Dwarf Cleric has *race* abilities (Dwarf abilities) **and** *class* abilities (Cleric abilities) as distinct things.
- `getRacialAbilities(race, raceClassMode)` returns **race abilities** for the race portion.

In **basic mode**, "race" and "class" are fused — Dwarf, Elf, Halfling, Gnome are classes:
- A Dwarf's "racial" abilities ARE their class abilities. There is no separate race component.
- `getRacialAbilities(className)` returns **class abilities** (that happen to be tied to race in the fiction).
- The one exception: in non-strict mode, human classes get `Blessed / Decisiveness / Leadership` from advanced-mode race abilities. These ARE race abilities being layered on top of class abilities — they just get appended inline in `gen-ui.js` rather than via `getRacialAbilities`.

### Recommendation

Rename to reflect the conceptual reality:

| Current | Proposed | Why |
|---------|----------|-----|
| `shared-basic-character-gen.js: getRacialAbilities(className)` | `getClassAbilities(className)` | In basic mode these ARE class abilities (demihuman class = race+class fused) |
| `shared-advanced-character-gen.js: getRacialAbilities(race, mode)` | `getRaceAbilities(race, mode)` | In advanced mode these are the race's abilities, distinct from class abilities |
| `shared-class-progression.js: getBasicModeRacialAbilities(className)` | `getBasicClassAbilities(className)` | Rename the internal implementation to match |

**Additional recommendation — extract the human non-strict race abilities in basic mode:**

Currently in `gen-ui.js` the Blessed/Decisiveness/Leadership abilities are manually appended inline when `hasBlessed` is true. These are logically *race abilities* (human race abilities in a non-strict mode) being bolted onto the character object after the fact.

A cleaner approach:
- Add `getHumanRaceAbilitiesBasic()` to `shared-basic-character-gen.js` that returns the human race abilities for non-strict mode (or an empty array for strict mode)
- `gen-ui.js` would call `getClassAbilities(className)` for class abilities and separately call `getHumanRaceAbilitiesBasic(raceClassMode)` for race abilities
- This makes basic mode's "class abilities" and "race abilities" two distinct (even if small) concerns, matching the mental model

This also prepares the code to render them separately on the character sheet if desired (e.g. a "Human Racial Abilities" section vs "Class Abilities" section).

---

## 3. `getClassRequirements` — different data sets

| File | Signature | Data |
|------|-----------|------|
| `shared-basic-utils.js` | `getClassRequirements(className)` | Takes **bare** class names (`"Dwarf"`, `"Elf"`), includes **racial** minimum scores (Dwarf: CON 9, Elf: INT 9, etc.) |
| `shared-advanced-utils.js` | `getClassRequirements(className)` | Takes names with or without `_CLASS`, returns **only human-playable class** requirements — racial minimums handled separately by `meetsRacialMinimums` |

Same name, different input format, different data set.

### Recommendation
| Current | Proposed |
|---------|----------|
| `shared-basic-utils.js: getClassRequirements` | Keep as-is (authoritative for basic mode) — or `getBasicClassRequirements` |
| `shared-advanced-utils.js: getClassRequirements` | Rename to `getHumanClassRequirements` (clarifies it only covers human-class ability minimums; race minimums are separate) |

---

## 4. `createCharacter` — pointless passthrough duplicate

| File | What it does |
|------|-------------|
| `shared-character.js` | **Canonical implementation** — builds the full basic-mode character object |
| `shared-basic-character-gen.js` | `return sharedCreateCharacter(options)` — pure passthrough alias with no added logic |

`shared-basic-character-gen.js` re-exports `shared-character.js`'s implementation under the same name for no reason. Callers of `shared-basic-character-gen.js` could just import from `shared-character.js` directly.

### Recommendation
Remove `createCharacter` from `shared-basic-character-gen.js`. Callers (`gen-ui.js`, `cs-sheet-page.js`) should import it from `shared-character.js` directly.

---

## 5. `getClassProgressionData` and `getClassFeatures` — consistent wrappers with options-object core

| File | Signature |
|------|-----------|
| `shared-class-progression.js` | `getClassProgressionData(options)` — canonical options-object |
| `shared-basic-character-gen.js` | `getClassProgressionData(className, level, scores, classData)` — positional wrapper |
| `shared-advanced-character-gen.js` | `getClassProgressionData(className, level, scores, classData)` — **identical** positional wrapper |

Same story for `getClassFeatures`.

The two wrappers are **functionally identical** — same signature, same delegation. Both exist purely so callers can import from the "right" gen module without knowing about `shared-class-progression.js`. This works but means the same function lives in 3 files.

### Recommendation
These are low-priority since they work correctly and don't have semantic differences. A future cleanup could:
- Remove both wrappers and have callers import `getClassProgressionData` from `shared-class-progression.js` directly, or
- Keep exactly one wrapper (e.g. in `shared-basic-character-gen.js` only) and update `shared-advanced-character-gen.js` to re-export from basic.

---

## Summary Table

| Function | Files | Issue | Priority | Fix |
|----------|-------|--------|----------|-----|
| `rollHitPoints` | basic-char-gen, advanced-char-gen | `blessed`/`fixedRolls` **parameter order is swapped** | 🔴 High — silent bug risk | Standardize to `(…, blessed=false, fixedRolls=null)` in both |
| `getRacialAbilities` | basic-char-gen, advanced-char-gen | **Completely different semantics** (class name vs race name, different return) | 🔴 High — confusion guaranteed | Rename to `getClassRacialAbilities` / `getRaceRacialAbilities` |
| `getClassRequirements` | basic-utils, advanced-utils | **Different data sets** (basic includes racial, advanced doesn't; different key formats) | 🟡 Medium | Rename advanced version to `getHumanClassRequirements` |
| `createCharacter` | shared-character, basic-char-gen | basic-char-gen is a **pointless passthrough** | 🟡 Medium | Remove from basic-char-gen; import from shared-character directly |
| `getClassProgressionData` | class-progression, basic-char-gen, advanced-char-gen | Identical wrappers in two modules, options-object core hidden | 🟢 Low | Optional: consolidate to one wrapper |
| `getClassFeatures` | class-progression, basic-char-gen, advanced-char-gen | Same as above | 🟢 Low | Optional: consolidate to one wrapper |

---

## Files affected by the high-priority fixes

### Fix 1: `rollHitPoints` parameter order
- `shared-basic-character-gen.js` — swap `fixedRolls`/`blessed` in signature
- `gen-ui.js` — update the `rollHPBasic` call site (line ~317)

### Fix 2: `getRacialAbilities` rename
- `shared-basic-character-gen.js` — rename export to `getClassRacialAbilities`
- `shared-advanced-character-gen.js` — rename export to `getRaceRacialAbilities`
- `gen-ui.js` — update import aliases (`getRacialBasic as X`, `getRacialAdvanced as Y`)
- `cs-sheet-page.js` — update any dynamic imports that reference `getRacialAbilities`

### Fix 3: `getClassRequirements` rename (advanced-utils)
- `shared-advanced-utils.js` — rename export to `getHumanClassRequirements`
- `gen-ui.js` — update import (currently imported from `shared-basic-utils.js` so may not need change)
- `shared-advanced-character-gen.js` — update internal import if it uses the advanced-utils version
