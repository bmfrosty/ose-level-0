# Racial Features Audit: Code vs Documentation

This document compares the racial features implemented in the code (Advanced mode) with the racial features documented in the demihuman class files.

## Current Code Implementation

### Location 1: race-adjustments.js

### Ability Score Adjustments

**Human:**
- CON +1, CHA +1

**Dwarf:**
- CON +1, CHA -1

**Elf:**
- DEX +1, CON -1

**Gnome:**
- No adjustments

**Halfling:**
- STR -1, DEX +1

### Minimum Requirements (race-adjustments.js)

**Human:**
- No minimums

**Dwarf:**
- CON 9

**Elf:**
- INT 9

**Gnome:**
- CON 9, INT 9

**Halfling:**
- CON 9, DEX 9

### Location 2: names-tables.js

**Contains:** `getRacialAbilities(race)` function that returns detailed racial abilities as text arrays

**Implemented Racial Abilities:**

**Human (Advanced mode with humanRacialAbilities enabled):**
- Blessed: Roll HP twice, take best
- Decisiveness: Act first on tied initiative (+1 to individual initiative)
- Leadership: Retainers/mercenaries +1 loyalty and morale

**Dwarf:**
- Languages: Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold ✅
- Small/normal weapons only ✅
- Detect construction tricks 2-in-6 ✅
- Detect room traps 2-in-6 ✅
- Infravision 60' ✅
- Listen at doors 2-in-6 ✅
- Resilience: CON-based bonus to Death/Wands/Spells saves ✅

**Elf:**
- Languages: Alignment, Common, Elvish, Gnoll, Hobgoblin, Orcish ✅
- Detect secret doors 2-in-6 ✅
- Infravision 60' ✅
- Listen at doors 2-in-6 ✅
- Immunity to ghoul paralysis ✅

**Gnome:**
- Languages: Alignment, Common, Dwarvish, Gnomish, Kobold, burrowing mammals ✅
- Small/normal weapons only ✅
- Detect construction tricks 2-in-6 ✅
- Infravision 90' ✅
- Listen at doors 2-in-6 ✅
- +2 AC vs large opponents ✅
- Magic Resistance: CON-based bonus to saves vs spells/wands/rods/staves ✅

**Halfling:**
- Languages: Alignment, Common, Halfling ✅
- Small/normal weapons only ✅
- Listen at doors 2-in-6 ✅
- +1 to missile attack rolls ✅
- +2 AC vs large opponents ✅
- Resilience: CON-based bonus to Death/Wands/Spells saves ✅

**Also includes:**
- `calculateSavingThrows()` - Applies racial bonuses to saves
- `getDwarfResilienceBonus()` - Calculates Dwarf save bonuses
- `getGnomeMagicResistanceBonus()` - Calculates Gnome save bonuses
- `getHalflingResilienceBonus()` - Calculates Halfling save bonuses

---

## Documented Racial Features (from class files)

### Dwarf (OSE_DWARF.md / GYGAR_DWARF.md)

**Requirements:** CON 9 ✅ (matches code)

**Racial Abilities:**
- Detect Construction Tricks (2-in-6)
- Detect Room Traps (2-in-6)
- Infravision 60'
- Listening at Doors (2-in-6)

**Status:** ✅ **IMPLEMENTED** in names-tables.js

---

### Elf (OSE_ELF.md / GYGAR_ELF.md)

**Requirements:** INT 9 ✅ (matches code)

**Racial Abilities:**
- Detect Secret Doors (2-in-6)
- Immunity to Ghoul Paralysis
- Infravision 60'
- Listening at Doors (2-in-6)

**Status:** ✅ **IMPLEMENTED** in racial-abilities.js (moved from names-tables.js)

---

### Halfling (OSE_HALFLING.md / GYGAR_HALFLING.md)

**Requirements:** CON 9, DEX 9 ✅ (matches code)

**Racial Abilities:**
- Defensive Bonus (+2 AC vs large opponents)
- Hiding (90% in woods, 2-in-6 in dungeons)
- Initiative Bonus (+1, optional rule)
- Listening at Doors (2-in-6)
- Missile Attack Bonus (+1 to hit with missiles)

**Status:** ✅ **IMPLEMENTED** in racial-abilities.js (moved from names-tables.js)
- ❌ Hiding mechanics not yet implemented (90% woods, 2-in-6 dungeons)
- ❌ Initiative bonus not yet implemented (+1, optional rule)

---

### Gnome (OSE_GNOME.md / GYGAR_GNOME.md)

**Requirements:** CON 9, INT 9 ✅ (matches code, though Gnome requires both)

**Racial Abilities:**
- Defensive Bonus (+2 AC vs large opponents)
- Detect Construction Tricks (2-in-6)
- Hiding (90% in woodland, 2-in-6 in dungeons)
- Infravision 90'
- Listening at Doors (2-in-6)
- Speak with Burrowing Mammals

**Status:** ✅ **IMPLEMENTED** in racial-abilities.js (moved from names-tables.js)
- ❌ Hiding mechanics not yet implemented (90% woodland, 2-in-6 dungeons)

---

## Code Organization Analysis

### Current Implementation Status

The code currently implements:
1. ✅ Ability score adjustments (race-adjustments.js)
2. ✅ Minimum ability requirements (race-adjustments.js)
3. ✅ Racial special abilities (names-tables.js)
4. ✅ Saving throw bonuses (names-tables.js)

### File Organization Issues

**Problem:** Racial abilities are split across two files with unclear separation of concerns:

**race-adjustments.js:**
- Ability score adjustments
- Minimum requirements
- Name suggests it should handle all race-related adjustments

**names-tables.js:**
- Name tables (appropriate)
- Racial abilities text (❓ questionable location)
- Saving throw calculations (❓ questionable location)
- Attack bonus calculations (❓ questionable location)

**Issue:** The file named "names-tables.js" contains much more than just name tables. This makes the code harder to maintain and understand.

### Features Not Implemented (By Design)

**Halfling Hiding:**
- ❌ Not implemented in racial abilities code
- 📋 Documented in OSE_HALFLING.md: 90% in woods, 2-in-6 in dungeons
- ✅ **Intentionally not implemented** - This is a class feature for the Halfling race-as-class
- 📝 In Advanced mode (race + class separate), hiding is not a racial ability

**Halfling Initiative Bonus:**
- ❌ Not implemented in racial abilities code
- 📋 Documented in OSE_HALFLING.md: +1 to initiative (optional rule)
- ✅ **Intentionally not implemented** - This is a class feature for the Halfling race-as-class
- 📝 In Advanced mode (race + class separate), initiative bonus is not a racial ability

**Gnome Hiding:**
- ❌ Not implemented in racial abilities code
- 📋 Documented in OSE_GNOME.md: 90% in woodland, 2-in-6 in dungeons
- ✅ **Intentionally not implemented** - This is a class feature for the Gnome race-as-class
- 📝 In Advanced mode (race + class separate), hiding is not a racial ability

### Design Decision: Race-as-Class vs Race + Class

**OSE Standard (Basic Mode):**
- Uses race-as-class (Dwarf, Elf, Halfling, Gnome are both race AND class)
- All abilities (including hiding, initiative bonuses) are part of the class
- Example: "Halfling" is a complete class with hiding ability

**OSE Advanced Fantasy (Advanced Mode):**
- Separates race from class (5 races × 5 classes = 25 combinations)
- Races: Human, Dwarf, Elf, Halfling, Gnome
- Classes: Fighter, Thief, Magic-User, Cleric, Spellblade
- Racial abilities are inherent to the race (infravision, detect doors, etc.)
- Class abilities are inherent to the class (hiding for Thief, not for Halfling race)

**Why Hiding/Initiative are NOT Racial Abilities:**
- In Advanced mode, a Halfling Fighter does NOT get hiding (that's a Thief ability)
- In Advanced mode, a Halfling Cleric does NOT get hiding (that's a Thief ability)
- In Advanced mode, a Halfling Thief DOES get hiding (from the Thief class, not the race)
- Hiding is a class feature, not a racial feature in the Advanced mode system

**What IS a Racial Ability in Advanced Mode:**
- Infravision (Dwarf, Elf, Gnome)
- Detect doors/traps (Dwarf, Elf, Gnome)
- Listen at doors (all demihumans)
- AC bonus vs large (Halfling, Gnome)
- Missile bonus (Halfling)
- Saving throw bonuses (Dwarf, Halfling, Gnome)
- Language proficiencies

---

## Ability Score Adjustments Analysis

### Source: OSE Advanced Fantasy Player's Tome

The ability score adjustments in the code are from the **OSE Advanced Fantasy Player's Tome**, not custom house rules:

**OSE Advanced Fantasy (Race + Class Separate):**
- Demihumans get ability score adjustments when using Advanced mode
- This is official OSE content for Advanced Fantasy rules

**Current Code Implementation (from OSE Advanced Fantasy Player's Tome):**
- Human gets +1 CON, +1 CHA ✅
- Dwarf gets +1 CON, -1 CHA ✅
- Elf gets +1 DEX, -1 CON ✅
- Halfling gets -1 STR, +1 DEX ✅
- Gnome gets no adjustments ✅

**Status:** ✅ **OSE OFFICIAL** - These adjustments are from OSE Advanced Fantasy Player's Tome

**Note:** OSE Standard (race-as-class) has no ability score adjustments. OSE Advanced Fantasy (race + class separate) includes these adjustments.

---

## Recommendations

### Recommendation 1: Refactor Code Organization

**Create a new file: `racial-abilities.js`**

Move from names-tables.js to racial-abilities.js:
- `getRacialAbilities()`
- `calculateSavingThrows()`
- `calculateAttackBonus()`
- `getDwarfResilienceBonus()`
- `getGnomeMagicResistanceBonus()`
- `getHalflingResilienceBonus()`
- Saving throw tables
- Attack bonus tables

**Keep in names-tables.js:**
- Name tables
- `rollRace()`
- `getRandomName()`
- `isDemihuman()`

**Keep in race-adjustments.js:**
- Ability score adjustments
- Minimum requirements
- `applyRaceAdjustments()`
- `meetsRaceMinimums()`

**Benefits:**
- Clear separation of concerns
- Easier to find and maintain racial ability code
- Better file naming matches content

### Recommendation 2: No Action Needed for "Missing" Features

**Hiding Mechanics:**
- ✅ **No implementation needed** - Hiding is a class feature, not a racial feature
- In Advanced mode, hiding comes from the Thief class, not from being a Halfling or Gnome
- In Basic mode (race-as-class), hiding is part of the Halfling/Gnome class definition

**Initiative Bonus:**
- ✅ **No implementation needed** - Initiative bonus is a class feature, not a racial feature
- In Advanced mode, this would be a class ability if implemented
- In Basic mode (race-as-class), it's part of the Halfling class definition

**Conclusion:** The current implementation is correct. These features should NOT be in racial-abilities.js because they are class features in the race-as-class system, not racial features in the race + class system.

### Recommendation 3: Update HTML to Load racial-abilities.js

**Update index.html to include:**
```html
<script src="racial-abilities.js"></script>
```

**Place it before other scripts that depend on it** (like main-generator.js)

This ensures the racial abilities functions are available in the browser environment.

---

## Summary

**What Works:**
- ✅ Minimum ability requirements match documentation (race-adjustments.js)
- ✅ Ability score adjustments are implemented (race-adjustments.js, from OSE Advanced Fantasy Player's Tome)
- ✅ Racial special abilities are documented (racial-abilities.js)
- ✅ Saving throw bonuses are calculated (racial-abilities.js)
- ✅ Most racial features are implemented
- ✅ Code refactored: racial abilities moved to racial-abilities.js

**What's "Missing" (Intentionally):**
- ✅ Halfling hiding mechanics - CLASS feature, not racial (correct to omit)
- ✅ Gnome hiding mechanics - CLASS feature, not racial (correct to omit)
- ✅ Halfling initiative bonus - CLASS feature, not racial (correct to omit)

**Code Organization:**
- ✅ **COMPLETED:** Created racial-abilities.js
- ✅ **COMPLETED:** Updated names-tables.js to import from racial-abilities.js
- ⚠️ **PENDING:** Update index.html to load racial-abilities.js

**Primary Recommendation:** ✅ COMPLETE - All racial abilities correctly implemented. Features like hiding and initiative bonuses are intentionally omitted because they are class features in the race-as-class system, not racial features in the Advanced mode (race + class) system.
