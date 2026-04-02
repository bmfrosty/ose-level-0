/**
 * gen-backgrounds.js
 * 
 * Shared background generation for all character generators.
 * Contains background tables organized by hit points (1-4 HP).
 * 
 * Based on OSE 0-Level PDF
 */

// ============================================================================
// BACKGROUND TABLES
// ============================================================================

const backgroundTables = {
    1: [
        { profession: "Acolyte", item: ["Incense", "Holy symbol"], weapon: "Mace (1d6)", armor: "Unarmored" },
        { profession: "Actor", item: ["2 x Masks", "2 x Costumes"], weapon: "Stage sword (1d4)", armor: "Unarmored" },
        { profession: "Alchemist's Apprentice", item: ["Potion of Healing"], weapon: "Club (1d4)", armor: "Unarmored" },
        { profession: "Artist", item: ["Parchment", "Paint", "Brush"], weapon: "Hammer (1d4)", armor: "Unarmored" },
        { profession: "Beggar", item: ["Wooden bowl"], weapon: "Walking stick (1d4)", armor: "Unarmored" },
        { profession: "Jeweller", item: ["Ostentatious Jewellery (25gp)"], weapon: "Dagger (1d4)", armor: "Unarmored" },
        { profession: "Juggler", item: ["Juggling balls"], weapon: "3 x daggers (1d4)", armor: "Unarmored" },
        { profession: "Money Lender", item: ["50gp"], weapon: "Mace (1d6)", armor: "Unarmored" },
        { profession: "Scribe", item: ["3 x Parchment", "Ink pot", "Quill"], weapon: "Staff (1d4)", armor: "Unarmored" },
        { profession: "Trumpet Player", item: ["Trumpet"], weapon: "Rock (1d3)", armor: "Unarmored" },
        { profession: "Wealthy Heir", item: ["Signet ring", "Perfume"], weapon: "Jewelled dagger (1d4)", armor: "Unarmored" },
        { profession: "Wizard's Apprentice", item: ["Spell book (1 random cantrip)"], weapon: "Dagger (1d4)", armor: "Unarmored" }
    ],
    2: [
        { profession: "Butcher", item: ["Dried meat (5 days' iron rations)"], weapon: "2 x daggers (1d4)", armor: "Unarmored" },
        { profession: "Butler", item: ["Livery", "Silver serving tray"], weapon: "Hand axe (1d6)", armor: "Unarmored" },
        { profession: "Cook", item: ["Salt", "Skillet", "Onion"], weapon: "Dagger (1d4)", armor: "Unarmored" },
        { profession: "Fletcher", item: ["Bag of feathers"], weapon: "Shortbow (1d6) + 10 arrows", armor: "Unarmored" },
        { profession: "Gambler", item: ["Dice"], weapon: "Club (1d4)", armor: "Unarmored" },
        { profession: "Horse Thief", item: ["A horse"], weapon: "Spear (1d6)", armor: "Unarmored" },
        { profession: "Innkeeper", item: ["3 x Bottles of wine"], weapon: "Crossbow (1d6) + 10 bolts", armor: "Unarmored" },
        { profession: "Navigator", item: ["Compass", "Parchment", "Chalk"], weapon: "Crossbow (1d6) + 10 bolts", armor: "Unarmored" },
        { profession: "Shepherd", item: ["Pole (10' long, wooden)"], weapon: "Sling (1d4) + 10 stones", armor: "Unarmored" },
        { profession: "Tailor", item: ["Needle", "Thread", "Bag of buttons"], weapon: "Scissors (1d4)", armor: "Unarmored" },
        { profession: "Trader", item: ["Rare, fragrant spices"], weapon: "Crossbow (1d6) + 10 bolts", armor: "Unarmored" },
        { profession: "Weaver", item: ["Hand Loom", "Yarn"], weapon: "Scissors (1d3)", armor: "Unarmored" }
    ],
    3: [
        { profession: "Bowyer", item: ["Saw"], weapon: "Longbow (1d6) + 10 arrows", armor: "Unarmored" },
        { profession: "Cooper", item: ["Barrel"], weapon: "Hammer (1d4)", armor: "Unarmored" },
        { profession: "Executioner", item: ["50' Rope"], weapon: "Battle axe (1d8)", armor: "Unarmored" },
        { profession: "Fisher", item: ["Net"], weapon: "Spear (1d6)", armor: "Unarmored" },
        { profession: "Groom", item: ["Brush"], weapon: "Pitchfork (1d6)", armor: "Unarmored" },
        { profession: "Hermit", item: ["Spell book (1 random cantrip)"], weapon: "Staff (1d4)", armor: "Unarmored" },
        { profession: "Kennel Master", item: ["A dog"], weapon: "Staff (1d4)", armor: "Unarmored" },
        { profession: "Leatherworker", item: ["A bearskin"], weapon: "Awl (1d4)", armor: "Unarmored" },
        { profession: "Limner", item: ["Lantern", "2 x Oil flasks", "Paint"], weapon: "Staff (1d4)", armor: "Unarmored" },
        { profession: "Sailor", item: ["Bottle of rum", "50' Rope"], weapon: "Belaying pin (1d4)", armor: "Unarmored" },
        { profession: "Teamster", item: ["50' Rope"], weapon: "Whip (1d2, hits entangle)", armor: "Unarmored" },
        { profession: "Trapper", item: ["Bear trap (1d6)"], weapon: "Club (1d4)", armor: "Unarmored" }
    ],
    4: [
        { profession: "Armourer", item: ["Chain mail"], weapon: "War hammer (1d6)", armor: "Chain Mail" },
        { profession: "Barber Surgeon", item: ["Bottle of strong spirits"], weapon: "Razor (1d4)", armor: "Unarmored" },
        { profession: "Blacksmith", item: ["Tongs", "Apron"], weapon: "War hammer (1d6)", armor: "Unarmored" },
        { profession: "Carpenter", item: ["Saw"], weapon: "Hand axe (1d6)", armor: "Unarmored" },
        { profession: "Farmer", item: ["A pig"], weapon: "Pitchfork (1d6)", armor: "Unarmored" },
        { profession: "Forester", item: ["Tent"], weapon: "Shortbow (1d6) + 10 arrows", armor: "Unarmored" },
        { profession: "Hunter", item: ["Whistle"], weapon: "Longbow (1d6) + 10 arrows", armor: "Unarmored" },
        { profession: "Mason", item: ["A bag of rocks"], weapon: "Rock (1d4)", armor: "Unarmored" },
        { profession: "Miner", item: ["Lantern", "2 x Oil flasks"], weapon: "Pick axe (1d6)", armor: "Unarmored" },
        { profession: "Shipwright", item: ["Pot of tar"], weapon: "Hand axe (1d6)", armor: "Unarmored" },
        { profession: "Squire", item: ["Pole (10' long, wooden)", "Flag"], weapon: "Shortsword (1d6)", armor: "Unarmored" },
        { profession: "Weaponsmith", item: ["Tongs", "Apron"], weapon: "Sword (1d8)", armor: "Unarmored" }
    ]
};

// ============================================================================
// EXPORTED FUNCTIONS
// ============================================================================

/**
 * Get a random background based on hit points
 * @param {number} hitPoints - Character's hit points (1-4, will be clamped)
 * @returns {Object} Background object {profession, item, weapon, armor}
 */
export function getRandomBackground(hitPoints) {
    // Cap hit points at 4 for occupation selection, minimum 1
    const hpForOccupation = Math.min(Math.max(hitPoints, 1), 4);
    const table = backgroundTables[hpForOccupation];
    
    if (!table) {
        console.warn(`No background table found for HP: ${hpForOccupation}`);
        return {
            profession: 'Unknown',
            item: ['None'],
            weapon: 'Club (1d4)',
            armor: 'Unarmored'
        };
    }
    
    // Roll 1d12 for background
    const roll = Math.floor(Math.random() * 12) + 1;
    
    return table[roll - 1]; // d12 roll (1-12) maps to array index (0-11)
}

/**
 * Get a specific background by HP and index
 * @param {number} hitPoints - Character's hit points (1-4)
 * @param {number} index - Index in the table (0-11)
 * @returns {Object} Background object {profession, item, weapon, armor}
 */
export function getBackgroundByIndex(hitPoints, index) {
    const hpForOccupation = Math.min(Math.max(hitPoints, 1), 4);
    const table = backgroundTables[hpForOccupation];
    
    if (!table || index < 0 || index >= table.length) {
        return {
            profession: 'Unknown',
            item: ['None'],
            weapon: 'Club (1d4)',
            armor: 'Unarmored'
        };
    }
    
    return table[index];
}

/**
 * Get all backgrounds for a specific HP level
 * @param {number} hitPoints - Character's hit points (1-4)
 * @returns {Array} Array of background objects
 */
export function getBackgroundTable(hitPoints) {
    const hpForOccupation = Math.min(Math.max(hitPoints, 1), 4);
    return backgroundTables[hpForOccupation] || [];
}

/**
 * Get all background tables
 * @returns {Object} All background tables organized by HP
 */
export function getAllBackgroundTables() {
    return backgroundTables;
}

/**
 * Find a background by profession name, searching all HP tables.
 * @param {string} profession - The profession name to look up
 * @returns {Object|null} Background object { profession, item, weapon, armor } or null
 */
export function getBackgroundByProfession(profession) {
    for (const hp of [1, 2, 3, 4]) {
        const found = backgroundTables[hp].find(bg => bg.profession === profession);
        if (found) return found;
    }
    return null;
}
