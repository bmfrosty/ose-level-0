/**
 * gen-names.js
 * 
 * Shared name generation for all character generators.
 * Contains name tables for all races and provides random name generation.
 * 
 * Based on OSE 0-Level PDF pages 3-4
 */

// ============================================================================
// NAME TABLES
// ============================================================================

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

// ============================================================================
// EXPORTED FUNCTIONS
// ============================================================================

/**
 * Get a random name for a given race
 * @param {string} race - The race name (Human, Dwarf, Elf, Gnome, Halfling)
 * @returns {string} A random name from the race's name table
 */
export function getRandomName(race) {
    // Normalize race name to lowercase for lookup
    const raceKey = race.toLowerCase();
    const names = namesTables[raceKey];
    
    if (!names) {
        console.warn(`No name table found for race: ${race}`);
        return "Unknown";
    }
    
    const roll = Math.floor(Math.random() * names.length);
    return names[roll];
}

/**
 * Get the name table for a specific race
 * @param {string} race - The race name (Human, Dwarf, Elf, Gnome, Halfling)
 * @returns {string[]} Array of names for the race
 */
export function getNameTable(race) {
    const raceKey = race.toLowerCase();
    return namesTables[raceKey] || [];
}

/**
 * Get all available race names that have name tables
 * @returns {string[]} Array of race names
 */
export function getAvailableRaces() {
    return Object.keys(namesTables).map(race => 
        race.charAt(0).toUpperCase() + race.slice(1)
    );
}
