/**
 * shared-hit-points.js
 * Shared hit points utilities for all character generators
 * Used by: 0level, basic, and advanced generators
 */

// Import shared ability score utilities for formatting
import { formatModifier } from './shared-ability-scores.js';

/**
 * Roll a single die
 * @param {number} sides - Number of sides on the die
 * @returns {number} Die roll result
 */
export function rollSingleDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

/**
 * Parse hit dice string (e.g., "3d8", "9d8+2*", "1d6")
 * @param {string} hitDiceString - Hit dice string to parse
 * @returns {Object} Parsed hit dice object
 * @returns {number} return.numDice - Number of dice to roll
 * @returns {number} return.sides - Number of sides on each die
 * @returns {number} return.bonus - Flat bonus to add
 * @returns {boolean} return.noConModifier - Whether to skip CON modifier (asterisk)
 */
export function parseHitDice(hitDiceString) {
    if (!hitDiceString) {
        console.error(`Hit dice string is null or undefined`);
        return { numDice: 1, sides: 8, bonus: 0, noConModifier: false };
    }
    
    // Remove asterisk and save whether it was present
    const noConModifier = hitDiceString.includes('*');
    const cleanString = hitDiceString.replace('*', '');
    
    // Parse the dice notation (e.g., "3d8+2" or "1d6")
    const match = cleanString.match(/(\d+)d(\d+)([+-]\d+)?/);
    
    if (!match) {
        console.error(`Invalid hit dice string: ${hitDiceString}`);
        return { numDice: 1, sides: 8, bonus: 0, noConModifier };
    }
    
    return {
        numDice: parseInt(match[1]),
        sides: parseInt(match[2]),
        bonus: match[3] ? parseInt(match[3]) : 0,
        noConModifier: noConModifier
    };
}

/**
 * Roll hit points for a character
 * @param {Object} options - HP rolling options
 * @param {string} options.className - Class name (e.g., "Fighter")
 * @param {number} options.level - Character level
 * @param {number} options.conModifier - CON modifier
 * @param {Object} options.classData - Class data module (OSE or Gygar)
 * @param {boolean} [options.includeLevel0HP=false] - Whether to include level 0 HP
 * @param {boolean} [options.healthyCharacters=false] - Whether Healthy Characters is enabled
 * @param {boolean} [options.blessed=false] - Whether character has Blessed ability (roll twice, take best)
 * @returns {number} Total HP
 */
export function rollHitPoints(options) {
    const {
        className,
        level,
        conModifier,
        classData,
        includeLevel0HP = false,
        healthyCharacters = false,
        blessed = false
    } = options;
    
    console.log('\n=== Rolling Hit Points ===');
    console.log(`Class: ${className}, Level: ${level}, CON Modifier: ${formatModifier(conModifier)}`);
    if (blessed) {
        console.log('✨ Blessed: Rolling each die twice, taking best result');
    }
    
    let totalHP = 0;
    let level0HP = 0;
    
    // Roll Level 0 HP if enabled
    if (includeLevel0HP) {
        console.log('\n--- Level 0 HP ---');
        let l0Roll, l0HP;
        let l0Attempts = 0;
        
        do {
            l0Attempts++;
            
            if (blessed) {
                // Blessed: Roll twice, take best
                const roll1 = rollSingleDie(4);
                const roll2 = rollSingleDie(4);
                l0Roll = Math.max(roll1, roll2);
                console.log(`  Blessed rolls: ${roll1}, ${roll2} → taking ${l0Roll}`);
            } else {
                l0Roll = rollSingleDie(4);
            }
            
            l0HP = l0Roll + conModifier;
            
            // Minimum 1 HP
            if (l0HP < 1) l0HP = 1;
            
            if (healthyCharacters && l0HP < 2) {
                console.log(`  Level 0: [${l0Roll}] + ${formatModifier(conModifier)} = ${l0HP} (below minimum 2, rerolling...)`);
            }
        } while (healthyCharacters && l0HP < 2);
        
        console.log(`  Level 0: [${l0Roll}] + ${formatModifier(conModifier)} = ${l0HP}`);
        if (healthyCharacters && l0Attempts > 1) {
            console.log(`  ✅ Passed Healthy Characters check after ${l0Attempts} attempts`);
        }
        
        level0HP = l0HP;
        totalHP += l0HP;
    }
    
    // Roll HP for each level from 1 to selected level
    console.log(`\n--- Rolling HP for Levels 1-${level} ---`);
    
    for (let lvl = 1; lvl <= level; lvl++) {
        // className should already have _CLASS suffix
        const hitDiceString = classData.getHitDice(className, lvl);
        const hitDice = parseHitDice(hitDiceString);
        
        let levelHP, rolls;
        let attempts = 0;
        
        do {
            attempts++;
            rolls = [];
            levelHP = hitDice.bonus;
            
            // Roll the die
            if (blessed) {
                // Blessed: Roll twice, take best
                const roll1 = rollSingleDie(hitDice.sides);
                const roll2 = rollSingleDie(hitDice.sides);
                const die = Math.max(roll1, roll2);
                rolls.push(`${roll1},${roll2}→${die}`);
                levelHP += die;
            } else {
                const die = rollSingleDie(hitDice.sides);
                rolls.push(die);
                levelHP += die;
            }
            
            // Add CON modifier unless asterisk is present
            if (!hitDice.noConModifier) {
                levelHP += conModifier;
            }
            
            // Minimum 1 HP
            if (levelHP < 1) levelHP = 1;
            
            // Check Healthy Characters requirement (only for level 1 if no level 0 HP)
            if (lvl === 1 && !includeLevel0HP && healthyCharacters && levelHP < 2) {
                const conPart = hitDice.noConModifier ? '' : ` + ${formatModifier(conModifier)}`;
                console.log(`  Level ${lvl}: [${rolls.join(', ')}]${conPart} = ${levelHP} (below minimum 2, rerolling...)`);
            }
        } while (lvl === 1 && !includeLevel0HP && healthyCharacters && levelHP < 2);
        
        // Log the final roll
        const conPart = hitDice.noConModifier ? '' : ` + ${formatModifier(conModifier)}`;
        const bonusPart = hitDice.bonus !== 0 ? ` + ${hitDice.bonus}` : '';
        console.log(`  Level ${lvl}: [${rolls.join(', ')}]${bonusPart}${conPart} = ${levelHP}`);
        
        if (lvl === 1 && !includeLevel0HP && healthyCharacters && attempts > 1) {
            console.log(`  ✅ Passed Healthy Characters check after ${attempts} attempts`);
        }
        
        totalHP += levelHP;
    }
    
    // Summary
    console.log('\n--- Hit Points Summary ---');
    if (includeLevel0HP) {
        console.log(`Level 0 HP: ${level0HP}`);
        console.log(`Levels 1-${level} HP: ${totalHP - level0HP}`);
    }
    console.log(`Total HP: ${totalHP}`);
    console.log('==========================\n');
    
    return totalHP;
}
