# PLAN: Unified Character Sheet Display (0-Level / Basic / Advanced)

## Status: Phases 1–5 complete ✅ · Items 1–3 done ✅ · Hide-Human-Race option added ✅

---

## What Was Done

### Mode Z Eliminated
0-level characters are now represented as mode `A` or `B` with `l: 0` rather than
a separate `m: 'Z'` mode. The generator emits `m: isAdv ? 'A' : 'B'` + `l: 0`,
and `expandCompactV2` handles `level === 0` in a single shared block before the
A/B branches.

### Unified Level-0 Block in `charactersheet.html`
A `if (level === 0)` block at the top of `expandCompactV2` handles both Basic and
Advanced 0-level sheets. Uses pre-stored `cp.sv` for saving throws (since no class
is known yet), pulls racial abilities from `getAdvancedModeRacialAbilities`, shows
no experience section, and uses the same unified 6-column header as leveled sheets.

### Header Label Unified: "Background" → "Occupation"
All three display paths (level 0, basic L1+, advanced L1+) now use `Occupation`
for the background profession column in the header. This applies to both
`generator-ui.js` and `charactersheet.html`.

### Fully Unified Header Columns (Phase 5)
All three modes — 0-level, Basic L1+, and Advanced L1+ — now emit **identical
column structure** in both `generator-ui.js` and `charactersheet.html`:

| # | Label | Value (0-level) | Value (Basic L1+) | Value (Advanced L1+) | flex |
|---|-------|-----------------|-------------------|----------------------|------|
| 1 | Character Name | name | name | name | 3 |
| 2 | Occupation | background profession | background profession | background profession | 2 |
| 3 | Race/Class | _(blank — player fills in)_ | class name | race + class | 2 |
| 4 | Level | `0` | level number | level number | 1 (center) |
| 5 | HD | _(blank — player fills in)_ | `1d${sides}` | `1d${sides}` | 1 (center) |
| 6 | XP Bonus | _(blank — player fills in)_ | XP bonus % | XP bonus % | 1 (center) |

- Race/Class, HD, and XP Bonus are left **blank** on 0-level sheets so the player
  can fill them in once they advance and pick a class. The race appears in the
  Racial Abilities section and footer text.
- HD format is consistently `1d{N}` (e.g. `1d8`, `1d6`) for leveled characters.

### Starting HD in Equipment Footer
`shared-character-sheet.js` renders the equipment footer as:

```
Starting AC: {n}  |  Starting HD: {1dN}  |  Starting Gold: {n} gp
```

The `startingHD` field is passed in the `equipment` object by all three display
paths in both `generator-ui.js` and `charactersheet.html`:

- **0-level**: `startingHD: '1d4'`
- **Basic/Advanced L1+**: `startingHD: \`1d${CLASS_HD_SIDES[class]||6}\``

### cp Fields Normalised for 0-Level
New 0-level cp includes `p` (progression), `bl` (blessed), `hc` (healthy
characters), and `rcm` (advanced mode only) — the same fields carried by the
A and B modes — so future features automatically apply.

### Default Settings Updated
- Section 2 (Progression Mode): default changed from Smoothified → **OSE Standard**
- Section 6 (Race/Class Mode): default changed from "Strict + Human Abilities" →
  **Strict OSE Rules** for both Basic and Advanced
- Reset Saved Settings and `applySettings()` fixed to set only the active mode's
  Section 6 radio (avoids cross-uncheck bug from shared `name="raceClassMode"`)
- URL omit-defaults updated to match new defaults (`p` omitted when `ose`,
  `rcm` omitted when `strict`)

### `expandCompactV2` A/B Branches Collapsed (Item 2 ✅)

In `charactersheet.html`, the two separate `if (mode === 'B')` and
`if (mode === 'A')` blocks for L1+ characters have been replaced by a single
`// ─── L1+ characters (Basic & Advanced merged)` block with an `isAdv` flag.

Differences handled by conditionals:

| Aspect | Basic (`!isAdv`) | Advanced (`isAdv`) |
|--------|------------------|--------------------|
| Character builder | `createCharacter` from `basic-character-gen.js` | `createCharacterAdvanced` from `advanced-character-gen.js` |
| Display labels | `raceDisplay = clsDisplay = cls.replace('_CLASS','')` | `getRaceDisplayName` / `getClassDisplayName` from `advanced-utils.js` |
| Race/Class header | `clsDisplay` only | `raceClassDisplay` (with `cp.hhr` hide-human logic) |
| Utils import | `basic-utils.js` | `advanced-utils.js` |
| Title | `'OLD-SCHOOL ESSENTIALS'` | `'OLD-SCHOOL ESSENTIALS ADVANCED'` |
| Footer `who` | `clsDisplay` | `${raceDisplay} ${clsDisplay}` |
| `printTitle` | `OSE Basic - …` | `OSE Advanced - …` |

Everything else — header column structure, combat, abilityScores, weaponsAndSkills,
abilitiesSection, savingThrows, experience, equipment, spellSlots, turnUndead,
showUndeadNames, showQRCode, abilityOrder, autoPrint — is now in one place.
The XP bonus calculation bug in the old Advanced branch (missing the
`primeReqs.length > 0 ? 10 : 0` guard) was also fixed during the merge.

---

### `shared-sheet-builder.js` Extracted (Item 3 ✅)

New ES module `shared-sheet-builder.js` exports everything that the live generator
and saved-sheet viewer need to build an identical spec:

| Export | Type | Purpose |
|--------|------|---------|
| `buildSheetSpec(sd, opts)` | function | Builds the full spec object for `displayCharacterSheet` |
| `CLASS_HD` | const | Hit-die sides keyed by full class name (e.g. `Fighter_CLASS → 8`) |
| `CLASS_HD_CODES` | const | Hit-die sides keyed by compact code (e.g. `FI → 8`) |
| `PROG_CODE` | const | Progression name → compact code (`ose → 'O'`) |
| `CODE_TO_PROG` | const | Compact code → progression name (`'O' → 'ose'`) |
| `CLS_CODE` | const | Full class name → compact code |
| `RACE_CODE` | const | Full race name → compact code |
| `RCM_CODE` | const | Race/class mode → compact code |
| `sanitize` | const | Strip filename-unsafe characters |

**`generator-ui.js`** now imports `{ buildSheetSpec, CLASS_HD, PROG_CODE, CLS_CODE,
RACE_CODE, RCM_CODE, sanitize }` from the module; the local definitions of all
these have been removed.

**`charactersheet.html`** now imports `{ buildSheetSpec, CLASS_HD_CODES as CLASS_HD,
CODE_TO_PROG }` from the module; the local `const CLASS_HD` and `const CODE_TO_PROG`
declarations have been removed. The L1+ merged block in `expandCompactV2` now builds
a normalised `sd` object and an `opts` object and calls `return buildSheetSpec(sd, opts)`
instead of constructing the spec inline.

---

### `buildSheetSpec()` Extracted (Item 1 ✅)

`generator-ui.js` now contains:

- **`buildSheetSpec(sd, opts)`** — single function that builds the complete spec
  passed to `displayCharacterSheet`. The 6-column header, combat block,
  weaponsAndSkills, abilitiesSection, and render options all live here exclusively.
- **Shared constants** — `CLASS_HD`, `PROG_CODE`, `CLS_CODE`, `RACE_CODE`,
  `RCM_CODE`, `sanitize` declared once at module level; no per-call re-declaration.
- **`sheetOpts()`** — reads the five global display toggles once per call.

All three display functions (`displayBasicCharacter`, `displayAdvancedCharacter`,
`displayZeroLevelCharacter`) are now thin adapters that build a normalised `sd`
object and call `buildSheetSpec`.

### Hide "Human" Prefix Option (Advanced mode)

New checkbox **"Hide 'Human' prefix for Human characters"** (id `hideHumanRace`,
default: **unchecked / off**) in the Advanced-only settings section of
`generator.html`.

When checked:
- `displayAdvancedCharacter` sets `raceClassDisplay` to just the class name when
  `raceDisplay === 'Human'` (e.g. "Fighter" instead of "Human Fighter").
- The compact code gains `hhr: 1` so saved character sheets honour the same flag.
- `expandCompactV2` A-branch in `charactersheet.html` checks `cp.hhr` when
  computing `raceClassDisplay`.

Full round-trip wiring: `saveCurrentSettings`, `applySettings`,
`handleResetSettings`, `syncURLParams` (`?hhr=1`), `readURLParams`, and
`boolListeners` all updated. The setting is Advanced-only — not emitted to URL
when in Basic mode.

---

## Remaining / Future Work

### Further Code Consolidation (optional)

The three display functions (`displayBasicCharacter`, `displayAdvancedCharacter`,
`display0LevelCharacter`) in `generator-ui.js` and the two L1+ branches in
`expandCompactV2` (`charactersheet.html`) all manually construct the same large
`displayCharacterSheet({...})` call. The following steps would reduce duplication
and the risk of future columns/fields diverging again.

---

#### 1. Extract `buildSheetSpec(charData, opts)` — **DONE ✅**

Create a single function that takes a normalised `charData` object and an `opts`
bag and returns the complete spec for `renderCharacterSheetHTML` /
`displayCharacterSheet`. The three `displayXxx()` functions in `generator-ui.js`
become thin adapters that build `charData` from their own data source and call
`buildSheetSpec`.

**What needs to happen:**
- Identify every field that varies across modes (header values, combat, equipment,
  spells, turnUndead, savingThrows, experience, abilities).
- Define a normalised `charData` shape that all three mode-specific paths can
  produce without mode-specific logic leaking into the builder.
- Move the header column array, the `abilitiesSection` header string logic
  (`RACIAL & CLASS ABILITIES` vs `CLASS ABILITIES` etc.), the XP bonus
  calculation, and the footer string construction into `buildSheetSpec`.
- Regression-test all paths: 0-level basic, 0-level advanced, basic L1+,
  advanced L1+, Thief (thief skills), Cleric (turn undead), Magic-User (spells).

**Risk:** Medium. The per-mode data shapes differ enough that getting the
normalised interface right may require a couple of iterations.

---

#### 2. Collapse `expandCompactV2` A/B branches — **DONE ✅**

See "What Was Done" above.

---

#### 3. Extract `shared-sheet-builder.js` — **DONE ✅**

See "What Was Done" above.
