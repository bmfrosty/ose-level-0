# Basic vs Advanced Mode: Classes and Races

This document explains the fundamental difference between Basic and Advanced modes regarding classes and races.

## Naming Convention in Code

To avoid ambiguity in the codebase, we use the following naming convention:

- **`_CLASS`** suffix: Indicates a class (used in both Basic and Advanced modes)
  - Examples: `Fighter_CLASS`, `Cleric_CLASS`, `Dwarf_CLASS`, `Elf_CLASS`
- **`_RACE`** suffix: Indicates a race (used only in Advanced mode)
  - Examples: `Human_RACE`, `Dwarf_RACE`, `Elf_RACE`, `Halfling_RACE`, `Gnome_RACE`

This distinction is important because "Dwarf", "Elf", "Halfling", and "Gnome" can refer to either:
1. A **class** in Basic Mode (race-as-class)
2. A **race** in Advanced Mode (race + separate class)

### Code Examples

**Basic Mode:**
```javascript
// "Dwarf" refers to the Dwarf_CLASS (a complete class with XP table, HD, saves, etc.)
const xp = getXPRequired("Dwarf_CLASS", 5);
const hd = getHitDice("Dwarf_CLASS", 5);
```

**Advanced Mode:**
```javascript
// "Dwarf" refers to Dwarf_RACE (racial abilities only)
// Combined with Fighter_CLASS (XP table, HD, saves, etc.)
const racialAbilities = getRacialAbilities("Dwarf_RACE");
const xp = getXPRequired("Fighter_CLASS", 5);
const hd = getHitDice("Fighter_CLASS", 5);
```

**Backward Compatibility:**
The code maintains backward compatibility - you can still use legacy names like `"Dwarf"` or `"Fighter"` without the suffix, and they will be automatically converted to the appropriate `_CLASS` name internally.

## Basic Mode (OSE Basic)

In Basic Mode, **race and class are combined**. Demihumans ARE their class:

### Human Classes (4)
- **Cleric** - Human only
- **Fighter** - Human only
- **Magic-User** - Human only
- **Thief** - Human only
- **Spellblade** - Human only (added class)

### Demihuman Classes (4)
- **Dwarf** - This is both the race AND the class
- **Elf** - This is both the race AND the class
- **Halfling** - This is both the race AND the class
- **Gnome** - This is both the race AND the class

**Key Point:** In Basic Mode, you don't choose "Dwarf Fighter" - you choose "Dwarf" which IS a fighter-type class with racial abilities built in.

## Advanced Mode (OSE Advanced Fantasy)

In Advanced Mode, **race and class are separate**. You choose a race, then choose a class:

### Step 1: Choose Race
- Human
- Dwarf
- Elf
- Halfling
- Gnome

### Step 2: Choose Class (based on race)

#### Cleric
- **Available to:** Human, Dwarf, Gnome
- **Requirements:** Dwarf/Gnome need WIS 9+

#### Fighter
- **Available to:** Human, Dwarf, Elf, Halfling, Gnome
- **Requirements:** None (any race can be a fighter)

#### Magic-User
- **Available to:** Human, Elf
- **Requirements:** None

#### Thief
- **Available to:** Human, Halfling, Gnome
- **Requirements:** None

#### Spellblade
- **Available to:** Human, Elf
- **Requirements:** INT 9+, STR 9+

### Demihuman Classes (Basic Mode Only)
- **Dwarf** - Not used in Advanced Mode (use Dwarf race + Fighter/Cleric class)
- **Elf** - Not used in Advanced Mode (use Elf race + Fighter/Magic-User/Spellblade class)
- **Halfling** - Not used in Advanced Mode (use Halfling race + Fighter/Thief class)
- **Gnome** - Not used in Advanced Mode (use Gnome race + Fighter/Cleric/Thief class)

## Examples

### Basic Mode Examples
- "I'm playing a Dwarf" = Dwarf class (fighter-type with racial abilities)
- "I'm playing an Elf" = Elf class (fighter/magic-user with racial abilities)
- "I'm playing a Human Fighter" = Fighter class

### Advanced Mode Examples
- "I'm playing a Dwarf Fighter" = Dwarf race + Fighter class
- "I'm playing a Dwarf Cleric" = Dwarf race + Cleric class (needs WIS 9+)
- "I'm playing an Elf Magic-User" = Elf race + Magic-User class
- "I'm playing an Elf Spellblade" = Elf race + Spellblade class (needs INT 9+, STR 9+)
- "I'm playing a Halfling Thief" = Halfling race + Thief class
- "I'm playing a Gnome Fighter" = Gnome race + Fighter class

## Level 0 Characters

Level 0 characters **always use Advanced-style** (race + no class yet):
- They have a race (Human, Dwarf, Elf, Halfling, Gnome)
- They have racial abilities
- They have NO class (they're 0-level)
- When they advance to level 1, they choose a class based on their race

## Class Availability Matrix

### Advanced Mode Class/Race Combinations

| Class | Human | Dwarf | Elf | Halfling | Gnome |
|-------|-------|-------|-----|----------|-------|
| **Cleric** | ✓ | ✓ (WIS 9+) | ✗ | ✗ | ✓ (WIS 9+) |
| **Fighter** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Magic-User** | ✓ | ✗ | ✓ | ✗ | ✗ |
| **Thief** | ✓ | ✗ | ✗ | ✓ | ✓ |
| **Spellblade** | ✓ (INT 9+, STR 9+) | ✗ | ✓ (INT 9+, STR 9+) | ✗ | ✗ |

### Basic Mode Classes

| Class | Available |
|-------|-----------|
| **Cleric** | Human only |
| **Fighter** | Human only |
| **Magic-User** | Human only |
| **Thief** | Human only |
| **Spellblade** | Human only |
| **Dwarf** | Dwarf race (class) |
| **Elf** | Elf race (class) |
| **Halfling** | Halfling race (class) |
| **Gnome** | Gnome race (class) |

## Why This Matters

### For Character Creation
- **Basic Mode:** Choose one thing (your class, which may include race)
- **Advanced Mode:** Choose two things (your race, then your class)

### For Racial Abilities
- **Basic Mode:** Racial abilities are part of the class description
- **Advanced Mode:** Racial abilities apply regardless of class chosen

### For Level Limits
- **Basic Mode:** Demihuman classes have level limits (Dwarf 12, Elf 10, Halfling 8, Gnome 8)
- **Advanced Mode:** 
  - OSE Standard: Same level limits apply to demihumans regardless of class
  - Smoothified Mode: No level limits (all reach 14, except Spellblade at 10)

## Implementation in This Generator

### Level 0 (Current)
- Uses Advanced-style: Race + racial abilities, no class
- All races available: Human, Dwarf, Elf, Halfling, Gnome

### Level 1+ (Future)
- **Basic Mode:** 
  - Choose from 9 classes (Cleric, Fighter, Magic-User, Thief, Spellblade, Dwarf, Elf, Halfling, Gnome)
  - Race is determined by class choice
- **Advanced Mode:**
  - Choose race first (Human, Dwarf, Elf, Halfling, Gnome)
  - Choose class second (based on race availability matrix above)
  - Apply racial abilities + class abilities

## Summary

**Basic Mode = Race IS Class** (for demihumans)
- Dwarf = Dwarf class
- Elf = Elf class
- Halfling = Halfling class
- Gnome = Gnome class

**Advanced Mode = Race + Class** (separate choices)
- Dwarf + Fighter = Dwarf Fighter
- Elf + Magic-User = Elf Magic-User
- Halfling + Thief = Halfling Thief
- Gnome + Cleric = Gnome Cleric (if WIS 9+)

This is the fundamental architectural difference between the two modes.
