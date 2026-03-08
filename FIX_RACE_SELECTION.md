# Fix Race Selection Bug

## Problem
When clicking specific race buttons in the web UI, sometimes a character of the wrong race is generated.

## Root Cause
`main-generator.js` generates race AFTER validating ability scores and HP, without checking race requirements. This means:
1. User clicks "Dwarf" button
2. Code rolls ability scores
3. Code validates minimums and HP
4. Code calls `rollRace()` which might return a different race if requirements aren't met
5. Wrong race is displayed

## Correct Pattern (from character-utils.js)
1. Roll ability scores
2. Generate race EARLY
3. Apply race adjustments (if Advanced Mode)
4. Check race minimums (if Advanced Mode)
5. Reroll if requirements not met
6. Calculate HP/AC with adjusted scores

## Implementation Plan

### Phase 1: Create Plan Document
**IMPORTANT:** Update FIX_RACE_SELECTION.md after each phase
- [x] Create FIX_RACE_SELECTION.md
- [x] Document the problem and solution approach

### Phase 2: Add Race Generation Early
**IMPORTANT:** Update FIX_RACE_SELECTION.md after each phase
- [ ] Move `rollRace()` call to BEFORE HP calculation
- [ ] Store race in a variable for later use
- [ ] Update FIX_RACE_SELECTION.md with completion

### Phase 3: Add Race Adjustments
**IMPORTANT:** Update FIX_RACE_SELECTION.md after each phase
- [ ] Check if Advanced Mode is enabled
- [ ] Check if human racial abilities are enabled
- [ ] Call `applyRaceAdjustments()` with rolled results
- [ ] Store adjusted results
- [ ] Update FIX_RACE_SELECTION.md with completion

### Phase 4: Add Race Minimum Checks
**IMPORTANT:** Update FIX_RACE_SELECTION.md after each phase
- [ ] Call `meetsRaceMinimums()` with adjusted results
- [ ] If requirements not met, reroll entire character
- [ ] Update FIX_RACE_SELECTION.md with completion

### Phase 5: Use Adjusted Results
**IMPORTANT:** Update FIX_RACE_SELECTION.md after each phase
- [ ] Update HP calculation to use adjusted CON modifier
- [ ] Update AC calculation to use adjusted DEX modifier
- [ ] Pass race to `calculateHitPoints()` for Blessed ability
- [ ] Update FIX_RACE_SELECTION.md with completion

### Phase 6: Update Character Object
**IMPORTANT:** Update FIX_RACE_SELECTION.md after each phase
- [ ] Store adjusted results in currentCharacter
- [ ] Ensure display uses adjusted results
- [ ] Update FIX_RACE_SELECTION.md with completion

### Phase 7: Testing
**IMPORTANT:** Update FIX_RACE_SELECTION.md after each phase
- [ ] Test clicking "Dwarf" button multiple times
- [ ] Test clicking "Elf" button multiple times
- [ ] Test clicking "Gnome" button multiple times
- [ ] Test clicking "Halfling" button multiple times
- [ ] Test clicking "Human" button multiple times
- [ ] Test "Random" button
- [ ] Test "Demihuman" button
- [ ] Verify correct race is always generated
- [ ] Update FIX_RACE_SELECTION.md with completion

## Progress Tracking
- **Started:** 2026-03-07
- **Current Phase:** Phase 1 (Planning)
- **Completion:** 1/7 phases complete

### Completed Phases
- ✅ **Phase 1:** Create Plan Document (2026-03-07)
  - Documented problem and solution approach
  - Created implementation plan with 7 phases
