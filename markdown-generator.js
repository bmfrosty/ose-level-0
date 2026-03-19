// Markdown generator for OSE 0-Level characters
// ES6 Module

import { getModifierEffects } from './shared-modifier-effects.js';
import { getAdvancedModeRacialAbilities as getRacialAbilities } from './shared-racial-abilities.js';

export function generateCharacterMarkdown(character, isAdvanced) {
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
        const effects = getModifierEffects(result.ability, result.modifier, result.roll);
        markdown += `| **${result.ability}** | ${result.roll} | ${effects} |\n`;
    }
    markdown += `\n`;
    
    markdown += `## Weapons and Skills\n\n`;
    markdown += `- **Weapon:** ${character.background.weapon}\n`;
    // Use dynamic attack bonus if available, otherwise default to +0
    const attackBonus = character.attackBonus !== undefined ? character.attackBonus : 0;
    const attackBonusText = attackBonus >= 0 ? `+${attackBonus}` : attackBonus.toString();
    markdown += `- **Attack Bonus:** ${attackBonusText} (0-level)\n\n`;
    
    markdown += `## Racial Abilities\n\n`;
    const racialAbilities = getRacialAbilities(character.race);
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
    // Use dynamic saving throws if available, otherwise use defaults
    const deathSave = character.savingThrows ? character.savingThrows.Death : 14;
    const wandsSave = character.savingThrows ? character.savingThrows.Wands : 15;
    const paralysisSave = character.savingThrows ? character.savingThrows.Paralysis : 16;
    const breathSave = character.savingThrows ? character.savingThrows.Breath : 17;
    const spellsSave = character.savingThrows ? character.savingThrows.Spells : 18;
    markdown += `| ${deathSave} | ${wandsSave} | ${paralysisSave} | ${breathSave} | ${spellsSave} |\n\n`;
    
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
