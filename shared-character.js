/**
 * shared-character.js
 * Shared character object creation utilities for all character generators
 * Used by: basic and advanced generators
 */

// Import shared ability score utilities
import { calculateModifier } from './shared-ability-scores.js';

/**
 * Roll starting gold for a level 1 character.
 * OSE Standard / Smoothified: 3d6 × 10 gp
 * Labyrinth Lord: 3d8 × 10 gp
 * @param {string} progression - 'ose', 'smooth', or 'll'
 * @returns {number} Starting gold in gp
 */
export function rollStartingGold(progression) {
    const roll = (n, sides) =>
        Array.from({ length: n }, () => Math.ceil(Math.random() * sides))
             .reduce((a, b) => a + b, 0);
    return (progression === 'll' ? roll(3, 8) : roll(3, 6)) * 10;
}

/**
 * Calculate starting gold for a level 2+ character based on XP for their current level.
 * @param {number} xpForLevel - Minimum XP required to reach the character's current level
 * @param {number} pct - Wealth percentage (0, 25, 50, 75, or 100)
 * @returns {number} Starting gold in gp
 */
export function calcStartingGold(xpForLevel, pct) {
    if (!xpForLevel || pct === 0) return 0;
    return Math.floor(xpForLevel * pct / 100);
}

/**
 * Create comprehensive character object
 * @param {Object} options - Character generation options
 * @param {number} options.level - Character level
 * @param {string} options.className - Class name
 * @param {string} options.mode - Mode (Normal/Smoothified)
 * @param {Object} options.abilityScores - Ability scores object
 * @param {number} options.hp - Total hit points
 * @param {Object} options.progressionData - Progression data (saves, attack bonus, XP)
 * @param {Object} options.features - Class features (spell slots, thief skills, etc.)
 * @param {Array} options.racialAbilities - Racial abilities array
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
        racialAbilities,
        name,
        background,
        startingGold = null
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
        name: name || '',
        level: level,
        class: className,
        mode: mode,
        background: background || null,
        
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
        armorClass: 10, // Base AC (Ascending Armor Class) before DEX modifier and armor
        
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
        racialAbilities: racialAbilities,

        // Starting wealth
        startingGold: startingGold
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
