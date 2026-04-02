# Function-Level Import Audit

Which exports from each shared module are used by `gen-ui.js` vs `cs-charactersheet.js`.

Legend: **G** = gen-ui.js only · **C** = cs-charactersheet.js only · **Both** = used by both · *(internal)* = not imported by either controller directly

Static imports are noted where relevant; C's dynamic imports are marked **(dyn)**.

---

## shared-ability-scores.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `calculateModifier` | | ✓ | | C **(dyn)** — G gets it via re-export from `shared-basic-utils.js` |
| `formatModifier` | | | | *(re-exported by shared-basic-utils; not imported by either controller directly)* |
| `rollAbilityScore` | | | | *(re-exported by basic/advanced-character-gen; not imported directly)* |
| `rollAbilities` | | | | *(re-exported by shared-basic-character-gen; not imported directly)* |
| `rollSingleDie` | | | | *(re-exported by shared-hit-points; not imported directly)* |
| `rollDice` | | | | *(used internally by gen-0level-gen)* |
| `getPrimeRequisites` | | | | *(re-exported by shared-basic-utils and shared-advanced-utils; not imported directly)* |
| `calculateXPBonus` | | | | *(re-exported by shared-class-data-shared; not imported directly)* |
| `meetsToughCharactersRequirements` | | | | *(re-exported by shared-basic-utils; not imported directly)* |
| `meetsPrimeRequisiteRequirements` | | | | *(re-exported by shared-basic-utils; not imported directly)* |

---

## shared-modifier-effects.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `getModifierEffects` | | ✓ | | C **(dyn)** — builds ability score effects for the sheet |
| `getModifier` | | | | *(used internally by gen-race-adjustments.js)* |

G does not import from `shared-modifier-effects.js` directly.

---

## shared-basic-utils.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `calculateModifier` | ✓ | | | G static; C imports the same fn from `shared-ability-scores.js` directly |
| `formatModifier` | ✓ | | | G static |
| `getPrimeRequisites` | ✓ | ✓ | ✓ | G static; C **(dyn)** when `!isAdv` |
| `calculateXPBonus` | | ✓ | | C **(dyn)** when `!isAdv` |
| `readAbilityScores` | ✓ | | | G static (reads DOM `<input>` fields — UI only) |
| `getClassRequirements` | ✓ | | | G static; used in both basic and advanced generation paths |
| `getDemihumanLimits` | ✓ | | | G static |
| `meetsToughCharactersRequirements` | | | | *(re-exported from shared-ability-scores; not imported by either controller)* |
| `meetsPrimeRequisiteRequirements` | | | | *(re-exported from shared-ability-scores; not imported by either controller)* |

> `getMinimumScores`, `getHitDiceSize`, `getClassPrimeRequisites`, `meetsClassPrimeRequisites` moved to **legacy-utils.js**.

---

## shared-advanced-utils.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `getRaceDisplayName` | ✓ | ✓ | ✓ | G static; C **(dyn)** when `isAdv` |
| `getClassDisplayName` | ✓ | ✓ | ✓ | G static; C **(dyn)** when `isAdv` |
| `getAvailableClasses` | ✓ | | | G static; drives race/class grid enable/disable |
| `applyRacialAdjustments` | ✓ | | | G static; applied during generation (advanced mode) |
| `calculateXPBonus` | | ✓ | | C **(dyn)** when `isAdv` |
| `getPrimeRequisites` | | ✓ | | C **(dyn)** when `isAdv`; G uses the same-named fn from shared-basic-utils |
| `getRacialAdjustments` | | | | *(used internally by `applyRacialAdjustments`)* |
| `getRacialMinimums` | | | | *(used internally by `meetsRacialMinimums`)* |
| `meetsRacialMinimums` | | | | *(used internally by `shared-advanced-character-gen.js`)* |
| `getClassRequirements` | | | | *(used internally by `shared-advanced-character-gen.js`; not imported by either controller)* |

> `readAbilityScores`, `getMinimumScores`, `getHitDiceSize` removed — DOM-reader duplicates of shared-basic-utils.js versions.

---

## shared-basic-character-gen.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `createCharacter` | ✓ | ✓ | ✓ | G static; C **(dyn)** (basic L1+ path) |
| `getClassProgressionData` | ✓ | ✓ | ✓ | G static; C **(dyn)** (basic L1+ path) |
| `getClassFeatures` | ✓ | ✓ | ✓ | G static; C **(dyn)** (basic L1+ path) |
| `getRacialAbilities` | ✓ | ✓ | ✓ | G static; C **(dyn)** (basic L1+ path) |
| `rollAbilities` | ✓ | | | G static — random roll, generation only |
| `rollHitPoints` | ✓ | | | G static — random roll, generation only |
| `rollAbilityScore` | | | | *(re-exported from shared-ability-scores; not imported directly)* |
| `rollSingleDie` | | | | *(re-exported from shared-hit-points; not imported directly)* |
| `parseHitDice` | | | | *(re-exported from shared-hit-points; not imported directly)* |

---

## shared-advanced-character-gen.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `createCharacterAdvanced` | ✓ | ✓ | ✓ | G static; C **(dyn)** (advanced L1+ path) |
| `rollAbilitiesAdvanced` | ✓ | | | G static — random roll, generation only |
| `getRacialAbilities` | ✓ | | | G static — used for Blessed detection; C gets this inside `createCharacterAdvanced` |
| `rollHitPoints` | ✓ | | | G static — random roll, generation only |
| `getClassProgressionData` | ✓ | | | G static; C gets this inside `createCharacterAdvanced` |
| `getClassFeatures` | | | | *(not imported by either controller directly)* |
| `rollAbilityScore` | | | | *(re-exported from shared-ability-scores; not imported directly)* |
| `rollSingleDie` | | | | *(re-exported from shared-hit-points; not imported directly)* |
| `parseHitDice` | | | | *(re-exported from shared-hit-points; not imported directly)* |
| `applyRacialAdjustments` | | | | *(re-exported from shared-advanced-utils; not imported directly)* |
| `meetsRacialMinimums` | | | | *(re-exported from shared-advanced-utils; not imported directly)* |

---

## shared-character-sheet.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `displayCharacterSheet` | ✓ | | | G static — injects rendered HTML into DOM for inline preview |
| `renderCharacterSheetHTML` | | ✓ | | C static — returns HTML string; used inside `renderFromCompactParams` |

Each controller uses a completely different function from this module.

---

## cs-compact-codes.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `buildOptionsLine` | | ✓ | | C static — builds options footer line in the sheet |
| `encodeCompactParams` | | ✓ | | C **(dyn)** — modify panel and sheet-options panel apply buttons |
| `decodeCompactParams` | | ✓ | | C **(dyn)** — `initCharacterSheet` decodes URL data |
| all lookup tables / helpers | | | | *(internal implementation details)* |

G does not import from `cs-compact-codes.js` directly.

---

## shared-sheet-builder.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `progModeLabel` | ✓ | ✓ | ✓ | G static (used in `generateBasicCharacter` for `createCharacter` `mode:` arg); C static (subtitle/footer) |
| `buildSheetSpec` | | ✓ | | C static — assembles final sheet spec; G calls it indirectly via `expandCompactV2` |
| `CLASS_HD_CODES` (imported as `CLASS_HD`) | | ✓ | | C static — HD sides lookup for level-up reroll |
| `CLASS_HD` | | ✓ | | C static — same data, second export name |
| `CODE_TO_PROG` | | ✓ | | C static — decodes prog code back to key |
| `PROG_CODE` | ✓ | | | G static — encodes prog key → code for cp object |
| `CLS_CODE` | ✓ | | | G static — encodes class name → code for cp object |
| `RACE_CODE` | ✓ | | | G static — encodes race name → code for cp object |
| `RCM_CODE` | ✓ | | | G static — encodes raceClassMode → code for cp object |

> `sanitize` moved to **legacy-utils.js**.

---

## shared-racial-abilities.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `getAdvancedModeRacialAbilities` | ✓ | ✓ | ✓ | G static (0-level display); C **(dyn)** (level-0 sheet path) |
| `getMaxLevel` | ✓ | | | G static — caps level selector for race/class combos |
| `calculateSavingThrows` | | | | *(used internally by character gen)* |
| `calculateAttackBonus` | | | | *(used internally by character gen)* |
| `RACIAL_CLASS_LEVEL_LIMITS` | | | | *(used internally)* |
| `canRaceTakeClass` | | | | *(used internally by gen-0level-gen)* |
| `savingThrowsLevel0` / `attackBonusLevel0` | | | | *(used internally by gen-0level-gen)* |
| `getDwarfResilienceBonus` / etc. | | | | *(used internally)* |

> `getCommonDemihumanAbilities` moved to **legacy-utils.js**.

---

## shared-character.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `rollStartingGold` | ✓ | | | G static — random gold roll at L1, generation only |
| `calcStartingGold` | ✓ | | | G static — gold from XP% for L2+, generation only |
| `createCharacter` | | | | *(used internally by shared-basic-character-gen)* |

---

## shared-hit-points.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `parseHitDice` | | ✓ | | C **(dyn)** — level-up panel HP rolling |
| `rollSingleDie` | | | | *(used internally by character gen)* |
| `rollHitPoints` | | | | *(used internally by character gen)* |

G does not directly import from `shared-hit-points.js` — HP rolling goes through `shared-basic-character-gen` / `shared-advanced-character-gen`.

---

## shared-class-data-ose.js / shared-class-data-gygar.js / shared-class-data-ll.js

| Who | How | What |
|-----|-----|-------|
| G | `import * as ClassDataOSE` / `ClassDataGygar` / `ClassDataLL` (static, all three) | Entire module passed as `classData` arg to char gen functions |
| C | `await import(prog === 'll' ? … : prog === 'ose' ? … : …)` **(dyn, one-of)** | Same — entire module passed to `createCharacter` / `createCharacterAdvanced` |

Both controllers use whichever progression module matches the user's selected mode. Gen-ui.js loads all three at startup; cs-charactersheet.js loads only the one needed.

---

## shared-class-data-shared.js

| Who | How | What |
|-----|-----|-------|
| G | `import * as ClassDataShared` (static) | Passed to `getClassFeatures(…, ClassDataShared)` |
| C | `await import('./shared-class-data-shared.js')` **(dyn)** | Passed to `createCharacter` / `createCharacterAdvanced`; also `HIT_DICE_PROGRESSIONS` + `HIT_DICE_SCALE` in level-up panel |

Both controllers use the shared class tables. The level-up panel in C also directly uses `HIT_DICE_PROGRESSIONS` and `HIT_DICE_SCALE` to determine hit dice for rolled HP.

---

## legacy-utils.js

Archive of orphaned exports — nothing currently imports from this module. Preserved for potential future use or external consumers.

| Export | Notes |
|--------|-------|
| `getMinimumScores` | DOM form reader — identical to `readAbilityScores`; use that instead |
| `getHitDiceSize` | Hardcoded HD lookup (basic mode, bare class names) |
| `getClassPrimeRequisites` | Hardcoded prime-req lookup (bare class names) |
| `meetsClassPrimeRequisites` | Validates scores against prime-req minimum; uses `getClassPrimeRequisites` above |
| `getCommonDemihumanAbilities` | Returns shared demihuman ability description string |
| `sanitize` | Filename-safe string replacement |

---

## Summary

| Finding | Notes |
|---------|-------|
| `shared-character-sheet.js` — two separate render functions, each used by only one controller | Clean separation: `displayCharacterSheet` = G (inline preview), `renderCharacterSheetHTML` = C (full page) |
| All dice-rolling (`rollAbilities`, `rollAbilitiesAdvanced`, `rollHitPoints`) is G-only | C never rolls dice — it only renders from already-saved compact params |
| Encoding constants (`PROG_CODE`, `CLS_CODE`, `RACE_CODE`, `RCM_CODE`) are G-only; decoding (`CODE_TO_PROG`) is C-only | Intentional: G builds cp objects for the URL, C decodes them from the URL |
| `encodeCompactParams` / `decodeCompactParams` are C-only | G builds raw cp objects and passes them through `expandCompactV2`; no re-encoding needed |
| DOM-reading helpers (`readAbilityScores`, `getClassRequirements`, `getDemihumanLimits`) are G-only | C has no form inputs — it reads entirely from compact URL params |
| C imports `calculateModifier` and `getModifierEffects` directly, bypassing the utils wrappers | These are leaf modules; C skips the re-export chain for clarity |
| All four class-data modules are used by both | G loads all three prog-mode modules at startup; C loads one dynamically on demand |
