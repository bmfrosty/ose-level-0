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
