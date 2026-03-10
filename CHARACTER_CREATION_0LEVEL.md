# Character Creation: Level 0

This document describes the Level 0 character creation process from the OSE Level 0 article. Level 0 characters represent normal folk before they become adventurers - useful for retainers, funnel adventures, or starting campaigns.

## Overview

Level 0 character creation is for creating ordinary people who may become adventurers. Characters created this way:
- Start at level 0 with 0 XP
- Have no class
- Roll 1d4 for hit points
- Have equipment determined by their background/profession
- Can advance to 1st level after gaining XP on an adventure

## Current Implementation Status

**FULLY IMPLEMENTED** - The generator currently creates Level 0 characters with significant expansions beyond the original OSE article.

## Character Creation Steps

### 1. Roll Ability Scores
Roll 3d6 for each ability score: STR, DEX, CON, INT, WIS, CHA.

**Sub-Par Characters Rule:**
**Original OSE Rule:** You must keep whatever scores you roll (unlike 1st level adventurers).

**Our Implementation:** We use sub-par character re-rolling. If all scores are ≤8 or multiple scores are very low, allow re-rolling the entire character.

**Implementation Note:** We've expanded this to allow re-rolling for better survivability.

### 2. Note Ability Score Modifiers
Record all bonuses/penalties from ability scores.

### 3. Note Attack Values and Saves

**Original OSE:**
- THAC0: 20 [-1]
- Saves: D14 W15 P16 B17 S18

**Our Implementation:**
- **Normal Mode:** THAC0 20 [-1] (attack bonus -1)
- **Smoothified Mode:** THAC0 20 [0] (attack bonus 0 - no penalty for untrained)
- **Saves:** D14 W15 P16 B17 S18 (with Dwarf Resilience bonuses if applicable)

**Implementation Note:** Smoothified Mode removes the attack penalty for Level 0 characters.

### 4. Roll Hit Points
Roll 1d4 for hit points, modified by CON as usual. Characters always start with at least 1 hit point, regardless of CON modifier.

**Re-rolling 1s and 2s:**
You must keep whatever hit points you roll. No re-rolling allowed for Level 0 characters (unlike 1st level adventurers).

**Advanced Mode Expansion - Human Blessed Ability:**
In Advanced mode with Human Racial Abilities enabled, Humans roll 1d4 twice and take the best result (but still no re-rolling of individual dice).

**Implementation Note:** This is a key difference from Level 1+ where re-rolling 1s/2s is allowed.

### 5. Choose or Roll Alignment
Decide whether your character is Lawful, Neutral, or Chaotic.

**For Multiple Characters (Funnel Adventures):**
Roll 1d6 for alignment:
- 1-2: Lawful
- 3-4: Neutral
- 5-6: Chaotic

### 6. Languages

**Original OSE:**
All characters speak Common. Characters with high INT also speak additional languages.

**Our Implementation:**
- **Humans:** Common, alignment language (+ INT bonus languages)
- **Demihumans:** Race-specific languages (see Racial Abilities section) (+ INT bonus languages)

### 7. Roll Background and Items

**Original OSE:**
Roll on the background table corresponding to your character's hit points. Your background determines an item and a weapon in your possession.

**Our Implementation:**
We use the background tables from the OSE article with some additions. Background is determined by final HP (after CON modifier, capped at 4, minimum 1).

**Background Tables:**
- **1 HP:** 12 professions (Acolyte, Actor, Alchemist's Apprentice, Artist, Beggar, Jeweller, Juggler, Money Lender, Scribe, Trumpet Player, Wealthy Heir, Wizard's Apprentice)
- **2 HP:** 12 professions (Butcher, Butler, Cook, Fletcher, Gambler, Horse Thief, Innkeeper, Navigator, Shepherd, Tailor, Trader, Weaver)
- **3 HP:** 12 professions (Bowyer, Cooper, Executioner, Fisher, Groom, Hermit, Kennel Master, Leatherworker, Limner, Sailor, Teamster, Trapper)
- **4 HP:** 12 professions (Armourer, Barber Surgeon, Blacksmith, Carpenter, Farmer, Forester, Hunter, Mason, Miner, Shipwright, Squire, Weaponsmith)

**Implementation Note:** We've added many additional professions beyond the original 48.

### 8. Note Armour Class

**Original OSE:**
Unless your profession indicates that you have armour, your character is unarmoured, with a base AC of 9 [10], modified by DEX as usual.

**Our Implementation:**
We use Ascending AC (the value in square brackets):
- **Unarmoured:** AC 10 + DEX modifier
- **Chain Mail:** AC 14 + DEX modifier (Armourer profession only)

### 9. Choose Race (Optional - Our Expansion)

**Original OSE:**
"Optionally, 1-in-6 level 0 characters is a demihuman. Roll 1d4: 1. dwarf, 2. elf, 3. gnome, 4. halfling."

**Our Implementation:**
We've significantly expanded this:
- **Default:** 1-in-4 chance of demihuman (roll 1d4: 1=demihuman, 2-4=human)
- **Race Selection:** Button grid to select specific race (Random, Human, Dwarf, Elf, Gnome, Halfling)
- **Advanced Mode:** Applies racial ability score modifiers and enforces racial minimums

**Racial Ability Score Modifiers (Advanced Mode Only):**
- **Human:** +1 CON, +1 CHA
- **Dwarf:** +1 CON, -1 CHA
- **Elf:** +1 DEX, -1 CON
- **Gnome:** No modifiers
- **Halfling:** -1 STR, +1 DEX

**Racial Minimum Requirements (Advanced Mode Only):**
- **Dwarf:** CON 9
- **Elf:** INT 9
- **Gnome:** CON 9, INT 9
- **Halfling:** CON 9, DEX 9

### 10. Note Racial Abilities (Our Expansion)

**Original OSE (Simplified):**
- All demihumans speak additional native languages
- All demihumans have 2-in-6 chance of hearing noises at doors
- **Dwarf:** Infravision 60', 2-in-6 detect room traps
- **Elf:** Infravision 60', immunity to ghoul paralysis
- **Gnome:** Infravision 90', +2 AC vs large opponents
- **Halfling:** +1 missile attack rolls, +2 AC vs large opponents

**Our Implementation (Expanded):**

**Human (Advanced Mode with Human Abilities Enabled):**
- Roll HP twice, take best (Blessed)
- Act first on tied initiative
- Retainers/mercenaries +1 loyalty/morale

**Dwarf:**
- Languages: Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold
- Small/normal weapons only (no longbows or two-handed swords)
- Detect construction tricks 2-in-6
- Detect room traps 2-in-6
- Infravision 60'
- Listen at doors 2-in-6
- **Resilience:** Bonus to Death/Wands/Spells saves based on CON (7-10: +2, 11-14: +3, 15-17: +4, 18: +5)

**Elf:**
- Languages: Alignment, Common, Elvish, Gnoll, Hobgoblin, Orcish
- Detect secret doors 2-in-6 when actively searching
- Infravision 60'
- Listen at doors 2-in-6
- Immunity to ghoul paralysis

**Gnome:**
- Languages: Alignment, Common, Dwarvish, Gnomish, Kobold, burrowing mammals
- Small/normal weapons only (no longbows or two-handed swords)
- Detect construction tricks 2-in-6
- Infravision 90'
- Listen at doors 2-in-6
- +2 AC vs large opponents
- **Magic Resistance:** Bonus to saves vs spells/wands/rods/staves based on CON (7-10: +2, 11-14: +3, 15-17: +4, 18: +5)

**Halfling:**
- Languages: Alignment, Common, Halfling
- Listen at doors 2-in-6
- +1 to missile attack rolls
- +2 AC vs large opponents

### 11. Name Character
Choose a name for your character or roll on the name tables.

**Original OSE Name Tables (d12 or d20):**
- Human (d20): 20 names
- Dwarf (d12): 12 names
- Elf (d12): 12 names
- Gnome (d12): 12 names
- Halfling (d12): 12 names

**Our Implementation:**
We've expanded the name tables significantly with 200+ names per race.

## Experience Points and Advancement

After gaining XP on an adventure, a level 0 character becomes a 1st level adventurer.

### 1. Choose a Class
Choose a character class that the level 0 character graduates into, bearing in mind minimum ability score requirements. Class selection can be based on ability scores, background, or deeds at level 0.

**Demihuman characters:** May select the equivalent demihuman class.

### 2. Roll Hit Points
Roll the Hit Die type for the chosen class and apply CON modifier. If this number is higher than the HP rolled at level 0, this becomes their new HP total. Otherwise, keep the HP rolled at level 0.

**Re-rolling 1s and 2s:** The referee may allow re-rolling 1s and 2s (we enable this by default for Level 1+).

## Funnel Adventures

Funnel adventures were popularized by Dungeon Crawl Classics RPG. In a funnel, a large group of level 0 characters is whittled down to survivors who become 1st level PCs.

### Funnel Process:

1. **Roll Characters:** Players roll up 10-20 level 0 characters - everyday folk whose village is threatened.

2. **Embark on Adventure:** Characters venture forth into peril. Any adventure suitable for 1st level characters can be used.

3. **Play:** Each player controls 3-5 characters. Lacking adventurer skills, they rely on collective wits and creativity. Some will sacrifice their lives for the group.

4. **Survivors:** Each player picks one survivor as their PC, choosing a class and advancing to 1st level.

## Key Differences from Level 1+

| Feature | Level 0 | Level 1+ |
|---------|---------|----------|
| **Hit Points** | 1d4 + CON (no re-roll) | Class hit die + CON (re-roll 1s/2s) |
| **Attack Bonus** | -1 (Normal) / 0 (Gygar) | 0 (THAC0 19 [0]) |
| **Saves** | D14 W15 P16 B17 S18 | Class-based |
| **Equipment** | From background | Purchase with 3d6×10 gp |
| **Weapons** | From background | Purchase (class restricted) |
| **Armor** | From background | Purchase (class restricted) |
| **Class** | None | Required |
| **Racial Modifiers** | Optional (Advanced mode) | Always (Advanced Method) |
| **Starting XP** | 0 | 0 |
| **Advancement** | To Level 1 after adventure | Normal XP progression |

## Optional Rules and Expansions

### Original OSE Optional Rules:
1. **Demihumans:** 1-in-6 chance (we use 1-in-4)
2. **Funnel Adventures:** Multiple characters per player

### Our Expansions:
1. ✅ **Ascending AC** - Always use ascending AC values
2. ✅ **Smoothified Mode** - No attack penalty at level 0 (THAC0 20 [0])
3. ✅ **Advanced Mode** - Racial ability modifiers and minimums
4. ✅ **Human Racial Abilities** - Optional human abilities in Advanced mode
5. ✅ **Dwarf Resilience** - CON-based saving throw bonuses
6. ✅ **Sub-par Character Re-rolling** - Allow re-rolling very poor characters
7. ✅ **Expanded Name Tables** - 200+ names per race
8. ✅ **Expanded Background Tables** - Many additional professions
9. ✅ **Force Race Selection** - UI controls to force specific races
10. ✅ **Tough Guys Mode** - Require 13+ in STR/DEX/INT/WIS and 2+ HP

### Optional Rules We Don't Use:
- ❌ **Re-rolling 1s and 2s for HP** - Level 0 keeps what they roll
- ❌ **Weapon Proficiencies** - All characters can use their background weapons
- ❌ **Multiple Classes** - Not applicable at Level 0

## Implementation Notes

### Mode System:
- **Normal Mode:** Standard OSE rules with attack penalty
- **Smoothified Mode:** Castle Gygar house rules (no attack penalty)
- **Advanced Mode:** Racial modifiers and minimums (checkbox)
- **Human Racial Abilities:** Optional human abilities (checkbox, requires Advanced)

### Character Generation Options:
- **Minimum Ability Scores:** Set minimums for each ability (default 3)
- **Force Demihuman:** Always roll demihuman race
- **Force Specific Race:** Select exact race (Human, Dwarf, Elf, Gnome, Halfling)
- **Tough Guys Mode:** Require higher stats and HP
- **Sub-par Re-rolling:** Automatic if character is too weak

### Output Formats:
- **Web Display:** HTML character sheet
- **PDF:** Printable character sheet (individual files when generating 4 characters)
- **PNG:** Image format character sheet
- **Markdown:** Text-based character sheet
- **JSON:** Data export

### PDF Character Sheet Layout:
The PDF character sheet has been optimized for Level 0 characters with the following sections:

**Left Column:**
- Character Name, Race, Level (0), Occupation, Hit Dice (1d4)
- Combat section (MAX HP, CUR HP, INIT, AC)
- Ability Scores (STR, INT, WIS, DEX, CON, CHA) with modifiers and effects
- Weapons and Skills section (weapon, attack bonus)
- Racial Abilities section (151pt height with text wrapping for longer descriptions)

**Right Column:**
- Saving Throws (Death, Wands, Petrify, Breath, Spells)
- Equipment section (armor, items)
- Class Abilities section (shows "None (0-level)" - ready for future level advancement)
- Starting AC and Starting Gold
- Treasure tracking (PP, GP, EP, SP, CP)

**Layout Features:**
- Racial abilities box expanded to accommodate all racial features
- Text wrapping for long ability descriptions
- Class Abilities section prepared for level advancement
- Treasure boxes aligned with racial abilities box
- 5pt gaps between sections for visual clarity

## Data Sources

- **OSE Level 0 Article** - Original rules (ose-level-0-*.txt.txt files)
- **OSE Advanced Fantasy Player's Tome** - Racial abilities and modifiers
- **Castle Gygar Module** - Smoothified Mode rules
- **Current Implementation** - Expanded tables and features

## Notes

- Level 0 characters are fragile (1-4 HP typically)
- Background determines starting equipment (no purchasing)
- No class abilities or special training
- Ideal for funnel adventures or retainer generation
- Can advance to any class that meets ability requirements
- Smoothified Mode makes Level 0 slightly more viable in combat
- Advanced Mode makes characters more like their Level 1+ counterparts
- Dwarf Resilience applies in both Basic and Advanced modes
