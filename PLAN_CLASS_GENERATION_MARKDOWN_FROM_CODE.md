# Plan: Dynamic Class Document Generation from Code

> **Status:** FUTURE WORK - Not yet started
> **Priority:** Low - Current static markdown files in CLASS_MARKDOWN/ are working well
> **Purpose:** Automate class documentation generation from code data structures

## Overview

Create a system to dynamically generate class markdown documents from the structured data in `class-data-ose.js`, `class-data-gygar.js`, and `class-data-shared.js`. This will allow us to generate documentation for any class/race combination without manually maintaining separate markdown files.

**Current State:**
- Static markdown files exist in CLASS_MARKDOWN/ directory (GYGAR_*.md files)
- These files are manually maintained and used by classes.html
- Works well for current needs

**Future Benefits:**
- Single source of truth (code → documentation)
- Automatic regeneration when data changes
- Can generate any valid race/class combination on demand

## Problem Statement

Currently, we have:
- **Static markdown files**: OSE_FIGHTER.md, OSE_CLERIC.md, GYGAR_DWARF.md, etc.
- **Structured code data**: class-data-ose.js, class-data-gygar.js, class-data-shared.js
- **Duplication**: Same data exists in both places
- **Maintenance burden**: Updates must be made in multiple places
- **Limited flexibility**: Can't easily generate docs for arbitrary race/class combinations

## Solution: Dynamic Generation

Create a markdown generator that:
1. Reads structured data from JavaScript modules
2. Generates formatted markdown tables and sections
3. Supports both Basic Mode (race-as-class) and Advanced Mode (race + class)
4. Can generate documentation for any valid combination

## Architecture

### Input Sources

**1. class-data-shared.js** (Mode-independent data)
```javascript
export const CLASS_INFO = {
  "Fighter_CLASS": {
    name: "Fighter",
    description: "Warriors skilled in combat",
    primeRequisite: "STR",
    hitDie: "1d8",
    maxLevel: 14
  },
  // ... etc
};

export const HIT_DICE_PROGRESSIONS = { ... };
export const ARCANE_SPELL_SLOTS = { ... };
export const DIVINE_SPELL_SLOTS = { ... };
export const THIEF_SKILLS = { ... };
export const TURN_UNDEAD = { ... };
```

**2. class-data-ose.js** (OSE Standard mode-specific)
```javascript
export const XP_REQUIREMENTS = {
  "Fighter_CLASS": [0, 2000, 4000, ...],
  // ... etc
};

export const SAVING_THROWS = {
  "Fighter_CLASS": {
    death: [12, 11, 10, ...],
    wands: [13, 12, 11, ...],
    // ... etc
  }
};

export const ATTACK_BONUS_SCALE = { ... };
```

**3. race-adjustments.js** (Advanced Mode race data)
```javascript
export const RACE_ADJUSTMENTS = {
  "Dwarf_RACE": { STR: 0, DEX: 0, CON: 1, INT: 0, WIS: 0, CHA: -1 },
  // ... etc
};

export const RACE_MINIMUMS = {
  "Dwarf_RACE": { CON: 9 },
  // ... etc
};
```

**4. racial-abilities.js** (Race abilities)
```javascript
export const RACIAL_ABILITIES = {
  "Dwarf_RACE": [
    "Languages: Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold",
    "Infravision 60'",
    // ... etc
  ]
};
```

### Output Format

Generate markdown documents with the following structure:

#### Basic Mode (Race-as-Class)
```markdown
# Dwarf (OSE Standard)

## Overview
[Description from CLASS_INFO]

**Prime Requisite:** STR
**Hit Die:** 1d8
**Maximum Level:** 12

## Experience Points
| Level | XP Required | HD | Attack Bonus |
|-------|-------------|-----|--------------|
| 1     | 0           | 1d8 | +0           |
| 2     | 2,200       | 2d8 | +0           |
...

## Saving Throws
| Level | Death | Wands | Paralysis | Breath | Spells |
|-------|-------|-------|-----------|--------|--------|
| 1     | 8     | 9     | 10        | 13     | 12     |
...

## Class Abilities
[From CLASS_ABILITIES]

## Racial Abilities
[From RACIAL_ABILITIES for Dwarf_RACE]
```

#### Advanced Mode (Race + Class)
```markdown
# Dwarf Fighter (OSE Standard)

## Overview
A Dwarf who has chosen the path of the Fighter.

**Race:** Dwarf
**Class:** Fighter
**Prime Requisite:** STR
**Hit Die:** 1d8
**Maximum Level:** 14

## Racial Adjustments
- CON: +1
- CHA: -1

**Minimum Requirements:**
- CON: 9

## Experience Points
[Fighter_CLASS XP table]

## Saving Throws
[Fighter_CLASS saves + Dwarf_RACE bonuses]

## Class Abilities
[Fighter_CLASS abilities]

## Racial Abilities
[Dwarf_RACE abilities]
```

## Implementation Plan

### Phase 1: Create Markdown Generator Module
- [ ] Create `class-markdown-generator.js`
- [ ] Import all data sources (class-data-ose.js, class-data-shared.js, race-adjustments.js, racial-abilities.js)
- [ ] Create helper functions for formatting tables
- [ ] Create helper functions for formatting sections
- [ ] Export main generation function

### Phase 2: Implement Table Generators
- [ ] `generateXPTable(className, mode)` - XP, HD, Attack Bonus table
- [ ] `generateSavingThrowsTable(className, raceName, mode)` - Saving throws with racial bonuses
- [ ] `generateSpellSlotsTable(className, mode)` - For spellcasting classes
- [ ] `generateThiefSkillsTable(mode)` - For thief classes
- [ ] `generateTurnUndeadTable()` - For clerics

### Phase 3: Implement Section Generators
- [ ] `generateOverview(className, raceName, mode)` - Header and basic info
- [ ] `generateClassAbilities(className)` - Class-specific abilities
- [ ] `generateRacialAbilities(raceName)` - Race-specific abilities
- [ ] `generateRacialAdjustments(raceName)` - Ability score adjustments (Advanced Mode)
- [ ] `generateCombinedDocument(className, raceName, mode)` - Combine all sections

### Phase 4: Create CLI Tool
- [ ] Create `generate-class-docs.js` script
- [ ] Accept command-line arguments: `--class`, `--race`, `--mode`, `--output`
- [ ] Support batch generation (all classes, all races, all combinations)
- [ ] Add validation for valid class/race combinations
- [ ] Add option to generate to stdout or file

### Phase 5: Integration with Existing System
- [ ] Update `markdown-generator.js` to use new system
- [ ] Add option to generate class docs on-demand
- [ ] Consider caching generated docs
- [ ] Add regeneration trigger when data changes

### Phase 6: Testing and Validation
- [ ] Test generation for all Basic Mode classes
- [ ] Test generation for all Advanced Mode race/class combinations
- [ ] Verify table formatting
- [ ] Verify data accuracy
- [ ] Compare with existing static markdown files

### Phase 7: Documentation
- [ ] Document the generation system
- [ ] Create examples of generated output
- [ ] Document valid class/race combinations
- [ ] Update PLAN_CLASSES_IMPORT.md

## Data Structure Examples

### Basic Mode Generation
```javascript
// Generate Dwarf class document (OSE Standard)
const markdown = generateClassDocument({
  className: "Dwarf_CLASS",
  mode: "ose",
  type: "basic"
});
```

### Advanced Mode Generation
```javascript
// Generate Dwarf Fighter document (OSE Standard)
const markdown = generateClassDocument({
  className: "Fighter_CLASS",
  raceName: "Dwarf_RACE",
  mode: "ose",
  type: "advanced"
});
```

### Batch Generation
```javascript
// Generate all OSE Standard classes
generateAllClassDocuments({
  mode: "ose",
  outputDir: "./generated-docs/ose"
});

// Generate all Gygar classes
generateAllClassDocuments({
  mode: "gygar",
  outputDir: "./generated-docs/gygar"
});

// Generate all Advanced Mode combinations
generateAllAdvancedCombinations({
  mode: "ose",
  outputDir: "./generated-docs/ose-advanced"
});
```

## CLI Usage Examples

```bash
# Generate a single Basic Mode class
node generate-class-docs.js --class Dwarf_CLASS --mode ose --output OSE_DWARF.md

# Generate a single Advanced Mode combination
node generate-class-docs.js --class Fighter_CLASS --race Dwarf_RACE --mode ose --output OSE_DWARF_FIGHTER.md

# Generate all Basic Mode classes for OSE
node generate-class-docs.js --mode ose --type basic --output-dir ./docs/ose

# Generate all Advanced Mode combinations for OSE
node generate-class-docs.js --mode ose --type advanced --output-dir ./docs/ose-advanced

# Generate to stdout (for piping or preview)
node generate-class-docs.js --class Fighter_CLASS --mode ose --stdout
```

## Valid Class/Race Combinations

### Basic Mode (Race-as-Class)
**OSE Standard:**
- Fighter_CLASS (Human)
- Cleric_CLASS (Human)
- Magic-User_CLASS (Human)
- Thief_CLASS (Human)
- Spellblade_CLASS (Human)
- Dwarf_CLASS
- Elf_CLASS
- Halfling_CLASS
- Gnome_CLASS

**Gygar (Smoothified):**
- Same as OSE Standard, but with different XP/saves/level limits

### Advanced Mode (Race + Class)

| Class | Human | Dwarf | Elf | Halfling | Gnome |
|-------|-------|-------|-----|----------|-------|
| **Cleric** | ✓ | ✓ (WIS 9+) | ✗ | ✗ | ✓ (WIS 9+) |
| **Fighter** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Magic-User** | ✓ | ✗ | ✓ | ✗ | ✗ |
| **Thief** | ✓ | ✗ | ✗ | ✓ | ✓ |
| **Spellblade** | ✓ (INT 9+, STR 9+) | ✗ | ✓ (INT 9+, STR 9+) | ✗ | ✗ |

## Template Structure

### Basic Mode Template
```markdown
# {CLASS_NAME} ({MODE_NAME})

## Overview
{DESCRIPTION}

**Prime Requisite:** {PRIME_REQ}
**Hit Die:** {HIT_DIE}
**Maximum Level:** {MAX_LEVEL}

## Experience Points and Progression
{XP_TABLE}

## Saving Throws
{SAVING_THROWS_TABLE}

{SPELL_SLOTS_TABLE if spellcaster}
{THIEF_SKILLS_TABLE if thief}
{TURN_UNDEAD_TABLE if cleric}

## Class Abilities
{CLASS_ABILITIES}

## Racial Abilities
{RACIAL_ABILITIES if demihuman}
```

### Advanced Mode Template
```markdown
# {RACE_NAME} {CLASS_NAME} ({MODE_NAME})

## Overview
A {RACE_NAME} who has chosen the path of the {CLASS_NAME}.

**Race:** {RACE_NAME}
**Class:** {CLASS_NAME}
**Prime Requisite:** {PRIME_REQ}
**Hit Die:** {HIT_DIE}
**Maximum Level:** {MAX_LEVEL}

## Racial Adjustments
{ABILITY_ADJUSTMENTS}

**Minimum Requirements:**
{MINIMUM_REQUIREMENTS}

## Experience Points and Progression
{XP_TABLE}

## Saving Throws
{SAVING_THROWS_TABLE with racial bonuses}

{SPELL_SLOTS_TABLE if spellcaster}
{THIEF_SKILLS_TABLE if thief}
{TURN_UNDEAD_TABLE if cleric}

## Class Abilities
{CLASS_ABILITIES}

## Racial Abilities
{RACIAL_ABILITIES}
```

## Benefits

1. **Single Source of Truth**: Data lives only in code
2. **Consistency**: All docs generated from same data
3. **Flexibility**: Generate any valid combination on-demand
4. **Maintainability**: Update data once, regenerate all docs
5. **Validation**: Can validate combinations programmatically
6. **Automation**: Can regenerate docs as part of build process
7. **Extensibility**: Easy to add new modes or combinations

## Future Enhancements

- [ ] Generate HTML versions
- [ ] Generate PDF versions
- [ ] Add character sheet templates
- [ ] Add level-up guides
- [ ] Add comparison tables
- [ ] Add interactive web interface
- [ ] Add search/filter functionality
- [ ] Add export to various formats (JSON, YAML, etc.)

## Related Documents

- **PLAN_NAMING_AND_SHARED_CLASS_DATA.md** - Class data structure
- **PLAN_RACE_NAMING.md** - Race data structure
- **BASIC_VS_ADVANCED_CLASSES.md** - Mode differences
- **PLAN_CLASSES_IMPORT.md** - Class import plan

## Success Criteria

- [ ] Can generate markdown for any Basic Mode class
- [ ] Can generate markdown for any valid Advanced Mode combination
- [ ] Generated docs match format of existing static docs
- [ ] All data is accurate and complete
- [ ] CLI tool is easy to use
- [ ] Documentation is clear and comprehensive
- [ ] System is extensible for future modes/classes

## Notes

- This system will eventually replace static markdown files
- Keep static files during transition for comparison
- Consider version control for generated files
- May want to add generation timestamp/metadata to docs
- Should validate data completeness before generation
- Consider adding warnings for missing data
