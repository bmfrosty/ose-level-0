# TODO — Active Planning Document

> **Status:** All generators complete and working. 0-level generator deleted (2026-03-30) — Level 0 now integrated into basic.html and advanced.html. Generator merge complete (generator.html + generator-ui.js, 2026-03-31). Human racial abilities for Basic mode complete (2026-03-31). Unified sheet builder extracted (2026-03-31). Remaining: HTML sheet improvements, comprehensive testing, OSE license compliance.

> ⚠️ **IMPORTANT — ALWAYS UPDATE THIS FILE:** After completing any task, mark checklist items `[x]`, update the status line above with the date, and move "next up" markers accordingly. Do not leave this file stale.
> **History:** See `PLANS_COMPLETED/` for all completed work.

---

## Priority Order

1. ~~**README.md update**~~ ✅ Complete (2026-03-19)
2. ~~**0-level integration + deletion**~~ ✅ Complete (2026-03-30)
3. ~~**Merge basic + advanced → generator.html**~~ ✅ Complete (2026-03-31) — see section 3 below
4. ~~**HTML sheet improvements**~~ ✅ Complete (2026-03-31) — all items done, obsolete, or superseded
5. **Comprehensive class/level testing** — saves, attacks, spell slots at levels 1/5/10/14 ← NEXT
6. **OSE license compliance** — add logo, legal text, "Requires OSE" (see section 6 below)
7. **Level 0 occupation weapon assignments** — ~17 occupations still need weapons
8. **Optional enhancements** — combat stats display, UI polish, export improvements

---

## 1. README Update — ✅ COMPLETE (needs refresh after generator merge)

README.md has been rewritten to document:
- ~~Three generators (0level.html, basic.html, advanced.html)~~ → now two: basic.html and advanced.html (Level 0 integrated); will become one after generator merge
- Quick start: `python3 -m http.server 8000`
- PDF workflow: Open in New Tab → browser Print / Save as PDF
- OSE Standard / Smoothified (Gygar) / Labyrinth Lord modes and class lists
- Level 0 "Advanced" checkbox explanation
- Full module/file structure table
- Removed files documented (generate-pdf.sh, node-canvas-generator.js, deprecated-js/)

---

## 2. Upper Level Character Generation — ✅ COMPLETE

### Phase 2A — Class Abilities ✅
### Phase 2B — Starting Wealth ✅
### Phase 2C — Automatic Equipment Purchase ✅ (except 2C-7 deferred)
- [ ] **2C-7** *(deferred)* Add `ADVENTURING_GEAR_LL` and `DUNGEONEERING_BUNDLE_LL` to `shared-equipment.js` when user provides LL prices; add `progression` branch to `purchaseEquipment()`

### Phase 2D — Racial Abilities in Advanced Mode ✅
### Phase 2E — Print Button + cp v2 Normalization ✅
### Phase 2F — Background in Header + L1 HP Floor ✅

---

## 3. Generator Merge (basic + advanced → generator.html) — ✅ COMPLETE

Merged `basic.html` + `advanced.html` into a single `generator.html` with a top-level mode toggle, eliminating ~42% of duplicate code across 6 files.

### Files Produced
| File | Purpose |
|------|---------|
| `generator.html` | Combined generator page (~800 lines) |
| `generator-ui.js` | Combined UI logic (~1400 lines) |
| `basic-utils.js` / `advanced-utils.js` | Kept — still imported by `generator-ui.js` |
| `basic-character-gen.js` / `advanced-character-gen.js` | Kept — different logic per mode |

Files deleted: `basic.html`, `advanced.html`, `basic-ui.js`, `advanced-ui.js`

### Key Design Decisions
- **Mode toggle in Section 1** — Basic/Advanced radio buttons combined with level selection
- **Single localStorage key `'generator'`** — saves all state including mode, demihumanLimits, raceClassMode, selectedRace
- **URL sync via `syncURLParams()`** — called from `saveCurrentSettings()` on every change; omits defaults to keep URLs short
- **Share/QR button** — `showShareQR()` opens a modal with QR code + copy link
- **CSS variables `--accent`/`--accent-bg`** — green for basic, purple for advanced (switches via `.mode-basic`/`.mode-advanced` class)
- **`m:'B'`/`m:'A'` cp codes preserved** — `charactersheet.html` unchanged
- **`#demihumanLimitSection` not greyed at level 0** — setting must remain accessible

### Implementation Phases — All Complete
- [x] Phase 1 — Create `generator-utils.js` (SKIPPED — import directly from basic/advanced utils)
- [x] Phase 2 — Create `generator-ui.js`
- [x] Phase 3 — Create `generator.html`
- [x] Phase 4 — Update nav links on all pages
- [x] Phase 4b — URL sync + Share/QR button
- [x] Phase 5 — Delete old files

### Phase 6 — Test (PENDING)
- [ ] Basic mode: Level 0, 1–14, all classes, demihuman limits switch
- [ ] Advanced mode: Level 0, 1–14, race/class grid, all race/class modes
- [ ] Mode switch mid-session: settings save/restore correctly per mode
- [ ] URL params: `?mode=basic`, `?mode=advanced`, `?l=5&c=Fighter`, etc.
- [ ] Edit panel: both modes' `extraSections` show correct options
- [ ] Print tab (charactersheet.html) still works for both modes
- [ ] No 404s anywhere

### URL Parameters Reference

#### A. Full/readable params (`generator.html`) — settings, not character
| Param | Values | Notes |
|-------|--------|-------|
| `mode` | `basic` \| `advanced` | |
| `p` | `ose` \| `smooth` \| `ll` | progression mode |
| `l` | `0`–`14` | starting level |
| `c` | class name | e.g. `Fighter` |
| `r` | race name | Advanced only |
| `dl` | `standard` \| `extended` | Basic only |
| `rcm` | `strict` \| `strict-human` \| `traditional-extended` \| `allow-all` | Advanced only |
| `prm` | `0` \| `9` \| `13` | primeRequisiteMode |
| `hc` | `0` \| `1` | healthyCharacters |
| `il` | `0` \| `1` | includeLevel0HP |
| `un` | `0` \| `1` | showUndeadNames |
| `ao` | `0` \| `1` | abilityOrdering |
| `qr` | `0` \| `1` | showQRCode |
| `wp` | `0`–`100` | wealthPct |
| `s` | `3,3,3,3,3,3` | minimum ability scores (STR,INT,WIS,DEX,CON,CHA) |

#### B. Compact params (`?d=…`) — for QR codes / sharing a generated character
The existing `cp` object scheme in `shared-compact-codes.js`, gzip+base64url encoded. Used by `charactersheet.html`.

---

## 3a. Human Racial Abilities in Basic Mode — ✅ COMPLETE

Wired up the Section 6 radio buttons in Basic mode so that selecting "Strict OSE + Human Racial Abilities" or "Extended Levels + Human Racial Abilities" shows Blessed, Decisiveness, Leadership on generated Basic characters.

| Radio value | Demihuman limits | Human racial abilities |
|---|---|---|
| `strict` (default) | Standard (Dwarf 12, Elf 10, Halfling 8) | ❌ none |
| `strict-human` | Standard | ✅ Blessed, Decisiveness, Leadership |
| `traditional-extended` | Extended (all 14) | ✅ Blessed, Decisiveness, Leadership |

All phases complete:
- [x] Phase 1 — `shared-racial-abilities.js` — dropped `isAdvanced &&` gate
- [x] Phase 2 — `generator-ui.js` — zero-level `humanRacialAbilities` flag
- [x] Phase 3 — `generator-ui.js` — `getEffectiveDemihumanLimits()` helper + `cp.dl` fixed
- [x] Phase 4 — stale `demihumanLimits` radio listener (harmless no-op)
- [x] Phase 5a — `basic-character-gen.js` + `generator-ui.js` — `hasBlessed` flag + `cp.bl`
- [x] Phase 5b — `charactersheet.html` — level-up HP roller double-rolls when `decoded.bl` is set

---

## 3b. Unified Character Sheet (shared-sheet-builder.js) — ✅ COMPLETE

All three modes (0-level, Basic L1+, Advanced L1+) now share a unified sheet spec builder.

Key changes:
- **Mode Z eliminated** — 0-level characters use `m:'A'`/`m:'B'` with `l:0`
- **`shared-sheet-builder.js` extracted** — exports `buildSheetSpec`, `CLASS_HD`, `CLASS_HD_CODES`, `PROG_CODE`, `CODE_TO_PROG`, `CLS_CODE`, `RACE_CODE`, `RCM_CODE`, `sanitize`
- **Unified header columns** — all three modes use the same 6-column layout (Name, Occupation, Race/Class, Level, HD, XP Bonus)
- **`expandCompactV2` A/B branches collapsed** in `charactersheet.html` — single merged block with `isAdv` flag
- **Default settings updated** — Progression Mode default → OSE Standard; Race/Class Mode default → Strict OSE Rules
- **Hide "Human" prefix option** — `hhr:1` cp field; `hideHumanRace` checkbox in Advanced mode

---

## 4. HTML Sheet Improvements — PENDING ← NEXT

Remaining improvements for `shared-character-sheet.js` and `generator.html`.

> **Audited 2026-03-31:** 4A and 4E are obsolete due to the 2-page sheet redesign (equipment/items now on Page 2, treasure in Page 2 Row 3, spacer blocks gone). 4C is already done (OTHER NOTES is on Page 2). Only 4B and 4D remain.

### ~~4A. Equipment & Treasure Layout~~ — ✅ OBSOLETE
The sheet was redesigned with a 2-page layout. Items are in Page 2 Row 1, OTHER NOTES in Row 2, MONEY AND TREASURE in Row 3. The original problem no longer exists.

### ~~4B. @media print CSS for Inline Display~~ — ✅ OBSOLETE
Printing always goes through the new tab (`charactersheet.html`), which already has full `@media print` CSS. The inline display is just for preview; nobody prints directly from the generator page.

### ~~4C. Notes Section~~ — ✅ ALREADY DONE
"OTHER NOTES" full-width section already exists on Page 2 of the sheet (Row 2).

### ~~4D. Ability Score Racial Adjustment Legend~~ — ✅ COMPLETE (2026-03-31)
Added as a small legend line in the page 1 footer (below `sheet.footer` text), only shown when at least one ability score was racially adjusted. Implemented inline in `renderCharacterSheetHTML()` in `shared-character-sheet.js`. Also updated `buildOptionsLine()` in `shared-compact-codes.js` to always show all HP/ability-affecting options (not just non-defaults).

### ~~4E. Equipment Section Polish~~ — ✅ OBSOLETE
The equipment display was redesigned. Armor/weapons are in the Page 1 WEAPONS, ARMOR, AND SKILLS box; Starting AC and Starting Gold are in the page footer line; there are no `&nbsp;<br>` spacer blocks to remove.

---

## 5. Class/Level Testing — PENDING

Verify saves, attack bonuses, and spell slots for all classes at key levels in each progression mode.

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
- [ ] Cleric, Fighter, Magic-User, Thief, Dwarf, Elf, Halfling, Gnome (levels 1, 5, 10, 14)
- [ ] Spellblade (levels 1, 5, 10)

### Verification Checklist
- [ ] Saving throws match source documents
- [ ] Attack bonuses match source documents
- [ ] Spell slots match source documents
- [ ] Compare OSE vs Gygar progressions at same level
- [ ] Test mode switching (OSE Standard / Smoothified / Labyrinth Lord)

---

## 6. OSE License Compliance — PENDING

Compliance requirements for the [Necrotic Gnome Third-Party License](https://necroticgnome.com/pages/licences).

### Already Compliant ✅
- Product title does not include "Old-School Essentials" or "OSE" as the title itself
- Not claiming to be an official release
- Not claiming affiliation with or approval by Necrotic Gnome
- No replication of Player Characters or Adventuring text from OSE core
- Rules compatibility — mechanics are compatible with OSE rules
- References to classes, spells, monsters, etc. by name (permitted)

### Action Items Required

- [ ] **6-1** Add required legal text to site footer or dedicated `/legal` page:
  > "Old-School Essentials is a trademark of Necrotic Gnome. The trademark and Old-School Essentials logo are used with permission of Necrotic Gnome, under license."
  Should appear on `index.html`, `generator.html`, `classes.html`.

- [ ] **6-2** Add "Designed for Use With Old-School Essentials" logo to `index.html`:
  - Must be **smaller** than the page title
  - Must **not** be colourised, made transparent, or have aspect ratio altered
  - Must **not** form part of the product's title

- [ ] **6-3** Add "Requires Old-School Essentials" text to `index.html` and/or site footer.

- [ ] **6-4** Verify trade dress is distinct from official OSE products (fonts, colours, layout).

- [ ] **6-5** Once publicly released, email a link to **summon@necroticgnome.com**.

### Suggested Footer Snippet
```html
<footer>
  <img src="Designed_for_use_with_OSE.png" alt="Designed for use with Old-School Essentials"
       style="height: 40px; width: auto;">
  <p>Requires Old-School Essentials</p>
  <p class="legal">
    Old-School Essentials is a trademark of Necrotic Gnome. The trademark and
    Old-School Essentials logo are used with permission of Necrotic Gnome, under license.
  </p>
</footer>
```

Full license text: https://necroticgnome.com/pages/licences

---

## 7. Level 0 Occupations: Missing Weapon Assignments

The following occupations still need weapon assignments in the background tables:

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

## 8. Optional Enhancements

### Combat Stats Display
- [ ] `generator-ui.js` — display STR and DEX modifiers on attack/AC separately

### Advanced Mode Race/Class Grid
- [ ] Show class requirements (ability minimums) on hover/click in the race/class grid

### UI Polish
- [ ] Tooltips for all options
- [ ] Mobile responsiveness improvements
- [ ] Custom background/profession entry field

### Export Improvements
- [ ] CSV export for multiple 0-level characters
- [ ] Save/Load character to localStorage
- [ ] JSON import

### Testing Automation
- [ ] Automated tests for all races/classes at all levels

### Documentation
- [ ] Screenshots of each generator for README
- [ ] Update README.md for post-merge single-page structure

### VTT Integration (far future)
- [ ] Export to Roll20 / Foundry VTT formats
- [ ] Discord bot integration

---

## Reference: File Organization

**Quick summary:**
- `shared-*.js` — shared ES6 modules (ability scores, character creation, class data, sheet renderer, sheet builder, equipment)
- `class-data-{ose,gygar,ll}.js` — mode-specific class progression data
- `{basic,advanced}-{character-gen,utils}.js` — still imported by `generator-ui.js`
- `generator.html` / `generator-ui.js` — the merged generator (replaces basic/advanced pages)
- `charactersheet.html` — print/edit tab for saved characters
- `classes.html` / `index.html` — landing and class reference pages
- `PLANS_COMPLETED/` — completed planning documents (historical reference)
- `CLASS_MARKDOWN/` — static class documentation (GYGAR_*.md)
