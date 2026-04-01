/**
 * shared-class-progression.js
 * Shared class progression utilities for all character generators
 * Used by: basic and advanced generators
 */

// Import shared ability score utilities
import { calculateXPBonus, getPrimeRequisites } from './shared-ability-scores.js';

/**
 * Get class progression data (saving throws, attack bonus, XP)
 * @param {Object} options - Progression options
 * @param {string} options.className - Class name (e.g., "Fighter")
 * @param {number} options.level - Character level
 * @param {Object} options.abilityScores - Ability scores object
 * @param {Object} options.classData - Class data module (OSE or Gygar)
 * @returns {Object} Progression data object
 */
export function getClassProgressionData(options) {
    const { className, level, abilityScores, classData } = options;
    
    console.log('\n=== Getting Class Progression Data ===');
    console.log(`Class: ${className}, Level: ${level}`);
    
    // className should already have _CLASS suffix
    
    // Get saving throws
    const savingThrows = classData.getSavingThrows(className, level);
    console.log('\nSaving Throws:');
    console.log(`  Death/Poison: ${savingThrows.death}`);
    console.log(`  Wands: ${savingThrows.wands}`);
    console.log(`  Paralysis/Petrify: ${savingThrows.paralysis}`);
    console.log(`  Breath Attacks: ${savingThrows.breath}`);
    console.log(`  Spells/Rods/Staves: ${savingThrows.spells}`);
    
    // Get attack bonus
    const attackBonus = classData.getAttackBonus(className, level);
    console.log(`\nAttack Bonus: ${attackBonus >= 0 ? '+' : ''}${attackBonus}`);
    
    // Get XP tracking
    const currentXP = 0;
    const xpForCurrentLevel = classData.getXPRequired(className, level);
    const xpForNextLevel = classData.getXPRequired(className, level + 1);
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
    
    // Calculate XP bonus from prime requisites
    const primeReqs = getPrimeRequisites(className);
    let xpBonus = 0;
    if (primeReqs.length > 0) {
        // OSE rule: bonus is determined by the LOWEST prime requisite score
        xpBonus = 10; // sentinel — will be replaced by actual minimum
        primeReqs.forEach(ability => {
            xpBonus = Math.min(xpBonus, calculateXPBonus(abilityScores[ability]));
        });
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
 * Get class-specific features (spell slots, thief skills, turn undead, class abilities)
 * @param {Object} options - Features options
 * @param {string} options.className - Class name
 * @param {number} options.level - Character level
 * @param {Object} options.classData - Class data module (OSE or Gygar)
 * @param {Object} options.ClassDataShared - Shared class data module
 * @returns {Object} Features object
 */
export function getClassFeatures(options) {
    const { className, level, classData, ClassDataShared } = options;
    
    console.log('\n=== Getting Class-Specific Features ===');
    console.log(`Class: ${className}, Level: ${level}`);
    
    // className should already have _CLASS suffix
    
    const features = {
        spellSlots: null,
        thiefSkills: null,
        turnUndead: null,
        classAbilities: []
    };
    
    // Extract base class name without _CLASS suffix for comparisons
    const baseClassName = className.replace('_CLASS', '');
    
    // Spell slots for spellcasters
    const spellcasters = ['Cleric', 'Magic-User', 'Elf', 'Gnome', 'Spellblade'];
    if (spellcasters.includes(baseClassName)) {
        features.spellSlots = classData.getSpellSlots(className, level);
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
    
    // Thief skills
    if (baseClassName === 'Thief') {
        features.thiefSkills = typeof classData.getThiefSkills === 'function'
            ? classData.getThiefSkills(level)
            : null;
        console.log('\nThief Skills:');
        if (features.thiefSkills) {
            Object.entries(features.thiefSkills).forEach(([skill, value]) => {
                console.log(`  ${skill}: ${value}%`);
            });
        }
    }
    
    // Turn undead for clerics
    if (baseClassName === 'Cleric') {
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
    
    // Class abilities (strip _CLASS suffix — CLASS_ABILITIES keys are plain names like "Cleric", "Fighter")
    const allAbilities = ClassDataShared.getAbilitiesAtLevel(baseClassName, level);
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

/**
 * Get racial abilities for demihuman classes (Basic Mode only)
 * In Basic Mode, race = class (Dwarf class, Elf class, etc.)
 * @param {string} className - Class name (e.g., "Dwarf", "Elf")
 * @returns {Array} Array of racial ability strings, or empty array if not demihuman
 */
export function getBasicModeRacialAbilities(className) {
    console.log('\n=== Getting Basic Mode Racial Abilities ===');
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
