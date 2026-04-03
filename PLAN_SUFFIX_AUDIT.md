# Plan: _CLASS / _RACE Suffix Audit — COMPLETED

## Background

The codebase uses suffixed identifiers for classes and races:
- **Classes**: `'Dwarf_CLASS'`, `'Fighter_CLASS'`, etc.
- **Races**: `'Dwarf_RACE'`, `'Elf_RACE'`, etc.

Some lookup tables and comparisons used bare names (`'Dwarf'`, `'Fighter'`) when the caller
passed suffixed names — causing silent lookup failures that return wrong/default values.

### Key context: `button.dataset.*` always contains bare names

HTML class/race buttons use `data-class="Dwarf"` and `data-race="Elf"` (bare, no suffix).
When `gen-ui.js` reads `button.dataset.class`, it gets a bare name and then immediately
normalizes it with:
```js
if (selectedClass && !selectedClass.endsWith('_CLASS')) selectedClass += '_CLASS';
```
So `selectedClass` and `selectedRace` module-level variables are **always suffixed** when used
in generation functions. But `button.dataset.class` inside DOM loops is **always bare**.

---

## Fixes Applied

### ✅ FIXED: `shared-class-progression.js:getBasicModeRacialAbilities`
Added `const baseClass = className.replace('_CLASS', '')` before the demihuman list check
and lookup. Was returning `[]` for `'Dwarf_CLASS'` because it checked bare names.

### ✅ FIXED: `shared-basic-utils.js:getClassRequirements` (L48-56)
Added `const base = (className || '').replace(/_CLASS$/, '')` before lookup.
- Callers (`gen-ui.js:406`, `gen-ui.js:677`) pass `selectedClass = 'Dwarf_CLASS'` (suffixed)
- Bare keys in table (`'Dwarf': { CON: 9 }`) → lookup was returning `{}` for all demihumans
- **Bug**: Dwarf CON 9, Elf INT 9, Halfling CON 9 + DEX 9 requirements were silently not enforced

### ✅ CLEANED UP: `shared-advanced-utils.js:getAvailableClasses`
Removed dead `_RACE` duplicate keys (`'Dwarf_RACE': [...]`, `'Elf_RACE': [...]`, etc.).
- The only caller (`gen-ui.js:351`) passes `race = button.dataset.race` which is always bare
- The `_RACE` keys were never reached; added clarifying comment

---

## Not Bugs (initial audit was wrong about these)

| Item | Why it's fine |
|------|--------------|
| `shared-basic-utils.js:getDemihumanLimits` bare keys | Caller uses `cn = button.dataset.class` (bare) → `limits['Dwarf'] = 12` is a correct match |
| `gen-ui.js:353` `className === 'Spellblade'` | In DOM loop: `className = button.dataset.class` is bare, so comparison is correct |
| `gen-ui.js:354` `race === 'Elf'` | In DOM loop: `race = button.dataset.race` is bare, so comparison is correct |
| `shared-class-data-shared.js: basic: ["Dwarf"]` | `availableRaces` field is metadata only — never read by any code |

---

## Already Correct (no changes needed)

| File | Why it's OK |
|------|-------------|
| `gen-equipment.js:49,67` | Strips `_CLASS` on L67 before all lookups |
| `shared-class-progression.js:109,125,138` | Uses `baseClassName` (already stripped) |
| `shared-ability-scores.js:49` | `getPrimeRequisites` uses `_CLASS`-suffixed keys; callers pass `selectedClass` (suffixed) |
| `shared-advanced-utils.js:getClassRequirements` | Normalizes via `endsWith('_CLASS')` check |
| `legacy-utils.js:getHitDiceSize` | JSDoc says "without suffix"; not called by any external file |
| `legacy-utils.js:getClassPrimeRequisites` | JSDoc says "without suffix"; not called externally |
| `shared-race-names.js` | The bare→suffixed mapping table; bare keys are intentional |

---

## Recommended Convention

**Pattern to follow everywhere** (as used in `gen-equipment.js`): strip the suffix at the
function boundary, keep data table keys as bare names:
```js
const base = (className || '').replace(/_CLASS$/, '').replace(/_RACE$/, '');
return TABLE[base] || defaultValue;
```
This makes functions robust to callers that pass either form.
