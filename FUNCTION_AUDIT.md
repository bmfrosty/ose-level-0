# Function-Level Import Audit

Which exports from each shared module are used by `gen-ui.js` vs `cs-charactersheet.js`.

Legend: **G** = gen-ui.js only · **C** = cs-charactersheet.js only · **Both** = used by both · *(internal)* = not imported by either controller directly

---

## shared-basic-utils.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `calculateModifier` | ✓ | | | G imports from here; C imports the same fn from `shared-ability-scores.js` directly |
| `formatModifier` | ✓ | | | |
| `getPrimeRequisites` | ✓ | ✓ | ✓ | |
| `calculateXPBonus` | | ✓ | | |
| `readAbilityScores` | ✓ | | | reads DOM `<input>` fields — UI only |
| `getClassRequirements` | ✓ | | | UI display |
| `getDemihumanLimits` | ✓ | | | UI display |
| `meetsToughCharactersRequirements` | | | | *(re-exported from shared-ability-scores)* |
| `meetsPrimeRequisiteRequirements` | | | | *(re-exported from shared-ability-scores)* |

> `getMinimumScores`, `getHitDiceSize`, `getClassPrimeRequisites`, `meetsClassPrimeRequisites` moved to **legacy-utils.js**.

---

## shared-advanced-utils.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `getRaceDisplayName` | ✓ | ✓ | ✓ | |
| `getClassDisplayName` | ✓ | ✓ | ✓ | |
| `getAvailableClasses` | ✓ | | | drives class picker UI |
| `applyRacialAdjustments` | ✓ | | | applied during generation |
| `calculateXPBonus` | | ✓ | | C uses when `isAdv` |
| `getPrimeRequisites` | | ✓ | | C uses when `isAdv` |
| `getRacialAdjustments` | | | | *(used internally by `applyRacialAdjustments`)* |
| `getRacialMinimums` | | | | *(used internally by `meetsRacialMinimums`)* |
| `meetsRacialMinimums` | | | | *(used internally by advanced-character-gen)* |
| `getClassRequirements` | | | | *(used internally by `shared-advanced-character-gen.js`; not imported by either controller)* |

> `readAbilityScores`, `getMinimumScores`, `getHitDiceSize` removed — DOM-reader duplicates identical to shared-basic-utils.js versions.

---

## shared-basic-character-gen.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `createCharacter` | ✓ | ✓ | ✓ | |
| `getClassProgressionData` | ✓ | ✓ | ✓ | |
| `getClassFeatures` | ✓ | ✓ | ✓ | |
| `getRacialAbilities` | ✓ | ✓ | ✓ | |
| `rollAbilities` | ✓ | | | random roll — generation only |
| `rollHitPoints` | ✓ | | | random roll — generation only |
| `rollAbilityScore` | | | | *(re-exported from shared-ability-scores)* |
| `rollSingleDie` | | | | *(re-exported from shared-hit-points)* |
| `parseHitDice` | | | | *(re-exported from shared-hit-points)* |

---

## shared-advanced-character-gen.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `createCharacterAdvanced` | ✓ | ✓ | ✓ | |
| `rollAbilitiesAdvanced` | ✓ | | | random roll — generation only |
| `getRacialAbilities` | ✓ | | | G uses adv version; C gets it via `createCharacterAdvanced` internally |
| `rollHitPoints` | ✓ | | | random roll — generation only |
| `getClassProgressionData` | ✓ | | | C gets this via `createCharacterAdvanced` internally |
| `getClassFeatures` | | | | *(not imported by either controller)* |
| `rollAbilityScore` | | | | *(re-exported from shared-ability-scores)* |
| `rollSingleDie` | | | | *(re-exported from shared-hit-points)* |
| `parseHitDice` | | | | *(re-exported from shared-hit-points)* |
| `applyRacialAdjustments` | | | | *(re-exported from advanced-utils)* |
| `meetsRacialMinimums` | | | | *(re-exported from advanced-utils)* |

---

## shared-character-sheet.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `displayCharacterSheet` | ✓ | | | DOM injection for inline preview |
| `renderCharacterSheetHTML` | | ✓ | | returns HTML string — sheet page |

Each controller uses a completely different function from this module.

---

## cs-compact-codes.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `buildOptionsLine` | | ✓ | | C static import |
| `encodeCompactParams` | | ✓ | | C dynamic import — level-up / modify panels |
| `decodeCompactParams` | | ✓ | | C dynamic import — loading from URL |
| all lookup tables / helpers | | | | *(internal implementation details)* |

G does not directly import from `cs-compact-codes.js`.

---

## shared-sheet-builder.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `progModeLabel` | ✓ | ✓ | ✓ | |
| `buildSheetSpec` | | ✓ | | C static; G calls it indirectly via `expandCompactV2` |
| `CLASS_HD` / `CLASS_HD_CODES` | | ✓ | | C static; same table, two export names |
| `CODE_TO_PROG` | | ✓ | | code→name decoding |
| `PROG_CODE` | ✓ | | | name→code encoding (building cp objects) |
| `CLS_CODE` | ✓ | | | name→code encoding |
| `RACE_CODE` | ✓ | | | name→code encoding |
| `RCM_CODE` | ✓ | | | name→code encoding |

> `sanitize` moved to **legacy-utils.js**.

---

## shared-racial-abilities.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `getAdvancedModeRacialAbilities` | ✓ | ✓ | ✓ | |
| `getMaxLevel` | ✓ | | | caps level selector UI |
| `calculateSavingThrows` | | | | *(used internally by character gen)* |
| `calculateAttackBonus` | | | | *(used internally by character gen)* |
| `RACIAL_CLASS_LEVEL_LIMITS` | | | | *(used internally)* |
| `canRaceTakeClass` | | | | *(used internally by gen-0level-gen)* |
| `savingThrowsLevel0` / `attackBonusLevel0` | | | | *(used internally)* |
| `getDwarfResilienceBonus` / etc. | | | | *(used internally)* |

> `getCommonDemihumanAbilities` moved to **legacy-utils.js**.

---

## shared-character.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `rollStartingGold` | ✓ | | | dice roll — generation only |
| `calcStartingGold` | ✓ | | | gold from XP table — generation only |
| `createCharacter` | | | | *(used internally by shared-basic-character-gen)* |

---

## shared-hit-points.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `parseHitDice` | | ✓ | | C dynamic import — level-up panels |
| `rollSingleDie` | | | | *(used internally by character gen)* |
| `rollHitPoints` | | | | *(used internally by character gen)* |

G does not directly import from `shared-hit-points.js` — HP rolling goes through `basic/advanced-character-gen`.

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
| `shared-character-sheet.js` — two separate render functions, each used by only one controller | Clean separation: `displayCharacterSheet` = generator, `renderCharacterSheetHTML` = charactersheet |
| All dice-rolling (`rollAbilities`, `rollAbilitiesAdvanced`, `rollHitPoints`) is G-only | C never rolls dice — it only renders from saved compact params |
| Encoding constants (`PROG_CODE`, `CLS_CODE`, `RACE_CODE`, `RCM_CODE`) are G-only; decoding (`CODE_TO_PROG`) is C-only | Intentional: G builds cp objects, C decodes from URL |
| `encodeCompactParams` / `decodeCompactParams` are C-only | G builds raw cp objects and passes them to `expandCompactV2` |
| DOM-reading helpers (`readAbilityScores`, `getClassRequirements`, `getDemihumanLimits`) are G-only | Makes sense — C has no form inputs |
