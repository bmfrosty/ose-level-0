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

### Phase 2A: Dwarf Resilience Function
**IMPORTANT:** Update UPPER_LEVEL_PLAN.md progress after each task
- [ ] Create `getDwarfResilienceBonus()` function in `names-tables.js`
  - [ ] Input: CON score
  - [ ] Output: Bonus value
  - [ ] CON 6 or lower: +0
  - [ ] CON 7-10: +2
  - [ ] CON 11-14: +3
  - [ ] CON 15-17: +4
  - [ ] CON 18: +5
- [ ] Export function for use in other modules
- [ ] Update UPPER_LEVEL_PLAN.md with completion

### Phase 2B: Calculate Saving Throws Function
**IMPORTANT:** Update UPPER_LEVEL_PLAN.md progress after each task
- [ ] Create `calculateSavingThrows()` function in `names-tables.js`
  - [ ] Input: level, race, CON score, isAdvanced, isGygar
  - [ ] Output: Object with Death, Wands, Paralysis, Breath, Spells
  - [ ] Apply base values from savingThrowsLevel0
  - [ ] If Advanced Mode AND race is Dwarf: apply Resilience bonus to Death, Wands, Spells
  - [ ] Return final saving throw object
- [ ] Export function for use in other modules
- [ ] Update UPPER_LEVEL_PLAN.md with completion

### Phase 2C: Calculate Attack Bonus Function
**IMPORTANT:** Update UPPER_LEVEL_PLAN.md progress after each task
- [ ] Create `calculateAttackBonus()` function in `names-tables.js`
  - [ ] Input: level, race, isAdvanced, isGygar
  - [ ] Output: Number (attack bonus)
  - [ ] If level 0 and Gygar Mode: return 0
  - [ ] If level 0 and Normal Mode: return -1
  - [ ] Return final attack bonus
- [ ] Export function for use in other modules
- [ ] Update UPPER_LEVEL_PLAN.md with completion

### Phase 2D: Update Dwarf Racial Abilities Text
**IMPORTANT:** Update UPPER_LEVEL_PLAN.md progress after each task
- [ ] Update `getRacialAbilities()` function in `names-tables.js`
  - [ ] Add Resilience description to Dwarf abilities (Advanced Mode only)
  - [ ] Include CON-based bonus explanation
- [ ] Update UPPER_LEVEL_PLAN.md with completion

### Phase 4: Character Object Updates
- [ ] Update `main-generator.js`
  - [ ] Add `level: 0` to character object
  - [ ] Add `attackBonus` to character object
  - [ ] Add `savingThrows` object to character object
  - [ ] Call `calculateSavingThrows()` during generation
  - [ ] Call `calculateAttackBonus()` during generation
- [ ] Update `node-canvas-generator.js`
  - [ ] Same changes as main-generator.js

### Phase 5: Renderer Updates
- [ ] Update `canvas-sheet-renderer.js`
  - [ ] Use `character.savingThrows.Death` instead of hardcoded 14
  - [ ] Use `character.savingThrows.Wands` instead of hardcoded 15
  - [ ] Use `character.savingThrows.Paralysis` instead of hardcoded 16
  - [ ] Use `character.savingThrows.Breath` instead of hardcoded 17
  - [ ] Use `character.savingThrows.Spells` instead of hardcoded 18
  - [ ] Use `character.attackBonus` instead of hardcoded +0
- [ ] Update `underground-sheet-renderer.js`
  - [ ] Use `character.savingThrows.Death` instead of hardcoded 14
  - [ ] Use `character.savingThrows.Wands` instead of hardcoded 15
  - [ ] Use `character.savingThrows.Paralysis` instead of hardcoded 16
  - [ ] Use `character.savingThrows.Breath` instead of hardcoded 17
  - [ ] Use `character.savingThrows.Spells` instead of hardcoded 18
  - [ ] Use `character.attackBonus` instead of hardcoded +0
- [ ] Update `markdown-generator.js`
  - [ ] Use dynamic saving throw values
  - [ ] Use dynamic attack bonus

### Phase 6: Display Updates
- [ ] Update `character-display.js`
  - [ ] Display dynamic saving throws
  - [ ] Display dynamic attack bonus
  - [ ] Show Dwarf Resilience bonus in Advanced Mode

### Phase 7: Testing
- [ ] Test level 0 characters (should work as before)
- [ ] Test Dwarf characters in Advanced Mode
  - [ ] Verify Resilience bonus applies correctly
  - [ ] Test all CON score ranges
- [ ] Test non-Dwarf characters (no bonus)
- [ ] Test JSON output includes new fields
- [ ] Test Markdown output shows correct values
- [ ] Test PDF/PNG rendering with dynamic values
- [ ] Test Classic sheet style
- [ ] Test Underground sheet style

### Phase 8: Documentation
- [ ] Update README.md with new features
- [ ] Document Dwarf Resilience ability
- [ ] Note that Basic Mode support is planned but not yet implemented

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
- **Current Phase:** Phase 2 (Core Functions)
- **Completion:** 1/8 phases complete

### Completed Phases
- ✅ **Phase 1:** Data Structures and Tables (2026-03-07)
  - Added Gygar Mode UI checkbox with link to Castle Gygar module
  - Added --gygar / --not-gygar CLI options
  - Added savingThrowsLevel0 and attackBonusLevel0 tables to names-tables.js
