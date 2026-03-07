# PDF Generation Files

This project uses a **canvas-based rendering approach** to generate high-quality, consistent PDF character sheets in both browser and Node.js environments.

## Architecture Overview

The PDF generation system consists of three files that work together:

### 1. canvas-sheet-renderer.js (Shared Core)
**Purpose:** Single source of truth for character sheet layout  
**Environment:** Both browser and Node.js  
**Key Features:**
- Contains the `CanvasCharacterSheet` class with all rendering logic
- Accepts a canvas object from either environment
- Renders at 300 DPI for high-quality output
- ~400 lines of layout code used by both environments
- Exports for both CommonJS (Node.js) and browser

**Why it exists:** Eliminates code duplication and ensures pixel-perfect identical output from both browser and Node.js.

### 2. canvas-generator.js (Browser Wrapper)
**Purpose:** Browser-specific PDF generation  
**Environment:** Web browser (client-side)  
**Key Features:**
- Creates browser canvas: `document.createElement('canvas')`
- Imports `CanvasCharacterSheet` from canvas-sheet-renderer.js
- Provides `generateCanvasPDF()` for single character sheets
- Provides `generateCanvasBulkPDF()` for 4 characters at once
- Uses jsPDF to embed canvas as PNG in PDF
- ~70 lines (reduced from ~500 lines)

**Usage:** Called from index.html when user clicks PDF generation buttons

### 3. node-canvas-generator.js (Node.js Wrapper)
**Purpose:** Node.js command-line PDF generation  
**Environment:** Node.js (server-side/command-line)  
**Key Features:**
- Creates Node.js canvas: `createCanvas(2550, 3300)` from 'canvas' package
- Imports `CanvasCharacterSheet` from canvas-sheet-renderer.js
- Generates PDFs as files on disk
- Can be run as standalone script: `node node-canvas-generator.js`
- ~100 lines (reduced from ~500 lines)

**Usage:** Run from command line to generate PDFs without a browser

## How It Works

### Browser Flow:
1. User clicks "Generate PDF" button in index.html
2. canvas-generator.js creates a browser canvas element
3. Passes canvas to `CanvasCharacterSheet` (from canvas-sheet-renderer.js)
4. `CanvasCharacterSheet` renders character sheet at 300 DPI
5. Canvas converted to PNG data URL
6. jsPDF embeds PNG in PDF document
7. PDF downloaded to user's computer

### Node.js Flow:
1. User runs `node node-canvas-generator.js`
2. node-canvas-generator.js creates a Node.js canvas (via 'canvas' package)
3. Passes canvas to `CanvasCharacterSheet` (from canvas-sheet-renderer.js)
4. `CanvasCharacterSheet` renders character sheet at 300 DPI (same code as browser!)
5. Canvas converted to PNG buffer
6. jsPDF embeds PNG in PDF document
7. PDF saved to disk

## Key Benefits

### ✅ Guaranteed Consistency
Both browser and Node.js use the **exact same rendering code**, ensuring pixel-perfect identical PDFs.

### ✅ Single Source of Truth
Character sheet layout is defined once in canvas-sheet-renderer.js. Changes automatically apply to both environments.

### ✅ Reduced Code Duplication
- Before: ~900 lines of duplicated rendering code
- After: ~400 lines of shared code + ~170 lines of environment-specific wrappers
- **Reduction:** ~330 lines eliminated

### ✅ High Quality Output
- 300 DPI rendering for crisp, professional-looking PDFs
- Pixel-perfect text positioning
- Consistent fonts and spacing

### ✅ Easy Maintenance
Layout changes only need to be made in one place (canvas-sheet-renderer.js).

## Trade-offs

### Advantages of Canvas Approach:
- ✅ Pixel-perfect rendering
- ✅ Consistent output across environments
- ✅ High-quality 300 DPI resolution
- ✅ No font positioning issues

### Disadvantages:
- ❌ Larger file sizes (embedded PNG images)
- ❌ Text is not selectable in PDF (it's an image)
- ❌ Slightly slower generation than direct PDF

## File Structure

```
canvas-sheet-renderer.js  (~400 lines) - Shared rendering logic
├── canvas-generator.js    (~70 lines)  - Browser wrapper
└── node-canvas-generator.js (~100 lines) - Node.js wrapper
```

## Current Usage

**Web Interface (index.html):**
- ✅ Uses canvas-sheet-renderer.js + canvas-generator.js
- Single character PDF: `generateCanvasPDF()`
- Bulk PDF (4 characters): `generateCanvasBulkPDF()`

**Command Line (Shell Script):**
- ✅ Uses generate-pdf.sh (wrapper script)
- ✅ Internally uses canvas-sheet-renderer.js + node-canvas-generator.js
- Run: `./generate-pdf.sh [OPTIONS]`
- Supports single or 4-character PDFs
- Automatic Bazzite/distrobox detection
- Full command-line options (see below)

**Command Line (Direct Node.js):**
- ✅ Uses canvas-sheet-renderer.js + node-canvas-generator.js
- Run: `node node-canvas-generator.js`
- Generates single character PDF to disk

## Shell Script: generate-pdf.sh

**Purpose:** User-friendly command-line wrapper for PDF generation  
**Features:**
- Automatic Bazzite/immutable OS detection
- Enters distrobox container if needed
- Passes all arguments through to Node.js
- Supports all character generation options

**Command-Line Options:**
```bash
./generate-pdf.sh [OPTIONS]

OPTIONS:
    -n, --count NUM          Number of characters (1 or 4, default: 1)
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
                            Case-insensitive, matches first 2 chars
                            (e.g., "elf", "elves", "ELF" all work)
    
    -h, --help               Show help message
```

**Examples:**
```bash
# Generate single character
./generate-pdf.sh

# Generate 4 characters
./generate-pdf.sh -n 4

# Generate 4 elves
./generate-pdf.sh -n 4 --race elf

# Generate tough dwarf
./generate-pdf.sh --race dwarf --tough-guys

# Generate with minimum stats
./generate-pdf.sh --str-min 13 --dex-min 13
```

**Filename Generation:**
- Single character: `OSE_0Level_{Race}_{Profession}_{Name}.pdf`
- Multi-character (random): `OSE_0Level_4_Characters_{Timestamp}.pdf`
- Multi-character (specific race): `OSE_0Level_4_{RacePlural}_{Timestamp}.pdf`
  - Examples: `OSE_0Level_4_Elves_2026-03-07T04-27.pdf`
  - Proper pluralization: Humans, Dwarves, Elves, Gnomes, Halflings

## JavaScript Files Used

**Core Character Generation:**
- `dice-utils.js` - Dice rolling functions
- `ose-modifiers.js` - Ability score modifiers and effects
- `character-utils.js` - Character generation logic
- `background-tables.js` - Profession/equipment tables
- `names-tables.js` - Name tables and race selection

**PDF Generation:**
- `canvas-sheet-renderer.js` - Shared rendering logic (both environments)
- `canvas-generator.js` - Browser-specific wrapper
- `node-canvas-generator.js` - Node.js-specific wrapper

**Web Interface:**
- `index.html` - Main web interface
- `main-generator.js` - Browser character generation
- `character-display.js` - Display character in browser

## Dependencies

**Browser:**
- jsPDF (loaded via CDN)
- HTML5 Canvas API (built-in)

**Node.js:**
- `canvas` package (for Node.js canvas implementation)
- `jspdf` package (for PDF generation)

**Shell:**
- Bash (for generate-pdf.sh)
- distrobox (optional, for Bazzite/immutable OS support)

## Previous Architecture (Removed)

The project previously had four PDF generation files:
- ❌ `pdf-generator.js` (deleted) - Direct jsPDF rendering in browser
- ❌ `node-pdf-generator.js` (deleted) - Direct PDFKit rendering in Node.js

These were removed because:
1. They duplicated the canvas rendering code
2. They could produce different output between browser and Node.js
3. Direct PDF generation had text positioning inconsistencies
4. Canvas approach provides better quality

## Summary

This architecture provides a clean, maintainable solution for generating consistent, high-quality PDF character sheets in both browser and Node.js environments, with minimal code duplication and a single source of truth for the character sheet layout.
