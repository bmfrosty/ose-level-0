/**
 * Weapons and Armor Data
 * 
 * Data extracted from OSE SRD: https://oldschoolessentials.necroticgnome.com/srd/index.php/Weapons_And_Armour
 */

// Weapon data
export const WEAPONS = {
  "Battle axe": {
    cost: 7,
    weight: 50,
    damage: "1d8",
    qualities: ["Melee", "Slow", "Two-handed"]
  },
  "Club": {
    cost: 3,
    weight: 50,
    damage: "1d4",
    qualities: ["Blunt", "Melee"]
  },
  "Crossbow": {
    cost: 30,
    weight: 50,
    damage: "1d6",
    qualities: ["Missile", "Reload", "Slow", "Two-handed"],
    ranges: { short: 80, medium: 160, long: 240 }
  },
  "Dagger": {
    cost: 3,
    weight: 10,
    damage: "1d4",
    qualities: ["Melee", "Missile"],
    ranges: { short: 10, medium: 20, long: 30 }
  },
  "Hand axe": {
    cost: 4,
    weight: 30,
    damage: "1d6",
    qualities: ["Melee", "Missile"],
    ranges: { short: 10, medium: 20, long: 30 }
  },
  "Holy water (vial)": {
    cost: 25,
    weight: 0,
    damage: "1d8",
    qualities: ["Missile", "Splash weapon"],
    ranges: { short: 10, medium: 30, long: 50 }
  },
  "Javelin": {
    cost: 1,
    weight: 20,
    damage: "1d4",
    qualities: ["Missile"],
    ranges: { short: 30, medium: 60, long: 90 }
  },
  "Lance": {
    cost: 5,
    weight: 120,
    damage: "1d6",
    qualities: ["Charge", "Melee"]
  },
  "Long bow": {
    cost: 40,
    weight: 30,
    damage: "1d6",
    qualities: ["Missile", "Two-handed"],
    ranges: { short: 70, medium: 140, long: 210 }
  },
  "Mace": {
    cost: 5,
    weight: 30,
    damage: "1d6",
    qualities: ["Blunt", "Melee"]
  },
  "Oil (flask), burning": {
    cost: 2,
    weight: 0,
    damage: "1d8",
    qualities: ["Missile", "Splash weapon"],
    ranges: { short: 10, medium: 30, long: 50 }
  },
  "Pole arm": {
    cost: 7,
    weight: 150,
    damage: "1d10",
    qualities: ["Brace", "Melee", "Slow", "Two-handed"]
  },
  "Short bow": {
    cost: 25,
    weight: 30,
    damage: "1d6",
    qualities: ["Missile", "Two-handed"],
    ranges: { short: 50, medium: 100, long: 150 }
  },
  "Short sword": {
    cost: 7,
    weight: 30,
    damage: "1d6",
    qualities: ["Melee"]
  },
  "Silver dagger": {
    cost: 30,
    weight: 10,
    damage: "1d4",
    qualities: ["Melee", "Missile"],
    ranges: { short: 10, medium: 20, long: 30 }
  },
  "Sling": {
    cost: 2,
    weight: 20,
    damage: "1d4",
    qualities: ["Blunt", "Missile"],
    ranges: { short: 40, medium: 80, long: 160 }
  },
  "Spear": {
    cost: 3,
    weight: 30,
    damage: "1d6",
    qualities: ["Brace", "Melee", "Missile"],
    ranges: { short: 20, medium: 40, long: 60 }
  },
  "Staff": {
    cost: 2,
    weight: 40,
    damage: "1d4",
    qualities: ["Blunt", "Melee", "Two-handed"]
  },
  "Sword": {
    cost: 10,
    weight: 60,
    damage: "1d8",
    qualities: ["Melee"]
  },
  "Torch": {
    cost: 1,
    weight: 0,
    damage: "1d4",
    qualities: ["Melee"]
  },
  "Two-handed sword": {
    cost: 15,
    weight: 150,
    damage: "1d10",
    qualities: ["Melee", "Slow", "Two-handed"]
  },
  "War hammer": {
    cost: 5,
    weight: 30,
    damage: "1d6",
    qualities: ["Blunt", "Melee"]
  }
};

// Ammunition
export const AMMUNITION = {
  "Crossbow bolts (case of 30)": { cost: 10, weight: 0 },
  "Arrows (quiver of 20)": { cost: 5, weight: 0 },
  "Silver tipped arrow (1)": { cost: 5, weight: 0 },
  "Sling stones": { cost: 0, weight: 0 }
};

// Armor data
export const ARMOR = {
  "Unarmoured": {
    ac: { descending: 9, ascending: 10 },
    cost: 0,
    weight: 0
  },
  "Leather": {
    ac: { descending: 7, ascending: 12 },
    cost: 20,
    weight: 200
  },
  "Chain mail": {
    ac: { descending: 5, ascending: 14 },
    cost: 40,
    weight: 400
  },
  "Plate mail": {
    ac: { descending: 3, ascending: 16 },
    cost: 60,
    weight: 500
  },
  "Shield": {
    ac: { descending: -1, ascending: 1 },
    cost: 10,
    weight: 100
  }
};

// Weapon quality descriptions
export const WEAPON_QUALITIES = {
  "Blunt": "May be used by clerics",
  "Brace": "When bracing against a charge, inflicts double damage",
  "Charge": "On horseback, moving at least 60' in a round and attacking inflicts double damage",
  "Melee": "Close quarters weapon",
  "Missile": "Thrown or fired weapon",
  "Reload": "Requires a round to reload between shots",
  "Slow": "The wielder acts last in each combat round",
  "Splash weapon": "On a successful hit, splashes all targets within 5'",
  "Two-handed": "Requires both hands; cannot be used with a shield"
};

// Helper function to get all weapon names
export function getAllWeaponNames() {
  return Object.keys(WEAPONS);
}

// Helper function to get all armor names
export function getAllArmorNames() {
  return Object.keys(ARMOR);
}

// Helper function to get weapons by quality
export function getWeaponsByQuality(quality) {
  return Object.entries(WEAPONS)
    .filter(([name, data]) => data.qualities.includes(quality))
    .map(([name]) => name);
}

// Helper function to get blunt weapons (for clerics)
export function getBluntWeapons() {
  return getWeaponsByQuality("Blunt");
}

// Helper function to get melee weapons
export function getMeleeWeapons() {
  return getWeaponsByQuality("Melee");
}

// Helper function to get missile weapons
export function getMissileWeapons() {
  return getWeaponsByQuality("Missile");
}

// Helper function to get two-handed weapons
export function getTwoHandedWeapons() {
  return getWeaponsByQuality("Two-handed");
}

// Helper function to check if a weapon has a quality
export function weaponHasQuality(weaponName, quality) {
  const weapon = WEAPONS[weaponName];
  return weapon ? weapon.qualities.includes(quality) : false;
}

// Helper function to get weapon data
export function getWeaponData(weaponName) {
  return WEAPONS[weaponName] || null;
}

// Helper function to get armor data
export function getArmorData(armorName) {
  return ARMOR[armorName] || null;
}

// Export all for use in other modules
export default {
  WEAPONS,
  AMMUNITION,
  ARMOR,
  WEAPON_QUALITIES,
  getAllWeaponNames,
  getAllArmorNames,
  getWeaponsByQuality,
  getBluntWeapons,
  getMeleeWeapons,
  getMissileWeapons,
  getTwoHandedWeapons,
  weaponHasQuality,
  getWeaponData,
  getArmorData
};
