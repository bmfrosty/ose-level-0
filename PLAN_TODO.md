# TODO List

## Planning Documents
- **PLAN_0LEVEL_BASIC_ADVANCED.md** - Plan for Level 0 characters with Basic/Advanced campaign compatibility
- **PLAN_UPPER_LEVEL.md** - Plan for Level 1+ character generation
- **CHARACTER_CREATION_BASIC.md** - Specification for Level 1+ Basic Method character creation

## High Priority

### Level 0 Occupations: Missing Weapon Assignments
**Need user input for appropriate weapons for these OSE Secondary Skills:**

The following occupations from the OSE Advanced Fantasy Player's Tome Secondary Skills table (p25) are not yet in our Level 0 background tables. User needs to determine appropriate weapons for each:

- [ ] **Animal trainer** - Need weapon assignment
- [ ] **Bookbinder** - Need weapon assignment
- [ ] **Brewer** - Need weapon assignment
- [ ] **Chandler** - Need weapon assignment
- [ ] **Coppersmith** - Need weapon assignment
- [ ] **Furrier** - Need weapon assignment
- [ ] **Glassblower** - Need weapon assignment
- [ ] **Lapidary / jeweller** - Already have "Jeweller" but may need to verify weapon
- [ ] **Lorimer** (maker of horse bits, spurs, stirrups) - Need weapon assignment
- [ ] **Mapmaker** - Need weapon assignment
- [ ] **Potter** - Need weapon assignment
- [ ] **Roper** (rope maker) - Need weapon assignment
- [ ] **Seafarer** - Already have "Sailor" but may need separate entry
- [ ] **Tanner** - Need weapon assignment
- [ ] **Thatcher / roofer** - Need weapon assignment
- [ ] **Vintner** (wine maker) - Need weapon assignment
- [ ] **Woodcutter** - Need weapon assignment

**Occupations we have that match OSE list:**
- ✅ Armourer (HP 4)
- ✅ Baker (need to add - similar to Cook?)
- ✅ Blacksmith (HP 4)
- ✅ Bowyer / fletcher - Have "Bowyer" (HP 3) and "Fletcher" (HP 2)
- ✅ Butcher (HP 2)
- ✅ Carpenter (HP 4)
- ✅ Cooper (HP 3)
- ✅ Farmer (HP 4)
- ✅ Fisher (HP 3)
- ✅ Huntsman - Have "Hunter" (HP 4)
- ✅ Mason (HP 4)
- ✅ Miner (HP 4)
- ✅ Shipwright (HP 4)
- ✅ Tailor (HP 2)

**Occupations we have that are NOT in OSE Secondary Skills list:**
- Acolyte (HP 1) - Keep (religious profession)
- Actor (HP 1) - Keep (entertainment profession)
- Alchemist's Apprentice (HP 1) - Keep (specialized apprentice)
- Artist (HP 1) - Keep (creative profession)
- Beggar (HP 1) - Keep (social outcast)
- Butler (HP 2) - Keep (household servant)
- Cook (HP 2) - Keep (food preparation)
- Executioner (HP 3) - Keep (grim profession)
- Gambler (HP 2) - Keep (vice profession)
- Groom (HP 3) - Keep (animal care)
- Hermit (HP 3) - Keep (reclusive mystic)
- Horse Thief (HP 2) - Keep (criminal profession)
- Innkeeper (HP 2) - Keep (hospitality profession)
- Juggler (HP 1) - Keep (entertainment profession)
- Kennel Master (HP 3) - Keep (animal care)
- Leatherworker (HP 3) - Keep (craftsperson)
- Limner (HP 3) - Keep (artist/illuminator)
- Money Lender (HP 1) - Keep (financial profession)
- Navigator (HP 2) - Keep (specialized sailor)
- Sailor (HP 3) - Keep (seafaring profession)
- Scribe (HP 1) - Keep (literate profession)
- Shepherd (HP 2) - Keep (pastoral profession)
- Squire (HP 4) - Keep (martial apprentice)
- Teamster (HP 3) - Keep (transport profession)
- Trader (HP 2) - Keep (merchant profession)
- Trapper (HP 3) - Keep (wilderness profession)
- Trumpet Player (HP 1) - Keep (musician)
- Wealthy Heir (HP 1) - Keep (privileged background)
- Weaponsmith (HP 4) - Keep (specialized smith)
- Weaver (HP 2) - Keep (textile craftsperson)
- Wizard's Apprentice (HP 1) - Keep (magical apprentice)


### Fix Level 0 Racial Abilities Display
**See:** PLAN_0LEVEL_BASIC_ADVANCED.md

- [ ] Update `getRacialAbilities()` in `names-tables.js`:
  - [ ] Demihumans always show racial abilities (both Basic and Advanced modes)
  - [ ] Humans only show abilities in Advanced mode (if enabled)
  - [ ] Dwarf Resilience only in Advanced mode
- [ ] Test racial abilities display in both modes
- [ ] Verify no ability adjustments in Basic mode
- [ ] Verify ability adjustments in Advanced mode

### Update Racial Bonuses (Advanced Mode)
- [x] Review OSE Advanced Fantasy Player's Tome for all racial bonuses
- [x] Update `race-adjustments.js` with correct bonuses for:
  - [x] Dwarf (verified correct: +1 CON, -1 CHA)
  - [x] Elf (verified correct: +1 DEX, -1 CON)
  - [x] Gnome (verified correct: No modifiers)
  - [x] Halfling (verified correct: +1 DEX, -1 STR)
  - [x] Human (verified correct: +1 CON, +1 CHA)
- [x] Update `names-tables.js` getRacialAbilities() with correct abilities for:
  - [x] Dwarf (Languages, weapon restrictions, detection, infravision, listening, Resilience)
  - [x] Elf (Languages, detect secret doors, infravision, listening, ghoul immunity)
  - [x] Gnome (Languages, weapon restrictions, detect construction, infravision, listening, AC bonus, Magic Resistance)
  - [x] Halfling (Languages, weapon restrictions, listening, missile bonus, AC bonus, Resilience)
  - [x] Human (Blessed, Decisiveness, Leadership - optional)
- [x] Implement saving throw bonuses:
  - [x] Dwarf Resilience (Death, Wands, Spells)
  - [x] Gnome Magic Resistance (Wands, Spells)
  - [x] Halfling Resilience (Death, Wands, Spells)
- [x] Create SAVING_THROWS.md documentation
- [x] Test all races to verify bonuses apply correctly
- [ ] Update README.md with complete racial bonus tables

### Import Character Classes from Gygar Project
**Source:** Gygar project (user's other project)
**See:** PLAN_UPPER_LEVEL.md

- [ ] Import class data for Gygar Mode:
  - [ ] Cleric
  - [ ] Fighter
  - [ ] Thief
  - [ ] Magic-User
  - [ ] Spellblade (Gygar-specific class)
- [ ] Create new file: `class-data-gygar.js`
- [ ] Add class-specific data:
  - [ ] Hit dice
  - [ ] Attack bonus progression
  - [ ] Saving throw progressions
  - [ ] Class abilities
  - [ ] Prime requisites
  - [ ] XP requirements
- [ ] Update character generation to support class selection
- [ ] Add UI controls for class selection (when level > 0)

### Create Gygar Versions of Demihuman Classes
**Note:** Gygar Mode has different saving throw/attack progressions for demihumans

- [ ] Create Gygar Dwarf class data
  - [ ] Use Gygar-specific saving throw progression (different from Basic Mode Dwarf)
  - [ ] Use Gygar-specific attack bonus progression
  - [ ] Keep Dwarf racial abilities (including Resilience)
- [ ] Create Gygar Elf class data
  - [ ] **Use Spellblade saving throw progression** (Elf = Spellblade in Gygar Mode)
  - [ ] Use Gygar-specific attack bonus progression
  - [ ] Keep Elf racial abilities
  - [ ] Note: Elf in Gygar Mode uses Spellblade tables
- [ ] Create Gygar Halfling class data
  - [ ] Use Gygar-specific saving throw progression (different from Basic Mode Halfling)
  - [ ] Use Gygar-specific attack bonus progression
  - [ ] Keep Halfling racial abilities
- [ ] Add mode detection: Basic Mode vs Gygar Mode for demihuman classes
- [ ] Update documentation to explain Gygar demihuman differences

### Import Character Classes from OSE Website
**Source:** OSE SRD website (https://oldschoolessentials.necroticgnome.com/)
**See:** PLAN_UPPER_LEVEL.md

- [ ] Import class data for Basic Mode (non-Gygar):
  - [ ] Cleric
  - [ ] Fighter
  - [ ] Thief
  - [ ] Magic-User
  - [ ] Dwarf (as class, not race)
  - [ ] Elf (as class, not race)
  - [ ] Halfling (as class, not race)
- [ ] Create new file: `class-data-basic.js`
- [ ] Add class-specific data (same structure as Gygar classes)
- [ ] Note: Gnome NOT available in Basic Mode
- [ ] Update character generation to support Basic Mode
- [ ] Add UI toggle for Basic Mode vs Advanced Mode

## Medium Priority

### Higher Level Character Support
**See:** PLAN_UPPER_LEVEL.md

- [ ] Add level selection UI (0-14)
- [ ] Implement level-based saving throw progressions
- [ ] Implement level-based attack bonus progressions
- [ ] Add class selection when level > 0
- [ ] Add XP tracking
- [ ] Add spell slots for spellcasters
- [ ] Add class abilities by level

### Basic Mode Implementation
**See:** PLAN_0LEVEL_BASIC_ADVANCED.md

- [ ] Add "Basic Mode" checkbox to UI
- [ ] When Basic Mode enabled:
  - [ ] Hide race selection (or show only Human)
  - [ ] Show class selection (Cleric, Fighter, Thief, Magic-User, Dwarf, Elf, Halfling)
  - [ ] Use class-based saving throws and attack bonuses
  - [ ] Disable racial abilities (classes have their own abilities)
- [ ] Update all renderers to handle Basic Mode
- [ ] Update documentation

### Gygar Mode Enhancements
- [ ] Get complete Gygar Mode saving throw progressions from user
- [ ] Get complete Gygar Mode attack bonus progressions from user
- [ ] Implement different progressions for Gygar vs Normal Mode
- [ ] Add Spellblade class support (Gygar-specific)
- [ ] Document Gygar Mode differences in README.md

## Low Priority

### UI Improvements
- [ ] Add tooltips for all options
- [ ] Add "What's This?" links for Advanced/Basic/Gygar modes
- [ ] Improve mobile responsiveness
- [ ] Add character portrait upload option
- [ ] Add custom background/profession entry
- [ ] Update checkbox label: "Advanced Campaign (ability adjustments)"

### Export Improvements
- [ ] Add CSV export for multiple characters
- [ ] Add character import from JSON
- [ ] Add "Save Character" feature (localStorage)
- [ ] Add "Load Character" feature
- [ ] Add character comparison view

### Testing
- [ ] Add automated tests for all races
- [ ] Add automated tests for all classes (when implemented)
- [ ] Add automated tests for all levels (when implemented)
- [ ] Add automated tests for all modes (Advanced, Basic, Gygar, Normal)
- [ ] Add integration tests for all output formats
- [ ] Test Level 0 Basic mode (demihumans show abilities, no adjustments)
- [ ] Test Level 0 Advanced mode (all abilities + adjustments)

### Documentation
- [ ] Add examples of each race with screenshots
- [ ] Add examples of each class with screenshots
- [ ] Create video tutorial for web interface
- [ ] Create video tutorial for command-line usage
- [ ] Add FAQ section to README.md
- [ ] Document Level 0 Basic vs Advanced differences

## Future Ideas

### Advanced Features
- [ ] Multi-character party generator
- [ ] Character advancement tracker
- [ ] Equipment shop/generator
- [ ] Spell book generator for spellcasters
- [ ] Random encounter generator
- [ ] Dungeon generator integration

### Integration
- [ ] Export to VTT formats (Roll20, Foundry VTT, etc.)
- [ ] Import from other character generators
- [ ] API for programmatic character generation
- [ ] Discord bot integration

## Notes

### Data Sources
- **OSE Advanced Fantasy Player's Tome:** For Advanced Mode racial bonuses and abilities
- **OSE SRD Website:** For Basic Mode class data (https://oldschoolessentials.necroticgnome.com/)
- **Gygar Project:** For Gygar Mode class data and Spellblade class
- **The Ruins of Castle Gygar Module:** For Gygar Mode saving throw/attack bonus progressions

### Mode Compatibility Matrix
**See PLAN_0LEVEL_BASIC_ADVANCED.md for detailed explanation**

| Feature | Level 0 Basic | Level 0 Advanced | Level 1+ Basic | Level 1+ Advanced |
|---------|---------------|------------------|----------------|-------------------|
| Races | All races | All races | Human only | All races |
| Racial Abilities | Yes (demihumans only) | Yes (all if enabled) | No | Yes |
| Ability Adjustments | No | Yes | No | Yes |
| Racial Minimums | No | Yes | No | Yes |
| Attack Bonus | -1 (Normal) / 0 (Gygar) | -1 (Normal) / 0 (Gygar) | Class-based | Class-based |
| Saving Throws | D14 W15 P16 B17 S18 | D14 W15 P16 B17 S18 + Resilience | Class-based | Class-based |

### Implementation Order
1. ✅ Phase 1-8: Basic dynamic saving throws and attack bonuses (COMPLETE)
2. ✅ Dwarf racial abilities updated with concise descriptions (COMPLETE)
3. ✅ All racial abilities updated from Advanced Player's Tome (COMPLETE)
4. ✅ All racial saving throw bonuses implemented (COMPLETE)
5. ✅ SAVING_THROWS.md documentation created (COMPLETE)
6. **Next:** Fix racial abilities display for Level 0 Basic mode (see PLAN_0LEVEL_BASIC_ADVANCED.md)
7. **Then:** Import class data from Gygar project and OSE website (see PLAN_UPPER_LEVEL.md)
8. **Then:** Implement Basic Mode toggle and class selection
9. **Then:** Add higher level support (levels 1-14)
10. **Finally:** Polish UI and add advanced features

## Completed
- ✅ Dynamic saving throws for level 0
- ✅ Dynamic attack bonus for level 0
- ✅ Dwarf Resilience ability (Advanced Mode)
- ✅ Gygar Mode toggle (UI and CLI)
- ✅ Character object includes level, attackBonus, savingThrows
- ✅ All renderers use dynamic values
- ✅ Comprehensive README.md
- ✅ Bazzite/distrobox support
- ✅ Race selection bug fix
- ✅ All racial abilities updated from OSE Advanced Fantasy Player's Tome:
  - ✅ Dwarf (Languages, weapon restrictions, detection, infravision, listening, Resilience)
  - ✅ Elf (Languages, detect secret doors, infravision, listening, ghoul immunity)
  - ✅ Gnome (Languages, weapon restrictions, detect construction, infravision, listening, AC bonus, Magic Resistance)
  - ✅ Halfling (Languages, weapon restrictions, listening, missile bonus, AC bonus, Resilience)
  - ✅ Human (Blessed, Decisiveness, Leadership - optional)
- ✅ All racial ability score modifiers verified correct
- ✅ All racial saving throw bonuses implemented:
  - ✅ Dwarf Resilience (Death, Wands, Spells based on CON)
  - ✅ Gnome Magic Resistance (Wands, Spells based on CON)
  - ✅ Halfling Resilience (Death, Wands, Spells based on CON)
- ✅ SAVING_THROWS.md documentation created
- ✅ Planning documents created (PLAN_0LEVEL_BASIC_ADVANCED.md, PLAN_UPPER_LEVEL.md, CHARACTER_CREATION_*.md)
