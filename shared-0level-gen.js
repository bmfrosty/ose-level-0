/**
 * shared-0level-gen.js
 * DOM-independent 0-level character generation.
 * Used by basic-ui.js (adv:0) and advanced-ui.js (adv:1) when level 0 is selected.
 */
import { calculateModifier, rollDice } from './shared-ability-scores.js';
import { getRandomName } from './shared-names.js';
import { getRandomBackground } from './shared-backgrounds.js';
import {
    calculateSavingThrows,
    calculateAttackBonus
} from './shared-racial-abilities.js';
import {
    applyRaceAdjustments,
    meetsRaceMinimums
} from './shared-race-adjustments.js';

const ABILITIES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
const DEMIHUMANS = ['Dwarf_RACE', 'Elf_RACE', 'Gnome_RACE', 'Halfling_RACE'];

/** Race code lookup shared with charactersheet.html cp encoding. */
export const RACE_TO_CODE = {
    'Human_RACE':'HU', 'Dwarf_RACE':'DW', 'Elf_RACE':'EL',
    'Halfling_RACE':'HA', 'Gnome_RACE':'GN'
};

/**
 * Pick a race based on forcedRace parameter.
 * '' → random (1-in-4 demihuman); 'Demihuman_RACE' → random demihuman; otherwise exact race.
 */
function pickRace(forcedRace) {
    if (forcedRace && forcedRace !== 'Demihuman_RACE') {
        return forcedRace.endsWith('_RACE') ? forcedRace : `${forcedRace}_RACE`;
    }
    const isDemihuman = forcedRace === 'Demihuman_RACE' || Math.floor(Math.random() * 4) === 0;
    return isDemihuman ? DEMIHUMANS[Math.floor(Math.random() * DEMIHUMANS.length)] : 'Human_RACE';
}

/**
 * Roll 0-level HP: 1d4 + CON modifier (total may be < 1; caller re-rolls).
 * Humans in Advanced mode use Blessed (roll twice, take best d4).
 */
function calcHitPoints(conModifier, race, isAdvanced) {
    const d4 = () => Math.floor(Math.random() * 4) + 1;
    const roll = (race === 'Human_RACE' && isAdvanced) ? Math.max(d4(), d4()) : d4();
    return { roll, total: roll + conModifier };
}

/** AC = 14 for Chain Mail, 10 otherwise, ± DEX modifier. */
function calcAC(armor, dexMod) {
    return (armor === 'Chain Mail' ? 14 : 10) + dexMod;
}

function rollAbilityScores() {
    return ABILITIES.map(a => {
        const roll = rollDice(3, 6);
        return { ability: a, roll, modifier: calculateModifier(roll) };
    });
}

function passesFilters(adj, hp, { minimums, primeReqMode, healthyChars }) {
    const s = {};
    adj.forEach(r => { s[r.ability] = r.roll; });

    for (const [ab, min] of Object.entries(minimums)) {
        if ((s[ab] ?? 3) < min) return false;
    }
    if (!Object.values(s).some(v => v >= 9)) return false;

    if (primeReqMode === '9' || primeReqMode === '13') {
        const t = parseInt(primeReqMode);
        if (!['STR', 'DEX', 'INT', 'WIS'].some(a => (s[a] ?? 3) >= t)) return false;
    }

    if (healthyChars && hp.total < 2) return false;
    return true;
}

/**
 * Generate a single 0-level character with no DOM dependencies.
 *
 * @param {Object} opts
 * @param {string}  [opts.race='']                 '' | 'Human_RACE' | 'Demihuman_RACE' | 'Dwarf_RACE' | ...
 * @param {boolean} [opts.isAdvanced=false]         Apply racial adjustments + Blessed (human)
 * @param {boolean} [opts.humanRacialAbilities=true] Include human racial abilities (Advanced only)
 * @param {boolean} [opts.isGygar=true]             Smoothified attack-bonus style
 * @param {Object}  [opts.minimums]                 { STR,DEX,CON,INT,WIS,CHA } minimum scores
 * @param {string}  [opts.primeReqMode='user']      'user' | '9' | '13'
 * @param {boolean} [opts.healthyChars=false]       Require HP ≥ 2
 * @param {Object}  [opts.fixedScores=null]         If set, use exact scores instead of rolling
 * @param {string}  [opts.fixedName='']             If non-empty, use this name instead of a random one
 * @returns {Promise<Object>} Character data
 */
export async function generateZeroLevelCharacter(opts = {}) {
    const {
        race: forcedRace = '',
        isAdvanced = false,
        humanRacialAbilities = true,
        isGygar = true,
        minimums = { STR:3, DEX:3, CON:3, INT:3, WIS:3, CHA:3 },
        primeReqMode = 'user',
        healthyChars = false,
        fixedScores = null,
        fixedName = '',
    } = opts;

    let adj, race, hp;

    if (fixedScores) {
        // Fixed scores mode — skip reroll loop, use exact values from inputs
        race = pickRace(forcedRace);
        adj = ABILITIES.map(a => ({
            ability: a,
            roll: fixedScores[a] ?? 10,
            modifier: calculateModifier(fixedScores[a] ?? 10)
        }));
        const conMod = adj.find(r => r.ability === 'CON').modifier;
        hp = calcHitPoints(conMod, race, isAdvanced);
        if (hp.total < 1) hp = { roll: 1, total: 1 }; // floor at 1 HP
    } else {
        // Reroll loop — exit when all filters pass
        for (;;) {
            const raw = rollAbilityScores();
            race = pickRace(forcedRace);
            adj  = await applyRaceAdjustments(raw, race, isAdvanced, humanRacialAbilities);
            if (!meetsRaceMinimums(adj, race, isAdvanced)) continue;

            const conMod = adj.find(r => r.ability === 'CON').modifier;
            hp = calcHitPoints(conMod, race, isAdvanced);
            if (hp.total < 1) continue;

            if (passesFilters(adj, hp, { minimums, primeReqMode, healthyChars })) break;
        }
    }

    const dexMod   = adj.find(r => r.ability === 'DEX').modifier;
    const conScore = adj.find(r => r.ability === 'CON').roll;
    const raceStem = race.replace('_RACE', '');
    const raceCap  = raceStem.charAt(0).toUpperCase() + raceStem.slice(1).toLowerCase();

    const name         = fixedName || getRandomName(raceCap);
    const background   = getRandomBackground(hp.total);
    const armorClass   = calcAC(background.armor, dexMod);
    const startingGold = rollDice(3, 6);
    const savingThrows = calculateSavingThrows(0, race, conScore, isAdvanced, isGygar);
    const attackBonus  = calculateAttackBonus(0, race, isAdvanced, isGygar);

    return {
        results: adj,           // [{ ability, roll, modifier }, ...]
        race,                   // e.g. 'Dwarf_RACE'
        raceCode: RACE_TO_CODE[race] || 'HU',
        name,
        background,             // { profession, weapon, armor, item[] }
        hitPoints: hp,          // { roll, total }
        armorClass,
        startingGold,
        total: adj.reduce((s, r) => s + r.modifier, 0),
        attackBonus,
        savingThrows,
    };
}
