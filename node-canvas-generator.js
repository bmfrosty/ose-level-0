#!/usr/bin/env node

const { createCanvas } = require('canvas');
const { jsPDF } = require('jspdf');
const fs = require('fs');

// Import the character generation logic from existing modules
const { rollDice } = require('./dice-utils.js');
const { backgroundTables } = require('./background-tables.js');
const { rollRace, getRandomName, getRacialAbilities, isDemihuman, getCommonDemihumanAbilities } = require('./names-tables.js');
const { getModifier, getModifierEffects } = require('./ose-modifiers.js');
const { abilities, calculateHitPoints, getBackgroundByHitPoints, calculateArmorClass } = require('./character-utils.js');
const { applyRaceAdjustments, meetsRaceMinimums } = require('./race-adjustments.js');

// Import the shared canvas renderer
const { CanvasCharacterSheet } = require('./canvas-sheet-renderer.js');

// Make functions available globally for canvas-sheet-renderer.js
global.getModifierEffects = getModifierEffects;
global.getRacialAbilities = getRacialAbilities;
global.isDemihuman = isDemihuman;
global.getCommonDemihumanAbilities = getCommonDemihumanAbilities;
global.backgroundTables = backgroundTables;

// Generate a single character with optional constraints
function generateSingleCharacterNode(options = {}) {
    const {
        strMin = 3,
        dexMin = 3,
        conMin = 3,
        intMin = 3,
        wisMin = 3,
        chaMin = 3,
        toughGuys = false,
        forceDemihuman = false,
        forceRace = ''
    } = options;
    
    let attempts = 0;
    const maxAttempts = 10000; // Prevent infinite loops
    
    while (attempts < maxAttempts) {
        attempts++;
        
        // Roll abilities
        const results = abilities.map(ability => {
            const roll = rollDice(3, 6);
            const modifier = getModifier(roll);
            return { ability, roll, modifier };
        });
        
        // Check minimum requirements
        const meetsMinimums = 
            results.find(r => r.ability === 'STR').roll >= strMin &&
            results.find(r => r.ability === 'DEX').roll >= dexMin &&
            results.find(r => r.ability === 'CON').roll >= conMin &&
            results.find(r => r.ability === 'INT').roll >= intMin &&
            results.find(r => r.ability === 'WIS').roll >= wisMin &&
            results.find(r => r.ability === 'CHA').roll >= chaMin;
        
        if (!meetsMinimums) continue;
        
        // Generate race early so we can use it for HP calculation
        let race;
        
        // Force specific race if requested
        if (forceRace) {
            race = forceRace;
        } else {
            race = rollRace();
            
            // Force demihuman if requested
            if (forceDemihuman) {
                let demihumanAttempts = 0;
                while (!isDemihuman(race) && demihumanAttempts < 100) {
                    race = rollRace();
                    demihumanAttempts++;
                }
            }
        }
        
        // Check if Advanced mode is enabled
        const isAdvanced = process.env.ADVANCED === 'true';
        
        // Apply race adjustments if Advanced mode
        const adjustedResults = applyRaceAdjustments(results, race, isAdvanced);
        
        // Check race minimums if Advanced mode
        if (!meetsRaceMinimums(adjustedResults, race, isAdvanced)) {
            continue;
        }
        
        // Calculate hit points with race for Blessed ability (use adjusted results)
        const conModifier = adjustedResults.find(r => r.ability === 'CON').modifier;
        const hitPoints = calculateHitPoints(conModifier, race);
        
        // Must have at least 1 HP to be an adventurer
        if (hitPoints.total < 1) continue;
        
        // Must have at least one ability score of 9 or above
        const hasHighAbility = results.some(r => r.roll >= 9);
        if (!hasHighAbility) continue;
        
        // Check "Tough Guys" mode requirements if enabled
        if (toughGuys) {
            const hasToughAbility = results.some(r => 
                (r.ability === 'STR' || r.ability === 'DEX' || r.ability === 'INT' || r.ability === 'WIS') && 
                r.roll >= 13
            );
            const hasEnoughHP = hitPoints.total >= 2;
            
            if (!hasToughAbility || !hasEnoughHP) continue;
        }
        
        // Get background and armor class (use adjusted results)
        const background = getBackgroundByHitPoints(hitPoints.total);
        const dexModifier = adjustedResults.find(r => r.ability === 'DEX').modifier;
        const armorClass = calculateArmorClass(background.armor, dexModifier);
        
        // Generate name (race already determined above)
        const name = getRandomName(race);
        const startingGold = rollDice(3, 6);
        
        return {
            results: adjustedResults,
            background,
            race,
            name,
            hitPoints,
            armorClass,
            startingGold,
            total: adjustedResults.reduce((sum, r) => sum + r.modifier, 0)
        };
    }
    
    throw new Error(`Failed to generate valid character after ${maxAttempts} attempts. Try relaxing constraints.`);
}

// Generate PNG image only (no PDF)
async function createCanvasPNG(character, filename) {
    return new Promise((resolve, reject) => {
        try {
            // Create Node.js canvas
            const canvas = createCanvas(2550, 3300);
            
            // Create canvas generator with Node.js canvas
            const canvasGen = new CanvasCharacterSheet(canvas);
            
            // Generate character sheet on canvas
            canvasGen.generateCharacterSheet(character);
            
            // Get PNG buffer from canvas
            const pngBuffer = canvasGen.toBuffer('image/png');
            
            // Save PNG to file
            fs.writeFileSync(filename, pngBuffer);
            
            console.log(`PNG generated: ${filename}`);
            resolve(filename);
        } catch (error) {
            console.error('Error generating PNG:', error);
            reject(error);
        }
    });
}

// Generate PDF with canvas rendering
async function createCanvasPDF(character, filename) {
    return new Promise((resolve, reject) => {
        try {
            // Create Node.js canvas
            const canvas = createCanvas(2550, 3300);
            
            // Create canvas generator with Node.js canvas
            const canvasGen = new CanvasCharacterSheet(canvas);
            
            // Generate character sheet on canvas
            canvasGen.generateCharacterSheet(character);
            
            // Get PNG buffer from canvas
            const pngBuffer = canvasGen.toBuffer('image/png');
            
            // Create PDF with jsPDF
            const doc = new jsPDF('portrait', 'pt', 'letter');
            
            // Convert buffer to base64 data URL
            const base64Image = 'data:image/png;base64,' + pngBuffer.toString('base64');
            
            // Add image to PDF (full page)
            doc.addImage(base64Image, 'PNG', 0, 0, 612, 792, '', 'FAST');
            
            // Save PDF to file
            const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
            fs.writeFileSync(filename, pdfBuffer);
            
            console.log(`PDF generated: ${filename}`);
            resolve(filename);
        } catch (error) {
            console.error('Error generating PDF:', error);
            reject(error);
        }
    });
}

// Main execution
if (require.main === module) {
    (async () => {
        try {
            const character = generateSingleCharacterNode();
            const filename = `OSE_0Level_${character.background.profession.replace(/[^a-zA-Z0-9]/g, '_')}_node.pdf`;
            await createCanvasPDF(character, filename);
            process.exit(0);
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    })();
}

module.exports = { createCanvasPDF, createCanvasPNG, generateSingleCharacterNode };
