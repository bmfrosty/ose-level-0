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
 * @param {number[]|null} [options.fixedRolls=null] - If provided, use these per-entry HP values instead of rolling
 * @returns {{ max: number, rolls: number[], dice: number[] }} HP result with per-level breakdown
 */
export function rollHitPoints(options) {
    const {
        className,
        level,
        conModifier,
        classData,
        includeLevel0HP = false,
        healthyCharacters = false,
        blessed = false,
        fixedRolls = null   // array of per-entry HP; if set, skip random rolling
    } = options;

    if (blessed) console.log('[HP Roll] ✨ Blessed: rolling each die TWICE, taking the best result');

    // Helper: roll one die, logging both values when blessed
    const rollDie = (sides, label) => {
        if (blessed) {
            const a = rollSingleDie(sides);
            const b = rollSingleDie(sides);
            const best = Math.max(a, b);
            console.log(`  ${label}: 1d${sides} blessed → [${a}, ${b}] took ${best}`);
            return best;
        }
        const r = rollSingleDie(sides);
        console.log(`  ${label}: 1d${sides} → ${r}`);
        return r;
    };

    // L0 is ALWAYS at rolls[0] / dice[0] — gives compact params a stable hr[] layout.
    // It counts toward totalHP only when includeLevel0HP=true.
    const rolls = [];   // per-entry final HP: [L0, L1, L2, ...]
    const dice  = [];   // die sides:          [4,  X,  X, ...]
    let totalHP = 0;

    // ─── Level 0 ──────────────────────────────────────────────────────────────
    dice.push(4);
    let backgroundHP;
    {
        let l0HP;
        if (fixedRolls && fixedRolls[0] !== undefined) {
            l0HP = fixedRolls[0];   // stored value is already the final HP
            console.log(`  L0${includeLevel0HP ? '' : ' (bg only)'}: fixed → ${l0HP}`);
        } else {
            // L0 is NEVER blessed — it determines background occupation
            do {
                const die = rollSingleDie(4);
                const lbl = includeLevel0HP ? 'L0' : 'L0 (bg only)';
                console.log(`  ${lbl}: 1d4 → ${die} (unblessed — background selection roll)`);
                l0HP = Math.max(1, die + conModifier);
            } while (healthyCharacters && includeLevel0HP && l0HP < 2);
        }
        rolls.push(l0HP);                       // always at index 0
        if (includeLevel0HP) totalHP += l0HP;   // only counts when requested
        backgroundHP = l0HP;
    }

    // ─── Levels 1–N ─────────────────────────────────────────────────────────
    for (let lvl = 1; lvl <= level; lvl++) {
        const hitDiceString = classData.getHitDice(className, lvl);
        const hitDice = parseHitDice(hitDiceString);
        const rollsIndex = lvl;   // L0 always occupies index 0

        // Past-max-HD levels (noConModifier=true) get a fixed incremental HP gain —
        // no die is ever rolled. Store sides=0 so the edit panel hides the 🎲 button.
        dice.push(hitDice.noConModifier ? 0 : (hitDice.sides || 0));

        let levelHP;
        if (fixedRolls && fixedRolls[rollsIndex] !== undefined) {
            levelHP = fixedRolls[rollsIndex];
            console.log(`  L${lvl}: fixed → ${levelHP}`);
        } else {
            do {
                let dieRoll, hpBonus;
                if (hitDice.noConModifier) {
                    // Past max HD: fixed increment — compute delta vs previous level's bonus.
                    // e.g. "9d8+8*" (L13) minus "9d8+6*" (L12) = +2 HP, no die roll, no CON mod.
                    dieRoll = 0;
                    const prevHd = parseHitDice(classData.getHitDice(className, lvl - 1));
                    hpBonus = hitDice.bonus - prevHd.bonus;
                } else {
                    dieRoll = hitDice.sides > 0 ? rollDie(hitDice.sides, `L${lvl}`) : 0;
                    hpBonus = hitDice.bonus;
                }
                levelHP = hpBonus + dieRoll;
                if (!hitDice.noConModifier) levelHP += conModifier;
                if (levelHP < 1) levelHP = 1;
            // L1 floor: when L0 HP is NOT included in the total, the character's
            // level-1 HP IS their total HP — it must be at least as high as their
            // level-0 HP so they can't lose HP on gaining their first class level.
            // Also reroll for Healthy Characters (min 2 HP at L1).
            } while (lvl === 1 && !includeLevel0HP && (
                levelHP < backgroundHP ||
                (healthyCharacters && levelHP < 2)
            ));
        }

        rolls.push(levelHP);
        totalHP += levelHP;
    }

    const label = rolls.map((r,i) => `[${i===0 ? 'L0' : 'L'+i}:${r}]`).join(' ');
    console.log(`HP total: ${label} = ${totalHP}  (bg L0 hp=${backgroundHP}${blessed?' ✨blessed':''})`);
    return { max: totalHP, rolls, dice, backgroundHP };
}
