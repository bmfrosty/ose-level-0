# OSE Standard vs Smoothified Mode Comparison

This document compares the progression differences between OSE Standard and Smoothified Mode classes.

## Overview

Smoothified Mode takes the OSE Standard classes and applies consistent smoothing to their progression tables, particularly for to-hit bonuses and saving throws. The goal is to provide more frequent, incremental improvements rather than large jumps at specific levels.

**Key Difference:** OSE uses irregular progression with large jumps at specific breakpoints, while Gygar smooths progressions to provide more consistent, gradual improvements nearly every level.

---

## Section 1: To-Hit Progressions

Both OSE Standard and Smoothified Mode use three distinct to-hit progression tracks, carefully assigned to classes based on their combat role. The key difference is that OSE uses irregular jumps while Gygar smooths them into gradual increases.

### Fighter Progression (Best Combat Capability)

**Classes Using This Progression:**
- **OSE:** Fighter, Dwarf, Elf, Halfling
- **Gygar:** Fighter, Dwarf, Elf, Halfling, Spellblade

**OSE Standard Progression:**
- Levels 1-3: 19 [0] (no bonus)
- Levels 4-6: 17 [+2] (jump of +2)
- Levels 7-9: 14 [+5] (jump of +3)
- Levels 10-12: 12 [+7] (jump of +2)
- Levels 13-14: 10 [+9] (jump of +2)

**Smoothified Mode Progression:**
- +1, +2, +3, +4, +5, +5, +6, +6, +7, +7, +7, +8, +9, +9
- Increases nearly every level or every other level
- Same final value at level 14: +9

**Design Philosophy:** Intentionally front-loaded so fighters are better at hitting things starting at level 1. This gives martial classes an immediate combat advantage over spellcasters.

### Cleric/Thief Progression (Moderate Combat Capability)

**Classes Using This Progression:**
- **OSE:** Cleric, Thief
- **Gygar:** Cleric, Thief

**OSE Standard Progression:**
- Levels 1-4: 19 [0] (no bonus)
- Levels 5-8: 17 [+2] (jump of +2)
- Levels 9-12: 14 [+5] (jump of +3)
- Levels 13-14: 12 [+7] (jump of +2)

**Smoothified Mode Progression:**
- +0, +1, +1, +2, +2, +3, +3, +4, +5, +5, +6, +6, +7, +7
- Increases nearly every level or every other level
- Same final value at level 14: +7

**Design Philosophy:** Starts slower than fighters but maintains steady growth. These classes balance combat with other abilities (divine magic, thievery).

### Magic-User Progression (Weakest Combat Capability)

**Classes Using This Progression:**
- **OSE:** Magic-User, Gnome
- **Gygar:** Magic-User, Gnome

**OSE Standard Progression:**
- Levels 1-5: 19 [0] (no bonus)
- Levels 6-10: 17 [+2] (jump of +2)
- Levels 11-14: 14 [+5] (jump of +3)

**Smoothified Mode Progression:**
- +0, +0, +1, +1, +2, +2, +2, +3, +3, +4, +4, +5, +5, +5
- Increases every 1-2 levels instead of every 5-6 levels
- Same final value at level 14: +5

**Design Philosophy:** Slowest progression, as these classes rely primarily on magic rather than physical combat.

---

## Section 2: Saving Throw Progressions

OSE Standard uses irregular saving throw progressions with long flat periods followed by sudden jumps. Smoothified Mode smooths these into more frequent, incremental improvements.

### Example: Cleric Saving Throws

**OSE Irregularity:** Irregular jumps with some saves staying flat for 4 levels. The "Spells" save is particularly flat.

**Spells Save Comparison:**
- **OSE:** 15, 15, 15, 15, 12, 12, 12, 12, 9, 9, 9, 9, 7, 7
- **Gygar:** 15, 15, 14, 13, 12, 12, 11, 10, 9, 9, 9, 8, 7, 7

**Death Save Comparison:**
- **OSE:** 11, 11, 11, 11, 9, 9, 9, 9, 6, 6, 6, 6, 3, 3
- **Gygar:** 11, 11, 10, 10, 9, 9, 8, 7, 6, 6, 5, 4, 3, 3

**Gygar Improvement:** More frequent improvements throughout the progression instead of staying flat for 4 levels at a time. Both reach the same or similar final values, but Gygar provides more consistent growth and reduces "dead levels" where nothing improves.

**Pattern Applies to All Classes:** All OSE classes have similar irregularity with long flat periods. Gygar smooths all of them to provide more frequent improvements while maintaining the same final values.

---

## Section 3: Other Class Feature Differences

### Spellblade (Gygar Only)

**Smoothified Mode introduces the Spellblade class:**
- Pure class without racial abilities
- Same smooth progressions as Gygar Elf
- Available to both humans and elves
- Uses Fighter to-hit progression
- See ELF_VS_SPELLBLADE.md for detailed comparison

### Racial Abilities

**All racial abilities remain identical between OSE and Gygar:**
- Dwarf: Detect construction tricks, detect room traps, infravision 60', listen at doors
- Elf: Detect secret doors, ghoul immunity, infravision 60', listen at doors
- Halfling: Defensive bonus vs large, hiding, initiative bonus, listen at doors, missile bonus
- Gnome: Defensive bonus vs large, detect construction tricks, hiding, infravision 90', listen at doors, speak with burrowing mammals

---

## Summary

### What Stays the Same

- **Hit Dice:** Identical
- **XP Requirements:** Identical
- **Spell Progression:** Identical (for spellcasting classes)
- **Racial Abilities:** Identical (detect doors, hiding, infravision, etc.)
- **Final Values:** Same or very similar at maximum level
- **Three To-Hit Tracks:** Both systems use Fighter, Cleric/Thief, and Magic-User progressions

### What Changes

- **To-Hit Progression:** Smoothed from large jumps to gradual increases
- **Saving Throws:** More frequent improvements instead of flat periods
- **Power Curve:** More consistent growth throughout levels

### Design Philosophy

**OSE Standard** follows the classic B/X D&D design where:
- Characters experience distinct "tiers" of power with clear breakpoints
- Higher XP bonuses available for exceptional ability scores
- Emphasizes milestone moments and clear power tiers

**Smoothified Mode** maintains the same overall power level but:
- Distributes improvements more evenly, reducing "dead levels"
- Provides more frequent rewards for leveling up
- Emphasizes consistent growth and flexible character creation

**Result:** Same destination, different journey. Both approaches are valid and create slightly different play experiences. The choice between them is primarily aesthetic and depends on preferred play style and campaign needs.
