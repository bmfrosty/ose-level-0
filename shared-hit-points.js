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
 * @param {number} [options.hpMode=0] - HP rolling mode: 0=normal, 1=blessed, 2=5e, 3=re-roll 1s and 2s (all levels)
 * @param {number} [options.hpMode=0] - HP rolling mode: 0=normal, 1=blessed (roll twice take best), 2=5e (max at L1, average at L2+)
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
        hpMode = 0,         // 0=normal, 1=blessed, 2=5e, 3=re-roll 1s and 2s
        fixedRolls = null   // array of per-entry HP; if set, skip random rolling
    } = options;

    const mode = hpMode;

    const modeLabel = ['normal', 'blessed', '5e', 'reroll12'][mode] || 'normal';
    console.log(`[HP Roll] mode=${modeLabel}`);
    if (mode === 1) console.log('[HP Roll] ✨ Blessed: rolling each die TWICE, taking the best result');
    if (mode === 2) console.log('[HP Roll] 🎲 5e: max at level 1, average at level 2+');

    // Helper: roll one die (used for normal and blessed modes only; 5e is deterministic)
    const rollDie = (sides, label) => {
        if (mode === 1) {
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
            let l0Die;
            do {
                l0Die = rollSingleDie(4);
                const lbl = includeLevel0HP ? 'L0' : 'L0 (bg only)';
                console.log(`  ${lbl}: 1d4 → ${l0Die} (unblessed — background selection roll)`);
                l0HP = Math.max(1, l0Die + conModifier);
            } while (mode === 3 && includeLevel0HP && l0Die <= 2);
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
        } else if (hitDice.noConModifier) {
            // Past max HD: fixed increment — compute delta vs previous level's bonus.
            // e.g. "9d8+8*" (L13) minus "9d8+6*" (L12) = +2 HP, no die roll, no CON mod.
            const prevHd = parseHitDice(classData.getHitDice(className, lvl - 1));
            levelHP = Math.max(1, hitDice.bonus - prevHd.bonus);
        } else if (mode === 2) {
            // 5e mode: max die at level 1, average (floor(sides/2)+1) at level 2+
            // Formula: d4→3, d6→4, d8→5, d10→6, d12→7 (matches 5e fixed HP values exactly)
            const dieVal = lvl === 1 ? hitDice.sides : Math.floor(hitDice.sides / 2) + 1;
            levelHP = Math.max(1, hitDice.bonus + dieVal + conModifier);
            console.log(`  L${lvl}: 5e ${lvl===1?'max':'avg'} 1d${hitDice.sides} → ${dieVal} + conMod(${conModifier}) = ${levelHP}`);
        } else {
            // Normal or blessed: random rolling with do-while for L1 floor + re-roll 1s and 2s
            let dieRoll;
            do {
                dieRoll = hitDice.sides > 0 ? rollDie(hitDice.sides, `L${lvl}`) : 0;
                levelHP = hitDice.bonus + dieRoll + conModifier;
                if (levelHP < 1) levelHP = 1;
            // L1 floor: when L0 HP is NOT included in the total, the character's
            // level-1 HP IS their total HP — it must be at least as high as their
            // level-0 HP so they can't lose HP on gaining their first class level.
            // Re-roll 1s and 2s: if the raw die roll was 1 or 2, re-roll (all levels).
            } while (
                (lvl === 1 && !includeLevel0HP && levelHP < backgroundHP) ||
                (mode === 3 && dieRoll <= 2)
            );
        }

        rolls.push(levelHP);
        totalHP += levelHP;
    }

    const label = rolls.map((r,i) => `[${i===0 ? 'L0' : 'L'+i}:${r}]`).join(' ');
    console.log(`HP total: ${label} = ${totalHP}  (bg L0 hp=${backgroundHP}${mode===1?' ✨blessed':mode===2?' 🎲5e':''})`);
    return { max: totalHP, rolls, dice, backgroundHP };
}
