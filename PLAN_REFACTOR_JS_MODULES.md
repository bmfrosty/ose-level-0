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

#### Phase 2A: Create shared-ability-scores.js - **IN PROGRESS**
- [ ] Create `shared-ability-scores.js`
- [ ] Extract from basic-utils.js:
  - [ ] calculateModifier(score)
  - [ ] formatModifier(mod)
  - [ ] calculateXPBonus(score)
  - [ ] getPrimeRequisites(className)
  - [ ] meetsToughCharactersRequirements(scores)
- [ ] Extract from basic-character-gen.js:
  - [ ] rollSingleDie(sides)
  - [ ] rollDice(numDice, sides)
  - [ ] rollAbilityScore(minimum, abilityName)
  - [ ] rollAbilities(minimumScores, toughCharacters)
- [ ] Add JSDoc comments
- [ ] Export all functions
- [ ] Test module loads correctly

#### Phase 2B: Update basic-utils.js to use shared module
- [ ] Import shared-ability-scores.js
- [ ] Remove functions now in shared module
- [ ] Keep only basic-specific utility functions
- [ ] Update any function calls
- [ ] Test with basic.html

#### Phase 2C: Update basic-character-gen.js to use shared module
- [ ] Import shared-ability-scores.js
- [ ] Remove functions now in shared module
- [ ] Update any function calls
- [ ] Test with basic.html

#### Phase 2D: Create shared-hit-points.js
- [ ] Create `shared-hit-points.js`
- [ ] Extract from basic-character-gen.js:
  - [ ] parseHitDice(hitDiceString)
  - [ ] rollHitPoints(options) - generalized for all generators
- [ ] Add JSDoc comments
- [ ] Export all functions
- [ ] Test module loads correctly

#### Phase 2E: Update basic-character-gen.js to use shared HP module
- [ ] Import shared-hit-points.js
- [ ] Remove functions now in shared module
- [ ] Update any function calls
- [ ] Test with basic.html

#### Phase 2F: Create shared-class-progression.js
- [ ] Create `shared-class-progression.js`
- [ ] Extract from basic-character-gen.js:
  - [ ] getClassProgressionData(options)
  - [ ] getClassFeatures(options)
  - [ ] getRacialAbilities(className, race, mode)
- [ ] Add JSDoc comments
- [ ] Export all functions
- [ ] Test module loads correctly

#### Phase 2G: Update basic-character-gen.js to use shared progression module
- [ ] Import shared-class-progression.js
- [ ] Remove functions now in shared module
- [ ] Update any function calls
- [ ] Test with basic.html

#### Phase 2H: Create shared-character.js
- [ ] Create `shared-character.js`
- [ ] Extract from basic-character-gen.js:
  - [ ] createCharacter(options)
- [ ] Add JSDoc comments
- [ ] Export all functions
- [ ] Test module loads correctly

#### Phase 2I: Update basic-character-gen.js to use shared character module
- [ ] Import shared-character.js
- [ ] Remove functions now in shared module
- [ ] Update any function calls
- [ ] Test with basic.html

#### Phase 2J: Final Testing
- [ ] Test basic.html thoroughly
- [ ] Verify all functionality works
- [ ] Check console for errors
- [ ] Test all character generation options
- [ ] **Verify everything works before proceeding to Phase 3**

### Phase 3: Refactor 0level Generator - **HIGH PRIORITY**
**Do this AFTER Phase 2, BEFORE implementing Advanced Mode!**

#### Phase 3A: Update 0level Options
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

#### Phase 3B: Create 0level Modules
- [ ] Create `0level-utils.js` (similar to basic-utils.js):
  - [ ] Import shared-ability-scores.js
  - [ ] Add 0level-specific functions
  - [ ] Keep only 0level-unique logic
- [ ] Create `0level-character-gen.js` (similar to basic-character-gen.js):
  - [ ] Import shared-hit-points.js
  - [ ] Import shared-character.js
  - [ ] Add 0level-specific generation logic
  - [ ] Use shared rollHitPoints() function
  - [ ] Support "Born Adventurers" option
  - [ ] Support "Healthy Characters" option
- [ ] Create `0level-ui.js` (similar to basic-ui.js):
  - [ ] Extract UI logic from main-generator.js
  - [ ] Import 0level-utils.js and 0level-character-gen.js
  - [ ] Add ES6 exports
  - [ ] Handle "Born Adventurers" checkbox
  - [ ] Handle "Healthy Characters" checkbox

#### Phase 3C: Update 0level HTML
- [ ] Update `0level.html`:
  - [ ] Import 0level-ui.js module
  - [ ] Remove old script tags (main-generator.js, etc.)
  - [ ] Keep only initialization code
  - [ ] Test thoroughly
- [ ] **Verify 0level generator works correctly before proceeding**

**Benefits of this change:**
- ✅ More granular control over character generation
- ✅ Players can choose one, both, or neither option
- ✅ "Born Adventurers" is a better name for the ability score requirement
- ✅ Matches the split options already in Basic Mode
- ✅ Consistent terminology across 0-level, Basic, and Advanced generators

### Phase 4: Implement Advanced Mode with Shared Modules - **NORMAL PRIORITY**
**Do this AFTER Phases 2-3 are complete!**
- [ ] Create `advanced-utils.js` (similar to basic-utils.js)
  - [ ] Extract ability score functions
  - [ ] Add racial adjustment functions
  - [ ] Import shared modules
  - [ ] Add ES6 exports
- [ ] Create `advanced-character-gen.js` (similar to basic-character-gen.js)
  - [ ] Extract HP rolling functions
  - [ ] Extract ability rolling with racial adjustments
  - [ ] Extract class progression functions
  - [ ] Import shared modules
  - [ ] Add ES6 exports
- [ ] Create `advanced-ui.js` (similar to basic-ui.js)
  - [ ] Implement Advanced Mode UI logic
  - [ ] Implement race selection
  - [ ] Implement racial adjustments display
  - [ ] Add ES6 exports
- [ ] Update `advanced.html`
  - [ ] Import advanced-ui.js module
  - [ ] Remove inline JavaScript
  - [ ] Keep only initialization code
  - [ ] Test thoroughly

### Phase 5: Update Navigation and Landing Page - **NORMAL PRIORITY**

- [ ] Update `index.html` (landing page):
  - [ ] Add welcome message
  - [ ] Add links to all generators:
    - [ ] 0level.html - "Level 0 Character Generator"
    - [ ] basic.html - "Basic Mode (Levels 1-14)"
    - [ ] advanced.html - "Advanced Mode (Levels 1-14)"
    - [ ] classes.html - "Class Reference"
  - [ ] Add brief description of each generator
  - [ ] Add mode comparison (Normal vs Smoothified)
- [ ] Update navigation in all HTML files:
  - [ ] 0level.html: Update nav links (index.html → 0level.html)
  - [ ] basic.html: Update nav links
  - [ ] advanced.html: Update nav links
  - [ ] classes.html: Update nav links
- [ ] Test all navigation links

### Phase 6: Testing and Documentation ✅ PENDING
- [ ] Test all three generators (index.html, basic.html, advanced.html)
- [ ] Verify all functionality works
- [ ] Update README.md with module structure
- [ ] Add JSDoc comments to all functions
- [ ] Create module dependency diagram
- [ ] Update PLAN_CLASSES_IMPORT.md

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
- [ ] All inline JavaScript removed from advanced.html
- [ ] All inline JavaScript removed from 0level.html
- [x] Basic generator works correctly ✅
- [ ] Advanced generator works correctly
- [ ] 0level generator works correctly
- [ ] **Shared modules created and working (Phase 2)** ⚠️ HIGH PRIORITY
- [ ] **0level generator refactored to use shared modules (Phase 3)** ⚠️ HIGH PRIORITY
- [ ] No duplicate code between generators
- [x] All modules use ES6 export/import ✅
- [x] All functions have JSDoc comments ✅
- [ ] Navigation updated in all HTML files
- [ ] Landing page (index.html) created
- [ ] README.md updated with module structure
- [x] Basic mode tests passing ✅

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
