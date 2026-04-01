/**
 * shared-equipment.js
 * Equipment purchasing logic for level 1+ characters (Basic and Advanced modes)
 */
import { WEAPONS, ARMOR } from './weapons-and-armor.js';
import { CLASS_INFO } from './class-data-shared.js';

// Dungeoneering bundle — bought in this order if affordable
export const DUNGEONEERING_BUNDLE = [
  { name: "Backpack",                   cost: 5 },
  { name: "Tinder box (flint & steel)", cost: 3 },
  { name: "Torches (6)",                cost: 1 },
  { name: "Rope (50')",                 cost: 1 },
  { name: "Waterskin",                  cost: 1 },
  { name: "Crowbar",                    cost: 10 },
];

// Class-specific gear bought between Shield and dungeoneering bundle
export const CLASS_SPECIFIC_GEAR = {
  "Cleric": [{ name: "Holy symbol",    cost: 25 }],
  "Thief":  [{ name: "Thieves' tools", cost: 25 }],
};

// Weapon purchase priority per class (best/most thematic first)
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

// Armor to attempt to purchase, best to worst (Shield handled separately)
export const ARMOR_PRIORITY = ["Plate mail", "Chain mail", "Leather"];

/**
 * Purchase class-appropriate equipment with starting gold.
 * @param {string} className - e.g. "Fighter_CLASS" or "Fighter"
 * @param {number} startingGold - total gold to spend
 * @param {number} dexModifier - DEX modifier for AC calculation
 * @param {Object} background - character.background from getRandomBackground()
 * @param {string} progression - 'ose', 'smooth', or 'll' (LL prices deferred)
 * @returns {{ weapon, armor, shield, items[], startingAC, goldRemaining }}
 */
export function purchaseEquipment(className, startingGold, dexModifier, background, progression) {
  let gold = startingGold;
  const result = {
    weapon: null,
    armor: null,
    shield: false,
    items: [],
    startingAC: 10 + dexModifier,
    goldRemaining: 0
  };

  // 0. Preserve all 0-level background items
  if (background?.weapon) result.items.push(`${background.weapon} (background)`);
  if (background?.armor)  result.items.push(`${background.armor} (background)`);
  const bgItems = Array.isArray(background?.item) ? background.item : (background?.item ? [background.item] : []);
  bgItems.forEach(i => { if (i) result.items.push(i); });

  // Normalize class name
  const baseClass = className.replace(/_CLASS$/, '');
  const classInfo = CLASS_INFO[baseClass];
  if (!classInfo) { result.goldRemaining = gold; return result; }

  const allowedWeapons = new Set(classInfo.weapons || []);
  const allowedArmors  = (classInfo.armor || []).filter(a => a !== "Shield");
  const allowsShield   = (classInfo.armor || []).includes("Shield");

  // 1. WEAPON
  if (background?.weapon && allowedWeapons.has(background.weapon)) {
    result.weapon = background.weapon; // already owned, no spend
  } else {
    const priority = WEAPON_PRIORITY[baseClass] || [];
    for (const wName of priority) {
      if (allowedWeapons.has(wName) && WEAPONS[wName] && WEAPONS[wName].cost <= gold) {
        result.weapon = wName;
        gold -= WEAPONS[wName].cost;
        result.items.push(wName);
        break;
      }
    }
  }

  // 2. ARMOR (best affordable, excluding Shield)
  for (const aName of ARMOR_PRIORITY) {
    if (allowedArmors.includes(aName) && ARMOR[aName] && ARMOR[aName].cost <= gold) {
      result.armor = aName;
      gold -= ARMOR[aName].cost;
      break;
    }
  }

  // 3. SHIELD
  if (allowsShield && ARMOR["Shield"] && ARMOR["Shield"].cost <= gold) {
    result.shield = true;
    gold -= ARMOR["Shield"].cost;
  }

  // 4. Class-specific gear
  for (const { name, cost } of (CLASS_SPECIFIC_GEAR[baseClass] || [])) {
    if (cost <= gold) { result.items.push(name); gold -= cost; }
  }

  // 5. Dungeoneering bundle
  for (const { name, cost } of DUNGEONEERING_BUNDLE) {
    if (cost <= gold) { result.items.push(name); gold -= cost; }
  }

  // 6. Helmet — purchased last, after all other gear
  if (ARMOR["Helmet"] && ARMOR["Helmet"].cost <= gold) {
    result.items.push("Helmet");
    gold -= ARMOR["Helmet"].cost;
  }

  // 7. Compute AC
  const armorAC  = result.armor ? ARMOR[result.armor].ac.ascending : 10;
  const shieldAC = result.shield ? 1 : 0;
  result.startingAC    = armorAC + dexModifier + shieldAC;
  result.goldRemaining = gold;
  return result;
}
