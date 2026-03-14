# JavaScript Module Refactoring Plan

## Overview
Refactor inline JavaScript from basic.html and advanced.html into separate ES6 modules for better code organization, reusability, and maintainability.

## Current State
- **basic.html**: ✅ Refactored into ES6 modules (basic-utils.js, basic-character-gen.js, basic-ui.js)
- **advanced.html**: Similar inline JavaScript (to be implemented)
- **0level.html** (formerly index.html): Uses older module system (main-generator.js, etc.)
- **index.html** (formerly about.html): Landing page with links to all generators

## Goals
1. ✅ Extract shared code into reusable ES6 modules
2. Maintain separate UI logic for basic.html, advanced.html, 0level.html
3. ✅ Use consistent ES6 module pattern across all generators
4. ✅ Improve code organization and maintainability
5. ✅ Enable easier testing and debugging
6. **NEW:** Share as much code as possible between 0level, basic, and advanced generators
7. **NEW:** Complete refactoring BEFORE finishing Advanced Mode implementation

## Proposed Module Structure

### New Shared Modules

#### 1. `ability-scores.js` - Ability Score Utilities
**Purpose:** Shared ability score calculations and utilities

**Exports:**
```javascript
// Calculate ability modifier (-3 to +3)
export function calculateModifier(score)

// Format modifier for display (+1, -2, etc.)
export function formatModifier(mod)

// Calculate XP bonus from prime requisite (-20% to +10%)
export function calculateXPBonus(score)

// Get prime requisites for a class
export function getPrimeRequisites(className)

// Roll a single ability score (3d6) with minimum
export function rollAbilityScore(minimum, abilityName)

// Check if scores meet Tough Characters requirements
export function meetsToughCharactersRequirements(scores)

// Roll all ability scores with options
export function rollAbilities(options)
// options: { minimumScores, toughCharacters, logging }
```

**Used by:** basic.html, advanced.html, index.html

---

#### 2. `hit-points.js` - Hit Points Generation
**Purpose:** HP rolling logic for all character types

**Exports:**
```javascript
// Roll a single die
export function rollSingleDie(sides)

// Parse hit dice string (e.g., "3d8", "9d8+2*")
export function parseHitDice(hitDiceString)

// Roll hit points for a character
export function rollHitPoints(options)
// options: { className, level, conModifier, includeLevel0HP, healthyCharacters, classData, logging }
```

**Used by:** basic.html, advanced.html

---

#### 3. `class-progression.js` - Class Progression Data
**Purpose:** Retrieve class progression data (saves, attack bonus, XP)

**Exports:**
```javascript
// Get class progression data (saving throws, attack bonus, XP)
export function getClassProgressionData(options)
// options: { className, level, abilityScores, classData, logging }

// Get class-specific features (spell slots, thief skills, turn undead)
export function getClassFeatures(options)
// options: { className, level, classData, logging }

// Get racial abilities for demihuman classes
export function getRacialAbilities(className)
```

**Used by:** basic.html, advanced.html

---

#### 4. `character-object.js` - Character Object Creation
**Purpose:** Create comprehensive character objects

**Exports:**
```javascript
// Create a complete character object
export function createCharacter(options)
// options: { level, className, race, mode, abilityScores, hp, ... }

// Validate character data
export function validateCharacter(character)

// Calculate derived stats (AC, saves with bonuses, etc.)
export function calculateDerivedStats(character)
```

**Used by:** basic.html, advanced.html, index.html

---

#### 5. `character-logger.js` - Character Generation Logging
**Purpose:** Comprehensive logging for character generation

**Exports:**
```javascript
// Create a new log
export function createLog()

// Log ability score generation
export function logAbilityScores(log, scores, options)

// Log HP generation
export function logHitPoints(log, hp, options)

// Log class progression data
export function logClassProgression(log, progression)

// Format log for display
export function formatLog(log)
```

**Used by:** basic.html, advanced.html

---

### Page-Specific Modules

#### 6. `basic-generator.js` - Basic Mode Generator
**Purpose:** Basic mode-specific logic (race-as-class)

**Exports:**
```javascript
// Initialize Basic Mode UI
export function initializeBasicUI()

// Update Basic Mode UI based on selections
export function updateBasicUI(state)

// Generate Basic Mode character
export function generateBasicCharacter(state)

// Display Basic Mode character
export function displayBasicCharacter(character)
```

**Used by:** basic.html only

---

#### 7. `advanced-generator.js` - Advanced Mode Generator
**Purpose:** Advanced mode-specific logic (race + class)

**Exports:**
```javascript
// Initialize Advanced Mode UI
export function initializeAdvancedUI()

// Update Advanced Mode UI based on selections
export function updateAdvancedUI(state)

// Apply racial ability adjustments
export function applyRacialAdjustments(baseScores, race)

// Generate Advanced Mode character
export function generateAdvancedCharacter(state)

// Display Advanced Mode character
export function displayAdvancedCharacter(character)
```

**Used by:** advanced.html only

---

#### 8. `level0-generator.js` - Level 0 Generator
**Purpose:** Level 0-specific logic (refactored from main-generator.js)

**Exports:**
```javascript
// Initialize Level 0 UI
export function initializeLevel0UI()

// Generate Level 0 character
export function generateLevel0Character(options)

// Display Level 0 character
export function displayLevel0Character(character)
```

**Used by:** index.html only

---

### Existing Modules (Keep As-Is)

These modules are already well-organized:
- ✅ `class-data-ose.js` - OSE class data
- ✅ `class-data-gygar.js` - Gygar class data
- ✅ `class-data-shared.js` - Shared class data
- ✅ `racial-abilities.js` - Racial abilities
- ✅ `weapons-and-armor.js` - Weapons and armor data
- ✅ `dice-utils.js` - Dice rolling utilities (may merge into hit-points.js)
- ✅ `ose-modifiers.js` - OSE modifiers

---

## Refactoring Steps

### Phase 1: Extract Basic Mode Modules ✅ COMPLETE
- [x] Create `basic-utils.js` (170 lines) ✅
  - [x] Extract ability score functions from basic.html ✅
  - [x] Extract utility functions (modifiers, XP bonus, prime requisites) ✅
  - [x] Add ES6 exports ✅
  - [x] Add JSDoc comments ✅
  - [x] Test with basic.html ✅
- [x] Create `basic-character-gen.js` (380 lines) ✅
  - [x] Extract HP rolling functions from basic.html ✅
  - [x] Extract ability rolling functions ✅
  - [x] Extract class progression functions ✅
  - [x] Extract class features functions ✅
  - [x] Add ES6 exports ✅
  - [x] Add JSDoc comments ✅
  - [x] Test with basic.html ✅
- [x] Create `basic-ui.js` (420 lines) ✅
  - [x] Extract Basic Mode UI logic from basic.html ✅
  - [x] Extract state management ✅
  - [x] Extract event handlers ✅
  - [x] Add ES6 exports ✅
  - [x] Add JSDoc comments ✅
  - [x] Test with basic.html ✅
- [x] Update `basic.html` (200 lines) ✅
  - [x] Import basic-ui.js module ✅
  - [x] Remove inline JavaScript (reduced from 1100+ lines) ✅
  - [x] Keep only initialization code (one line: `initialize()`) ✅
  - [x] Test thoroughly ✅

### Phase 2: Extract Shared Utilities - **HIGH PRIORITY** 🔥
**Do this BEFORE implementing Advanced Mode!**

#### Phase 2A: Create shared-ability-scores.js - ✅ COMPLETE
- [x] Create `shared-ability-scores.js` ✅
- [x] Extract from basic-utils.js: ✅
  - [x] calculateModifier(score) ✅
  - [x] formatModifier(mod) ✅
  - [x] calculateXPBonus(score) ✅
  - [x] getPrimeRequisites(className) ✅
  - [x] meetsToughCharactersRequirements(scores) ✅
  - [x] meetsPrimeRequisiteRequirements(scores, className) ✅
- [x] Extract from basic-character-gen.js: ✅
  - [x] rollSingleDie(sides) ✅
  - [x] rollDice(numDice, sides) ✅
  - [x] rollAbilityScore(minimum, abilityName) ✅
  - [x] rollAbilities(minimumScores, toughCharacters, className, primeRequisite13) ✅
- [x] Add JSDoc comments ✅
- [x] Export all functions ✅
- [x] Test module loads correctly ✅
- [x] Verify basic-utils.js imports from shared module ✅
- [x] Verify basic-character-gen.js imports from shared module ✅
- [x] Test basic.html works correctly ✅

#### Phase 2B: Update basic-utils.js to use shared module - ✅ COMPLETE
- [x] Import shared-ability-scores.js ✅
- [x] Remove functions now in shared module ✅
- [x] Keep only basic-specific utility functions ✅
- [x] Re-export shared functions for backward compatibility ✅
- [x] Test with basic.html ✅

#### Phase 2C: Update basic-character-gen.js to use shared module - ✅ COMPLETE
- [x] Import shared-ability-scores.js ✅
- [x] Remove functions now in shared module ✅
- [x] Re-export shared functions for backward compatibility ✅
- [x] Update any function calls ✅
- [x] Test with basic.html ✅

#### Phase 2D: Create shared-hit-points.js - ✅ COMPLETE
- [x] Create `shared-hit-points.js` ✅
- [x] Extract from basic-character-gen.js: ✅
  - [x] rollSingleDie(sides) ✅
  - [x] parseHitDice(hitDiceString) ✅
  - [x] rollHitPoints(options) - generalized for all generators ✅
- [x] Add JSDoc comments ✅
- [x] Export all functions ✅
- [x] Test module loads correctly ✅

#### Phase 2E: Update basic-character-gen.js to use shared HP module - ✅ COMPLETE
- [x] Import shared-hit-points.js ✅
- [x] Remove parseHitDice() function (now in shared module) ✅
- [x] Remove rollHitPoints() implementation (now in shared module) ✅
- [x] Create wrapper function for rollHitPoints() ✅
- [x] Re-export shared functions for backward compatibility ✅
- [x] Test with basic.html ✅

#### Phase 2F: Create shared-class-progression.js - ✅ COMPLETE
- [x] Create `shared-class-progression.js` ✅
- [x] Extract from basic-character-gen.js: ✅
  - [x] getClassProgressionData(options) ✅
  - [x] getClassFeatures(options) ✅
  - [x] getRacialAbilities(className) ✅
- [x] Add JSDoc comments ✅
- [x] Export all functions ✅
- [x] Test module loads correctly ✅

#### Phase 2G: Update basic-character-gen.js to use shared progression module - ✅ COMPLETE
- [x] Import shared-class-progression.js ✅
- [x] Remove getClassProgressionData() implementation ✅
- [x] Remove getClassFeatures() implementation ✅
- [x] Remove getRacialAbilities() implementation ✅
- [x] Create wrapper functions for all three ✅
- [x] Test with basic.html ✅

#### Phase 2H: Create shared-character.js - ✅ COMPLETE
- [x] Create `shared-character.js` ✅
- [x] Extract from basic-character-gen.js: ✅
  - [x] createCharacter(options) ✅
- [x] Add JSDoc comments ✅
- [x] Export all functions ✅
- [x] Test module loads correctly ✅

#### Phase 2I: Update basic-character-gen.js to use shared character module - ✅ COMPLETE
- [x] Import shared-character.js ✅
- [x] Remove createCharacter() implementation ✅
- [x] Create wrapper function ✅
- [x] Test with basic.html ✅

#### Phase 2J: Final Testing - ✅ COMPLETE
- [x] Test basic.html thoroughly ✅
- [x] Verify all functionality works ✅
- [x] Check console for errors ✅
- [x] Test all character generation options ✅
  - [x] Level 1 Fighter - works ✅
  - [x] Level 2 Cleric with spell slots and turn undead - works ✅
  - [x] Level 2 Thief with thief skills - works ✅
  - [x] Level 2 Elf with spell slots and racial abilities - works ✅
- [x] **Verified everything works before proceeding to Phase 3** ✅

### Phase 3: Refactor 0level Generator - **HIGH PRIORITY**
**Do this AFTER Phase 2, BEFORE implementing Advanced Mode!**

#### Phase 3A: Document Ability Score Modifiers
**Important:** The 0-level generator shows how ability score modifiers affect combat stats. These modifiers apply to **ALL character levels** (0-level, Basic Mode levels 1-14, and Advanced Mode levels 1-14).

**Ability Score Modifiers (OSE Standard):**
- **STR (Strength):**
  - Melee attack bonus: STR modifier
  - Melee damage bonus: STR modifier
  - Open doors: Modified by STR
  
- **DEX (Dexterity):**
  - Missile attack bonus: DEX modifier
  - Armor Class: Base AC 10 + DEX modifier (Ascending AC)
  - Initiative: Modified by DEX
  
- **CON (Constitution):**
  - Hit Points: Added to each HD rolled (minimum 1 HP per level)
  
- **INT (Intelligence):**
  - Spoken languages: Modified by INT
  - Literacy: Requires INT 8+
  
- **WIS (Wisdom):**
  - Magic-based saving throws: Modified by WIS
  
- **CHA (Charisma):**
  - Reaction rolls: Modified by CHA
  - Max retainers: Modified by CHA
  - Retainer morale: Modified by CHA

**Combat Stats Display (for ALL generators):**
- **Attack Bonus:** Class attack bonus + STR (melee) or DEX (missile)
- **Armor Class:** 10 (base) + DEX modifier + armor bonus
- **Saving Throws:** Base saves + ability modifiers (varies by save type)

**TODO for Future Phases:**
- [ ] Update basic-ui.js to display STR/DEX attack bonuses separately
- [ ] Update basic-ui.js to apply DEX modifier to AC display
- [ ] Update advanced-ui.js to display STR/DEX attack bonuses separately
- [ ] Update advanced-ui.js to apply DEX modifier to AC display
- [ ] Consider creating shared-combat-stats.js module for consistent combat stat calculations

#### Phase 3B: Update 0level Options
- [ ] Split "Tough Guys" checkbox into two separate options:
  - [ ] **"Born Adventurers"** (formerly "Tough Characters")
    - [ ] Require at least one of STR/DEX/INT/WIS ≥ 13
    - [ ] Use shared `meetsToughCharactersRequirements()` function
    - [ ] Rename function to `meetsBornAdventurersRequirements()` in shared module
  - [ ] **"Healthy Characters"** (already exists in Basic Mode)
    - [ ] Require HP ≥ 2 at level 0
    - [ ] Use shared HP rolling logic
    - [ ] Can be combined with "Born Adventurers"
- [ ] Update 0level.html UI:
  - [ ] Remove single "Tough Guys" checkbox
  - [ ] Add "Born Adventurers" checkbox
  - [ ] Add "Healthy Characters" checkbox
  - [ ] Update descriptions to match Basic Mode terminology

#### Phase 3C1: Create 0level-utils.js - ✅ COMPLETE
- [x] Read dice-utils.js to understand existing utility functions
- [x] Read character-utils.js to understand character-specific utilities
- [x] Create `0level-utils.js` (similar to basic-utils.js):
  - [x] Import shared-ability-scores.js
  - [x] Extract utility functions from dice-utils.js and character-utils.js
  - [x] Add 0level-specific helper functions (Born Adventurers, Healthy Characters)
  - [x] Keep only 0level-unique logic
  - [x] Add JSDoc comments
  - [x] Export all functions
- [x] Test module loads correctly

#### Phase 3C2: Create 0level-character-gen.js - ✅ COMPLETE
- [x] Read main-generator.js to understand generation logic
- [x] Read race-adjustments.js to understand racial adjustments
- [x] Read background-tables.js, names-tables.js, ose-modifiers.js, racial-abilities.js
- [x] Create `0level-character-gen.js` (similar to basic-character-gen.js):
  - [x] Import shared-ability-scores.js
  - [x] Import 0level-utils.js
  - [x] Extract character generation logic from main-generator.js
  - [x] Support "Born Adventurers" option
  - [x] Support "Healthy Characters" option
  - [x] Integrate with legacy global scripts (background-tables, names-tables, etc.)
  - [x] Add JSDoc comments
  - [x] Export all functions
- [x] Test module structure

#### Phase 3C3: Create 0level-ui.js - ✅ COMPLETE
- [x] Read main-generator.js to understand UI logic
- [x] Read character-display.js to understand display logic
- [x] Create `0level-ui.js` (similar to basic-ui.js):
  - [x] Import 0level-utils.js
  - [x] Import 0level-character-gen.js
  - [x] Extract UI logic from main-generator.js
  - [x] Extract display logic from character-display.js
  - [x] Handle "Born Adventurers" checkbox
  - [x] Handle "Healthy Characters" checkbox
  - [x] Add event handlers for all button functions
  - [x] Add JSDoc comments
  - [x] Export initialize() function
  - [x] Auto-initialize on DOM ready
- [x] Test module structure

#### Phase 3D: Update 0level HTML - ✅ COMPLETE
- [x] Update `0level.html`:
  - [x] Import 0level-ui.js module
  - [x] Keep legacy scripts loaded globally (background-tables, racial-abilities, names-tables, etc.)
  - [x] Remove inline script handlers (moved to module)
  - [x] Keep initialization code minimal
- [x] **Fixed LEGACY_RACE_NAMES conflicts**
  - [x] Created shared-race-names.js with single LEGACY_RACE_NAMES definition
  - [x] Updated racial-abilities.js to use shared file
  - [x] Updated names-tables.js to use shared file
  - [x] Updated race-adjustments.js to use shared file
  - [x] Updated 0level.html to load shared-race-names.js first
- [x] **Fixed timing issues with ES6 modules and legacy scripts**
  - [x] Added 100ms delay in initialize() function
  - [x] Removed error throws in getRandomName() and getBackgroundByHitPoints()
  - [x] Added graceful fallbacks for when legacy scripts aren't loaded yet
- [x] Test 0level generator works correctly
  - [x] Page loads without errors
  - [x] Character generates successfully
  - [x] All stats display correctly
  - [x] All buttons functional

**Benefits of this change:**
- ✅ More granular control over character generation
- ✅ Players can choose one, both, or neither option
- ✅ "Born Adventurers" is a better name for the ability score requirement
- ✅ Matches the split options already in Basic Mode
- ✅ Consistent terminology across 0-level, Basic, and Advanced generators

### Phase 4: Implement Advanced Mode with Shared Modules - ✅ COMPLETE
**Do this AFTER Phases 2-3 are complete!**
- [x] Create `advanced-utils.js` (similar to basic-utils.js) ✅
  - [x] Extract ability score functions ✅
  - [x] Add racial adjustment functions ✅
  - [x] Import shared modules ✅
  - [x] Add ES6 exports ✅
- [x] Create `advanced-character-gen.js` (similar to basic-character-gen.js) ✅
  - [x] Extract HP rolling functions ✅
  - [x] Extract ability rolling with racial adjustments ✅
  - [x] Extract class progression functions ✅
  - [x] Import shared modules ✅
  - [x] Add ES6 exports ✅
- [x] Create `advanced-ui.js` (similar to basic-ui.js) ✅
  - [x] Implement Advanced Mode UI logic ✅
  - [x] Implement race selection ✅
  - [x] Implement racial adjustments display ✅
  - [x] Add ES6 exports ✅
- [x] Update `advanced.html` ✅
  - [x] Import advanced-ui.js module ✅
  - [x] Remove inline JavaScript ✅
  - [x] Keep only initialization code ✅
  - [x] Test thoroughly ✅

#### Phase 4A: Update advanced-ui.js - ✅ COMPLETE
**Breaking this into smaller steps for safety:**

##### Phase 4E2a: Update state variables - ✅ COMPLETE
- [x] Remove `toughCharacters` ✅
- [x] Remove `allowNonTraditional` ✅
- [x] Remove `allowElfSpellbladePast10` ✅
- [x] Add `primeRequisite13` ✅
- [x] Add `healthyCharacters` ✅
- [x] Add `useFixedScores` ✅
- [x] Add `showUndeadNames` ✅
- [x] Add `raceClassMode` (default: 'strict') ✅
- [x] Add `abilityScores` object ✅

##### Phase 4E2b: Add ability score functions - ✅ COMPLETE
- [x] Add `readAbilityScores()` - Read from input fields ✅
- [x] Add `updateModifiers()` - Update modifier displays ✅
- [x] Add `updateXPBonus()` - Update XP bonus display ✅
- [x] Add `updateRollButtonState()` - Enable/disable Roll button ✅

##### Phase 4E2c: Add Test HP functions - ✅ COMPLETE
- [x] Add `canRollHP()` - Check if HP rolling is possible ✅
- [x] Add `updateTestHPButton()` - Update button state and warning ✅
- [x] Add `handleTestHP()` - Test HP rolling handler ✅

##### Phase 4E2d: Add button handlers - ✅ COMPLETE
- [x] Add `handleRollAbilities()` - Roll ability scores ✅
- [x] Add `handleRollAndGenerate()` - Roll + generate ✅

##### Phase 4E2e: Update updateUI() function - ✅ COMPLETE
- [x] Replace `allowNonTraditional` with `raceClassMode` ✅
- [x] Update button enable/disable logic based on raceClassMode ✅
- [x] Handle 'strict', 'traditional-extended', 'allow-all' modes ✅

##### Phase 4E2f: Update generateCharacter() function - ✅ COMPLETE
- [x] Use `readAbilityScores()` if `useFixedScores` is true ✅
- [x] Use `rollAbilitiesAdvanced()` if `useFixedScores` is false ✅
- [x] Remove `toughCharacters` parameter ✅
- [x] Add `primeRequisite13` parameter ✅
- [x] Add `healthyCharacters` parameter ✅
- [x] Use `raceClassMode` to determine level limits ✅

##### Phase 4E2g: Update displayCharacter() function - ✅ COMPLETE
- [x] Use `showUndeadNames` for Turn Undead display ✅

##### Phase 4E2h: Update initializeEventListeners() - ✅ COMPLETE
- [x] Remove `toughCharacters` listener ✅
- [x] Remove `allowNonTraditional` listener ✅
- [x] Remove `allowElfSpellbladePast10` listener ✅
- [x] Add `primeRequisite13` listener ✅
- [x] Add `healthyCharacters` listener ✅
- [x] Add `useFixedScores` listener ✅
- [x] Add `showUndeadNames` listener ✅
- [x] Add `raceClassMode` radio button listeners (3 radios) ✅
- [x] Add ability score input listeners (6 inputs) ✅
- [x] Add `rollAbilitiesButton` listener ✅
- [x] Add `testHPButton` listener ✅
- [x] Add `rollAndGenerateButton` listener ✅

#### Phase 4E3: Update basic.html - ✅ COMPLETE
- [x] Remove "Tough Characters" checkbox ✅
- [x] Keep "Strong Prime Requisites" checkbox ✅
- [x] Keep "Healthy Characters" checkbox ✅

#### Phase 4E4: Update basic-ui.js - ✅ COMPLETE
- [x] Remove `toughCharacters` state variable ✅
- [x] Remove `toughCharacters` event listener ✅
- [x] Remove `toughCharacters` from `rollAbilities()` calls ✅
- [x] Update `handleRollAbilities()` to not pass `toughCharacters` ✅
- [x] Update `generateCharacter()` to not pass `toughCharacters` ✅


### Phase 5: Update Navigation and Landing Page - ✅ COMPLETE

- [x] Update `index.html` (landing page):
  - [x] Add welcome message
  - [x] Add links to all generators:
    - [x] 0level.html - "Level 0 Character Generator"
    - [x] basic.html - "Basic Mode (Levels 1-14)"
    - [x] advanced.html - "Advanced Mode (Levels 1-14)"
    - [x] classes.html - "Class Reference"
  - [x] Add brief description of each generator
  - [x] Add mode comparison (OSE Standard vs Smoothified)
- [x] Update navigation in all HTML files:
  - [x] 0level.html: Navigation verified (all links correct)
  - [x] basic.html: Navigation verified (all links correct)
  - [x] advanced.html: Navigation verified (all links correct)
  - [x] classes.html: Navigation verified (all links correct)
- [x] Test all navigation links

**Completed:** March 12, 2026
**Changes:**
- Completely redesigned index.html as a professional landing page
- Added generator cards with icons, descriptions, and feature lists
- Added comprehensive mode comparison table
- Verified all navigation links work correctly across all pages
- Maintained consistent navigation bar across all HTML files

### Phase 7: Shared Names and Backgrounds - ✅ COMPLETE (March 13, 2026)

#### Phase 7A: Create Shared Names Module - ✅ COMPLETE
- [x] **Create shared-names.js ES6 module**
  - [x] Extract name tables from names-tables.js
  - [x] Create ES6 module with exports:
    - [x] `getRandomName(race)` - Get random name for a race
    - [x] `getNameTable(race)` - Get full name table for a race
    - [x] `getAvailableRaces()` - Get list of races with name tables
  - [x] Add JSDoc comments
  - [x] Test module structure

- [x] **Move names-tables.js to deprecated-js/**
  - [x] Mark file as DEPRECATED with comment
  - [x] Move to deprecated-js/ directory
  - [x] Update 0level.html to load from deprecated-js/names-tables.js
  - [x] Document why 0level still uses legacy script

**Why 0-level still uses legacy names-tables.js:**
- ES6 modules are asynchronous (use `import()` which returns a Promise)
- Character generation needs synchronous access to name tables
- Refactoring to async/await would require changing entire generation flow
- Current approach works and is well-organized

#### Phase 7B: Create Shared Backgrounds Module - ✅ COMPLETE
- [x] **Create shared-backgrounds.js ES6 module**
  - [x] Extract background tables from background-tables.js
  - [x] Create ES6 module with exports:
    - [x] `getRandomBackground(hitPoints)` - Get random background based on HP
    - [x] `getBackgroundByIndex(hitPoints, index)` - Get specific background
    - [x] `getBackgroundTable(hitPoints)` - Get all backgrounds for HP level
    - [x] `getAllBackgroundTables()` - Get all background tables
  - [x] Add JSDoc comments
  - [x] Test module structure

- [x] **Move background-tables.js to deprecated-js/**
  - [x] Move to deprecated-js/ directory
  - [x] Update 0level.html to load from deprecated-js/background-tables.js
  - [x] Document why 0level still uses legacy script

**Why 0-level still uses legacy background-tables.js:**
- Same reason as names-tables.js - needs synchronous access
- `getBackgroundByHitPoints()` is called during character generation
- Refactoring to async/await is a larger task not needed right now

#### Phase 7C: Add Names and Backgrounds to Basic and Advanced - ✅ COMPLETE (March 13, 2026)
- [x] **Add name generation to Basic Mode:**
  - [x] Import shared-names.js in basic-ui.js
  - [x] Add name input field to UI
  - [x] Add "Random Name" button
  - [x] Update character display to show name
  - [x] Fix name display bug (move name reading to after ability rolling)

- [x] **Add name generation to Advanced Mode:**
  - [x] Import shared-names.js in advanced-ui.js
  - [x] Add name input field to UI
  - [x] Add "Random Name" button
  - [x] Update character display to show name
  - [x] Fix name display bug (move name reading to after initial checks)
  - [x] Fix name parameter handling in createCharacterAdvanced()

- [x] **Add background generation to Basic Mode:**
  - [x] Import shared-backgrounds.js in basic-ui.js
  - [x] Add background generation based on HP
  - [x] Update character display to show background
  - [x] Fix background bug (change hp.max to hp)

- [x] **Add background generation to Advanced Mode:**
  - [x] Import shared-backgrounds.js in advanced-ui.js
  - [x] Add background generation based on HP
  - [x] Update character display to show background

- [x] **Refactor 0-level to use shared modules:**
  - [x] Created shared-names.js ES6 module
  - [x] Created shared-backgrounds.js ES6 module
  - [x] 0-level uses ES6 modules via dynamic import
  - [x] All three generators now use shared modules
  - [x] Tested thoroughly - all working

### Phase 8: Shared Modifier Effects - **IN PROGRESS** (March 13, 2026)

#### Phase 8A: Create shared-modifier-effects.js - **PENDING**
- [ ] **Create shared-modifier-effects.js ES6 module**
  - [ ] Extract getModifierEffects() from ose-modifiers.js
  - [ ] Create ES6 module with exports:
    - [ ] `getModifierEffects(ability, modifier, score)` - Get detailed effect descriptions
  - [ ] Add JSDoc comments
  - [ ] Test module structure

- [ ] **Move ose-modifiers.js to deprecated-js/**
  - [ ] Mark file as DEPRECATED with comment
  - [ ] Move to deprecated-js/ directory
  - [ ] Update 0level.html to load from deprecated-js/ose-modifiers.js temporarily
  - [ ] Document why 0level still uses legacy script (same reason as names/backgrounds)

#### Phase 8B: Update 0level Generator to use shared-modifier-effects.js - **PENDING**
- [ ] **Update 0level-ui.js:**
  - [ ] Import shared-modifier-effects.js
  - [ ] Remove dependency on global getModifierEffects()
  - [ ] Update displayAbilityScores() to use imported function
  - [ ] Test 0level generator works correctly

- [ ] **Update 0level.html:**
  - [ ] Remove ose-modifiers.js script tag (no longer needed)
  - [ ] Test page loads without errors

#### Phase 8C: Add Modifier Effects to Basic Mode - **PENDING**
- [ ] **Update basic-ui.js:**
  - [ ] Import shared-modifier-effects.js
  - [ ] Add modifier effects display to ability scores section
  - [ ] Update displayCharacter() to show detailed effects
  - [ ] Test Basic Mode displays effects correctly

- [ ] **Update basic.html (if needed):**
  - [ ] Add CSS for modifier effects display
  - [ ] Test layout looks good

#### Phase 8D: Add Modifier Effects to Advanced Mode - **PENDING**
- [ ] **Update advanced-ui.js:**
  - [ ] Import shared-modifier-effects.js
  - [ ] Add modifier effects display to ability scores section
  - [ ] Update displayCharacter() to show detailed effects
  - [ ] Test Advanced Mode displays effects correctly

- [ ] **Update advanced.html (if needed):**
  - [ ] Add CSS for modifier effects display
  - [ ] Test layout looks good

#### Phase 8E: Final Testing - ✅ COMPLETE (March 13, 2026)
- [x] Test all three generators show modifier effects
- [x] Verify effects are accurate for all ability scores
- [x] Check console for errors
- [x] Test with various ability score combinations
- [x] User verified Basic Mode working
- [x] User verified Advanced Mode working

**Benefits of Phase 8:**
- ✅ Consistent modifier effect display across all generators
- ✅ Players can see exactly how ability scores affect their character
- ✅ No more global scope pollution (ES6 module)
- ✅ Easy to maintain and update effect descriptions

**Phase 8 Complete!** All three generators now show detailed ability score effects using shared-modifier-effects.js ES6 module.

### Phase 6: Testing and Documentation - **IN PROGRESS**

#### Phase 6A: Test All Generators - ✅ COMPLETE (March 12, 2026)
- [x] **Test 0level Generator:** ✅ ALL TESTS PASSED
  - [x] Page loads without errors
  - [x] Character generation works
  - [x] All race options work (tested Random, generates successfully)
  - [x] Advanced Mode (racial modifiers) works
  - [x] Smoothified Mode works
  - [x] Character display shows all stats correctly
  - Note: Export formats not tested (PNG, PDF, Markdown, JSON) - out of scope for Phase 6A

- [x] **Test Basic Mode Generator:** ✅ ALL TESTS PASSED
  - [x] Page loads without errors
  - [x] Level selection works (Level 1 tested)
  - [x] Class selection works (Fighter tested)
  - [x] Smoothified Mode toggle works (checked by default)
  - [x] Ability score inputs and modifiers work
  - [x] Roll Abilities button works
  - [x] Generate Character button works
  - [x] Character display shows all stats correctly (Level 1 Fighter generated)
  - Note: Not all options tested exhaustively - core functionality verified

- [x] **Test Advanced Mode Generator:** ✅ ALL TESTS PASSED
  - [x] Page loads without errors
  - [x] Level selection works (Level 1 tested)
  - [x] Race selection works (Human tested)
  - [x] Class selection works (Fighter tested)
  - [x] Racial ability adjustments apply correctly (Human: CON +1, CHA +1)
  - [x] Smoothified Mode toggle works (checked by default)
  - [x] Race/Class restriction modes work (Strict OSE Rules tested)
  - [x] Ability score inputs and modifiers work
  - [x] Roll Abilities button works
  - [x] Generate Character button works
  - [x] Character display shows all stats correctly (Level 1 Human Fighter generated)
  - [x] XP Bonus displays correctly (+5% for STR 15)
  - Note: Not all race/class combinations tested - core functionality verified

- [x] **Test Navigation:** ✅ ALL LINKS WORKING
  - [x] All nav links work on all pages
  - [x] Level 0 Generator link works
  - [x] Basic (Levels 1+) link works
  - [x] Advanced (Levels 1+) link works
  - [x] Class Reference link works
  - [x] About link works (returns to landing page)
  - [x] Landing page (index.html) displays correctly
  - [x] Active page highlighting works (green text for current page)

**Testing Summary:**
- ✅ All three generators load without errors
- ✅ All three generators can create characters successfully
- ✅ All navigation links work correctly
- ✅ Landing page displays correctly with generator cards and mode comparison
- ✅ No console errors observed during testing
- ✅ Phase 5 (Navigation and Landing Page) verified working

#### Phase 6B: Documentation
- [ ] **Update README.md:**
  - [ ] Add project overview
  - [ ] Document module structure
  - [ ] List all generators and their features
  - [ ] Add file organization guide
  - [ ] Document shared vs generator-specific modules
  - [ ] Add development setup instructions

- [ ] **Document File Organization:**
  - [ ] **Shared Modules** (used by multiple generators):
    - [ ] `shared-ability-scores.js` - Ability score calculations
    - [ ] `shared-character.js` - Character object creation
    - [ ] `shared-class-progression.js` - Class progression data
    - [ ] `shared-hit-points.js` - HP rolling logic
    - [ ] `shared-race-names.js` - Legacy race name constants
    - [ ] `class-data-ose.js` - OSE class data
    - [ ] `class-data-gygar.js` - Gygar (Smoothified) class data
    - [ ] `class-data-shared.js` - Shared class utilities
  
  - [ ] **0level Generator Modules:**
    - [ ] `0level-ui.js` - UI logic and event handlers
    - [ ] `0level-character-gen.js` - Character generation
    - [ ] `0level-utils.js` - Utility functions
  
  - [ ] **Basic Generator Modules:**
    - [ ] `basic-ui.js` - UI logic and event handlers
    - [ ] `basic-character-gen.js` - Character generation
    - [ ] `basic-utils.js` - Utility functions
  
  - [ ] **Advanced Generator Modules:**
    - [ ] `advanced-ui.js` - UI logic and event handlers
    - [ ] `advanced-character-gen.js` - Character generation
    - [ ] `advanced-utils.js` - Utility functions
  
  - [x] **Legacy/0level-Specific Modules** (loaded globally, not ES6):
    - [x] `racial-abilities.js` - Racial ability descriptions (still used by 0level)
    - [x] `race-adjustments.js` - 0level racial adjustments (still used by 0level)
    - [x] `deprecated-js/ose-modifiers.js` - OSE modifier tables (getModifier() still needed by race-adjustments.js)
    - [x] `canvas-generator.js` - PNG/PDF generation (0level only)
    - [x] `canvas-sheet-renderer.js` - Character sheet rendering (0level only)
    - [x] `markdown-generator.js` - Markdown export (0level only)
    - [x] `node-canvas-generator.js` - Node.js canvas utilities (0level only)
    - [x] `underground-sheet-renderer.js` - Alternative sheet renderer (0level only)
    - [x] `shared-race-names.js` - Legacy race name constants (loaded globally to avoid conflicts)
  
  - [x] **Deprecated Files** (moved to `deprecated-js/` directory):
    - [x] `main-generator.js` - Old 0level generator (replaced by 0level-*.js modules)
    - [x] `character-display.js` - Old display logic (now in 0level-ui.js)
    - [x] `character-utils.js` - Old utilities (now in 0level-utils.js)
    - [x] `dice-utils.js` - Old dice utilities (now in shared-ability-scores.js)
    - [x] `background-tables.js` - Old background tables (replaced by shared-backgrounds.js ES6 module)
    - [x] `names-tables.js` - Old name tables (replaced by shared-names.js ES6 module)
    - [x] `ose-modifiers.js` - Old modifier functions (getModifierEffects() replaced by shared-modifier-effects.js ES6 module, getModifier() still used by race-adjustments.js)
    - [ ] `weapons-and-armor.js` - Unused (data in class-data files) - can be moved
    - [ ] `test-gygar-data.js` - Development testing file - can be moved

- [ ] **Create Module Dependency Diagram:**
  - [ ] Visual diagram showing module relationships
  - [ ] Show shared vs generator-specific modules
  - [ ] Document import/export patterns

---

## Module Dependencies

### Current Implementation (Phase 1 Complete)

```
basic.html
├── basic-ui.js (420 lines)
│   ├── class-data-ose.js
│   ├── class-data-gygar.js
│   ├── class-data-shared.js
│   ├── basic-utils.js (170 lines)
│   └── basic-character-gen.js (380 lines)
│       ├── basic-utils.js
│       ├── class-data-ose.js
│       ├── class-data-gygar.js
│       └── class-data-shared.js
```

### Future Implementation (After Phase 2-3)

```
basic.html
├── basic-ui.js
│   ├── basic-utils.js
│   │   ├── ability-scores.js (shared)
│   │   └── class-progression.js (shared)
│   └── basic-character-gen.js
│       ├── hit-points.js (shared)
│       ├── character-object.js (shared)
│       ├── character-logger.js (shared)
│       └── class-progression.js (shared)

advanced.html
├── advanced-ui.js
│   ├── advanced-utils.js
│   │   ├── ability-scores.js (shared)
│   │   ├── class-progression.js (shared)
│   │   └── racial-abilities.js
│   └── advanced-character-gen.js
│       ├── hit-points.js (shared)
│       ├── character-object.js (shared)
│       ├── character-logger.js (shared)
│       ├── class-progression.js (shared)
│       └── racial-abilities.js

index.html
├── level0-ui.js
│   ├── level0-utils.js
│   │   ├── ability-scores.js (shared)
│   │   └── racial-abilities.js
│   └── level0-character-gen.js
│       ├── hit-points.js (shared)
│       ├── character-object.js (shared)
│       └── racial-abilities.js

Shared Modules:
├── ability-scores.js (ability score calculations)
├── hit-points.js (HP rolling logic)
├── class-progression.js (class data access)
├── character-object.js (character creation)
├── character-logger.js (logging utilities)
├── class-data-ose.js (OSE class data)
├── class-data-gygar.js (Gygar class data)
├── class-data-shared.js (shared class data)
└── racial-abilities.js (racial abilities)
```

---

## Benefits of This Refactoring

### Code Reuse
- Shared functions used across all three generators
- No duplicate code
- Single source of truth for calculations

### Maintainability
- Easier to find and fix bugs
- Logical separation of concerns
- Smaller, focused files

### Testability
- Each module can be tested independently
- Easier to write unit tests
- Better code coverage

### Scalability
- Easy to add new features
- Easy to add new character types
- Easy to add new modes

### Developer Experience
- Better IDE support (autocomplete, type hints)
- Easier to understand code structure
- Faster development

---

## Timeline

**UPDATED: Refactor NOW, before Advanced Mode!**

**New Strategy:**
1. ✅ Phase 1 Complete: Basic Mode refactored into ES6 modules
2. **Phase 2 (HIGH PRIORITY):** Extract shared modules from Basic Mode
3. **Phase 3 (HIGH PRIORITY):** Refactor 0level generator to use shared modules
4. **Phase 4 (NORMAL PRIORITY):** Implement Advanced Mode using shared modules from the start
5. **Phase 5 (NORMAL PRIORITY):** Update navigation and landing page
6. **Phase 6 (NORMAL PRIORITY):** Testing and documentation

**Why this order:**
- ✅ We now understand what code should be shared (from Basic Mode implementation)
- ✅ Refactoring now prevents duplicate code in Advanced Mode
- ✅ 0level generator can benefit from shared modules immediately
- ✅ Advanced Mode will be cleaner and faster to implement
- ✅ All three generators will share the same architecture

**Estimated Time:**
- Phase 1: 2-3 hours (extract shared utilities)
- Phase 2: 1-2 hours (extract character creation)
- Phase 3: 2-3 hours (extract Basic Mode logic)
- Phase 4: 2-3 hours (apply to Advanced Mode)
- Phase 5: 2-3 hours (refactor Level 0 generator)
- Phase 6: 1-2 hours (testing and documentation)
- **Total: 10-16 hours**

---

## Success Criteria

- [x] All inline JavaScript removed from basic.html ✅
- [x] All inline JavaScript removed from advanced.html ✅
- [x] All inline JavaScript removed from 0level.html ✅
- [x] Basic generator works correctly ✅
- [x] Advanced generator works correctly ✅
- [x] 0level generator works correctly ✅
- [x] **Shared modules created and working (Phase 2)** ✅
- [x] **0level generator refactored to use shared modules (Phase 3)** ✅
- [x] No duplicate code between generators ✅
- [x] All modules use ES6 export/import ✅
- [x] All functions have JSDoc comments ✅
- [x] Navigation updated in all HTML files ✅
- [x] Landing page (index.html) created ✅
- [ ] README.md updated with module structure
- [x] Basic mode tests passing ✅
- [x] Advanced mode tests passing ✅
- [x] 0level mode tests passing ✅

---

## Notes

### ES6 Module Support
- ✅ All modern browsers support ES6 modules
- ✅ Already using ES6 modules for class data
- ✅ No build step required (native browser support)
- ✅ Works with local development server

### Backward Compatibility
- Keep old files (main-generator.js, etc.) until refactoring is complete
- Test thoroughly before removing old code
- Maintain git history for easy rollback

### Future Enhancements
- Consider TypeScript for type safety
- Consider bundling for production (Rollup, Vite)
- Consider adding unit tests (Jest, Vitest)
- Consider adding E2E tests (Playwright, Cypress)

## Phase 1 Complete! ✅

**Completed Files:**
- **basic-utils.js** (170 lines) - Utility functions for Basic Mode
- **basic-character-gen.js** (380 lines) - Character generation functions
- **basic-ui.js** (420 lines) - UI logic, state management, event handlers
- **basic.html** (200 lines) - HTML/CSS + minimal initialization

**Refactoring Results:**
- Reduced basic.html from 1100+ lines to ~200 lines
- Extracted ~800 lines of JavaScript into 3 well-organized modules
- All functionality working correctly
- Clean separation of concerns:
  - Utilities (calculations, helpers)
  - Character generation (rolling, data access)
  - UI (state, events, display)

**Testing Results:**
- ✅ Page loads successfully
- ✅ Level selection works
- ✅ Class selection works
- ✅ Ability score rolling works
- ✅ Modifiers update correctly
- ✅ XP bonus displays correctly
- ✅ Generate Character button works
- ✅ "Roll Abilities & Generate Character" button works
- ✅ All checkboxes and options function properly
- ✅ Spellblade button shows/hides based on mode

**Next Steps:**
- Phase 2: Extract shared utilities (ability-scores.js, hit-points.js, class-progression.js)
- Phase 3: Extract character creation (character-object.js, character-logger.js)
- Phase 4: Apply same pattern to advanced.html
- Phase 5: Refactor index.html (level 0 generator)
