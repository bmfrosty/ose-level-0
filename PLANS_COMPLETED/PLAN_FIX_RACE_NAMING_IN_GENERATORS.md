# Plan: Fix Race Naming in Character Generators

## Overview

The character generators (0-level, basic, advanced) are currently using **legacy simple race names** (`"Human"`, `"Dwarf"`, etc.) instead of the proper **`_RACE` suffix naming convention** (`"Human_RACE"`, `"Dwarf_RACE"`, etc.) that was implemented in PLAN_RACE_NAMING.md.

## Problem Statement

According to PLAN_RACE_NAMING.md (completed), the codebase should use:
- **`_CLASS` suffix**: For class data (e.g., `"Dwarf_CLASS"`, `"Fighter_CLASS"`)
- **`_RACE` suffix**: For race data (e.g., `"Dwarf_RACE"`, `"Human_RACE"`)

However, the character generators are still using legacy names:
- ❌ `rollRace()` returns `"Human"`, `"Dwarf"`, etc.
- ❌ `getRandomName()` expects `"Human"`, `"Dwarf"`, etc.
- ❌ `getRacialAbilities()` is called with legacy names
- ❌ `calculateSavingThrows()` is called with legacy names
- ❌ `applyRaceAdjustments()` is called with legacy names

The `normalizeRaceName()` function exists in the legacy files to handle backward compatibility, but the generators aren't using the proper `_RACE` names.

## Current State

### Files Using Legacy Names:
1. **0level-character-gen.js** - Uses `"Human"`, `"Dwarf"`, etc.
2. **0level-ui.js** - Displays legacy names
3. **basic-character-gen.js** - Uses legacy names (likely)
4. **basic-ui.js** - Displays legacy names (likely)
5. **advanced.html** - Will use legacy names (not yet implemented)

### Files That Support _RACE Names:
1. **racial-abilities.js** - Has `normalizeRaceName()`, supports both
2. **race-adjustments.js** - Has `normalizeRaceName()`, supports both
3. **names-tables.js** - Has `normalizeRaceName()`, supports both
4. **shared-race-names.js** - Defines the mapping

## Solution

Update all character generators to use `_RACE` suffix internally, while maintaining backward compatibility for display purposes.

## Implementation Plan

### Phase 1: Update 0-level Generator - **HIGH PRIORITY** 🔥
**Why first:** Just refactored to ES6 modules, easiest to update now

- [ ] Update `0level-character-gen.js`:
  - [ ] Import `normalizeRaceName()` from shared-race-names.js
  - [ ] Update `rollRace()` to return `_RACE` suffix names
  - [ ] Update all calls to `getRacialAbilities()` to use `_RACE` names
  - [ ] Update all calls to `calculateSavingThrows()` to use `_RACE` names
  - [ ] Update all calls to `applyRaceAdjustments()` to use `_RACE` names
  - [ ] Update all calls to `meetsRaceMinimums()` to use `_RACE` names
  - [ ] Update `calculateHitPoints()` to use `_RACE` names
  
- [ ] Update `0level-ui.js`:
  - [ ] Add helper function to convert `_RACE` to display name
  - [ ] Display "Human" instead of "Human_RACE" in UI
  - [ ] Keep internal logic using `_RACE` names

- [ ] Test 0-level generator:
  - [ ] Verify character generation works
  - [ ] Verify all races work correctly
  - [ ] Verify display shows clean names (no `_RACE` suffix)
  - [ ] Verify racial abilities apply correctly

### Phase 2: Update Basic Generator - **HIGH PRIORITY** 🔥
**Why second:** Already refactored to ES6 modules, should be updated before Advanced Mode

- [ ] Update `basic-character-gen.js`:
  - [ ] Import `normalizeRaceName()` from shared-race-names.js
  - [ ] Update race handling to use `_RACE` suffix
  - [ ] Update all calls to racial functions
  
- [ ] Update `basic-ui.js`:
  - [ ] Add helper function to convert `_RACE` to display name
  - [ ] Display clean names in UI
  
- [ ] Test basic generator:
  - [ ] Verify all race-as-classes work
  - [ ] Verify racial abilities apply correctly
  - [ ] Verify display shows clean names

### Phase 3: Update Advanced Generator - **NORMAL PRIORITY**
**Why third:** Not yet implemented, can use proper naming from the start

- [ ] When implementing Advanced Mode:
  - [ ] Use `_RACE` suffix from the beginning
  - [ ] Use `_CLASS` suffix for classes
  - [ ] Add display name conversion for UI
  - [ ] Test with all race/class combinations

### Phase 4: Update Legacy Scripts - **LOW PRIORITY**
**Why last:** Already have backward compatibility via `normalizeRaceName()`

- [ ] Consider updating legacy scripts to export `_RACE` names directly
- [ ] Or keep backward compatibility and just update generators
- [ ] Decision: Keep backward compatibility for now

## Display Name Conversion

Add a helper function to all UI modules:

```javascript
/**
 * Convert internal _RACE name to display name
 * @param {string} raceName - Race name with _RACE suffix
 * @returns {string} Display name without suffix
 */
function getRaceDisplayName(raceName) {
    if (raceName.endsWith("_RACE")) {
        return raceName.replace("_RACE", "");
    }
    return raceName;
}
```

## Benefits

1. **Consistency**: Matches `_CLASS` naming convention
2. **Clarity**: Code clearly shows race vs class
3. **Future-Proof**: Ready for Advanced Mode (race + class)
4. **Self-Documenting**: Code intent is obvious
5. **Backward Compatible**: Display still shows clean names

## Priority Order

1. **HIGHEST**: Phase 1 (0-level generator) - Just refactored, easy to update
2. **HIGH**: Phase 2 (Basic generator) - Already refactored, should match 0-level
3. **NORMAL**: Phase 3 (Advanced generator) - Not yet implemented
4. **LOW**: Phase 4 (Legacy scripts) - Already have backward compatibility

## Timeline

- **Phase 1**: 30-60 minutes (0-level generator)
- **Phase 2**: 30-60 minutes (Basic generator)
- **Phase 3**: Part of Advanced Mode implementation
- **Phase 4**: Optional, may not be needed

**Total Immediate Work**: 1-2 hours for Phases 1-2

## Success Criteria

- [ ] All generators use `_RACE` suffix internally
- [ ] Display shows clean names (no `_RACE` suffix)
- [ ] All racial abilities apply correctly
- [ ] All saving throw bonuses apply correctly
- [ ] All race adjustments apply correctly (Advanced Mode)
- [ ] Backward compatibility maintained
- [ ] Code is self-documenting

## Related Documents

- PLAN_RACE_NAMING.md - Original race naming implementation (COMPLETE)
- PLAN_REFACTOR_JS_MODULES.md - Module refactoring plan (Phase 3 COMPLETE)
- BASIC_VS_ADVANCED_CLASSES.md - Mode differences
- PLAN_NAMING_AND_SHARED_CLASS_DATA.md - Class naming convention

## Notes

- This is a **code quality improvement**, not a bug fix
- The generators work correctly with legacy names due to `normalizeRaceName()`
- However, using proper `_RACE` names makes the code clearer and more maintainable
- Should be done **before** implementing Advanced Mode to avoid technical debt

## Recommendation

**Do Phase 1 (0-level) and Phase 2 (Basic) NOW**, before implementing Advanced Mode. This ensures:
1. Consistent naming across all generators
2. No technical debt when implementing Advanced Mode
3. Code is self-documenting and clear
4. Future maintenance is easier

**Estimated Time**: 1-2 hours total for both phases
**Priority**: HIGH (should be done before Advanced Mode)
