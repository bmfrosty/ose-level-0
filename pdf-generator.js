// PDF Character Sheet Generator using jsPDF

// Shared function to draw a character sheet on a PDF page with perfect vertical centering
function drawCharacterSheet(doc, character, options = {}) {
    const { pageNumber, isNewPage = false } = options;
    
    if (isNewPage && pageNumber > 1) {
        doc.addPage();
    }
    
    // Set up fonts and styles
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    
    // Title
    doc.text("OLD-SCHOOL ESSENTIALS", 72, 90);
    doc.setFontSize(12);
    doc.text("RETRO ADVENTURE GAME", 72, 105);
    
    // Character Name (improved positioning)
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Character Name:", 72, 59);
    doc.setFont("helvetica", "normal");
    const characterName = character.name || "Unknown";
    const namePrefix = pageNumber ? `#${pageNumber} ` : "";
    doc.text(`${namePrefix}${characterName}`, 210, 59);
    
    // Character info boxes (fixed text overlap with proper spacing)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    
    // RACE box (shift race text left)
    doc.rect(72, 130, 80, 20);
    doc.text("RACE:", 77, 139);
    doc.setFont("helvetica", "normal");
    doc.text(character.race || "Human", 115, 139); // Moved left from 120 to 115
    
    // LEVEL box (more aggressive spacing fix)
    doc.setFont("helvetica", "bold");
    doc.rect(162, 130, 60, 20);
    doc.text("LEVEL:", 167, 139);
    doc.setFont("helvetica", "normal");
    doc.text("0", 210, 139); // Moved further right from 205 to 210
    
    // OCCUPATION box (made even wider)
    doc.setFont("helvetica", "bold");
    doc.rect(232, 130, 175, 20); // Increased from 155 to 175
    doc.text("OCCUPATION:", 237, 139);
    doc.setFont("helvetica", "normal");
    // Allow even more space for occupation text
    const occupation = character.background.profession;
    const maxOccupationWidth = 90; // Increased space for occupation text
    const occupationLines = doc.splitTextToSize(occupation, maxOccupationWidth);
    doc.text(occupationLines[0], 312, 139); // Use only first line to prevent overlap
    
    // HD box (right-justified at page edge)
    doc.setFont("helvetica", "bold");
    doc.rect(417, 130, 50, 20); // Moved from 397 to 417 for right justification
    doc.text("HD:", 422, 139);
    doc.setFont("helvetica", "normal");
    doc.text("1d4", 437, 139);
    
    // COMBAT section (improved header centering)
    doc.setFont("helvetica", "bold");
    doc.setFillColor(0, 0, 0);
    doc.rect(72, 170, 230, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text("COMBAT", 77, 179); // Better vertical center in 15pt box
    doc.setTextColor(0, 0, 0);
    
    // Combat boxes (improved centering)
    const finalHP = character.hitPoints.isAdventurer ? Math.max(1, character.hitPoints.total) : 0;
    const dexMod = character.results.find(r => r.ability === "DEX").modifier;
    const strMod = character.results.find(r => r.ability === "STR").modifier;
    
    // MAX HP box (renamed from HP)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8); // Smaller font to fit "MAX HP"
    doc.rect(72, 195, 45, 30);
    doc.text("MAX HP", 85, 205); // Centered label for "MAX HP"
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    const hpText = finalHP.toString();
    const hpWidth = doc.getTextWidth(hpText);
    doc.text(hpText, 94.5 - hpWidth/2, 212); // Moved up further from 215 to 212
    
    // CUR box (renamed from MAX)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.rect(127, 195, 45, 30);
    doc.text("CUR", 144, 205); // Label position
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    const maxText = finalHP.toString();
    const maxWidth = doc.getTextWidth(maxText);
    doc.text(maxText, 149.5 - maxWidth/2, 212); // Moved up further from 215 to 212
    
    // INIT box (more aggressive fix - numbers well clear of bottom)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.rect(182, 195, 45, 30);
    doc.text("INIT", 197, 205); // Label position
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    const initText = dexMod >= 0 ? `+${dexMod}` : dexMod.toString();
    const initWidth = doc.getTextWidth(initText);
    doc.text(initText, 204.5 - initWidth/2, 212); // Moved up further from 215 to 212
    
    // AC box (more aggressive fix - numbers well clear of bottom)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.rect(237, 195, 65, 30);
    doc.text("AC", 266, 205); // Label position
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    const acText = character.armorClass.toString();
    const acWidth = doc.getTextWidth(acText);
    doc.text(acText, 269.5 - acWidth/2, 210); // Moved up further from 213 to 210
    
    // MOVEMENT box (improved vertical centering)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.rect(72, 235, 230, 25);
    doc.text("MOVEMENT:", 77, 248); // Better vertical center in 25pt box
    doc.setFont("helvetica", "normal");
    doc.text("120' (40')", 143, 248);
    
    // Attack bonus boxes (improved text positioning)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.rect(72, 270, 110, 25);
    doc.text("MELEE ATTACK BONUS:", 77, 280); // Better label position
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const meleeText = strMod >= 0 ? `+${strMod}` : strMod.toString();
    const meleeWidth = doc.getTextWidth(meleeText);
    doc.text(meleeText, 127 - meleeWidth/2, 289); // Better value position
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.rect(192, 270, 110, 25);
    doc.text("MISSILE ATTACK BONUS:", 197, 280); // Better label position
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const missileText = dexMod >= 0 ? `+${dexMod}` : dexMod.toString();
    const missileWidth = doc.getTextWidth(missileText);
    doc.text(missileText, 247 - missileWidth/2, 289); // Better value position
    
    // ABILITY SCORES section (improved header centering)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setFillColor(0, 0, 0);
    doc.rect(72, 310, 230, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text("ABILITY SCORES", 77, 319); // Better vertical center in 15pt box
    doc.setTextColor(0, 0, 0);
    
    // Ability scores table (improved vertical centering)
    const abilities = ["STR", "INT", "WIS", "DEX", "CON", "CHA"];
    for (let i = 0; i < 6; i++) {
        const y = 335 + i * 24; // Increased spacing
        
        // Ability name box (better vertical centering)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.rect(72, y, 40, 20);
        doc.text(abilities[i], 77, y + 12); // Better vertical center in 20pt box
        
        // Score box (better vertical centering)
        const abilityData = character.results.find(r => r.ability === abilities[i]);
        doc.rect(112, y, 30, 20);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        const scoreText = abilityData.roll.toString();
        const scoreWidth = doc.getTextWidth(scoreText);
        doc.text(scoreText, 127 - scoreWidth/2, y + 12); // Better vertical center
        
        // Ability score effects (improved positioning)
        doc.setFontSize(8);
        const effects = getModifierEffects(abilities[i], abilityData.modifier, abilityData.roll);
        const maxWidth = 155;
        const lines = doc.splitTextToSize(effects, maxWidth);
        doc.text(lines[0], 147, y + 12); // Better vertical alignment with scores
    }
    
    // WEAPONS and SKILLS section (final polish - improved header centering)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setFillColor(0, 0, 0);
    doc.rect(72, 485, 230, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text("WEAPONS and SKILLS", 77, 494); // Better vertical center in 15pt box
    doc.setTextColor(0, 0, 0);
    
    // Weapons text area (improved spacing and centering)
    doc.rect(72, 510, 230, 45);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Weapon: ${character.background.weapon}`, 82, 527); // Better vertical spacing
    doc.text("Attack Bonus: +0 (0-level)", 82, 539); // Better vertical spacing
    
    // RIGHT SIDE - SAVING THROWS (improved header centering)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setFillColor(0, 0, 0);
    doc.rect(320, 160, 220, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text("SAVING THROWS", 325, 169); // Better vertical center in 15pt box
    doc.setTextColor(0, 0, 0);
    
    // Saving throw boxes (improved vertical centering)
    const saves = [
        { name: "Death", value: "14" },
        { name: "Wands", value: "15" },
        { name: "Petrify", value: "16" },
        { name: "Breath", value: "17" },
        { name: "Spells", value: "18" }
    ];
    
    for (let i = 0; i < 5; i++) {
        const x = 320 + (i % 5) * 42;
        const y = 185;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.rect(x, y, 38, 30);
        doc.text(saves[i].name, x + 2, y + 10); // Better vertical center in top half
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        const saveWidth = doc.getTextWidth(saves[i].value);
        doc.text(saves[i].value, x + 19 - saveWidth/2, y + 22); // Better vertical center in bottom half
    }
    
    // EQUIPMENT section (improved header centering)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setFillColor(0, 0, 0);
    doc.rect(320, 225, 220, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text("EQUIPMENT", 325, 234); // Better vertical center in 15pt box
    doc.setTextColor(0, 0, 0);
    
    // Equipment text area (improved formatting and spacing)
    doc.rect(320, 250, 220, 110);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Armor: ${character.background.armor}`, 330, 272); // Better spacing
    
    // Handle long item text with wrapping
    const itemText = `Item: ${character.background.item}`;
    const itemLines = doc.splitTextToSize(itemText, 200);
    let itemY = 287; // Better spacing
    for (let line of itemLines) {
        doc.text(line, 330, itemY);
        itemY += 10;
    }
    
    doc.text(`AC: ${character.armorClass}`, 330, 317); // Better spacing
    
    // Treasure tracking boxes (improved centering)
    const treasures = ["PP", "GP", "EP", "SP", "CP"];
    for (let i = 0; i < 5; i++) {
        const y = 370 + i * 22;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setFillColor(0, 0, 0);
        doc.rect(320, y, 40, 18, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(treasures[i], 325, y + 13); // Better vertical center in 18pt box
        doc.setTextColor(0, 0, 0);
        doc.rect(365, y, 175, 18);
    }
}

function generatePDF() {
    if (!currentCharacter) {
        alert('Please generate a character first!');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('portrait', 'pt', 'letter');
    
    // Draw the character sheet
    drawCharacterSheet(doc, currentCharacter);
    
    // Save the PDF
    const characterName = currentCharacter.background.profession.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`OSE_0Level_${characterName}.pdf`);
}

// Function to generate bulk PDF with 20 characters
function generateBulkPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('portrait', 'pt', 'letter');
    
    // Show progress to user
    const originalButton = document.getElementById('bulkPdfButton');
    originalButton.textContent = 'Generating 20 Characters...';
    originalButton.disabled = true;
    
    // Generate 20 characters
    const characters = [];
    for (let i = 0; i < 20; i++) {
        characters.push(generateSingleCharacter());
    }
    
    // Add each character as a page
    for (let i = 0; i < characters.length; i++) {
        drawCharacterSheet(doc, characters[i], { 
            pageNumber: i + 1, 
            isNewPage: true 
        });
    }
    
    // Save the PDF
    doc.save('OSE_0Level_20_Characters.pdf');
    
    // Reset button
    originalButton.textContent = 'Generate 20 Character PDF';
    originalButton.disabled = false;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        drawCharacterSheet
    };
}
