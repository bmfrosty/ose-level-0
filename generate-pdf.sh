#!/bin/bash

# OSE 0-Level Character PDF Generator
# Command-line wrapper for node-canvas-generator.js

# Default values
COUNT=1
FORMAT="pdf"
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

# Store original arguments before parsing
ORIGINAL_ARGS="$@"

# Help message
show_help() {
    cat << EOF
Usage: ./generate-pdf.sh [OPTIONS]

Generate OSE 0-Level Character PDFs from the command line.

OPTIONS:
    -n, --count NUM          Number of characters to generate (1 or 4, default: 1)
    -f, --format FORMAT      Output format: pdf or png (default: pdf)
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
    --not-advanced           Disable Advanced mode (humans get no racial abilities)
    
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
            if [[ "$FORMAT" != "pdf" && "$FORMAT" != "png" ]]; then
                echo "Error: Format must be 'pdf' or 'png'"
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
const outputFile = process.env.OUTPUT;

(async () => {
    try {
        if (count === 1) {
            // Generate single character
            console.log('Generating character...');
            const character = generateSingleCharacterNode(options);
            
            // Use shared filename generator
            const { CanvasCharacterSheet } = require('./canvas-sheet-renderer.js');
            let filename = outputFile || CanvasCharacterSheet.generateSingleCharacterFilename(character);
            
            // Handle PNG format
            if (format === 'png') {
                filename = filename.replace('.pdf', '.png');
                await createCanvasPNG(character, filename);
            } else {
                await createCanvasPDF(character, filename);
            }
            console.log(`Success! Generated: ${filename}`);
        } else {
            // Generate 4 characters
            console.log('Generating 4 characters...');
            const { CanvasCharacterSheet } = require('./canvas-sheet-renderer.js');
            const doc = new jsPDF('portrait', 'pt', 'letter');
            
            for (let i = 0; i < 4; i++) {
                console.log(`  Generating character ${i + 1}/4...`);
                const character = generateSingleCharacterNode(options);
                
                // Create canvas and render
                const canvas = createCanvas(2550, 3300);
                const canvasGen = new CanvasCharacterSheet(canvas);
                canvasGen.generateCharacterSheet(character);
                
                // Add to PDF
                if (i > 0) doc.addPage();
                const pngBuffer = canvasGen.toBuffer('image/png');
                const base64Image = 'data:image/png;base64,' + pngBuffer.toString('base64');
                doc.addImage(base64Image, 'PNG', 0, 0, 612, 792, '', 'FAST');
            }
            
            // Use shared filename generator
            const forceRace = process.env.FORCE_RACE || '';
            const filename = outputFile || CanvasCharacterSheet.generateMultiCharacterFilename(forceRace);
            const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
            fs.writeFileSync(filename, pdfBuffer);
            console.log(`Success! Generated: ${filename}`);
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
