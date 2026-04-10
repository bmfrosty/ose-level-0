# TODO — Active Planning Document

> **Status:** Generator merge complete (2026-04-05) — `shared-generator.js` unified, shim files deleted, `gen-ui.js` and `cs-sheet-page.js` updated to canonical imports. Remaining: class abilities user review (`includeName` decisions), comprehensive testing, OSE license compliance.

> ⚠️ **IMPORTANT — ALWAYS UPDATE THIS FILE:** After completing any task, mark checklist items `[x]`, update the status line above with the date, and move "next up" markers accordingly. Do not leave this file stale.
> **History:** See `PLANS_COMPLETED/` for all completed work.

---

## Priority Order

1. ~~**README.md update**~~ ✅ Complete (2026-03-19)
2. ~~**0-level integration + deletion**~~ ✅ Complete (2026-03-30)
3. ~~**Merge basic + advanced → generator.html**~~ ✅ Complete (2026-03-31)
4. ~~**HTML sheet improvements**~~ ✅ Complete (2026-03-31)
5. ~~**Generator merge (shared-generator.js)**~~ ✅ Complete (2026-04-05) — see `PLANS_COMPLETED/`
6. **Class abilities user review** — `includeName` decisions + Spellblade Stronghold ← NEXT
7. **Comprehensive class/level testing** — saves, attacks, spell slots at levels 1/5/10/14
8. **OSE license compliance** — add logo, legal text, "Requires OSE" (see section 6 below)
9. **Level 0 occupation weapon assignments** — ~17 occupations still need weapons
10. **Optional enhancements** — combat stats display, UI polish, export improvements

---

## 1. README Update — ✅ COMPLETE (needs refresh after generator merge)

README.md has been rewritten to document:
- ~~Three generators (0level.html, basic.html, advanced.html)~~ → now one: generator.html (Level 0 integrated, Basic + Advanced unified)
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
- [ ] **2C-7** *(deferred)* Add `ADVENTURING_GEAR_LL` and `DUNGEONEERING_BUNDLE_LL` to `gen-equipment.js` when user provides LL prices; add `progression` branch to `purchaseEquipment()`

### Phase 2D — Racial Abilities in Advanced Mode ✅
### Phase 2E — Print Button + cp v2 Normalization ✅
### Phase 2F — Background in Header + L1 HP Floor ✅

---

## 3. Generator Merge (basic + advanced → generator.html) — ✅ COMPLETE

Merged `basic.html` + `advanced.html` into a single `generator.html` with a top-level mode toggle. `shared-generator.js` now provides a single `generateCharacter(opts)` function for all modes and levels.

### Files Produced / Current State
| File | Purpose |
|------|---------|
| `generator.html` | Combined generator page (~800 lines) |
| `gen-ui.js` | Combined UI logic — imports from canonical sources directly |
| `shared-generator.js` | Single `generateCharacter(opts)` function, Basic + Advanced, levels 0–14 |
| `shared-basic-utils.js` / `shared-advanced-utils.js` | Still imported by `gen-ui.js` for utility functions |
| `shared-class-data-shared.js` | `CLASS_INFO` with `abilities:`, `maxLevel`, XP/HD tables — single source of truth |
| `shared-racial-abilities.js` | `RACE_INFO` with `abilities:`, `abilityModifiers`, `classLevelLimits`, `availableClasses` — single source of truth |
| `shared-class-progression.js` | `getClassProgressionData()`, `getClassFeatures()`, `getBasicModeClassAbilities()` |

Files deleted: `basic.html`, `advanced.html`, `basic-ui.js`, `advanced-ui.js`, `gen-0level-gen.js`, `shared-basic-character-gen.js`, `shared-advanced-character-gen.js`, `gen-race-adjustments.js`

### Key Design Decisions
- **Mode toggle in Section 1** — Basic/Advanced radio buttons combined with level selection
- **Single localStorage key `'generator'`** — saves all state including mode, demihumanLimits, raceClassMode, selectedRace
- **URL sync via `syncURLParams()`** — called from `saveCurrentSettings()` on every change; omits defaults to keep URLs short
- **Share/QR button** — `showShareQR()` opens a modal with QR code + copy link
- **CSS variables `--accent`/`--accent-bg`** — green for basic, purple for advanced (switches via `.mode-basic`/`.mode-advanced` class)
- **`m:'B'`/`m:'A'` cp codes preserved** — `charactersheet.html` unchanged
- **`generateCharacter(opts)`** — single function handles both modes via 4 narrow `isAdvanced` conditionals

### Implementation Phases — All Complete
- [x] Phase 1 — Create `generator-utils.js` (SKIPPED — import directly from basic/advanced utils)
- [x] Phase 2 — Create `gen-ui.js`
- [x] Phase 3 — Create `generator.html`
- [x] Phase 4 — Update nav links on all pages
- [x] Phase 4b — URL sync + Share/QR button
- [x] Phase 5 — Delete old files
- [x] Phase 6 — Write `shared-generator.js`; replace old generator files with shims; update `gen-ui.js` and `cs-sheet-page.js` to canonical imports; delete shims

### Phase 7 — Test (PENDING — see section 5)
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
The existing `cp` object scheme in `cs-compact-codes.js`, gzip+base64url encoded. Used by `charactersheet.html`.

---

## 3a. Human Racial Abilities in Basic Mode — ✅ COMPLETE

Wired up the Section 6 radio buttons in Basic mode so that selecting "Strict OSE + Human Racial Abilities" or "Extended Levels + Human Racial Abilities" shows Blessed, Decisiveness, Leadership on generated Basic characters.

| Radio value | Demihuman limits | Human racial abilities |
|---|---|---|
| `strict` (default) | Standard (Dwarf 12, Elf 10, Halfling 8) | ❌ none |
| `strict-human` | Standard | ✅ Blessed, Decisiveness, Leadership |
| `traditional-extended` | Extended (all 14) | ✅ Blessed, Decisiveness, Leadership |

All phases complete.

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

## 4. HTML Sheet Improvements — ✅ COMPLETE

> **Audited 2026-03-31:** 4A and 4E are obsolete due to the 2-page sheet redesign. 4C is already done. 4B is moot (printing always goes through charactersheet.html). 4D is complete.

All items done, obsolete, or superseded.

---

## 3c. Class Abilities User Review — PENDING ← NEXT

All code work is done (see `PLAN_CLASS_ABILITIES_AUDIT.md` for full history). The remaining work is **user decisions** — no coding until these are resolved.

Open `shared-class-data-shared.js` and for each entry in `CLASS_INFO[className].abilities`:

1. **Wording**: compare `description:` against `// PROPOSED:` comment; update if desired
2. **`includeName`**: uncomment `// includeName: true,` on any entry where you want the
   ability rendered as `"Name: description"` rather than description alone

Entries pending `includeName` decision:

- **Cleric**: Combat, Holy Symbol, Deity Disfavour, Magical Research, Turn Undead, Spell Casting, Using Magic Items, Stronghold
- **Fighter**: Combat, Stronghold, Baron Title
- **Magic-User**: Spell Casting, Magical Research, Using Magic Items, Combat, Stronghold
- **Thief**: Combat, Back-stab, Thief Skills, Read Languages, Hideout, Scroll Use
- **Spellblade**: Combat, Spell Casting, Magical Research, Using Magic Items, Stronghold
- **Dwarf**: Stronghold (others already `includeName: true`)
- **Elf**: Combat, Immunity to Ghoul Paralysis, Magical Research, Magical Research (Magic Items), Spell Casting, Stronghold, Using Magic Items
- **Halfling**: Combat, Defensive Bonus, Missile Attack Bonus, Stronghold
- **Gnome**: Defensive Bonus, Stronghold

Outstanding content decision:
- **Spellblade Stronghold** `raceOverrides` — stronghold type and followers not yet defined for this house-rules class; all 5 race stubs are `/* PROPOSED: TBD */`

---

## 3d. File Merger (shared-abilities.js) — DEFERRED / OPTIONAL

`PLAN_MERGE_CLASS_AND_RACE_DATA_FILES.md` Phases 3–5 and `PLAN_RACE_ABILITIES_AUDIT.md` Phase 3 describe merging `shared-class-data-shared.js`, `shared-class-progression.js`, and `shared-racial-abilities.js` into a single `shared-abilities.js`.

This is low-priority now that:
- All data is correctly structured in `CLASS_INFO` and `RACE_INFO`
- All duplicate hardcoded tables have been removed from utility files
- The generator already imports from canonical sources

Proceed only if reducing the import surface area becomes worthwhile. No action needed now.

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
- [ ] `gen-ui.js` — display STR and DEX modifiers on attack/AC separately

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
- `shared-class-data-{ose,gygar,ll}.js` — mode-specific class progression data
- `shared-class-data-shared.js` — `CLASS_INFO` with `abilities:`, `maxLevel`; XP/HD/spell/thief/undead tables
- `shared-racial-abilities.js` — `RACE_INFO` with `abilities:`, `abilityModifiers`, `classLevelLimits`, `availableClasses`; save/attack helpers
- `shared-{basic,advanced}-utils.js` — still imported by `gen-ui.js`; now read from `CLASS_INFO`/`RACE_INFO`
- `shared-generator.js` — single `generateCharacter(opts)` for Basic + Advanced, levels 0–14
- `generator.html` / `gen-ui.js` — the merged generator (replaces basic/advanced pages)
- `charactersheet.html` — print/edit tab for saved characters
- `classes.html` / `index.html` — landing and class reference pages
- `PLANS_COMPLETED/` — completed planning documents (historical reference)
- `CLASS_MARKDOWN/` — static class documentation (GYGAR_*.md)
