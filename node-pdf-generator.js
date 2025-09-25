#!/usr/bin/env node

const PDFDocument = require('pdfkit');
const fs = require('fs');

// Import the character generation logic from existing modules
const { rollDice, roll1d4, rollD12 } = require('./dice-utils.js');
const { backgroundTables } = require('./background-tables.js');
const { namesTables, rollRace, getRandomName } = require('./names-tables.js');
const { getModifier, getModifierEffects } = require('./ose-modifiers.js');
const { abilities, calculateHitPoints, getBackgroundByHitPoints, calculateArmorClass, generateSingleCharacter } = require('./character-utils.js');

// Import the shared drawCharacterSheet function from pdf-generator.js
const { drawCharacterSheet } = require('./pdf-generator.js');

// Make functions and data available globally for character-utils.js and pdf-generator.js
global.rollDice = rollDice;
global.backgroundTables = backgroundTables;
global.getModifierEffects = getModifierEffects;

// Improved PDFKit adapter to properly handle colors and styling
class PDFKitAdapter {
    constructor(pdfDoc) {
        this.doc = pdfDoc;
        this.currentFont = 'Helvetica';
        this.currentFontStyle = 'normal';
        this.currentFontSize = 12;
        this.fillColor = [0, 0, 0];
        this.textColor = [0, 0, 0];
    }

    setFont(font, style) {
        this.currentFont = font === 'helvetica' ? 'Helvetica' : font;
        this.currentFontStyle = style === 'bold' ? 'Bold' : '';
        const fontName = this.currentFont + (this.currentFontStyle ? '-' + this.currentFontStyle : '');
        this.doc.font(fontName);
        return this;
    }

    setFontSize(size) {
        this.currentFontSize = size;
        this.doc.fontSize(size);
        return this;
    }

    setFillColor(r, g, b) {
        // Store fill color for rectangles (0-255 range converted to 0-1 range)
        this.fillColor = [r/255, g/255, b/255];
        return this;
    }

    setTextColor(r, g, b) {
        // Store text color (0-255 range converted to 0-1 range)
        this.textColor = [r/255, g/255, b/255];
        return this;
    }

    text(text, x, y, options = {}) {
        // CRITICAL FIX: Force text color application every time
        // PDFKit loses text color context after drawing filled rectangles
        this.doc.fillColor(this.textColor[0], this.textColor[1], this.textColor[2]);
        
        // PDFKit-specific adjustments to match jsPDF formatting exactly
        // PDFKit has different baseline positioning than jsPDF
        let adjustedY = y;
        
        // Apply font-size specific adjustments to match jsPDF positioning
        if (this.currentFontSize <= 8) {
            adjustedY = y - 1; // Small fonts need minimal adjustment
        } else if (this.currentFontSize <= 12) {
            adjustedY = y - 2; // Medium fonts need slight adjustment
        } else if (this.currentFontSize <= 16) {
            adjustedY = y - 3; // Large fonts need more adjustment
        } else {
            adjustedY = y - 4; // Very large fonts need maximum adjustment
        }
        
        this.doc.text(text, x, adjustedY, { 
            width: options.width,
            align: options.align || 'left',
            lineBreak: false,
            continued: false
        });
        return this;
    }

    rect(x, y, width, height, style = '') {
        if (style === 'F') {
            // Filled rectangle - use fill color and reset text color state
            this.doc.rect(x, y, width, height)
                   .fillColor(this.fillColor)
                   .fill();
            // CRITICAL: After drawing filled rectangle, we need to ensure text color is ready
            // PDFKit may have changed the fill color context
        } else {
            // Stroked rectangle - use black stroke
            this.doc.rect(x, y, width, height)
                   .strokeColor([0, 0, 0])
                   .stroke();
        }
        return this;
    }

    getTextWidth(text) {
        return this.doc.widthOfString(text);
    }

    splitTextToSize(text, maxWidth) {
        // Improved text splitting for PDFKit
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (this.doc.widthOfString(testLine) <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    lines.push(word);
                }
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines.length > 0 ? lines : [text];
    }

    addPage() {
        this.doc.addPage();
        return this;
    }
}

// Node.js compatible character generation function
function generateSingleCharacterNode() {
    // Generate ability scores using existing functions
    const results = abilities.map(ability => {
        const roll = rollDice(3, 6);
        const modifier = getModifier(roll);
        return { ability, roll, modifier };
    });
    
    // Calculate hit points using existing function
    const conModifier = results.find(r => r.ability === 'CON').modifier;
    const hitPoints = calculateHitPoints(conModifier);
    
    // Get background based on hit points using existing function
    const background = getBackgroundByHitPoints(hitPoints.total);
    
    // Calculate armor class using existing function
    const dexModifier = results.find(r => r.ability === 'DEX').modifier;
    const armorClass = calculateArmorClass(background.armor, dexModifier);
    
    // Generate race and name using existing functions
    const race = rollRace();
    const name = getRandomName(race);
    
    return {
        results,
        background,
        race,
        name,
        hitPoints,
        armorClass,
        total: results.reduce((sum, r) => sum + r.modifier, 0)
    };
}

function createPDF(character, filename) {
    // Create a new PDF document with Letter size (612 x 792 points) and no margins
    // We handle margins manually in the drawCharacterSheet function
    const doc = new PDFDocument({ 
        size: 'letter', 
        margin: 0,  // No automatic margins - we control positioning manually
        bufferPages: true
    });
    
    // Pipe the PDF to a file
    doc.pipe(fs.createWriteStream(filename));
    
    // Create PDFKit adapter and use the shared drawCharacterSheet function
    const adapter = new PDFKitAdapter(doc);
    
    // Use the shared drawCharacterSheet function from pdf-generator.js
    drawCharacterSheet(adapter, character);
    
    // Finalize the PDF
    doc.end();
    
    console.log(`PDF generated: ${filename}`);
}

// Generate a character and create PDF
if (require.main === module) {
    try {
        const character = generateSingleCharacterNode();
        const filename = `OSE_0Level_${character.background.profession.replace(/[^a-zA-Z0-9]/g, '_')}_node.pdf`;
        createPDF(character, filename);
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}

module.exports = { createPDF };
