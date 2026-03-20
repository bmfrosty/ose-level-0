# TODO — Active Planning Document

> **Status:** All three generators complete and working. README updated (2026-03-19). Remaining: HTML sheet improvements, comprehensive testing, misc enhancements.
> **History:** See `PLANS_COMPLETED/` for all completed work.

---

## Priority Order

1. ~~**README.md update**~~ ✅ Complete (2026-03-19)
2. **Upper level character generation** — class abilities, wealth, automatic equipment purchase, background selection ← HIGH PRIORITY
3. **HTML sheet improvements** — `@media print` CSS, equipment formatting, Notes section
4. **Comprehensive class/level testing** — saves, attacks, spell slots at levels 1/5/10/14
5. **Level 0 occupation weapon assignments** — ~17 occupations still need weapons
6. **Optional enhancements** — combat stats display, UI polish, export improvements

---

## 1. README Update — ✅ COMPLETE

README.md has been rewritten to document:
- Three generators (0level.html, basic.html, advanced.html) and what each does
- Quick start: `python3 -m http.server 8000`
- PDF workflow: Open in New Tab → browser Print / Save as PDF
- OSE Standard / Smoothified (Gygar) / Labyrinth Lord modes and class lists
- Level 0 "Advanced" checkbox explanation
- Full module/file structure table
- Removed files documented (generate-pdf.sh, node-canvas-generator.js, deprecated-js/)

---

## 2. Upper Level Character Generation — PENDING ← NEXT (HIGH PRIORITY)

Features for `basic.html` and `advanced.html` to make upper-level characters feel complete at generation time. Class abilities are currently a significant gap — generated characters have stats and progression but no abilities listed.

- [ ] **Class abilities** — display all class abilities appropriate to the character's level on the sheet (e.g. Cleric: turn undead; Thief: thief skill %s at level; Fighter: combat abilities; Magic-User/Elf: spell list; Dwarf: detection abilities; Halfling: hiding; Gnome: defensive bonus; Spellblade: hybrid abilities). Both Basic and Advanced modes.
- [ ] **Racial abilities** — display racial special abilities on the sheet for Basic Mode demihuman classes (currently only shown in 0-level/Advanced mode)
- [ ] **Wealth generator** — roll starting gold per class (e.g. 3d6×10 gp for fighters, 2d6×10 for magic-users) and display on the character sheet
- [ ] **Automatic equipment purchase** — spend starting gold automatically on class-appropriate gear (weapons, armor, adventuring supplies) based on class and available funds
- [ ] **Background selection at upper levels** — always roll on the level-0 background/occupation table to give upper-level characters a pre-adventuring backstory; display occupation on sheet

---

## 3. HTML Sheet Improvements — PENDING

Print-friendly and formatting improvements to the shared HTML character sheet (`shared-character-sheet.js`).

- [ ] Add `@media print` CSS — hide buttons, set `@page` letter size, control page breaks
- [ ] Better "Starting Equipment" section — render as a proper `<ul>` list, not a comma-joined string
- [ ] Handle long occupation names gracefully (no truncation/overflow)
- [ ] Add optional "Notes" section at the bottom of the sheet
- [ ] Verify ability score display clarity — confirm "12 (11)" format (adjusted vs original) is clear

**Reference:** Originally Phase 3 of PLAN_0LEVEL_BASIC_ADVANCED.md

---

## 4. Class/Level Testing — PENDING

Verify that saves, attack bonuses, and spell slots are correct for all classes at all key levels in each progression mode. Compare against source documents.

### OSE Standard
- [ ] Cleric (levels 1, 5, 10, 14)
- [ ] Fighter (levels 1, 5, 10, 14)
- [ ] Magic-User (levels 1, 5, 10, 14)
- [ ] Thief (levels 1, 5, 10, 14)
- [ ] Dwarf (levels 1, 5, 10, 12)
- [ ] Elf (levels 1, 5, 10)
- [ ] Halfling (levels 1, 5, 8)
- [ ] Gnome (levels 1, 5, 8)

### Smoothified (Gygar)
- [ ] Cleric (levels 1, 5, 10, 14)
- [ ] Fighter (levels 1, 5, 10, 14)
- [ ] Magic-User (levels 1, 5, 10, 14)
- [ ] Thief (levels 1, 5, 10, 14)
- [ ] Dwarf (levels 1, 5, 10, 14)
- [ ] Elf (levels 1, 5, 10, 14)
- [ ] Halfling (levels 1, 5, 10, 14)
- [ ] Gnome (levels 1, 5, 10, 14)
- [ ] Spellblade (levels 1, 5, 10)

### Verification Checklist
- [ ] Saving throws match source documents
- [ ] Attack bonuses match source documents
- [ ] Spell slots match source documents
- [ ] Compare OSE vs Gygar progressions at same level
- [ ] Test mode switching (OSE Standard / Smoothified / Labyrinth Lord)

**Reference:** Originally Phase 9 of PLAN_CLASSES_IMPORT_TODO.md

---

## 5. Level 0 Occupations: Missing Weapon Assignments

The following OSE Advanced Fantasy Player's Tome Secondary Skills still need weapon assignments in the background tables:

- [ ] Animal trainer
- [ ] Bookbinder
- [ ] Brewer
- [ ] Chandler
- [ ] Coppersmith
- [ ] Furrier
- [ ] Glassblower
- [ ] Lapidary / jeweller (have "Jeweller" — verify weapon)
- [ ] Lorimer (horse bits, spurs, stirrups maker)
- [ ] Mapmaker
- [ ] Potter
- [ ] Roper (rope maker)
- [ ] Seafarer (have "Sailor" — need separate entry?)
- [ ] Tanner
- [ ] Thatcher / roofer
- [ ] Vintner (wine maker)
- [ ] Woodcutter

---

## 6. Optional Enhancements

### Combat Stats Display (basic.html / advanced.html)

The 0-level generator shows Class Attack Bonus, Melee Modifier, and Ranged Modifier separately. Basic and Advanced generators only show the single combined attack bonus value.

- [ ] `basic-ui.js` — display STR and DEX modifiers on attack/AC separately
- [ ] `advanced-ui.js` — display STR and DEX modifiers on attack/AC separately
- [ ] Consider `shared-combat-stats.js` for consistent attack/AC calculations across all generators

### Advanced Mode Race/Class Grid

- [ ] Show class requirements (ability minimums) on hover/click in the `advanced.html` race/class grid

### UI Polish
- [ ] Tooltips for all options
- [ ] Mobile responsiveness improvements
- [ ] Custom background/profession entry field

### Export Improvements
- [ ] CSV export for multiple 0-level characters
- [ ] Save/Load character to localStorage
- [ ] JSON import

### Testing Automation
- [ ] Automated tests for all races
- [ ] Automated tests for all classes at all levels
- [ ] Test Markdown export (0level generator)
- [ ] Test JSON export (0level generator)

### Documentation
- [ ] Screenshots of each generator for README

### VTT Integration (far future)
- [ ] Export to Roll20 / Foundry VTT formats
- [ ] Discord bot integration

---

## 7. Future: Dynamic Class Document Generation

**Status:** Low priority — static markdown files in `CLASS_MARKDOWN/` work well currently.

**Goal:** Generate class documentation dynamically from `class-data-ose.js`, `class-data-gygar.js`, and `class-data-shared.js` instead of maintaining separate markdown files.

**Key phases when ready:**
- [ ] Create `class-markdown-generator.js` with table/section generators
- [ ] Implement `generateXPTable`, `generateSavingThrowsTable`, `generateSpellSlotsTable`
- [ ] Support Basic Mode (race-as-class) and Advanced Mode (race + class) templates
- [ ] Batch generation for all classes × modes

Valid Advanced Mode combinations (for reference):

| Class | Human | Dwarf | Elf | Halfling | Gnome |
|-------|-------|-------|-----|----------|-------|
| **Cleric** | ✓ | ✓ | ✗ | ✗ | ✓ |
| **Fighter** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Magic-User** | ✓ | ✗ | ✓ | ✗ | ✗ |
| **Thief** | ✓ | ✗ | ✗ | ✓ | ✓ |
| **Spellblade** | ✓ | ✗ | ✓ | ✗ | ✗ |

---

## Reference: PDF Workflow (Implemented — Option 4)

The PDF workflow is fully implemented via "Open in New Tab" → browser Print / Save as PDF:
- ✅ `@media print` CSS in new-tab template (hides controls bar, sets `@page` letter size)
- ✅ "🖨 Print / Save as PDF" button + "✕ Close" button in controls bar
- ✅ Tip text: "In the print dialog, choose Save as PDF and set margins to None or Minimum"

If higher-fidelity silent-download PDF is ever needed, the next option to try is `jsPDF.html()` (already available — just call `doc.html(container, { callback })`). No new library needed.

---

## Reference: File Organization

See `README.md` for the complete module/file structure table.

**Quick summary:**
- `shared-*.js` — shared ES6 modules (ability scores, character creation, class data, sheet renderer)
- `class-data-{ose,gygar,ll}.js` — mode-specific class progression data
- `{0level,basic,advanced}-{ui,character-gen,utils}.js` — generator-specific files
- `PLANS_COMPLETED/` — completed planning documents (for historical reference)
- `CLASS_MARKDOWN/` — static class documentation (GYGAR_*.md)
