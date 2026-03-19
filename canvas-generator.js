// Browser-based PDF generator using canvas rendering
// ES6 Module - imports from shared modules

import { CanvasCharacterSheet } from './canvas-sheet-renderer.js';
import { generateCharacterMarkdown } from './markdown-generator.js';
import { generateSingleCharacter } from './0level-character-gen.js';

// Generate PNG image only (no PDF)
export async function generateCanvasPNG() {
    // Generate a fresh character for image
    const character = await generateSingleCharacter();

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
    
    // Check if "Open file instead of saving" is enabled
    const openFileCheckbox = document.getElementById('openFileInsteadOfSave');
    const shouldOpenFile = openFileCheckbox ? openFileCheckbox.checked : false;
    
    if (shouldOpenFile) {
        // Open in new tab/window
        const win = window.open();
        if (win) {
            win.document.write('<html><head><title>' + filename + '</title></head><body style="margin:0;"><img src="' + imgData + '" style="width:100%;height:auto;"/></body></html>');
        }
    } else {
        // Download file
        const link = document.createElement('a');
        link.download = filename;
        link.href = imgData;
        link.click();
    }
}

// Generate PDF with embedded high-resolution image
export async function generateCanvasPDF() {
    // Generate a fresh character for PDF
    const character = await generateSingleCharacter();

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
    
    // Get filename
    const filename = CanvasCharacterSheet.generateSingleCharacterFilename(character);
    
    // Check if "Open file instead of saving" is enabled
    const openFileCheckbox = document.getElementById('openFileInsteadOfSave');
    const shouldOpenFile = openFileCheckbox ? openFileCheckbox.checked : false;
    
    if (shouldOpenFile) {
        // Open in new tab/window
        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, '_blank');
    } else {
        // Download file
        doc.save(filename);
    }
}

// Generate bulk PDF with canvas rendering
export async function generateCanvasBulkPDF() {
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
        const character = await generateSingleCharacter();
        
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
export async function generateMarkdown() {
    // Generate a fresh character for Markdown
    const character = await generateSingleCharacter();
    
    // Check if Advanced mode is enabled
    const advancedCheckbox = document.getElementById('advanced');
    const isAdvanced = advancedCheckbox ? advancedCheckbox.checked : false;
    
    // Use shared markdown generator
    const markdown = generateCharacterMarkdown(character, isAdvanced);
    
    // Create blob and download link
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Generate filename
    const race = character.race.replace(/[^a-zA-Z0-9]/g, '_');
    const profession = character.background.profession.replace(/[^a-zA-Z0-9]/g, '_');
    const name = character.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `OSE_0Level_${race}_${profession}_${name}.md`;
    
    // Check if "Open file instead of saving" is enabled
    const openFileCheckbox = document.getElementById('openFileInsteadOfSave');
    const shouldOpenFile = openFileCheckbox ? openFileCheckbox.checked : false;
    
    if (shouldOpenFile) {
        window.open(url, '_blank');
    } else {
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Generate JSON file
export async function generateJSON() {
    // Generate a fresh character for JSON
    const character = await generateSingleCharacter();
    
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
    
    // Check if "Open file instead of saving" is enabled
    const openFileCheckbox = document.getElementById('openFileInsteadOfSave');
    const shouldOpenFile = openFileCheckbox ? openFileCheckbox.checked : false;
    
    if (shouldOpenFile) {
        window.open(url, '_blank');
    } else {
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Generate bulk JSON file (4 characters as array)
export async function generateBulkJSON() {
    await generateCountJSON(4);
}

// Generate JSON file with specified count of characters
export async function generateCountJSON(count) {
    // Generate characters
    const characters = [];
    for (let i = 0; i < count; i++) {
        const character = await generateSingleCharacter();
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
