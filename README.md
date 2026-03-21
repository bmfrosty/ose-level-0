# OSE Character Generators

A collection of **browser-based** character generators for **Old-School Essentials (OSE)** campaigns. No installation required — no Node.js, no build step, no dependencies. Just open in a browser.

## Quick Start

```bash
cd /path/to/ose-level-0
python3 -m http.server 8000
```

Then open <http://localhost:8000> in any browser. That's it.

> **Tip:** You can also open the `.html` files directly (`file://…`) without a server, but a local server is recommended so ES6 module imports work correctly in all browsers.

---

## Three Generators

### 🎲 `0level.html` — Level 0 Character Generator

Generates **ordinary people** before they become adventurers — for funnel-style play.

- Random background / occupation (100 entries) with appropriate starting gear
- 1d4 hit points (no class, no level progression)
- Races: Human, Dwarf, Elf, Gnome, Halfling
- **Advanced checkbox** — enables racial ability score adjustments and racial abilities (see below)
- PDF via browser Print (Open in New Tab checkbox)

### ⚔️ `basic.html` — Basic Mode Generator (Levels 1–14)

Generates **race-as-class** characters — the traditional OSE approach where Dwarf, Elf, Halfling, and Gnome are classes rather than separate races.

- Classes: Cleric, Fighter, Magic-User, Thief, Dwarf, Elf, Halfling, Gnome (+ Spellblade in Smoothified mode)
- Full progression tables: saves, attack bonus, XP, hit dice, spell slots, thief skills, turn undead
- Three selectable progression modes (see below)
- Optional demihuman level limits (standard per OSE, or extended to 14)
- Optional XP bonus rules (prime requisite ≥ 9 or ≥ 13)

### 🛡️ `advanced.html` — Advanced Mode Generator (Levels 1–14)

Generates characters with **separate race and class** — more flexible character combinations.

- Races: Human, Dwarf, Elf, Gnome, Halfling (with racial ability score adjustments and minimums)
- Classes: Cleric, Fighter, Magic-User, Thief, Spellblade
- Full progression tables and racial abilities displayed on sheet
- Three selectable progression modes (see below)

### 📚 `classes.html` — Class Reference

Browse complete class documentation, progression tables, and side-by-side comparisons for all modes and all classes.

---

## PDF Workflow

1. Check the **"Open character in new tab"** checkbox in any generator (step 8 of the form)
2. Click **Generate Character** — a new browser tab opens with the formatted character sheet
3. Click **🖨 Print / Save as PDF** in the new tab, or use Ctrl+P / Cmd+P
4. In the print dialog, choose **"Save as PDF"** and set margins to *None* or *Minimum*

That's the entire PDF workflow. No scripts or command-line tools are needed.

---

## Progression Modes

`basic.html` and `advanced.html` offer three selectable **Progression** modes that control attack bonus values, saving throw targets, and XP tables.

### OSE Standard

Official rules from *Old-School Essentials Advanced Fantasy*. Demihuman classes have level caps (Dwarf max 12, Elf max 10, Halfling max 8, Gnome max 8), and attack/save progressions follow the original tables with improvement at fixed tier boundaries.

**Classes available:** Cleric, Fighter, Magic-User, Thief, Dwarf, Elf, Halfling, Gnome *(8 classes)*

### Smoothified (Gygar)

House-ruled progressions from *The Ruins of Castle Gygar*. Attack bonuses and saving throws improve more gradually every 1–2 levels instead of jumping at fixed tiers. Demihuman level limits are removed (all classes advance to 14).

Key differences from OSE Standard:
- Attack bonus increments every 1–2 levels (no big jumps)
- Saving throws improve more frequently, with no multi-level plateaus
- **Elf** uses Spellblade-style fighter/magic-user hybrid progression tables
- **Spellblade** is an additional selectable class (not present in OSE Standard or LL)
- Level 0 attack bonus is +0 (vs. −1 in OSE Standard)

**Classes available:** Cleric, Fighter, Magic-User, Thief, Dwarf, Elf, Halfling, Gnome, **Spellblade** *(9 classes)*

See [OSE_VS_GYGAR.md](OSE_VS_GYGAR.md) and [ELF_VS_SPELLBLADE.md](ELF_VS_SPELLBLADE.md) for detailed comparisons.

### Labyrinth Lord

Progressions from *Labyrinth Lord* by Goblinoid Games. Saving throw targets differ from OSE Standard at some levels; attack progressions are largely the same. Same class set as OSE Standard (no Spellblade).

**Classes available:** Cleric, Fighter, Magic-User, Thief, Dwarf, Elf, Halfling, Gnome *(8 classes)*

---

## Level 0 "Advanced" Checkbox

On `0level.html`, the **Advanced** checkbox controls whether racial adjustments and abilities apply to the generated character:

| | Advanced OFF | Advanced ON |
|---|---|---|
| Ability score adjustments | No racial ±adjustments | Racial adjustments applied (e.g. Elf +1 INT, −1 CON) |
| Score minimums | Not enforced | Racial minimums enforced (e.g. Dwarf CON ≥ 9) |
| Racial abilities | Not listed on sheet | Shown on sheet (infravision, detect tricks, hiding, resilience, etc.) |
| Attack bonus | Flat −1 (level 0, OSE) or +0 (Smoothified) | Same as OFF |

The checkbox is simply a shorthand for "include or omit the racial crunch from OSE Advanced Fantasy" — useful if you want simple, uniform level-0 characters before introducing the racial rules.

---

## Module / File Structure

All JavaScript is ES6 modules (`type="module"`). There is no bundler, transpiler, or build system — files load directly in the browser.

### Shared Modules (used by 2+ generators)

| File | Purpose |
|------|---------|
| `shared-character-sheet.js` | HTML character sheet renderer — `renderCharacterSheetHTML(sheet)` used by all three generators |
| `shared-class-progression.js` | Class progression dispatch — selects OSE / Gygar / LL data for a class+level |
| `shared-ability-scores.js` | Ability score rolling and modifier lookup |
| `shared-character.js` | Base character object creation |
| `shared-hit-points.js` | HP rolling (class-appropriate die, CON modifier, optional minimum) |
| `shared-names.js` | Name generation |
| `shared-backgrounds.js` | Background / occupation tables (0-level) |
| `shared-modifier-effects.js` | Ability modifier effect descriptions (shown in ABILITY SCORES table) |
| `shared-race-names.js` | Race name normalisation constants |
| `shared-race-adjustments.js` | Racial ability score adjustments (± values) |
| `shared-racial-abilities.js` | Racial ability descriptions shown in ABILITIES section |
| `class-data-ose.js` | OSE Standard class data: saving throws, attack bonuses, XP |
| `class-data-gygar.js` | Smoothified (Gygar) class data: saving throws, attack bonuses |
| `class-data-ll.js` | Labyrinth Lord class data: saving throws, attack bonuses |
| `class-data-shared.js` | Shared class tables: XP, HD, spell slots, thief skills, turn undead, class abilities |

### 0-Level Generator (`0level.html`)

| File | Purpose |
|------|---------|
| `0level-ui.js` | UI logic and event handlers |
| `0level-character-gen.js` | Character generation |
| `0level-utils.js` | Utility functions |
| `canvas-generator.js` | PNG / JSON export |
| `canvas-sheet-renderer.js` | Canvas-based sheet rendering for PNG export |
| `markdown-generator.js` | Markdown text export |

### Basic Generator (`basic.html`)

| File | Purpose |
|------|---------|
| `basic-ui.js` | UI logic and event handlers |
| `basic-character-gen.js` | Character generation |
| `basic-utils.js` | Utility functions |

### Advanced Generator (`advanced.html`)

| File | Purpose |
|------|---------|
| `advanced-ui.js` | UI logic and event handlers |
| `advanced-character-gen.js` | Character generation |
| `advanced-utils.js` | Utility functions |

### Reference Files (not used by generators)

| File | Purpose |
|------|---------|
| `race-adjustments.js` | Old global script — superseded by `shared-race-adjustments.js`, kept for reference |
| `weapons-and-armor.js` | Weapon/armor reference data |

### Removed Files (documented for history)

The following files were removed when the project moved to a browser-only architecture:

- **`generate-pdf.sh`**, **`get-new-pdf.sh`** — shell scripts that drove the old PDF workflow; replaced by the browser Print / Save as PDF approach
- **`node-canvas-generator.js`** — Node.js CLI generator; replaced by the three browser-based HTML generators
- **`underground-sheet-renderer.js`** — Node.js-only canvas renderer; removed with the CLI
- **`racial-abilities.js`** — replaced by `shared-racial-abilities.js`
- **`deprecated-js/`** — all old pre-module scripts removed during the ES6 module refactor

---

## Development Notes

- All generators use `<script type="module">` — no globals, no jQuery, no frameworks
- A local HTTP server (e.g. `python3 -m http.server 8000`) is required for module imports to work in Chrome/Firefox when opening from `file://`
- `index.html` is the landing/about page that links to all three generators
- `classes.html` is a standalone class reference page (no generation)
- `start-server.sh` is a convenience script that runs the Python HTTP server

---

## Credits & License

- **Old-School Essentials** by Necrotic Gnome — <https://necroticgnome.com/>
- **The Ruins of Castle Gygar** by Tidal Wave Games (Smoothified progressions) — <https://www.drivethrurpg.com/en/product/510225/the-ruins-of-castle-gygar>
- **Labyrinth Lord** by Goblinoid Games — <https://goblinoidgames.com/>

These generators are unofficial fan-made tools. All game content and trademarks belong to their respective owners.
