# Upper Level Character Support Implementation Plan

## Overview
Add support for higher-level characters with dynamic attack bonuses and saving throws. Currently, the tool only generates level 0 characters with fixed values.

## Current State
- Level: Always 0
- Attack Bonus: Always +0
- Saving Throws: Fixed values (Death: 14, Wands: 15, Paralysis: 16, Breath: 17, Spells: 18)
- No racial bonuses to saves

## Goals
1. Add level, attackBonus, and savingThrows to character object
2. Support Advanced Mode (race-based bonuses)
3. Support Basic Mode (class-based, no race)
4. Support Gygar Mode (different saving throws and attack bonuses)
5. Implement Dwarf Resilience ability (Advanced Mode only)

## Implementation Checklist

### Phase 1: Data Structures and Tables ✅ COMPLETE
- [x] Create `UPPER_LEVEL_PLAN.md` (this file)
- [x] Add Gygar Mode checkbox to UI (default: ON)
- [x] Add Gygar Mode option to shell script (--gygar / --not-gygar)
- [x] Add saving throw tables to `names-tables.js`
  - [x] Level 0 base values (same for both Normal and Gygar modes)
  - [x] Tables for future level support (will differ between modes)
- [x] Add attack bonus tables to `names-tables.js`
  - [x] Level 0 base value: -1 (Normal Mode), 0 (Gygar Mode)
  - [x] Tables for future level support

### Phase 2A: Dwarf Resilience Function ✅ COMPLETE
**IMPORTANT:** Update UPPER_LEVEL_PLAN.md progress after each task
- [x] Create `getDwarfResilienceBonus()` function in `names-tables.js`
  - [x] Input: CON score
  - [x] Output: Bonus value
  - [x] CON 6 or lower: +0
  - [x] CON 7-10: +2
  - [x] CON 11-14: +3
  - [x] CON 15-17: +4
  - [x] CON 18: +5
- [x] Export function for use in other modules
- [x] Update UPPER_LEVEL_PLAN.md with completion

### Phase 2B: Calculate Saving Throws Function ✅ COMPLETE
**IMPORTANT:** Update UPPER_LEVEL_PLAN.md progress after each task
- [x] Create `calculateSavingThrows()` function in `names-tables.js`
  - [x] Input: level, race, CON score, isAdvanced, isGygar
  - [x] Output: Object with Death, Wands, Paralysis, Breath, Spells
  - [x] Apply base values from savingThrowsLevel0
  - [x] If Advanced Mode AND race is Dwarf: apply Resilience bonus to Death, Wands, Spells
  - [x] Return final saving throw object
- [x] Export function for use in other modules
- [x] Update UPPER_LEVEL_PLAN.md with completion

### Phase 2C: Calculate Attack Bonus Function ✅ COMPLETE
**IMPORTANT:** Update UPPER_LEVEL_PLAN.md progress after each task
- [x] Create `calculateAttackBonus()` function in `names-tables.js`
  - [x] Input: level, race, isAdvanced, isGygar
  - [x] Output: Number (attack bonus)
  - [x] If level 0 and Gygar Mode: return 0
  - [x] If level 0 and Normal Mode: return -1
  - [x] Return final attack bonus
- [x] Export function for use in other modules
- [x] Update UPPER_LEVEL_PLAN.md with completion

### Phase 2D: Update Dwarf Racial Abilities Text ✅ COMPLETE
**IMPORTANT:** Update UPPER_LEVEL_PLAN.md progress after each task
- [x] Update `getRacialAbilities()` function in `names-tables.js`
  - [x] Add Resilience description to Dwarf abilities (Advanced Mode only)
  - [x] Include CON-based bonus explanation
- [x] Update UPPER_LEVEL_PLAN.md with completion

### Phase 3: Test Helper Functions ✅ COMPLETE
**IMPORTANT:** Update UPPER_LEVEL_PLAN.md progress after each task
- [x] Test `getDwarfResilienceBonus()` function
  - [x] Test CON 6 or lower: should return 0 ✅ PASS
  - [x] Test CON 7-10: should return 2 ✅ PASS
  - [x] Test CON 11-14: should return 3 ✅ PASS
  - [x] Test CON 15-17: should return 4 ✅ PASS
  - [x] Test CON 18: should return 5 ✅ PASS
- [x] Test `calculateSavingThrows()` function
  - [x] Test Human in Advanced Mode: no bonuses ✅ PASS
  - [x] Test Dwarf in Advanced Mode with CON 12: Death/Wands/Spells get -3 bonus ✅ PASS
  - [x] Test Dwarf in Advanced Mode with CON 18: Death/Wands/Spells get -5 bonus ✅ PASS
  - [x] Test Dwarf in Normal Mode: no bonuses (Advanced Mode only) ✅ PASS
  - [x] Test Elf in Advanced Mode: no bonuses (Dwarf only) ✅ PASS
- [x] Test `calculateAttackBonus()` function
  - [x] Test level 0 in Gygar Mode: should return 0 ✅ PASS
  - [x] Test level 0 in Normal Mode: should return -1 ✅ PASS
  - [x] Test different races: should all return same value (race doesn't affect attack bonus at level 0) ✅ PASS
- [x] Update UPPER_LEVEL_PLAN.md with completion

### Phase 4: Character Object Updates ✅ COMPLETE
- [x] Update `main-generator.js`
  - [x] Add `level: 0` to character object
  - [x] Add `attackBonus` to character object
  - [x] Add `savingThrows` object to character object
  - [x] Call `calculateSavingThrows()` during generation
  - [x] Call `calculateAttackBonus()` during generation
- [x] Update `node-canvas-generator.js`
  - [x] Same changes as main-generator.js

### Phase 5: Renderer Updates ✅ COMPLETE
- [x] Update `canvas-sheet-renderer.js`
  - [x] Use `character.savingThrows.Death` instead of hardcoded 14
  - [x] Use `character.savingThrows.Wands` instead of hardcoded 15
  - [x] Use `character.savingThrows.Paralysis` instead of hardcoded 16
  - [x] Use `character.savingThrows.Breath` instead of hardcoded 17
  - [x] Use `character.savingThrows.Spells` instead of hardcoded 18
  - [x] Use `character.attackBonus` instead of hardcoded +0
- [x] Update `underground-sheet-renderer.js`
  - [x] Use `character.savingThrows.Death` instead of hardcoded 14
  - [x] Use `character.savingThrows.Wands` instead of hardcoded 15
  - [x] Use `character.savingThrows.Paralysis` instead of hardcoded 16
  - [x] Use `character.savingThrows.Breath` instead of hardcoded 17
  - [x] Use `character.savingThrows.Spells` instead of hardcoded 18
  - [x] Note: underground sheet doesn't display attack bonus
- [x] Update `markdown-generator.js`
  - [x] Use dynamic saving throw values
  - [x] Use dynamic attack bonus

### Phase 6: Display Updates ✅ COMPLETE
- [x] Update `character-display.js`
  - [x] Display dynamic saving throws
  - [x] Display dynamic attack bonus
  - [x] Dwarf Resilience bonus automatically shown via dynamic saving throws

### Phase 7: Testing ✅ COMPLETE
- [x] Test level 0 characters (should work as before) ✅ PASS
- [x] Test Dwarf characters in Advanced Mode ✅ PASS
  - [x] Verify Resilience bonus applies correctly ✅ PASS
  - [x] Test CON score range (tested CON 10 = +2 bonus) ✅ PASS
- [x] Test non-Dwarf characters (no bonus) ✅ PASS (via Markdown/JSON)
- [x] Test JSON output includes new fields ✅ PASS
  - [x] Verified: level, attackBonus, savingThrows all present
- [x] Test Markdown output shows correct values ✅ PASS
  - [x] Saving throws: Death=12, Wands=13, Spells=16 (with Resilience)
  - [x] Attack bonus: +0 (Gygar Mode)
  - [x] Racial abilities include Resilience description
- [x] Test PDF/PNG rendering with dynamic values ✅ PASS
  - [x] User verified: OSE_0Level_Dwarf_Sailor_Bifur.pdf
  - [x] User verified: OSE_0Level_Dwarf_Weaver_Balin.png
- [x] Test Classic sheet style ✅ PASS
- [x] Test Underground sheet style ✅ PASS
  - [x] User verified: OSE_Underground_Dwarf_Innkeeper_Telchar.pdf

### Phase 8: Documentation ✅ COMPLETE
- [x] Update README.md with new features
- [x] Document Dwarf Resilience ability
- [x] Note that Basic Mode support is planned but not yet implemented

## Notes

### Dwarf Resilience Details
- **Only applies in Advanced Mode**
- Bonus applies to: Death, Wands, Spells saves
- Bonus does NOT apply to: Paralysis, Breath saves
- Based on CON score (not modifier)

### Basic Mode (Future)
- Race field will be "Basic"
- Dwarf, Elf, Halfling become classes
- Saving throws determined by class + level
- Attack bonus determined by class + level
- No racial abilities

### Gygar Mode Details
- **Default: ON** (checkbox in UI)
- Named after "The Ruins of Castle Gygar" module
- Link: https://www.drivethrurpg.com/en/product/510225/the-ruins-of-castle-gygar
- Different saving throw values than Normal Mode
- Different attack bonus progression (future levels)
- Applies to both Advanced and Basic modes
- **TODO:** Get specific Gygar Mode values from user

### Level 0 Specifics

**Normal Mode:**
- Attack Bonus: **-1** (penalty at level 0)
- Saving Throws: Base values (before racial bonuses)
  - Death: 14
  - Wands: 15
  - Paralysis: 16
  - Breath: 17
  - Spells: 18

**Gygar Mode:**
- Attack Bonus: **0** (no penalty at level 0)
- Saving Throws: **Same as Normal Mode** (Death: 14, Wands: 15, Paralysis: 16, Breath: 17, Spells: 18)
  - Gygar Mode only differs at higher levels

## Progress Tracking
- **Started:** 2026-03-07
- **Current Phase:** COMPLETE ✅
- **Completion:** 8/8 phases complete (All implementation phases complete!)
- **Latest Update:** 2026-03-08 - Added OSE and Gygar class documentation (Phase 1-4 of PLAN_OSE_IMPORT.md and PLAN_GYGAR_IMPORT.md)
- **Code Refactoring:** Created racial-abilities.js for better organization (2026-03-08)
- **Note:** Future work (level 1+ implementation) will use class data from OSE_*.md and GYGAR_*.md files

### Completed Phases
- ✅ **Phase 1:** Data Structures and Tables (2026-03-07)
  - Added Gygar Mode UI checkbox with link to Castle Gygar module
  - Added --gygar / --not-gygar CLI options
  - Added savingThrowsLevel0 and attackBonusLevel0 tables to names-tables.js
- ✅ **Phase 2A:** Dwarf Resilience Function (2026-03-07)
  - Created getDwarfResilienceBonus() function with CON-based bonuses
  - Exported function for use in other modules
- ✅ **Phase 2B:** Calculate Saving Throws Function (2026-03-07)
  - Created calculateSavingThrows() function in names-tables.js
  - Takes level, race, CON score, isAdvanced, isGygar as inputs
  - Returns object with Death, Wands, Paralysis, Breath, Spells values
  - Applies Dwarf Resilience bonus to Death, Wands, Spells (Advanced Mode only)
  - Exported function for use in other modules
- ✅ **Phase 2C:** Calculate Attack Bonus Function (2026-03-07)
  - Created calculateAttackBonus() function in names-tables.js
  - Takes level, race, isAdvanced, isGygar as inputs
  - Returns attack bonus number
  - Level 0 Gygar Mode: returns 0 (no penalty)
  - Level 0 Normal Mode: returns -1 (penalty for untrained)
  - Exported function for use in other modules
- ✅ **Phase 2D:** Update Dwarf Racial Abilities Text (2026-03-07)
  - Updated getRacialAbilities() function in names-tables.js
  - Added Resilience description to Dwarf abilities (Advanced Mode only)
  - Includes CON-based bonus explanation: "7-10: +2, 11-14: +3, 15-17: +4, 18: +5"
  - Non-Advanced Mode Dwarves don't show Resilience ability
- ✅ **Phase 3:** Test Helper Functions (2026-03-07)
  - Tested getDwarfResilienceBonus() - ALL TESTS PASSED ✅
  - Tested calculateSavingThrows() - ALL TESTS PASSED ✅
  - Tested calculateAttackBonus() - ALL TESTS PASSED ✅
  - All functions working correctly and ready for integration
- ✅ **Phase 4:** Character Object Updates (2026-03-07)
  - Updated main-generator.js to add level, attackBonus, savingThrows to character object
  - Updated node-canvas-generator.js with same changes
  - Both generators now call calculateSavingThrows() and calculateAttackBonus()
  - Character objects now include dynamic saving throws and attack bonuses
  - Gygar Mode checkbox state is read and passed to calculation functions
- ✅ **Phase 5:** Renderer Updates (2026-03-07)
  - Updated canvas-sheet-renderer.js to use dynamic saving throws and attack bonus
  - Updated underground-sheet-renderer.js to use dynamic saving throws
  - Updated markdown-generator.js to use dynamic saving throws and attack bonus
  - All renderers now display correct values based on character object
  - Backward compatible: falls back to defaults if values not present
- ✅ **Phase 6:** Display Updates (2026-03-07)
  - Updated character-display.js to use dynamic saving throws and attack bonus
  - Web character display now shows correct values
  - Dwarf Resilience bonuses automatically displayed via dynamic values
  - Gygar Mode attack bonus (0 vs -1) displays correctly
- ✅ **Phase 7:** Testing (2026-03-07)
  - All automated tests passed (Markdown, JSON)
  - User verified PDF and PNG outputs
  - Dwarf Resilience bonuses display correctly in all formats
  - Attack bonus displays correctly (0 in Gygar, -1 in Normal)
  - Classic and Underground sheet styles both working
- ✅ **Phase 8:** Documentation (2026-03-07)
  - Created comprehensive README.md
  - Documented all features including Dwarf Resilience
  - Added Quick Start guide
  - Documented all command-line options
  - Added development environment notes (Bazzite/distrobox)
  - Noted future plans (Basic Mode, higher levels)

## Related Work

### Race Selection Bug Fix (2026-03-07) ✅ COMPLETE
**Issue:** Clicking specific race buttons (e.g., "Dwarf") would sometimes generate characters of the wrong race (e.g., "Human").

**Root Cause:** The forceRace select element in index.html only had one option (`<option value="">Random</option>`). When JavaScript tried to set `select.value = 'Dwarf'`, it failed silently because no `<option value="Dwarf">` existed in the select element.

**Solution:** Added all race options to the forceRace select element:
```html
<select id="forceRace" style="display:none;">
    <option value="">Random</option>
    <option value="Human">Human</option>
    <option value="Dwarf">Dwarf</option>
    <option value="Elf">Elf</option>
    <option value="Gnome">Gnome</option>
    <option value="Halfling">Halfling</option>
</select>
```

**Files Modified:**
1. `index.html` - Added race options to forceRace select element
2. `canvas-generator.js` - Added "Open file instead of saving" feature for PNG/PDF/MD/JSON

**Results:**
- ✅ Race selection now works correctly for ALL races (Human, Dwarf, Elf, Gnome, Halfling)
- ✅ Works across ALL output formats (web display, PNG, PDF, Markdown, JSON)
- ✅ Random and Demihuman buttons work correctly
- ✅ User tested and confirmed - NO BUGS FOUND!

**Bonus Features Added:**
- "Open file instead of saving" checkbox for PNG/PDF/MD/JSON formats
- Opens files in new browser tab instead of downloading (best effort, browser-dependent)
- Tooltip and label noting this is a best-effort feature
- "Open character display in new tab" set back to checked by default

**Documentation:** See `FIX_RACE_SELECTION.md` for complete 10-phase implementation details.

**Lessons Learned:**
1. HTML select elements require matching `<option>` elements for values to be set properly
2. Setting `select.value` to a non-existent option fails silently in browsers
3. Always verify DOM state assumptions, especially with hidden elements
4. Simple fixes (adding options) can resolve complex-seeming bugs
5. Thorough investigation (Phase 8) was key to finding the real root cause

## Class Documentation Complete (2026-03-08) ✅

### OSE Standard Classes Imported
All 8 OSE classes documented in markdown format:
- ✅ OSE_CLERIC.md - Divine spellcaster with full progression tables
- ✅ OSE_FIGHTER.md - Warrior with full progression tables
- ✅ OSE_MAGIC_USER.md - Arcane spellcaster with full progression tables
- ✅ OSE_THIEF.md - Skilled adventurer with full progression tables
- ✅ OSE_DWARF.md - Demihuman class (race-as-class) with full progression tables
- ✅ OSE_ELF.md - Demihuman class (race-as-class) with full progression tables
- ✅ OSE_HALFLING.md - Demihuman class (race-as-class) with full progression tables
- ✅ OSE_GNOME.md - Demihuman class from Advanced Fantasy with full progression tables

### Gygar Mode Classes Created
All 9 Gygar classes documented in markdown format:
- ✅ GYGAR_CLERIC.md - Gygar variant with modified progressions
- ✅ GYGAR_FIGHTER.md - Gygar variant with modified progressions
- ✅ GYGAR_MAGIC_USER.md - Gygar variant with modified progressions
- ✅ GYGAR_THIEF.md - Gygar variant with modified progressions
- ✅ GYGAR_SPELLBLADE.md - Unique Gygar class (fighter/magic-user hybrid)
- ✅ GYGAR_DWARF.md - Gygar demihuman with modified progressions
- ✅ GYGAR_ELF.md - Gygar demihuman (uses Spellblade progression)
- ✅ GYGAR_HALFLING.md - Gygar demihuman with modified progressions
- ✅ GYGAR_GNOME.md - Gygar demihuman with modified progressions

### Comparison Documents Created
- ✅ **OSE_VS_GYGAR.md** - Comprehensive comparison of all OSE vs Gygar progressions
- ✅ **ELF_VS_SPELLBLADE.md** - Detailed comparison of OSE Elf vs Gygar Spellblade
- ✅ **RACIAL_FEATURES_AUDIT.md** - Code implementation audit with design decisions

### Code Refactoring Complete
- ✅ Created **racial-abilities.js** - Extracted racial abilities, saving throws, and bonuses from names-tables.js
- ✅ Updated **names-tables.js** - Now only contains name tables and race selection
- ✅ Updated **index.html** - Loads racial-abilities.js in correct order
- ✅ All tests passing - Browser testing complete with no errors

### Next Steps for Level 1+ Implementation
When implementing level 1+ character generation:
1. Extract data from OSE_*.md and GYGAR_*.md files
2. Create class-data-ose.js and class-data-gygar.js
3. Implement class selection UI
4. Use progression tables from markdown files
5. Add spell slots for spellcasters
6. Add thief skills for thieves
7. Add class abilities by level

**All documentation ready for level 1+ implementation!**
