# OSE Character Generator

A **browser-based** character generator for **Old-School Essentials (OSE)** campaigns. No installation, no build step, no dependencies — just open in a browser.

## Quick Start

```bash
cd /path/to/ose-level-0
python3 -m http.server 8000
# or: ./start-server.sh
```

Open <http://localhost:8000>. A local server is recommended so ES6 module imports work correctly; opening `file://` directly may not work in all browsers.

---

## Generator (`generator.html`)

One page handles everything: **Level 0** through **Level 14**, **Basic** and **Advanced** modes.

### Basic Mode

Race-as-class — the traditional OSE approach where Dwarf, Elf, Halfling, and Gnome are classes, not separate races. No racial stat adjustments.

- **Level 0**: Choose a race; character has a background/occupation but no class yet.
- **Level 1–14**: Choose a class (Cleric, Fighter, Magic-User, Thief, Dwarf, Elf, Halfling, Gnome, Spellblade).
- Optional demihuman level limits (standard OSE caps or extended to 14).

### Advanced Mode

Separate race and class — more flexible combinations.

- **Level 0**: Choose a race; racial abilities and stat adjustments apply.
- **Level 1–14**: Choose a race + class independently. Classes available depend on race and the Race/Class Mode setting (Strict OSE / Strict + Human Abilities / Traditional Extended / Allow All).
- Racial ability score adjustments (e.g. Elf +1 DEX, −1 CON) are applied and shown on the sheet.

### Progression Modes

| Mode | Description |
|------|-------------|
| **OSE Standard** | Official *OSE Advanced Fantasy* rules. Demihuman level caps apply. |
| **Smoothified** | House rules with alternate attack/save progression tables. No demihuman level caps. Level 0 attack penalty removed (+0 instead of −1). |
| **Labyrinth Lord** | *Labyrinth Lord* by Goblinoid Games. Saving throws differ from OSE Standard at some levels. |


### PDF Workflow

1. Click **Generate Character**
2. Click **🖨 Print / Save as PDF / EDIT** in the sheet preview, or check **Open in New Tab** first
3. In the print dialog choose **Save as PDF**, set margins to *None* or *Minimum*

---

## Other Pages

| Page | Purpose |
|------|---------|
| `index.html` | Landing page |
| `classes.html` | Class reference — progression tables and side-by-side comparisons |
| `charactersheet.html` | Character sheet viewer/editor — opened via `?d=` URL from the generator |

---

## File Structure

All JavaScript is ES6 modules (`type="module"`). No bundler, transpiler, or build system.

| File | Purpose |
|------|---------|
| `generator.html` / `gen-ui.js` | Generator page and UI logic |
| `gen-core.js` | `generateCharacterV3()` — character generation for all modes and levels |
| `charactersheet.html` / `cs-sheet-page.js` | Character sheet page controller |
| `cs-core.js` | Sheet renderer — `renderCharacterSheetHTML()` |
| `shared-core.js` | Shared logic: equipment, backgrounds, progressions, racial/class helpers |
| `shared-class-info.js` | `CLASS_INFO` — all class data (abilities, XP, HD, saves, spell slots, thief skills) |
| `shared-race-info.js` | `RACE_INFO` — all racial data (abilities, stat adjustments, level limits) |
| `legacy-utils.js` | Utility wrappers retained for backwards compatibility |

---

## Credits & License

- **Old-School Essentials** by Necrotic Gnome — <https://necroticgnome.com/>
- **Labyrinth Lord** by Goblinoid Games — <https://goblinoidgames.com/>

These generators are unofficial fan-made tools. All game content and trademarks belong to their respective owners.
