#!/bin/bash

# OSE 0-Level Character PDF Generator
# Command-line wrapper for node-canvas-generator.js

# Default values
COUNT=1
FORMAT="pdf"
SHEET_STYLE="classic"
STR_MIN=3
DEX_MIN=3
CON_MIN=3
INT_MIN=3
WIS_MIN=3
CHA_MIN=3
TOUGH_GUYS=false
FORCE_DEMIHUMAN=false
FORCE_RACE=""
OUTPUT=""
ADVANCED=true
HUMAN_RACIAL_ABILITIES=true
GYGAR=true
STDOUT=false
PRINT_MARKDOWN=false

# Store original arguments before parsing
ORIGINAL_ARGS="$@"

# Help message
show_help() {
    cat << EOF
Usage: ./generate-pdf.sh [OPTIONS]

Generate OSE 0-Level Character PDFs from the command line.

OPTIONS:
    -n, --count NUM          Number of characters to generate (1 or 4, default: 1)
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
    -t, --tough-guys         Enable Tough Guys mode (requires STR/DEX/INT/WIS ≥ 13 and HP ≥ 2)
    -d, --demihuman          Force demihuman characters only
    -r, --race RACE          Force specific race (Human, Dwarf, Elf, Gnome, or Halfling)
    -s, --style STYLE        Sheet style: classic or underground (default: classic)
    --not-advanced           Disable Advanced mode (no racial ability modifiers or minimums)
    --not-human-abilities    Disable Human Racial Abilities (no +1 CON/CHA, Blessed HP, etc.)
    --gygar                  Enable Smoothified Mode (0-level attack bonus: 0, default: ON)
    --not-gygar              Disable Smoothified Mode (0-level attack bonus: -1)
    --stdout                 Output to stdout instead of file (json/md only)
    --print-markdown         Print character data as markdown to stderr (for PDF/PNG debugging)
    
    Other:
    -h, --help               Show this help message

EXAMPLES:
    # Generate a single character
    ./generate-pdf.sh

    # Generate 4 characters
    ./generate-pdf.sh -n 4

    # Generate tough character with minimum stats
    ./generate-pdf.sh --tough-guys --str-min 13 --dex-min 13

    # Generate demihuman character
    ./generate-pdf.sh --demihuman

    # Generate specific race character
    ./generate-pdf.sh --race Elf

    # Generate 4 gnome characters
    ./generate-pdf.sh -n 4 --race Gnome

    # Generate 4 tough demihuman characters with custom output
    ./generate-pdf.sh -n 4 -t -d -o my_characters.pdf

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -n|--count)
            COUNT="$2"
            shift 2
            ;;
        -f|--format)
            FORMAT=$(echo "$2" | tr '[:upper:]' '[:lower:]')
            # Accept 'md' or 'markdown'
            if [[ "$FORMAT" == "markdown" ]]; then
                FORMAT="md"
            fi
            if [[ "$FORMAT" != "pdf" && "$FORMAT" != "png" && "$FORMAT" != "json" && "$FORMAT" != "md" ]]; then
                echo "Error: Format must be 'pdf', 'png', 'json', or 'md'"
                exit 1
            fi
            shift 2
            ;;
        -o|--output)
            OUTPUT="$2"
            shift 2
            ;;
        --str-min)
            STR_MIN="$2"
            shift 2
            ;;
        --dex-min)
            DEX_MIN="$2"
            shift 2
            ;;
        --con-min)
            CON_MIN="$2"
            shift 2
            ;;
        --int-min)
            INT_MIN="$2"
            shift 2
            ;;
        --wis-min)
            WIS_MIN="$2"
            shift 2
            ;;
        --cha-min)
            CHA_MIN="$2"
            shift 2
            ;;
        -t|--tough-guys)
            TOUGH_GUYS=true
            shift
            ;;
        -d|--demihuman)
            FORCE_DEMIHUMAN=true
            shift
            ;;
        -r|--race)
            # Normalize race input: check first 2 chars, case-insensitive
            RACE_INPUT="$2"
            RACE_LOWER=$(echo "${RACE_INPUT:0:2}" | tr '[:upper:]' '[:lower:]')
            case "$RACE_LOWER" in
                hu) FORCE_RACE="Human" ;;
                dw) FORCE_RACE="Dwarf" ;;
                el) FORCE_RACE="Elf" ;;
                gn) FORCE_RACE="Gnome" ;;
                ha) FORCE_RACE="Halfling" ;;
                *)
                    echo "Error: Unknown race '$2'. Valid races: Human, Dwarf, Elf, Gnome, Halfling"
                    exit 1
                    ;;
            esac
            shift 2
            ;;
        --not-advanced)
            ADVANCED=false
            shift
            ;;
        --not-human-abilities)
            HUMAN_RACIAL_ABILITIES=false
            shift
            ;;
        --gygar)
            GYGAR=true
            shift
            ;;
        --not-gygar)
            GYGAR=false
            shift
            ;;
        --stdout)
            STDOUT=true
            shift
            ;;
        --print-markdown)
            PRINT_MARKDOWN=true
            shift
            ;;
        -s|--style)
            STYLE_INPUT=$(echo "$2" | tr '[:upper:]' '[:lower:]')
            case "$STYLE_INPUT" in
                classic|c) SHEET_STYLE="classic" ;;
                underground|u) SHEET_STYLE="underground" ;;
                *)
                    echo "Error: Unknown style '$2'. Valid styles: classic, underground"
                    exit 1
                    ;;
            esac
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Validate count
if [[ "$COUNT" != "1" && "$COUNT" != "4" ]]; then
    echo "Error: Count must be 1 or 4"
    exit 1
fi

# Build Node.js script
NODE_SCRIPT=$(cat << 'ENDSCRIPT'
const { createCanvas } = require('canvas');
const { jsPDF } = require('jspdf');
const fs = require('fs');
const { generateSingleCharacterNode, createCanvasPDF, createCanvasPNG } = require('./node-canvas-generator.js');

const options = {
    strMin: parseInt(process.env.STR_MIN),
    dexMin: parseInt(process.env.DEX_MIN),
    conMin: parseInt(process.env.CON_MIN),
    intMin: parseInt(process.env.INT_MIN),
    wisMin: parseInt(process.env.WIS_MIN),
    chaMin: parseInt(process.env.CHA_MIN),
    toughGuys: process.env.TOUGH_GUYS === 'true',
    forceDemihuman: process.env.FORCE_DEMIHUMAN === 'true',
    forceRace: process.env.FORCE_RACE || ''
};

const count = parseInt(process.env.COUNT);
const format = process.env.FORMAT || 'pdf';
const sheetStyle = process.env.SHEET_STYLE || 'classic';
const outputFile = process.env.OUTPUT;
const useStdout = process.env.STDOUT === 'true';
const printMarkdown = process.env.PRINT_MARKDOWN === 'true';

(async () => {
    try {
        if (count === 1) {
            // Generate single character
            if (!useStdout) console.error('Generating character...');
            const character = generateSingleCharacterNode(options);
            
            // Print markdown if requested (for PDF/PNG debugging)
            if (printMarkdown && (format === 'pdf' || format === 'png')) {
                const { generateCharacterMarkdown } = require('./markdown-generator.js');
                const isAdvanced = process.env.ADVANCED === 'true';
                const markdown = generateCharacterMarkdown(character, isAdvanced);
                console.error('\n--- Character Data (Markdown) ---');
                console.error(markdown);
                console.error('--- End Character Data ---\n');
            }
            
            // Handle different formats
            if (format === 'json') {
                const output = JSON.stringify(character, null, 2);
                if (useStdout) {
                    console.log(output);
                } else {
                    const { CanvasCharacterSheet } = require('./canvas-sheet-renderer.js');
                    const filename = outputFile || CanvasCharacterSheet.generateSingleCharacterFilename(character).replace('.pdf', '.json');
                    fs.writeFileSync(filename, output);
                    console.error(`Success! Generated: ${filename}`);
                }
            } else if (format === 'md') {
                const { generateCharacterMarkdown } = require('./markdown-generator.js');
                const isAdvanced = process.env.ADVANCED === 'true';
                const output = generateCharacterMarkdown(character, isAdvanced);
                
                if (useStdout) {
                    console.log(output);
                } else {
                    const { CanvasCharacterSheet } = require('./canvas-sheet-renderer.js');
                    const filename = outputFile || CanvasCharacterSheet.generateSingleCharacterFilename(character).replace('.pdf', '.md');
                    fs.writeFileSync(filename, output);
                    console.error(`Success! Generated: ${filename}`);
                }
            } else if (format === 'png') {
                if (useStdout) {
                    console.error('Error: PNG format cannot be output to stdout');
                    process.exit(1);
                }
                
                // Choose renderer based on sheet style
                let SheetClass, filename;
                if (sheetStyle === 'underground') {
                    const { UndergroundCharacterSheet } = require('./underground-sheet-renderer.js');
                    SheetClass = UndergroundCharacterSheet;
                    filename = outputFile || UndergroundCharacterSheet.generateFilename(character, 'OSE_Underground').replace('.pdf', '.png');
                } else {
                    const { CanvasCharacterSheet } = require('./canvas-sheet-renderer.js');
                    SheetClass = CanvasCharacterSheet;
                    filename = outputFile || CanvasCharacterSheet.generateSingleCharacterFilename(character).replace('.pdf', '.png');
                }
                
                // Create canvas and render (size depends on sheet style)
                const canvasWidth = sheetStyle === 'underground' ? 3828 : 2700;
                const canvasHeight = sheetStyle === 'underground' ? 4953 : 3495;
                const canvas = createCanvas(canvasWidth, canvasHeight);
                const sheetGen = new SheetClass(canvas);
                await sheetGen.generateCharacterSheet(character);
                
                // Save as PNG
                const pngBuffer = sheetGen.toBuffer('image/png');
                fs.writeFileSync(filename, pngBuffer);
                console.error(`Success! Generated: ${filename}`);
            } else {
                if (useStdout) {
                    console.error('Error: PDF format cannot be output to stdout');
                    process.exit(1);
                }
                
                // Choose renderer based on sheet style
                let SheetClass, filename;
                if (sheetStyle === 'underground') {
                    const { UndergroundCharacterSheet } = require('./underground-sheet-renderer.js');
                    SheetClass = UndergroundCharacterSheet;
                    filename = outputFile || UndergroundCharacterSheet.generateFilename(character, 'OSE_Underground');
                } else {
                    const { CanvasCharacterSheet } = require('./canvas-sheet-renderer.js');
                    SheetClass = CanvasCharacterSheet;
                    filename = outputFile || CanvasCharacterSheet.generateSingleCharacterFilename(character);
                }
                
                // Create canvas and render (size depends on sheet style)
                const canvasWidth = sheetStyle === 'underground' ? 3828 : 2700;
                const canvasHeight = sheetStyle === 'underground' ? 4953 : 3495;
                const canvas = createCanvas(canvasWidth, canvasHeight);
                const sheetGen = new SheetClass(canvas);
                await sheetGen.generateCharacterSheet(character);
                
                // Create PDF
                const doc = new jsPDF('portrait', 'pt', 'letter');
                const pngBuffer = sheetGen.toBuffer('image/png');
                const base64Image = 'data:image/png;base64,' + pngBuffer.toString('base64');
                doc.addImage(base64Image, 'PNG', 0, 0, 612, 792, '', 'FAST');
                
                const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
                fs.writeFileSync(filename, pdfBuffer);
                console.error(`Success! Generated: ${filename}`);
            }
        } else if (format === 'json') {
            // Generate multiple characters as JSON array
            console.log(`Generating ${count} characters...`);
            const characters = [];
            
            for (let i = 0; i < count; i++) {
                console.log(`  Generating character ${i + 1}/${count}...`);
                const character = generateSingleCharacterNode(options);
                characters.push(character);
            }
            
            // Use shared filename generator
            const { CanvasCharacterSheet } = require('./canvas-sheet-renderer.js');
            const forceRace = process.env.FORCE_RACE || '';
            let filename = outputFile || CanvasCharacterSheet.generateMultiCharacterFilename(forceRace);
            filename = filename.replace('.pdf', '.json');
            
            // Write as JSON array
            fs.writeFileSync(filename, JSON.stringify(characters, null, 2));
            console.log(`Success! Generated: ${filename}`);
        } else {
            // Generate 4 characters - each as their own PDF file
            console.log('Generating 4 characters...');
            const { CanvasCharacterSheet } = require('./canvas-sheet-renderer.js');
            const generatedFiles = [];
            
            for (let i = 0; i < 4; i++) {
                console.log(`  Generating character ${i + 1}/4...`);
                const character = generateSingleCharacterNode(options);
                
                // Choose renderer based on sheet style
                let SheetClass, filename;
                if (sheetStyle === 'underground') {
                    const { UndergroundCharacterSheet } = require('./underground-sheet-renderer.js');
                    SheetClass = UndergroundCharacterSheet;
                    filename = UndergroundCharacterSheet.generateFilename(character, 'OSE_Underground');
                } else {
                    SheetClass = CanvasCharacterSheet;
                    filename = CanvasCharacterSheet.generateSingleCharacterFilename(character);
                }
                
                // Create canvas and render (size depends on sheet style)
                const canvasWidth = sheetStyle === 'underground' ? 3828 : 2700;
                const canvasHeight = sheetStyle === 'underground' ? 4953 : 3495;
                const canvas = createCanvas(canvasWidth, canvasHeight);
                const sheetGen = new SheetClass(canvas);
                await sheetGen.generateCharacterSheet(character);
                
                // Create individual PDF
                const doc = new jsPDF('portrait', 'pt', 'letter');
                const pngBuffer = sheetGen.toBuffer('image/png');
                const base64Image = 'data:image/png;base64,' + pngBuffer.toString('base64');
                doc.addImage(base64Image, 'PNG', 0, 0, 612, 792, '', 'FAST');
                
                const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
                fs.writeFileSync(filename, pdfBuffer);
                generatedFiles.push(filename);
            }
            
            console.log(`Success! Generated ${generatedFiles.length} files:`);
            generatedFiles.forEach(file => console.log(`  - ${file}`));
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();
ENDSCRIPT
)

# Export environment variables for Node.js script
export COUNT
export FORMAT
export SHEET_STYLE
export STR_MIN
export DEX_MIN
export CON_MIN
export INT_MIN
export WIS_MIN
export CHA_MIN
export TOUGH_GUYS
export FORCE_DEMIHUMAN
export FORCE_RACE
export OUTPUT
export ADVANCED
export HUMAN_RACIAL_ABILITIES
export GYGAR
export STDOUT
export PRINT_MARKDOWN

# Detect if running on Bazzite (immutable OS) and use distrobox if needed
if [[ -f /etc/os-release ]]; then
    source /etc/os-release
    if [[ "$ID" == "bazzite" ]] || [[ "$VARIANT_ID" == "bazzite" ]]; then
        # Running on Bazzite - check if we're already inside distrobox
        if [[ -z "$CONTAINER_ID" ]]; then
            # Not in distrobox yet, so enter it
            echo "Detected Bazzite - using distrobox fedora container..."
            # Get the absolute path to this script
            SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
            exec distrobox enter fedora -- bash -c "cd $(pwd) && bash '$SCRIPT_PATH' $ORIGINAL_ARGS"
        fi
    fi
fi

# Run Node.js script
echo "OSE 0-Level Character PDF Generator"
echo "===================================="
if [[ "$TOUGH_GUYS" == "true" ]]; then
    echo "Mode: Tough Guys"
fi
if [[ -n "$FORCE_RACE" ]]; then
    echo "Race: $FORCE_RACE only"
elif [[ "$FORCE_DEMIHUMAN" == "true" ]]; then
    echo "Race: Demihuman only"
fi
if [[ "$STR_MIN" != "3" || "$DEX_MIN" != "3" || "$CON_MIN" != "3" || "$INT_MIN" != "3" || "$WIS_MIN" != "3" || "$CHA_MIN" != "3" ]]; then
    echo "Minimums: STR=$STR_MIN DEX=$DEX_MIN CON=$CON_MIN INT=$INT_MIN WIS=$WIS_MIN CHA=$CHA_MIN"
fi
echo ""

node -e "$NODE_SCRIPT"
