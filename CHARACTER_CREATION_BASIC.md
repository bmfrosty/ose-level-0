# Character Creation: Basic Method (Level 1+)

This document describes the standard OSE Advanced Fantasy character creation process for Level 1+ characters. This is distinct from Level 0 character generation.

## Overview

Basic Method character creation is for creating 1st level characters using the standard OSE rules. Characters created this way:
- Start at 1st level with 0 XP
- Choose a class (which determines race for demihumans)
- Have class-based abilities and progression
- Roll hit dice appropriate to their class
- Purchase starting equipment with 3d6 × 10 gold pieces

## Current Implementation Status

**NOT YET IMPLEMENTED** - The generator currently only creates Level 0 characters. This document serves as a specification for future Level 1+ character generation.

## Character Creation Steps

### 1. Roll Ability Scores
Roll 3d6 for each ability score: STR, DEX, CON, INT, WIS, CHA.

**Sub-Par Characters Rule:**
**We use this rule.** If a character has very poor ability scores (8 or less in every score, or extremely low in multiple abilities), allow re-rolling the entire character.

**Implementation Note:** Provide UI option to re-roll if character is sub-par. Same as Advanced Method and Level 0.

### 2. Choose a Class
Select from available classes, considering minimum ability score requirements:
- **Human Classes:** Fighter, Cleric, Magic-User, Thief
- **Demihuman Classes:** Dwarf, Elf, Gnome, Halfling

**Race Determination:** The chosen class determines race. Unless a demihuman class is selected, the character is human.

### 3. Adjust Ability Scores (Optional)
Players may raise prime requisite(s) by lowering other ability scores:
- **Exchange Rate:** Lower 2 points to raise prime requisite by 1 point
- **Restrictions:**
  - Only STR, INT, and WIS may be lowered
  - No score may be lowered below 9
  - Some classes have additional constraints

**Implementation Note:** This is a unique feature of Level 1+ creation, not available at Level 0.

### 4. Note Ability Score Modifiers
Record all bonuses/penalties from ability scores.

### 5. Note Attack Values
**We use Ascending AC (optional rule):**
- 1st level characters have THAC0 19 [0]
- Record attack bonus: **+0** for 1st level characters
- The value in square brackets [0] is the ascending AC attack bonus

**Implementation Note:** We always use ascending AC, so store and display the [0] value as the attack bonus.

### 6. Note Saving Throws and Class Abilities
- Record class special abilities
- Record saving throws (class-dependent)
- If character has a spell book, determine starting spells

**Weapon Proficiencies (Optional Rule):**
**We do NOT use this rule.** All characters can use any weapon allowed by their class without proficiency selection.

**Implementation Note:** No proficiency system needed - just enforce class weapon restrictions.

### 7. Roll Hit Points
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

**Implementation Note:** This is different from Level 0 where you roll 1d4 and must keep it.

### 8. Choose Alignment
Select: Lawful, Neutral, or Chaotic.

### 9. Note Known Languages
- **Native Languages:** Listed in class description (always includes Common and alignment language)
- **Additional Languages:** Characters with high INT may choose additional languages

**Implementation Note:** Each class/race has specific language lists.

### 10. Buy Equipment
Starting wealth: **3d6 × 10 gold pieces**

Purchase equipment from standard lists, respecting class restrictions on weapons and armor.

**Implementation Note:** This is different from Level 0 where equipment is determined by background/occupation.

### 11. Note Armour Class
**We use Ascending AC (optional rule):**

Base AC determined by armor:
- **Unarmored:** 9 [10] - we use the [10] value
- **Leather:** 7 [12]
- **Chain Mail:** 5 [14]
- **Plate Mail:** 3 [16]

Apply DEX modifier to the ascending AC value.

**Implementation Note:** Always use and display the ascending AC value in square brackets.

### 12. Note Level and XP
- **Starting Level:** 1
- **Starting XP:** 0

### 13. Secondary Skill (Optional Rule)
**We use this rule** (equivalent to Level 0 occupations).

Roll d100 on Secondary Skills table to determine character's secondary profession/hobby.

**Secondary Skills Table:**
| d100 | Secondary Skill |
|------|----------------|
| 01-03 | Animal trainer |
| 04-05 | Armourer |
| 06-09 | Baker |
| 10-12 | Blacksmith |
| 13 | Bookbinder |
| 14-16 | Bowyer / fletcher |
| 17-20 | Brewer |
| 21-23 | Butcher |
| 24-26 | Carpenter |
| 27-28 | Chandler |
| 29-33 | Cooper |
| 34-35 | Coppersmith |
| 36-46 | Farmer |
| 47-50 | Fisher |
| 51-54 | Furrier |
| 55 | Glassblower |
| 56-59 | Huntsman |
| 60-62 | Lapidary / jeweller |
| 63-66 | Lorimer |
| 67 | Mapmaker |
| 68-69 | Mason |
| 70-73 | Miner |
| 74-76 | Potter |
| 77-78 | Roper |
| 79-81 | Seafarer |
| 82-84 | Shipwright |
| 85-87 | Tailor |
| 88-90 | Tanner |
| 91-93 | Thatcher / roofer |
| 94-96 | Woodcutter |
| 97-98 | Vintner |
| 99-00 | Roll for two skills |

**Using Secondary Skills:**
- Allows basic-level performance of profession functions
- Can assess value/quality of related items
- Can make minor repairs
- Can construct simple items
- Cannot match skill level of dedicated professionals

**Implementation Note:** This is similar to Level 0 backgrounds but doesn't provide equipment or weapons.

### 14. Name Character
Choose a character name.

## Key Differences from Level 0

| Feature | Level 0 | Level 1+ Basic |
|---------|---------|----------------|
| **Hit Points** | 1d4 + CON | Class hit die + CON |
| **Re-roll 1s/2s** | No | Yes (optional, we use it) |
| **Equipment** | From background | Purchase with 3d6×10 gp |
| **Weapons** | From background | Purchase (class restricted) |
| **Armor** | From background | Purchase (class restricted) |
| **Class** | None | Required |
| **Ability Adjustment** | No (unless Advanced) | Yes (prime requisite swap) |
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
- **Weapon Proficiencies** - NOT USED (all class weapons available)

## Implementation Checklist

When implementing Level 1+ character generation:

- [ ] Add level selection UI (currently fixed at 0)
- [ ] Add class selection UI
- [ ] Implement class data (hit dice, saves, abilities, restrictions)
- [ ] Implement prime requisite ability score swapping
- [ ] Implement class-based hit point rolling with re-roll 1s/2s
- [ ] Implement starting wealth calculation (3d6 × 10 gp)
- [ ] Implement equipment purchase system
- [ ] Implement class-based language lists
- [ ] Implement secondary skill rolling (d100 table)
- [ ] Update AC calculation for armor types
- [ ] Update attack bonus for level 1 (THAC0 19 [0])
- [ ] Update saving throws for class and level
- [ ] Ensure ascending AC values are used throughout
- [ ] Add class ability descriptions to character sheet

## Data Sources

- **OSE Advanced Fantasy Player's Tome** - Character creation rules (p18-19)
- **OSE Advanced Fantasy Player's Tome** - Secondary skills table (p25)
- **OSE SRD Website** - Class data and progressions
- **Current Level 0 Implementation** - Background tables for reference

## Notes

- Level 1+ characters are more powerful than Level 0
- Equipment flexibility vs. Level 0's fixed background equipment
- Class abilities provide significant advantages
- Secondary skills are flavor/utility, not mechanical benefits
- Ascending AC simplifies calculations (higher is better)
