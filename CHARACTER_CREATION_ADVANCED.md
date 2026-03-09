# Character Creation: Advanced Method (Level 1+)

This document describes the OSE Advanced Fantasy character creation process for Level 1+ characters using the Advanced Method. This is distinct from Level 0 character generation and from the Basic Method.

## Overview

Advanced Method character creation is for creating 1st level characters using Advanced Fantasy rules with racial selection. Characters created this way:
- Start at 1st level with 0 XP
- Choose a race first, then a class available to that race
- Have racial ability score modifiers applied
- Have both racial and class-based abilities
- Roll hit dice appropriate to their class
- Purchase starting equipment with 3d6 × 10 gold pieces

## Current Implementation Status

**NOT YET IMPLEMENTED** - The generator currently only creates Level 0 characters. This document serves as a specification for future Level 1+ character generation.

## Character Creation Steps

### 1. Roll Ability Scores
Roll 3d6 for each ability score: STR, DEX, CON, INT, WIS, CHA.

**Sub-Par Characters Rule:**
**We use this rule.** If a character has very poor ability scores (8 or less in every score, or extremely low in multiple abilities), allow re-rolling the entire character.

**Implementation Note:** Provide UI option to re-roll if character is sub-par. Same as Basic Method and Level 0.

### 2. Choose a Race
Select from available races, considering minimum ability score requirements:
- **Human**
- **Dwarf** (requires CON 9)
- **Elf** (requires INT 9)
- **Gnome** (requires CON 9, INT 9)
- **Halfling** (requires CON 9, DEX 9)

**Ability Score Modifiers:**
After selecting race, apply racial ability score modifiers:
- **Human:** +1 CON, +1 CHA
- **Dwarf:** +1 CON, -1 CHA
- **Elf:** +1 DEX, -1 CON
- **Gnome:** No modifiers
- **Halfling:** -1 STR, +1 DEX

**Restrictions:**
- Modifiers cannot raise an ability score above 18
- Modifiers cannot lower an ability score below 3

**Implementation Note:** This is the key difference from Basic Method - race is chosen separately from class, and racial modifiers are applied.

### 3. Choose a Class
Select from classes available to your race, considering minimum ability score requirements.

**Human Classes:**
- Fighter
- Cleric
- Magic-User
- Thief
- (Any class available)

**Dwarf Classes:**
- Dwarf (racial class)
- Fighter
- Cleric
- Thief

**Elf Classes:**
- Elf (racial class)
- Fighter
- Magic-User
- Thief

**Gnome Classes:**
- Gnome (racial class)
- Fighter
- Cleric
- Magic-User
- Thief

**Halfling Classes:**
- Halfling (racial class)
- Fighter
- Cleric
- Thief

**Multiple Classes (Optional Rule):**
**We do NOT use this rule.** Characters select only one class.

**Implementation Note:** Need to implement class availability by race and enforce minimum requirements.

### 4. Adjust Ability Scores (Optional)
Players may raise prime requisite(s) by lowering other ability scores:
- **Exchange Rate:** Lower 2 points to raise prime requisite by 1 point
- **Restrictions:**
  - Only STR, INT, and WIS may be lowered
  - No score may be lowered below 9
  - Some classes have additional constraints

**Implementation Note:** Same as Basic Method.

### 5. Note Ability Score Modifiers
Record all bonuses/penalties from ability scores.

**Implementation Note:** Same as Basic Method.

### 6. Note Attack Values
**We use Ascending AC (optional rule):**
- 1st level characters have THAC0 19 [0]
- Record attack bonus: **+0** for 1st level characters
- The value in square brackets [0] is the ascending AC attack bonus

**Implementation Note:** Same as Basic Method - always use ascending AC.

### 7. Note Saving Throws and Class/Race Abilities
- Record racial special abilities
- Record class special abilities
- Record saving throws (class-dependent, with racial bonuses if applicable)
- If character has a spell book, determine starting spells

**Weapon Proficiencies (Optional Rule):**
**We do NOT use this rule.** All characters can use any weapon allowed by their race and class without proficiency selection.

**Implementation Note:** No proficiency system needed - just enforce race and class weapon restrictions.

### 8. Roll Hit Points
Roll the hit die for the character's class:
- **Fighter:** d8
- **Cleric:** d6
- **Magic-User:** d4
- **Thief:** d4
- **Dwarf:** d8
- **Elf:** d6
- **Gnome:** d4
- **Halfling:** d6

Apply CON modifier. Minimum 1 HP regardless of modifier.

**Re-Rolling 1s and 2s (Optional Rule):**
We use this rule by default (checkbox enabled). If a 1 or 2 is rolled (before CON modifier), allow re-roll.

**Implementation Note:** Same as Basic Method.

### 9. Choose Alignment
Select: Lawful, Neutral, or Chaotic.

**Implementation Note:** Same as Basic Method.

### 10. Note Known Languages
- **Native Languages:** Listed in race description (varies by race)
- **Additional Languages:** Characters with high INT may choose additional languages

**Race-Specific Languages:**
- **Human:** Common, alignment language
- **Dwarf:** Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold
- **Elf:** Alignment, Common, Elvish, Gnoll, Hobgoblin, Orcish
- **Gnome:** Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold
- **Halfling:** Alignment, Common, Halfling

**Implementation Note:** Each race has specific language lists that differ from Basic Method.

### 11. Buy Equipment
Starting wealth: **3d6 × 10 gold pieces**

Purchase equipment from standard lists, respecting both race and class restrictions on weapons and armor.

**Implementation Note:** Need to enforce both racial and class equipment restrictions.

### 12. Note Armour Class
**We use Ascending AC (optional rule):**

Base AC determined by armor:
- **Unarmored:** 9 [10] - we use the [10] value
- **Leather:** 7 [12]
- **Chain Mail:** 5 [14]
- **Plate Mail:** 3 [16]

Apply DEX modifier to the ascending AC value.

**Implementation Note:** Same as Basic Method - always use ascending AC.

### 13. Note Level and XP
- **Starting Level:** 1
- **Starting XP:** 0

**Implementation Note:** Same as Basic Method.

### 14. Secondary Skill (Optional Rule)
**We use this rule** (equivalent to Level 0 occupations).

Roll d100 on Secondary Skills table to determine character's secondary profession/hobby.

**Implementation Note:** Same as Basic Method - use the same d100 table.

### 15. Name Character
Choose a character name.

**Implementation Note:** Can use race-specific name tables.

## Key Differences from Basic Method

| Feature | Basic Method | Advanced Method |
|---------|--------------|-----------------|
| **Race Selection** | Determined by class | Chosen separately |
| **Racial Modifiers** | None | Applied after race selection |
| **Racial Minimums** | None | Required for some races |
| **Class Selection** | First step (determines race) | Second step (after race) |
| **Available Classes** | All classes | Race-dependent |
| **Racial Abilities** | Only if demihuman class | Always (based on race) |
| **Languages** | Class-based | Race-based |
| **Equipment Restrictions** | Class only | Race AND class |

## Key Differences from Level 0

| Feature | Level 0 | Level 1+ Advanced |
|---------|---------|-------------------|
| **Hit Points** | 1d4 + CON | Class hit die + CON |
| **Re-roll 1s/2s** | No | Yes (optional, we use it) |
| **Equipment** | From background | Purchase with 3d6×10 gp |
| **Weapons** | From background | Purchase (race+class restricted) |
| **Armor** | From background | Purchase (race+class restricted) |
| **Class** | None | Required |
| **Race Selection** | Available | Required first |
| **Racial Modifiers** | Optional (Advanced checkbox) | Always applied |
| **Racial Minimums** | Optional (Advanced checkbox) | Always enforced |
| **Starting XP** | 0 | 0 |
| **Advancement** | To Level 1 after adventure | Normal XP progression |
| **Background** | Determines equipment | Secondary skill (flavor only) |

## Optional Rules We Use

1. ✅ **Ascending AC** - Always use the value in square brackets
2. ✅ **Re-Rolling 1s and 2s** - Default enabled for HP rolls
3. ✅ **Secondary Skills** - Roll d100 for background profession
4. ✅ **Sub-par Character Re-rolling** - Allow re-roll if all scores ≤8 or multiple very low scores

## Optional Rules We Don't Use

- Prime requisite ability score swapping (available but not automatic)
- **Multiple Classes** - NOT USED
- **Weapon Proficiencies** - NOT USED (all race+class weapons available)

## Implementation Checklist

When implementing Level 1+ Advanced Method character generation:

- [ ] Add level selection UI (currently fixed at 0)
- [ ] Add race selection UI (separate from class)
- [ ] Implement racial ability score modifiers
- [ ] Implement racial minimum requirements
- [ ] Add class selection UI (filtered by race)
- [ ] Implement class data (hit dice, saves, abilities, restrictions)
- [ ] Implement prime requisite ability score swapping
- [ ] Implement class-based hit point rolling with re-roll 1s/2s
- [ ] Implement starting wealth calculation (3d6 × 10 gp)
- [ ] Implement equipment purchase system
- [ ] Implement race-based language lists
- [ ] Implement racial abilities display
- [ ] Implement class abilities display
- [ ] Implement secondary skill rolling (d100 table)
- [ ] Update AC calculation for armor types
- [ ] Update attack bonus for level 1 (THAC0 19 [0])
- [ ] Update saving throws for class and level (with racial bonuses)
- [ ] Ensure ascending AC values are used throughout
- [ ] Add race and class ability descriptions to character sheet
- [ ] Enforce both racial and class equipment restrictions

## Racial Abilities Summary

### Human
- Roll HP twice, take best (Blessed)
- Act first on tied initiative
- Retainers/mercenaries +1 loyalty/morale

### Dwarf
- Languages: Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold
- Small/normal weapons only (no longbows or two-handed swords)
- Detect construction tricks 2-in-6
- Detect room traps 2-in-6
- Infravision 60'
- Listen at doors 2-in-6
- Resilience: Bonus to Death/Wands/Spells saves based on CON

### Elf
- Languages: Alignment, Common, Elvish, Gnoll, Hobgoblin, Orcish
- Detect secret doors 2-in-6 when actively searching
- Infravision 60'
- Listen at doors 2-in-6
- Immunity to ghoul paralysis

### Gnome
- Languages: Alignment, Common, Dwarvish, Gnomish, Kobold, burrowing mammals
- Small/normal weapons only (no longbows or two-handed swords)
- Detect construction tricks 2-in-6
- Infravision 90'
- Listen at doors 2-in-6
- +2 AC vs large opponents
- Magic Resistance: Bonus to saves vs spells/wands/rods/staves based on CON

### Halfling
- Languages: Alignment, Common, Halfling
- Listen at doors 2-in-6
- +1 to missile attack rolls
- +2 AC vs large opponents

## Data Sources

- **OSE Advanced Fantasy Player's Tome** - Character creation rules (p16-17)
- **OSE Advanced Fantasy Player's Tome** - Race descriptions (p78+)
- **OSE Advanced Fantasy Player's Tome** - Secondary skills table (p25)
- **OSE SRD Website** - Class data and progressions
- **Current Level 0 Implementation** - Racial abilities and background tables

## Notes

- Advanced Method provides more flexibility than Basic Method
- Racial abilities are always present (not class-dependent)
- Race and class restrictions both apply to equipment
- Racial modifiers are applied before class selection
- Some race/class combinations may be more optimal than others
- Ascending AC simplifies calculations (higher is better)
- Secondary skills provide flavor without mechanical benefits
