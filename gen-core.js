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
 * Only four isAdvanced checks exist in the whole function (per the design):
 *   1. applyRacialAbilityModifiers  — Advanced only
 *   2. meetsRacialMinimums          — Advanced only
 *   3. calcLevel0HP Blessed check   — Advanced + Human + humanRacialAbilities
 *   4. mode string passed to getRaceAbilitiesAtLevel — no conditional needed
 */

import { WEAPONS, ARMOR, calculateModifier, rollDice,
    calculateSavingThrows, calculateAttackBonus,
    applyRacialAbilityModifiers, applyRacialSaveModifiers, meetsRacialMinimums,
    getRaceInfo, getRaceAbilitiesAtLevel, getClassProgressionData,
    getClassFeatures, getBasicModeClassAbilities, CLASS_INFO,
    rollHitPoints as rollHPLeveled, rollStartingGold, calcStartingGold,
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

export function getClassRequirements(className) {
    const base = (className || '').replace(/_CLASS$/, '');
    const classInfo = CLASS_INFO[base];
    if (!classInfo) return {};
    const demihumans = ['Dwarf', 'Elf', 'Halfling', 'Gnome'];
    const race = demihumans.includes(base) ? base : 'Human';
    return classInfo.requirements?.[race] ?? {};
}

export function getDemihumanLimits() {
    return Object.fromEntries(
        ['Dwarf', 'Elf', 'Halfling', 'Gnome'].map(c => [c, CLASS_INFO[c].maxLevel])
    );
}

// ── Equipment ─────────────────────────────────────────────────────────────────

export const DUNGEONEERING_BUNDLE = [
    { name: "Backpack",                   cost: 5 },
    { name: "Tinder box (flint & steel)", cost: 3 },
    { name: "Torches (6)",                cost: 1 },
    { name: "Rope (50')",                 cost: 1 },
    { name: "Waterskin",                  cost: 1 },
    { name: "Crowbar",                    cost: 10 },
];

export const CLASS_SPECIFIC_GEAR = {
    "Cleric": [{ name: "Holy symbol",    cost: 25 }],
    "Thief":  [{ name: "Thieves' tools", cost: 25 }],
};

export const WEAPON_PRIORITY = {
    "Fighter":    ["Sword", "Short sword", "Mace", "Hand axe", "Dagger"],
    "Dwarf":      ["Sword", "Short sword", "Mace", "Hand axe", "Dagger"],
    "Elf":        ["Sword", "Short sword", "Mace", "Hand axe", "Dagger"],
    "Gnome":      ["Sword", "Short sword", "Mace", "Hand axe", "Dagger"],
    "Halfling":   ["Sword", "Short sword", "Mace", "Hand axe", "Dagger"],
    "Spellblade": ["Sword", "Short sword", "Mace", "Hand axe", "Dagger"],
    "Cleric":     ["Mace", "War hammer", "Club", "Staff", "Sling"],
    "Magic-User": ["Dagger", "Staff"],
    "Thief":      ["Sword", "Short sword", "Dagger", "Club"],
};

export const ARMOR_PRIORITY = ["Plate mail", "Chain mail", "Leather"];

export function purchaseEquipment(className, startingGold, dexModifier, background, progression) {
    let gold = startingGold;
    const result = {
        weapon: null, armor: null, shield: false,
        items: [], startingAC: 10 + dexModifier, goldRemaining: 0
    };

    if (background?.weapon) result.items.push(`${background.weapon} (background)`);
    if (background?.armor)  result.items.push(`${background.armor} (background)`);
    const bgItems = Array.isArray(background?.item) ? background.item : (background?.item ? [background.item] : []);
    bgItems.forEach(i => { if (i) result.items.push(i); });

    const baseClass = className.replace(/_CLASS$/, '');
    const classInfo = CLASS_INFO[baseClass];
    if (!classInfo) { result.goldRemaining = gold; return result; }

    const allowedWeapons = new Set(classInfo.weapons || []);
    const allowedArmors  = (classInfo.armor || []).filter(a => a !== "Shield");
    const allowsShield   = (classInfo.armor || []).includes("Shield");

    if (background?.weapon && allowedWeapons.has(background.weapon)) {
        result.weapon = background.weapon;
    } else {
        for (const wName of (WEAPON_PRIORITY[baseClass] || [])) {
            if (allowedWeapons.has(wName) && WEAPONS[wName] && WEAPONS[wName].cost <= gold) {
                result.weapon = wName; gold -= WEAPONS[wName].cost; result.items.push(wName); break;
            }
        }
    }

    for (const aName of ARMOR_PRIORITY) {
        if (allowedArmors.includes(aName) && ARMOR[aName] && ARMOR[aName].cost <= gold) {
            result.armor = aName; gold -= ARMOR[aName].cost; break;
        }
    }

    if (allowsShield && ARMOR["Shield"] && ARMOR["Shield"].cost <= gold) {
        result.shield = true; gold -= ARMOR["Shield"].cost;
    }

    for (const { name, cost } of (CLASS_SPECIFIC_GEAR[baseClass] || [])) {
        if (cost <= gold) { result.items.push(name); gold -= cost; }
    }

    for (const { name, cost } of DUNGEONEERING_BUNDLE) {
        if (cost <= gold) { result.items.push(name); gold -= cost; }
    }

    if (ARMOR["Helmet"] && ARMOR["Helmet"].cost <= gold) {
        result.items.push("Helmet"); gold -= ARMOR["Helmet"].cost;
    }

    const armorAC  = result.armor ? ARMOR[result.armor].ac.ascending : 10;
    result.startingAC    = armorAC + dexModifier + (result.shield ? 1 : 0);
    result.goldRemaining = gold;
    return result;
}

// ── Name tables ────────────────────────────────────────────────────────────────

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

// ── Background tables ──────────────────────────────────────────────────────────

const backgroundTables = {
    1: [
        { profession: "Acolyte", item: ["Incense", "Holy symbol"], weapon: "Mace (1d6)", armor: "Unarmored" },
        { profession: "Actor", item: ["2 x Masks", "2 x Costumes"], weapon: "Stage sword (1d4)", armor: "Unarmored" },
        { profession: "Alchemist's Apprentice", item: ["Potion of Healing"], weapon: "Club (1d4)", armor: "Unarmored" },
        { profession: "Artist", item: ["Parchment", "Paint", "Brush"], weapon: "Hammer (1d4)", armor: "Unarmored" },
        { profession: "Beggar", item: ["Wooden bowl"], weapon: "Walking stick (1d4)", armor: "Unarmored" },
        { profession: "Jeweller", item: ["Ostentatious Jewellery (25gp)"], weapon: "Dagger (1d4)", armor: "Unarmored" },
        { profession: "Juggler", item: ["Juggling balls"], weapon: "3 x daggers (1d4)", armor: "Unarmored" },
        { profession: "Money Lender", item: ["50gp"], weapon: "Mace (1d6)", armor: "Unarmored" },
        { profession: "Scribe", item: ["3 x Parchment", "Ink pot", "Quill"], weapon: "Staff (1d4)", armor: "Unarmored" },
        { profession: "Trumpet Player", item: ["Trumpet"], weapon: "Rock (1d3)", armor: "Unarmored" },
        { profession: "Wealthy Heir", item: ["Signet ring", "Perfume"], weapon: "Jewelled dagger (1d4)", armor: "Unarmored" },
        { profession: "Wizard's Apprentice", item: ["Spell book (1 random cantrip)"], weapon: "Dagger (1d4)", armor: "Unarmored" }
    ],
    2: [
        { profession: "Butcher", item: ["Dried meat (5 days' iron rations)"], weapon: "2 x daggers (1d4)", armor: "Unarmored" },
        { profession: "Butler", item: ["Livery", "Silver serving tray"], weapon: "Hand axe (1d6)", armor: "Unarmored" },
        { profession: "Cook", item: ["Salt", "Skillet", "Onion"], weapon: "Dagger (1d4)", armor: "Unarmored" },
        { profession: "Fletcher", item: ["Bag of feathers"], weapon: "Shortbow (1d6) + 10 arrows", armor: "Unarmored" },
        { profession: "Gambler", item: ["Dice"], weapon: "Club (1d4)", armor: "Unarmored" },
        { profession: "Horse Thief", item: ["A horse"], weapon: "Spear (1d6)", armor: "Unarmored" },
        { profession: "Innkeeper", item: ["3 x Bottles of wine"], weapon: "Crossbow (1d6) + 10 bolts", armor: "Unarmored" },
        { profession: "Navigator", item: ["Compass", "Parchment", "Chalk"], weapon: "Crossbow (1d6) + 10 bolts", armor: "Unarmored" },
        { profession: "Shepherd", item: ["Pole (10' long, wooden)"], weapon: "Sling (1d4) + 10 stones", armor: "Unarmored" },
        { profession: "Tailor", item: ["Needle", "Thread", "Bag of buttons"], weapon: "Scissors (1d4)", armor: "Unarmored" },
        { profession: "Trader", item: ["Rare, fragrant spices"], weapon: "Crossbow (1d6) + 10 bolts", armor: "Unarmored" },
        { profession: "Weaver", item: ["Hand Loom", "Yarn"], weapon: "Scissors (1d3)", armor: "Unarmored" }
    ],
    3: [
        { profession: "Bowyer", item: ["Saw"], weapon: "Longbow (1d6) + 10 arrows", armor: "Unarmored" },
        { profession: "Cooper", item: ["Barrel"], weapon: "Hammer (1d4)", armor: "Unarmored" },
        { profession: "Executioner", item: ["50' Rope"], weapon: "Battle axe (1d8)", armor: "Unarmored" },
        { profession: "Fisher", item: ["Net"], weapon: "Spear (1d6)", armor: "Unarmored" },
        { profession: "Groom", item: ["Brush"], weapon: "Pitchfork (1d6)", armor: "Unarmored" },
        { profession: "Hermit", item: ["Spell book (1 random cantrip)"], weapon: "Staff (1d4)", armor: "Unarmored" },
        { profession: "Kennel Master", item: ["A dog"], weapon: "Staff (1d4)", armor: "Unarmored" },
        { profession: "Leatherworker", item: ["A bearskin"], weapon: "Awl (1d4)", armor: "Unarmored" },
        { profession: "Limner", item: ["Lantern", "2 x Oil flasks", "Paint"], weapon: "Staff (1d4)", armor: "Unarmored" },
        { profession: "Sailor", item: ["Bottle of rum", "50' Rope"], weapon: "Belaying pin (1d4)", armor: "Unarmored" },
        { profession: "Teamster", item: ["50' Rope"], weapon: "Whip (1d2, hits entangle)", armor: "Unarmored" },
        { profession: "Trapper", item: ["Bear trap (1d6)"], weapon: "Club (1d4)", armor: "Unarmored" }
    ],
    4: [
        { profession: "Armourer", item: ["Chain mail"], weapon: "War hammer (1d6)", armor: "Chain Mail" },
        { profession: "Barber Surgeon", item: ["Bottle of strong spirits"], weapon: "Razor (1d4)", armor: "Unarmored" },
        { profession: "Blacksmith", item: ["Tongs", "Apron"], weapon: "War hammer (1d6)", armor: "Unarmored" },
        { profession: "Carpenter", item: ["Saw"], weapon: "Hand axe (1d6)", armor: "Unarmored" },
        { profession: "Farmer", item: ["A pig"], weapon: "Pitchfork (1d6)", armor: "Unarmored" },
        { profession: "Forester", item: ["Tent"], weapon: "Shortbow (1d6) + 10 arrows", armor: "Unarmored" },
        { profession: "Hunter", item: ["Whistle"], weapon: "Longbow (1d6) + 10 arrows", armor: "Unarmored" },
        { profession: "Mason", item: ["A bag of rocks"], weapon: "Rock (1d4)", armor: "Unarmored" },
        { profession: "Miner", item: ["Lantern", "2 x Oil flasks"], weapon: "Pick axe (1d6)", armor: "Unarmored" },
        { profession: "Shipwright", item: ["Pot of tar"], weapon: "Hand axe (1d6)", armor: "Unarmored" },
        { profession: "Squire", item: ["Pole (10' long, wooden)", "Flag"], weapon: "Shortsword (1d6)", armor: "Unarmored" },
        { profession: "Weaponsmith", item: ["Tongs", "Apron"], weapon: "Sword (1d8)", armor: "Unarmored" }
    ]
};

export function getRandomBackground(hitPoints) {
    const hpForOccupation = Math.min(Math.max(hitPoints, 1), 4);
    const table = backgroundTables[hpForOccupation];
    if (!table) {
        console.warn(`No background table found for HP: ${hpForOccupation}`);
        return { profession: 'Unknown', item: ['None'], weapon: 'Club (1d4)', armor: 'Unarmored' };
    }
    return table[Math.floor(Math.random() * 12)];
}

export function getBackgroundByIndex(hitPoints, index) {
    const hpForOccupation = Math.min(Math.max(hitPoints, 1), 4);
    const table = backgroundTables[hpForOccupation];
    if (!table || index < 0 || index >= table.length) {
        return { profession: 'Unknown', item: ['None'], weapon: 'Club (1d4)', armor: 'Unarmored' };
    }
    return table[index];
}

export function getBackgroundTable(hitPoints) {
    return backgroundTables[Math.min(Math.max(hitPoints, 1), 4)] || [];
}

export function getAllBackgroundTables() {
    return backgroundTables;
}

export function getBackgroundByProfession(profession) {
    for (const hp of [1, 2, 3, 4]) {
        const found = backgroundTables[hp].find(bg => bg.profession === profession);
        if (found) return found;
    }
    return null;
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

function calcLevel0HP(conModifier, race, isAdvanced, humanRacialAbilities, hpMode) {
    const d4 = () => Math.floor(Math.random() * 4) + 1;
    const blessed = hpMode === 1 || (race === 'Human_RACE' && isAdvanced && humanRacialAbilities);
    let roll;
    if (blessed)           { roll = Math.max(d4(), d4()); }
    else if (hpMode === 3) { do { roll = d4(); } while (roll <= 2); }
    else                   { roll = d4(); }
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
            hp0 = calcLevel0HP(conMod, race, isAdvanced, humanRacialAbilities, hpMode);
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
                const adjMap = toMap(adj);
                if (Object.entries(reqs).some(([ab, min]) => (adjMap[ab] ?? 0) < min)) continue;
            }

            if (!passesFilters(adj, { minimums, primeReqMode })) continue;

            if (level === 0) {
                const conMod = adj.find(r => r.ability === 'CON').modifier;
                hp0 = calcLevel0HP(conMod, race, isAdvanced, humanRacialAbilities, hpMode);
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

export const generateZeroLevelCharacter = opts =>
    generateCharacter({ ...opts, level: 0 });
