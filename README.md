# OSE 0-Level Character Generator

A web-based and command-line tool for generating Old-School Essentials (OSE) 0-level characters with support for Advanced Mode, Gygar Mode, and dynamic saving throws/attack bonuses.

## Features

### Core Features
- **Random Character Generation:** Generate 0-level characters with random ability scores, backgrounds, and equipment
- **Multiple Output Formats:** Web display, PDF, PNG, Markdown, and JSON
- **Race Support:** Human, Dwarf, Elf, Gnome, Halfling
- **Background System:** 100 unique 0-level professions with appropriate equipment
- **Advanced Mode:** Race-based ability adjustments and racial abilities (OSE Advanced Fantasy)
- **Gygar Mode:** Alternative attack bonus progression (from "The Ruins of Castle Gygar" module)

### Advanced Features (NEW!)
- **Dynamic Saving Throws:** Saving throws calculated based on race and abilities
- **Dwarf Resilience:** Dwarves in Advanced Mode get CON-based bonuses to Death/Wands/Spells saves
  - CON 7-10: +2 bonus
  - CON 11-14: +3 bonus
  - CON 15-17: +4 bonus
  - CON 18: +5 bonus
- **Dynamic Attack Bonus:** Attack bonus varies by mode
  - Gygar Mode (default): +0 at level 0
  - Normal Mode: -1 at level 0
- **Character Object Fields:** All characters now include `level`, `attackBonus`, and `savingThrows` fields

### Generation Options
- **Ability Score Minimums:** Set minimum values for each ability score
- **Tough Guys Mode:** Requires at least one prime requisite ≥13 and HP ≥2
- **Force Race:** Generate specific race characters
- **Force Demihuman:** Generate only demihuman characters
- **Sheet Styles:** Classic or Underground character sheet layouts

## Quick Start

### Web Interface
1. Open `index.html` in a web browser
2. Configure options (Advanced Mode, Gygar Mode, minimums, etc.)
3. Click "Generate Character" or use race-specific buttons
4. Export as PDF, PNG, Markdown, or JSON

### Command Line
```bash
# Generate a single character PDF
./generate-pdf.sh

# Generate a Dwarf character
./generate-pdf.sh --race Dwarf

# Generate 4 characters
./generate-pdf.sh -n 4

# Generate with minimum stats
./generate-pdf.sh --str-min 13 --dex-min 13 --tough-guys

# Generate as PNG
./generate-pdf.sh --race Elf --format png

# Generate as Markdown to stdout
./generate-pdf.sh --race Gnome --format md --stdout

# Generate with Underground sheet style
./generate-pdf.sh --race Halfling --style underground
```

## Modes

### Advanced Mode (Default: ON)
- Enables race-based ability score adjustments
- Enables racial abilities (including Dwarf Resilience)
- Humans can optionally get racial abilities (checkbox)
- Dwarves get CON-based saving throw bonuses

### Gygar Mode (Default: ON)
- Named after "The Ruins of Castle Gygar" module
- Changes attack bonus at level 0 from -1 to 0
- Future: Will have different saving throw progressions at higher levels
- Link: https://www.drivethrurpg.com/en/product/510225/the-ruins-of-castle-gygar

### Normal Mode
- Disable Advanced Mode: No racial adjustments or abilities
- Disable Gygar Mode: Attack bonus -1 at level 0

## Dwarf Resilience

In Advanced Mode, Dwarves have a special **Resilience** ability that grants bonuses to certain saving throws based on their Constitution score:

| CON Score | Bonus to Death/Wands/Spells |
|-----------|----------------------------|
| 6 or lower | +0 |
| 7-10 | +2 |
| 11-14 | +3 |
| 15-17 | +4 |
| 18 | +5 |

**Important Notes:**
- Resilience only applies in Advanced Mode
- Bonus applies to: Death, Wands, and Spells saves
- Bonus does NOT apply to: Paralysis or Breath saves
- Based on CON score (not modifier)

**Example:** A Dwarf with CON 12 has saving throws of Death 11, Wands 12, Paralysis 16, Breath 17, Spells 15 (instead of the base 14/15/16/17/18).

## Command Line Options

```
Usage: ./generate-pdf.sh [OPTIONS]

OPTIONS:
    -n, --count NUM          Number of characters (1 or 4, default: 1)
    -f, --format FORMAT      Output format: pdf, png, json, or md (default: pdf)
    -o, --output FILE        Output filename (default: auto-generated)
    
    Ability Score Minimums:
    --str-min NUM            Minimum STR score (3-18, default: 3)
    --dex-min NUM            Minimum DEX score (3-18, default: 3)
    --con-min NUM            Minimum CON score (3-18, default: 3)
    --int-min NUM            Minimum INT score (3-18, default: 3)
    --wis-min NUM            Minimum WIS score (3-18, default: 3)
    --cha-min NUM            Minimum CHA score (3-18, default: 3)
    
    Character Options:
    -t, --tough-guys         Enable Tough Guys mode
    -d, --demihuman          Force demihuman characters only
    -r, --race RACE          Force specific race (Human, Dwarf, Elf, Gnome, Halfling)
    -s, --style STYLE        Sheet style: classic or underground (default: classic)
    --not-advanced           Disable Advanced mode
    --gygar                  Enable Gygar Mode (default: ON)
    --not-gygar              Disable Gygar Mode
    --stdout                 Output to stdout (json/md only)
    --print-markdown         Print character data as markdown to stderr
    
    Other:
    -h, --help               Show help message
```

## Output Formats

### PDF
High-quality character sheets suitable for printing. Two styles available:
- **Classic:** Clean, modern layout
- **Underground:** OSE Advanced Adventure Compendium style

### PNG
Character sheets as image files (same styles as PDF)

### Markdown
Plain text format with all character data in Markdown tables

### JSON
Complete character data in JSON format, including:
- `level`: Character level (always 0 for this generator)
- `attackBonus`: Dynamic attack bonus based on mode
- `savingThrows`: Object with Death, Wands, Paralysis, Breath, Spells values
- All ability scores, background, equipment, etc.

## Development

### Requirements
- Node.js (for PDF/PNG generation)
- npm packages: canvas, jspdf

### Bazzite/Immutable OS Users
This project uses distrobox for Node.js development. The `generate-pdf.sh` script automatically detects Bazzite and enters the distrobox container.

For manual Node.js commands:
```bash
# Enter distrobox
distrobox enter fedora

# Rebuild canvas module if needed
npm rebuild canvas

# Run Node.js commands
node -e "..."
```

See `CLINE.md` for more development environment details.

## Files

- `index.html` - Web interface
- `generate-pdf.sh` - Command-line PDF generator
- `main-generator.js` - Browser character generation logic
- `node-canvas-generator.js` - Node.js character generation
- `canvas-sheet-renderer.js` - Classic sheet renderer
- `underground-sheet-renderer.js` - Underground sheet renderer
- `markdown-generator.js` - Markdown export
- `character-display.js` - Web display
- `names-tables.js` - Race names, saving throws, attack bonuses
- `background-tables.js` - 100 0-level professions
- `race-adjustments.js` - Advanced Mode racial adjustments
- `ose-modifiers.js` - Ability score modifiers
- `character-utils.js` - HP, AC, background selection

## Future Plans

### Basic Mode (Planned)
- Support for OSE Basic (class-based, no races)
- Dwarf, Elf, Halfling as classes instead of races
- Class-based saving throws and attack bonuses

### Higher Levels (Planned)
- Support for generating characters above level 0
- Level-based saving throw progressions
- Level-based attack bonus progressions
- Different progressions for Gygar Mode vs Normal Mode

## Credits

- **Old-School Essentials** by Necrotic Gnome
- **The Ruins of Castle Gygar** module (Gygar Mode inspiration)
- Background tables and 0-level character concept from OSE 0-Level PDF

## License

This is a fan-made tool for Old-School Essentials. All game content belongs to Necrotic Gnome.
