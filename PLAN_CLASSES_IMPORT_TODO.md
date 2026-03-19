# Class Import Plan - ACTIVE WORK

> **Status:** Advanced Mode HTML display complete — PDF/PNG renderers (Phase 7G) are next
> **Completed:** Basic Mode (basic.html) ✅, Advanced Mode HTML display (7D/7E/7F) ✅
> **For completed work history:** See PLANS_COMPLETED/PLAN_CLASSES_IMPORT_COMPLETE.md

## Current Priority: Phase 7G — Update PDF/PNG Renderers for Level 1+

The Advanced Mode HTML generator is complete. Next up is updating the canvas renderers to support level 1+ characters:

## Phase 7D: Ability Score Input (advanced.html) - ✅ COMPLETE
Add ability score input controls for Advanced Mode (mirror Basic Mode features).

- [x] Add ability score input fields (STR, INT, WIS, DEX, CON, CHA)
  - [x] 2x3 grid layout (STR/INT/WIS, DEX/CON/CHA)
  - [x] Values act as minimums when rolling, or fixed scores when checked
  - [x] Default values: 3
- [x] Add checkbox: "Use fixed ability scores"
- [x] Add "Roll Abilities" button (disabled when "Use fixed" is checked)
- [x] Split options into separate checkboxes:
  - [x] Healthy Characters: HP ≥ 2 at initial level
  - [x] Include Level 0 HP: Add 1d4+CON to total HP
  - [x] Show Undead Monster Names: Display monster names for Turn Undead
- [x] Apply racial adjustments to ability scores
- [x] Display both base and adjusted scores
- [x] Display ability modifiers (use adjusted scores)
- [x] Show prime requisite XP bonus (use adjusted scores)
- [x] Enforce class requirements when rolling (like Basic Mode)

## Phase 7E: Character Generation Logic (advanced.html) - ✅ COMPLETE
Implement character generation for Advanced Mode (mirror Basic Mode architecture).

- [x] Refactor into ES6 modules (like Basic Mode):
  - [x] advanced-utils.js - Utility functions
  - [x] advanced-character-gen.js - Character generation
  - [x] advanced-ui.js - UI logic and state management
- [x] Import class-data-ose.js and class-data-gygar.js as ES6 modules
- [x] Implement rollAbilities() with class requirement enforcement
- [x] Implement rollHitPoints() with all options:
  - [x] Level 0 HP option
  - [x] Healthy Characters option
  - [x] CON modifier handling
- [x] Implement getClassProgressionData():
  - [x] Saving throws (base + racial bonuses)
  - [x] Attack bonus
  - [x] XP tracking
  - [x] Prime requisite XP bonus
- [x] Implement getClassFeatures():
  - [x] Spell slots (if spellcaster)
  - [x] Thief skills (if Thief)
  - [x] Turn undead (if Cleric) - use HD categories
  - [x] Class abilities
- [x] Implement getRacialAbilities():
  - [x] Get abilities from shared-racial-abilities.js
  - [x] Format for display
- [x] Apply racial saving throw bonuses:
  - [x] Dwarf Resilience (CON-based bonus to Death/Wands/Spells)
  - [x] Gnome Magic Resistance (CON-based bonus to Wands/Spells)
  - [x] Halfling Resilience (CON-based bonus to Death/Wands/Spells)
- [x] Implement createCharacterAdvanced():
  - [x] Level, race, class, mode
  - [x] Base ability scores
  - [x] Adjusted ability scores (with racial modifiers)
  - [x] Hit points (current/max)
  - [x] Saving throws (with racial bonuses)
  - [x] Attack bonus
  - [x] XP tracking
  - [x] Spell slots, thief skills, turn undead
  - [x] Class abilities and racial abilities
- [x] Comprehensive console logging

## Phase 7F: Character Display (advanced.html) - ✅ COMPLETE
Display generated character in HTML for Advanced Mode (mirror Basic Mode display).

- [x] Show character header: race, class, level, mode
- [x] Show ability scores section (base + adjusted + modifiers + XP bonus)
- [x] Show combat stats (HP, attack bonus, AC)
- [x] Show saving throws (Death, Wands, Paralysis, Breath, Spells)
- [x] Show XP tracking (current, for level, for next, bonus %)
- [x] Show spell slots (spellcasters only, non-zero slots)
- [x] Show thief skills (Thief only, camelCase → Title Case with %)
- [x] Show turn undead (Cleric only, HD or monster names, null → "-")
- [x] Show class abilities (with descriptions)
- [x] Show racial abilities (all races)
- [x] Console log note + auto-scroll to character display

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

## Advanced Mode UI (advanced.html) - ✅ COMPLETE

### Completed ✅
- [x] Level selection (radio buttons 1-14) ✅
- [x] Mode toggle (OSE Standard / Smoothified / Labyrinth Lord) ✅
- [x] Race/class selection grid (buttons) ✅
- [x] Race/class restriction options (Strict / Traditional Extended / Allow All) ✅
- [x] Prime requisite mode options (User Minimums / ≥9 / ≥13) ✅
- [x] Healthy Characters, Include Level 0 HP, Show Undead Names checkboxes ✅
- [x] Ability score inputs (2x3 grid, minimums or fixed) ✅
- [x] Character display with all sections (abilities, combat, saves, XP, features) ✅
- [x] Open in new tab option ✅

### Pending
- [ ] Show class requirements (ability minimums) on hover/click (optional enhancement)
- [ ] Update PDF/PNG renderers (Phase 7G)

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

## Success Criteria

- [x] Phase 7D-7F: Advanced Mode implementation complete ✅
- [ ] Phase 7G: PDF/PNG renderers updated
- [ ] Phase 8: Documentation complete
- [ ] Phase 9: All tests passing
- [x] Can generate level 1-14 characters in OSE Standard Mode ✅
- [x] Can generate level 1-14 characters in Smoothified Mode ✅
- [x] Can switch between modes seamlessly ✅

## Notes

### UI Architecture
- **index.html** - Level 0 generator (current implementation)
- **basic.html** - Basic Mode generator (levels 1-14) ✅ COMPLETE
- **advanced.html** - Advanced Mode generator (levels 1-14) ✅ COMPLETE (HTML display)

### Next Steps
1. ✅ Phase 7D - Advanced Mode ability scores
2. ✅ Phase 7E - Advanced Mode character generation
3. ✅ Phase 7F - Advanced Mode character display
4. Update PDF/PNG renderers (Phase 7G) ← **CURRENT**
5. Complete documentation (Phase 8)
6. Run comprehensive tests (Phase 9)

---

**For completed work, see PLAN_CLASSES_IMPORT_COMPLETE.md**
