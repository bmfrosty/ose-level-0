/**
 * basic-character-gen.js
 * Character generation functions for Basic Mode
 */

// Import shared ability score utilities
import {
    calculateModifier,
    formatModifier,
    calculateXPBonus,
    getPrimeRequisites,
    meetsToughCharactersRequirements,
    rollSingleDie,
    rollDice,
    rollAbilityScore,
    rollAbilities
} from './shared-ability-scores.js';

// Re-export for backward compatibility
export {
    rollSingleDie,
    rollDice,
    rollAbilityScore,
    rollAbilities
};

/**
 * Parse hit dice string (e.g., "3d8", "9d8+2*", "1d6")
 * @param {string} hitDiceString - Hit dice string to parse
 * @returns {Object} Parsed hit dice object
 */
export function parseHitDice(hitDiceString) {
    if (!hitDiceString) {
        console.error(`Hit dice string is null or undefined`);
        return { numDice: 1, sides: 8, bonus: 0, noConModifier: false };
    }
    
    const cleanString = hitDiceString.replace('*', '');
    const match = cleanString.match(/(\d+)d(\d+)([+-]\d+)?/);
    
    if (!match) {
        console.error(`Invalid hit dice string: ${hitDiceString}`);
        return { numDice: 1, sides: 8, bonus: 0, noConModifier: hitDiceString.includes('*') };
    }
    
    return {
        numDice: parseInt(match[1]),
        sides: parseInt(match[2]),
        bonus: match[3] ? parseInt(match[3]) : 0,
        noConModifier: hitDiceString.includes('*')
    };
}


/**
 * Roll hit points for a character
 * @param {string} className - Class name
 * @param {number} level - Character level
 * @param {number} conModifier - CON modifier
 * @param {Object} classData - Class data module (OSE or Gygar)
 * @param {boolean} includeLevel0HP - Whether to include level 0 HP
 * @param {boolean} healthyCharacters - Whether Healthy Characters is enabled
 * @returns {number} Total HP
 */
export function rollHitPoints(className, level, conModifier, classData, includeLevel0HP, healthyCharacters) {
    console.log('\n=== Rolling Hit Points ===');
    console.log(`Class: ${className}, Level: ${level}, CON Modifier: ${formatModifier(conModifier)}`);
    
    let totalHP = 0;
    let level0HP = 0;
    
    // Roll Level 0 HP if enabled
    if (includeLevel0HP) {
        console.log('\n--- Level 0 HP ---');
        let l0Roll, l0HP;
        let l0Attempts = 0;
        
        do {
            l0Attempts++;
            l0Roll = rollSingleDie(4);
            l0HP = l0Roll + conModifier;
            
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
        const classNameWithSuffix = className + '_CLASS';
        const hitDiceString = classData.getHitDice(classNameWithSuffix, lvl);
        const hitDice = parseHitDice(hitDiceString);
        
        let levelHP, rolls;
        let attempts = 0;
        
        do {
            attempts++;
            rolls = [];
            levelHP = hitDice.bonus;
            
            const die = rollSingleDie(hitDice.sides);
            rolls.push(die);
            levelHP += die;
            
            if (!hitDice.noConModifier) {
                levelHP += conModifier;
            }
            
            if (levelHP < 1) levelHP = 1;
            
            if (lvl === 1 && !includeLevel0HP && healthyCharacters && levelHP < 2) {
                const conPart = hitDice.noConModifier ? '' : ` + ${formatModifier(conModifier)}`;
                console.log(`  Level ${lvl}: [${rolls.join(', ')}]${conPart} = ${levelHP} (below minimum 2, rerolling...)`);
            }
        } while (lvl === 1 && !includeLevel0HP && healthyCharacters && levelHP < 2);
        
        const conPart = hitDice.noConModifier ? '' : ` + ${formatModifier(conModifier)}`;
        const bonusPart = hitDice.bonus !== 0 ? ` + ${hitDice.bonus}` : '';
        console.log(`  Level ${lvl}: [${rolls.join(', ')}]${bonusPart}${conPart} = ${levelHP}`);
        
        if (lvl === 1 && !includeLevel0HP && healthyCharacters && attempts > 1) {
            console.log(`  ✅ Passed Healthy Characters check after ${attempts} attempts`);
        }
        
        totalHP += levelHP;
    }
    
    console.log('\n--- Hit Points Summary ---');
    if (includeLevel0HP) {
        console.log(`Level 0 HP: ${level0HP}`);
        console.log(`Levels 1-${level} HP: ${totalHP - level0HP}`);
    }
    console.log(`Total HP: ${totalHP}`);
    console.log('==========================\n');
    
    return totalHP;
}

/**
 * Get class progression data (saving throws, attack bonus, XP)
 * @param {string} className - Class name
 * @param {number} level - Character level
 * @param {Object} abilityScores - Ability scores object
 * @param {Object} classData - Class data module (OSE or Gygar)
 * @returns {Object} Progression data object
 */
export function getClassProgressionData(className, level, abilityScores, classData) {
    console.log('\n=== Getting Class Progression Data ===');
    console.log(`Class: ${className}, Level: ${level}`);
    
    const classNameWithSuffix = className + '_CLASS';
    
    const savingThrows = classData.getSavingThrows(classNameWithSuffix, level);
    console.log('\nSaving Throws:');
    console.log(`  Death/Poison: ${savingThrows.death}`);
    console.log(`  Wands: ${savingThrows.wands}`);
    console.log(`  Paralysis/Petrify: ${savingThrows.paralysis}`);
    console.log(`  Breath Attacks: ${savingThrows.breath}`);
    console.log(`  Spells/Rods/Staves: ${savingThrows.spells}`);
    
    const attackBonus = classData.getAttackBonus(classNameWithSuffix, level);
    console.log(`\nAttack Bonus: ${attackBonus >= 0 ? '+' : ''}${attackBonus}`);
    
    const currentXP = 0;
    const xpForCurrentLevel = classData.getXPRequired(classNameWithSuffix, level);
    const xpForNextLevel = classData.getXPRequired(classNameWithSuffix, level + 1);
    const xpToNextLevel = xpForNextLevel ? xpForNextLevel - currentXP : null;
    
    console.log(`\nXP Tracking:`);
    console.log(`  Current XP: ${currentXP}`);
    console.log(`  XP for Level ${level}: ${xpForCurrentLevel}`);
    if (xpForNextLevel) {
        console.log(`  XP for Level ${level + 1}: ${xpForNextLevel}`);
        console.log(`  XP to Next Level: ${xpToNextLevel}`);
    } else {
        console.log(`  Maximum level reached!`);
    }
    
    const primeReqs = getPrimeRequisites(className);
    let xpBonus = 0;
    if (primeReqs.length > 0) {
        let totalBonus = 0;
        primeReqs.forEach(ability => {
            const score = abilityScores[ability];
            totalBonus += calculateXPBonus(score);
        });
        xpBonus = Math.floor(totalBonus / primeReqs.length);
    }
    console.log(`  Prime Requisite XP Bonus: ${xpBonus >= 0 ? '+' : ''}${xpBonus}%`);
    
    console.log('======================================\n');
    
    return {
        savingThrows,
        attackBonus,
        currentXP,
        xpForCurrentLevel,
        xpForNextLevel,
        xpToNextLevel,
        xpBonus
    };
}

/**
 * Get racial abilities for demihuman classes
 * @param {string} className - Class name
 * @returns {Array} Array of racial ability strings, or empty array if not demihuman
 */
export function getRacialAbilities(className) {
    console.log('\n=== Getting Racial Abilities ===');
    console.log(`Class: ${className}`);
    
    const demihumanClasses = ['Dwarf', 'Elf', 'Halfling', 'Gnome'];
    
    if (!demihumanClasses.includes(className)) {
        console.log('Not a demihuman class - no racial abilities');
        console.log('====================================\n');
        return [];
    }
    
    // In Basic Mode, demihuman classes have racial abilities built-in
    // These are the same abilities from racial-abilities.js but formatted for display
    const racialAbilities = {
        'Dwarf': [
            'Languages: Common, Dwarf, Gnome, Goblin, Kobold',
            'Infravision: 60\'',
            'Listening at Doors: 2-in-6 chance',
            'Detect Construction Tricks: 2-in-6 chance to detect traps, sliding walls, sloping passages',
            'Resilience: Bonus to saves vs Death/Poison, Wands, and Spells/Rods/Staves based on CON (see saving throws)'
        ],
        'Elf': [
            'Languages: Common, Elf, Gnoll, Hobgoblin, Orc',
            'Infravision: 60\'',
            'Listening at Doors: 2-in-6 chance',
            'Detect Secret Doors: 2-in-6 chance when searching, 1-in-6 chance when passing by',
            'Immunity to Ghoul Paralysis'
        ],
        'Halfling': [
            'Languages: Common, Halfling',
            'Listening at Doors: 2-in-6 chance',
            'Missile Attack Bonus: +1 to hit with all missile weapons',
            'Armor Class Bonus: -2 bonus to AC when attacked by creatures larger than human-sized',
            'Resilience: Bonus to saves vs Death/Poison, Wands, and Spells/Rods/Staves based on CON (see saving throws)',
            'Hiding: 90% chance in wilderness, 2-in-6 in dungeons (must be motionless and alone or with other halflings)'
        ],
        'Gnome': [
            'Languages: Common, Gnome, Dwarf, Goblin, Kobold',
            'Infravision: 60\'',
            'Listening at Doors: 2-in-6 chance',
            'Detect Construction Tricks: 2-in-6 chance to detect traps, sliding walls, sloping passages',
            'Armor Class Bonus: -4 bonus to AC when attacked by creatures larger than ogre-sized',
            'Magic Resistance: Bonus to saves vs Wands and Spells/Rods/Staves based on CON (see saving throws)',
            'Hiding in Wilderness: 90% chance in undergrowth (must be motionless)'
        ]
    };
    
    const abilities = racialAbilities[className] || [];
    
    console.log('\nRacial Abilities:');
    abilities.forEach(ability => {
        console.log(`  - ${ability}`);
    });
    
    console.log('====================================\n');
    
    return abilities;
}

/**
 * Create comprehensive character object
 * @param {Object} options - Character generation options
 * @returns {Object} Complete character object
 */
export function createCharacter(options) {
    const {
        level,
        className,
        mode,
        abilityScores,
        hp,
        progressionData,
        features,
        racialAbilities
    } = options;
    
    console.log('\n=== Creating Character Object ===');
    console.log(`Level ${level} ${className} (${mode} Mode)`);
    
    // Calculate ability modifiers
    const abilityModifiers = {};
    Object.keys(abilityScores).forEach(ability => {
        abilityModifiers[ability] = calculateModifier(abilityScores[ability]);
    });
    
    // Create character object
    const character = {
        // Basic info
        level: level,
        class: className,
        mode: mode,
        
        // Ability scores
        abilityScores: { ...abilityScores },
        abilityModifiers: { ...abilityModifiers },
        
        // Hit points
        hp: {
            current: hp,
            max: hp
        },
        
        // Combat stats
        savingThrows: { ...progressionData.savingThrows },
        attackBonus: progressionData.attackBonus,
        armorClass: 9, // Base AC before armor
        
        // Experience
        xp: {
            current: progressionData.currentXP,
            forCurrentLevel: progressionData.xpForCurrentLevel,
            forNextLevel: progressionData.xpForNextLevel,
            toNextLevel: progressionData.xpToNextLevel,
            bonus: progressionData.xpBonus
        },
        
        // Class features
        spellSlots: features.spellSlots,
        thiefSkills: features.thiefSkills,
        turnUndead: features.turnUndead,
        classAbilities: features.classAbilities,
        
        // Racial abilities (for demihuman classes)
        racialAbilities: racialAbilities
    };
    
    console.log('\n--- Character Object Created ---');
    console.log(`Level: ${character.level}`);
    console.log(`Class: ${character.class}`);
    console.log(`Mode: ${character.mode}`);
    console.log(`HP: ${character.hp.current}/${character.hp.max}`);
    console.log(`Attack Bonus: ${character.attackBonus >= 0 ? '+' : ''}${character.attackBonus}`);
    console.log(`AC: ${character.armorClass}`);
    console.log(`XP: ${character.xp.current} (${character.xp.toNextLevel ? character.xp.toNextLevel + ' to next level' : 'max level'})`);
    console.log(`XP Bonus: ${character.xp.bonus >= 0 ? '+' : ''}${character.xp.bonus}%`);
    
    if (character.spellSlots) {
        console.log('Spell Slots: Yes');
    }
    if (character.thiefSkills) {
        console.log('Thief Skills: Yes');
    }
    if (character.turnUndead) {
        console.log('Turn Undead: Yes');
    }
    if (character.classAbilities && character.classAbilities.length > 0) {
        console.log(`Class Abilities: ${character.classAbilities.length}`);
    }
    if (character.racialAbilities && character.racialAbilities.length > 0) {
        console.log(`Racial Abilities: ${character.racialAbilities.length}`);
    }
    
    console.log('=================================\n');
    
    return character;
}

/**
 * Get class-specific features (spell slots, thief skills, turn undead, class abilities)
 * @param {string} className - Class name
 * @param {number} level - Character level
 * @param {Object} classData - Class data module (OSE or Gygar)
 * @param {Object} ClassDataShared - Shared class data module
 * @returns {Object} Features object
 */
export function getClassFeatures(className, level, classData, ClassDataShared) {
    console.log('\n=== Getting Class-Specific Features ===');
    console.log(`Class: ${className}, Level: ${level}`);
    
    const classNameWithSuffix = className + '_CLASS';
    
    const features = {
        spellSlots: null,
        thiefSkills: null,
        turnUndead: null,
        classAbilities: []
    };
    
    const spellcasters = ['Cleric', 'Magic-User', 'Elf', 'Gnome', 'Spellblade'];
    if (spellcasters.includes(className)) {
        features.spellSlots = classData.getSpellSlots(classNameWithSuffix, level);
        console.log('\nSpell Slots:');
        if (features.spellSlots) {
            Object.entries(features.spellSlots).forEach(([spellLevel, slots]) => {
                if (slots > 0) {
                    console.log(`  Level ${spellLevel}: ${slots} slots`);
                }
            });
        } else {
            console.log('  No spell slots at this level');
        }
    }
    
    if (className === 'Thief') {
        features.thiefSkills = classData.getThiefSkills(level);
        console.log('\nThief Skills:');
        if (features.thiefSkills) {
            Object.entries(features.thiefSkills).forEach(([skill, value]) => {
                console.log(`  ${skill}: ${value}%`);
            });
        }
    }
    
    if (className === 'Cleric') {
        // Use HD categories instead of monster names
        const undeadHDTypes = ['1HD', '2HD', '2*HD', '3HD', '4HD', '5HD', '6HD', '7-9HD'];
        features.turnUndead = {};
        console.log('\nTurn Undead:');
        undeadHDTypes.forEach(type => {
            const target = classData.getTurnUndead(level, type);
            features.turnUndead[type] = target;
            if (target === 'T') {
                console.log(`  ${type}: T (automatically turned)`);
            } else if (target === 'D') {
                console.log(`  ${type}: D (automatically destroyed)`);
            } else if (target === null || target === undefined) {
                console.log(`  ${type}: - (cannot turn)`);
            } else {
                console.log(`  ${type}: ${target}+ (roll 2d6)`);
            }
        });
    }
    
    const allAbilities = ClassDataShared.getAbilitiesAtLevel(classNameWithSuffix, level);
    if (allAbilities && allAbilities.length > 0) {
        features.classAbilities = allAbilities;
        console.log('\nClass Abilities:');
        allAbilities.forEach(ability => {
            console.log(`  - ${ability.name}: ${ability.description}`);
        });
    }
    
    console.log('======================================\n');
    
    return features;
}
