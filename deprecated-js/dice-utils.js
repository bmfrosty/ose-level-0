// Dice rolling utilities
function roll3d6() {
    return Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
}

function roll1d4() {
    return Math.floor(Math.random() * 4) + 1;
}

function rollD12() {
    return Math.floor(Math.random() * 12) + 1;
}

function rollDice(count, sides) {
    let total = 0;
    for (let i = 0; i < count; i++) {
        total += Math.floor(Math.random() * sides) + 1;
    }
    return total;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        roll3d6,
        roll1d4,
        rollD12,
        rollDice
    };
}
