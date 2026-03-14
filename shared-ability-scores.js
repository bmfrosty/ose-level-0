/**
 * shared-ability-scores.js
 * Shared ability score utilities for all character generators
 * Used by: 0level, basic, and advanced generators
 */

/**
 * Calculate ability modifier (-3 to +3)
 * @param {number} score - Ability score (3-18)
 * @returns {number} Modifier (-3 to +3)
 */
export function calculateModifier(score) {
    if (score <= 3) return -3;
    if (score <= 5) return -2;
    if (score <= 8) return -1;
    if (score <= 12) return 0;
    if (score <= 15) return 1;
    if (score <= 17) return 2;
    return 3; // 18
}

/**
 * Format modifier for display (+1, -2, etc.)
 * @param {number} mod - Modifier value
 * @returns {string} Formatted modifier
 */
export function formatModifier(mod) {
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

/**
 * Calculate XP bonus from prime requisite (-20% to +10%)
 * @param {number} score - Prime requisite score
 * @returns {number} XP bonus percentage
 */
export function calculateXPBonus(score) {
    if (score <= 5) return -20;
    if (score <= 8) return -10;
    if (score <= 12) return 0;
    if (score <= 15) return 5;
    return 10; // 16+
}

/**
 * Get prime requisites for a class
 * @param {string} className - Class name
 * @returns {string[]} Array of prime requisite ability names
 */
export function getPrimeRequisites(className) {
    const primeReqs = {
        'Cleric_CLASS': ['WIS'],
        'Fighter_CLASS': ['STR'],
        'Magic-User_CLASS': ['INT'],
        'Thief_CLASS': ['DEX'],
        'Dwarf_CLASS': ['STR'],
        'Elf_CLASS': ['STR', 'INT'],
        'Halfling_CLASS': ['STR', 'DEX'],
        'Gnome_CLASS': ['INT'],
        'Spellblade_CLASS': ['STR', 'INT']
    };
    return primeReqs[className] || [];
}

/**
 * Check if scores meet Tough Characters requirements
 * At least ONE of STR/DEX/INT/WIS must be ≥ 13
 * @param {Object} scores - Ability scores object
 * @returns {boolean} True if requirements met
 */
export function meetsToughCharactersRequirements(scores) {
    return scores.STR >= 13 || scores.DEX >= 13 || 
           scores.INT >= 13 || scores.WIS >= 13;
}

/**
 * Check if scores meet prime requisite requirements for a class
 * All prime requisites for the class must be ≥ 13
 * @param {Object} scores - Ability scores object
 * @param {string} className - Class name
 * @returns {boolean} True if requirements met
 */
export function meetsPrimeRequisiteRequirements(scores, className) {
    const primeReqs = getPrimeRequisites(className);
    if (primeReqs.length === 0) return true; // No prime requisites
    
    return primeReqs.every(ability => scores[ability] >= 13);
}

/**
 * Roll a single die
 * @param {number} sides - Number of sides on the die
 * @returns {number} Die roll result
 */
export function rollSingleDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll multiple dice
 * @param {number} numDice - Number of dice to roll
 * @param {number} sides - Number of sides on each die
 * @returns {number} Total of all dice
 */
export function rollDice(numDice, sides) {
    let total = 0;
    for (let i = 0; i < numDice; i++) {
        total += rollSingleDie(sides);
    }
    return total;
}

/**
 * Roll a single ability score (3d6) with detailed logging
 * @param {number} minimum - Minimum score to accept
 * @param {string} abilityName - Name of ability for logging
 * @returns {number} Ability score
 */
export function rollAbilityScore(minimum, abilityName) {
    let score, rolls;
    let attempts = 0;
    
    do {
        attempts++;
        rolls = [];
        score = 0;
        for (let i = 0; i < 3; i++) {
            const die = rollSingleDie(6);
            rolls.push(die);
            score += die;
        }
        if (score < minimum) {
            console.log(`  ${abilityName}: [${rolls.join(', ')}] = ${score} (below minimum ${minimum}, rerolling...)`);
        }
    } while (score < minimum);
    
    console.log(`  ${abilityName}: [${rolls.join(', ')}] = ${score}`);
    return score;
}

/**
 * Roll all ability scores
 * @param {Object} minimumScores - Minimum scores for each ability
 * @param {boolean} toughCharacters - Whether Tough Characters is enabled
 * @param {string} className - Class name (optional, for prime requisite check)
 * @param {boolean|number} primeRequisite13 - Whether prime requisites must be ≥ 13 (legacy boolean) OR minimum value (9 or 13)
 * @returns {Object} Ability scores object
 */
export function rollAbilities(minimumScores, toughCharacters, className = null, primeRequisite13 = false) {
    let scores;
    let setAttempts = 0;
    
    // Handle both legacy boolean and new number format
    let primeReqMinimum = null;
    if (primeRequisite13 === true) {
        primeReqMinimum = 13; // Legacy: true means ≥ 13
    } else if (typeof primeRequisite13 === 'number') {
        primeReqMinimum = primeRequisite13; // New: 9 or 13
    }
    
    console.log('=== Rolling Ability Scores ===');
    if (toughCharacters) {
        console.log('Tough Characters enabled: At least one of STR/DEX/INT/WIS must be ≥ 13');
    }
    if (primeReqMinimum && className) {
        const primeReqs = getPrimeRequisites(className);
        console.log(`Prime Requisite ≥ ${primeReqMinimum} enabled: At least one of ${primeReqs.join(', ')} must be ≥ ${primeReqMinimum} for ${className}`);
    }
    
    do {
        setAttempts++;
        if (setAttempts > 1) {
            console.log(`\nAttempt #${setAttempts} (previous set failed requirements):`);
        } else {
            console.log('\nRolling 3d6 for each ability:');
        }
        
        scores = {
            STR: rollAbilityScore(minimumScores.STR, 'STR'),
            INT: rollAbilityScore(minimumScores.INT, 'INT'),
            WIS: rollAbilityScore(minimumScores.WIS, 'WIS'),
            DEX: rollAbilityScore(minimumScores.DEX, 'DEX'),
            CON: rollAbilityScore(minimumScores.CON, 'CON'),
            CHA: rollAbilityScore(minimumScores.CHA, 'CHA')
        };
        
        // Check Tough Characters requirement
        if (toughCharacters && !meetsToughCharactersRequirements(scores)) {
            console.log('❌ Failed Tough Characters check (need at least one of STR/DEX/INT/WIS ≥ 13)');
            continue;
        }
        
        // Check Prime Requisite requirement
        if (primeReqMinimum && className) {
            const primeReqs = getPrimeRequisites(className);
            // Check if at least ONE prime requisite meets the minimum
            const meetsPR = primeReqs.some(ability => scores[ability] >= primeReqMinimum);
            if (!meetsPR) {
                const prValues = primeReqs.map(ability => `${ability}=${scores[ability]}`).join(', ');
                console.log(`❌ Failed Prime Requisite check (need at least one of ${primeReqs.join(', ')} ≥ ${primeReqMinimum}, got: ${prValues})`);
                continue;
            }
        }
        
        // All checks passed
        break;
    } while (true);
    
    if (setAttempts > 1) {
        console.log(`✅ Passed all requirements after ${setAttempts} attempts`);
    }
    
    console.log('\n=== Final Ability Scores ===');
    console.log(`STR: ${scores.STR} (${formatModifier(calculateModifier(scores.STR))})`);
    console.log(`INT: ${scores.INT} (${formatModifier(calculateModifier(scores.INT))})`);
    console.log(`WIS: ${scores.WIS} (${formatModifier(calculateModifier(scores.WIS))})`);
    console.log(`DEX: ${scores.DEX} (${formatModifier(calculateModifier(scores.DEX))})`);
    console.log(`CON: ${scores.CON} (${formatModifier(calculateModifier(scores.CON))})`);
    console.log(`CHA: ${scores.CHA} (${formatModifier(calculateModifier(scores.CHA))})`);
    console.log('==============================\n');
    
    return scores;
}
