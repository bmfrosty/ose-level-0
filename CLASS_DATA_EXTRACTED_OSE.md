# Extracted Class Data - OSE Standard

This document contains structured data extracted from OSE class markdown files for use in Phase 5 (JavaScript implementation).

## OSE Cleric

### Basic Info
- **Requirements:** None
- **Prime Requisite:** WIS
- **Hit Dice:** 1d6
- **Maximum Level:** 14
- **Armor:** Any, including shields
- **Weapons:** Blunt weapons only (club, mace, sling, staff, war hammer)
- **Languages:** Alignment, Common

### XP Requirements by Level
```javascript
{
  1: 0,
  2: 1500,
  3: 3000,
  4: 6000,
  5: 12000,
  6: 25000,
  7: 50000,
  8: 100000,
  9: 200000,
  10: 300000,
  11: 400000,
  12: 500000,
  13: 600000,
  14: 700000
}
```

### Hit Dice by Level
```javascript
{
  1: "1d6",
  2: "2d6",
  3: "3d6",
  4: "4d6",
  5: "5d6",
  6: "6d6",
  7: "7d6",
  8: "8d6",
  9: "9d6",
  10: "9d6+1", // CON no longer applies
  11: "9d6+2", // CON no longer applies
  12: "9d6+3", // CON no longer applies
  13: "9d6+4", // CON no longer applies
  14: "9d6+5"  // CON no longer applies
}
```

### THAC0 / Attack Bonus by Level
```javascript
{
  1: { thac0: 19, bonus: 0 },
  2: { thac0: 19, bonus: 0 },
  3: { thac0: 19, bonus: 0 },
  4: { thac0: 19, bonus: 0 },
  5: { thac0: 17, bonus: 2 },
  6: { thac0: 17, bonus: 2 },
  7: { thac0: 17, bonus: 2 },
  8: { thac0: 17, bonus: 2 },
  9: { thac0: 14, bonus: 5 },
  10: { thac0: 14, bonus: 5 },
  11: { thac0: 14, bonus: 5 },
  12: { thac0: 14, bonus: 5 },
  13: { thac0: 12, bonus: 7 },
  14: { thac0: 12, bonus: 7 }
}
```

### Saving Throws by Level
```javascript
{
  1: { death: 11, wands: 12, paralysis: 14, breath: 16, spells: 15 },
  2: { death: 11, wands: 12, paralysis: 14, breath: 16, spells: 15 },
  3: { death: 11, wands: 12, paralysis: 14, breath: 16, spells: 15 },
  4: { death: 11, wands: 12, paralysis: 14, breath: 16, spells: 15 },
  5: { death: 9, wands: 10, paralysis: 12, breath: 14, spells: 12 },
  6: { death: 9, wands: 10, paralysis: 12, breath: 14, spells: 12 },
  7: { death: 9, wands: 10, paralysis: 12, breath: 14, spells: 12 },
  8: { death: 9, wands: 10, paralysis: 12, breath: 14, spells: 12 },
  9: { death: 6, wands: 7, paralysis: 9, breath: 11, spells: 9 },
  10: { death: 6, wands: 7, paralysis: 9, breath: 11, spells: 9 },
  11: { death: 6, wands: 7, paralysis: 9, breath: 11, spells: 9 },
  12: { death: 6, wands: 7, paralysis: 9, breath: 11, spells: 9 },
  13: { death: 3, wands: 5, paralysis: 7, breath: 8, spells: 7 },
  14: { death: 3, wands: 5, paralysis: 7, breath: 8, spells: 7 }
}
```

### Spell Slots by Level
```javascript
{
  1: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  2: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0 },
  3: { 1: 2, 2: 0, 3: 0, 4: 0, 5: 0 },
  4: { 1: 2, 2: 1, 3: 0, 4: 0, 5: 0 },
  5: { 1: 2, 2: 2, 3: 0, 4: 0, 5: 0 },
  6: { 1: 2, 2: 2, 3: 1, 4: 1, 5: 0 },
  7: { 1: 2, 2: 2, 3: 2, 4: 1, 5: 1 },
  8: { 1: 3, 2: 3, 3: 2, 4: 2, 5: 1 },
  9: { 1: 3, 2: 3, 3: 3, 4: 2, 5: 2 },
  10: { 1: 4, 2: 4, 3: 3, 4: 3, 5: 2 },
  11: { 1: 4, 2: 4, 3: 4, 4: 3, 5: 3 },
  12: { 1: 5, 2: 5, 3: 4, 4: 4, 5: 3 },
  13: { 1: 5, 2: 5, 3: 5, 4: 4, 5: 4 },
  14: { 1: 6, 2: 5, 3: 5, 4: 5, 5: 4 }
}
```

### Class Abilities
- **Turn Undead:** Available at level 1
- **Divine Magic:** Spell casting from level 2
- **Holy Symbol:** Required for spell casting
- **Magical Research:** Available at any level
- **Magic Item Creation:** Available from level 9
- **Stronghold:** Can construct at level 9 (costs halved if in deity's favor)
- **Followers:** 5d6×10 fighters (level 1-2) arrive when stronghold complete

### Turn Undead Table
```javascript
{
  1: { "1HD": 7, "2HD": 9, "2*HD": 11, "3HD": null, "4HD": null, "5HD": null, "6HD": null, "7-9HD": null },
  2: { "1HD": "T", "2HD": 7, "2*HD": 9, "3HD": 11, "4HD": null, "5HD": null, "6HD": null, "7-9HD": null },
  3: { "1HD": "T", "2HD": "T", "2*HD": 7, "3HD": 9, "4HD": 11, "5HD": null, "6HD": null, "7-9HD": null },
  4: { "1HD": "D", "2HD": "T", "2*HD": "T", "3HD": 7, "4HD": 9, "5HD": 11, "6HD": null, "7-9HD": null },
  5: { "1HD": "D", "2HD": "D", "2*HD": "T", "3HD": "T", "4HD": 7, "5HD": 9, "6HD": 11, "7-9HD": null },
  6: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "T", "4HD": "T", "5HD": 7, "6HD": 9, "7-9HD": 11 },
  7: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "D", "4HD": "T", "5HD": "T", "6HD": 7, "7-9HD": 9 },
  8: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "D", "4HD": "D", "5HD": "T", "6HD": "T", "7-9HD": 7 },
  9: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "D", "4HD": "D", "5HD": "D", "6HD": "T", "7-9HD": "T" },
  10: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "D", "4HD": "D", "5HD": "D", "6HD": "D", "7-9HD": "T" },
  11: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "D", "4HD": "D", "5HD": "D", "6HD": "D", "7-9HD": "D" },
  12: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "D", "4HD": "D", "5HD": "D", "6HD": "D", "7-9HD": "D" },
  13: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "D", "4HD": "D", "5HD": "D", "6HD": "D", "7-9HD": "D" },
  14: { "1HD": "D", "2HD": "D", "2*HD": "D", "3HD": "D", "4HD": "D", "5HD": "D", "6HD": "D", "7-9HD": "D" }
}
```

**Turn Results:**
- **null:** Turning fails
- **Number:** 2d6 roll must be >= this number
- **"T":** Turning succeeds automatically
- **"D":** Turning succeeds and destroys undead

---

## OSE Thief

### Basic Info
- **Requirements:** None
- **Prime Requisite:** DEX
- **Hit Dice:** 1d4
- **Maximum Level:** 14
- **Armor:** Leather only, no shields
- **Weapons:** Any
- **Languages:** Alignment, Common

### XP Requirements by Level
```javascript
{
  1: 0,
  2: 1200,
  3: 2400,
  4: 4800,
  5: 9600,
  6: 20000,
  7: 40000,
  8: 80000,
  9: 160000,
  10: 280000,
  11: 400000,
  12: 520000,
  13: 640000,
  14: 760000
}
```

### Hit Dice by Level
```javascript
{
  1: "1d4",
  2: "2d4",
  3: "3d4",
  4: "4d4",
  5: "5d4",
  6: "6d4",
  7: "7d4",
  8: "8d4",
  9: "9d4",
  10: "9d4+2",  // CON no longer applies
  11: "9d4+4",  // CON no longer applies
  12: "9d4+6",  // CON no longer applies
  13: "9d4+8",  // CON no longer applies
  14: "9d4+10"  // CON no longer applies
}
```

### THAC0 / Attack Bonus by Level
```javascript
{
  1: { thac0: 19, bonus: 0 },
  2: { thac0: 19, bonus: 0 },
  3: { thac0: 19, bonus: 0 },
  4: { thac0: 19, bonus: 0 },
  5: { thac0: 17, bonus: 2 },
  6: { thac0: 17, bonus: 2 },
  7: { thac0: 17, bonus: 2 },
  8: { thac0: 17, bonus: 2 },
  9: { thac0: 14, bonus: 5 },
  10: { thac0: 14, bonus: 5 },
  11: { thac0: 14, bonus: 5 },
  12: { thac0: 14, bonus: 5 },
  13: { thac0: 12, bonus: 7 },
  14: { thac0: 12, bonus: 7 }
}
```

### Saving Throws by Level
```javascript
{
  1: { death: 13, wands: 14, paralysis: 13, breath: 16, spells: 15 },
  2: { death: 13, wands: 14, paralysis: 13, breath: 16, spells: 15 },
  3: { death: 13, wands: 14, paralysis: 13, breath: 16, spells: 15 },
  4: { death: 13, wands: 14, paralysis: 13, breath: 16, spells: 15 },
  5: { death: 12, wands: 13, paralysis: 11, breath: 14, spells: 13 },
  6: { death: 12, wands: 13, paralysis: 11, breath: 14, spells: 13 },
  7: { death: 12, wands: 13, paralysis: 11, breath: 14, spells: 13 },
  8: { death: 12, wands: 13, paralysis: 11, breath: 14, spells: 13 },
  9: { death: 10, wands: 11, paralysis: 9, breath: 12, spells: 10 },
  10: { death: 10, wands: 11, paralysis: 9, breath: 12, spells: 10 },
  11: { death: 10, wands: 11, paralysis: 9, breath: 12, spells: 10 },
  12: { death: 10, wands: 11, paralysis: 9, breath: 12, spells: 10 },
  13: { death: 8, wands: 9, paralysis: 7, breath: 10, spells: 8 },
  14: { death: 8, wands: 9, paralysis: 7, breath: 10, spells: 8 }
}
```

### Thief Skills by Level
```javascript
{
  1: { climbSheerSurfaces: 87, findRemoveTraps: 10, hearNoise: "1-2", hideInShadows: 10, moveSilently: 20, openLocks: 15, pickPockets: 20 },
  2: { climbSheerSurfaces: 88, findRemoveTraps: 15, hearNoise: "1-2", hideInShadows: 15, moveSilently: 25, openLocks: 20, pickPockets: 25 },
  3: { climbSheerSurfaces: 89, findRemoveTraps: 20, hearNoise: "1-3", hideInShadows: 20, moveSilently: 30, openLocks: 25, pickPockets: 30 },
  4: { climbSheerSurfaces: 90, findRemoveTraps: 25, hearNoise: "1-3", hideInShadows: 25, moveSilently: 35, openLocks: 30, pickPockets: 35 },
  5: { climbSheerSurfaces: 91, findRemoveTraps: 30, hearNoise: "1-3", hideInShadows: 30, moveSilently: 40, openLocks: 35, pickPockets: 40 },
  6: { climbSheerSurfaces: 92, findRemoveTraps: 40, hearNoise: "1-3", hideInShadows: 36, moveSilently: 45, openLocks: 45, pickPockets: 45 },
  7: { climbSheerSurfaces: 93, findRemoveTraps: 50, hearNoise: "1-4", hideInShadows: 45, moveSilently: 55, openLocks: 55, pickPockets: 55 },
  8: { climbSheerSurfaces: 94, findRemoveTraps: 60, hearNoise: "1-4", hideInShadows: 55, moveSilently: 65, openLocks: 65, pickPockets: 65 },
  9: { climbSheerSurfaces: 95, findRemoveTraps: 70, hearNoise: "1-4", hideInShadows: 65, moveSilently: 75, openLocks: 75, pickPockets: 75 },
  10: { climbSheerSurfaces: 96, findRemoveTraps: 80, hearNoise: "1-4", hideInShadows: 75, moveSilently: 85, openLocks: 85, pickPockets: 85 },
  11: { climbSheerSurfaces: 97, findRemoveTraps: 90, hearNoise: "1-5", hideInShadows: 85, moveSilently: 95, openLocks: 95, pickPockets: 95 },
  12: { climbSheerSurfaces: 98, findRemoveTraps: 95, hearNoise: "1-5", hideInShadows: 90, moveSilently: 96, openLocks: 96, pickPockets: 105 },
  13: { climbSheerSurfaces: 99, findRemoveTraps: 97, hearNoise: "1-5", hideInShadows: 95, moveSilently: 98, openLocks: 97, pickPockets: 115 },
  14: { climbSheerSurfaces: 99, findRemoveTraps: 99, hearNoise: "1-5", hideInShadows: 99, moveSilently: 99, openLocks: 99, pickPockets: 125 }
}
```

**Skill Notes:**
- **Hear Noise:** Roll 1d6, success if result is within range (e.g., "1-2" means 1 or 2 on d6)
- **Other Skills:** Roll d%, success if result ≤ listed percentage
- **Pick Pockets:** -5% per victim level above 5th, minimum 1% chance of failure
- **Pick Pockets:** Roll > 2× required = theft noticed

### Class Abilities
- **Back-stab:** +4 to hit, double damage when attacking unaware opponent from behind
- **Read Languages:** 80% chance from level 4+
- **Scroll Use:** Can cast arcane spells from scrolls from level 10+ (10% chance of error)
- **Hideout:** Can construct secret hideout at level 9
- **Apprentices:** 2d6 apprentice thieves (level 1) arrive when hideout complete

---

## Summary Template for Remaining OSE Classes

### Common Patterns Identified

1. **Saving Throw Progression:** Changes at levels 5, 9, and 13
2. **Attack Bonus Progression:** Changes at levels 5, 9, and 13
3. **Hit Dice:** Max 9 dice, then +1-2 per level (CON no longer applies after 9 HD)
4. **XP Requirements:** Roughly double each level for first few levels, then increase by 100k

### OSE Fighter
- **HD:** 1d8 (best HD)
- **Saves:** Best saves (D12 W13 P14 B15 S16 at level 1)
- **Attack:** Best progression (THAC0 19→17→14→12→10 at levels 1→5→9→13→14)
- **XP:** 0, 2000, 4000, 8000, 16000, 32000, 64000, 120000, 240000, 360000, 480000, 600000, 720000, 840000
- **Abilities:** Stronghold at 9th (attracts soldiers)

### OSE Magic-User
- **HD:** 1d4 (worst HD)
- **Saves:** Worst saves (D13 W14 P13 B16 S15 at level 1)
- **Attack:** Worst progression (THAC0 19→17→14→12 at levels 1→5→9→13)
- **Armor:** None
- **Weapons:** Dagger, staff only
- **Spells:** 6 spell levels (1st-6th)
- **XP:** 0, 2500, 5000, 10000, 20000, 40000, 80000, 150000, 300000, 450000, 600000, 750000, 900000, 1050000
- **Abilities:** Magical research (any level), magic item creation (9th+), stronghold (9th)

### OSE Spellblade
- **HD:** 1d6
- **Saves:** Between Fighter and Magic-User
- **Attack:** Fighter progression
- **Armor:** Any
- **Weapons:** Any
- **Spells:** 6 spell levels (1st-6th), fewer slots than Magic-User
- **Max Level:** 10 (not 14)
- **XP:** Similar to Elf
- **Abilities:** Combines fighting and magic

### OSE Dwarf
- **HD:** 1d8
- **Saves:** Fighter-like with Resilience bonuses
- **Attack:** Fighter progression
- **Max Level:** 12
- **Racial Abilities:** Detection, infravision, Resilience
- **XP:** 0, 2200, 4400, 8800, 17000, 35000, 70000, 140000, 270000, 400000, 530000, 660000

### OSE Elf
- **HD:** 1d6
- **Saves:** Between Fighter and Magic-User
- **Attack:** Fighter progression
- **Max Level:** 10
- **Spells:** 5 spell levels (1st-5th)
- **Racial Abilities:** Detect secret doors, infravision, ghoul immunity
- **XP:** 0, 4000, 8000, 16000, 32000, 64000, 120000, 250000, 400000, 600000

### OSE Halfling
- **HD:** 1d6
- **Saves:** Fighter-like with Resilience bonuses
- **Attack:** Fighter progression
- **Max Level:** 8
- **Racial Abilities:** Missile bonus, AC bonus, Resilience
- **XP:** 0, 2000, 4000, 8000, 16000, 32000, 64000, 120000

### OSE Gnome
- **HD:** 1d4
- **Saves:** Magic-User-like with Magic Resistance bonuses
- **Attack:** Magic-User progression
- **Max Level:** 8
- **Spells:** 4 spell levels (1st-4th, illusionist spells)
- **Racial Abilities:** Detection, infravision, AC bonus, Magic Resistance
- **XP:** 0, 3000, 6000, 12000, 25000, 50000, 100000, 200000

### Data Structure for JavaScript

Each class should have:
- Basic info (requirements, prime requisite, HD type, max level, armor, weapons, languages)
- XP table (object with level as key)
- Hit dice table (object with level as key, string values like "3d6" or "9d6+2")
- Attack bonus table (object with level as key, contains thac0 and bonus)
- Saving throws table (object with level as key, contains all 5 saves)
- Class-specific tables (spell slots for casters, thief skills for thieves, turn undead for clerics)
- Class abilities (array of objects with level requirement and description)

### Implementation Notes

The detailed data extraction for Cleric and Thief above establishes the pattern. For Phase 5 JavaScript implementation:

1. **Shared Data (class-data-shared.js):**
   - Class descriptions, requirements, armor/weapon restrictions
   - Prime requisites and XP bonuses
   - Languages
   - Class ability descriptions

2. **Mode-Specific Data (class-data-ose.js):**
   - XP requirements by level
   - Hit dice progressions
   - THAC0/attack bonus tables
   - Saving throw tables
   - Spell slot tables (for casters)
   - Thief skill tables (for thieves)
   - Turn undead tables (for clerics)
   - Level limits (for demihumans)

3. **Helper Functions:**
   - Lookup functions for each table type
   - Validation for level limits
   - XP calculation and level advancement
