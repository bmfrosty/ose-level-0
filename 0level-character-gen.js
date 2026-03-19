/**
 * 0level-character-gen.js
 * Character generation functions for 0-level characters
 */

// Import shared modules
import {
    calculateModifier,
    rollAbilities
} from './shared-ability-scores.js';

// Import shared names and backgrounds
import { getRandomName as getRandomNameFromModule } from './shared-names.js';
import { getRandomBackground } from './shared-backgrounds.js';

// Import shared racial abilities
import {
    calculateSavingThrows as calculateSavingThrowsFromModule,
    calculateAttackBonus as calculateAttackBonusFromModule
} from './shared-racial-abilities.js';

// Import 0-level utilities
import {
    roll3d6,
    calculateHitPoints,
    calculateArmorClass,
    getMinimumScores,
    meetsMinimumRequirements,
    hasHighAbility,
    meetsPrimeRequisiteRequirements,
    meetsHealthyCharactersRequirement
} from './0level-utils.js';

// Import race adjustments
import {
    applyRaceAdjustments as applyRaceAdjustmentsFromModule,
    meetsRaceMinimums as meetsRaceMinimumsFromModule
} from './shared-race-adjustments.js';

/**
 * Default ability names
 */
const abilities = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

/**
 * Counter to track rerolls
 */
let rerollCount = 0;

/**
 * Current character data for PDF generation
 */
let currentCharacter = null;

/**
 * Get background based on hit points
 * @param {number} hitPoints - Character's hit points
 * @returns {Object} Background object {profession, item, weapon, armor}
 */
export function getBackgroundByHitPoints(hitPoints) {
    // Use shared backgrounds module
    return getRandomBackground(hitPoints);
}

/**
 * Roll for race (1-in-4 chance of demihuman)
 * @returns {string} Race name with _RACE suffix
 */
export function rollRace() {
    // Check if force specific race is selected
    const forceRaceSelect = typeof document !== 'undefined' ? document.getElementById('forceRace') : null;
    const forceRace = forceRaceSelect ? forceRaceSelect.value : '';
    
    // If a specific race is forced, return it with _RACE suffix
    if (forceRace) {
        return forceRace.endsWith('_RACE') ? forceRace : `${forceRace}_RACE`;
    }
    
    // Check if force demihuman checkbox is checked
    const forceDemihumanCheckbox = typeof document !== 'undefined' ? document.getElementById('forceDemihuman') : null;
    const forceDemihuman = forceDemihumanCheckbox ? forceDemihumanCheckbox.checked : false;
    
    const roll = Math.floor(Math.random() * 4) + 1;
    if (roll === 1 || forceDemihuman) {
        // Roll 1d4 for demihuman type
        const demihumanRoll = Math.floor(Math.random() * 4) + 1;
        if (demihumanRoll === 1) return "Dwarf_RACE";
        if (demihumanRoll === 2) return "Elf_RACE";
        if (demihumanRoll === 3) return "Gnome_RACE";
        if (demihumanRoll === 4) return "Halfling_RACE";
    }
    return "Human_RACE";
}

/**
 * Get random name based on race
 * @param {string} race - Character race (with _RACE suffix)
 * @returns {string} Random name
 */
export function getRandomName(race) {
    // Convert race name: remove _RACE suffix and capitalize first letter
    const raceName = race.replace('_RACE', '');
    const capitalizedRace = raceName.charAt(0).toUpperCase() + raceName.slice(1).toLowerCase();
    
    // Use shared names module
    return getRandomNameFromModule(capitalizedRace);
}

/**
 * Apply race adjustments to ability scores (Advanced mode only)
 * Delegates to shared-race-adjustments.js ES6 module
 * @param {Array} results - Array of ability score objects
 * @param {string} race - Character race
 * @param {boolean} isAdvanced - Whether Advanced mode is enabled
 * @param {boolean} humanRacialAbilities - Whether human racial abilities are enabled
 * @returns {Array} Adjusted ability score objects
 */
export function applyRaceAdjustments(results, race, isAdvanced, humanRacialAbilities) {
    return applyRaceAdjustmentsFromModule(results, race, isAdvanced, humanRacialAbilities);
}

/**
 * Check if character meets race minimums (Advanced mode only)
 * Delegates to shared-race-adjustments.js ES6 module
 * @param {Array} results - Array of ability score objects
 * @param {string} race - Character race
 * @param {boolean} isAdvanced - Whether Advanced mode is enabled
 * @returns {boolean} True if requirements met
 */
export function meetsRaceMinimums(results, race, isAdvanced) {
    return meetsRaceMinimumsFromModule(results, race, isAdvanced);
}

/**
 * Calculate saving throws for a character
 * Uses imported function from shared-racial-abilities.js
 * @param {number} level - Character level
 * @param {string} race - Character race
 * @param {number} conScore - Constitution score
 * @param {boolean} isAdvanced - Whether Advanced mode is enabled
 * @param {boolean} isGygar - Whether Gygar mode is enabled
 * @returns {Object} Saving throws object
 */
export function calculateSavingThrows(level, race, conScore, isAdvanced, isGygar) {
    return calculateSavingThrowsFromModule(level, race, conScore, isAdvanced, isGygar);
}

/**
 * Calculate attack bonus for a character
 * Uses imported function from shared-racial-abilities.js
 * @param {number} level - Character level
 * @param {string} race - Character race
 * @param {boolean} isAdvanced - Whether Advanced mode is enabled
 * @param {boolean} isGygar - Whether Gygar mode is enabled
 * @returns {number} Attack bonus
 */
export function calculateAttackBonus(level, race, isAdvanced, isGygar) {
    return calculateAttackBonusFromModule(level, race, isAdvanced, isGygar);
}

/**
 * Roll ability scores for 0-level character
 * @param {Object} minimums - Minimum scores object
 * @returns {Array} Array of ability score objects
 */
export function rollAbilityScores(minimums) {
    const results = [];
    
    for (let i = 0; i < abilities.length; i++) {
        const roll = roll3d6();
        const modifier = calculateModifier(roll);
        
        results.push({
            ability: abilities[i],
            roll: roll,
            modifier: modifier
        });
    }
    
    return results;
}

/**
 * Generate a single 0-level character
 * @returns {Object} Character object
 */
export async function generateSingleCharacter() {
    let results = [];
    let isValidArray = true;
    
    const minimums = getMinimumScores();
    
    // Keep rolling until we get valid scores AND at least 1 HP
    do {
        isValidArray = true;
        
        // Roll ability scores
        results = rollAbilityScores(minimums);
        
        // Check if scores meet minimums
        const scores = {};
        results.forEach(r => scores[r.ability] = r.roll);
        
        if (!meetsMinimumRequirements(scores, minimums)) {
            isValidArray = false;
            continue;
        }
        
        // Generate race early
        const tempRace = rollRace();
        
        // Check if Advanced mode is enabled
        const advancedCheckbox = typeof document !== 'undefined' ? document.getElementById('advanced') : null;
        const isAdvanced = advancedCheckbox ? advancedCheckbox.checked : false;
        
        // Check if human racial abilities are enabled
        const humanAbilitiesCheckbox = typeof document !== 'undefined' ? document.getElementById('humanRacialAbilities') : null;
        const humanRacialAbilities = humanAbilitiesCheckbox ? humanAbilitiesCheckbox.checked : true;
        
        // Apply race adjustments if Advanced mode
        const adjustedResults = await applyRaceAdjustments(results, tempRace, isAdvanced, humanRacialAbilities);
        
        // Check race minimums if Advanced mode
        if (!meetsRaceMinimums(adjustedResults, tempRace, isAdvanced)) {
            isValidArray = false;
            continue;
        }
        
        // Use adjusted results for further checks
        const conModifier = adjustedResults.find(r => r.ability === "CON").modifier;
        const hitPoints = calculateHitPoints(conModifier, tempRace, isAdvanced);
        
        // If character has less than 1 HP, they don't become an adventurer - reroll
        if (hitPoints.total < 1) {
            isValidArray = false;
            continue;
        }
        
        // Check if character has at least one ability score of 9 or above
        const adjustedScores = {};
        adjustedResults.forEach(r => adjustedScores[r.ability] = r.roll);
        
        if (!hasHighAbility(adjustedScores)) {
            isValidArray = false;
            continue;
        }
        
        // Check Prime Requisite mode requirements
        const primeReqMode = typeof document !== 'undefined' ? 
            (document.querySelector('input[name="primeRequisiteMode"]:checked')?.value || 'user') : 'user';
        
        if (primeReqMode === '9' && !meetsPrimeRequisiteRequirements(adjustedScores, 9)) {
            isValidArray = false;
            continue;
        }
        
        if (primeReqMode === '13' && !meetsPrimeRequisiteRequirements(adjustedScores, 13)) {
            isValidArray = false;
            continue;
        }
        
        // Check "Healthy Characters" mode requirements if enabled
        const healthyCharactersCheckbox = typeof document !== 'undefined' ? document.getElementById('healthyCharacters') : null;
        const healthyCharactersEnabled = healthyCharactersCheckbox ? healthyCharactersCheckbox.checked : false;
        
        if (healthyCharactersEnabled && !meetsHealthyCharactersRequirement(hitPoints.total)) {
            isValidArray = false;
            continue;
        }
        
    } while (!isValidArray);
    
    // Generate 0-level character details (we know HP is at least 1 now)
    const race = rollRace();
    const name = getRandomName(race);
    
    // Check if Advanced mode is enabled
    const advancedCheckbox = typeof document !== 'undefined' ? document.getElementById('advanced') : null;
    const isAdvanced = advancedCheckbox ? advancedCheckbox.checked : false;
    
    // Check if human racial abilities are enabled
    const humanAbilitiesCheckbox = typeof document !== 'undefined' ? document.getElementById('humanRacialAbilities') : null;
    const humanRacialAbilities = humanAbilitiesCheckbox ? humanAbilitiesCheckbox.checked : true;
    
    // Apply race adjustments to final results
    const finalResults = await applyRaceAdjustments(results, race, isAdvanced, humanRacialAbilities);
    
    const conModifier = finalResults.find(r => r.ability === "CON").modifier;
    const dexModifier = finalResults.find(r => r.ability === "DEX").modifier;
    const hitPoints = calculateHitPoints(conModifier, race, isAdvanced);
    
    // Get background based on hit points (capped at 4, minimum 1)
    const background = getBackgroundByHitPoints(hitPoints.total);
    const armorClass = calculateArmorClass(background.armor, dexModifier);
    
    // Roll 3d6 for starting gold
    const startingGold = roll3d6();
    
    // Check if Gygar mode is enabled
    const gygarCheckbox = typeof document !== 'undefined' ? document.getElementById('gygar') : null;
    const isGygar = gygarCheckbox ? gygarCheckbox.checked : true;
    
    // Calculate saving throws and attack bonus
    const conScore = finalResults.find(r => r.ability === "CON").roll;
    const savingThrows = calculateSavingThrows(0, race, conScore, isAdvanced, isGygar);
    const attackBonus = calculateAttackBonus(0, race, isAdvanced, isGygar);
    
    return {
        results: finalResults,
        background,
        race,
        name,
        hitPoints,
        armorClass,
        startingGold,
        total: finalResults.reduce((sum, r) => sum + r.modifier, 0),
        level: 0,
        attackBonus,
        savingThrows
    };
}

/**
 * Generate a 0-level character and display it
 * This function is called by the UI
 */
export async function generate0LevelCharacter() {
    rerollCount++; // Increment the counter on every call
    
    const character = await generateSingleCharacter();
    
    // Store character data for PDF generation
    currentCharacter = character;
    
    // Display results (will be handled by UI module)
    if (typeof window !== 'undefined' && typeof window.display0LevelCharacter !== 'undefined') {
        window.display0LevelCharacter(
            character.results,
            character.total,
            character.background,
            character.hitPoints,
            character.armorClass,
            character.race,
            character.name,
            character.startingGold
        );
    }
}

/**
 * Get current character data
 * @returns {Object|null} Current character object
 */
export function getCurrentCharacter() {
    return currentCharacter;
}

/**
 * Get reroll count
 * @returns {number} Number of rerolls
 */
export function getRerollCount() {
    return rerollCount;
}

// Export for backward compatibility
export {
    abilities,
    calculateModifier
};
