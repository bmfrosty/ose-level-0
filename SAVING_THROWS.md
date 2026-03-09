# Saving Throws in OSE

This document describes the saving throw system in Old-School Essentials and how it's implemented in this character generator.

## Overview

All characters and monsters can make saving throws to avoid the full effects of certain magical or special attacks. A saving throw is rolled with 1d20, and the result must be **greater than or equal to** the saving throw value to succeed.

## The Five Saving Throw Categories

OSE uses five saving throw categories, each covering specific types of threats:

### 1. Death or Poison (D)
**When to use:** When targeted by a death ray or exposed to poison.

**Effects:**
- **Success:** Avoid the effect entirely (or half damage if applicable)
- **Failure:** Usually fatal for poison; full effect for death rays

**Note:** If a poisonous attack also inflicts damage, the damage is not affected by the success or failure of the save.

### 2. Wands (W)
**When to use:** When targeted by an effect from a magical wand.

**Effects:**
- **Success:** Avoid or negate the effect (or half damage)
- **Failure:** Full effect

### 3. Paralysis or Petrification (P)
**When to use:** When targeted by an effect that paralyzes or turns to stone.

**Effects:**
- **Success:** Avoid the effect entirely
- **Failure:** Paralyzed or petrified

### 4. Breath Attacks (B)
**When to use:** When targeted by the breath of a dragon (or other monster with a breath attack).

**Effects:**
- **Success:** Half damage
- **Failure:** Full damage

### 5. Spells, Rods, or Staves (S)
**When to use:** When targeted by a baneful spell or an effect from a magical rod or staff.

**Effects:**
- **Success:** Avoid or negate the effect (or half damage)
- **Failure:** Full effect

## Base Saving Throw Values

### Level 0 Characters
All Level 0 characters use the same base saving throw values:

| Category | Value | Roll Needed |
|----------|-------|-------------|
| Death (D) | 14 | 14+ on 1d20 |
| Wands (W) | 15 | 15+ on 1d20 |
| Paralysis (P) | 16 | 16+ on 1d20 |
| Breath (B) | 17 | 17+ on 1d20 |
| Spells (S) | 18 | 18+ on 1d20 |

**Note:** Lower numbers are better (easier to roll). These values apply in both Normal and Gygar modes.

### Level 1+ Characters
Each character class has its own saving throw progression table. Values improve (decrease) as the character gains levels.

**Implementation Status:** Not yet implemented - currently only Level 0 is supported.

## Racial Bonuses to Saving Throws

Some races have natural resistances that provide bonuses to certain saving throw categories. These bonuses apply in both Basic and Advanced modes.

### Dwarf Resilience

Dwarves are naturally hardy and resistant to magic, gaining bonuses based on their CON score.

**Applies to:**
- ✅ Death or Poison (D)
- ✅ Wands (W)
- ✅ Spells, Rods, or Staves (S)

**Does NOT apply to:**
- ❌ Paralysis or Petrification (P)
- ❌ Breath Attacks (B)

**Bonus by CON Score:**
| CON Score | Bonus |
|-----------|-------|
| 6 or lower | +0 |
| 7-10 | +2 |
| 11-14 | +3 |
| 15-17 | +4 |
| 18 | +5 |

**Rationale:** Dwarves are hardy against poison (Death), magic items (Wands), and spells (Spells), but not against physical effects like paralysis or breath weapons.

### Gnome Magic Resistance

Gnomes are naturally resistant to magic, gaining bonuses based on their CON score.

**Applies to:**
- ✅ Wands (W)
- ✅ Spells, Rods, or Staves (S)

**Does NOT apply to:**
- ❌ Death or Poison (D)
- ❌ Paralysis or Petrification (P)
- ❌ Breath Attacks (B)

**Bonus by CON Score:**
| CON Score | Bonus |
|-----------|-------|
| 6 or lower | +0 |
| 7-10 | +2 |
| 11-14 | +3 |
| 15-17 | +4 |
| 18 | +5 |

**Rationale:** The OSE Advanced Fantasy Player's Tome specifically states "saving throws versus spells and magic wands, rods, and staves" - which maps to Wands and Spells categories only.

## How Bonuses Work

Bonuses **reduce** the saving throw value, making it easier to succeed.

**Example 1: Dwarf with CON 12**
- Base Death save: 14
- Resilience bonus: +3
- Final Death save: 14 - 3 = **11**
- Must roll 11+ instead of 14+ (easier!)

**Example 2: Gnome with CON 16**
- Base Spells save: 18
- Magic Resistance bonus: +4
- Final Spells save: 18 - 4 = **14**
- Must roll 14+ instead of 18+ (much easier!)

**Example 3: Dwarf with CON 12 vs Paralysis**
- Base Paralysis save: 16
- Resilience bonus: Does NOT apply to Paralysis
- Final Paralysis save: **16** (no change)

## Implementation Details

### Code Structure

```javascript
// Base values for Level 0
const savingThrowsLevel0 = {
    Death: 14,
    Wands: 15,
    Paralysis: 16,
    Breath: 17,
    Spells: 18
};

// Calculate final saves with racial bonuses
function calculateSavingThrows(level, race, conScore, isAdvanced, isGygar) {
    const saves = { ...savingThrowsLevel0 };
    
    // Apply Dwarf Resilience
    if (race === "Dwarf") {
        const bonus = getDwarfResilienceBonus(conScore);
        saves.Death -= bonus;
        saves.Wands -= bonus;
        saves.Spells -= bonus;
    }
    
    // Apply Gnome Magic Resistance
    if (race === "Gnome") {
        const bonus = getGnomeMagicResistanceBonus(conScore);
        saves.Wands -= bonus;
        saves.Spells -= bonus;
    }
    
    return saves;
}
```

### Verification Checklist

- ✅ Dwarf Resilience applies to Death, Wands, Spells only
- ✅ Gnome Magic Resistance applies to Wands, Spells only
- ✅ Bonuses reduce (improve) saving throw values
- ✅ Bonuses apply in both Basic and Advanced modes
- ✅ Base values match OSE Level 0 rules
- ✅ Code correctly implements OSE categories

## Future Implementation: Class-Based Saves

When implementing Level 1+ characters, remember:

1. **Each class has its own progression table**
   - Fighter, Cleric, Magic-User, Thief each have different values
   - Demihuman classes (Dwarf, Elf, Gnome, Halfling) have their own tables
   - Values improve (decrease) as characters level up

2. **Racial bonuses stack with class saves**
   - Calculate base save from class/level table
   - Apply racial bonuses (Resilience, Magic Resistance) on top
   - Final value = Class base - Racial bonus

3. **The five categories remain constant**
   - Death, Wands, Paralysis, Breath, Spells
   - Same categories across all classes and levels
   - Only the values change

4. **Rolling mechanics stay the same**
   - Always roll 1d20
   - Must meet or exceed the save value
   - Lower values are better (easier to succeed)

## Data Sources

- **OSE Advanced Fantasy Player's Tome** - Saving throw rules (p20-21)
- **OSE Advanced Fantasy Player's Tome** - Dwarf racial abilities (p78-79)
- **OSE Advanced Fantasy Player's Tome** - Gnome racial abilities (p82-83)
- **OSE Level 0 Article** - Level 0 saving throw values

## Notes

- Saving throws are a core mechanic in OSE
- Success often means the difference between life and death
- Racial bonuses can significantly improve survivability
- Dwarves and Gnomes have the best magical resistance
- Breath weapons are particularly dangerous (no racial bonuses)
- Poison is often fatal even with a good save
