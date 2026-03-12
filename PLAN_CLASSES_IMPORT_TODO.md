# Class Import Plan - PENDING WORK

> **Note:** This file contains all pending phases. For completed work, see **PLAN_CLASSES_IMPORT_COMPLETE.md**

## Phase 7D: Ability Score Input (advanced.html) - PENDING
Add ability score input controls for Advanced Mode (mirror Basic Mode features).

- [ ] Add ability score input fields (STR, INT, WIS, DEX, CON, CHA)
  - [ ] 2x3 grid layout (STR/INT/WIS, DEX/CON/CHA)
  - [ ] Values act as minimums when rolling, or fixed scores when checked
  - [ ] Default values: 3
- [ ] Add checkbox: "Use fixed ability scores"
- [ ] Add "Roll Abilities" button (disabled when "Use fixed" is checked)
- [ ] Add "Test HP Rolling" button (like Basic Mode)
- [ ] Split options into separate checkboxes:
  - [ ] Tough Characters: STR/DEX/INT/WIS ≥ 13
  - [ ] Healthy Characters: HP ≥ 2 at initial level
  - [ ] Include Level 0 HP: Add 1d4+CON to total HP
  - [ ] Show Undead Monster Names: Display monster names for Turn Undead
- [ ] Apply racial adjustments to ability scores:
  - [ ] Dwarf: +1 CON, -1 CHA
  - [ ] Elf: +1 DEX, -1 CON
  - [ ] Gnome: +1 INT, -1 STR
  - [ ] Halfling: +1 DEX, -1 STR
  - [ ] Human: No adjustments
- [ ] Display both base and adjusted scores
- [ ] Display ability modifiers (use adjusted scores)
- [ ] Show prime requisite XP bonus (use adjusted scores)
- [ ] Enforce class requirements when rolling (like Basic Mode)
- [ ] **Update PLAN_CLASSES_IMPORT_TODO.md when complete** ✅

## Phase 7E: Character Generation Logic (advanced.html) - PENDING
Implement character generation for Advanced Mode (mirror Basic Mode architecture).

- [ ] Refactor into ES6 modules (like Basic Mode):
  - [ ] advanced-utils.js - Utility functions
  - [ ] advanced-character-gen.js - Character generation
  - [ ] advanced-ui.js - UI logic and state management
- [ ] Import class-data-ose.js and class-data-gygar.js as ES6 modules
- [ ] Implement rollAbilities() with class requirement enforcement
- [ ] Implement rollHitPoints() with all options:
  - [ ] Level 0 HP option
  - [ ] Healthy Characters option
  - [ ] CON modifier handling
  - [ ] Asterisk (*) handling for no CON after 9th level
- [ ] Implement getClassProgressionData():
  - [ ] Saving throws (base + racial bonuses)
  - [ ] Attack bonus
  - [ ] XP tracking
  - [ ] Prime requisite XP bonus
- [ ] Implement getClassFeatures():
  - [ ] Spell slots (if spellcaster)
  - [ ] Thief skills (if Thief)
  - [ ] Turn undead (if Cleric) - use HD categories
  - [ ] Class abilities
- [ ] Implement getRacialAbilities():
  - [ ] Get abilities from racial-abilities.js
  - [ ] Format for display
- [ ] Apply racial saving throw bonuses:
  - [ ] Dwarf Resilience (CON-based bonus to Death/Wands/Spells)
  - [ ] Gnome Magic Resistance (CON-based bonus to Wands/Spells)
  - [ ] Halfling Resilience (CON-based bonus to Death/Wands/Spells)
- [ ] Implement createCharacter():
  - [ ] Level, race, class, mode
  - [ ] Base ability scores
  - [ ] Adjusted ability scores (with racial modifiers)
  - [ ] Hit points (current/max)
  - [ ] Saving throws (with racial bonuses)
  - [ ] Attack bonus
  - [ ] XP tracking
  - [ ] Spell slots, thief skills, turn undead
  - [ ] Class abilities and racial abilities
- [ ] Comprehensive console logging (like Basic Mode)
- [ ] **Update PLAN_CLASSES_IMPORT_TODO.md when complete** ✅

## Phase 7F: Character Display (advanced.html) - PENDING
Display generated character in HTML for Advanced Mode (mirror Basic Mode display).

- [ ] Show character header:
  - [ ] Race and class name, level
  - [ ] Mode (Normal/Smoothified)
- [ ] Show ability scores section:
  - [ ] Base scores (before racial adjustments)
  - [ ] Adjusted scores (after racial adjustments)
  - [ ] Modifiers (from adjusted scores)
  - [ ] Show XP bonus from prime requisite
- [ ] Show combat stats:
  - [ ] Hit points (current/max)
  - [ ] Attack bonus
  - [ ] Armor Class (base 9, before armor)
- [ ] Show saving throws table:
  - [ ] Base values from class data
  - [ ] Racial bonuses (if applicable)
  - [ ] Final values (base + racial)
- [ ] Show XP tracking:
  - [ ] Current XP (0 for new character)
  - [ ] XP for current level
  - [ ] XP for next level
  - [ ] XP bonus percentage
- [ ] Show spell slots (if spellcaster):
  - [ ] Only show non-zero slots
  - [ ] Format: "Level 1: 2 slots"
- [ ] Show thief skills (if Thief):
  - [ ] Convert camelCase to Title Case
  - [ ] Display with percentages
- [ ] Show turn undead (if Cleric):
  - [ ] Use HD categories by default
  - [ ] Show monster names if checkbox checked
  - [ ] Handle null values with "-"
- [ ] Show class abilities:
  - [ ] List all abilities available at current level
  - [ ] Include descriptions
- [ ] Show racial abilities (all races):
  - [ ] Languages
  - [ ] Special abilities (infravision, detect doors, etc.)
  - [ ] Combat bonuses
  - [ ] Saving throw bonuses
- [ ] Add note: "Check the browser console for detailed generation log"
- [ ] Auto-scroll to character display
- [ ] **Update PLAN_CLASSES_IMPORT_TODO.md when complete** ✅

## Phase 7G: PDF/PNG Renderers - PENDING
Update renderers for level 1+ characters (DEFERRED until after testing HTML display).

- [ ] Update canvas-sheet-renderer.js
- [ ] Update underground-sheet-renderer.js
- [ ] Add class/level to sheet
- [ ] Add spell slots section
- [ ] Add thief skills section (current level only)
- [ ] Add turn undead section (current level only)
- [ ] Add racial abilities section
- [ ] **Update PLAN_CLASSES_IMPORT_TODO.md when complete** ✅

## Advanced Mode UI (advanced.html) - PARTIALLY COMPLETE

### Completed ✅
- [x] Add level selection (radio buttons 1-14) ✅
- [x] Add mode toggle (Normal vs Smoothified) ✅
- [x] Add race/class selection grid (buttons) ✅
- [x] Add checkbox: "Allow non-traditional race/class combinations" ✅
- [x] Add checkbox: "Allow Elf and Spellblade past level 10" ✅

### Pending
- [ ] Show class requirements (ability minimums) on hover/click
- [ ] Update character display:
  - [ ] Show race, class, and level
  - [ ] Show racial abilities
  - [ ] Show spell slots (spellcasters)
  - [ ] Show thief skills (current level only - single row)
  - [ ] Show turn undead (current level only - single row)
  - [ ] Show class abilities
- [ ] Update PDF/PNG renderers:
  - [ ] Add race/class/level to sheet
  - [ ] Add racial abilities section
  - [ ] Add spell slots section
  - [ ] Add thief skills section (current level only)
  - [ ] Add turn undead section (current level only)

## CLI Updates (generate-pdf.sh) - PENDING

- [ ] Add `--basic` flag for Basic Mode generation
- [ ] Add `--advanced` flag for Advanced Mode generation (default for level 0)
- [ ] Add `--level NUM` option (0-14, default: 0)
- [ ] When `--level > 0` and `--basic`:
  - [ ] Generate Basic Mode character (race-as-class)
  - [ ] Use class-data-ose.js or class-data-gygar.js based on --gygar flag
- [ ] When `--level > 0` and `--advanced`:
  - [ ] Generate Advanced Mode character (race + class)
  - [ ] Apply racial adjustments
  - [ ] Use class-data-ose.js or class-data-gygar.js based on --gygar flag
- [ ] Maintain backward compatibility (level 0 defaults to current behavior)

## Phase 8: Documentation - PENDING
Document the classes and mode differences.

- [ ] Update README.md:
  - [ ] Add Normal Mode section
  - [ ] Add Smoothified Mode section
  - [ ] List available classes for each mode
  - [ ] Explain mode differences
- [ ] Update PLAN_TODO.md:
  - [ ] Mark class import tasks complete
  - [ ] Update implementation order

## Phase 9: Testing - PENDING
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

## Success Criteria (Pending)

- [ ] Phase 7D-7F: Advanced Mode implementation complete
- [ ] Phase 7G: PDF/PNG renderers updated
- [ ] Phase 8: Documentation complete
- [ ] Phase 9: All tests passing
- [ ] Can generate level 1-14 characters in OSE Standard Mode
- [ ] Can generate level 1-14 characters in Smoothified Mode
- [ ] Can switch between modes seamlessly

## Notes

### UI Architecture
- **index.html** - Level 0 generator (current implementation)
- **basic.html** - Basic Mode generator (levels 1-14) ✅ COMPLETE
- **advanced.html** - Advanced Mode generator (levels 1-14) - PENDING

### Next Steps
1. Implement Phase 7D (Advanced Mode ability scores)
2. Implement Phase 7E (Advanced Mode character generation)
3. Implement Phase 7F (Advanced Mode character display)
4. Update PDF/PNG renderers (Phase 7G)
5. Complete documentation (Phase 8)
6. Run comprehensive tests (Phase 9)

---

**For completed work, see PLAN_CLASSES_IMPORT_COMPLETE.md**
