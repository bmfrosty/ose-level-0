# Function-Level Import Audit

Which exports from each shared module are used by `gen-ui.js` vs `cs-sheet-page.js`.

Legend: **G** = gen-ui.js only · **C** = cs-sheet-page.js only · **Both** = used by both · *(internal)* = not imported by either controller directly

Static imports are noted where relevant; C's dynamic imports are marked **(dyn)**.

---

## shared-ability-scores.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `calculateModifier` | | ✓ | | C **(dyn)** — G gets it via re-export from `shared-basic-utils.js` |
| `formatModifier` | | | | *(re-exported by shared-basic-utils; not imported by either controller directly)* |
| `rollAbilityScore` | | | | *(re-exported by basic/advanced-character-gen; not imported directly)* |
| `rollAbilities` | | | | *(re-exported by both shared-basic-character-gen and shared-advanced-character-gen; G imports it via shared-basic-character-gen)* |
| `rollSingleDie` | | | | *(re-exported by shared-hit-points; not imported directly)* |
| `rollDice` | | | | *(used internally by gen-0level-gen)* |
| `getPrimeRequisites` | | | | *(re-exported by shared-basic-utils and shared-advanced-utils; not imported directly)* |
| `calculateXPBonus` | | | | *(re-exported by shared-basic-utils and shared-advanced-utils; C imports via those; note: shared-class-data-shared has its own separate implementation)* |
| `meetsToughCharactersRequirements` | | | | *(re-exported by shared-basic-utils; not imported directly)* |
| `meetsPrimeRequisiteRequirements` | | | | *(re-exported by shared-basic-utils; not imported directly)* |

---

## cs-modifier-display.js

CS-only leaf module (no imports of its own). Dynamically imported by `cs-sheet-page.js`.

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `getModifierEffects` | | ✓ | | C **(dyn)** — builds ability score effects text for the sheet |

> `getModifier` was removed; `gen-race-adjustments.js` now imports the identical `calculateModifier` from `shared-ability-scores.js` directly.

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
| `calculateModifier` | | | | *(re-exported from shared-ability-scores; not imported by either controller from this module)* |
| `formatModifier` | | | | *(re-exported from shared-ability-scores; not imported by either controller from this module)* |
| `meetsToughCharactersRequirements` | | | | *(re-exported from shared-ability-scores; not imported by either controller from this module)* |
| `meetsPrimeRequisiteRequirements` | | | | *(re-exported from shared-ability-scores; not imported by either controller from this module)* |
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
| `rollAbilities` | | | | *(re-exported from shared-ability-scores; G imports it via shared-basic-character-gen instead)* |
| `applyRacialAdjustments` | | | | *(re-exported from shared-advanced-utils; not imported directly)* |
| `meetsRacialMinimums` | | | | *(re-exported from shared-advanced-utils; not imported directly)* |

---

## cs-sheet-renderer.js

CS-only leaf module (cs-* prefix). Both controllers use it but for different purposes.

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `displayCharacterSheet` | ✓ | | | G static — injects rendered HTML into DOM for inline preview |
| `renderCharacterSheetHTML` | | ✓ | | C static — returns HTML string; used inside `renderFromCompactParams` |

Each controller uses a completely different function from this module. Named `cs-*` because the full sheet rendering is character-sheet-page logic; gen-ui.js only imports it for the inline preview feature.

---

## cs-url-codec.js

CS-only leaf module (no imports of its own). Imported statically by both `cs-sheet-page.js` and `cs-sheet-renderer.js`.

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `compressToBase64Url` | | ✓ | | C static — encodes sheet state into a URL-safe Base64 string |
| `decompressFromBase64Url` | | ✓ | | C static — decodes URL-safe Base64 back to sheet state |

G does not import from `cs-url-codec.js` directly.

---

## cs-compact-codes.js

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `buildOptionsLine` | | ✓ | | C static — builds options footer line in the sheet |
| `encodeCompactParams` | | ✓ | | C **(dyn)** — modify panel and sheet-options panel apply buttons |
| `decodeCompactParams` | | ✓ | | C **(dyn)** — `initCharacterSheet` decodes URL data |
| `WEAPON_TO_CODE` / `CODE_TO_WEAPON` | | | | *(lookup tables used internally by `encodeCompactParams` / `decodeCompactParams`)* |
| `ARMOR_TO_CODE` / `CODE_TO_ARMOR` | | | | *(lookup tables used internally)* |
| `BG_TO_CODE` / `CODE_TO_BG` | | | | *(lookup tables used internally)* |
| `ITEM_TO_CODE` / `CODE_TO_ITEM` | | | | *(lookup tables used internally)* |
| `encodeStr` / `decodeStr` | | | | *(utility helpers used internally by encode/decode functions)* |
| `encodeItems` / `decodeItems` | | | | *(utility helpers used internally by encode/decode functions)* |

G does not import from `cs-compact-codes.js` directly.

---

## shared-sheet-builder.js

Encoding constants used by **both** controllers. Sheet-spec assembly and hit-die tables (`buildSheetSpec`, `CLASS_HD`, `CODE_TO_PROG`) were single-parent and have been **inlined directly into `cs-sheet-page.js`**.

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `progModeLabel` | ✓ | ✓ | ✓ | G static (mode label in generator UI); C static (subtitle/footer) |
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
| `calculateSavingThrows` | | | | *(imported by gen-0level-gen to compute 0-level saving throws)* |
| `calculateAttackBonus` | | | | *(imported by gen-0level-gen to compute 0-level attack bonuses)* |
| `RACIAL_CLASS_LEVEL_LIMITS` | | | | *(used internally by `getMaxLevel`)* |
| `savingThrowsLevel0` / `attackBonusLevel0` | | | | *(used internally by `calculateSavingThrows` / `calculateAttackBonus`)* |
| `getDwarfResilienceBonus` / `getGnomeMagicResistanceBonus` / `getHalflingResilienceBonus` | | | | *(used internally by `calculateSavingThrows`)* |

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

Both controllers use whichever progression module matches the user's selected mode. Gen-ui.js loads all three at startup; cs-sheet-page.js loads only the one needed.

---

## shared-class-data-shared.js

Both G (static `import * as ClassDataShared`) and C (dynamic `import`) use this module. The whole module is passed to `getClassFeatures`, `createCharacter`, and `createCharacterAdvanced`. C's level-up panel also destructures two exports directly. Individual exports and their consumers:

| Export | Notes |
|--------|-------|
| `CLASS_INFO` | Used by `gen-equipment.js` (imports directly to look up starting equipment) and by `shared-class-progression.js` |
| `CLASS_ABILITIES` | Used internally by `shared-class-progression.js` |
| `XP_BONUS` | Data table; used internally by `shared-class-progression.js` |
| `getClassInfo` | Used internally by `shared-class-progression.js` |
| `getClassAbilities` | Used internally by `shared-class-progression.js` |
| `getAbilitiesAtLevel` | Used internally by `shared-class-progression.js` |
| `calculateXPBonus` | Used internally by `shared-class-progression.js` (note: separate implementation from the one in `shared-ability-scores.js`) |
| `canRaceTakeClass` | Used internally only — the duplicate in `shared-racial-abilities.js` (different signature) was deleted as a dead export |
| `meetsRequirements` | Used internally |
| `HIT_DICE_PROGRESSIONS` | Used by `shared-class-progression.js`; also destructured directly by C's level-up panel |
| `HIT_DICE_SCALE` | Used by `shared-class-progression.js`; also destructured directly by C's level-up panel |
| `ARCANE_SPELL_SLOTS` / `DIVINE_SPELL_SLOTS` / `SPELL_SLOT_SCALE` | Used internally by `shared-class-progression.js` |
| `THIEF_SKILLS` / `TURN_UNDEAD` / `XP_REQUIREMENTS` | Used internally by `shared-class-data-ose.js` and `shared-class-data-gygar.js` |

---

## cs-sheet-page.js

`cs-sheet-page.js` is the entry-point module for `charactersheet.html`. It imports `expandCompactV2` which is used by gen-ui.js. It is the module being audited as "C" throughout this document.

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `expandCompactV2` | ✓ | | | G static — converts a cp object into a full sheet spec; G uses this instead of calling `buildSheetSpec` directly |
| `compressToBase64Url` | | | | *(used internally by the edit/level-up panels inside cs-sheet-page.js)* |
| `renderFromCompactParams` | | | | *(entry point used by charactersheet.html; not imported by gen-ui.js)* |
| `initCharacterSheet` | | | | *(called by the `<script>` in charactersheet.html; not imported by gen-ui.js)* |

---

## gen-0level-gen.js

Generator-only module (prefix `gen-`). Neither cs-sheet-page.js nor any shared-* module imports from it.

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `generateZeroLevelCharacter` | ✓ | | | G static — async 0-level character generation |
| `RACE_TO_CODE` | | | | *(used internally; not imported by either controller)* |

---

## gen-backgrounds.js

Generator-only module. Used by gen-ui.js and internally by gen-0level-gen.js.

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `getRandomBackground` | ✓ | | | G static — picks a random background for generated characters |
| `getAllBackgroundTables` | ✓ | | | G static — populates the 0-level occupation dropdown |
| `getBackgroundByProfession` | | | | *(used internally by gen-0level-gen)* |
| `getBackgroundByIndex` | | | | *(not imported by either controller)* |
| `getBackgroundTable` | | | | *(not imported by either controller)* |

---

## gen-equipment.js

Generator-only module. Imports from `shared-weapons-and-armor.js` and `shared-class-data-shared.js`.

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `purchaseEquipment` | ✓ | | | G static — buys starting gear for the generated character |
| `DUNGEONEERING_BUNDLE` | | | | *(used internally; not imported by G or C)* |
| `CLASS_SPECIFIC_GEAR` | | | | *(not imported by either controller; used internally)* |
| `WEAPON_PRIORITY` | | | | *(not imported by either controller; used internally)* |
| `ARMOR_PRIORITY` | | | | *(not imported by either controller; used internally)* |

---

## gen-names.js

Generator-only module.

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `getRandomName` | ✓ | | | G static — picks a random name for the character and the random-name button |
| `getNameTable` | | | | *(not imported by either controller)* |
| `getAvailableRaces` | | | | *(not imported by either controller)* |

`getRandomName` is also used internally by gen-0level-gen.js.

---

## gen-race-adjustments.js

Generator-only module. Used internally by gen-0level-gen.js; neither controller imports it directly.

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `applyRaceAdjustments` | | | | *(used internally by gen-0level-gen)* |
| `meetsRaceMinimums` | | | | *(used internally by gen-0level-gen)* |
| `getRaceAdjustments` | | | | *(used internally by gen-0level-gen)* |
| `getRaceMinimums` | | | | *(used internally by gen-0level-gen)* |
| `RACE_ADJUSTMENTS` | | | | *(data table; not imported by either controller)* |
| `RACE_MINIMUMS` | | | | *(data table; not imported by either controller)* |

---

## shared-weapons-and-armor.js

Leaf module (no imports of its own). Neither controller imports it directly.

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `WEAPONS` | | | | *(imported by gen-equipment.js and cs-sheet-renderer.js internally)* |
| `ARMOR` | | | | *(imported by gen-equipment.js internally)* |
| `ADVENTURING_GEAR` | | | | *(imported by gen-equipment.js internally)* |
| `AMMUNITION` | | | | *(data table; not currently imported by any controller or gen-* module)* |
| `WEAPON_QUALITIES` | | | | *(data table; not currently imported by any controller or gen-* module)* |
| `getAllWeaponNames` / `getAllArmorNames` / etc. | | | | *(utility fns; not currently imported by any controller)* |

---

## shared-class-progression.js

Internal module. Neither controller imports from it directly — it is used inside `shared-basic-character-gen.js` and `shared-advanced-character-gen.js`.

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `getClassProgressionData` | | | | *(used internally by basic/advanced-character-gen; controllers call those wrappers instead)* |
| `getClassFeatures` | | | | *(used internally by basic/advanced-character-gen)* |
| `getBasicModeRacialAbilities` | | | | *(used internally by shared-basic-character-gen)* |

---

## shared-race-names.js

Leaf module (no imports of its own). Neither controller imports it directly.

| Export | G | C | Both | Notes |
|--------|:-:|:-:|:----:|-------|
| `LEGACY_RACE_NAMES` | | | | *(used internally by shared-racial-abilities.js and gen-race-adjustments.js)* |
| `normalizeRaceName` | | | | *(used internally by shared-racial-abilities.js and gen-race-adjustments.js)* |

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
| `cs-sheet-renderer.js` — two separate render functions, each used by only one controller | Clean separation: `displayCharacterSheet` = G (inline preview), `renderCharacterSheetHTML` = C (full page) |
| All dice-rolling (`rollAbilities`, `rollAbilitiesAdvanced`, `rollHitPoints`) is G-only | C never rolls dice — it only renders from already-saved compact params |
| Encoding constants (`PROG_CODE`, `CLS_CODE`, `RACE_CODE`, `RCM_CODE`) are G-only (in shared-sheet-builder.js); decoding (`CODE_TO_PROG`) is C-only (inlined in cs-sheet-page.js) | Intentional: G builds cp objects for the URL, C decodes them from the URL |
| `buildSheetSpec`, `CLASS_HD`, `CODE_TO_PROG` inlined directly into cs-sheet-page.js (single-parent — only C ever used them) | Eliminated cs-sheet-builder.js as a separate file |
| `saveSettings`/`loadSettings`/`clearSettings` inlined into gen-ui.js (single-parent) | Eliminated gen-settings.js as a separate file |
| `getModifier` removed from cs-modifier-display.js | gen-race-adjustments.js now imports `calculateModifier` (identical logic) from shared-ability-scores.js |
| `encodeCompactParams` / `decodeCompactParams` are C-only | G builds raw cp objects and passes them through `expandCompactV2`; no re-encoding needed |
| DOM-reading helpers (`readAbilityScores`, `getClassRequirements`, `getDemihumanLimits`) are G-only | C has no form inputs — it reads entirely from compact URL params |
| C imports `calculateModifier` and `getModifierEffects` directly, bypassing the utils wrappers | These are leaf modules; C skips the re-export chain for clarity |
| All four class-data modules are used by both | G loads all three prog-mode modules at startup; C loads one dynamically on demand |
