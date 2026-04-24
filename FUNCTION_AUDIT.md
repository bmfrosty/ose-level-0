# Function and Constant Audit

Which exports from each shared module are used by `gen-ui.js` vs `cs-sheet-page.js`, and whether each is consumed internally within its own file.

**Legend:**
- **I** = called/used internally within the same file (other functions in that file depend on it)
- **G** = referenced by name directly in `gen-ui.js`
- **C** = referenced by name directly in `cs-sheet-page.js`
- ✦ class = candidate to move to `shared-class-info.js` (only depends on CLASS_INFO)
- ✦ race = candidate to move to `shared-race-info.js` (only depends on RACE_INFO + normalizeRaceName)

**Import routing:** Neither controller imports `shared-core.js` directly.
- `gen-ui.js` imports everything from `gen-core.js` (which re-exports `shared-core.js` via `export *`)
- `cs-sheet-page.js` imports everything from `cs-core.js` (which re-exports `shared-core.js` via `export *`)

---

## shared-class-info.js

Data-only leaf — no imports.

| Export | Type | I | G | C | Notes |
|--------|------|:-:|:-:|:-:|-------|
| `CLASS_INFO` | const | — | — | — | Imported by `shared-core.js`; re-exported from there. Not referenced by name in either controller. Used internally in shared-core.js by class helpers. |

---

## shared-race-info.js

Data-only leaf — no imports.

| Export | Type | I | G | C | Notes |
|--------|------|:-:|:-:|:-:|-------|
| `RACE_INFO` | const | — | — | — | Imported by `shared-core.js`; re-exported from there. Not referenced by name in either controller. Used internally in shared-core.js by race helpers. |
| `showDescriptionAnyway` | const | — | | | Debug toggle (`false`). Not yet wired to any display logic — reserved for troubleshooting `hideDescription`. |

---

## shared-core.js

Logic hub. Imports `CLASS_INFO` and `RACE_INFO` from the data leaves, re-exports both, and contains all shared logic. Neither controller imports this directly.

### Ability score math

| Export | Type | I | G | C | Notes |
|--------|------|:-:|:-:|:-:|-------|
| `calculateModifier` | fn | ✓ | ✓ | ✓ | Called internally by `rollHitPoints`, `calculateSavingThrows`, `applyRacialAbilityModifiers` |
| `formatModifier` | fn | | ✓ | | "+1" / "−1" display string |
| `calculateXPBonus` | fn | | ✓ | ✓ | Prime-requisite XP bonus |
| `meetsToughCharactersRequirements` | fn | ✓ | | | Called by `rollAbilities` |
| `meetsPrimeRequisiteRequirements` | fn | ✓ | | | Called by `rollAbilities` |
| `rollSingleDie` | fn | ✓ | | | Called by `rollDice` only |
| `rollDice` | fn | ✓ | | | Called by `rollAbilityScore`; also used by gen-core internally |
| `rollAbilityScore` | fn | ✓ | | | Called by `rollAbilities` |
| `rollAbilities` | fn | | ✓ | | Entry point for ability rolling |

### Class data (re-exported from shared-class-info.js)

| Export | Type | I | G | C | Notes |
|--------|------|:-:|:-:|:-:|-------|
| `CLASS_INFO` | const | ✓ | | | Used by class helpers below; not referenced by name in either controller |

### Class helpers

| Export | Type | I | G | C | Notes |
|--------|------|:-:|:-:|:-:|-------|
| `getClassInfo` | fn | ✓ | | | Wrapper for `CLASS_INFO[name]`; not used externally. ✦ class |
| `getPrimeRequisites` | fn | | ✓ | ✓ | Also used by gen-core internally. ✦ class |
| `getClassAbilities` | fn | ✓ | | | Used internally; superseded by `getClassFeatures` for external callers. ✦ class |
| `getAbilitiesAtLevel` | fn | ✓ | | | Used internally. ✦ class |
| `canRaceTakeClass` | fn | ✓ | | | Used internally; superseded by `getAvailableClasses`. Needs `normalizeRaceName`. |
| `meetsRequirements` | fn | ✓ | | | Used internally for class minimum checks. ✦ class |

### Class progression tables (constants)

| Export | Type | I | G | C | Notes |
|--------|------|:-:|:-:|:-:|-------|
| `HIT_DICE_PROGRESSIONS` | const | ✓ | | ✓ | Level-up HP roller |
| `ARCANE_SPELL_SLOTS` | const | ✓ | | | Used by `getClassFeatures` / `PROGRESSION_TABLES` |
| `DIVINE_SPELL_SLOTS` | const | ✓ | | | Used by `getClassFeatures` / `PROGRESSION_TABLES` |
| `THIEF_SKILLS` | const | ✓ | | ✓ | Level-up thief skills panel |
| `TURN_UNDEAD` | const | ✓ | | ✓ | Level-up turn undead panel |
| `XP_REQUIREMENTS` | const | ✓ | | | Used by `getClassProgressionData` internally |
| `HIT_DICE_SCALE` | const | ✓ | | ✓ | Maps classes to HD type |
| `SPELL_SLOT_SCALE` | const | ✓ | | | Used by `getClassFeatures` |

### Class progression functions

| Export | Type | I | G | C | Notes |
|--------|------|:-:|:-:|:-:|-------|
| `getClassProgressionData` | fn | | ✓ | ✓ | Saving throws, attack bonus, XP for level |
| `getClassFeatures` | fn | | ✓ | ✓ | Spell slots, thief skills, turn undead |
| `getBasicModeClassAbilities` | fn | | ✓ | ✓ | Basic-mode class ability list |
| `getMaxLevel` | fn | | ✓ | | Demihuman class level cap (Normal mode). ✦ race |

### Race data (re-exported from shared-race-info.js)

| Export | Type | I | G | C | Notes |
|--------|------|:-:|:-:|:-:|-------|
| `RACE_INFO` | const | ✓ | | | Used by race helpers below; not referenced by name in either controller |

### Race helpers

| Export | Type | I | G | C | Notes |
|--------|------|:-:|:-:|:-:|-------|
| `getRaceInfo` | fn | ✓ | ✓ | ✓ | Wrapper for `RACE_INFO[race]`. ✦ race |
| `getRaceAbilitiesAtLevel` | fn | ✓ | | | Called by `getAdvancedModeRacialAbilities`; gen-core uses it internally. ✦ race |
| `getAdvancedModeRacialAbilities` | fn | | ✓ | ✓ | Racial ability list for sheet rendering. ✦ race |
| `savingThrowsLevel0` | const | | | ✓ | Level-0 base saves |
| `attackBonusLevel0` | const | | | | Internal; used by level-0 character gen |
| `resolveFormula` | fn | ✓ | | | CON-based save formula evaluator; called by `applyRacialSaveModifiers`. Needs `calculateModifier`(?). |
| `applyRacialSaveModifiers` | fn | | ✓ | | Applied in gen-core for level 0 saves |
| `calculateSavingThrows` | fn | | | | Used by gen-core internally |
| `applyRacialAbilityModifiers` | fn | | | | Used by gen-core internally |
| `meetsRacialMinimums` | fn | ✓ | | | Used internally and by gen-core. ✦ race |
| `calculateAttackBonus` | fn | | | | Used by gen-core internally |
| `getRaceDisplayName` | fn | | ✓ | ✓ | Race display name normalizer |
| `getClassDisplayName` | fn | | ✓ | ✓ | Class display name normalizer |
| `applyRacialAdjustments` | fn | | ✓ | | Applies `abilityModifiers` to scores |
| `checkRacialMinimums` | fn | | ✓ | | Validates scores against `minimums`. ✦ race |
| `getAvailableClasses` | fn | | ✓ | | Lists valid classes for a race/mode. ✦ race |
| `getClassRequirements` | fn | | ✓ | | Advanced mode class ability-score requirements. Reads CLASS_INFO + RACE_INFO — stays in shared-core. |

### HP, gold, character creation

| Export | Type | I | G | C | Notes |
|--------|------|:-:|:-:|:-:|-------|
| `parseHitDice` | fn | | | ✓ | Parses "1d8", "9d8+2\*" strings |
| `rollHitPoints` | fn | | ✓ | | HP rolling with CON modifier and Blessed |
| `rollStartingGold` | fn | | ✓ | | 3d6 × 10 starting gold |
| `calcStartingGold` | fn | | ✓ | | Wealth % for level 2+ XP-mode gold |
| `createCharacter` | fn | | | ✓ | Builds full character display object |

### Weapons and armor

| Export | Type | I | G | C | Notes |
|--------|------|:-:|:-:|:-:|-------|
| `WEAPONS` | const | | ✓ | | Equipment purchasing; gen-core uses internally |
| `AMMUNITION` | const | | | ✓ | Sheet renderer only |
| `ARMOR` | const | | | ✓ | Equipment purchasing (gen-core); sheet renderer |
| `ADVENTURING_GEAR` | const | | | ✓ | Sheet renderer item list |
| `WEAPON_QUALITIES` | const | | | | Unused — no current callers |
| `getAllWeaponNames` | fn | | | | Unused |
| `getAllArmorNames` | fn | | | | Unused |
| `getWeaponsByQuality` | fn | | | | Unused |
| `getBluntWeapons` | fn | | | | Unused |
| `getMeleeWeapons` | fn | | | | Unused |
| `getMissileWeapons` | fn | | | | Unused |
| `getTwoHandedWeapons` | fn | | | | Unused |
| `weaponHasQuality` | fn | | | | Unused |
| `getWeaponData` | fn | | | | Unused |
| `getArmorData` | fn | | | | Unused |

### Sheet builder encoding constants

| Export | Type | I | G | C | Notes |
|--------|------|:-:|:-:|:-:|-------|
| `PROG_CODE` | const | | ✓ | | Prog key → compact code |
| `CLS_CODE` | const | | ✓ | | Class name → compact code (derived from `CLASS_INFO[c].code`) |
| `RACE_CODE` | const | | ✓ | | Race name → compact code (derived from `RACE_INFO[r].code`) |
| `RCM_CODE` | const | | ✓ | | Race/class mode → compact code |
| `progModeLabel` | fn | | ✓ | ✓ | Human-readable mode label |

### Class progression tables (PROGRESSION_TABLES)

| Export | Type | I | G | C | Notes |
|--------|------|:-:|:-:|:-:|-------|
| `PROGRESSION_TABLES` | const | | ✓ | ✓ | `classData = PROGRESSION_TABLES[prog]`; wraps OSE, Gygar, LL data |
| `getXPRequired` | fn | ✓ | | | Bound into PROGRESSION_TABLES; not called directly by controllers |
| `getHitDice` | fn | ✓ | | | Bound into PROGRESSION_TABLES |
| `getThiefSkills` | fn | ✓ | | | Bound into PROGRESSION_TABLES |
| `getTurnUndead` | fn | ✓ | | | Bound into PROGRESSION_TABLES |
| `getLevelFromXP` | fn | ✓ | ✓ | | Direct G use via gen-core |
| `getXPToNextLevel` | fn | ✓ | | | Bound into PROGRESSION_TABLES; no direct external callers |

`PROGRESSION_TABLES[mode]` members (accessed via `classData = PROGRESSION_TABLES[prog]`):

| Member | G | C | Notes |
|--------|:-:|:-:|-------|
| `getAttackBonus` | ✓ | ✓ | Mode-specific |
| `getSavingThrows` | ✓ | ✓ | Mode-specific |
| `getSpellSlots` | ✓ | ✓ | Mode-specific; Gygar uncapped; OSE/LL cap Spellblade at 10 |
| `getHitDice` | ✓ | ✓ | Shared fn bound per mode |
| `getXPRequired` | ✓ | ✓ | Shared fn bound per mode |
| `getThiefSkills` | ✓ | ✓ | Shared fn bound per mode |
| `getTurnUndead` | ✓ | ✓ | Shared fn bound per mode |
| `getLevelFromXP` | ✓ | ✓ | Shared fn bound per mode |
| `getXPToNextLevel` | ✓ | ✓ | Shared fn bound per mode |
| `ATTACK_BONUS_PROGRESSIONS` / `ATTACK_BONUS_SCALE` | | ✓ | C — level-up panel |
| `SAVING_THROWS` | | ✓ | C — level-up panel |

---

## gen-core.js

All gen-only logic. Re-exports `shared-core.js` so `gen-ui.js` has a single import point.

### Internal constants (not exported)

| Name | Type | Notes |
|------|------|-------|
| `namesTables` | const | Name generation tables by race |
| `ABILITIES` | const | `['STR','DEX','CON','INT','WIS','CHA']` |
| `DEMIHUMANS` | const | `['Dwarf_RACE', 'Elf_RACE', 'Gnome_RACE', 'Halfling_RACE']` |

### Exports

| Export | Type | I | G | C | Notes |
|--------|------|:-:|:-:|:-:|-------|
| `readAbilityScores` | fn | | ✓ | | DOM reader — fills ability score inputs |
| `getRandomName` | fn | | ✓ | | Random name by race |
| `getNameTable` | fn | | | | Unused by either controller |
| `getAvailableRaces` | fn | | | | Unused by either controller |
| `generateCharacterV3` | fn | ✓ | ✓ | | Main character generation entry point |
| *(all shared-core.js exports)* | — | — | — | — | Re-exported via `export * from './shared-core.js'` |

### Internal helpers (not exported)

| Name | Type | Notes |
|------|------|-------|
| `pickRace` | fn | Selects race from forced input or random |
| `raceFromBasicClass` | fn | Maps Basic class name → race name |
| `rollAbilityScores` | fn | Rolls + filters scores for gen flow |
| `passesFilters` | fn | Validates scores against minimums / prime-req |
| `calcLevel0HP` | fn | Rolls 1d4 + CON mod for level-0 HP |
| `toMap` | fn | Converts ability array to score object |

---

## cs-core.js

All cs-only logic. Re-exports `shared-core.js` so `cs-sheet-page.js` has a single import point.

### Codec constants

| Export | Type | I | G | C | Notes |
|--------|------|:-:|:-:|:-:|-------|
| `WEAPON_TO_CODE` | const | ✓ | | ✓ | Weapon name → 2-char code |
| `CODE_TO_WEAPON` | const | ✓ | | ✓ | Derived inverse of WEAPON_TO_CODE |
| `ARMOR_TO_CODE` | const | ✓ | | ✓ | Armor name → code |
| `CODE_TO_ARMOR` | const | ✓ | | ✓ | Derived inverse |
| `BG_TO_CODE` | const | ✓ | | ✓ | Background profession → code |
| `CODE_TO_BG` | const | ✓ | | ✓ | Derived inverse |
| `ITEM_TO_CODE` | const | ✓ | | ✓ | Adventuring gear item → code |
| `CODE_TO_ITEM` | const | ✓ | | ✓ | Derived inverse |

### Codec and URL functions

| Export | Type | I | G | C | Notes |
|--------|------|:-:|:-:|:-:|-------|
| `compressToBase64Url` | fn | | ✓ | ✓ | gzip + base64url encode; re-exported by cs-sheet-page.js |
| `decompressFromBase64Url` | fn | ✓ | | ✓ | gzip + base64url decode |
| `encodeStr` | fn | ✓ | | ✓ | Encode single string field |
| `decodeStr` | fn | ✓ | | ✓ | Decode single string field |
| `encodeItems` | fn | ✓ | | ✓ | Encode item array |
| `decodeItems` | fn | ✓ | | ✓ | Decode item array |
| `encodeCompactParams` | fn | | | ✓ | Full compact-params v2 encode |
| `decodeCompactParams` | fn | | | ✓ | Full compact-params v2 decode |
| `buildOptionsLine` | fn | | | ✓ | Options display string |

### Sheet renderer

| Export | Type | I | G | C | Notes |
|--------|------|:-:|:-:|:-:|-------|
| `renderCharacterSheetHTML` | fn | | | ✓ | Returns full HTML for character sheet |
| `displayCharacterSheet` | fn | | ✓ | | Re-exported by cs-sheet-page.js so gen-ui can call it without importing cs-core |
| `getModifierEffects` | fn | | | ✓ | Ability modifier description text |
| *(all shared-core.js exports)* | — | — | — | — | Re-exported via `export * from './shared-core.js'` |

---

## cs-sheet-page.js

| Export | Type | I | G | C | Notes |
|--------|------|:-:|:-:|:-:|-------|
| `compressToBase64Url` | re-export | | ✓ | | From cs-core.js — keeps gen-ui from importing cs-core directly |
| `displayCharacterSheet` | re-export | | ✓ | | From cs-core.js |
| `mergeAdvancedLanguages` | fn | ✓ | | | Merges racial + class language lists |
| `expandCompactV2` | fn | | ✓ | | Expands cp object → full sheet spec |
| `renderFromCompactParams` | fn | | | ✓ | Render + initialize all edit panels |
| `initCharacterSheet` | fn | | | ✓ | Page entry point; reads URL compact params |

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
| `CLASS_INFO` lives in `shared-class-info.js` | Data-only leaf; imported and re-exported by `shared-core.js`; not referenced by name in either controller |
| `RACE_INFO` lives in `shared-race-info.js` | Data-only leaf; imported and re-exported by `shared-core.js`; not referenced by name in either controller |
| `shared-core.js` is the shared logic hub | Imports the two data files; all controllers reach it via their respective core module |
| `gen-core.js` is the single import point for gen-ui.js | Re-exports shared-core.js + owns gen-specific logic |
| `cs-core.js` is the single import point for cs-sheet-page.js | Re-exports shared-core.js + owns cs-specific rendering/codec logic |
| `cs-core.js` is cs-only | `gen-ui.js` accesses `displayCharacterSheet` and `compressToBase64Url` via re-export from `cs-sheet-page.js` |
| Weapon quality helpers are dead code | `WEAPON_QUALITIES`, `getBluntWeapons`, `getMeleeWeapons`, `getMissileWeapons`, `getTwoHandedWeapons`, `weaponHasQuality`, `getWeaponData`, `getArmorData`, `getAllWeaponNames`, `getAllArmorNames`, `getWeaponsByQuality` — no callers |
| Several class helpers are unused externally | `getClassInfo`, `getClassAbilities`, `getAbilitiesAtLevel`, `canRaceTakeClass`, `meetsRequirements` — only called within shared-core.js |

### Move candidates (✦)

Functions that only depend on CLASS_INFO — could move to `shared-class-info.js`:

| Function | Blocker |
|----------|---------|
| `getClassInfo` | None — pure CLASS_INFO wrapper |
| `getPrimeRequisites` | None |
| `getClassAbilities` | None |
| `getAbilitiesAtLevel` | None |
| `meetsRequirements` | None |
| `canRaceTakeClass` | Needs `normalizeRaceName` — move after normalizeRaceName moves |

Functions that only depend on RACE_INFO + normalizeRaceName — could move to `shared-race-info.js`:

| Function / Constant | Blocker |
|---------------------|---------|
| `LEGACY_RACE_NAMES` + `normalizeRaceName` | None — move first, then everything below follows |
| `getRaceInfo` | Needs normalizeRaceName |
| `getRaceAbilitiesAtLevel` | Needs normalizeRaceName |
| `getAdvancedModeRacialAbilities` | Needs normalizeRaceName + getRaceAbilitiesAtLevel |
| `getMaxLevel` | Needs normalizeRaceName |
| `meetsRacialMinimums` | Needs normalizeRaceName |
| `checkRacialMinimums` | Needs normalizeRaceName |
| `getAvailableClasses` | Needs normalizeRaceName |

Functions that **cannot** move without circular imports (depend on shared-core.js logic):

| Function | Reason |
|----------|--------|
| `applyRacialAbilityModifiers` | Calls `calculateModifier` |
| `applyRacialSaveModifiers` | Calls `resolveFormula` (which may call `calculateModifier`) |
| `calculateSavingThrows` | Uses `PROGRESSION_TABLES` |
| `calculateAttackBonus` | Uses `PROGRESSION_TABLES` |
| `getClassRequirements` | Reads both CLASS_INFO and RACE_INFO |
