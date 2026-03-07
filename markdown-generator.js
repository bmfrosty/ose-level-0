// Markdown generator for OSE 0-Level characters
// Shared between browser and Node.js

function generateCharacterMarkdown(character, isAdvanced) {
    // Get required functions
    let getModifierEffectsFunc, getRacialAbilitiesFunc;
    
    if (typeof getModifierEffects !== 'undefined') {
        // Browser
        getModifierEffectsFunc = getModifierEffects;
        getRacialAbilitiesFunc = getRacialAbilities;
    } else {
        // Node.js
        getModifierEffectsFunc = require('./ose-modifiers.js').getModifierEffects;
        getRacialAbilitiesFunc = require('./names-tables.js').getRacialAbilities;
    }
    
    let markdown = `# ${character.name}\n\n`;
    markdown += `## ${isAdvanced ? 'OLD-SCHOOL ESSENTIALS ADVANCED' : 'OLD-SCHOOL ESSENTIALS'}\n`;
    markdown += `**RETRO ADVENTURE GAME**\n\n`;
    markdown += `---\n\n`;
    markdown += `**Race:** ${character.race} | **Level:** 0 | **Occupation:** ${character.background.profession} | **HD:** 1d4\n\n`;
    
    markdown += `## Combat\n\n`;
    markdown += `| MAX HP | CUR HP | INIT | AC |\n`;
    markdown += `|--------|--------|------|----|\n`;
    const dexMod = character.results.find(r => r.ability === 'DEX').modifier;
    markdown += `| ${Math.max(1, character.hitPoints.total)} | ___ | ${dexMod >= 0 ? '+' : ''}${dexMod} | ${character.armorClass} |\n\n`;
    
    markdown += `## Ability Scores\n\n`;
    markdown += `| Ability | Score | Effects |\n`;
    markdown += `|---------|-------|----------|\n`;
    for (let result of character.results) {
        const effects = getModifierEffectsFunc(result.ability, result.modifier, result.roll);
        markdown += `| **${result.ability}** | ${result.roll} | ${effects} |\n`;
    }
    markdown += `\n`;
    
    markdown += `## Weapons and Skills\n\n`;
    markdown += `- **Weapon:** ${character.background.weapon}\n`;
    markdown += `- **Attack Bonus:** +0 (0-level)\n\n`;
    
    markdown += `## Racial Abilities\n\n`;
    const racialAbilities = getRacialAbilitiesFunc(character.race);
    if (racialAbilities && racialAbilities.length > 0) {
        for (let ability of racialAbilities) {
            markdown += `- ${ability}\n`;
        }
    } else {
        markdown += `- None\n`;
    }
    markdown += `\n`;
    
    markdown += `## Saving Throws\n\n`;
    markdown += `| Death | Wands | Petrify | Breath | Spells |\n`;
    markdown += `|-------|-------|---------|--------|--------|\n`;
    markdown += `| 14 | 15 | 16 | 17 | 18 |\n\n`;
    
    markdown += `## Equipment\n\n`;
    markdown += `- **Armor:** ${character.background.armor}\n`;
    markdown += `- **Items:**\n`;
    const items = Array.isArray(character.background.item) ? character.background.item : [character.background.item];
    for (let item of items) {
        markdown += `  - ${item}\n`;
    }
    markdown += `- **Starting AC:** ${character.armorClass}\n`;
    markdown += `- **Starting Gold:** ${character.startingGold || 0} gp\n`;
    
    return markdown;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateCharacterMarkdown };
}
