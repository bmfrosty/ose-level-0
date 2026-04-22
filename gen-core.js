/**
 * gen-core.js
 * All gen-only logic: utility re-exports, DOM helpers, name tables, background
 * tables, equipment purchasing, and character generation (Basic + Advanced, levels 0–14).
 *
 * generateCharacter(opts) handles all modes and levels via narrow conditionals:
 *   - isAdvanced: apply racial stat adjustments, check racial minimums, Blessed HP
 *   - level === 0: 1d4 HP, background, AC, gold (3d6 gp); no class
 *   - level >= 1: class HP via rollHitPoints, progression data, class/racial abilities
 *                 opts.classData is required for level >= 1
 *
 * Only three isAdvanced checks exist in the whole function (per the design):
 *   1. applyRacialAbilityModifiers  — Advanced only
 *   2. meetsRacialMinimums          — Advanced only
 *   3. class requirements check     — Advanced only (level >= 1)
 *   mode string is passed to getRaceAbilitiesAtLevel — no conditional needed
 */

import { WEAPONS, ARMOR, calculateModifier, rollDice,
    calculateSavingThrows, calculateAttackBonus,
    applyRacialAbilityModifiers, applyRacialSaveModifiers, meetsRacialMinimums,
    getRaceInfo, getRaceAbilitiesAtLevel, getClassProgressionData,
    getClassFeatures, getBasicModeClassAbilities, CLASS_INFO,
    rollHitPoints as rollHPLeveled, rollStartingGold, calcStartingGold,
    getBackgroundByProfession, getRandomBackground,
} from './shared-core.js';
import * as ClassDataShared from './shared-core.js';

// ── Re-export all of shared-core.js so gen-ui.js has a single import point ────
export * from './shared-core.js';

// ── DOM helpers ───────────────────────────────────────────────────────────────

export function readAbilityScores() {
    return {
        STR: parseInt(document.getElementById('scoreSTR').value) || 3,
        INT: parseInt(document.getElementById('scoreINT').value) || 3,
        WIS: parseInt(document.getElementById('scoreWIS').value) || 3,
        DEX: parseInt(document.getElementById('scoreDEX').value) || 3,
        CON: parseInt(document.getElementById('scoreCON').value) || 3,
        CHA: parseInt(document.getElementById('scoreCHA').value) || 3
    };
}

// ── Internal constants ─────────────────────────────────────────────────────────

const namesTables = {
    human: [
        "Ada", "Addie", "Agnes", "Albert", "Alex", "Alexander", "Alfred", "Alice", "Alma", "Amanda",
        "Amelia", "Andrew", "Anna", "Annie", "Archie", "Arthur", "August", "Belle", "Ben", "Benjamin",
        "Bernard", "Bertha", "Beska", "Bessie", "Bert", "Blanche", "Brag", "Bran", "Calvin", "Carl",
        "Caroline", "Carrie", "Catherine", "Charles", "Charley", "Charlie", "Charlotte", "Chester", "Clara", "Clarence",
        "Claude", "Clyde", "Cora", "Daisy", "Dan", "Daniel", "David", "Della", "Dora", "Doram",
        "Dougal", "Earl", "Ed", "Edgar", "Edith", "Edna", "Edward", "Edwin", "Effie", "Eliza",
        "Elizabeth", "Ellen", "Ella", "Elsie", "Elmer", "Emily", "Emma", "Ernest", "Esme", "Estra",
        "Ethel", "Etta", "Eugene", "Eva", "Fannie", "Flora", "Florence", "Floyd", "Frances", "Francis",
        "Frank", "Fred", "Frederick", "George", "Georgia", "Gertrude", "Glendor", "Grace", "Grame", "Guy",
        "Hannah", "Harriet", "Harry", "Harvey", "Hattie", "Hawk", "Helen", "Henry", "Herbert", "Herman",
        "Homer", "Horace", "Howard", "Hugh", "Ida", "Ira", "Isaac", "Jack", "Jacob", "James",
        "Jane", "Jennie", "Jerry", "Jesse", "Jessie", "Jim", "Joe", "John", "Joseph", "Josephine",
        "Julia", "Julius", "Kate", "Katherine", "Katie", "Laura", "Lawrence", "Lee", "Lena", "Leo",
        "Leonard", "Lewis", "Lillian", "Lillie", "Lizzie", "Lottie", "Louis", "Louise", "Lucy", "Lula",
        "Lulu", "Luther", "Lydia", "Mabel", "Mae", "Maggie", "Mamie", "Marga", "Margaret", "Marie",
        "Marion", "Martha", "Martin", "Mary", "Mattie", "Maud", "Maude", "May", "Michael", "Millie",
        "Milton", "Minnie", "Mollie", "Morgan", "Morgo", "Myrtle", "Nancy", "Nannie", "Nellie", "Nettie",
        "Nora", "Olive", "Oliver", "Oscar", "Otto", "Patrick", "Paul", "Pearl", "Peter", "Philip",
        "Ralt", "Ralph", "Ray", "Raymond", "Rebecca", "Richard", "Robert", "Rosa", "Rose", "Roy",
        "Rufus", "Ruth", "Sadie", "Sallie", "Sam", "Samuel", "Sarah", "Sidney", "Stella", "Stephen",
        "Susan", "Susie", "Theodore", "Theodor", "Thomas", "Thyra", "Tom", "Viola", "Virginia", "Walter",
        "Warren", "Wilberd", "Will", "William", "Willie", "Willis", "Wynn", "Yor"
    ],
    dwarf: [
        "Azagar", "Azaghâl", "Balin", "Bhargi", "Bifur", "Bofur", "Boli", "Bombur", "Bomli", "Borin",
        "Bór", "Brorn", "Báin", "Dori", "Dorm", "Durin", "Dwalin", "Dwordin", "Dáin", "Dís",
        "Fali", "Farin", "Fimbul", "Flogi", "Flói", "Frerin", "Frár", "Frór", "Fróin", "Fundin",
        "Fíli", "Gamil", "Ghandar", "Gilda", "Gimli", "Glerin", "Glóin", "Gorm", "Grór", "Gundur",
        "Gîm", "Húrin", "Ibûn", "Khazin", "Khorin", "Khorvi", "Khuzain", "Khuzdul", "Khîm", "Kímlin",
        "Kjund", "Kíli", "Krago", "Lóni", "Magni", "Magra", "Mîm", "Narvi", "Nifdel", "Nondur",
        "Nori", "Norlin", "Náin", "Náli", "Nár", "Ori", "Orin", "Orvin", "Smarag", "Telchar",
        "Thoradin", "Thorgrum", "Thorin", "Thorvall", "Thráin", "Thrór", "Thuzdin", "Thûl", "Tor", "Ulfinn",
        "Umrig", "Ungrim", "Ungver", "Óin"
    ],
    elf: [
        "Acer", "Adaneth", "Aegnor", "Aelene", "Aerin", "Aldon", "Althaea", "Amara", "Aranion", "Arden",
        "Arianwen", "Ariella", "Armoviel", "Arwen", "Ash", "Astrid", "Atheldwen", "Baelenorn", "Boreas", "Calantha",
        "Calanon", "Calathiel", "Cassara", "Celeborn", "Dahlia", "Dagorhir", "Earendil", "Eira", "Eirlys", "Eirianwen",
        "Elara", "Elbereth", "Eldalótë", "Ellis", "Elrond", "Elvina", "Emery", "Erevan", "Eris", "Fascienne",
        "Finrod", "Fiore", "Freya", "Fëanor", "Galadriel", "Gildor", "Giselle", "Glind", "Glorfindel", "Haelyn",
        "Haldir", "Harlow", "Heiki", "Heldor", "Helios", "Iliyanbruen", "Ingvalor", "Jhaeros", "Keira", "Kethryll'ia",
        "Laela", "Legolas", "Lilith", "Lindra", "Liriel", "Luna", "Lúthien", "Maura", "Melantha", "Melian",
        "Melwasúl", "Mezlo", "Morgana", "Morgath", "Narbondel", "Nelaros", "Nenethiel", "Nimrodel", "Nimue", "Oberon",
        "Oriel", "Orlandiel", "Orodreth", "Orthiel", "Pharaun", "Qilué", "Quenya", "Questor", "Rainier", "Raven",
        "Rhiannon", "Rizolvir", "Sable", "Selene", "Seraphina", "Solas", "Sylphrena", "Tabor", "Talathel", "Thalia",
        "Thalion", "Thranduil", "Tinúviel", "Turgon", "Umbra", "Vhaerun", "Voss", "Wren", "Xiloscient", "Yathlanae",
        "Yavanna", "Zelda", "Zephyra", "Zephyrus"
    ],
    gnome: [
        "Aiko", "Aithne", "Amorette", "Aripine", "Armida", "Banli", "Banxi", "Belita", "Bingles", "Bink",
        "Bitsy", "Bitty", "Bixi", "Blunder", "Bonita", "Brenna", "Brooke", "Carlin", "Carnoa", "Celqys",
        "Charlene", "Darra", "Demi", "Dinky", "Dunkle", "Elfi", "Flimp", "Froume", "Gigget", "Gilligan",
        "Gnorbitt", "Half-pint", "Helna", "Herble", "Hisxif", "Horiddle", "Jenna", "Jelssa", "Jingred", "Jinky",
        "Jinxie", "Jubie", "Kiara", "Kierna", "Knaz", "Koemi", "Krankle", "Lil", "Lilliput", "Loom",
        "Lorsum", "Maleah", "Merry", "Miette", "Miki", "Nina", "Nink", "Nipsy", "Nirbert", "Odafi",
        "Orgyra", "Orla", "Orsys", "Peanut", "Penny", "Piera", "Pipi", "Pippy", "Poppy", "Posy",
        "Quillz", "Quindle", "Rosine", "Rowan", "Runt", "Sahana", "Shanna", "Short-shot", "Simon", "Small-fry",
        "Smiggles", "Solita", "Sprinkle", "Tallie", "Tansi", "Taroe", "Tawnie", "Teagan", "Tina", "Tink",
        "Tinkerella", "Toby", "Tonk", "Topsy", "Torji", "Trixie", "Triza", "Tulla", "Twitch", "Two-bit",
        "Vex", "Viggle", "Viveca", "Vonove", "Walby", "Whitley", "Wicket", "Winkle", "Wizzle", "Yves",
        "Ziggy", "Zinna", "Zita"
    ],
    halfling: [
        "Adelard", "Aiko", "Alora", "Andwise", "Arabella", "Armida", "Ayita", "Balbo", "Balbina", "Barner",
        "Bellisima", "Berylla", "Bodo", "Bonita", "Brunella", "Carlotta", "Charmaine", "Cottar", "Daisy", "Drogo",
        "Dudo", "Eder", "Ferret", "Fink", "Gelvira", "Gilly", "Gokin", "Haldon", "Hilda", "Hildigrim",
        "Hob", "Jopher", "Joyas", "Kepli", "Largo", "Lavinia", "Lidda", "Malva", "Marigold", "Mazzy",
        "Merla", "Merry", "Mirabella", "Nickle", "Olo", "Otho", "Pendor", "Peony", "Portia", "Primula",
        "Righto", "Rimita", "Rorimac", "Tarkas", "Thomwise", "Twilly", "Valkas"
    ]
};

export function getRandomName(race) {
    const raceKey = race.toLowerCase();
    const names = namesTables[raceKey];
    if (!names) {
        console.warn(`No name table found for race: ${race}`);
        return "Unknown";
    }
    return names[Math.floor(Math.random() * names.length)];
}

export function getNameTable(race) {
    return namesTables[race.toLowerCase()] || [];
}

export function getAvailableRaces() {
    return Object.keys(namesTables).map(r => r.charAt(0).toUpperCase() + r.slice(1));
}

// ── Internal constants ─────────────────────────────────────────────────────────

const ABILITIES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
const DEMIHUMANS = ['Dwarf_RACE', 'Elf_RACE', 'Halfling_RACE'];

// ── Internal helpers ───────────────────────────────────────────────────────────

function pickRace(forcedRace) {
    if (forcedRace && forcedRace !== 'Demihuman_RACE') {
        return forcedRace.endsWith('_RACE') ? forcedRace : `${forcedRace}_RACE`;
    }
    const isDemihuman = forcedRace === 'Demihuman_RACE' || Math.floor(Math.random() * 4) === 0;
    return isDemihuman ? DEMIHUMANS[Math.floor(Math.random() * DEMIHUMANS.length)] : 'Human_RACE';
}

function raceFromBasicClass(className) {
    const base = className.replace('_CLASS', '');
    return DEMIHUMANS.some(r => r === `${base}_RACE`) ? `${base}_RACE` : 'Human_RACE';
}

function rollAbilityScores() {
    return ABILITIES.map(a => {
        const roll = rollDice(3, 6);
        return { ability: a, roll, modifier: calculateModifier(roll) };
    });
}

function passesFilters(results, { minimums, primeReqMode }) {
    const s = {};
    results.forEach(r => { s[r.ability] = r.roll; });
    for (const [ab, min] of Object.entries(minimums)) {
        if ((s[ab] ?? 3) < min) return false;
    }
    if (!Object.values(s).some(v => v >= 9)) return false;
    if (primeReqMode === '9' || primeReqMode === '13') {
        const t = parseInt(primeReqMode);
        if (!['STR', 'DEX', 'INT', 'WIS'].some(a => (s[a] ?? 3) >= t)) return false;
    }
    return true;
}

function calcLevel0HP(conModifier, hpMode) {
    const d4 = () => Math.floor(Math.random() * 4) + 1;
    let roll;
    if (hpMode === 3) { do { roll = d4(); } while (roll <= 2); }
    else              { roll = d4(); }
    return { roll, total: roll + conModifier };
}

function calcAC(armor, dexMod) {
    return (armor === 'Chain Mail' ? 14 : 10) + dexMod;
}

function toMap(results) {
    const m = {};
    results.forEach(r => { m[r.ability] = r.roll; });
    return m;
}

// ── Main export ────────────────────────────────────────────────────────────────

/**
 * Generate a single character. Handles Basic and Advanced modes, levels 0–14.
 *
 * @param {Object}  opts
 * @param {string}  [opts.mode='basic']               'basic' | 'advanced'
 * @param {number}  [opts.level=0]                    0–14
 * @param {string}  [opts.race='']                    '' | 'Demihuman_RACE' | 'Dwarf_RACE' | ...
 * @param {string}  [opts.className=null]              null (level 0) | 'Fighter_CLASS' | ...
 * @param {boolean} [opts.isGygar=false]               Smoothified/Gygar mode
 * @param {boolean} [opts.humanRacialAbilities=false]  Advanced: enable human racial abilities
 * @param {Object}  [opts.minimums={}]                 { STR, DEX, ... } user per-ability minimums
 * @param {string}  [opts.primeReqMode='user']         'user' | '9' | '13'
 * @param {number}  [opts.hpMode=0]                   0=standard | 1=everyone blessed | 3=reroll 1s/2s
 * @param {Object}  [opts.fixedScores=null]            { STR, DEX, ... } skip reroll loop
 * @param {Object}  [opts.fixedAdjustments=null]       { STR, DEX, ... } override racial adjustments
 * @param {string}  [opts.fixedName='']                Use this name instead of random
 * @param {string|null} [opts.fixedOccupation=null]    Pin to a specific background profession
 * @param {Object}  [opts.classData=null]              Class data module (required for level >= 1)
 * @param {boolean} [opts.includeLevel0HP=false]       Include level-0 HP in level 1+ totals
 * @param {number|null} [opts.fixedStartingGold=null]  Override starting gold
 * @param {number}  [opts.wealthPct=100]               Starting gold % of XP for level 2+
 * @param {number[]|null} [opts.fixedHPRolls=null]     Per-level HP values (level 1+ edit panel)
 * @returns {Object} Character data — see return statement for full shape
 */
export function generateCharacter(opts = {}) {
    const {
        mode = 'basic',
        level = 0,
        race: forcedRace = '',
        className = null,
        isGygar = false,
        humanRacialAbilities = false,
        minimums = {},
        primeReqMode = 'user',
        hpMode = 0,
        fixedScores = null,
        fixedAdjustments = null,
        fixedName = '',
        fixedOccupation = null,
        classData = null,
        includeLevel0HP = false,
        fixedStartingGold = null,
        wealthPct = 100,
        fixedHPRolls = null,
    } = opts;

    const isAdvanced = mode === 'advanced';

    const staticRace = (level >= 1 && !isAdvanced && className)
        ? raceFromBasicClass(className)
        : null;

    let results, race, hp0, attempts = 0;

    if (fixedScores) {
        race = staticRace ?? pickRace(forcedRace);
        const raw = ABILITIES.map(a => ({
            ability: a,
            roll: fixedScores[a] ?? 10,
            modifier: calculateModifier(fixedScores[a] ?? 10),
        }));
        if (fixedAdjustments && Object.values(fixedAdjustments).some(v => v !== 0)) {
            results = raw.map(r => {
                const delta = fixedAdjustments[r.ability] || 0;
                const adjusted = Math.max(3, Math.min(18, r.roll + delta));
                return {
                    ability: r.ability,
                    roll: adjusted,
                    originalRoll: delta !== 0 ? r.roll : undefined,
                    modifier: calculateModifier(adjusted),
                };
            });
        } else {
            results = applyRacialAbilityModifiers(raw, race, isAdvanced, humanRacialAbilities);
        }
        attempts = 1;
        if (level === 0) {
            const conMod = results.find(r => r.ability === 'CON').modifier;
            hp0 = calcLevel0HP(conMod, hpMode);
            if (hp0.total < 1) hp0 = { roll: 1, total: 1 };
        }
    } else {
        for (;;) {
            attempts++;
            const raw = rollAbilityScores();
            race = staticRace ?? pickRace(forcedRace);

            if (isAdvanced && !meetsRacialMinimums(raw, race, true)) continue;

            const adj = applyRacialAbilityModifiers(raw, race, isAdvanced, humanRacialAbilities);

            if (level >= 1 && isAdvanced && className) {
                const bareClass = className.replace('_CLASS', '');
                const bareRace  = race.replace('_RACE', '');
                const reqs = CLASS_INFO[bareClass]?.requirements?.[bareRace] ?? {};
                const rawMap = toMap(raw);
                if (Object.entries(reqs).some(([ab, min]) => (rawMap[ab] ?? 0) < min)) continue;
            }

            if (!passesFilters(raw, { minimums, primeReqMode })) continue;

            if (level === 0) {
                const conMod = adj.find(r => r.ability === 'CON').modifier;
                hp0 = calcLevel0HP(conMod, hpMode);
                if (hp0.total < 1) continue;
            }

            results = adj;
            break;
        }
    }

    const abilityScores = toMap(results);
    const conScore = results.find(r => r.ability === 'CON').roll;
    const conMod   = results.find(r => r.ability === 'CON').modifier;
    const dexMod   = results.find(r => r.ability === 'DEX').modifier;

    const raceStem = race.replace('_RACE', '');
    const raceCap  = raceStem.charAt(0).toUpperCase() + raceStem.slice(1).toLowerCase();
    const name     = fixedName || getRandomName(raceCap);

    const racialAbilities = getRaceAbilitiesAtLevel(race, level, mode, humanRacialAbilities);

    if (level === 0) {
        const background = fixedOccupation
            ? (getBackgroundByProfession(fixedOccupation) || getRandomBackground(hp0.total))
            : getRandomBackground(hp0.total);
        const armorClass   = calcAC(background.armor, dexMod);
        const startingGold = rollDice(3, 6);
        const savingThrows = calculateSavingThrows(0, race, conScore, isAdvanced, isGygar);
        const attackBonus  = calculateAttackBonus(0, race, isAdvanced, isGygar);

        console.log('\n=== Level 0 Character Generation ===');
        console.log(`Race: ${race}, Mode: ${mode}, Attempts: ${attempts}`);
        console.log('\nAbility Scores:');
        results.forEach(r => console.log(`  ${r.ability}: ${r.roll} (${r.modifier >= 0 ? '+' : ''}${r.modifier})`));
        console.log('\nHP: roll=' + hp0.roll + ', total=' + hp0.total);
        console.log('\nBackground: ' + background.profession + (background.armor ? ` (armor: ${background.armor})` : ''));
        console.log('AC: ' + armorClass);
        console.log('Starting Gold: ' + startingGold + ' gp');
        console.log('\nSaving Throws:');
        console.log(`  Death/Poison: ${savingThrows.death}`);
        console.log(`  Wands: ${savingThrows.wands}`);
        console.log(`  Paralysis/Petrify: ${savingThrows.paralysis}`);
        console.log(`  Breath Attacks: ${savingThrows.breath}`);
        console.log(`  Spells/Rods/Staves: ${savingThrows.spells}`);
        console.log('\nAttack Bonus: ' + attackBonus);
        console.log('\nRacial Abilities:');
        racialAbilities.forEach(a => console.log(`  - ${a.name}: ${a.description}`));

        return {
            results, abilityScores,
            total: results.reduce((s, r) => s + r.modifier, 0),
            race, raceCode: getRaceInfo(race)?.code ?? 'HU',
            name, level: 0, mode,
            hitPoints: hp0,
            armorClass, savingThrows, attackBonus,
            racialAbilities, classAbilities: [],
            background, startingGold,
            attempts,
        };
    }

    if (!classData) {
        throw new Error('generateCharacter: opts.classData is required for level >= 1');
    }

    const hpResult = rollHPLeveled({
        className, level, conModifier: conMod, classData,
        includeLevel0HP, hpMode, fixedRolls: fixedHPRolls,
    });

    const progressionData = getClassProgressionData({ className, level, abilityScores, classData });

    const savingThrows = applyRacialSaveModifiers(
        { ...progressionData.savingThrows },
        race,
        { CON: conScore }
    );

    const attackBonus = progressionData.attackBonus;
    const features = getClassFeatures({ className, level, classData, ClassDataShared });

    const BASIC_DEMIHUMAN_CLASSES = ['Dwarf_CLASS', 'Elf_CLASS', 'Halfling_CLASS', 'Gnome_CLASS'];
    const classAbilities = (!isAdvanced && BASIC_DEMIHUMAN_CLASSES.includes(className))
        ? getBasicModeClassAbilities(className)
        : (features.classAbilities || []);

    let startingGold;
    if (fixedStartingGold !== null) {
        startingGold = fixedStartingGold;
    } else if (level === 1) {
        startingGold = rollStartingGold(isGygar ? 'smooth' : 'ose');
    } else {
        startingGold = calcStartingGold(progressionData.xpForCurrentLevel, wealthPct);
    }

    const baseScores = fixedScores
        ? (fixedAdjustments
            ? ABILITIES.reduce((o, a) => { o[a] = fixedScores[a] ?? 10; return o; }, {})
            : abilityScores)
        : toMap(results.map(r => ({ ability: r.ability, roll: r.originalRoll ?? r.roll })));

    return {
        results, abilityScores, baseScores,
        total: results.reduce((s, r) => s + r.modifier, 0),
        race, raceCode: getRaceInfo(race)?.code ?? 'HU',
        name, level, mode, className,
        hp: hpResult.max, hpRolls: hpResult.rolls, hpDice: hpResult.dice,
        savingThrows, attackBonus, armorClass: 10,
        xp: {
            current: progressionData.currentXP,
            forCurrentLevel: progressionData.xpForCurrentLevel,
            forNextLevel: progressionData.xpForNextLevel,
            toNextLevel: progressionData.xpToNextLevel,
            bonus: progressionData.xpBonus,
        },
        spellSlots: features.spellSlots,
        thiefSkills: features.thiefSkills,
        turnUndead: features.turnUndead,
        classAbilities, racialAbilities, startingGold,
        attempts, hpMode,
    };
}

