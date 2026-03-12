/**
 * shared-character.js
 * Shared character object creation utilities for all character generators
 * Used by: basic and advanced generators
 */

// Import shared ability score utilities
import { calculateModifier } from './shared-ability-scores.js';

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
