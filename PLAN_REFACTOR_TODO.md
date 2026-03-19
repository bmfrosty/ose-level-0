# JavaScript Module Refactoring - TODO

> **Status:** Major refactoring complete! Only documentation and optional enhancements remain.
> **Completed:** All three generators refactored to ES6 modules with shared code
> **For completed work history:** See PLANS_COMPLETED/PLAN_REFACTOR_JS_MODULES.md and PLANS_COMPLETED/PLAN_REFACTOR_COMPLETE.md

## Remaining Work

### Phase 9: Convert Remaining Non-ES6 Modules - **ACTIVE** (Priority: High)
Convert all remaining non-ES6 modules to ES6 format for consistency and better maintainability.

#### Phase 9A: Convert shared-racial-abilities.js (formerly racial-abilities.js)

**Phase 9A1: Create ES6 Module** ✅ COMPLETE
- [x] Created `shared-racial-abilities.js` with ES6 exports
- [x] Added proper imports from shared-race-names.js
- [x] Added JSDoc comments

**Phase 9A2: Update 0-Level Generator** ✅ COMPLETE
- [x] Update `0level-character-gen.js`:
  - [x] Add import for calculateSavingThrows, calculateAttackBonus
  - [x] Remove wrapper functions that call window.* versions
- [x] Update `0level-ui.js`:
  - [x] Add import for getRacialAbilities
  - [x] Remove window.getRacialAbilities reference
- [x] Update `0level.html`:
  - [x] Remove `<script src="racial-abilities.js">` tag
  - [x] Added comment noting ES6 module usage

**Phase 9A3: Update Basic Generator** ✅ COMPLETE
- [x] Renamed `getRacialAbilities` to `getBasicModeRacialAbilities` in shared-class-progression.js
  - [x] Updated JSDoc to clarify it's for Basic Mode (race-as-class)
- [x] Updated `basic-character-gen.js`:
  - [x] Import getBasicModeRacialAbilities from shared-class-progression.js
  - [x] Update wrapper function to use new name
- [x] Renamed `getRacialAbilities` to `getAdvancedModeRacialAbilities` in shared-racial-abilities.js
  - [x] Updated JSDoc to clarify it's for Advanced/0-Level Mode (race + class)
- [x] Updated `0level-ui.js`:
  - [x] Import getAdvancedModeRacialAbilities from shared-racial-abilities.js
  - [x] Update function call to use new name
- [x] **Result:** Clear separation between Basic Mode (race-as-class) and Advanced/0-Level Mode (race + class)

**Phase 9A4: Update Advanced Generator** ✅ COMPLETE
- [x] Update `advanced-character-gen.js`:
  - [x] Import getAdvancedModeRacialAbilities from shared-racial-abilities.js
  - [x] Simplified complex wrapper function (removed window.* dependency)
  - [x] Kept minimal checkbox manipulation (temporarily set values, then restore)
  - [x] Much cleaner than before - no DOM element creation/removal
- [x] Update `advanced-ui.js`:
  - [x] No changes needed - uses getRacialAbilities from advanced-character-gen.js

**Phase 9A5: Update 0-Level Renderers** - DEFERRED
- [ ] **Decision:** Defer to Phases 9C/9D/9E (convert all renderers together)
- [ ] **Reason:** Canvas renderers need dual browser/Node.js compatibility
- [ ] **Scope:** Only affects 0-level PDF/PNG/Markdown generation (not web display)
- [ ] **Note:** Web page display already uses ES6 modules:
  - 0-level: `getAdvancedModeRacialAbilities()` from `shared-racial-abilities.js`
  - Basic: `getBasicModeRacialAbilities()` from `shared-class-progression.js`
  - Advanced: `getRacialAbilities()` from `advanced-character-gen.js`

**Phase 9A6: Update Node.js Generator** - PENDING
- [ ] Update `node-canvas-generator.js`:
  - [ ] Import from shared-racial-abilities.js instead of names-tables.js
  - [ ] Remove global.getRacialAbilities assignment
  - [ ] Update other imports as needed

**Phase 9A7: Cleanup and Testing** - PENDING
- [ ] Delete old `racial-abilities.js` file
- [ ] Test 0-level generator (all functionality)
- [ ] Test Basic generator (racial abilities display)
- [ ] Test Advanced generator (racial abilities display)
- [ ] Test PDF generation (classic and underground)
- [ ] Test PNG generation
- [ ] Test Markdown generation
- [ ] Test JSON generation
- [ ] Test Node.js CLI generation
- [ ] Verify no console errors

#### Phase 9B0: Convert shared-race-names.js to ES6 Module - ✅ COMPLETE

- [x] Added ES6 `export` to `LEGACY_RACE_NAMES` and `normalizeRaceName` in `shared-race-names.js`
- [x] Inlined `LEGACY_RACE_NAMES` + `normalizeRaceName` in `racial-abilities.js` (self-contained global script)
- [x] Inlined `LEGACY_RACE_NAMES` + `normalizeRaceName` in `race-adjustments.js` (self-contained global script)
- [x] Removed `<script src="shared-race-names.js">` from `advanced.html`
- [x] Removed `<script src="shared-race-names.js">` from `0level.html`
- [x] Replaced inlined copy in `shared-racial-abilities.js` with proper `import`
- [x] Tested: advanced.html ✅, 0level.html ✅ (pre-existing `generateSingleCharacter` console error unrelated — fixed by Phase 9F)

#### Phase 9B: Convert race-adjustments.js - ✅ COMPLETE

- [x] Created `shared-race-adjustments.js` with ES6 exports
- [x] Imports `normalizeRaceName` from `shared-race-names.js` and `getModifier` from `shared-modifier-effects.js`
- [x] Function is now synchronous (static imports vs old async dynamic import)
- [x] Updated `0level-character-gen.js` to import from `shared-race-adjustments.js`
- [x] Removed `<script src="race-adjustments.js">` from `0level.html`
- [x] Kept `race-adjustments.js` as-is for `node-canvas-generator.js` (uses `require()`)
- [x] Tested: 0level.html ✅ characters generate correctly

#### Phase 9C: Convert canvas-sheet-renderer.js - ✅ COMPLETE

- [x] Added ES6 `import` for `getModifierEffects` and `getAdvancedModeRacialAbilities as getRacialAbilities`
- [x] Changed `class CanvasCharacterSheet` to `export class CanvasCharacterSheet`
- [x] Kept `module.exports` check for backward compat reference (Node.js CLI needs Phase 9A6 rewrite)
- [x] `canvas-generator.js` imports it as ES6 module

#### Phase 9D: Convert underground-sheet-renderer.js - DEFERRED (Node.js only)

- **Decision:** `underground-sheet-renderer.js` uses Node.js-specific APIs (`require('fs')`, `require('canvas').loadImage`) and is NOT loaded in any browser HTML file. Deferring to Phase 9A6 (full Node.js CLI rewrite).

#### Phase 9E: Convert markdown-generator.js - ✅ COMPLETE

- [x] Added ES6 `import` for `getModifierEffects` and `getAdvancedModeRacialAbilities as getRacialAbilities`
- [x] Added `export` to `generateCharacterMarkdown` function
- [x] Removed browser/Node.js detection logic (clean ES6 module)
- [x] `canvas-generator.js` imports it as ES6 module

#### Phase 9F: Convert canvas-generator.js - ✅ COMPLETE

- [x] Added ES6 `import` for `CanvasCharacterSheet`, `generateCharacterMarkdown`, `generateSingleCharacter`
- [x] All functions made `async` (properly `await generateSingleCharacter()`)
- [x] All functions exported with `export async function`
- [x] Updated `0level-ui.js` to import all canvas functions directly (no more `window.*` checks)
- [x] Removed `markdown-generator.js`, `canvas-sheet-renderer.js`, `canvas-generator.js` global `<script>` tags from `0level.html`
- [x] **Tested: 0level.html ✅ — no `generateSingleCharacter` error, Random & Random PNG work!**

**Testing after Phase 9:**
- [ ] Test 0level generator - all functionality working
- [ ] Test PDF generation - both classic and underground styles
- [ ] Test PNG generation
- [ ] Test Markdown generation
- [ ] Test JSON generation
- [ ] Verify no console errors
- [ ] Verify all imports working correctly

**Benefits of Phase 9:**
- ✅ All modules use consistent ES6 import/export
- ✅ Better IDE support and code completion
- ✅ Clearer dependency graph
- ✅ No more global script tags in HTML
- ✅ Easier to test individual modules
- ✅ Consistent with basic.html and advanced.html architecture

### Phase 6B: Documentation - **PENDING** (After Phase 9)
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
    - [ ] `shared-names.js` - Name generation
    - [ ] `shared-backgrounds.js` - Background generation
    - [ ] `shared-modifier-effects.js` - Ability modifier effects
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
  
  - [ ] **Legacy/0level-Specific Modules** (loaded globally, not ES6):
    - [ ] `racial-abilities.js` - Racial ability descriptions (still used by 0level)
    - [ ] `race-adjustments.js` - 0level racial adjustments (still used by 0level)
    - [ ] `deprecated-js/ose-modifiers.js` - OSE modifier tables (getModifier() still needed by race-adjustments.js)
    - [ ] `canvas-generator.js` - PNG/PDF generation (0level only)
    - [ ] `canvas-sheet-renderer.js` - Character sheet rendering (0level only)
    - [ ] `markdown-generator.js` - Markdown export (0level only)
    - [ ] `node-canvas-generator.js` - Node.js canvas utilities (0level only)
    - [ ] `underground-sheet-renderer.js` - Alternative sheet renderer (0level only)
    - [ ] `shared-race-names.js` - Legacy race name constants (loaded globally to avoid conflicts)
  
  - [ ] **Deprecated Files** (moved to `deprecated-js/` directory):
    - [ ] `main-generator.js` - Old 0level generator (replaced by 0level-*.js modules)
    - [ ] `character-display.js` - Old display logic (now in 0level-ui.js)
    - [ ] `character-utils.js` - Old utilities (now in 0level-utils.js)
    - [ ] `dice-utils.js` - Old dice utilities (now in shared-ability-scores.js)
    - [ ] `background-tables.js` - Old background tables (replaced by shared-backgrounds.js ES6 module)
    - [ ] `names-tables.js` - Old name tables (replaced by shared-names.js ES6 module)
    - [ ] `ose-modifiers.js` - Old modifier functions (getModifierEffects() replaced by shared-modifier-effects.js ES6 module, getModifier() still used by race-adjustments.js)
    - [ ] `weapons-and-armor.js` - Unused (data in class-data files) - can be moved
    - [ ] `test-gygar-data.js` - Development testing file - can be moved

- [ ] **Create Module Dependency Diagram:**
  - [ ] Visual diagram showing module relationships
  - [ ] Show shared vs generator-specific modules
  - [ ] Document import/export patterns

### Phase 10: Shared Character Renderer Architecture - **FUTURE** (Priority: Medium)
Create a unified rendering system for all three generators.

**Current State:**
- 0-level: HTML in `0level-ui.js`, PDF/PNG via canvas renderers, Markdown via `markdown-generator.js`
- Basic: HTML in `basic-ui.js` only (no exports)
- Advanced: HTML in `advanced-ui.js` only (no exports)

**Proposed Architecture:**
```javascript
shared-character-renderer.js (new ES6 module)
├── renderHTML(character, options) → HTML string
├── renderPDF(character, options) → PDF blob
├── renderPNG(character, options) → PNG blob
└── renderMarkdown(character, options) → Markdown string
```

**Benefits:**
- ✅ DRY Principle - Single source of truth for rendering
- ✅ Consistency - All generators use same rendering code
- ✅ Easier Testing - Test one module instead of 3
- ✅ Future Features - Add PDF/PNG/Markdown to Basic/Advanced easily
- ✅ ES6 Throughout - Clean module architecture

**Implementation Plan:**
- [ ] Phase 10A: Extract HTML rendering from UI files
  - [ ] Create `shared-character-renderer.js` with `renderHTML()` function
  - [ ] Update `0level-ui.js` to use shared renderer
  - [ ] Update `basic-ui.js` to use shared renderer
  - [ ] Update `advanced-ui.js` to use shared renderer
  - [ ] Test all three generators

- [ ] Phase 10B: Add export capabilities to shared renderer
  - [ ] Integrate canvas renderers into `renderPDF()` and `renderPNG()`
  - [ ] Integrate markdown generator into `renderMarkdown()`
  - [ ] Add export buttons to Basic and Advanced generators
  - [ ] Test all export formats

- [ ] Phase 10C: Cleanup and optimization
  - [ ] Remove duplicate rendering code from UI files
  - [ ] Optimize rendering performance
  - [ ] Add rendering options/themes
  - [ ] Document rendering API

**Note:** This is a future enhancement - Phase 9 focuses on ES6 conversion only.

### Future Combat Stats Enhancement - **OPTIONAL**
**Note:** The 0-level generator shows how ability score modifiers affect combat stats. These modifiers apply to **ALL character levels** (0-level, Basic Mode levels 1-14, and Advanced Mode levels 1-14).

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

## Completed Phases

See `PLANS_COMPLETED/PLAN_REFACTOR_COMPLETE.md` for all completed work.

## Current Status

**All Major Refactoring Complete!** ✅

- ✅ Phase 1: Basic Mode refactored into ES6 modules
- ✅ Phase 2: Shared utilities extracted
- ✅ Phase 3: 0-level generator refactored
- ✅ Phase 4: Advanced Mode implemented with shared modules
- ✅ Phase 5: Navigation and landing page updated
- ✅ Phase 6A: All generators tested and working
- ✅ Phase 7: Shared names and backgrounds modules
- ✅ Phase 8: Shared modifier effects module

**Remaining:** Documentation (Phase 6B) and optional enhancements (Phase 3B, combat stats)
