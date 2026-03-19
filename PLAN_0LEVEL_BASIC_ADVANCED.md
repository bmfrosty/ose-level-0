# Level 0 with Basic/Advanced Mode Plan

## Overview
Level 0 characters are always generated using Advanced Fantasy rules (demihumans, racial abilities, etc.), but they need to be compatible with both Basic and Advanced campaigns. The "Advanced" checkbox determines whether ability score adjustments are applied, which affects compatibility with the target campaign.

## Understanding the Relationship

### Level 0 Characters
- Always use Advanced Fantasy rules for generation
- Always have racial abilities (except Humans in Basic mode)
- 1d4 hit points (with CON modifier)
- Background-based equipment
- No class
- THACO 20 [-1] or [0] in Gygar mode
- Saves: D14 W15 P16 B17 S18

### The "Advanced" Checkbox for Level 0
The checkbox determines **ability score adjustments** and **target campaign compatibility**:

**Advanced Checkbox UNCHECKED (Basic-compatible Level 0)**
- No racial ability score adjustments applied
- Racial abilities shown (except Humans)
- Character can advance to Basic classes (Fighter, Cleric, Magic-User, Thief)
- Compatible with Basic OSE campaigns

**Advanced Checkbox CHECKED (Advanced-compatible Level 0)**
- Racial ability score adjustments applied (e.g., Dwarf +1 CON, -1 CHA)
- Racial minimum requirements enforced (e.g., Dwarf needs CON 9)
- Racial abilities shown (including Humans if enabled)
- Character can advance to Advanced classes (Dwarf, Elf, Gnome, Halfling, or Basic classes)
- Compatible with Advanced OSE campaigns
- Additional features like Dwarf Resilience

## Recommended Implementation

### Two-Axis System
Instead of three separate modes, use a two-axis system:

**Axis 1: Character Level**
- Level 0 (current default)
- Level 1+ (future expansion)

**Axis 2: Campaign Type (Advanced Checkbox)**
- Basic (unchecked)
- Advanced (checked)

This creates four combinations:
1. **Level 0 + Basic**: Level 0 for Basic campaigns
2. **Level 0 + Advanced**: Level 0 for Advanced campaigns (current "Advanced" mode)
3. **Level 1+ + Basic**: Future - Basic class characters
4. **Level 1+ + Advanced**: Future - Advanced class characters

### Racial Abilities Matrix

| Race | Level 0 Basic | Level 0 Advanced | Level 1+ Basic | Level 1+ Advanced |
|------|---------------|------------------|----------------|-------------------|
| **Human** | None | Optional (if enabled) | None | Optional (if enabled) |
| **Dwarf** | Yes (no adjustments) | Yes (with adjustments + Resilience) | N/A (no race in Basic) | Yes (full abilities) |
| **Elf** | Yes (no adjustments) | Yes (with adjustments) | N/A (no race in Basic) | Yes (full abilities) |
| **Gnome** | Yes (no adjustments) | Yes (with adjustments) | N/A (no race in Basic) | Yes (full abilities) |
| **Halfling** | Yes (no adjustments) | Yes (with adjustments) | N/A (no race in Basic) | Yes (full abilities) |

### Level 0 Racial Abilities (Both Basic and Advanced)

**Dwarf**
- Languages: Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold
- Small/normal weapons only (no longbows or two-handed swords)
- Detect construction tricks 2-in-6
- Detect room traps 2-in-6
- Infravision 60'
- Listen at doors 2-in-6
- Resilience bonus to saves based on CON (both Basic and Advanced)

**Elf**
- Languages: Alignment, Common, Elvish, Gnoll, Hobgoblin, Orcish
- Detect secret doors 2-in-6 when actively searching
- Infravision 60'
- Listen at doors 2-in-6
- Immunity to ghoul paralysis

**Gnome**
- Languages: Alignment, Common, Dwarvish, Gnomish, Kobold, burrowing mammals
- Small/normal weapons only (no longbows or two-handed swords)
- Detect construction tricks 2-in-6
- Infravision 90'
- Listen at doors 2-in-6
- +2 AC vs large opponents
- Magic Resistance: Bonus to saves vs spells/wands/rods/staves based on CON (7-10: +2, 11-14: +3, 15-17: +4, 18: +5)

**Halfling**
- Languages: Alignment, Common, Halfling
- Listen at doors 2-in-6
- +1 to missile attack rolls
- +2 AC vs large opponents

**Human (Advanced mode with Human Abilities enabled)**
- Roll HP twice, take best
- Act first on tied initiative
- Retainers/mercenaries +1 loyalty/morale

## Implementation Details

### Current State ✅ CORRECT IMPLEMENTATION
The generator currently:
- Always generates Level 0 characters
- Uses "Advanced" checkbox to toggle ability adjustments
- **Shows racial abilities for demihumans in BOTH modes** ✅
- **Shows racial abilities for Humans only in Advanced mode (if enabled)** ✅
- **Applies saving throw bonuses (Resilience, Magic Resistance) in BOTH modes** ✅
- **Applies ability score adjustments ONLY in Advanced mode** ✅

### Current Status: ⚠️ NEEDS UI IMPROVEMENTS

### Completed Work ✅
All Level 0 functionality is working correctly:
- Racial abilities display correctly in both Basic and Advanced modes
- Ability score adjustments apply only in Advanced mode
- Saving throw bonuses (Resilience, Magic Resistance) work in both modes
- Character generation logic is correct

### Remaining Work - UI Improvements ⚠️
The 0-level generator needs UI updates to match the quality and consistency of basic.html and advanced.html:

**TODO:**
- [ ] Update 0level.html UI to match basic/advanced styling and layout
- [ ] Add more export options (currently only has PNG/PDF/MD/JSON, needs to match basic/advanced)
- [ ] Improve character sheet display to match quality of basic/advanced generators
- [ ] Consider adding "Open in New Tab" checkbox like basic/advanced have
- [ ] Ensure consistent font sizing and layout with other generators
- [ ] Review and update any outdated UI elements

**Note:** The underlying character generation logic is complete and correct. This is purely a UI/UX improvement task.

## Implementation Status (Character Generation Logic) ✅ COMPLETE

#### 1. Racial Abilities Display ✅ CORRECT
The current implementation in `racial-abilities.js` is correct:
```javascript
function getRacialAbilities(race) {
    // Humans only get abilities in Advanced mode with toggle enabled
    if (race === "Human") {
        return (isAdvanced && humanRacialAbilities) ? [...humanAbilities] : [];
    }
    
    // Demihumans always get their racial abilities
    return abilities[race] || [];
}
```

**Status:** ✅ Working correctly - no changes needed

#### 2. Ability Score Adjustments ✅ CORRECT
The current implementation in `race-adjustments.js` is correct:
```javascript
function applyRaceAdjustments(results, race, isAdvanced) {
    // Only apply adjustments in Advanced mode
    if (!isAdvanced) {
        return results;
    }
    
    // Apply adjustments for Advanced-compatible Level 0
    const adjustments = getRaceAdjustments(race);
    // ... apply adjustments
}
```

**Status:** ✅ Working correctly - no changes needed

#### 3. UI Labels ✅ IMPLEMENTED
Current checkbox label: "Advanced (Separate Race and Class)"

**Status:** ✅ Clear and accurate - no changes needed

#### 4. Character Sheet Indicator
Not currently implemented, but not critical for Level 0 characters.

**Status:** ⚠️ Optional enhancement for future

## Advancement Paths

### From Level 0 Basic to Level 1
**Humans**: Can become Fighter, Cleric, Magic-User, or Thief
**Demihumans**: Can become Fighter, Cleric, Magic-User, or Thief (using Basic rules, losing racial abilities)

### From Level 0 Advanced to Level 1
**Humans**: Can become Fighter, Cleric, Magic-User, Thief, or Advanced classes
**Demihumans**: Can become their racial class (Dwarf, Elf, Gnome, Halfling) or Basic classes

## Benefits of This Approach

1. **Accurate to Rules**: Level 0 demihumans always have racial abilities
2. **Campaign Compatibility**: Clear distinction between Basic and Advanced target campaigns
3. **Flexibility**: Characters can be used in either campaign type
4. **Future-Proof**: Easy to add Level 1+ generation later
5. **User-Friendly**: Simple checkbox maintains current UI

## Implementation Status ✅ COMPLETE

### Current Behavior (CORRECT) ✅
- Advanced unchecked: Racial abilities shown for demihumans (not Humans), no ability adjustments ✅
- Advanced checked: Racial abilities shown for all (if enabled for Humans), ability adjustments applied ✅

### Verification Complete ✅
- ✅ Demihumans always show racial abilities (both Basic and Advanced modes)
- ✅ Humans only show abilities when Advanced + Human Abilities enabled
- ✅ Saving throw bonuses (Resilience, Magic Resistance) apply in both modes
- ✅ Ability score adjustments only apply in Advanced mode
- ✅ Code refactored: racial-abilities.js created for better organization
- ✅ All tests passing

### User Impact
- ✅ Implementation is correct and matches OSE rules
- ✅ No migration needed - current behavior is accurate
- ✅ Character sheets are accurate to OSE rules

## Testing Requirements ✅ COMPLETE

1. **Level 0 Basic Mode** (Advanced unchecked) ✅
   - ✅ Verified demihumans show racial abilities
   - ✅ Verified no ability score adjustments
   - ✅ Verified Humans show no racial abilities
   - ✅ Verified Resilience bonuses apply (CON-based saves)

2. **Level 0 Advanced Mode** (Advanced checked) ✅
   - ✅ Verified all races show appropriate abilities
   - ✅ Verified ability score adjustments applied
   - ✅ Verified racial minimums enforced
   - ✅ Verified Resilience bonuses apply (CON-based saves)

3. **Race-Specific Tests** ✅
   - ✅ Tested each demihuman race in both modes
   - ✅ Verified language lists are correct
   - ✅ Verified special abilities display correctly
   - ✅ Created RACIAL_FEATURES_AUDIT.md documenting all features

4. **PDF/Canvas Generation** ✅
   - ✅ Verified sheets render correctly in both modes
   - ✅ Verified racial abilities section formats properly
   - ✅ Browser testing complete - no errors

**All tests passing!** ✅

## Character Sheet Unification Plan

### Goal
Create a single, high-quality character sheet used by all three generators (0-level, Basic, Advanced) — both for the **HTML display** in the browser and the **PDF/PNG output**. Currently the HTML sheet and the canvas-rendered PDF sheet have different layouts, and each generator has its own display code.

### Current State

**HTML Character Sheet (in-browser display):**
- `0level-ui.js` — custom HTML table layout (simple, functional)
- `basic-ui.js` — different custom HTML layout
- `advanced-ui.js` — different custom HTML layout
- All three look different and are maintained separately

**PDF/PNG Character Sheet (canvas renderer):**
- `canvas-sheet-renderer.js` — high-quality 300 DPI canvas layout for 0-level
- Has well-designed sections: Combat, Ability Scores, Weapons & Skills, Racial Abilities, Saving Throws, Equipment, Class Abilities, Treasure boxes
- Not used by Basic or Advanced generators at all

### Phase 1: Align HTML Sheet with PDF Layout - ✅ COMPLETE

- [x] Redesigned `display0LevelCharacter()` in `0level-ui.js` to match PDF section layout
- [x] Dark background + white text section headers (COMBAT, ABILITY SCORES, WEAPONS AND SKILLS, RACIAL ABILITIES, SAVING THROWS, EQUIPMENT, CLASS ABILITIES, TREASURE)
- [x] COMBAT: 4 stat boxes (MAX HP, CUR HP blank, INIT, AC blank) — blank boxes for player to fill in
- [x] Two-column layout: Left (ABILITY SCORES, WEAPONS AND SKILLS, RACIAL ABILITIES) | Right (SAVING THROWS, EQUIPMENT, CLASS ABILITIES, TREASURE)
- [x] Ability scores show adjusted vs original (e.g., "12 (11)" for CON)
- [x] CLASS ABILITIES section: "None (0-level)" in grey
- [x] TREASURE: PP/GP/EP/SP/CP rows with black labels and blank fillable cells
- [x] Tested in browser ✅ — looks clean and matches PDF structure

### Phase 2: Extract Shared Character Sheet Component
Extract the HTML character sheet into a reusable `shared-character-sheet.js` ES6 module that all three generators can use.

**TODO:**
- [ ] Create `shared-character-sheet.js`:
  - [ ] `renderCharacterSheetHTML(character, options)` → HTML string
  - [ ] Options: `{ mode: '0level'|'basic'|'advanced', showClassAbilities: bool, showSpellSlots: bool, showThiefSkills: bool, showTurnUndead: bool }`
- [ ] Update `0level-ui.js` to use shared renderer
- [ ] Update `basic-ui.js` to use shared renderer
- [ ] Update `advanced-ui.js` to use shared renderer
- [ ] Verify all three generators display consistently

### Phase 3: Improve Both HTML and PDF Sheets
Make coordinated improvements to both the HTML display and `canvas-sheet-renderer.js` in sync.

**Known improvements needed:**
- [ ] PDF: AC box should remain blank (AC changes during play; Starting AC is already shown in Equipment section — the commented-out `drawCenteredText` call should be removed)
- [ ] HTML + PDF: Add "Starting Equipment" section with proper item list formatting
- [ ] HTML + PDF: Better handling of long occupation names (no truncation)
- [ ] HTML + PDF: Ability scores — show original roll vs adjusted score (e.g., "12 (11)")
- [ ] HTML: Add print-friendly CSS for printing the HTML sheet directly
- [ ] PDF: Consider adding a "Notes" section at the bottom

### Phase 4: Extend to Basic and Advanced Generators
Once the shared HTML renderer exists, extend the PDF renderer to support Level 1+ characters.

**TODO (see also PLAN_CLASSES_IMPORT_TODO.md Phase 7G):**
- [ ] Update `canvas-sheet-renderer.js` to handle Level 1+ characters:
  - [ ] Show class instead of occupation
  - [ ] Show level in the LEVEL box
  - [ ] Spell slots section (for spellcasters)
  - [ ] Thief skills section (single row, current level)
  - [ ] Turn undead section (clerics)
  - [ ] Class abilities section (populated instead of "None (0-level)")
- [ ] Add "Generate PDF" / "Generate PNG" buttons to `basic.html` and `advanced.html`
- [ ] Hook up `canvas-generator.js` to Basic and Advanced generators

### Phase 5: Unified Export for All Generators
All three generators should offer the same export options: HTML display, PDF, PNG, Markdown, JSON.

**TODO:**
- [ ] Import `canvas-generator.js` into `basic-ui.js` and `advanced-ui.js`
- [ ] Add export buttons to `basic.html` and `advanced.html`
- [ ] Pass the generated character object to the shared canvas renderer
- [ ] Ensure `canvas-sheet-renderer.js` renders correctly for all three modes

### Implementation Order
1. ✅ **Phase 1** — Align HTML sheet with PDF layout (0-level only) — COMPLETE
2. **Phase 2** — Extract `shared-character-sheet.js` ← **NEXT**
3. **Phase 3** — Improve both HTML and PDF sheets
4. **Phase 4** — Extend to Basic/Advanced (Level 1+ support in canvas renderer)
5. **Phase 5** — Add PDF/PNG/MD/JSON export to Basic and Advanced generators

---

## Future Expansion: Level 1+ Characters

When adding Level 1+ character generation:

### Level 1+ Basic
- Standard four classes (Fighter, Cleric, Magic-User, Thief)
- No racial abilities
- No demihumans (or demihumans treated as classes without racial abilities)

### Level 1+ Advanced
- All classes including racial classes (Dwarf, Elf, Gnome, Halfling)
- Full racial abilities
- Ability score adjustments
- Racial requirements

This maintains the same two-axis system and keeps the codebase organized.
