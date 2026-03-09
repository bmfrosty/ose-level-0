# Gygar Class Import Plan

## Overview
Import the 5 custom OSE classes from the Castle Gygar project into this Level 0 generator. These classes use modified saving throw and attack bonus progressions specific to the Gygar campaign.

## Source Files
Located in: `/var/home/bmfrosty/git/castle-gygar-custom-ose/`

### Classes to Import
1. **Cleric** - 2 pages (cleric-page1.html, cleric-page2.html)
2. **Fighter** - 1 page (fighter.html)
3. **Magic-User** - 1 page (magic-user.html)
4. **Thief** - 2 pages (thief-page1.html, thief-page2.html)
5. **Spellblade** - 1 page (spellblade.html) - Gygar-specific class

## Phase 1: Convert HTML to Markdown ✅ COMPLETE
Convert each class from HTML to Markdown format with GYGAR_ prefix.

- [x] Convert Cleric (pages 1-2) → `GYGAR_CLERIC.md`
- [x] Convert Fighter → `GYGAR_FIGHTER.md`
- [x] Convert Magic-User → `GYGAR_MAGIC_USER.md`
- [x] Convert Thief (pages 1-2) → `GYGAR_THIEF.md`
- [x] Convert Spellblade → `GYGAR_SPELLBLADE.md`

### Markdown Format
Each file should include:
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

## Phase 2: Extract Data Tables
Create structured data from the markdown files.

- [ ] Extract Cleric data
  - [ ] Saving throws by level
  - [ ] Attack bonus by level
  - [ ] Hit dice progression
  - [ ] Spell slots by level
  - [ ] Class abilities
  - [ ] XP requirements
- [ ] Extract Fighter data
  - [ ] Saving throws by level
  - [ ] Attack bonus by level
  - [ ] Hit dice progression
  - [ ] Class abilities
  - [ ] XP requirements
- [ ] Extract Magic-User data
  - [ ] Saving throws by level
  - [ ] Attack bonus by level
  - [ ] Hit dice progression
  - [ ] Spell slots by level
  - [ ] Class abilities
  - [ ] XP requirements
- [ ] Extract Thief data
  - [ ] Saving throws by level
  - [ ] Attack bonus by level
  - [ ] Hit dice progression
  - [ ] Thief skills by level
  - [ ] Class abilities
  - [ ] XP requirements
- [ ] Extract Spellblade data
  - [ ] Saving throws by level
  - [ ] Attack bonus by level
  - [ ] Hit dice progression
  - [ ] Spell slots by level
  - [ ] Class abilities
  - [ ] XP requirements

## Phase 3: Create JavaScript Data File
Create `class-data-gygar.js` with all class data.

- [ ] Create file structure
- [ ] Add Cleric class data
- [ ] Add Fighter class data
- [ ] Add Magic-User class data
- [ ] Add Thief class data
- [ ] Add Spellblade class data
- [ ] Add helper functions:
  - [ ] `getClassData(className, level)`
  - [ ] `getSavingThrows(className, level)`
  - [ ] `getAttackBonus(className, level)`
  - [ ] `getHitDice(className, level)`
  - [ ] `getSpellSlots(className, level)` (for spellcasters)
  - [ ] `getXPRequired(className, level)`
- [ ] Export module for Node.js and browser

## Phase 4: Create Demihuman Class Data
Gygar Mode has different progressions for demihuman classes.

- [ ] Create Gygar Dwarf class data
  - [ ] Saving throw progression (different from standard)
  - [ ] Attack bonus progression
  - [ ] Hit dice (d8)
  - [ ] Keep racial abilities (Resilience, etc.)
  - [ ] XP requirements
- [ ] Create Gygar Elf class data
  - [ ] **Use Spellblade progression** (Elf = Spellblade in Gygar)
  - [ ] Attack bonus progression
  - [ ] Hit dice (d6)
  - [ ] Keep racial abilities
  - [ ] Spell slots (same as Spellblade)
  - [ ] XP requirements
- [ ] Create Gygar Halfling class data
  - [ ] Saving throw progression (different from standard)
  - [ ] Attack bonus progression
  - [ ] Hit dice (d6)
  - [ ] Keep racial abilities (Resilience, etc.)
  - [ ] XP requirements
- [ ] Note: Gnome uses standard Gnome class (not in Gygar)

## Phase 5: Integration
Integrate class data into the character generator.

- [ ] Update `names-tables.js`:
  - [ ] Import class data module
  - [ ] Update `calculateSavingThrows()` to use class data when level > 0
  - [ ] Update `calculateAttackBonus()` to use class data when level > 0
- [ ] Update character generation:
  - [ ] Add class selection logic
  - [ ] Apply class-based saves/attack bonus
  - [ ] Handle spell slots for spellcasters
  - [ ] Handle thief skills
- [ ] Update all renderers:
  - [ ] Display class name
  - [ ] Display spell slots (if applicable)
  - [ ] Display thief skills (if applicable)
  - [ ] Display class abilities

## Phase 6: UI Updates
Add UI controls for class selection.

- [ ] Add level selection dropdown (0-14)
- [ ] Add class selection (when level > 0):
  - [ ] Show available classes based on race
  - [ ] Enforce class requirements (ability minimums)
- [ ] Update character display:
  - [ ] Show class and level
  - [ ] Show spell slots (spellcasters)
  - [ ] Show thief skills (thieves)
  - [ ] Show class abilities
- [ ] Update PDF/PNG renderers:
  - [ ] Add class/level to sheet
  - [ ] Add spell slots section
  - [ ] Add thief skills section

## Phase 7: Documentation
Document the Gygar classes and differences.

- [ ] Update README.md:
  - [ ] Add Gygar Mode section
  - [ ] List available classes
  - [ ] Note differences from standard OSE
- [ ] Create GYGAR_CLASSES.md:
  - [ ] Overview of Gygar Mode
  - [ ] Class-by-class comparison with standard OSE
  - [ ] Saving throw comparison tables
  - [ ] Attack bonus comparison tables
- [ ] Update PLAN_TODO.md:
  - [ ] Mark Gygar import tasks complete
  - [ ] Update implementation order

## Phase 8: Testing
Test all classes at various levels.

- [ ] Test Cleric (levels 1, 5, 10, 14)
- [ ] Test Fighter (levels 1, 5, 10, 14)
- [ ] Test Magic-User (levels 1, 5, 10, 14)
- [ ] Test Thief (levels 1, 5, 10, 14)
- [ ] Test Spellblade (levels 1, 5, 10, 14)
- [ ] Test Gygar Dwarf (levels 1, 5, 10)
- [ ] Test Gygar Elf (levels 1, 5, 10)
- [ ] Test Gygar Halfling (levels 1, 5, 10)
- [ ] Verify saving throws match source
- [ ] Verify attack bonuses match source
- [ ] Verify spell slots match source
- [ ] Test PDF/PNG generation
- [ ] Test all output formats

## Key Differences: Gygar vs Standard OSE

### Saving Throws
Gygar Mode uses different saving throw progressions for all classes. Need to extract exact values from HTML files.

### Attack Bonuses
Gygar Mode uses different attack bonus progressions. Need to extract exact values from HTML files.

### Spellblade Class
Unique to Gygar Mode. Combines fighting and magic abilities. Elves in Gygar Mode use Spellblade progression.

### Demihuman Classes
Dwarves, Elves, and Halflings have different progressions in Gygar Mode compared to standard OSE.

## Notes

- All Gygar classes are for levels 1-14
- Level 0 characters use the same rules regardless of mode
- Gygar Mode only affects level 1+ characters
- Spellblade is exclusive to Gygar Mode
- Elves in Gygar Mode = Spellblade class
- Need to preserve racial abilities when using demihuman classes

## Success Criteria

- [x] Phase 1: All 5 classes converted to markdown ✅
  - [x] GYGAR_CLERIC.md ✅
  - [x] GYGAR_FIGHTER.md ✅
  - [x] GYGAR_MAGIC_USER.md ✅
  - [x] GYGAR_THIEF.md ✅
  - [x] GYGAR_SPELLBLADE.md ✅
- [x] Demihuman class markdown created ✅
  - [x] GYGAR_DWARF.md ✅
  - [x] GYGAR_ELF.md ✅
  - [x] GYGAR_HALFLING.md ✅
  - [x] GYGAR_GNOME.md ✅
- [x] Comparison documents created ✅
  - [x] OSE_VS_GYGAR.md ✅
  - [x] ELF_VS_SPELLBLADE.md ✅
- [ ] Phase 2-8: Pending for level 1+ implementation
  - [ ] All class data extracted and structured
  - [ ] `class-data-gygar.js` created and tested
  - [ ] Integration complete (saves, attack bonus, spells)
  - [ ] UI updated for class selection
  - [ ] Documentation complete
  - [ ] All tests passing
  - [ ] Can generate level 1-14 characters in Gygar Mode

## Phase 1 Complete! ✅

**Completed Files:**
- GYGAR_CLERIC.md, GYGAR_FIGHTER.md, GYGAR_MAGIC_USER.md, GYGAR_THIEF.md, GYGAR_SPELLBLADE.md
- GYGAR_DWARF.md, GYGAR_ELF.md, GYGAR_HALFLING.md, GYGAR_GNOME.md
- OSE_VS_GYGAR.md - Comprehensive comparison of OSE vs Gygar progressions
- ELF_VS_SPELLBLADE.md - Detailed comparison of OSE Elf vs Gygar Spellblade

**Code Refactoring Complete:**
- Created racial-abilities.js for better code organization
- Updated names-tables.js to import from racial-abilities.js
- Updated index.html to load racial-abilities.js
- All tests passing

**Next Steps:** Phases 2-8 will be completed when implementing level 1+ character generation.
