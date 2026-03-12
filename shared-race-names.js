/**
 * shared-race-names.js
 * Shared race name mapping for backward compatibility
 * Used by: racial-abilities.js, names-tables.js, race-adjustments.js
 */

/**
 * Legacy race name mapping for backward compatibility
 * Maps old names (without _RACE suffix) to new names (with _RACE suffix)
 */
const LEGACY_RACE_NAMES = {
    "Human": "Human_RACE",
    "Dwarf": "Dwarf_RACE",
    "Elf": "Elf_RACE",
    "Gnome": "Gnome_RACE",
    "Halfling": "Halfling_RACE"
};

/**
 * Normalize race name to use _RACE suffix
 * @param {string} raceName - The race name (with or without _RACE suffix)
 * @returns {string} The normalized race name with _RACE suffix
 */
function normalizeRaceName(raceName) {
    // If already has _RACE suffix, return as-is
    if (raceName.endsWith("_RACE")) {
        return raceName;
    }
    // Otherwise, look up in legacy names
    return LEGACY_RACE_NAMES[raceName] || raceName;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LEGACY_RACE_NAMES,
        normalizeRaceName
    };
}
