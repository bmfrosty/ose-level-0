# TODO List

## High Priority

### Update Racial Bonuses (Advanced Mode)
- [ ] Review OSE Advanced Fantasy Player's Tome for all racial bonuses
- [ ] Update `race-adjustments.js` with correct bonuses for:
  - [ ] Dwarf (verify current bonuses are correct)
  - [ ] Elf (verify current bonuses are correct)
  - [ ] Gnome (verify current bonuses are correct)
  - [ ] Halfling (verify current bonuses are correct)
- [ ] Update `names-tables.js` getRacialAbilities() with correct abilities for:
  - [ ] Dwarf (Resilience already implemented)
  - [ ] Elf
  - [ ] Gnome
  - [ ] Halfling
- [ ] Test all races to verify bonuses apply correctly
- [ ] Update README.md with complete racial bonus tables

### Import Character Classes from Gygar Project
**Source:** Gygar project (user's other project)

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
- [ ] Add level selection UI (0-14)
- [ ] Implement level-based saving throw progressions
- [ ] Implement level-based attack bonus progressions
- [ ] Add class selection when level > 0
- [ ] Add XP tracking
- [ ] Add spell slots for spellcasters
- [ ] Add class abilities by level

### Basic Mode Implementation
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

### Documentation
- [ ] Add examples of each race with screenshots
- [ ] Add examples of each class with screenshots
- [ ] Create video tutorial for web interface
- [ ] Create video tutorial for command-line usage
- [ ] Add FAQ section to README.md

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
| Feature | Advanced Mode | Basic Mode | Gygar Mode | Normal Mode |
|---------|--------------|------------|------------|-------------|
| Races | Human, Dwarf, Elf, Gnome, Halfling | Human only | Same as Advanced/Basic | Same as Advanced/Basic |
| Classes | N/A (race-based) | Cleric, Fighter, Thief, Magic-User, Dwarf, Elf, Halfling | Cleric, Fighter, Thief, Magic-User, Spellblade | Same as Gygar |
| Racial Bonuses | Yes | No (class-based) | Yes (if Advanced) | Yes (if Advanced) |
| Attack Bonus (L0) | +0 (Gygar) / -1 (Normal) | +0 (Gygar) / -1 (Normal) | +0 | -1 |
| Saving Throws | Race-based + Resilience | Class-based | Different progression | Standard progression |

### Implementation Order
1. ✅ Phase 1-8: Basic dynamic saving throws and attack bonuses (COMPLETE)
2. **Next:** Update racial bonuses from Advanced Player's Tome
3. **Then:** Import class data from Gygar project and OSE website
4. **Then:** Implement Basic Mode toggle and class selection
5. **Then:** Add higher level support (levels 1-14)
6. **Finally:** Polish UI and add advanced features

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
