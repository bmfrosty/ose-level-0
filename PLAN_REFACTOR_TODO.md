# JavaScript Module Refactoring - TODO

## Remaining Work

### Phase 3B: Update 0level Options - **PENDING**
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

### Phase 6B: Documentation - **PENDING**
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
