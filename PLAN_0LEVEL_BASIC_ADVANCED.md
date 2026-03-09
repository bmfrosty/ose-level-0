# Level 0 with Basic/Advanced Mode Plan

## Overview
Level 0 characters are always generated using Advanced Fantasy rules (demihumans, racial abilities, etc.), but they need to be compatible with both Basic and Advanced campaigns. The "Advanced" checkbox determines whether ability score adjustments are applied, which affects compatibility with the target campaign.

## Understanding the Relationship

### Level 0 Characters
- Always use Advanced Fantasy rules for generation
- Always have racial abilities (except Humans in Basic mode)
- 1d4 hit points (with CON modifier)
- Background-based equipment
- No class
- THACO 20 [-1] or [0] in Gygar mode
- Saves: D14 W15 P16 B17 S18

### The "Advanced" Checkbox for Level 0
The checkbox determines **ability score adjustments** and **target campaign compatibility**:

**Advanced Checkbox UNCHECKED (Basic-compatible Level 0)**
- No racial ability score adjustments applied
- Racial abilities shown (except Humans)
- Character can advance to Basic classes (Fighter, Cleric, Magic-User, Thief)
- Compatible with Basic OSE campaigns

**Advanced Checkbox CHECKED (Advanced-compatible Level 0)**
- Racial ability score adjustments applied (e.g., Dwarf +1 CON, -1 CHA)
- Racial minimum requirements enforced (e.g., Dwarf needs CON 9)
- Racial abilities shown (including Humans if enabled)
- Character can advance to Advanced classes (Dwarf, Elf, Gnome, Halfling, or Basic classes)
- Compatible with Advanced OSE campaigns
- Additional features like Dwarf Resilience

## Recommended Implementation

### Two-Axis System
Instead of three separate modes, use a two-axis system:

**Axis 1: Character Level**
- Level 0 (current default)
- Level 1+ (future expansion)

**Axis 2: Campaign Type (Advanced Checkbox)**
- Basic (unchecked)
- Advanced (checked)

This creates four combinations:
1. **Level 0 + Basic**: Level 0 for Basic campaigns
2. **Level 0 + Advanced**: Level 0 for Advanced campaigns (current "Advanced" mode)
3. **Level 1+ + Basic**: Future - Basic class characters
4. **Level 1+ + Advanced**: Future - Advanced class characters

### Racial Abilities Matrix

| Race | Level 0 Basic | Level 0 Advanced | Level 1+ Basic | Level 1+ Advanced |
|------|---------------|------------------|----------------|-------------------|
| **Human** | None | Optional (if enabled) | None | Optional (if enabled) |
| **Dwarf** | Yes (no adjustments) | Yes (with adjustments + Resilience) | N/A (no race in Basic) | Yes (full abilities) |
| **Elf** | Yes (no adjustments) | Yes (with adjustments) | N/A (no race in Basic) | Yes (full abilities) |
| **Gnome** | Yes (no adjustments) | Yes (with adjustments) | N/A (no race in Basic) | Yes (full abilities) |
| **Halfling** | Yes (no adjustments) | Yes (with adjustments) | N/A (no race in Basic) | Yes (full abilities) |

### Level 0 Racial Abilities (Both Basic and Advanced)

**Dwarf**
- Languages: Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold
- Small/normal weapons only (no longbows or two-handed swords)
- Detect construction tricks 2-in-6
- Detect room traps 2-in-6
- Infravision 60'
- Listen at doors 2-in-6
- Resilience bonus to saves based on CON (both Basic and Advanced)

**Elf**
- Languages: Alignment, Common, Elvish, Gnoll, Hobgoblin, Orcish
- Detect secret doors 2-in-6 when actively searching
- Infravision 60'
- Listen at doors 2-in-6
- Immunity to ghoul paralysis

**Gnome**
- Languages: Alignment, Common, Dwarvish, Gnomish, Kobold, burrowing mammals
- Small/normal weapons only (no longbows or two-handed swords)
- Detect construction tricks 2-in-6
- Infravision 90'
- Listen at doors 2-in-6
- +2 AC vs large opponents
- Magic Resistance: Bonus to saves vs spells/wands/rods/staves based on CON (7-10: +2, 11-14: +3, 15-17: +4, 18: +5)

**Halfling**
- Languages: Alignment, Common, Halfling
- Listen at doors 2-in-6
- +1 to missile attack rolls
- +2 AC vs large opponents

**Human (Advanced mode with Human Abilities enabled)**
- Roll HP twice, take best
- Act first on tied initiative
- Retainers/mercenaries +1 loyalty/morale

## Implementation Details

### Current State
The generator currently:
- Always generates Level 0 characters
- Uses "Advanced" checkbox to toggle ability adjustments
- Shows racial abilities when Advanced is checked
- Hides racial abilities when Advanced is unchecked (INCORRECT for demihumans)

### Required Changes

#### 1. Fix Racial Abilities Display
```javascript
function getRacialAbilities(race) {
    // Level 0 characters always show racial abilities (except Humans in Basic)
    if (race === "Human") {
        // Humans only get abilities in Advanced mode with toggle enabled
        return (isAdvanced && humanRacialAbilities) ? [...humanAbilities] : [];
    }
    
    // Demihumans always get their Level 0 abilities
    const baseAbilities = getLevel0RacialAbilities(race);
    
    // Advanced mode adds extra features (like Resilience for Dwarves)
    if (isAdvanced && race === "Dwarf") {
        return [...baseAbilities, "Resilience: Bonus to Death/Wands/Spells saves based on CON"];
    }
    
    return baseAbilities;
}
```

#### 2. Ability Score Adjustments
```javascript
function applyRaceAdjustments(results, race, isAdvanced) {
    // Only apply adjustments in Advanced mode
    if (!isAdvanced) {
        return results; // No adjustments for Basic-compatible Level 0
    }
    
    // Apply adjustments for Advanced-compatible Level 0
    const adjustments = getRaceAdjustments(race);
    // ... apply adjustments
}
```

#### 3. UI Labels
Update checkbox label to clarify:
- Current: "Advanced Mode"
- Better: "Advanced Campaign (ability adjustments)"
- Or: "Generate for Advanced Fantasy campaign"

#### 4. Character Sheet Indicator
Add indicator showing:
- "Level 0 (Basic-compatible)" or
- "Level 0 (Advanced Fantasy)"

## Advancement Paths

### From Level 0 Basic to Level 1
**Humans**: Can become Fighter, Cleric, Magic-User, or Thief
**Demihumans**: Can become Fighter, Cleric, Magic-User, or Thief (using Basic rules, losing racial abilities)

### From Level 0 Advanced to Level 1
**Humans**: Can become Fighter, Cleric, Magic-User, Thief, or Advanced classes
**Demihumans**: Can become their racial class (Dwarf, Elf, Gnome, Halfling) or Basic classes

## Benefits of This Approach

1. **Accurate to Rules**: Level 0 demihumans always have racial abilities
2. **Campaign Compatibility**: Clear distinction between Basic and Advanced target campaigns
3. **Flexibility**: Characters can be used in either campaign type
4. **Future-Proof**: Easy to add Level 1+ generation later
5. **User-Friendly**: Simple checkbox maintains current UI

## Migration Notes

### Current Behavior (INCORRECT)
- Advanced unchecked: No racial abilities shown for anyone
- Advanced checked: Racial abilities shown for all

### New Behavior (CORRECT)
- Advanced unchecked: Racial abilities shown for demihumans (not Humans), no ability adjustments
- Advanced checked: Racial abilities shown for all (if enabled for Humans), ability adjustments applied

### User Impact
- Users generating Basic-compatible Level 0 characters will now see racial abilities for demihumans (correct)
- No change for Advanced mode users
- Character sheets will be more accurate to OSE rules

## Testing Requirements

1. **Level 0 Basic Mode** (Advanced unchecked)
   - Verify demihumans show racial abilities
   - Verify no ability score adjustments
   - Verify Humans show no racial abilities
   - Verify no Resilience for Dwarves

2. **Level 0 Advanced Mode** (Advanced checked)
   - Verify all races show appropriate abilities
   - Verify ability score adjustments applied
   - Verify racial minimums enforced
   - Verify Resilience for Dwarves

3. **Race-Specific Tests**
   - Test each demihuman race in both modes
   - Verify language lists are correct
   - Verify special abilities display correctly

4. **PDF/Canvas Generation**
   - Verify sheets render correctly in both modes
   - Verify mode indicator shows correctly
   - Verify racial abilities section formats properly

## Future Expansion: Level 1+ Characters

When adding Level 1+ character generation:

### Level 1+ Basic
- Standard four classes (Fighter, Cleric, Magic-User, Thief)
- No racial abilities
- No demihumans (or demihumans treated as classes without racial abilities)

### Level 1+ Advanced
- All classes including racial classes (Dwarf, Elf, Gnome, Halfling)
- Full racial abilities
- Ability score adjustments
- Racial requirements

This maintains the same two-axis system and keeps the codebase organized.
