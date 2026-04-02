/**
 * cs-modifier-display.js
 *
 * Character-sheet-only ability score modifier display text.
 * Used exclusively by cs-charactersheet.js (dynamic import).
 *
 * getModifier() was previously here but is identical to calculateModifier()
 * in shared-ability-scores.js — gen-race-adjustments.js now imports from there.
 */

/**
 * Get detailed modifier effects based on OSE rules
 * @param {string} ability - Ability score name (STR, DEX, CON, INT, WIS, CHA)
 * @param {number} modifier - Ability modifier (-3 to +3)
 * @param {number} score - Raw ability score (3-18)
 * @returns {string} Formatted string describing the effects
 */
export function getModifierEffects(ability, modifier, score) {
    switch(ability) {
        case "STR":
            let doorChance;
            if (score <= 5) doorChance = "1-in-6";
            else if (score <= 8) doorChance = "1-in-6";
            else if (score <= 12) doorChance = "2-in-6";
            else if (score <= 15) doorChance = "3-in-6";
            else if (score <= 17) doorChance = "4-in-6";
            else doorChance = "5-in-6";
            return `Melee: ${modifier >= 0 ? '+' : ''}${modifier} (Attack & Damage), Open Doors: ${doorChance}`;

        case "DEX":
            return `AC: ${modifier >= 0 ? '+' : ''}${modifier}, Missile: ${modifier >= 0 ? '+' : ''}${modifier} (Just Attacks), Initiative: ${modifier >= 0 ? '+' : ''}${modifier}`;

        case "CON":
            return `Hit Points: ${modifier >= 0 ? '+' : ''}${modifier} at each level`;

        case "INT":
            let languages, literacy;
            if (score <= 3) { languages = "Native (broken)"; literacy = "Illiterate"; }
            else if (score <= 5) { languages = "Native"; literacy = "Illiterate"; }
            else if (score <= 8) { languages = "Native"; literacy = "Basic"; }
            else if (score <= 12) { languages = "Native"; literacy = "Literate"; }
            else if (score <= 15) { languages = "Native + 1"; literacy = "Literate"; }
            else if (score <= 17) { languages = "Native + 2"; literacy = "Literate"; }
            else { languages = "Native + 3"; literacy = "Literate"; }
            return `Languages: ${languages}, Literacy: ${literacy}`;

        case "WIS":
            return `Magic Saves: ${modifier >= 0 ? '+' : ''}${modifier}`;

        case "CHA":
            let npcReaction = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            let maxRetainers, loyalty;
            if (score <= 3) { maxRetainers = 1; loyalty = 4; }
            else if (score <= 5) { maxRetainers = 2; loyalty = 5; }
            else if (score <= 8) { maxRetainers = 3; loyalty = 6; }
            else if (score <= 12) { maxRetainers = 4; loyalty = 7; }
            else if (score <= 15) { maxRetainers = 5; loyalty = 8; }
            else if (score <= 17) { maxRetainers = 6; loyalty = 9; }
            else { maxRetainers = 7; loyalty = 10; }
            return `NPC Reactions: ${npcReaction}, Max Retainers: ${maxRetainers}, Loyalty: ${loyalty}`;

        default:
            return "";
    }
}
