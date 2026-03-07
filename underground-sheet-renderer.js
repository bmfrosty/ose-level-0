// Underground character sheet renderer for OSE 0-Level characters
// Uses the Old-School Essentials Advanced Adventure Compendium sheet template

// COORDINATE SYSTEM:
// - Origin (0,0) is at the TOP-LEFT corner of the canvas
// - X increases to the RIGHT
// - Y increases DOWNWARD
// - ctx.textBaseline is set to 'top', meaning Y coordinate is the TOP of the text
// - Example: fillText("Hello", 100, 200) draws text with top-left at (100, 200)
//
// Canvas dimensions: 2700x3495 pixels (3x scale of 900x1165 template)
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
        
        // Sheet dimensions (900x1165 from template)
        // Scale up for high resolution: 3x = 2700x3495
        this.width = 2700;
        this.height = 3495;
        
        // Set canvas size
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    
    async loadBackgroundImage() {
        // Load the underground sheet template
        const { loadImage } = require('canvas');
        const imagePath = path.join(__dirname, 'underground-sheet.jpg');
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
        this.ctx.fillText(character.name, 650, 310);
    }
    
    drawRaceAndClass(character) {
        // Race and occupation
        this.ctx.font = '48px Arial';
        this.ctx.fillText(`${character.race} - ${character.background.profession}`, 150, 220);
    }
    
    drawAbilityScores(character) {
        // Ability scores - typically in boxes on the left side
        // These positions are estimates and will need adjustment based on actual template
        const startY = 400;
        const spacing = 140;
        const labelX = 200;
        const scoreX = 400;
        
        this.ctx.font = 'bold 48px Arial';
        
        const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
        abilities.forEach((ability, index) => {
            const result = character.results.find(r => r.ability === ability);
            const y = startY + (index * spacing);
            
            // Draw ability name
            this.ctx.fillText(ability, labelX, y);
            
            // Draw score
            this.ctx.font = 'bold 60px Arial';
            this.ctx.fillText(result.roll.toString(), scoreX, y);
            
            // Draw modifier
            this.ctx.font = '42px Arial';
            const modText = result.modifier >= 0 ? `+${result.modifier}` : result.modifier.toString();
            this.ctx.fillText(modText, scoreX + 120, y + 10);
            
            this.ctx.font = 'bold 48px Arial';
        });
    }
    
    drawCombatStats(character) {
        // Combat stats - HP, AC, Initiative
        // Right side of sheet, estimated positions
        const rightX = 1600;
        
        this.ctx.font = 'bold 54px Arial';
        
        // HP
        this.ctx.fillText('HP', rightX, 400);
        this.ctx.font = 'bold 72px Arial';
        this.ctx.fillText(Math.max(1, character.hitPoints.total).toString(), rightX + 150, 390);
        
        // AC
        this.ctx.font = 'bold 54px Arial';
        this.ctx.fillText('AC', rightX, 540);
        this.ctx.font = 'bold 72px Arial';
        this.ctx.fillText(character.armorClass.toString(), rightX + 150, 530);
        
        // Initiative
        const dexMod = character.results.find(r => r.ability === 'DEX').modifier;
        this.ctx.font = 'bold 54px Arial';
        this.ctx.fillText('INIT', rightX, 680);
        this.ctx.font = 'bold 72px Arial';
        const initText = dexMod >= 0 ? `+${dexMod}` : dexMod.toString();
        this.ctx.fillText(initText, rightX + 150, 670);
    }
    
    drawSavingThrows(character) {
        // Saving throws - typically in middle section
        const startY = 1400;
        const startX = 200;
        
        this.ctx.font = 'bold 42px Arial';
        this.ctx.fillText('SAVING THROWS', startX, startY);
        
        this.ctx.font = '36px Arial';
        const saves = [
            { name: 'Death', value: 14 },
            { name: 'Wands', value: 15 },
            { name: 'Paralysis', value: 16 },
            { name: 'Breath', value: 17 },
            { name: 'Spells', value: 18 }
        ];
        
        saves.forEach((save, index) => {
            const y = startY + 60 + (index * 50);
            this.ctx.fillText(`${save.name}: ${save.value}`, startX + 50, y);
        });
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
        const race = character.race.replace(/[^a-zA-Z0-9]/g, '_');
        const profession = character.background.profession.replace(/[^a-zA-Z0-9]/g, '_');
        const name = character.name.replace(/[^a-zA-Z0-9]/g, '_');
        return `${prefix}_${race}_${profession}_${name}.pdf`;
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UndergroundCharacterSheet };
}
