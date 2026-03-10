# Class Import Plan

## Overview
Import character classes from two sources:
1. **OSE Standard** - Official OSE SRD classes for Normal Mode
2. **Smoothified Mode** - Modified Gygar classes with adjusted progressions

Both modes now support the same 9 classes, with different saving throw and attack bonus progressions.

## Class List (Both Modes)

### Human Classes (4)
1. **Cleric** - Divine spellcaster
2. **Fighter** - Warrior
3. **Magic-User** - Arcane spellcaster
4. **Thief** - Skilled adventurer

### Demihuman Classes (4)
5. **Dwarf** - Demihuman fighter
6. **Elf** - Demihuman fighter/magic-user
7. **Halfling** - Demihuman fighter
8. **Gnome** - Demihuman illusionist/thief

### Smoothified-Only Class (1)
9. **Spellblade** - Gygar-specific fighter/magic-user (replaces Elf in Smoothified Mode)

## Source Files

### OSE Standard (Normal Mode)
**Source:** OSE SRD website (https://oldschoolessentials.necroticgnome.com/) and Advanced Fantasy Player's Tome

**Markdown Files Created:**
- OSE_CLERIC.md, OSE_FIGHTER.md, OSE_MAGIC_USER.md, OSE_THIEF.md
- OSE_DWARF.md, OSE_ELF.md, OSE_HALFLING.md, OSE_GNOME.md

### Smoothified Mode (Gygar)
**Source:** Castle Gygar project (`/var/home/bmfrosty/git/castle-gygar-custom-ose/`)

**Markdown Files Created:**
- GYGAR_CLERIC.md, GYGAR_FIGHTER.md, GYGAR_MAGIC_USER.md, GYGAR_THIEF.md
- GYGAR_DWARF.md, GYGAR_ELF.md, GYGAR_HALFLING.md, GYGAR_GNOME.md
- GYGAR_SPELLBLADE.md (unique to Smoothified Mode)

### Comparison Documents
- **OSE_VS_GYGAR.md** - Comprehensive comparison of all classes
- **ELF_VS_SPELLBLADE.md** - Detailed Elf vs Spellblade comparison
- **RACIAL_FEATURES_AUDIT.md** - Code implementation audit

## Phase 1: Convert to Markdown ✅ COMPLETE

### OSE Standard Classes
- [x] Import Cleric → OSE_CLERIC.md ✅
- [x] Import Fighter → OSE_FIGHTER.md ✅
- [x] Import Magic-User → OSE_MAGIC_USER.md ✅
- [x] Import Thief → OSE_THIEF.md ✅
- [x] Import Dwarf → OSE_DWARF.md ✅
- [x] Import Elf → OSE_ELF.md ✅
- [x] Import Halfling → OSE_HALFLING.md ✅
- [x] Import Gnome → OSE_GNOME.md ✅

### Smoothified Mode Classes
- [x] Convert Cleric → GYGAR_CLERIC.md ✅
- [x] Convert Fighter → GYGAR_FIGHTER.md ✅
- [x] Convert Magic-User → GYGAR_MAGIC_USER.md ✅
- [x] Convert Thief → GYGAR_THIEF.md ✅
- [x] Convert Dwarf → GYGAR_DWARF.md ✅
- [x] Convert Elf → GYGAR_ELF.md ✅
- [x] Convert Halfling → GYGAR_HALFLING.md ✅
- [x] Convert Gnome → GYGAR_GNOME.md ✅
- [x] Convert Spellblade → GYGAR_SPELLBLADE.md ✅

### Markdown Format
Each file includes:
- Class name and description
- Requirements (ability scores)
- Prime requisite
- Hit dice
- Maximum level
- Armor restrictions
- Weapon restrictions
- Languages
- **Saving throw progression table** (levels 1-14)
- **Attack bonus progression table** (levels 1-14)
- Class abilities by level
- Spell progression (if applicable)
- XP requirements table
- Special notes (demihuman level limits, racial abilities, etc.)

## Phase 2: Create Comparison Documents ✅ COMPLETE

- [x] Compare all classes (OSE vs Gygar) ✅
  - [x] Saving throw differences ✅
  - [x] Attack bonus differences ✅
  - [x] Spell slot differences ✅
  - [x] XP requirement differences ✅
  - [x] Thief skill differences ✅
- [x] Create OSE_VS_GYGAR.md with comparison tables ✅
- [x] Create ELF_VS_SPELLBLADE.md for detailed Elf comparison ✅
- [x] Create RACIAL_FEATURES_AUDIT.md documenting code implementation ✅
- [x] Highlight key differences ✅
- [x] Document mode-specific features ✅

## Phase 3: Code Refactoring ✅ COMPLETE

- [x] Created racial-abilities.js for better organization ✅
- [x] Updated names-tables.js to import from racial-abilities.js ✅
- [x] Updated index.html to load racial-abilities.js ✅
- [x] All tests passing ✅

## Phase 4: Extract Data Tables (PENDING)
Create structured data from the markdown files for level 1+ implementation.

### OSE Standard Data
- [ ] Extract OSE Cleric data
- [ ] Extract OSE Fighter data
- [ ] Extract OSE Magic-User data
- [ ] Extract OSE Thief data
- [ ] Extract OSE Dwarf data
- [ ] Extract OSE Elf data
- [ ] Extract OSE Halfling data
- [ ] Extract OSE Gnome data

### Smoothified Mode Data
- [ ] Extract Gygar Cleric data
- [ ] Extract Gygar Fighter data
- [ ] Extract Gygar Magic-User data
- [ ] Extract Gygar Thief data
- [ ] Extract Gygar Dwarf data
- [ ] Extract Gygar Elf data
- [ ] Extract Gygar Halfling data
- [ ] Extract Gygar Gnome data
- [ ] Extract Gygar Spellblade data

## Phase 5: Create JavaScript Data Files (PENDING)

### OSE Standard
- [ ] Create `class-data-ose.js`
- [ ] Add all 8 OSE class data structures
- [ ] Add helper functions
- [ ] Export module for Node.js and browser

### Smoothified Mode
- [ ] Create `class-data-gygar.js`
- [ ] Add all 9 Gygar class data structures
- [ ] Add helper functions
- [ ] Export module for Node.js and browser

### Helper Functions (Both Files)
- [ ] `getClassData(className, level)`
- [ ] `getSavingThrows(className, level)`
- [ ] `getAttackBonus(className, level)`
- [ ] `getHitDice(className, level)`
- [ ] `getSpellSlots(className, level)` (for spellcasters)
- [ ] `getThiefSkills(level)` (for thieves)
- [ ] `getXPRequired(className, level)`

## Phase 6: Integration (PENDING)
Integrate class data into the character generator.

- [ ] Update character generation:
  - [ ] Add mode selection (Normal vs Smoothified)
  - [ ] Add class selection logic
  - [ ] Apply class-based saves/attack bonus
  - [ ] Handle spell slots for spellcasters
  - [ ] Handle thief skills
  - [ ] Handle Spellblade (Smoothified only)
- [ ] Update `names-tables.js`:
  - [ ] Import class data modules
  - [ ] Update `calculateSavingThrows()` to use class data when level > 0
  - [ ] Update `calculateAttackBonus()` to use class data when level > 0
- [ ] Update all renderers:
  - [ ] Display class name
  - [ ] Display spell slots (if applicable)
  - [ ] Display thief skills (if applicable)
  - [ ] Display class abilities

## Phase 7: UI Updates (PENDING)
Add UI controls for class selection.

- [ ] Add level selection dropdown (0-14)
- [ ] Add mode toggle (Normal vs Smoothified)
- [ ] Add class selection (when level > 0):
  - [ ] Show available classes based on race and mode
  - [ ] Enforce class requirements (ability minimums)
  - [ ] Handle Spellblade (Smoothified only)
- [ ] Update character display:
  - [ ] Show class and level
  - [ ] Show spell slots (spellcasters)
  - [ ] Show thief skills (thieves)
  - [ ] Show class abilities
- [ ] Update PDF/PNG renderers:
  - [ ] Add class/level to sheet
  - [ ] Add spell slots section
  - [ ] Add thief skills section

## Phase 8: Documentation (PENDING)
Document the classes and mode differences.

- [ ] Update README.md:
  - [ ] Add Normal Mode section
  - [ ] Add Smoothified Mode section
  - [ ] List available classes for each mode
  - [ ] Explain mode differences
- [ ] Update PLAN_TODO.md:
  - [ ] Mark class import tasks complete
  - [ ] Update implementation order

## Phase 9: Testing (PENDING)
Test all classes at various levels in both modes.

### OSE Standard Testing
- [ ] Test OSE Cleric (levels 1, 5, 10, 14)
- [ ] Test OSE Fighter (levels 1, 5, 10, 14)
- [ ] Test OSE Magic-User (levels 1, 5, 10, 14)
- [ ] Test OSE Thief (levels 1, 5, 10, 14)
- [ ] Test OSE Dwarf (levels 1, 5, 10, 12)
- [ ] Test OSE Elf (levels 1, 5, 10)
- [ ] Test OSE Halfling (levels 1, 5, 8)
- [ ] Test OSE Gnome (levels 1, 5, 8)

### Smoothified Mode Testing
- [ ] Test Gygar Cleric (levels 1, 5, 10, 14)
- [ ] Test Gygar Fighter (levels 1, 5, 10, 14)
- [ ] Test Gygar Magic-User (levels 1, 5, 10, 14)
- [ ] Test Gygar Thief (levels 1, 5, 10, 14)
- [ ] Test Gygar Dwarf (levels 1, 5, 10, 14)
- [ ] Test Gygar Elf (levels 1, 5, 10, 14)
- [ ] Test Gygar Halfling (levels 1, 5, 10, 14)
- [ ] Test Gygar Gnome (levels 1, 5, 10, 14)
- [ ] Test Gygar Spellblade (levels 1, 5, 10)

### Verification
- [ ] Verify saving throws match source documents
- [ ] Verify attack bonuses match source documents
- [ ] Verify spell slots match source documents
- [ ] Compare OSE vs Gygar progressions
- [ ] Test mode switching
- [ ] Test PDF/PNG generation
- [ ] Test all output formats

## Key Differences: OSE Standard vs Smoothified Mode

### OSE Standard (Normal Mode)
- Uses official OSE SRD progressions
- Demihuman classes have level limits:
  - Dwarf: Max level 12
  - Elf: Max level 10
  - Halfling: Max level 8
  - Gnome: Max level 8
- Elf is a fighter/magic-user hybrid
- No Spellblade class
- Standard saving throw progressions
- Standard attack bonus progressions

### Smoothified Mode (Gygar)
- Modified saving throw progressions (smoother curves)
- Modified attack bonus progressions
- Spellblade class (unique to Smoothified Mode)
- Elves can use either Elf or Spellblade class
- Gnome class available (same as OSE)
- All classes max at level 14 (except Spellblade at 10)
- Different XP requirements
- Level 0 attack bonus: 0 (vs -1 in Normal Mode)

### Demihuman Level Limits (OSE Standard Only)

| Class | Max Level | Hit Dice at Max |
|-------|-----------|-----------------|
| Dwarf | 12 | 9d8+3* |
| Elf | 10 | 9d6+2* |
| Halfling | 8 | 8d6 |
| Gnome | 8 | 8d4 |

\* Constitution modifiers no longer apply after 9th level

## Notes

- OSE Basic uses classes, not races (Dwarf is a class, not a race)
- OSE Advanced uses races with racial abilities (Dwarf is a race)
- This generator supports both approaches
- Level 0 characters are always Advanced-style (races with abilities)
- Level 1+ can use either Basic (classes) or Advanced (races + classes)
- Smoothified Mode is a variant of Advanced rules
- Both modes now support the same 9 classes (except Spellblade is Smoothified-only)

## Success Criteria

- [x] Phase 1: All classes converted to markdown (OSE and Gygar) ✅
- [x] Phase 2: Comparison documents created ✅
- [x] Phase 3: Code refactoring complete ✅
- [ ] Phase 4: All data extracted (PENDING - for level 1+ implementation)
- [ ] Phase 5: JavaScript data files created and tested (PENDING - for level 1+ implementation)
- [ ] Phase 6: Integration complete (PENDING - for level 1+ implementation)
- [ ] Phase 7: UI updated for class selection (PENDING - for level 1+ implementation)
- [ ] Phase 8: Documentation complete (PENDING - for level 1+ implementation)
- [ ] Phase 9: All tests passing (PENDING - for level 1+ implementation)
- [ ] Can generate level 1-14 characters in Normal Mode (PENDING - for level 1+ implementation)
- [ ] Can generate level 1-14 characters in Smoothified Mode (PENDING - for level 1+ implementation)
- [ ] Can switch between modes seamlessly (PENDING - for level 1+ implementation)

## Phases 1-3 Complete! ✅

**Completed Files:**
- **OSE Standard:** OSE_CLERIC.md, OSE_FIGHTER.md, OSE_MAGIC_USER.md, OSE_THIEF.md, OSE_DWARF.md, OSE_ELF.md, OSE_HALFLING.md, OSE_GNOME.md
- **Smoothified Mode:** GYGAR_CLERIC.md, GYGAR_FIGHTER.md, GYGAR_MAGIC_USER.md, GYGAR_THIEF.md, GYGAR_DWARF.md, GYGAR_ELF.md, GYGAR_HALFLING.md, GYGAR_GNOME.md, GYGAR_SPELLBLADE.md
- **Comparisons:** OSE_VS_GYGAR.md, ELF_VS_SPELLBLADE.md, RACIAL_FEATURES_AUDIT.md
- **Code:** racial-abilities.js created and integrated

**Next Steps:** Phases 4-9 will be completed when implementing level 1+ character generation.
