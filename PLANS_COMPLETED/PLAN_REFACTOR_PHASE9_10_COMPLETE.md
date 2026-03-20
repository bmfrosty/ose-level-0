# JavaScript Module Refactoring — Phase 9 & 10 Complete

> Archived from PLAN_REFACTOR_TODO.md after all Phase 9 + Phase 10 work completed.

## Summary of What Was Done

All non-ES6 modules converted to ES6 import/export. Shared character sheet renderer extracted. Node.js CLI removed. Canvas PNG/PDF export dropped in favour of browser Print / Save as PDF.

## Phase 9A: Convert shared-racial-abilities.js ✅

- 9A1: Created `shared-racial-abilities.js` (ES6 exports, imports from shared-race-names.js)
- 9A2: Updated `0level-character-gen.js` + `0level-ui.js`; removed `<script src="racial-abilities.js">` from 0level.html
- 9A3: Renamed `getRacialAbilities` → `getBasicModeRacialAbilities` (basic) / `getAdvancedModeRacialAbilities` (advanced/0level); updated basic-character-gen.js + 0level-ui.js
- 9A4: Updated `advanced-character-gen.js` (simplified wrapper, no window.* dependency)
- 9A5: SUPERSEDED — canvas PNG/PDF removed; PDF via browser Print
- 9A6: SUPERSEDED — Node.js CLI removed: deleted `node-canvas-generator.js`, `underground-sheet-renderer.js`, `generate-pdf.sh`, `get-new-pdf.sh`, `deprecated-js/` (background-tables.js, character-display.js, character-utils.js, dice-utils.js, main-generator.js, names-tables.js, ose-modifiers.js)
- 9A7: SUPERSEDED — dead inline functions removed from 0level.html (setRaceAndGeneratePNG, setRaceAndGeneratePDF, setRaceAndGenerateBulkPDF); browser generators verified working

## Phase 9B0: Convert shared-race-names.js ✅

- Added ES6 exports to shared-race-names.js
- Inlined LEGACY_RACE_NAMES + normalizeRaceName in racial-abilities.js and race-adjustments.js (self-contained)
- Removed `<script src="shared-race-names.js">` from advanced.html + 0level.html
- Updated shared-racial-abilities.js to use proper import

## Phase 9B: Convert race-adjustments.js ✅

- Created `shared-race-adjustments.js` (ES6, imports from shared-race-names.js + shared-modifier-effects.js, synchronous)
- Updated `0level-character-gen.js` to import from shared-race-adjustments.js
- Removed `<script src="race-adjustments.js">` from 0level.html
- Kept `race-adjustments.js` as legacy (no longer loaded anywhere)

## Phase 9C: Convert canvas-sheet-renderer.js ✅

- Added ES6 imports for getModifierEffects + getAdvancedModeRacialAbilities
- Exported `class CanvasCharacterSheet`
- canvas-generator.js imports it as ES6 module

## Phase 9D: Convert underground-sheet-renderer.js ✅ SUPERSEDED

- File deleted (Node.js only, removed with CLI)

## Phase 9E: Convert markdown-generator.js ✅

- Added ES6 imports + export to generateCharacterMarkdown
- Removed browser/Node.js detection logic
- canvas-generator.js imports it as ES6 module

## Phase 9F: Convert canvas-generator.js ✅

- Added ES6 imports for CanvasCharacterSheet, generateCharacterMarkdown, generateSingleCharacter
- All functions async + exported
- Updated 0level-ui.js to import directly (no more window.*)
- Removed canvas module global `<script>` tags from 0level.html
- Fixed longstanding `generateSingleCharacter` console error

## Phase 10A: Shared Character Sheet Renderer ✅

- Created `shared-character-sheet.js` — renderCharacterSheetHTML(sheet) + displayCharacterSheet()
- Updated 0level-ui.js, basic-ui.js, advanced-ui.js to build normalized sheet objects and call shared module
- All three generators produce consistent HTML character sheets
- Added autoPrintInNewTab checkbox to all three HTML files
- Print CSS + auto-print-on-open for new-tab PDF workflow

## Phase 10B/10C: Canvas PDF/PNG Export ✅ SUPERSEDED

PDF is now browser Print / Save as PDF. Canvas PNG/PDF export removed from all generators. No canvas export buttons on Basic or Advanced generators.

## Additional Fixes (same session)

- autoPrintInNewTab checkbox added to all three HTML files
- Print CSS + auto-print-on-open (Option 4 from PLAN_PDF_OPTIONS.md)
- Character sheet: Class Attack Bonus / Melee Modifier / Ranged Modifier display
- Spellblade spell slots fixed (full arcane progression, same as Magic-User)
- Name randomization fixed (basic-ui.js, advanced-ui.js)
- shared-character-sheet.js: inline script block in 0level.html identified as dead code and removed

## Testing Results ✅

- 0level.html: all functionality working, no console errors
- basic.html: loads without errors
- advanced.html: loads without errors
- Markdown export on 0level: untested (button still present)
- JSON export on 0level: untested (button still present)
