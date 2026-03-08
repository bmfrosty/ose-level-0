// Names tables from OSE 0-Level PDF pages 3-4

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

// Function to roll for race (1-in-4 chance of demihuman, or forced demihuman, or forced specific race)
function rollRace() {
    // Check if force specific race is selected (browser only)
    const forceRaceSelect = typeof document !== 'undefined' ? document.getElementById('forceRace') : null;
    const forceRace = forceRaceSelect ? forceRaceSelect.value : '';
    
    // If a specific race is forced, return it
    if (forceRace) {
        return forceRace;
    }
    
    // Check if force demihuman checkbox is checked (browser only)
    const forceDemihumanCheckbox = typeof document !== 'undefined' ? document.getElementById('forceDemihuman') : null;
    const forceDemihuman = forceDemihumanCheckbox ? forceDemihumanCheckbox.checked : false;
    
    const roll = Math.floor(Math.random() * 4) + 1;
    if (roll === 1 || forceDemihuman) {
        // Roll 1d4 for demihuman type
        const demihumanRoll = Math.floor(Math.random() * 4) + 1;
        if (demihumanRoll === 1) return "Dwarf";
        if (demihumanRoll === 2) return "Elf";
        if (demihumanRoll === 3) return "Gnome";
        if (demihumanRoll === 4) return "Halfling";
    }
    return "Human";
}

// Function to check if race is demihuman
function isDemihuman(race) {
    return race === "Dwarf" || race === "Elf" || race === "Gnome" || race === "Halfling";
}

// Function to get racial abilities text (returns array of lines)
function getRacialAbilities(race) {
    // Check if Advanced mode is enabled
    let isAdvanced = false;
    let humanRacialAbilities = false;
    
    if (typeof document !== 'undefined') {
        // Browser: check checkboxes
        const advancedCheckbox = document.getElementById('advanced');
        const humanAbilitiesCheckbox = document.getElementById('humanRacialAbilities');
        isAdvanced = advancedCheckbox ? advancedCheckbox.checked : false;
        humanRacialAbilities = humanAbilitiesCheckbox ? humanAbilitiesCheckbox.checked : false;
    } else if (typeof process !== 'undefined' && process.env) {
        // Node.js: check environment variables
        isAdvanced = process.env.ADVANCED === 'true';
        humanRacialAbilities = process.env.HUMAN_RACIAL_ABILITIES === 'true';
    }
    
    const abilities = {
        "Human": (isAdvanced && humanRacialAbilities) ? [
            "Roll HP twice, take best.",
            "Act first on tied initiative.",
            "Retainers/mercenaries +1 loyalty/morale."
        ] : [],
        "Dwarf": [
            "Speak additional native languages.",
            "2-in-6 chance of hearing noises at doors.",
            "Infravision to 60'.",
            "2-in-6 chance of detecting room traps."
        ],
        "Elf": [
            "Speak additional native languages.",
            "2-in-6 chance of hearing noises at doors.",
            "Infravision to 60'.",
            "Immunity to ghoul paralysis."
        ],
        "Gnome": [
            "Speak additional native languages.",
            "2-in-6 chance of hearing noises at doors.",
            "Infravision to 90'.",
            "+2 AC vs large opponents."
        ],
        "Halfling": [
            "Speak additional native languages.",
            "2-in-6 chance of hearing noises at doors.",
            "+1 to missile attack rolls.",
            "+2 AC vs large opponents."
        ]
    };
    return abilities[race] || [];
}

// Legacy function for backward compatibility
function getCommonDemihumanAbilities() {
    return "All demihumans speak additional native languages and have a 2-in-6 chance of hearing noises when listening at a door.";
}

// Function to get a random name based on race
function getRandomName(race) {
    const raceKey = race.toLowerCase();
    const names = namesTables[raceKey];
    if (!names) return "Unknown";
    
    const roll = Math.floor(Math.random() * names.length);
    return names[roll];
}

// Saving throw tables for level 0 characters
// Same values for both Normal and Gygar modes at level 0
const savingThrowsLevel0 = {
    Death: 14,
    Wands: 15,
    Paralysis: 16,
    Breath: 17,
    Spells: 18
};

// Attack bonus tables for level 0 characters
// Different values for Normal vs Gygar mode
const attackBonusLevel0 = {
    Normal: -1,  // Penalty for untrained characters
    Gygar: 0     // No penalty in Gygar Mode (Castle Gygar house rules)
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        namesTables,
        rollRace,
        getRandomName,
        getRacialAbilities,
        isDemihuman,
        getCommonDemihumanAbilities,
        savingThrowsLevel0,
        attackBonusLevel0
    };
}
