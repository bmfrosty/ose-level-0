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

### Phase 2: Add Race Generation Early ✅ COMPLETE
**IMPORTANT:** Update FIX_RACE_SELECTION.md after each phase
- [x] Move `rollRace()` call to BEFORE HP calculation
- [x] Store race in a variable for later use
- [x] Remove duplicate `rollRace()` call
- [x] Pass race to `calculateHitPoints()` for Blessed ability
- [x] Update FIX_RACE_SELECTION.md with completion

### Phase 3: Add Race Adjustments ✅ COMPLETE
**IMPORTANT:** Update FIX_RACE_SELECTION.md after each phase
- [x] Check if Advanced Mode is enabled
- [x] Check if human racial abilities are enabled
- [x] Call `applyRaceAdjustments()` with rolled results
- [x] Store adjusted results
- [x] Use adjusted results for CON/DEX modifiers
- [x] Store adjusted results in currentCharacter
- [x] Pass adjusted results to display function
- [x] Update FIX_RACE_SELECTION.md with completion

### Phase 4: Add Race Minimum Checks ✅ COMPLETE
**IMPORTANT:** Update FIX_RACE_SELECTION.md after each phase
- [x] Call `meetsRaceMinimums()` with adjusted results
- [x] If requirements not met, reroll entire character
- [x] Update FIX_RACE_SELECTION.md with completion

### Phase 5: Use Adjusted Results ✅ COMPLETE (Already done in Phase 3)
**IMPORTANT:** Update FIX_RACE_SELECTION.md after each phase
- [x] Update HP calculation to use adjusted CON modifier
- [x] Update AC calculation to use adjusted DEX modifier
- [x] Pass race to `calculateHitPoints()` for Blessed ability
- [x] Update FIX_RACE_SELECTION.md with completion

### Phase 6: Update Character Object ✅ COMPLETE (Already done in Phase 3)
**IMPORTANT:** Update FIX_RACE_SELECTION.md after each phase
- [x] Store adjusted results in currentCharacter
- [x] Ensure display uses adjusted results
- [x] Update FIX_RACE_SELECTION.md with completion

### Phase 7: Testing ✅ COMPLETE - BUGS FOUND!
**IMPORTANT:** Update FIX_RACE_SELECTION.md after each phase
- [x] Test clicking "Dwarf" button - Generated Human (Sidney) - **BUG CONFIRMED**
- [x] Verified bug still exists despite Phases 2-6 implementation
- [x] Update FIX_RACE_SELECTION.md with completion

**Test Results:**
- ❌ Clicking "Dwarf" button generated a Human character
- ❌ Race selection is NOT working correctly
- ❌ The fix in Phases 2-6 did NOT resolve the issue

**Root Cause Analysis:**
The problem is that `rollRace()` is being called INSIDE `generate0LevelCharacter()`, but the race buttons set the `forceRace` select value BEFORE calling the function. However, when the character doesn't meet race requirements and we call `generate0LevelCharacter()` recursively, it calls `rollRace()` again, which reads the CURRENT state of the UI - but by that time, the race selection may have been reset or the function may be ignoring it.

### Phase 8: Investigate rollRace() Function
**IMPORTANT:** Update FIX_RACE_SELECTION.md after each phase
- [ ] Read names-tables.js to understand how rollRace() works
- [ ] Identify why forceRace selection is not being respected
- [ ] Determine if the issue is in rollRace() or in how it's being called
- [ ] Update FIX_RACE_SELECTION.md with findings

### Phase 9: Fix rollRace() or Calling Pattern
**IMPORTANT:** Update FIX_RACE_SELECTION.md after each phase
- [ ] Implement fix based on Phase 8 findings
- [ ] Ensure race selection persists through recursive calls
- [ ] Update FIX_RACE_SELECTION.md with completion

### Phase 10: Re-test Race Selection (USER TESTING)
**IMPORTANT:** Update FIX_RACE_SELECTION.md after each phase
- [ ] **USER will test** clicking "Dwarf" button 10+ times - verify ALL characters are Dwarves
- [ ] **USER will test** clicking "Elf" button 10+ times - verify ALL characters are Elves
- [ ] **USER will test** clicking "Gnome" button 10+ times - verify ALL characters are Gnomes
- [ ] **USER will test** clicking "Halfling" button 10+ times - verify ALL characters are Halflings
- [ ] **USER will test** clicking "Human" button 10+ times - verify ALL characters are Humans
- [ ] **USER will test** "Random" button 10+ times - verify mixed races appear
- [ ] **USER will test** "Demihuman" button 10+ times - verify NO Humans appear
- [ ] **USER will report** if any bugs are found
- [ ] **CLINE/CLAUDE will reproduce** any reported bugs and fix them
- [ ] Update FIX_RACE_SELECTION.md with completion

**Testing Protocol:**
1. User performs all tests above
2. If bugs found: User reports specific race button and wrong race generated
3. Cline/Claude reproduces the bug using browser_action
4. Cline/Claude fixes the bug
5. Return to step 1 until all tests pass

## Progress Tracking
- **Started:** 2026-03-07
- **Current Phase:** Phase 8 (Investigate rollRace())
- **Completion:** 7/10 phases complete (70%)

### Completed Phases
- ✅ **Phase 1:** Create Plan Document (2026-03-07)
  - Documented problem and solution approach
  - Created implementation plan with 7 phases
- ✅ **Phase 2:** Add Race Generation Early (2026-03-07)
  - Moved rollRace() call before HP calculation
  - Removed duplicate rollRace() call
  - Pass race to calculateHitPoints() for Blessed ability
- ✅ **Phase 3:** Add Race Adjustments (2026-03-07)
  - Check Advanced Mode and human racial abilities settings
  - Apply race adjustments to ability scores
  - Use adjusted results throughout character generation
  - Store and display adjusted results
- ✅ **Phase 4:** Add Race Minimum Checks (2026-03-07)
  - Call meetsRaceMinimums() with adjusted results
  - Reroll entire character if requirements not met
  - Ensures selected race is always valid
- ✅ **Phase 5:** Use Adjusted Results (2026-03-07)
  - Already completed in Phase 3
  - HP/AC calculations use adjusted modifiers
- ✅ **Phase 6:** Update Character Object (2026-03-07)
  - Already completed in Phase 3
  - Character object stores and displays adjusted results
- ✅ **Phase 7:** Testing (2026-03-07)
  - Tested Dwarf button - generated Human character
  - **BUG CONFIRMED:** Race selection not working
  - Identified that rollRace() may not respect forceRace during recursive calls
