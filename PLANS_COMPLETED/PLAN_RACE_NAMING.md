# Plan: Implement _RACE Naming Convention

## Overview

This plan implements the `_RACE` suffix naming convention for race data, complementing the `_CLASS` suffix already implemented in PLAN_NAMING_AND_SHARED_CLASS_DATA.md.

## Problem Statement

Currently, race names like "Dwarf", "Elf", "Halfling", and "Gnome" are used inconsistently:
- In **race-adjustments.js**: These refer to races (Advanced Mode)
- In **racial-abilities.js**: These refer to races (both Basic and Advanced Mode)
- In **class-data-ose.js**: "Dwarf_CLASS", "Elf_CLASS", etc. refer to race-as-classes (Basic Mode)

This creates ambiguity about whether we're referring to a race or a race-as-class.

## Solution: _RACE Suffix

Use `_RACE` suffix for all race data to clearly distinguish from `_CLASS` data:

- `Human_RACE` - Human race (Advanced Mode)
- `Dwarf_RACE` - Dwarf race (Advanced Mode)
- `Elf_RACE` - Elf race (Advanced Mode)
- `Halfling_RACE` - Halfling race (Advanced Mode)
- `Gnome_RACE` - Gnome race (Advanced Mode)

## Files to Update

### Primary Targets:
1. **race-adjustments.js** - Race ability adjustments and minimums (Advanced Mode)
2. **racial-abilities.js** - Racial abilities (both modes)

### Secondary Targets:
3. **names-tables.js** - Minimal changes (add helper function)

## Implementation Plan

### Phase 1: Update race-adjustments.js ✅ COMPLETE
- [x] Add `LEGACY_RACE_NAMES` mapping
- [x] Add `normalizeRaceName()` helper function
- [x] Update `RACE_ADJUSTMENTS` object keys to use `_RACE` suffix
- [x] Update `RACE_MINIMUMS` object keys to use `_RACE` suffix
- [x] Update `getRaceAdjustments()` to use `normalizeRaceName()`
- [x] Update `getRaceMinimums()` to use `normalizeRaceName()`
- [x] Update `applyRaceAdjustments()` to use normalized names
- [x] Update `meetsRaceMinimums()` to use normalized names
- [x] Test backward compatibility (13/13 tests passed)
- [x] Update PLAN_RACE_NAMING.md

**Test Results: 13/13 PASSED ✓**
- ✓ New naming with `_RACE` suffix works
- ✓ Backward compatibility maintained (legacy names work)
- ✓ normalizeRaceName() function works correctly
- ✓ All 5 races work with new naming
- ✓ All 5 races work with legacy naming

### Phase 2: Update racial-abilities.js ✅ COMPLETE
- [x] Add `LEGACY_RACE_NAMES` mapping
- [x] Add `normalizeRaceName()` helper function
- [x] Update `RACIAL_ABILITIES` object keys to use `_RACE` suffix
- [x] Update `getRacialAbilities()` to use `normalizeRaceName()`
- [x] Update `calculateSavingThrows()` to use normalized names
- [x] No changes needed for `getDwarfResilienceBonus()` (takes CON score)
- [x] No changes needed for `getGnomeMagicResistanceBonus()` (takes CON score)
- [x] No changes needed for `getHalflingResilienceBonus()` (takes CON score)
- [x] Test backward compatibility (14/14 tests passed)
- [x] Update PLAN_RACE_NAMING.md

### Phase 3: Update names-tables.js ✅ COMPLETE
- [x] Add `LEGACY_RACE_NAMES` mapping
- [x] Add `normalizeRaceName()` helper function for export
- [x] Keep `namesTables` keys as lowercase (no change)
- [x] Keep `rollRace()` returning display names (no change)
- [x] Keep `getRandomName()` using lowercase keys (no change)
- [x] Export `normalizeRaceName` for use by other modules
- [x] Test backward compatibility (14/14 tests passed)
- [x] Update PLAN_RACE_NAMING.md

**Combined Test Results: 14/14 PASSED ✓**
- ✓ New naming with `_RACE` suffix works
- ✓ Backward compatibility maintained (legacy names work)
- ✓ `getRacialAbilities()` works with both naming conventions
- ✓ `calculateSavingThrows()` works with both naming conventions
- ✓ `normalizeRaceName()` exported and working in names-tables.js
- ✓ All 5 races work with new naming
- ✓ All 5 races work with legacy naming

### Phase 4: Documentation ✅ COMPLETE
- [x] Update BASIC_VS_ADVANCED_CLASSES.md with race naming examples
- [x] Update PLAN_NAMING_AND_SHARED_CLASS_DATA.md to reference race naming
- [x] Add code examples showing `_RACE` vs `_CLASS` usage
- [x] Document backward compatibility
- [x] Update PLAN_RACE_NAMING.md

### Phase 5: Final Testing ✅ COMPLETE
- [x] Test race adjustments with both old and new names (13/13 passed)
- [x] Test racial abilities with both old and new names (14/14 passed)
- [x] Test saving throws calculations (included in 14/14)
- [x] Test attack bonus calculations (not needed - no race-specific attack bonuses)
- [x] Verify backward compatibility maintained (all tests use both naming conventions)
- [x] Update PLAN_RACE_NAMING.md

**Final Test Summary: 27/27 PASSED ✓**
- Phase 1 (race-adjustments.js): 13/13 tests passed
- Phases 2 & 3 (racial-abilities.js & names-tables.js): 14/14 tests passed
- All race data uses `_RACE` suffix
- All helper functions work with new naming
- Backward compatibility fully maintained
- Documentation complete

## Backward Compatibility

### Legacy Name Mapping

```javascript
// In race-adjustments.js and racial-abilities.js
export const LEGACY_RACE_NAMES = {
    "Human": "Human_RACE",
    "Dwarf": "Dwarf_RACE",
    "Elf": "Elf_RACE",
    "Gnome": "Gnome_RACE",
    "Halfling": "Halfling_RACE"
};

/**
 * Normalize race name to use _RACE suffix
 * @param {string} raceName - The race name (with or without _RACE suffix)
 * @returns {string} The normalized race name with _RACE suffix
 */
export function normalizeRaceName(raceName) {
    // If already has _RACE suffix, return as-is
    if (raceName.endsWith("_RACE")) {
        return raceName;
    }
    // Otherwise, look up in legacy names
    return LEGACY_RACE_NAMES[raceName] || raceName;
}
```

## Data Structure Changes

### race-adjustments.js

**Before:**
```javascript
const adjustments = {
    "Human": { STR: 0, DEX: 0, CON: 1, INT: 0, WIS: 0, CHA: 1 },
    "Dwarf": { STR: 0, DEX: 0, CON: 1, INT: 0, WIS: 0, CHA: -1 },
    "Elf": { STR: 0, DEX: 1, CON: -1, INT: 0, WIS: 0, CHA: 0 },
    "Gnome": { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
    "Halfling": { STR: -1, DEX: 1, CON: 0, INT: 0, WIS: 0, CHA: 0 }
};
```

**After:**
```javascript
export const RACE_ADJUSTMENTS = {
    "Human_RACE": { STR: 0, DEX: 0, CON: 1, INT: 0, WIS: 0, CHA: 1 },
    "Dwarf_RACE": { STR: 0, DEX: 0, CON: 1, INT: 0, WIS: 0, CHA: -1 },
    "Elf_RACE": { STR: 0, DEX: 1, CON: -1, INT: 0, WIS: 0, CHA: 0 },
    "Gnome_RACE": { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
    "Halfling_RACE": { STR: -1, DEX: 1, CON: 0, INT: 0, WIS: 0, CHA: 0 }
};

export function getRaceAdjustments(race) {
    const normalizedRace = normalizeRaceName(race);
    return RACE_ADJUSTMENTS[normalizedRace] || { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 };
}
```

### racial-abilities.js

**Before:**
```javascript
const abilities = {
    "Human": [...],
    "Dwarf": [...],
    "Elf": [...],
    "Gnome": [...],
    "Halfling": [...]
};
```

**After:**
```javascript
export const RACIAL_ABILITIES = {
    "Human_RACE": [...],
    "Dwarf_RACE": [...],
    "Elf_RACE": [...],
    "Gnome_RACE": [...],
    "Halfling_RACE": [...]
};

export function getRacialAbilities(race) {
    const normalizedRace = normalizeRaceName(race);
    // ... rest of function
    return RACIAL_ABILITIES[normalizedRace] || [];
}
```

## Usage Examples

### Advanced Mode Example

```javascript
// Get race adjustments for a Dwarf
const adjustments = getRaceAdjustments("Dwarf_RACE");
// or with legacy name:
const adjustments = getRaceAdjustments("Dwarf");

// Get racial abilities for an Elf
const abilities = getRacialAbilities("Elf_RACE");
// or with legacy name:
const abilities = getRacialAbilities("Elf");
```

### Comparison: _CLASS vs _RACE

```javascript
// Basic Mode: Race-as-Class
const dwarfClassXP = getXPRequired("Dwarf_CLASS", 5);  // Dwarf class XP
const dwarfClassHD = getHitDice("Dwarf_CLASS", 5);     // Dwarf class HD

// Advanced Mode: Race + Class
const dwarfRaceAbilities = getRacialAbilities("Dwarf_RACE");  // Dwarf racial abilities
const dwarfRaceAdjustments = getRaceAdjustments("Dwarf_RACE"); // Dwarf ability adjustments
const fighterClassXP = getXPRequired("Fighter_CLASS", 5);      // Fighter class XP
const fighterClassHD = getHitDice("Fighter_CLASS", 5);         // Fighter class HD
```

## Benefits

1. **Clear Distinction**: `_RACE` vs `_CLASS` makes code intent obvious
2. **Consistency**: Matches the `_CLASS` naming convention
3. **Future-Proof**: Ready for Advanced Mode implementation
4. **Backward Compatible**: Existing code continues to work
5. **Self-Documenting**: Code clearly shows race vs class data

## Success Criteria

- [x] All race data uses `_RACE` suffix in code ✅
- [x] All helper functions work with new naming ✅
- [x] Backward compatibility maintained ✅
- [x] All tests pass (27/27) ✅
- [x] Documentation updated ✅
- [x] Consistent with `_CLASS` naming convention ✅

## Implementation Complete! ✅

All 5 phases of the `_RACE` naming convention have been successfully completed:

1. ✅ **Phase 1:** race-adjustments.js (13/13 tests passed)
2. ✅ **Phase 2:** racial-abilities.js (14/14 tests passed)
3. ✅ **Phase 3:** names-tables.js (14/14 tests passed)
4. ✅ **Phase 4:** Documentation updated
5. ✅ **Phase 5:** Final testing complete (27/27 total tests passed)

### Files Updated:
- **race-adjustments.js** - Race adjustments and minimums with `_RACE` naming
- **racial-abilities.js** - Racial abilities with `_RACE` naming
- **names-tables.js** - Helper function export
- **BASIC_VS_ADVANCED_CLASSES.md** - Updated with race naming examples
- **PLAN_NAMING_AND_SHARED_CLASS_DATA.md** - Cross-referenced race naming

### Architecture Complete:
The codebase now has consistent naming for both classes and races:
- **`_CLASS` suffix**: For class data (XP, HD, saves, attack bonus)
- **`_RACE` suffix**: For race data (racial abilities, adjustments, minimums)

This eliminates all ambiguity and makes the code self-documenting!

## Notes

- This refactoring complements PLAN_NAMING_AND_SHARED_CLASS_DATA.md
- The `_RACE` suffix is most important in race-adjustments.js (Advanced Mode specific)
- The `_RACE` suffix in racial-abilities.js provides consistency
- names-tables.js requires minimal changes (mostly for exporting helper function)
- Backward compatibility is maintained through `normalizeRaceName()` function

## Related Documents

- PLAN_NAMING_AND_SHARED_CLASS_DATA.md - Class naming convention
- BASIC_VS_ADVANCED_CLASSES.md - Mode differences
- PLAN_CLASSES_IMPORT.md - Class import plan
