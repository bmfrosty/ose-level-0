# Function-Level Import Audit

Which exports from each shared module are used by `gen-ui.js` vs `cs-sheet-page.js`.

Legend: **G** = gen-ui.js only · **C** = cs-sheet-page.js only · **Both** = used by both · *(internal)* = not imported by either controller directly

Static imports are noted; C's dynamic imports are marked **(dyn)**.

**Import routing:** Neither controller imports `shared-core.js` directly.
- `gen-ui.js` imports everything from `gen-core.js` (which re-exports `shared-core.js` via `export *`)
- `cs-sheet-page.js` imports everything from `cs-core.js` (which re-exports `shared-core.js` via `export *`)

---

## shared-core.js

Single source of truth for all shared data and logic. Inlines the content of all former shared
modules and data files. Neither controller imports this module directly.

### Ability score math

| Export | G | C | Notes |
|--------|:-:|:-:|-------|
| `calculateModifier` | ✓ | ✓ | G via `gen-core.js`; C **(dyn)** via `cs-core.js` |
| `formatModifier` | ✓ | | G via `gen-core.js` |
| `calculateXPBonus` | ✓ | ✓ | G via `gen-core.js`; C **(dyn)** via `cs-core.js` |
| `meetsToughCharactersRequirements` | ✓ | | G via `gen-core.js` |
| `meetsPrimeRequisiteRequirements` | ✓ | | G via `gen-core.js` |
| `rollSingleDie` | | | *(internal)* |
| `rollDice` | | | *(internal)* |
| `rollAbilityScore` | | | *(internal — `rollAbilities`)* |
| `rollAbilities` | ✓ | | G via `gen-core.js` |

### Class data

| Export | G | C | Notes |
|--------|:-:|:-:|-------|
| `CLASS_INFO` | ✓ | ✓ | G via `gen-core.js`; C **(dyn)** via `cs-core.js` |
| `getClassInfo` | | | *(internal)* |
| `getPrimeRequisites` | ✓ | ✓ | G via `gen-core.js`; C **(dyn)** — derived from `CLASS_INFO[base].primeRequisite` |
| `getClassAbilities` | | | *(internal)* |
| `getAbilitiesAtLevel` | | | *(internal)* |
| `canRaceTakeClass` | | | *(internal)* |
| `meetsRequirements` | | | *(internal)* |
| `HIT_DICE_PROGRESSIONS` | | ✓ | C **(dyn)** — level-up HP roller |
| `HIT_DICE_SCALE` | | ✓ | C **(dyn)** — level-up HP roller |
| `ARCANE_SPELL_SLOTS` / `DIVINE_SPELL_SLOTS` / `SPELL_SLOT_SCALE` | | | *(internal — progression tables)* |
| `THIEF_SKILLS` / `TURN_UNDEAD` / `XP_REQUIREMENTS` | | | *(internal — progression tables)* |
| `getClassProgressionData` | ✓ | ✓ | G via `gen-core.js` (imported twice as `getProgBasic` / `getProgAdvanced`); C **(dyn)** |
| `getClassFeatures` | ✓ | ✓ | G via `gen-core.js`; C **(dyn)** |
| `getBasicModeClassAbilities` | ✓ | ✓ | G via `gen-core.js` (as `getRacialBasic`); C **(dyn)** |
| `getMaxLevel` | ✓ | | G via `gen-core.js` |

### Race data

| Export | G | C | Notes |
|--------|:-:|:-:|-------|
| `RACE_INFO` | | | *(internal)* |
| `getRaceInfo` | ✓ | ✓ | G via `gen-core.js`; C **(dyn)** |
| `getRaceAbilitiesAtLevel` | | | *(internal — gen-core.js)* |
| `getAdvancedModeRacialAbilities` | ✓ | ✓ | G via `gen-core.js`; C **(dyn)** |
| `applyRacialSaveModifiers` | ✓ | | G via `gen-core.js` |
| `applyRacialAbilityModifiers` | | | *(internal — gen-core.js, results-array form)* |
| `meetsRacialMinimums` | | | *(internal — gen-core.js)* |
| `calculateSavingThrows` | | | *(internal — gen-core.js)* |
| `calculateAttackBonus` | | | *(internal — gen-core.js)* |
| `savingThrowsLevel0` / `attackBonusLevel0` | | | *(internal)* |
| `resolveFormula` | | | *(internal)* |
| `getRaceDisplayName` | ✓ | ✓ | G via `gen-core.js`; C **(dyn)** |
| `getClassDisplayName` | ✓ | ✓ | G via `gen-core.js`; C **(dyn)** |
| `applyRacialAdjustments` | ✓ | | G via `gen-core.js` (as `_applyRacialAdj`) |
| `checkRacialMinimums` | ✓ | | G via `gen-core.js` (as `_meetsRacialMins`) |
| `getAvailableClasses` | ✓ | | G via `gen-core.js` |
| `getClassRequirements` | ✓ | | G via `gen-core.js` (as `_getClassReqs`) — Advanced mode |

### HP, gold, character creation

| Export | G | C | Notes |
|--------|:-:|:-:|-------|
| `parseHitDice` | | ✓ | C **(dyn)** — level-up HP rolling panel |
| `rollHitPoints` | ✓ | | G via `gen-core.js` (imported twice as `rollHPBasic` / `rollHPAdvanced`) |
| `rollStartingGold` | ✓ | | G via `gen-core.js` — gen-only |
| `calcStartingGold` | ✓ | | G via `gen-core.js` — gen-only |
| `createCharacter` | ✓ | ✓ | G via `gen-core.js`; C **(dyn)** |

### Weapons and armor

| Export | G | C | Notes |
|--------|:-:|:-:|-------|
| `WEAPONS` | ✓ | ✓ | G via `gen-core.js` (equipment purchasing); C via `cs-core.js` (sheet renderer) |
| `ARMOR` | ✓ | | G via `gen-core.js` (equipment purchasing) |
| `ADVENTURING_GEAR` | ✓ | | G via `gen-core.js` (equipment purchasing) |
| `AMMUNITION` / `WEAPON_QUALITIES` / helper fns | | | *(not imported by either controller directly)* |

### Sheet builder encoding constants

| Export | G | C | Notes |
|--------|:-:|:-:|-------|
| `PROG_CODE` | ✓ | | G via `gen-core.js` — prog key → compact code |
| `CLS_CODE` | ✓ | | G via `gen-core.js` — class name → compact code (derived from `CLASS_INFO[c].code`) |
| `RACE_CODE` | ✓ | | G via `gen-core.js` — race name → compact code (derived from `RACE_INFO[race].code`) |
| `RCM_CODE` | ✓ | | G via `gen-core.js` — raceClassMode → compact code |
| `progModeLabel` | ✓ | ✓ | G via `gen-core.js`; C via `cs-core.js` — human-readable mode label |

### Class progression tables

| Export | G | C | Notes |
|--------|:-:|:-:|-------|
| `PROGRESSION_TABLES` | ✓ | ✓ | G via `gen-core.js`; C **(dyn)** via `cs-core.js` — `classData = PROGRESSION_TABLES[prog]` |
| `getXPRequired` / `getHitDice` / `getThiefSkills` / `getTurnUndead` / `getLevelFromXP` / `getXPToNextLevel` | | | *(internal — consumed via PROGRESSION_TABLES)* |

`PROGRESSION_TABLES[mode]` members (accessed via `classData = PROGRESSION_TABLES[prog]`):

| Member | G | C | Notes |
|--------|:-:|:-:|-------|
| `getAttackBonus` | ✓ | ✓ | Mode-specific factory fn |
| `getSavingThrows` | ✓ | ✓ | Mode-specific factory fn |
| `getSpellSlots` | ✓ | ✓ | Mode-specific; Gygar has no level cap; OSE/LL cap Spellblade at 10 |
| `getHitDice` / `getXPRequired` / `getThiefSkills` / `getTurnUndead` / `getLevelFromXP` / `getXPToNextLevel` | ✓ | ✓ | Shared fns, bound per mode |
| `ATTACK_BONUS_PROGRESSIONS` / `ATTACK_BONUS_SCALE` | | ✓ | C **(dyn)** — level-up panel |
| `SAVING_THROWS` | | ✓ | C **(dyn)** — level-up panel |

---

## cs-core.js

All cs-only rendering and codec logic. Re-exports `shared-core.js` so `cs-sheet-page.js` imports
from a single module. Inlines `cs-sheet-renderer.js`, `cs-compact-codes.js`, `cs-url-codec.js`,
and `cs-modifier-display.js`.

| Export | G | C | Notes |
|--------|:-:|:-:|-------|
| `compressToBase64Url` | | ✓ | C static — URL encoding |
| `decompressFromBase64Url` | | ✓ | C static — URL decoding |
| `encodeCompactParams` | | ✓ | C **(dyn)** — modify panel, sheet-options panel, level-up panel |
| `decodeCompactParams` | | ✓ | C **(dyn)** — `initCharacterSheet` decodes URL data |
| `buildOptionsLine` | | ✓ | C static — builds the options compact string |
| `renderCharacterSheetHTML` | | ✓ | C static — returns HTML string for full character sheet page |
| `displayCharacterSheet` | | ✓ | C static re-export → re-exported by `cs-sheet-page.js` for G to use; G does not import this module directly |
| `getModifierEffects` | | ✓ | C **(dyn)** — ability score modifier descriptions |
| *(all shared-core.js exports)* | — | — | Re-exported via `export * from './shared-core.js'` |

---

## gen-core.js

All gen-only logic: DOM helpers, equipment purchasing, name/bg tables, and unified character
generator (Basic + Advanced, levels 0–14). Re-exports `shared-core.js` so `gen-ui.js` imports
from a single module.

| Export | G | C | Notes |
|--------|:-:|:-:|-------|
| `readAbilityScores` | ✓ | | G static (as `readScoresFromInputs`) — DOM reader |
| `getClassRequirements` | ✓ | | G static — Basic mode: reads `CLASS_INFO[c].requirements` |
| `getDemihumanLimits` | ✓ | | G static — reads `CLASS_INFO[c].maxLevel` |
| `purchaseEquipment` | ✓ | | G static |
| `DUNGEONEERING_BUNDLE` / `CLASS_SPECIFIC_GEAR` / `WEAPON_PRIORITY` / `ARMOR_PRIORITY` | | | *(internal)* |
| `getRandomName` | ✓ | | G static |
| `getNameTable` | | | *(not imported by either controller)* |
| `getAvailableRaces` | | | *(not imported by either controller)* |
| `getRandomBackground` | ✓ | | G static |
| `getBackgroundByIndex` | | | *(not imported by either controller)* |
| `getBackgroundTable` | | | *(not imported by either controller)* |
| `getAllBackgroundTables` | ✓ | | G static — populates occupation dropdown |
| `getBackgroundByProfession` | | | *(internal — used by `generateCharacter`)* |
| `generateCharacter` | | | *(not imported directly — invoked via `generateZeroLevelCharacter`)* |
| `generateZeroLevelCharacter` | ✓ | | G static — 0-level character generation for both modes |
| *(all shared-core.js exports)* | — | — | Re-exported via `export * from './shared-core.js'` |

---

## cs-sheet-page.js

| Export | G | C | Notes |
|--------|:-:|:-:|-------|
| `expandCompactV2` | ✓ | | G static — converts a cp object into a full sheet spec |
| `displayCharacterSheet` | ✓ | | G static — re-exported from `cs-core.js`; keeps G from importing that module directly |
| `compressToBase64Url` | ✓ | | G static — re-exported from `cs-core.js` |

---

## legacy-utils.js

Archive of orphaned exports — nothing currently imports from this module.

| Export | Notes |
|--------|-------|
| `getMinimumScores` | DOM form reader — identical to `readAbilityScores`; use that instead |
| `getHitDiceSize` | Hardcoded HD lookup (basic mode, bare class names) |
| `getClassPrimeRequisites` | Hardcoded prime-req lookup — duplicates `getPrimeRequisites` |
| `meetsClassPrimeRequisites` | Validates scores against prime-req minimum |
| `getCommonDemihumanAbilities` | Returns shared demihuman ability description string |
| `sanitize` | Filename-safe string replacement |

---

## Summary

| Finding | Notes |
|---------|-------|
| All dice-rolling is G-only | C never rolls dice — it renders from already-saved compact params |
| `shared-core.js` is the single source of truth | Contains all shared data and logic; never imported directly by either controller |
| `gen-core.js` is the single import point for gen-ui.js | Re-exports shared-core.js + owns gen-specific logic |
| `cs-core.js` is the single import point for cs-sheet-page.js | Re-exports shared-core.js + owns cs-specific rendering/codec logic |
| `cs-core.js` is cs-only | `gen-ui.js` accesses `displayCharacterSheet` via re-export from `cs-sheet-page.js` |
| `getPrimeRequisites` derived from `CLASS_INFO` | Hardcoded table removed; function lives in `shared-core.js` |
