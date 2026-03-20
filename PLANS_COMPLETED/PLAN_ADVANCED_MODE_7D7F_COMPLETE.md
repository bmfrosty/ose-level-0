# Advanced Mode Implementation (Phases 7D–7F) — Complete

> Archived from PLAN_CLASSES_IMPORT_TODO.md

## Phase 7D: Ability Score Input (advanced.html) ✅

- Ability score input fields (STR/INT/WIS, DEX/CON/CHA — 2x3 grid)
- Values act as minimums when rolling, or fixed scores when "Use fixed" checked
- "Use fixed ability scores" checkbox; "Roll Abilities" button (disabled when fixed)
- Checkboxes: Healthy Characters (HP ≥ 2), Include Level 0 HP (add 1d4+CON), Show Undead Names
- Racial adjustments applied; both base and adjusted scores displayed
- Ability modifiers + prime requisite XP bonus shown from adjusted scores
- Class requirements enforced when rolling

## Phase 7E: Character Generation Logic (advanced.html) ✅

- ES6 modules: advanced-utils.js, advanced-character-gen.js, advanced-ui.js
- Imports class-data-ose.js and class-data-gygar.js as ES6 modules
- rollAbilities() with class requirement enforcement
- rollHitPoints() with Level 0 HP option, Healthy Characters, CON modifier
- getClassProgressionData(): saves + racial bonuses, attack bonus, XP tracking, prime req XP bonus
- getClassFeatures(): spell slots, thief skills, turn undead (HD categories), class abilities
- getRacialAbilities() from shared-racial-abilities.js
- Racial saving throw bonuses: Dwarf Resilience, Gnome Magic Resistance, Halfling Resilience
- createCharacterAdvanced(): full character object with all fields

## Phase 7F: Character Display (advanced.html) ✅

- Character header: race, class, level, mode
- Ability scores: base + adjusted + modifiers + XP bonus
- Combat stats: HP, attack bonus, AC
- Saving throws: Death, Wands, Paralysis, Breath, Spells
- XP tracking: current, for level, for next, bonus %
- Spell slots (spellcasters only, non-zero slots)
- Thief skills (Thief only, camelCase → Title Case with %)
- Turn undead (Cleric only, HD or monster names, null → "-")
- Class abilities with descriptions
- Racial abilities (all races)
- Auto-scroll to character display

## Phase 7G: PDF/PNG Renderers ✅ SUPERSEDED

PDF now done via "Open in new tab" → Print / Save as PDF. Canvas PNG/PDF buttons removed from 0level.html. Canvas renderer files kept for potential future use but not updated for Level 1+.

## Advanced Mode UI — Completed Features ✅

- Level selection (radio buttons 1–14)
- Mode toggle (OSE Standard / Smoothified / Labyrinth Lord)
- Race/class selection grid (buttons)
- Race/class restriction options (Strict / Traditional Extended / Allow All)
- Prime requisite mode options (User Minimums / ≥9 / ≥13)
- Healthy Characters, Include Level 0 HP, Show Undead Names checkboxes
- Ability score inputs (2x3 grid, minimums or fixed)
- Character display with all sections
- Open in New Tab + autoPrintInNewTab option
- Consistent HTML character sheet via shared-character-sheet.js

## CLI Updates ✅ SUPERSEDED

node-canvas-generator.js, generate-pdf.sh, get-new-pdf.sh all deleted. No CLI to update.
