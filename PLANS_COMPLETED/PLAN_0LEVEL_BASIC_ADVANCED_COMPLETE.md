# Level 0 / Basic / Advanced — Phases 1 & 2 Complete

> Archived from PLAN_0LEVEL_BASIC_ADVANCED.md

## Phase 1: Align HTML Sheet with PDF Layout ✅

- Redesigned `display0LevelCharacter()` in `0level-ui.js` to match PDF section layout
- Dark background + white text section headers: COMBAT, ABILITY SCORES, WEAPONS AND SKILLS, RACIAL ABILITIES, SAVING THROWS, EQUIPMENT, CLASS ABILITIES, TREASURE
- COMBAT: 4 stat boxes (MAX HP, CUR HP blank, INIT, AC blank) — blank for player to fill in
- Two-column layout: Left (ABILITY SCORES, WEAPONS AND SKILLS, RACIAL ABILITIES) | Right (SAVING THROWS, EQUIPMENT, CLASS ABILITIES, TREASURE)
- Ability scores show adjusted vs original (e.g., "12 (11)" for CON)
- CLASS ABILITIES section: "None (0-level)" in grey
- TREASURE: PP/GP/EP/SP/CP rows with black labels and blank fillable cells
- Tested in browser ✅

## Phase 2: Extract Shared Character Sheet Component ✅

Created `shared-character-sheet.js` with `renderCharacterSheetHTML(sheet)` + `displayCharacterSheet()`.

**Normalized sheet object fields:**
```javascript
{
  title, subtitle,
  header: { characterName, classOrRace, level, extra: {label, value} },
  combat: { maxHP, initMod },
  abilityScores: [{name, score, originalScore, effects}],
  weaponsAndSkills: { weapon, classAttackBonus, meleeMod, rangedMod, thiefSkills },
  abilitiesSection: { header, racial[], class[] },
  savingThrows: { death, wands, paralysis, breath, spells },
  experience: null | { current, forLevel, forNext, bonus },
  equipment: { armor, items[], startingAC, startingGold },
  spellSlots: null | { [level]: count },
  turnUndead: null | { [type]: value },
  showUndeadNames: bool,
  footer: string,
  printTitle: string, openInNewTab: bool, autoPrint: bool
}
```

- Updated `0level-ui.js` to build normalized sheet object and call shared module ✅
- Updated `basic-ui.js` to build normalized sheet object and call shared module ✅
- Updated `advanced-ui.js` to build normalized sheet object and call shared module ✅
- Added `autoPrintInNewTab` checkbox to all three HTML files ✅
- Print CSS + auto-print-on-open for new-tab PDF workflow ✅
- All three generators display consistently ✅

## Character Generation Logic — All Correct ✅

- Racial abilities always shown for demihumans (both Basic and Advanced modes) ✅
- Humans only show abilities when Advanced + Human Abilities enabled ✅
- Saving throw bonuses (Resilience, Magic Resistance) apply in both modes ✅
- Ability score adjustments only apply in Advanced mode ✅
- All verified and tested ✅

## Racial Abilities Reference

| Race | Basic Mode | Advanced Mode |
|------|------------|---------------|
| Human | None | Optional (if Human Abilities enabled) |
| Dwarf | Yes (no adjustments) | Yes (+1 CON, -1 CHA, Resilience) |
| Elf | Yes (no adjustments) | Yes (+1 DEX, -1 CON) |
| Gnome | Yes (no adjustments) | Yes (no adjustments, Magic Resistance) |
| Halfling | Yes (no adjustments) | Yes (+1 DEX, -1 STR, Resilience) |
