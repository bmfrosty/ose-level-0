# Extracted Class Data - Smoothified Mode (Gygar)

This document contains structured data extracted from Gygar class markdown files for use in Phase 5 (JavaScript implementation).

## Key Differences from OSE Standard

### Smoothified Mode Changes
1. **Attack Bonus Progression:** Smoother progression (+0, +1, +1, +2, +2, +3, +3, +4, +5, +5, +6, +6, +7, +7)
2. **Saving Throw Progression:** Gradual improvements every 1-2 levels (not just at 5/9/13)
3. **No Level Limits:** All classes can reach level 14 (except Spellblade at 10)
4. **Level 0 Attack Bonus:** 0 instead of -1

## Gygar Cleric

### Basic Info
- **Requirements:** Human, Dwarf, or Gnome (Dwarf/Gnome need WIS 9+)
- **Prime Requisite:** WIS
- **Hit Dice:** 1d6
- **Maximum Level:** 14 (Humans), 8 (Dwarves)
- **Armor:** Any, including shields
- **Weapons:** Blunt weapons only (club, mace, sling, staff, war hammer)
- **Languages:** Alignment, Common

### Attack Bonus Progression
- Levels 1: +0
- Levels 2-3: +1
- Levels 4-5: +2
- Levels 6-7: +3
- Level 8: +4
- Levels 9-10: +5
- Levels 11-12: +6
- Levels 13-14: +7

### Saving Throw Progression (Smoothed)
- Level 1: D11 W12 P14 B16 S15
- Level 2: D11 W12 P14 B16 S15
- Level 3: D11 W12 P14 B16 S14
- Level 4: D10 W11 P13 B15 S13
- Level 5: D9 W10 P12 B14 S12
- Level 6: D9 W10 P12 B14 S12
- Level 7: D8 W9 P11 B13 S11
- Level 8: D7 W8 P10 B12 S10
- Level 9: D6 W7 P9 B11 S9
- Level 10: D6 W7 P9 B11 S9
- Level 11: D5 W7 P9 B10 S9
- Level 12: D4 W6 P8 B9 S8
- Level 13: D3 W5 P7 B8 S7
- Level 14: D3 W5 P7 B8 S7

**Note:** Saves improve gradually instead of in large jumps at levels 5/9/13.

### Other Data
- **XP Requirements:** Same as OSE (0, 1500, 3000, 6000, 12000, 25000, 50000, 100000, 200000, 300000, 400000, 500000, 600000, 700000)
- **Hit Dice:** Same as OSE (1d6 per level, max 9d6, then +1/level, CON stops applying)
- **Spell Slots:** Same as OSE
- **Turn Undead:** Same table as OSE
- **Class Abilities:** Same as OSE (Turn Undead, Divine Magic, Stronghold at 9th)

---

## Summary for Remaining Gygar Classes

### Common Gygar Patterns

1. **Attack Bonus:** Smoother progression every 1-2 levels
2. **Saving Throws:** Gradual improvements, not big jumps
3. **No Level Limits:** Demihumans can reach level 14 (except Spellblade at 10)
4. **XP/HD/Spells:** Generally same as OSE

### Gygar Fighter
- **Attack:** +0, +1, +1, +2, +2, +3, +3, +4, +5, +5, +6, +6, +7, +8 (reaches +8 at level 14)
- **Saves:** Gradual improvement from D12→D3, W13→W5, P14→W7, B15→B8, S16→S7
- **Max Level:** 14 (no limit)
- **Other:** Same HD (1d8), XP, abilities as OSE

### Gygar Magic-User
- **Attack:** +0, +1, +1, +2, +2, +3, +3, +4, +5, +5, +6, +6, +7, +7 (same as Cleric)
- **Saves:** Gradual improvement from D13→D3, W14→W5, P13→P7, B16→B8, S15→S7
- **Max Level:** 14 (no limit)
- **Other:** Same HD (1d4), XP, spells, abilities as OSE

### Gygar Thief
- **Attack:** +0, +1, +1, +2, +2, +3, +3, +4, +5, +5, +6, +6, +7, +7 (same as Cleric)
- **Saves:** Gradual improvement from D13→D3, W14→W5, P13→P7, B16→B8, S15→S7
- **Thief Skills:** Same progression as OSE
- **Max Level:** 14 (no limit)
- **Other:** Same HD (1d4), XP, abilities as OSE

### Gygar Spellblade
- **Attack:** Fighter progression (+0→+8)
- **Saves:** Between Fighter and Magic-User, gradual improvement
- **Max Level:** 10 (same as OSE Elf)
- **Spells:** 6 spell levels (1st-6th), fewer slots than Magic-User
- **Armor/Weapons:** Any
- **XP:** Similar to Elf
- **Note:** Unique to Smoothified Mode

### Gygar Dwarf
- **Attack:** Fighter progression (+0→+8 at level 14)
- **Saves:** Fighter-like with Resilience bonuses, gradual improvement
- **Max Level:** 14 (no limit, vs OSE's 12)
- **Racial Abilities:** Same as OSE (Detection, infravision, Resilience)
- **Other:** Same HD (1d8), similar XP

### Gygar Elf
- **Attack:** Fighter progression (+0→+8 at level 14)
- **Saves:** Between Fighter and Magic-User, gradual improvement
- **Max Level:** 14 (no limit, vs OSE's 10)
- **Spells:** 5 spell levels (1st-5th)
- **Racial Abilities:** Same as OSE (Detect secret doors, infravision, ghoul immunity)
- **Other:** Same HD (1d6)

### Gygar Halfling
- **Attack:** Fighter progression (+0→+8 at level 14)
- **Saves:** Fighter-like with Resilience bonuses, gradual improvement
- **Max Level:** 14 (no limit, vs OSE's 8)
- **Racial Abilities:** Same as OSE (Missile bonus, AC bonus, Resilience)
- **Other:** Same HD (1d6)

### Gygar Gnome
- **Attack:** Magic-User progression (+0→+7 at level 14)
- **Saves:** Magic-User-like with Magic Resistance bonuses, gradual improvement
- **Max Level:** 14 (no limit, vs OSE's 8)
- **Spells:** 4 spell levels (1st-4th, illusionist spells)
- **Racial Abilities:** Same as OSE (Detection, infravision, AC bonus, Magic Resistance)
- **Other:** Same HD (1d4)

---

## Comparison: OSE vs Gygar Progressions

### Attack Bonus Comparison

**OSE Standard:**
- Levels 1-4: +0
- Levels 5-8: +2
- Levels 9-12: +5
- Levels 13-14: +7

**Gygar Smoothified:**
- Levels 1: +0
- Levels 2-3: +1
- Levels 4-5: +2
- Levels 6-7: +3
- Level 8: +4
- Levels 9-10: +5
- Levels 11-12: +6
- Levels 13-14: +7

**Result:** Gygar has smoother progression with smaller, more frequent increases.

### Saving Throw Comparison

**OSE Standard:**
- Big jumps at levels 5, 9, and 13
- Example (Cleric): 11→9→6→3 (Death)

**Gygar Smoothified:**
- Gradual improvements every 1-2 levels
- Example (Cleric): 11→11→11→10→9→9→8→7→6→6→5→4→3→3 (Death)

**Result:** Gygar has more consistent, predictable progression.

### Level Limits

**OSE Standard:**
- Dwarf: 12
- Elf: 10
- Halfling: 8
- Gnome: 8

**Gygar Smoothified:**
- All demihumans: 14 (no limits)
- Spellblade: 10

**Result:** Gygar removes demihuman level limits.

---

## Implementation Notes

### Shared Data (class-data-shared.js)
Same for both modes:
- Class descriptions
- Requirements
- Armor/weapon restrictions
- Languages
- Class ability descriptions
- Spell lists
- Thief skill names

### Mode-Specific Data

**class-data-ose.js:**
- OSE attack bonus tables (big jumps)
- OSE saving throw tables (big jumps)
- Level limits for demihumans
- XP requirements

**class-data-gygar.js:**
- Gygar attack bonus tables (smooth progression)
- Gygar saving throw tables (gradual improvements)
- No level limits (except Spellblade at 10)
- XP requirements (mostly same as OSE)

### Helper Functions
- `getAttackBonus(className, level, mode)` - Returns different values based on mode
- `getSavingThrows(className, level, mode)` - Returns different values based on mode
- `getMaxLevel(className, mode)` - Returns level limits (OSE) or 14 (Gygar)
- All other functions work the same for both modes
