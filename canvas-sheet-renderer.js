// Shared Canvas-based character sheet renderer
// Works in both browser and Node.js environments
// Renders at 300 DPI for consistent PDF embedding

class CanvasCharacterSheet {
    constructor(canvas) {
        // Accept canvas from external source (browser or Node.js)
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Letter size at 300 DPI: 8.5" x 11" = 2550 x 3300 pixels
        this.width = 2550;
        this.height = 3300;
        this.dpi = 300;
        this.scale = this.dpi / 72; // Scale factor from 72 DPI to 300 DPI
        
        // Set canvas dimensions
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Enable high-quality rendering
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'left';
    }
    
    // Scale coordinates from 72 DPI to 300 DPI
    scale72to300(value) {
        return value * this.scale;
    }
    
    // Set font with proper scaling
    setFont(family, size, weight = 'normal') {
        const scaledSize = this.scale72to300(size);
        this.ctx.font = `${weight} ${scaledSize}px ${family}`;
    }
    
    // Draw text with proper scaling and alignment options
    drawText(text, x, y, color = '#000000', align = 'left') {
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, this.scale72to300(x), this.scale72to300(y));
        this.ctx.textAlign = 'left'; // Reset to default
    }
    
    // Draw centered text in a box
    drawCenteredText(text, x, y, width, height, color = '#000000') {
        this.ctx.fillStyle = color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const centerX = this.scale72to300(x + width/2);
        const centerY = this.scale72to300(y + height/2);
        this.ctx.fillText(text, centerX, centerY);
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
    }
    
    // Draw rectangle with proper scaling
    drawRect(x, y, width, height, fillColor = null, strokeColor = '#000000', lineWidth = 1) {
        const scaledX = this.scale72to300(x);
        const scaledY = this.scale72to300(y);
        const scaledWidth = this.scale72to300(width);
        const scaledHeight = this.scale72to300(height);
        
        if (fillColor) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
        }
        
        if (strokeColor) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = this.scale72to300(lineWidth);
            this.ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
        }
    }
    
    // Get text width with proper scaling
    getTextWidth(text) {
        return this.ctx.measureText(text).width / this.scale;
    }
    
    // Clear canvas
    clear() {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    // Generate character sheet on canvas
    generateCharacterSheet(character) {
        this.clear();
        
        // Set default font
        this.setFont('Arial', 12, 'normal');
        
        // Check if Advanced mode is enabled
        let isAdvanced = false;
        if (typeof document !== 'undefined') {
            // Browser: check checkbox
            const advancedCheckbox = document.getElementById('advanced');
            isAdvanced = advancedCheckbox ? advancedCheckbox.checked : false;
        } else if (typeof process !== 'undefined' && process.env) {
            // Node.js: check environment variable
            isAdvanced = process.env.ADVANCED === 'true';
        }
        
        // Title
        this.setFont('Arial', 16, 'bold');
        if (isAdvanced) {
            this.drawText("OLD-SCHOOL ESSENTIALS ADVANCED", 72, 90);
        } else {
            this.drawText("OLD-SCHOOL ESSENTIALS", 72, 90);
        }
        this.setFont('Arial', 12, 'normal');
        this.drawText("RETRO ADVENTURE GAME", 72, 105);
        
        // Character Name
        this.setFont('Arial', 12, 'bold');
        this.drawText("Character Name:", 72, 59);
        this.setFont('Arial', 12, 'normal');
        const characterName = character.name || "Unknown";
        this.drawText(characterName, 210, 59);
        
        // Character info boxes with improved layout
        this.setFont('Arial', 10, 'bold');
        
        // RACE box with better alignment
        this.drawRect(72, 130, 80, 20, null, '#000000');
        this.drawText("RACE:", 77, 140);
        this.setFont('Arial', 10, 'normal');
        this.drawText(character.race || "Human", 115, 140);
        
        // LEVEL box with better alignment
        this.setFont('Arial', 10, 'bold');
        this.drawRect(162, 130, 60, 20, null, '#000000');
        this.drawText("LEVEL:", 167, 140);
        this.setFont('Arial', 10, 'normal');
        this.drawCenteredText("0", 205, 130, 17, 20);
        
        // OCCUPATION box (much wider) with no truncation
        this.setFont('Arial', 10, 'bold');
        this.drawRect(232, 130, 235, 20, null, '#000000');
        this.drawText("OCCUPATION:", 237, 140);
        this.setFont('Arial', 10, 'normal');
        const occupation = character.background.profession;
        // No truncation - display full occupation name
        this.drawText(occupation, 312, 140);
        
        // HD box (right-justified at page edge) with better alignment
        this.setFont('Arial', 10, 'bold');
        this.drawRect(477, 130, 63, 20, null, '#000000');
        this.drawText("HD:", 482, 140);
        this.setFont('Arial', 10, 'normal');
        this.drawCenteredText("1d4", 500, 130, 40, 20);
        
        // COMBAT section (aligned with right column top)
        this.setFont('Arial', 10, 'bold');
        this.drawRect(72, 160, 230, 15, '#000000');
        this.drawText("COMBAT", 77, 169, '#FFFFFF');
        
        // Combat boxes
        const finalHP = character.hitPoints.isAdventurer ? Math.max(1, character.hitPoints.total) : 0;
        const dexMod = character.results.find(r => r.ability === "DEX").modifier;
        const strMod = character.results.find(r => r.ability === "STR").modifier;
        
        // Combat boxes - evenly sized and spaced like saving throws (57.5pt each to fill 230pt width)
        const combatBoxWidth = 57.5;
        
        // MAX HP box with perfect centering
        this.setFont('Arial', 8, 'bold');
        this.drawRect(72, 185, combatBoxWidth, 30, null, '#000000');
        this.drawCenteredText("MAX HP", 72, 185, combatBoxWidth, 12);
        this.setFont('Arial', 14, 'normal');
        const hpText = finalHP.toString();
        this.drawCenteredText(hpText, 72, 197, combatBoxWidth, 18);
        
        // CUR HP box with perfect centering (empty for player to fill in)
        this.setFont('Arial', 8, 'bold');
        this.drawRect(72 + combatBoxWidth, 185, combatBoxWidth, 30, null, '#000000');
        this.drawCenteredText("CUR HP", 72 + combatBoxWidth, 185, combatBoxWidth, 12);
        // No number - leave empty for player to track current HP
        
        // INIT box with perfect centering
        this.setFont('Arial', 8, 'bold');
        this.drawRect(72 + (combatBoxWidth * 2), 185, combatBoxWidth, 30, null, '#000000');
        this.drawCenteredText("INIT", 72 + (combatBoxWidth * 2), 185, combatBoxWidth, 12);
        this.setFont('Arial', 12, 'normal');
        const initText = dexMod >= 0 ? `+${dexMod}` : dexMod.toString();
        this.drawCenteredText(initText, 72 + (combatBoxWidth * 2), 197, combatBoxWidth, 18);
        
        // AC box with perfect centering
        this.setFont('Arial', 8, 'bold');
        this.drawRect(72 + (combatBoxWidth * 3), 185, combatBoxWidth, 30, null, '#000000');
        this.drawCenteredText("AC", 72 + (combatBoxWidth * 3), 185, combatBoxWidth, 12);
        this.setFont('Arial', 16, 'normal');
        const acText = character.armorClass.toString();
        this.drawCenteredText(acText, 72 + (combatBoxWidth * 3), 197, combatBoxWidth, 18);
        
        // ABILITY SCORES section (moved down to avoid combat overlap)
        this.setFont('Arial', 10, 'bold');
        this.drawRect(72, 225, 230, 15, '#000000');
        this.drawText("ABILITY SCORES", 77, 234, '#FFFFFF');
        
        // Ability scores table with perfect centering
        const abilities = ["STR", "INT", "WIS", "DEX", "CON", "CHA"];
        for (let i = 0; i < 6; i++) {
            const y = 250 + i * 24;
            
            // Ability name box with centered text
            this.setFont('Arial', 9, 'bold');
            this.drawRect(72, y, 40, 20, null, '#000000');
            this.drawCenteredText(abilities[i], 72, y, 40, 20);
            
            // Score box with centered text
            const abilityData = character.results.find(r => r.ability === abilities[i]);
            this.drawRect(112, y, 30, 20, null, '#000000');
            this.setFont('Arial', 12, 'normal');
            const scoreText = abilityData.roll.toString();
            this.drawCenteredText(scoreText, 112, y, 30, 20);
            
            // Ability score effects with proper text wrapping
            this.setFont('Arial', 8, 'normal');
            const effects = getModifierEffects(abilities[i], abilityData.modifier, abilityData.roll);
            
            // Wrap text to multiple lines instead of truncating
            const maxWidth = 155; // Available width for effects text
            const words = effects.split(' ');
            let lines = [];
            let currentLine = '';
            
            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const testWidth = this.getTextWidth(testLine);
                
                if (testWidth <= maxWidth) {
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
            
            // Draw each line with proper spacing
            for (let lineIndex = 0; lineIndex < Math.min(lines.length, 2); lineIndex++) {
                this.drawText(lines[lineIndex], 147, y + 6 + (lineIndex * 10));
            }
        }
        
        // WEAPONS and SKILLS section
        this.setFont('Arial', 10, 'bold');
        this.drawRect(72, 394, 230, 15, '#000000');
        this.drawText("WEAPONS and SKILLS", 77, 403, '#FFFFFF');
        
        // Weapons text area - expanded to match racial abilities
        this.drawRect(72, 419, 230, 101, null, '#000000');
        this.setFont('Arial', 12, 'normal');
        this.drawText(`Weapon: ${character.background.weapon}`, 82, 435);
        this.drawText("Attack Bonus: +0 (0-level)", 82, 450);
        
        // RACIAL ABILITIES section
        this.setFont('Arial', 10, 'bold');
        this.drawRect(72, 530, 230, 15, '#000000');
        this.drawText("RACIAL ABILITIES", 77, 539, '#FFFFFF');
        
        // Racial abilities text area - expanded to align with CP box (y=655)
        this.drawRect(72, 555, 230, 100, null, '#000000');
        this.setFont('Arial', 12, 'normal');
        
        let racialY = 571;
        const racialAbilities = getRacialAbilities(character.race);
        
        if (racialAbilities && racialAbilities.length > 0) {
            // Display each ability on its own line
            for (let ability of racialAbilities) {
                this.drawText(ability, 82, racialY);
                racialY += 15;
            }
        } else {
            this.drawText("None", 82, racialY);
        }
        
        // RIGHT SIDE - SAVING THROWS
        this.setFont('Arial', 10, 'bold');
        this.drawRect(320, 160, 220, 15, '#000000');
        this.drawText("SAVING THROWS", 325, 169, '#FFFFFF');
        
        // Saving throw boxes (wider to fill column width with centered text)
        const saves = [
            { name: "Death", value: "14" },
            { name: "Wands", value: "15" },
            { name: "Petrify", value: "16" },
            { name: "Breath", value: "17" },
            { name: "Spells", value: "18" }
        ];
        
        for (let i = 0; i < 5; i++) {
            const x = 320 + (i % 5) * 44;
            const y = 185;
            
            this.setFont('Arial', 8, 'bold');
            this.drawRect(x, y, 44, 30, null, '#000000');
            // Center the saving throw name
            this.drawCenteredText(saves[i].name, x, y + 2, 44, 12);
            this.setFont('Arial', 12, 'normal');
            // Center the saving throw value
            this.drawCenteredText(saves[i].value, x, y + 16, 44, 14);
        }
        
        // EQUIPMENT section
        this.setFont('Arial', 10, 'bold');
        this.drawRect(320, 225, 220, 15, '#000000');
        this.drawText("EQUIPMENT", 325, 234, '#FFFFFF');
        
        // Equipment text area (expanded to fill space before treasure boxes)
        this.drawRect(320, 250, 220, 285, null, '#000000');
        this.setFont('Arial', 12, 'normal');
        this.drawText(`Armor: ${character.background.armor}`, 330, 266);
        
        // Handle item text with proper formatting - rename to Item(s): and put each on separate line
        this.drawText(`Item(s):`, 330, 281);
        
        // Items are now arrays, display each item on separate line with indentation
        const items = character.background.item;
        let itemY = 296;
        for (let i = 0; i < items.length && i < 15; i++) {
            const item = items[i];
            this.drawText(`  ${item}`, 330, itemY);
            itemY += 15;
        }
        
        this.drawText(`Starting AC: ${character.armorClass}`, 330, 500);
        
        // Starting gold
        this.drawText(`Starting Gold: ${character.startingGold || 0} gp`, 330, 515);
        
        // Treasure tracking boxes (aligned with bottom of left column)
        const treasures = ["PP", "GP", "EP", "SP", "CP"];
        for (let i = 0; i < 5; i++) {
            const y = 545 + i * 22;
            this.setFont('Arial', 9, 'bold');
            this.drawRect(320, y, 40, 18, '#000000');
            this.drawText(treasures[i], 325, y + 13, '#FFFFFF');
            this.drawRect(365, y, 175, 18, null, '#000000');
        }
    }
    
    // Convert canvas to blob for PDF embedding (browser only)
    toBlob(callback, type = 'image/png', quality = 1.0) {
        if (this.canvas.toBlob) {
            this.canvas.toBlob(callback, type, quality);
        } else {
            throw new Error('toBlob() not supported in this environment');
        }
    }
    
    // Get canvas as data URL
    toDataURL(type = 'image/png', quality = 1.0) {
        return this.canvas.toDataURL(type, quality);
    }
    
    // Get canvas as buffer (Node.js only)
    toBuffer(type = 'image/png') {
        if (this.canvas.toBuffer) {
            return this.canvas.toBuffer(type);
        } else {
            throw new Error('toBuffer() not supported in this environment');
        }
    }
    
    // Static method: Generate filename for single character
    static generateSingleCharacterFilename(character) {
        const race = character.race.replace(/[^a-zA-Z0-9]/g, '_');
        const profession = character.background.profession.replace(/[^a-zA-Z0-9]/g, '_');
        const name = character.name.replace(/[^a-zA-Z0-9]/g, '_');
        return `OSE_0Level_${race}_${profession}_${name}.pdf`;
    }
    
    // Static method: Generate filename for multi-character PDF
    static generateMultiCharacterFilename(forceRace = '') {
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 16).replace(/:/g, '-');
        
        // If a specific race is forced, use plural form in filename
        if (forceRace) {
            const racePlurals = {
                'Human': 'Humans',
                'Dwarf': 'Dwarves',
                'Elf': 'Elves',
                'Gnome': 'Gnomes',
                'Halfling': 'Halflings'
            };
            const racePlural = racePlurals[forceRace] || forceRace + 's';
            return `OSE_0Level_4_${racePlural}_${timestamp}.pdf`;
        }
        
        return `OSE_0Level_4_Characters_${timestamp}.pdf`;
    }
}

// Export for both CommonJS (Node.js) and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CanvasCharacterSheet };
}
