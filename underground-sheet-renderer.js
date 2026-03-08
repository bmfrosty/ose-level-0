// Underground character sheet renderer for OSE 0-Level characters
// Uses the Old-School Essentials Advanced Adventure Compendium sheet template

// COORDINATE SYSTEM:
// - Origin (0,0) is at the TOP-LEFT corner of the canvas
// - X increases to the RIGHT
// - Y increases DOWNWARD
// - ctx.textBaseline is set to 'top', meaning Y coordinate is the TOP of the text
// - Example: fillText("Hello", 100, 200) draws text with top-left at (100, 200)
//
// Canvas dimensions: 3828x4953 pixels (3x scale of 1276x1651 PNG template)
// To find coordinates:
// 1. Open the PNG in an image editor
// 2. Use the ruler/coordinate tool to find pixel positions
// 3. Coordinates shown are (X from left, Y from top)
// 4. Use those values directly in fillText(text, X, Y)

const fs = require('fs');
const path = require('path');

class UndergroundCharacterSheet {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Sheet dimensions (1276x1651 from PNG template)
        // Scale up for high resolution: 3x = 3828x4953
        this.width = 3828;
        this.height = 4953;
        
        // Set canvas size
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    
    async loadBackgroundImage() {
        // Load the underground sheet template (PNG version)
        const { loadImage } = require('canvas');
        const imagePath = path.join(__dirname, 'underground-sheet.png');
        const image = await loadImage(imagePath);
        
        // Draw scaled background
        this.ctx.drawImage(image, 0, 0, this.width, this.height);
    }
    
    generateCharacterSheet(character) {
        // This will be called synchronously, but we need to load image first
        // For now, create a promise-based wrapper
        return new Promise(async (resolve, reject) => {
            try {
                await this.loadBackgroundImage();
                
                // Set default font
                this.ctx.fillStyle = '#000000';
                this.ctx.textBaseline = 'top';
                
                // Draw character information
                this.drawCharacterName(character);
                this.drawRaceAndClass(character);
                this.drawAbilityScores(character);
                this.drawCombatStats(character);
                this.drawSavingThrows(character);
                this.drawEquipment(character);
                this.drawRacialAbilities(character);
                
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
    
    drawCharacterName(character) {
        // Character name - top of sheet
        this.ctx.font = 'bold 72px Arial';
        this.ctx.fillText(character.name, 900, 450);
    }
    
    drawRaceAndClass(character) {
        // Race and occupation
        this.ctx.font = 'bold 72px Arial';
        this.ctx.fillText(`${character.race}\n${character.background.profession}`, 800, 650);
    }
    
    drawAbilityScores(character) {
        // Ability scores - each ability gets its own positioning
        // Coordinates are (X from left, Y from top) in pixels at 3x scale
        // Old values: startY=1600, spacing=240, labelX=200, scoreX=600
        // Calculated positions: y = 1600 + (index * 240), modX = scoreX + 120 = 720, modY = y + 10
        
        const abilities = [
            { name: 'STR', labelX: 200, labelY: 1600, scoreX: 600, scoreY: 1600, modX: 875, modY: 1600 },
            { name: 'DEX', labelX: 200, labelY: 1825, scoreX: 600, scoreY: 1825, modX: 875, modY: 1825 },
            { name: 'CON', labelX: 200, labelY: 2045, scoreX: 600, scoreY: 2045, modX: 875, modY: 2045 },
            { name: 'INT', labelX: 200, labelY: 2320, scoreX: 600, scoreY: 2320, modX: 875, modY: 2320 },
            { name: 'WIS', labelX: 200, labelY: 2560, scoreX: 600, scoreY: 2560, modX: 875, modY: 2560 },
            { name: 'CHA', labelX: 200, labelY: 2840, scoreX: 600, scoreY: 2840, modX: 875, modY: 2840 }
        ];
        
        abilities.forEach(abilityPos => {
            const result = character.results.find(r => r.ability === abilityPos.name);
            
            // Draw ability name
            // this.ctx.font = 'bold 48px Arial';
            // this.ctx.fillText(abilityPos.name, abilityPos.labelX, abilityPos.labelY);
            
            // Draw score
            this.ctx.font = 'bold 72px Arial';
            this.ctx.fillText(result.roll.toString(), abilityPos.scoreX, abilityPos.scoreY);
            
            // Draw modifier
            this.ctx.font = 'bold 72px Arial';
            const modText = result.modifier >= 0 ? `+${result.modifier}` : result.modifier.toString();
            this.ctx.fillText(modText, abilityPos.modX, abilityPos.modY);
        });
    }
    
    drawCombatStats(character) {
        // Combat stats - HP, AC, Initiative
        // Each stat gets its own positioning and font settings
        // Comment out individual lines to hide specific labels or values
        
        const dexMod = character.results.find(r => r.ability === 'DEX').modifier;
        const initText = dexMod >= 0 ? `+${dexMod}` : dexMod.toString();
        
        // HP Label
        // this.ctx.font = 'bold 54px Arial';
        // this.ctx.fillText('HP', 1600, 400);
        
        // HP Value
        this.ctx.font = 'bold 72px Arial';
        this.ctx.fillText(Math.max(1, character.hitPoints.total).toString(), 1800, 1300);
        
        // AC Label
        // this.ctx.font = 'bold 54px Arial';
        // this.ctx.fillText('AC', 1600, 540);
        
        // AC Value
        // this.ctx.font = 'bold 72px Arial';
        // this.ctx.fillText(character.armorClass.toString(), 1750, 530);
        
        // INIT Label
        // this.ctx.font = 'bold 54px Arial';
        // this.ctx.fillText('INIT', 1600, 680);
        
        // INIT Value
        // this.ctx.font = 'bold 72px Arial';
        // this.ctx.fillText(initText, 1750, 670);
    }
    
    drawSavingThrows(character) {
        // Saving throws - each label and value gets its own positioning
        // Comment out individual lines to hide specific labels or values
        // Use dynamic values from character object if available, otherwise use defaults
        
        const deathSave = character.savingThrows ? character.savingThrows.Death.toString() : '14';
        const wandsSave = character.savingThrows ? character.savingThrows.Wands.toString() : '15';
        const paralysisSave = character.savingThrows ? character.savingThrows.Paralysis.toString() : '16';
        const breathSave = character.savingThrows ? character.savingThrows.Breath.toString() : '17';
        const spellsSave = character.savingThrows ? character.savingThrows.Spells.toString() : '18';
        
        // Section Title
        // this.ctx.font = 'bold 42px Arial';
        // this.ctx.fillText('SAVING THROWS', 200, 1400);
        
        // // Death Save Label
        // this.ctx.font = '36px Arial';
        // this.ctx.fillText('Death:', 250, 1460);
        
        // Death Save Value
        this.ctx.font = 'bold 72px Arial';
        this.ctx.fillText(deathSave, 2525, 1485);
        
        // Wands Save Label
        // this.ctx.font = '36px Arial';
        // this.ctx.fillText('Wands:', 250, 1510);
        
        // Wands Save Value
        this.ctx.font = 'bold 72px Arial';
        this.ctx.fillText(wandsSave, 2525, 1750);
        
        // Paralysis Save Label
        // this.ctx.font = '36px Arial';
        // this.ctx.fillText('Paralysis:', 250, 1560);
        
        // Paralysis Save Value
        this.ctx.font = 'bold 72px Arial';
        this.ctx.fillText(paralysisSave, 2525, 1960);
        
        // Breath Save Label
        // this.ctx.font = '36px Arial';
        // this.ctx.fillText('Breath:', 250, 1610);
        
        // Breath Save Value
        this.ctx.font = 'bold 72px Arial';
        this.ctx.fillText(breathSave, 2525, 2200);
        
        // Spells Save Label
        // this.ctx.font = '36px Arial';
        // this.ctx.fillText('Spells:', 250, 1660);
        
        // Spells Save Value
        this.ctx.font = 'bold 72px Arial';
        this.ctx.fillText(spellsSave, 2525, 2435);
    }
    
    drawEquipment(character) {
        // Equipment section - lower portion
        const startY = 1800;
        const startX = 200;
        
        this.ctx.font = 'bold 42px Arial';
        this.ctx.fillText('EQUIPMENT', startX, startY);
        
        this.ctx.font = '36px Arial';
        let y = startY + 60;
        
        // Armor
        this.ctx.fillText(`Armor: ${character.background.armor}`, startX + 50, y);
        y += 50;
        
        // Weapon
        this.ctx.fillText(`Weapon: ${character.background.weapon}`, startX + 50, y);
        y += 50;
        
        // Items
        const items = Array.isArray(character.background.item) ? character.background.item : [character.background.item];
        items.forEach(item => {
            this.ctx.fillText(`• ${item}`, startX + 50, y);
            y += 45;
        });
        
        // Starting gold
        y += 20;
        this.ctx.fillText(`Gold: ${character.startingGold || 0} gp`, startX + 50, y);
    }
    
    drawRacialAbilities(character) {
        // Racial abilities - bottom section
        const startY = 2600;
        const startX = 200;
        
        this.ctx.font = 'bold 42px Arial';
        this.ctx.fillText('RACIAL ABILITIES', startX, startY);
        
        // Get racial abilities
        const { getRacialAbilities } = require('./names-tables.js');
        const abilities = getRacialAbilities(character.race);
        
        this.ctx.font = '32px Arial';
        let y = startY + 60;
        
        if (abilities && abilities.length > 0) {
            abilities.forEach(ability => {
                // Word wrap for long abilities
                const maxWidth = 2300;
                const words = ability.split(' ');
                let line = '';
                
                words.forEach(word => {
                    const testLine = line + word + ' ';
                    const metrics = this.ctx.measureText(testLine);
                    
                    if (metrics.width > maxWidth && line !== '') {
                        this.ctx.fillText(line, startX + 50, y);
                        y += 40;
                        line = word + ' ';
                    } else {
                        line = testLine;
                    }
                });
                
                if (line !== '') {
                    this.ctx.fillText(line, startX + 50, y);
                    y += 40;
                }
            });
        } else {
            this.ctx.fillText('None', startX + 50, y);
        }
    }
    
    toBuffer(mimeType = 'image/png') {
        return this.canvas.toBuffer(mimeType);
    }
    
    toDataURL(mimeType = 'image/png', quality = 1.0) {
        return this.canvas.toDataURL(mimeType, quality);
    }
    
    // Static helper for filename generation
    static generateFilename(character, prefix = 'OSE_Underground') {
        // Normalize accented characters to ASCII equivalents
        const normalizeString = (str) => {
            return str.normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
                .replace(/[^a-zA-Z0-9]/g, '_');   // Replace remaining non-alphanumeric with underscore
        };
        
        const race = normalizeString(character.race);
        const profession = normalizeString(character.background.profession);
        const name = normalizeString(character.name);
        return `${prefix}_${race}_${profession}_${name}.pdf`;
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UndergroundCharacterSheet };
}
