/**
 * legacy-utils.js
 *
 * Exported utilities that are not currently used by either top-level controller
 * (gen-ui.js or cs-sheet-page.js) but are preserved here for potential
 * future use or external consumers.
 *
 * Sources:
 *   - shared-basic-utils.js      → getMinimumScores, getHitDiceSize,
 *                            getClassPrimeRequisites, meetsClassPrimeRequisites
 *   - shared-racial-abilities.js → getCommonDemihumanAbilities
 *   - shared-sheet-builder.js    → sanitize
 */

// ── From shared-basic-utils.js ───────────────────────────────────────────────────────

/**
 * Read minimum ability score requirements from the generator form inputs.
 * Returns the current values of the scoreXXX inputs as minimum thresholds.
 * NOTE: identical to readAbilityScores / readScoresFromInputs — use that instead.
 * @returns {Object} Ability scores object { STR, INT, WIS, DEX, CON, CHA }
 */
export function getMinimumScores() {
    return {
        STR: parseInt(document.getElementById('scoreSTR')?.value) || 3,
        INT: parseInt(document.getElementById('scoreINT')?.value) || 3,
        WIS: parseInt(document.getElementById('scoreWIS')?.value) || 3,
        DEX: parseInt(document.getElementById('scoreDEX')?.value) || 3,
        CON: parseInt(document.getElementById('scoreCON')?.value) || 3,
        CHA: parseInt(document.getElementById('scoreCHA')?.value) || 3
    };
}

/**
 * Get the hit dice size for a class.
 * NOTE: This hardcodes HD sizes; prefer reading from class-data modules directly.
 * @param {string} className - Class name (without _CLASS suffix)
 * @returns {number} Hit dice size (4, 6, or 8)
 */
export function getHitDiceSize(className) {
    const hitDiceSizes = {
        'Cleric': 6,
        'Fighter': 8,
        'Magic-User': 4,
        'Thief': 4,
        'Dwarf': 8,
        'Elf': 6,
        'Halfling': 6,
        'Gnome': 4,
        'Spellblade': 6
    };
    return hitDiceSizes[className] || 8;
}

/**
 * Get prime requisite ability scores for a class.
 * @param {string} className - Class name (without _CLASS suffix)
 * @returns {string[]} Array of ability score keys (e.g. ['STR', 'INT'])
 */
export function getClassPrimeRequisites(className) {
    const primeRequisites = {
        'Cleric': ['WIS'],
        'Fighter': ['STR'],
        'Magic-User': ['INT'],
        'Thief': ['DEX'],
        'Dwarf': ['STR'],
        'Elf': ['INT', 'STR'],
        'Halfling': ['DEX', 'STR'],
        'Gnome': ['INT'],
        'Spellblade': ['INT', 'STR']
    };
    return primeRequisites[className] || [];
}

/**
 * Check whether ability scores meet a class's prime requisite minimum.
 * @param {Object} scores - Ability scores { STR, INT, WIS, DEX, CON, CHA }
 * @param {string} className - Class name (without _CLASS suffix)
 * @param {number} minimum - Minimum score required (typically 9 or 13)
 * @returns {boolean}
 */
export function meetsClassPrimeRequisites(scores, className, minimum) {
    const primeReqs = getClassPrimeRequisites(className);
    if (primeReqs.length === 0) return true;
    return primeReqs.some(ability => scores[ability] >= minimum);
}

// ── From shared-racial-abilities.js ──────────────────────────────────────────

/**
 * Returns the common ability description shared by all demihumans.
 * @returns {string}
 */
export function getCommonDemihumanAbilities() {
    return "All demihumans speak additional native languages and have a 2-in-6 chance of hearing noises when listening at a door.";
}

// ── From shared-sheet-builder.js ─────────────────────────────────────────────

/**
 * Sanitize a string for use as a filename (replaces illegal characters).
 * @param {string} s
 * @returns {string}
 */
export const sanitize = s => (s || '').replace(/[/\\?%*:|"<>]/g, '-').trim();
