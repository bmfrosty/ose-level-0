// Browser-based PDF generator using canvas rendering
// Uses shared CanvasCharacterSheet class for consistent output

// Generate PNG image only (no PDF)
function generateCanvasPNG() {
    // Generate a fresh character for image
    const character = generateSingleCharacter();

    // Create browser canvas
    const canvas = document.createElement('canvas');
    
    // Create canvas generator with browser canvas
    const canvasGen = new CanvasCharacterSheet(canvas);
    
    // Generate character sheet on canvas
    canvasGen.generateCharacterSheet(character);
    
    // Get image data from canvas
    const imgData = canvasGen.toDataURL('image/png', 1.0);
    
    // Create download link
    const filename = CanvasCharacterSheet.generateSingleCharacterFilename(character).replace('.pdf', '.png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = imgData;
    link.click();
}

// Generate PDF with embedded high-resolution image
function generateCanvasPDF() {
    // Generate a fresh character for PDF
    const character = generateSingleCharacter();

    // Create browser canvas
    const canvas = document.createElement('canvas');
    
    // Create canvas generator with browser canvas
    const canvasGen = new CanvasCharacterSheet(canvas);
    
    // Generate character sheet on canvas
    canvasGen.generateCharacterSheet(character);
    
    // Create PDF with embedded image and Flate compression
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('portrait', 'pt', 'letter');
    
    // Get image data from canvas
    const imgData = canvasGen.toDataURL('image/png', 1.0);
    
    // Add image to PDF with Flate compression (full page)
    doc.addImage(imgData, 'PNG', 0, 0, 612, 792, '', 'FAST');
    
    // Save the PDF using shared filename generator
    const filename = CanvasCharacterSheet.generateSingleCharacterFilename(character);
    doc.save(filename);
}

// Generate bulk PDF with canvas rendering
function generateCanvasBulkPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('portrait', 'pt', 'letter');
    
    // Show progress to user
    const originalButton = document.getElementById('canvasBulkPdfButton');
    if (originalButton) {
        originalButton.textContent = 'Generating 4 Characters...';
        originalButton.disabled = true;
    }
    
    // Create browser canvas (reused for all characters)
    const canvas = document.createElement('canvas');
    const canvasGen = new CanvasCharacterSheet(canvas);
    
    // Generate 4 characters
    for (let i = 0; i < 4; i++) {
        const character = generateSingleCharacter();
        
        // Generate character sheet on canvas
        canvasGen.generateCharacterSheet(character);
        
        // Add page if not first character
        if (i > 0) {
            doc.addPage();
        }
        
        // Get image data from canvas
        const imgData = canvasGen.toDataURL('image/png', 1.0);
        
        // Add image to PDF with Flate compression (full page)
        doc.addImage(imgData, 'PNG', 0, 0, 612, 792, '', 'FAST');
    }
    
    // Save the PDF using shared filename generator
    const forceRaceSelect = document.getElementById('forceRace');
    const forceRace = forceRaceSelect ? forceRaceSelect.value : '';
    const filename = CanvasCharacterSheet.generateMultiCharacterFilename(forceRace);
    doc.save(filename);
    
    // Reset button
    if (originalButton) {
        originalButton.textContent = 'Generate 4 Character PDF';
        originalButton.disabled = false;
    }
}

// Generate Markdown file
function generateMarkdown() {
    // Generate a fresh character for Markdown
    const character = generateSingleCharacter();
    
    // Check if Advanced mode is enabled
    const advancedCheckbox = document.getElementById('advanced');
    const isAdvanced = advancedCheckbox ? advancedCheckbox.checked : false;
    
    // Build Markdown content
    let markdown = `# ${character.name}\n\n`;
    markdown += `## ${isAdvanced ? 'OLD-SCHOOL ESSENTIALS ADVANCED' : 'OLD-SCHOOL ESSENTIALS'}\n`;
    markdown += `**RETRO ADVENTURE GAME**\n\n`;
    markdown += `---\n\n`;
    markdown += `**Race:** ${character.race} | **Level:** 0 | **Occupation:** ${character.background.profession} | **HD:** 1d4\n\n`;
    
    markdown += `## Combat\n\n`;
    markdown += `| MAX HP | CUR HP | INIT | AC |\n`;
    markdown += `|--------|--------|------|----|\n`;
    markdown += `| ${Math.max(1, character.hitPoints.total)} | ___ | ${character.results.find(r => r.ability === "DEX").modifier >= 0 ? '+' : ''}${character.results.find(r => r.ability === "DEX").modifier} | ${character.armorClass} |\n\n`;
    
    markdown += `## Ability Scores\n\n`;
    markdown += `| Ability | Score | Effects |\n`;
    markdown += `|---------|-------|----------|\n`;
    for (let result of character.results) {
        const effects = getModifierEffects(result.ability, result.modifier, result.roll);
        markdown += `| **${result.ability}** | ${result.roll} | ${effects} |\n`;
    }
    markdown += `\n`;
    
    markdown += `## Weapons and Skills\n\n`;
    markdown += `- **Weapon:** ${character.background.weapon}\n`;
    markdown += `- **Attack Bonus:** +0 (0-level)\n\n`;
    
    markdown += `## Racial Abilities\n\n`;
    const racialAbilities = getRacialAbilities(character.race);
    if (racialAbilities && racialAbilities.length > 0) {
        for (let ability of racialAbilities) {
            markdown += `- ${ability}\n`;
        }
    } else {
        markdown += `- None\n`;
    }
    markdown += `\n`;
    
    markdown += `## Saving Throws\n\n`;
    markdown += `| Death | Wands | Petrify | Breath | Spells |\n`;
    markdown += `|-------|-------|---------|--------|--------|\n`;
    markdown += `| 14 | 15 | 16 | 17 | 18 |\n\n`;
    
    markdown += `## Equipment\n\n`;
    markdown += `- **Armor:** ${character.background.armor}\n`;
    markdown += `- **Items:**\n`;
    const items = Array.isArray(character.background.item) ? character.background.item : [character.background.item];
    for (let item of items) {
        markdown += `  - ${item}\n`;
    }
    markdown += `- **Starting AC:** ${character.armorClass}\n`;
    markdown += `- **Starting Gold:** ${character.startingGold || 0} gp\n`;
    
    // Create blob and download link
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Generate filename
    const race = character.race.replace(/[^a-zA-Z0-9]/g, '_');
    const profession = character.background.profession.replace(/[^a-zA-Z0-9]/g, '_');
    const name = character.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `OSE_0Level_${race}_${profession}_${name}.md`;
    
    // Create download link and trigger download
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
}

// Generate JSON file
function generateJSON() {
    // Generate a fresh character for JSON
    const character = generateSingleCharacter();
    
    // Convert character object to JSON string with pretty printing
    const jsonString = JSON.stringify(character, null, 2);
    
    // Create blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Generate filename
    const race = character.race.replace(/[^a-zA-Z0-9]/g, '_');
    const profession = character.background.profession.replace(/[^a-zA-Z0-9]/g, '_');
    const name = character.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `OSE_0Level_${race}_${profession}_${name}.json`;
    
    // Create download link and trigger download
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
}

// Generate bulk JSON file (4 characters as array)
function generateBulkJSON() {
    generateCountJSON(4);
}

// Generate JSON file with specified count of characters
function generateCountJSON(count) {
    // Generate characters
    const characters = [];
    for (let i = 0; i < count; i++) {
        const character = generateSingleCharacter();
        characters.push(character);
    }
    
    // Convert characters array to JSON string with pretty printing
    const jsonString = JSON.stringify(characters, null, 2);
    
    // Create blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Generate filename with count
    const forceRaceSelect = document.getElementById('forceRace');
    const forceRace = forceRaceSelect ? forceRaceSelect.value : '';
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 16).replace(/:/g, '-');
    
    let filename;
    if (forceRace) {
        const racePlurals = {
            'Human': 'Humans',
            'Dwarf': 'Dwarves',
            'Elf': 'Elves',
            'Gnome': 'Gnomes',
            'Halfling': 'Halflings'
        };
        const racePlural = racePlurals[forceRace] || forceRace + 's';
        filename = `OSE_0Level_${count}_${racePlural}_${timestamp}.json`;
    } else {
        filename = `OSE_0Level_${count}_Characters_${timestamp}.json`;
    }
    
    // Create download link and trigger download
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
}
