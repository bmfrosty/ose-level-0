# OSE Standard Class Import Plan

## Overview
Import the standard OSE classes from the OSE SRD website and Advanced Fantasy Player's Tome. These will be used for Normal Mode (non-Gygar) character generation at levels 1+.

## Source Files

### Part 1: OSE SRD Website (Basic Classes)
**Source:** https://oldschoolessentials.necroticgnome.com/srd/index.php/Main_Page

**Note:** Use the OSE SRD website to import the 7 standard OSE classes with official progressions.

**7 Basic Classes:**
1. **Cleric** - Divine spellcaster
2. **Fighter** - Warrior
3. **Magic-User** - Arcane spellcaster
4. **Thief** - Skilled adventurer
5. **Dwarf** - Demihuman class (not race)
6. **Elf** - Demihuman class (not race)
7. **Halfling** - Demihuman class (not race)

### Part 2: Advanced Fantasy Player's Tome
Source: OSE Advanced Fantasy Player's Tome PDF

**8th Class:**
8. **Gnome** - Demihuman class from Advanced rules

## Phase 1: Import Basic Classes from OSE SRD
Convert the 7 basic classes from the OSE website to markdown.

- [ ] Import Cleric → `OSE_CLERIC.md`
- [ ] Import Fighter → `OSE_FIGHTER.md`
- [ ] Import Magic-User → `OSE_MAGIC_USER.md`
- [ ] Import Thief → `OSE_THIEF.md`
- [ ] Import Dwarf → `OSE_DWARF.md`
- [ ] Import Elf → `OSE_ELF.md` (Note: Should be similar to Spellblade)
- [ ] Import Halfling → `OSE_HALFLING.md`
- [ ] Create `ELF_VS_SPELLBLADE.md` - Document specific differences between OSE Elf and Gygar Spellblade

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
- Special notes (demihuman level limits, etc.)

## Phase 2: Import Gnome from Advanced Tome
Import the Gnome class from the Advanced Fantasy Player's Tome.

- [ ] Import Gnome → `OSE_GNOME.md`
  - [ ] Class description
  - [ ] Requirements
  - [ ] Hit dice
  - [ ] Maximum level
  - [ ] Saving throw progression
  - [ ] Attack bonus progression
  - [ ] Racial abilities
  - [ ] XP requirements

## Phase 3: Compare Gygar vs OSE Classes
Create comparison document showing differences.

- [ ] Compare Cleric (Gygar vs OSE)
  - [ ] Saving throw differences
  - [ ] Attack bonus differences
  - [ ] Spell slot differences
  - [ ] XP requirement differences
- [ ] Compare Fighter (Gygar vs OSE)
  - [ ] Saving throw differences
  - [ ] Attack bonus differences
  - [ ] XP requirement differences
- [ ] Compare Magic-User (Gygar vs OSE)
  - [ ] Saving throw differences
  - [ ] Attack bonus differences
  - [ ] Spell slot differences
  - [ ] XP requirement differences
- [ ] Compare Thief (Gygar vs OSE)
  - [ ] Saving throw differences
  - [ ] Attack bonus differences
  - [ ] Thief skill differences
  - [ ] XP requirement differences
- [ ] Compare Demihuman classes
  - [ ] Dwarf (Gygar vs OSE)
  - [ ] Elf (Gygar Spellblade vs OSE Elf)
  - [ ] Halfling (Gygar vs OSE)
  - [ ] Gnome (OSE only - not in Gygar)

## Phase 4: Create Comparison Document
Create `GYGAR_VS_OSE_COMPARISON.md` with detailed tables.

- [ ] Create comparison tables for each class
- [ ] Highlight key differences
- [ ] Document Gygar-specific features (Spellblade)
- [ ] Document OSE-specific features
- [ ] Note level limits for demihumans
- [ ] Note XP progression differences

## Phase 5: Extract Data Tables
Create structured data from the markdown files.

- [ ] Extract OSE Cleric data
- [ ] Extract OSE Fighter data
- [ ] Extract OSE Magic-User data
- [ ] Extract OSE Thief data
- [ ] Extract OSE Dwarf data
- [ ] Extract OSE Elf data
- [ ] Extract OSE Halfling data
- [ ] Extract OSE Gnome data

## Phase 6: Create JavaScript Data File
Create `class-data-ose.js` with all standard OSE class data.

- [ ] Create file structure
- [ ] Add Cleric class data
- [ ] Add Fighter class data
- [ ] Add Magic-User class data
- [ ] Add Thief class data
- [ ] Add Dwarf class data
- [ ] Add Elf class data
- [ ] Add Halfling class data
- [ ] Add Gnome class data
- [ ] Add helper functions (same as Gygar)
- [ ] Export module for Node.js and browser

## Phase 7: Integration
Integrate OSE class data into the character generator.

- [ ] Update character generation to support mode selection:
  - [ ] Gygar Mode: Use `class-data-gygar.js`
  - [ ] Normal Mode: Use `class-data-ose.js`
- [ ] Add mode toggle in UI
- [ ] Update class selection based on mode
- [ ] Handle Spellblade (Gygar only)
- [ ] Handle Gnome (OSE only)
- [ ] Handle Elf differences (Spellblade in Gygar, standard Elf in OSE)

## Phase 8: Documentation
Document the OSE classes and mode differences.

- [ ] Update README.md:
  - [ ] Add Normal Mode section
  - [ ] List OSE classes
  - [ ] Explain mode differences
- [ ] Create OSE_CLASSES.md:
  - [ ] Overview of standard OSE
  - [ ] Class descriptions
  - [ ] Demihuman level limits
- [ ] Update PLAN_TODO.md:
  - [ ] Mark OSE import tasks complete
  - [ ] Update implementation order

## Phase 9: Testing
Test all OSE classes at various levels.

- [ ] Test OSE Cleric (levels 1, 5, 10, 14)
- [ ] Test OSE Fighter (levels 1, 5, 10, 14)
- [ ] Test OSE Magic-User (levels 1, 5, 10, 14)
- [ ] Test OSE Thief (levels 1, 5, 10, 14)
- [ ] Test OSE Dwarf (levels 1, 5, 10, 12)
- [ ] Test OSE Elf (levels 1, 5, 10)
- [ ] Test OSE Halfling (levels 1, 5, 8)
- [ ] Test OSE Gnome (levels 1, 5, 8)
- [ ] Verify saving throws match OSE SRD
- [ ] Verify attack bonuses match OSE SRD
- [ ] Compare with Gygar versions
- [ ] Test mode switching

## Key Differences: OSE vs Gygar

### Standard OSE (Normal Mode)
- Uses official OSE SRD progressions
- Demihuman classes have level limits:
  - Dwarf: Max level 12
  - Elf: Max level 10
  - Halfling: Max level 8
  - Gnome: Max level 8
- Elf is a fighter/magic-user hybrid (not Spellblade)
- No Spellblade class
- Standard saving throw progressions
- Standard attack bonus progressions

### Gygar Mode
- Modified saving throw progressions
- Modified attack bonus progressions
- Spellblade class (unique to Gygar)
- Elves use Spellblade progression
- No Gnome class
- All classes max at level 14 (except Spellblade at 10)
- Different XP requirements

## Demihuman Level Limits (OSE Standard)

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
- This generator will support both approaches
- Level 0 characters are always Advanced-style (races with abilities)
- Level 1+ can use either Basic (classes) or Advanced (races + classes)
- Gygar Mode is a variant of Advanced rules

## Success Criteria

- [x] Phase 1: All 7 basic classes imported from OSE SRD
- [ ] Phase 2: Gnome class imported from Advanced Tome
- [ ] Phase 3: Comparison document created
- [ ] Phase 4: All differences documented
- [ ] Phase 5: All data extracted
- [ ] Phase 6: `class-data-ose.js` created and tested
- [ ] Phase 7: Integration complete with mode selection
- [ ] Phase 8: Documentation complete
- [ ] Phase 9: All tests passing
- [ ] Can generate level 1-14 characters in Normal Mode
- [ ] Can generate level 1-14 characters in Gygar Mode
- [ ] Can switch between modes seamlessly
