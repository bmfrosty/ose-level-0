# OSE Character Generators

A collection of browser-based character generators for **Old-School Essentials (OSE)** campaigns. No installation required — just open in a browser.

## Quick Start

```bash
cd /path/to/ose-level-0
python3 -m http.server 8000
```

Then open <http://localhost:8000> in any browser. That's it — no Node.js, no build step, no dependencies.

> **Tip:** You can also open the `.html` files directly (`file://…`) without a server, but a local server is recommended so ES6 module imports work correctly in all browsers.

---

## Three Generators

### 🎲 `0level.html` — Level 0 Character Generator

Generates **ordinary people** before they become adventurers — for funnel-style play.

- Random background / occupation (100 entries) with appropriate starting gear
- 1d4 hit points
- Races: Human, Dwarf, Elf, Gnome, Halfling
- **Advanced checkbox** (see below) — enables racial ability score adjustments and racial abilities
- Export to PNG, Markdown, or JSON; PDF via browser Print

### ⚔️ `basic.html` — Basic Mode Generator (Levels 1–14)

Generates **race-as-class** characters — the traditional OSE approach where Dwarf, Elf, Halfling, and Gnome are classes rather than races.

- Classes: Cleric, Fighter, Magic-User, Thief, Dwarf, Elf, Halfling, Gnome (+ Spellblade in Smoothified mode)
- Full progression tables: saves, attack bonus, XP, hit dice, spell slots, thief skills
- Three progression modes (see below)
- Optional demihuman level limits (standard or extended to 14)

### 🛡️ `advanced.html` — Advanced Mode Generator (Levels 1–14)

Generates characters with **separate race and class** — more flexible combinations.

- Races: Human, Dwarf, Elf, Gnome, Halfling (with racial ability adjustments and minimums)
- Classes: Cleric, Fighter, Magic-User, Thief, Spellblade
- Full progression tables and racial abilities
- Three progression modes (see below)

### 📚 `classes.html` — Class Reference

Browse complete class documentation, progression tables, and side-by-side comparisons for all modes.

---

## PDF Workflow

1. Check the **"Open character display in new tab"** checkbox in any generator
2. Generate a character — a new browser tab opens with the formatted sheet
3. Use the browser's **Print / Save as PDF** function (Ctrl+P / Cmd+P)

That's the entire PDF workflow. No scripts or command-line tools needed.

---

## Progression Modes

`basic.html` and `advanced.html` offer three selectable **Progression** modes that affect attack bonus, saving throws, and XP tables.

### OSE Standard

Official rules from *Old-School Essentials Advanced Fantasy*. Demihuman classes have level caps (Dwarf 12, Elf 10, Halfling 8, Gnome 8), and attack/save progressions follow the original irregular tables.

**Classes:** Cleric, Fighter, Magic-User, Thief, Dwarf, Elf, Halfling, Gnome

### Smoothified (Gygar)

House-ruled progressions from *The Ruins of Castle Gygar*. Attack bonuses and saving throws improve more gradually and consistently each level — no big jumps or plateaus. Demihuman level limits are removed (all classes go to 14).

Key differences from OSE Standard:
- Attack bonus increments every 1–2 levels instead of every 3
- Saving throws improve more frequently
- **Elf** uses Spellblade progression tables (fighter/magic-user hybrid)
- **Spellblade** is an additional selectable class (not present in OSE Standard or LL)

**Classes:** Cleric, Fighter, Magic-User, Thief, Dwarf, Elf, Halfling, Gnome, **Spellblade**

See [OSE_VS_GYGAR.md](OSE_VS_GYGAR.md) and [ELF_VS_SPELLBLADE.md](ELF_VS_SPELLBLADE.md) for detailed comparisons.

### Labyrinth Lord

Progressions from *Labyrinth Lord* (Goblinoid Games). Saving throw numbers differ from OSE Standard at some levels; attack progressions are largely the same. Same class set as OSE Standard (no Spellblade).

**Classes:** Cleric, Fighter, Magic-User, Thief, Dwarf, Elf, Halfling, Gnome

---

## Level 0 "Advanced" Checkbox

On `0level.html`, the **Advanced** checkbox controls whether racial adjustments apply:

| Advanced OFF | Advanced ON |
|---|---|
| No ability score adjustments | Racial ±1 adjustments applied (e.g. Elf +1 DEX / −1 CON) |
| No racial ability requirements | Minimum ability score requirements enforced |
| No racial special abilities listed | Racial abilities shown (infravision, detecting tricks, resilience, etc.) |
| Attack bonus −1 at level 0 | Attack bonus follows mode selection |

This lets you use 0-level characters with or without the racial crunch from OSE Advanced Fantasy.

---

## Module / File Structure

All JavaScript is ES6 modules (`type="module"`). There is no bundler or transpiler — files are loaded directly by the browser.

### Shared Modules (used by 2+ generators)

| File | Purpose |
|------|---------|
| `shared-ability-scores.js` | Ability score rolling + modifiers |
| `shared-character.js` | Base character object creation |
| `shared-class-progression.js` | Class progression data + Basic Mode racial abilities |
| `shared-hit-points.js` | HP rolling |
| `shared-names.js` | Name generation |
| `shared-backgrounds.js` | Background / occupation tables (0-level) |
| `shared-modifier-effects.js` | Ability modifier effect descriptions |
| `shared-race-names.js` | Race name normalisation constants |
| `shared-race-adjustments.js` | Racial ability score adjustments |
| `shared-racial-abilities.js` | Racial ability descriptions (Advanced / 0-level mode) |
| `shared-character-sheet.js` | HTML character sheet renderer (`renderCharacterSheetHTML`) |
| `class-data-ose.js` | OSE Standard class data (saves, attack, XP, spell slots) |
| `class-data-gygar.js` | Smoothified (Gygar) class data |
| `class-data-ll.js` | Labyrinth Lord class data |
| `class-data-shared.js` | Shared class utilities and XP/HD tables |

### 0-Level Generator (`0level.html`)

| File | Purpose |
|------|---------|
| `0level-ui.js` | UI logic and event handlers |
| `0level-character-gen.js` | Character generation |
| `0level-utils.js` | Utility functions |
| `canvas-generator.js` | Markdown / JSON / PNG export |
| `canvas-sheet-renderer.js` | Canvas-based character sheet rendering |
| `markdown-generator.js` | Markdown export |

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

### Legacy / Reference (not ES6 modules)

| File | Purpose |
|------|---------|
| `race-adjustments.js` | Old global script — superseded by `shared-race-adjustments.js`, kept for reference |
| `weapons-and-armor.js` | Reference data (unused by generators) |

### Removed Files (documented for history)

The following were removed when the project moved to a browser-only architecture:

- `generate-pdf.sh`, `get-new-pdf.sh` — shell scripts (PDF now via browser Print)
- `node-canvas-generator.js` — Node.js CLI generator (replaced by browser generators)
- `underground-sheet-renderer.js` — Node.js-only renderer (removed with CLI)
- `racial-abilities.js` — replaced by `shared-racial-abilities.js`
- `deprecated-js/` — all old modules removed

---

## Development Notes

- All generators use `<script type="module">` — no globals, no jQuery, no frameworks
- A local HTTP server (e.g. `python3 -m http.server 8000`) is needed for module imports to work in Chrome/Firefox when opening from `file://`
- `index.html` is the landing/about page with links to all three generators
- `classes.html` is a standalone class reference page

---

## Credits & License

- **Old-School Essentials** by Necrotic Gnome — <https://necroticgnome.com/>
- **The Ruins of Castle Gygar** by Tidal Wave Games (Smoothified progressions) — <https://www.drivethrurpg.com/en/product/510225/the-ruins-of-castle-gygar>
- **Labyrinth Lord** by Goblinoid Games

These generators are unofficial fan-made tools. All game content and trademarks belong to their respective owners.
