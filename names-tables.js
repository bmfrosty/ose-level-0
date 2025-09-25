// Names tables from OSE 0-Level PDF pages 3-4

const namesTables = {
    human: [
        "Beska", "Brag", "Bran", "Doram", "Dougal", "Esme", "Estra",
        "Glendor", "Grame", "Hawk", "Marga", "Morgan", "Morgo", "Ralt",
        "Rosa", "Theodor", "Thyra", "Wilberd", "Wynn", "Yor"
    ],
    dwarf: [
        "Bhargi", "Dorm", "Fimbul", "Ghandar", "Gilda", "Gorm",
        "Krago", "Magra", "Nifdel", "Smarag", "Thorgrum", "Ulfinn"
    ],
    elf: [
        "Arianwen", "Armoviel", "Atheldwen", "Glind", "Heldor",
        "Ingvalor", "Lindra", "Luna", "Mezlo", "Orlandiel", "Orthiel", "Questor"
    ],
    gnome: [
        "Blunder", "Dunkle", "Froume", "Gilligan", "Horiddle",
        "Jingred", "Loom", "Lorsum", "Nink", "Quindle", "Vex", "Viggle"
    ],
    halfling: [
        "Daisy", "Ferret", "Fink", "Gilly", "Jopher", "Largo", "Marigold",
        "Nickle", "Pendor", "Righto", "Thomwise", "Twilly"
    ]
};

// Function to roll for race (d20: 1-17=human, 18=dwarf, 19=halfling, 20=elf)
function rollRace() {
    const roll = Math.floor(Math.random() * 20) + 1;
    if (roll <= 17) return "Human";
    if (roll === 18) return "Dwarf";
    if (roll === 19) return "Halfling";
    if (roll === 20) return "Elf";
}

// Function to get a random name based on race
function getRandomName(race) {
    const raceKey = race.toLowerCase();
    const names = namesTables[raceKey];
    if (!names) return "Unknown";
    
    const roll = Math.floor(Math.random() * names.length);
    return names[roll];
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        namesTables,
        rollRace,
        getRandomName
    };
}
