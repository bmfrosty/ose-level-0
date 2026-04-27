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
    checkRacialMinimums, getClassRequirements, getPrimeRequisites,
    CLS_CODE, RACE_CODE, RCM_CODE, PROG_CODE,
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
const DEMIHUMANS = ['Dwarf_RACE', 'Elf_RACE', 'Gnome_RACE', 'Halfling_RACE'];

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

function toMap(results) {
    const m = {};
    results.forEach(r => { m[r.ability] = r.roll; });
    return m;
}

// ── Generator ─────────────────────────────────────────────────────────────────

/**
 * Generate a character and return a partial v3 compact-params object.
 * Display-only fields (un, qr, ao, adm) are NOT included — the caller adds them.
 *
 * v3 score semantics:
 *   s[i]  = raw rolled score (pre-racial, immutable referee record)
 *   racial adjustments are derived at render time from r
 *   sa[i] = extra adjustments beyond racial (omitted when all zero)
 *   displayed = s[i] + racial[i] + sa[i]
 *
 * fixedAdjustments, when present, is the TOTAL delta from the rolled score
 * (racial already included), so sa[i] = fixedAdjustments[i] - racialMods[i].
 */
export function generateCharacterV3(opts = {}) {
    const {
        mode = 'basic', level = 0, race: rawRace = '', className = null,
        progressionMode = 'ose', raceClassMode = 'strict',
        minimums = {}, primeReqMode = 'user', hpMode = 0,
        includeLevel0HP = false, fixedScores = null, fixedName = '',
        fixedOccupation = null, fixedStartingGold = null,
        fixedAdjustments = null, wealthPct = 100, fixedHPRolls = null,
        noLevel0Equipment = false, classData = null,
    } = opts;

    const isAdvanced = mode === 'advanced';
    const isSmoothprog = progressionMode === 'smoothprog';
    const humanRacialAbilities = raceClassMode !== 'strict';

    const staticRace = (level >= 1 && !isAdvanced && className)
        ? raceFromBasicClass(className)
        : null;

    // ── Log settings and effective minimums (before rolling) ─────────────────
    {
        const _logRace = staticRace
            ?? (rawRace && rawRace !== 'Demihuman_RACE' ? (rawRace.endsWith('_RACE') ? rawRace : `${rawRace}_RACE`) : '(random)');
        const _eff = { ...minimums };
        if (isAdvanced && _logRace !== '(random)') {
            Object.entries(getRaceInfo(_logRace)?.minimums ?? {}).forEach(([a, v]) => {
                _eff[a] = Math.max(_eff[a] ?? 0, v);
            });
        }
        if (level >= 1 && isAdvanced && className && _logRace !== '(random)') {
            const _reqs = CLASS_INFO[className.replace('_CLASS', '')]?.requirements?.[_logRace.replace('_RACE', '')] ?? {};
            Object.entries(_reqs).forEach(([a, v]) => { _eff[a] = Math.max(_eff[a] ?? 0, v); });
        }
        if ((primeReqMode === '9' || primeReqMode === '13') && className) {
            const _t = parseInt(primeReqMode);
            getPrimeRequisites(className).forEach(a => { _eff[a] = Math.max(_eff[a] ?? 0, _t); });
        }
        const _row = src => ABILITIES.map(a => `${a}:${src[a] ?? 3}`).join('  ');
        console.log(`[gen] race: ${_logRace} | class: ${className ?? '(none)'} | primeReqMode: ${primeReqMode}`);
        console.log(`[gen] eff.minimums  ${_row(_eff)}`);
    }

    // ── Roll loop ──────────────────────────────────────────────────────────────

    let rawArr, race, hp0, attempts = 0;

    if (fixedScores) {
        race   = staticRace ?? pickRace(rawRace);
        rawArr = ABILITIES.map(a => fixedScores[a] ?? 10);
        attempts = 1;
        console.log(`[gen] attempt 1: ${ABILITIES.map((a, i) => `${a}:${rawArr[i]}`).join('  ')} → fixed scores`);
    } else {
        for (;;) {
            attempts++;
            const raw = rollAbilityScores();
            race = staticRace ?? pickRace(rawRace);
            const _s = () => raw.map(r => `${r.ability}:${r.roll}`).join('  ');

            if (isAdvanced && !meetsRacialMinimums(raw, race, true)) {
                console.log(`[gen] attempt ${attempts}: ${_s()} → ✗ racial minimums`);
                continue;
            }

            if (level >= 1 && isAdvanced && className) {
                const bareClass = className.replace('_CLASS', '');
                const bareRace  = race.replace('_RACE', '');
                const reqs = CLASS_INFO[bareClass]?.requirements?.[bareRace] ?? {};
                const rawMap = toMap(raw);
                if (Object.entries(reqs).some(([ab, min]) => (rawMap[ab] ?? 0) < min)) {
                    console.log(`[gen] attempt ${attempts}: ${_s()} → ✗ class requirements`);
                    continue;
                }
            }

            if (!passesFilters(raw, { minimums, primeReqMode })) {
                console.log(`[gen] attempt ${attempts}: ${_s()} → ✗ filters`);
                continue;
            }

            if (level === 0) {
                // CON mod comes from racial-adjusted scores for HP purposes
                const adjRaw = applyRacialAbilityModifiers(raw, race, isAdvanced, humanRacialAbilities);
                if (fixedAdjustments) {
                    const adjCon = Math.max(3, Math.min(18, raw.find(r => r.ability === 'CON').roll + (fixedAdjustments.CON ?? 0)));
                    hp0 = calcLevel0HP(calculateModifier(adjCon), hpMode);
                } else {
                    hp0 = calcLevel0HP(adjRaw.find(r => r.ability === 'CON').modifier, hpMode);
                }
                if (hp0.total < 1) {
                    console.log(`[gen] attempt ${attempts}: ${_s()} → ✗ HP < 1`);
                    continue;
                }
            }

            console.log(`[gen] attempt ${attempts}: ${_s()} → ✓ accepted`);
            rawArr = raw.map(r => r.roll);
            break;
        }
    }

    // ── Derive adjusted scores (used internally for HP/progression) ────────────

    const racialMods = isAdvanced
        ? { ...(getRaceInfo(race)?.abilityModifiers ?? {}) }
        : {};
    if (isAdvanced && race === 'Human_RACE' && !humanRacialAbilities) {
        Object.keys(racialMods).forEach(k => { racialMods[k] = 0; });
    }

    const adjArr = ABILITIES.map((a, i) => {
        const base = rawArr[i];
        if (fixedAdjustments) return Math.max(3, Math.min(18, base + (fixedAdjustments[a] ?? 0)));
        return Math.max(3, Math.min(18, base + (racialMods[a] ?? 0)));
    });

    const conMod = calculateModifier(adjArr[ABILITIES.indexOf('CON')]);

    // ── Level 0 HP (fixed-scores path) ───────────────────────────────────────

    if (fixedScores && level === 0) {
        hp0 = calcLevel0HP(conMod, hpMode);
        if (hp0.total < 1) hp0 = { roll: hp0.roll, total: 1 };
    }

    // ── sa (post-gen adjustments beyond racial) ────────────────────────────────

    let saArr = null;
    if (fixedAdjustments && Object.values(fixedAdjustments).some(v => v !== 0)) {
        const sa = ABILITIES.map(a => (fixedAdjustments[a] ?? 0) - (racialMods[a] ?? 0));
        if (sa.some(v => v !== 0)) saArr = sa;
    }

    // ── Common cp fields ──────────────────────────────────────────────────────

    const raceCode = getRaceInfo(race)?.code ?? 'HU';
    const mCode    = isAdvanced ? 'A' : 'B';
    const pCode    = PROG_CODE[progressionMode] ?? 'O';
    const rcmCode  = RCM_CODE[raceClassMode]  ?? 'ST';

    const raceStem = race.replace('_RACE', '');
    const raceCap  = raceStem.charAt(0).toUpperCase() + raceStem.slice(1).toLowerCase();
    const name     = fixedName || getRandomName(raceCap);

    // ── Level 0 ───────────────────────────────────────────────────────────────

    if (level === 0) {
        const background = fixedOccupation
            ? (getBackgroundByProfession(fixedOccupation) || getRandomBackground(hp0.total))
            : getRandomBackground(hp0.total);
        const startingGold = fixedStartingGold !== null ? fixedStartingGold : rollDice(3, 6);
        return {
            v: 3, m: mCode, p: pCode, r: raceCode, l: 0,
            s: rawArr, ...(saArr ? { sa: saArr } : {}),
            h: hp0.total, hr: [hp0.roll],
            n: name, bg: background?.profession ?? '',
            g: startingGold, rr: attempts,
            rcm: rcmCode,
            ...(noLevel0Equipment ? { nl0: 1 } : {}),
        };
    }

    // ── Level 1+ ─────────────────────────────────────────────────────────────

    if (!classData) throw new Error('generateCharacterV3: classData required for level >= 1');

    const hpResult = rollHPLeveled({
        className, level, conModifier: conMod, classData,
        includeLevel0HP, hpMode, fixedRolls: fixedHPRolls,
    });

    const background = fixedOccupation
        ? (getBackgroundByProfession(fixedOccupation) || getRandomBackground(hpResult.backgroundHP))
        : getRandomBackground(hpResult.backgroundHP);

    const adjScores = Object.fromEntries(ABILITIES.map((a, i) => [a, adjArr[i]]));
    const progressionData = getClassProgressionData({ className, level, abilityScores: adjScores, classData });

    let startingGold;
    if (fixedStartingGold !== null)   { startingGold = fixedStartingGold; }
    else if (level === 1)              { startingGold = rollStartingGold(isSmoothprog ? 'smoothprog' : 'ose'); }
    else                               { startingGold = calcStartingGold(progressionData.xpForCurrentLevel, wealthPct); }

    const clsCode = CLS_CODE[className] ?? 'FI';

    return {
        v: 3, m: mCode, p: pCode, r: raceCode, c: clsCode, l: level,
        s: rawArr, ...(saArr ? { sa: saArr } : {}),
        h: hpResult.max, hr: hpResult.rolls,
        il: includeLevel0HP ? 1 : 0,
        n: name, bg: background?.profession ?? '',
        g: startingGold, rr: attempts,
        rcm: rcmCode,
        ...(noLevel0Equipment ? { nl0: 1 } : {}),
        ...(hpMode > 0 ? { hm: hpMode } : {}),
    };
}

