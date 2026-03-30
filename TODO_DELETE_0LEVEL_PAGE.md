# TODO: Integrate 0-Level Generation into Basic & Advanced Pages (Then Delete 0level.html)

## Goal

Enable players to start a campaign at **Level 0** entirely from `basic.html` or `advanced.html`,
progress through levels 1–14 using the existing generators, and eventually delete the standalone
`0level.html` page (and its exclusive JS files).

This creates one seamless experience: generate a level-0 character, hand it to a player, they
survive their first adventure, gain a class, and then use the same generator to level up all the
way to 14.

---

## Context: What Exists Today

### The Three Generator Pages (as of this writing)
| File | Mode Code | Description |
|------|-----------|-------------|
| `0level.html` | `m:'Z'` | Standalone level-0 generator with race buttons, bulk JSON, MD export |
| `basic.html`  | `m:'B'` | Levels 1–14, race-as-class (Dwarf/Elf/Halfling/Gnome are classes) |
| `advanced.html` | `m:'A'` | Levels 1–14, separate race + class grid (Human/Dwarf/Elf/Gnome/Halfling × Fighter/Cleric/MU/Thief/Spellblade) |

### Level-0 Specific Files (exclusive to `0level.html`)
| File | Role |
|------|------|
| `0level.html` | Page with race buttons, config panel, bulk JSON/MD generation |
| `0level-ui.js` | Calls `generate0LevelCharacter()`, builds the `sheet` object, calls `display0LevelCharacter()` |
| `0level-character-gen.js` | `generateSingleCharacter()` (rolls ability scores, race, name, background, HP, AC, saves, attack bonus); also `generate0LevelCharacter()` which calls `display0LevelCharacter()` via `window.*` |
| `0level-utils.js` | `roll3d6()`, `calculateHitPoints()` (1d4+CON min 1; racial/advanced variants), `calculateArmorClass()`, `getMinimumScores()`, `meetsMinimumRequirements()`, `hasHighAbility()`, `meetsPrimeRequisiteRequirements()`, `meetsHealthyCharactersRequirement()` |

### Shared Files Used by All Three Generators
| File | Key Exports |
|------|-------------|
| `shared-backgrounds.js` | `getRandomBackground(hp)` → `{profession, weapon, armor, item[]}` |
| `shared-racial-abilities.js` | `getAdvancedModeRacialAbilities(race)`, `calculateSavingThrows()`, `calculateAttackBonus()`, `getMaxLevel()` |
| `shared-race-adjustments.js` | `applyRaceAdjustments()`, `meetsRaceMinimums()` |
| `shared-ability-scores.js` | `calculateModifier()`, `rollAbilities()` |
| `shared-names.js` | `getRandomName(race)` |
| `shared-modifier-effects.js` | `getModifierEffects(ability, modifier, score)` |
| `shared-character-sheet.js` | `displayCharacterSheet(sheet, targetInfo, targetDisplay)`, `renderCharacterSheetHTML(sheet)` |
| `shared-compact-codes.js` | `encodeCompactParams(cp)`, `decodeCompactParams(encoded)` — lookup-table compression for `bg`, `ar`, `w`, `it` fields |
| `charactersheet.html` | Print/save page; decodes `?d=` URL param → `expandCompactV2(cp)` → renders sheet + Edit/Level Up panel |

---

## Level-0 Character Sheet Format (cp object, mode `'Z'`)

> **Full cp v2 field reference** — see the `shared-compact-codes.js` header comment for all modes (A/B/Z).

```js
{
  v: 2,        // version
  m: 'Z',      // mode: Z = 0-level
  r: 'HU',     // race code: HU/DW/EL/HA/GN
  s: [STR, DEX, CON, INT, WIS, CHA],   // 6 ability scores (adjusted)
  sv: [death, wands, paralysis, breath, spells],  // saving throws (0-level values)
  h: number,   // total HP (1d4 + CON modifier, min 1)
  hr: number[], // HP per entry — index 0 is always the L0 roll (= h for 0-level chars)
  hd: number[], // die sides per entry — hd[0] = 4 for 0-level
  n: 'Name',
  bg: 'Blacksmith',   // profession (decoded from BG_TO_CODE lookup)
  ar: 'Unarmored',    // armor (null if none)
  w: 'Hammer',        // weapon (null if none)
  it: ['item1', ...], // item array (decoded from ITEM_TO_CODE lookup)
  g: number,   // starting gold (3d6)
  ac: number,  // starting AC
  adv: 0|1,    // 1 = Advanced mode (racial adjustments applied)
  un: 0|1,     // show undead names
  qr: 0|1      // show QR code
  // NOTE: no l (level), p (progression), c (class), rcm (race-class mode), il, hc, wp, prm
}
```

The `charactersheet.html` `expandCompactV2()` function handles `m:'Z'` by:
- Using `getAdvancedModeRacialAbilities(race)` for racial abilities
- Showing `Header: "0-Level | Occupation"` format (no class, no level number)
- Using hard-coded or stored saving throws (`cp.sv`)
- Setting `experience: null` (no XP section)
- No spell slots, no turn undead

---

## How Level-0 Generation Works (the logic to reuse)

### 1. Roll / validate ability scores
```
0level-utils.js:
  getMinimumScores()     → reads STR/DEX/.../CHA min inputs
  meetsMinimumRequirements(scores, minimums)
  hasHighAbility(scores)   → at least one ≥ 9
  meetsPrimeRequisiteRequirements(scores, threshold)
  meetsHealthyCharactersRequirement(hp) → hp >= 2
```

### 2. Roll race
```
0level-character-gen.js: rollRace()
  → 1-in-4 chance demihuman, then 1-in-4 among DW/EL/GN/HA
  → Can be forced to specific race or "Demihuman"
```

### 3. Apply racial adjustments (Advanced mode only)
```
shared-race-adjustments.js: applyRaceAdjustments(results, race, isAdvanced, humanRacialAbilities)
shared-race-adjustments.js: meetsRaceMinimums(results, race, isAdvanced)
```

### 4. Calculate HP
```
0level-utils.js: calculateHitPoints(conModifier, race, isAdvanced)
  → rolls 1d4 + CON modifier (min 1 per roll)
  → some races / Advanced mode may add racial HP bonuses
  → returns { total, rolls }
```

### 5. Get background (based on HP)
```
shared-backgrounds.js: getRandomBackground(hp)
  → returns { profession, weapon, armor, item[] }
  → hp 1 → background category 1, hp 2 → category 2, hp 3-4 → category 3+
```

### 6. Calculate saving throws and attack bonus
```
shared-racial-abilities.js:
  calculateSavingThrows(level=0, race, conScore, isAdvanced, isGygar)
  calculateAttackBonus(level=0, race, isAdvanced, isGygar)
```

### 7. Calculate AC
```
0level-utils.js: calculateArmorClass(armor, dexModifier)
```

### 8. Roll starting gold: `3d6` gp

---

## Options on `0level.html` That Need to Move

These config options exist on `0level.html` and must be made available on `basic.html` / `advanced.html`
when Level 0 is selected:

| Option | Current Location | Notes |
|--------|-----------------|-------|
| Ability score minimums (STR/DEX/CON/INT/WIS/CHA) | `0level.html` inputs | basic.html already has minimums in step 5 |
| Prime Requisite ≥ 9 / ≥ 13 | `0level.html` radios | basic.html already has these radios |
| Healthy Characters (HP ≥ 2) | `0level.html` checkbox | basic.html already has this checkbox |
| Advanced Mode (racial adjustments) | `0level.html` checkbox | basic.html = always Basic (no racial adj); advanced.html = always Advanced |
| Human Racial Abilities | `0level.html` checkbox | Only relevant in Advanced mode |
| Smoothified Mode (attack bonus 0 instead of -1) | `0level.html` checkbox | Maps to progressionMode 'smooth' on basic/advanced |
| Race selection | `0level.html` race buttons | Needs to be added to basic/advanced when Level 0 selected |
| Bulk JSON/MD generation | `0level.html` button grid | **Nice to have but not required** for phase 1 |

---

## The "Level 0" Button: What Happens in basic.html / advanced.html

### UI Change
Add a **"0"** level button before "1" in the level selection row in both `basic.html` and `advanced.html`.

When level 0 is selected:
- **basic.html**: Class buttons become irrelevant (0-level has no class); either hide them or show race buttons (Human / Demihuman / Dwarf / Elf / Gnome / Halfling) instead
- **advanced.html**: The race-class grid is irrelevant; show race selection only (or add a race row to the existing grid with no class)
- Equipment/starting wealth section should be hidden (0-level uses background-based equipment)
- "Include Level 0 HP" option is irrelevant at level 0 (hide or disable)

### Generation Logic Change (basic-ui.js / advanced-ui.js)
When `selectedLevel === 0`, call the 0-level generation path instead of the normal class-based path:

```js
if (selectedLevel === 0) {
    // Import and call generateSingleCharacter() from 0level-character-gen.js
    // OR refactor the generation logic into a shared function in 0level-utils.js
    // Display as a mode:'Z' sheet
} else {
    // Existing level 1+ logic
}
```

### The cp Object for Level 0 From basic.html
Same as the existing `0level.html` output — `m:'Z'`, no class code, no level number. The `adv` field should be:
- `adv: 0` when called from `basic.html`
- `adv: 1` when called from `advanced.html`

---

## The Print Page (`charactersheet.html`) Edit/Level Up Panel Enhancement

Currently when `m:'Z'` (0-level), the Edit/Level Up panel **hides** the Level and Progression Mode sections. This needs to be enhanced to allow promoting a character from level 0 to level 1:

### Required Changes in `charactersheet.html`

1. For `m:'Z'` mode, show a level selector **0 through 14** (currently shows nothing; 0 should be pre-selected)
2. When the user selects level ≥ 1 from a level-0 sheet:
   - Show a **class selector** (for Basic: Cleric/Fighter/Magic-User/Thief/Dwarf/Elf/Halfling/Gnome; for Advanced: a race-class grid or dropdowns)
   - This class selection changes the `cp.m` from `'Z'` to `'B'` or `'A'` and adds `cp.c` (class code)
3. Keep `cp.r` (race) from the level-0 data so the promoted character keeps their race

### The `cp` Object Transformation on Level-Up
```
Level 0 (m:'Z') → Level 1+ (m:'B' or 'A'):
  Keep: r, s, n, un, qr
  Change: m → 'B' or 'A'
  Add: c (class code), l (new level), p (progression mode)
  Remove: sv (recalculated from class/level), adv
  Keep: bg (background profession still relevant for character history)
  New: ar, w, it, ac, g (new equipment from class starting equipment)
  New: h (new HP — level 1 class HP)
```

This transformation is complex. Consider two approaches:
- **Simple**: Navigate back to `basic.html` or `advanced.html` with pre-filled scores, letting the generator do the rest
- **In-page**: Add a class picker to the Edit panel and do the full transformation in `charactersheet.html`

The **simple approach is recommended first**: When promoting from 0 to 1+ in the Edit panel, build a URL like:
```
basic.html?promoteFrom=<encoded_level0_cp>
```
And have `basic.html` detect this on load, pre-fill the ability scores, name, and show a "Promoted from Level 0!" banner. The user then clicks a class button to generate.

---

## Files to Modify

### Phase 1: Add Level 0 to basic.html and advanced.html

1. **`basic.html`**: Add `<button class="level-btn" data-level="0">0</button>` at the start of `#levelSelection`; add race selection UI that appears when level 0 is selected (reuse the 0level.html race button grid)
2. **`basic-ui.js`**: 
   - Handle `selectedLevel === 0` in `generateCharacter()` — call 0-level generation path
   - `updateUI()` — hide class buttons / show race buttons when level 0 selected; hide equipment wealth section
   - Import from `0level-character-gen.js` and `0level-utils.js`
3. **`advanced.html`**: Add `0` button; show only race row in grid (no class column) when level 0 selected
4. **`advanced-ui.js`**: Same treatment as basic-ui.js for level 0 branch
5. **`charactersheet.html`**: Enhance Edit/Level Up panel to show level 0, allow level-up with class selection (or use redirect approach)

### Phase 2: Delete 0level.html and Its Files

Once basic.html and advanced.html fully support level 0:
1. Update `index.html` navigation links (remove 0level.html reference)
2. Update `basic.html`, `advanced.html`, `advanced.html`, `classes.html` nav links
3. Delete: `0level.html`, `0level-ui.js`, `0level-character-gen.js`, `0level-utils.js`
4. Verify no other files import from these (run: `grep -r "0level" *.js *.html`)
5. Consider keeping `0level-utils.js` functions by merging into `shared-ability-scores.js` or a new `shared-0level-gen.js`

---

## Refactoring Recommendation: shared-0level-gen.js

To avoid duplicating the level-0 generation logic across basic-ui.js and advanced-ui.js, extract it:

```js
// shared-0level-gen.js (new file)
export async function generateZeroLevelCharacter({
    race,           // '' | 'Demihuman' | 'Human' | 'Dwarf' | 'Elf' | 'Gnome' | 'Halfling'
    isAdvanced,     // boolean
    humanRacialAbilities, // boolean
    isGygar,        // boolean (Smoothified)
    minimums,       // { STR, DEX, CON, INT, WIS, CHA }
    primeReqMode,   // 'user' | '9' | '13'
    healthyChars,   // boolean
}) → Promise<{
    results,        // ability score objects [{ability, roll, modifier, originalRoll?}]
    race,           // 'Human_RACE' etc.
    name,
    background,     // {profession, weapon, armor, item[]}
    hitPoints,      // {total, rolls}
    armorClass,
    startingGold,
    savingThrows,
    attackBonus,
    total           // sum of modifiers
}>
```

This function is essentially the existing `generateSingleCharacter()` from `0level-character-gen.js`
but parameterized instead of reading from the DOM.

---

## Navigation: Updated Links After Deletion

When `0level.html` is deleted:
- `index.html`: Remove or redirect the "Level 0 Generator" nav link
- All pages: The nav bar currently shows: `Level 0 Generator | Basic (Levels 1+) | Advanced (Levels 1+) | Class Reference`
- New nav: `Basic (Levels 0–14) | Advanced (Levels 0–14) | Class Reference`

---

## Current Nav Link (in all pages)
```html
<a href="0level.html">Level 0 Generator</a>
<a href="basic.html">Basic (Levels 1+)</a>
<a href="advanced.html">Advanced (Levels 1+)</a>
```

## Target Nav (after deletion)
```html
<a href="basic.html">Basic (Levels 0–14)</a>
<a href="advanced.html">Advanced (Levels 0–14)</a>
<a href="classes.html">Class Reference</a>
```

---

## Key Technical Decisions for New Context

1. **Where does the race selector go in basic.html when level 0 is selected?**
   - Option A: Replace the class button row with race buttons (Random/Human/Demihuman/Dwarf/Elf/Gnome/Halfling)
   - Option B: Keep class buttons greyed out, add a separate race row that appears above
   - **Recommendation: Option A** — simpler, matches existing 0level.html UX

2. **Where does the race selector go in advanced.html when level 0 is selected?**
   - The existing race-class grid has races as rows and classes as columns
   - Option A: Hide the class columns entirely, show only the race column (one button per race row)
   - Option B: Add a dedicated "Level 0 - No Class" column
   - **Recommendation: Option A** — hide class UI, show single race selector like basic.html

3. **How does the Edit/Level Up panel on `charactersheet.html` handle class selection when promoting from 0 to 1?**
   - Option A: Redirect to `basic.html`/`advanced.html` with pre-filled scores (simpler)
   - Option B: Inline class picker added to the edit panel (more complex, but better UX)
   - **Recommendation: Start with Option A**, upgrade to Option B if desired

4. **Should bulk JSON generation (4/16/100 characters) be preserved?**
   - Currently only on `0level.html`
   - **Recommendation: Omit from phase 1** — can be re-added later as advanced feature

5. **Should Markdown / canvas PNG generation be preserved?**
   - Currently only on `0level.html` (via `canvas-generator.js`, `markdown-generator.js`)
   - Basic/advanced don't have these export buttons
   - **Recommendation: Omit from phase 1** — the print tab + QR code covers the main use case

---

## File Dependency Tree (for reference)

```
basic.html
  └── basic-ui.js
        ├── basic-character-gen.js
        │     └── basic-utils.js
        ├── shared-equipment.js
        ├── shared-character.js (rollStartingGold, calcStartingGold)
        ├── shared-names.js
        ├── shared-backgrounds.js
        ├── shared-modifier-effects.js
        ├── shared-character-sheet.js
        │     └── shared-compact-codes.js
        ├── class-data-gygar.js (Smoothified)
        ├── class-data-ose.js (OSE Standard)
        └── class-data-ll.js (Labyrinth Lord)

advanced.html
  └── advanced-ui.js
        ├── advanced-character-gen.js
        │     └── advanced-utils.js
        ├── shared-equipment.js
        ├── shared-character.js
        ├── shared-names.js
        ├── shared-backgrounds.js
        ├── shared-modifier-effects.js
        ├── shared-character-sheet.js
        │     └── shared-compact-codes.js
        ├── shared-racial-abilities.js (getMaxLevel)
        ├── class-data-gygar.js
        ├── class-data-ose.js
        └── class-data-ll.js

0level.html (TO BE DELETED)
  └── 0level-ui.js
        ├── 0level-character-gen.js
        │     ├── 0level-utils.js
        │     ├── shared-ability-scores.js
        │     ├── shared-names.js
        │     ├── shared-backgrounds.js
        │     ├── shared-racial-abilities.js
        │     └── shared-race-adjustments.js
        ├── shared-modifier-effects.js
        ├── shared-racial-abilities.js
        ├── canvas-generator.js (JSON/MD export)
        └── shared-character-sheet.js

charactersheet.html (print/save/edit page)
  ├── shared-character-sheet.js (renderCharacterSheetHTML only — no edit state)
  ├── shared-compact-codes.js (decodeCompactParams)
  ├── basic-character-gen.js (for m:'B' expansion)
  ├── advanced-character-gen.js (for m:'A' expansion)
  ├── shared-racial-abilities.js (for m:'Z' expansion)
  ├── shared-ability-scores.js
  ├── shared-modifier-effects.js
  ├── basic-utils.js
  ├── advanced-utils.js
  └── class-data-*.js (lazy-loaded by progression mode)
```

---

## Implementation Order (Recommended)

1. **Create `shared-0level-gen.js`** — extract `generateSingleCharacter()` logic from `0level-character-gen.js` into a DOM-independent, parameterized async function
2. **Add Level 0 to `basic.html` + `basic-ui.js`**:
   - Add "0" button to level grid
   - When level 0 selected: show race selector, hide class/equipment sections
   - `generateCharacter()` branches on `selectedLevel === 0` → calls `shared-0level-gen.js`
   - Builds `m:'Z'` sheet object and calls `displayCharacterSheet()`
3. **Add Level 0 to `advanced.html` + `advanced-ui.js`**:
   - Same approach, but `adv: 1` in the cp object
   - Race selector replaces the race-class grid UI
4. **Enhance `charactersheet.html` Edit panel for 0→1+ promotion**:
   - Show level 0 option; when upgrading to 1+, redirect to `basic.html` or `advanced.html` with pre-filled scores
5. **Delete `0level.html` and related files** after verifying feature parity
6. **Update all nav links** to remove reference to `0level.html`

---

## Key Technical Facts Established (as of 2026-03-29)

### Stable `hr[]` array layout
`shared-hit-points.js` now guarantees: **L0 background HP roll is always at `hr[0]`/`hd[0]`**, regardless of the `includeLevel0HP` flag. `hr[1]`=L1 HP, `hr[2]`=L2 HP, etc. `il=1` means `hr[0]` is counted in the max HP total; `il=0` means it is stored but not counted. This eliminates the old prepend/slice shuffle that was causing edit round-trip bugs.

### L1 HP floor: `hr[1] >= hr[0]` when `il=0`
`rollHitPoints()` now guarantees that when `includeLevel0HP=false` (`il=0`), the L1 HP roll is rerolled until it is **≥ the L0 background HP**. This prevents a character from having fewer HP at Level 1 than they had as a Level 0 character. The same floor is applied in the Level Up panel of `charactersheet.html`. The reroll condition in `shared-hit-points.js` is:
```js
} while (lvl === 1 && !includeLevel0HP && (
    levelHP < backgroundHP ||
    (healthyCharacters && levelHP < 2)
));
```
In the Level Up panel (`charactersheet.html`):
```js
const minHP = (lvl === 1 && !decoded.il) ? l0HP : 1;
do {
    lvlHP = Math.max(1, Math.floor(Math.random() * hd.sides) + 1 + conMod);
} while (lvlHP < minHP);
```
No infinite loop risk: max(L1 roll) = hd.sides + max_CON_mod ≥ 1d4 + max_CON_mod = max(L0 roll).

### Background column in Basic/Advanced header
The character sheet header row now includes a **Background** column (between Character Name and Class/Race & Class) for Basic and Advanced modes. This is set via `header.columns` in the sheet object. The 0-level header already had "Occupation" in that position and is unchanged. The `page2MiniHeader` in `shared-character-sheet.js` finds the class column by label (`c.label === 'Class' || c.label === 'Race & Class'`) rather than position index.

### cp v2 fully documented
Every cp v2 field is documented in the header comment of `shared-compact-codes.js`. When implementing level-0 generation from basic.html / advanced.html, use this as the canonical reference for what goes in the cp object.

### `charactersheet.html` Edit panel
- `isL0 = (i === 0)` — unconditional; index 0 is always L0
- `syncHpToLevel` offset is always `1` (L0 always occupies slot 0)
- HP sum for Apply Changes skips `hr[0]` when `il=0`

---

## Testing Checklist (for new context to verify)

- [ ] basic.html: clicking "0" generates a level-0 character with Background, Occupation, 1d4 HP
- [ ] basic.html: "0" character shows no class, no XP, no spell slots, no turn undead
- [ ] basic.html: level-0 cp has `m:'Z'`, no `c` (class) field, `hr:[<l0hp>]`, `hd:[4]`
- [ ] advanced.html: same as above but `adv:1` and racial adjustments applied
- [ ] Print tab (charactersheet.html): Edit/Level Up panel shows level 0 as selected
- [ ] Print tab: selecting level 1+ and a class promotes the character correctly
- [ ] All existing level 1–14 generation still works on both pages
- [ ] Nav links updated; 0level.html removed or redirects to basic.html
- [ ] No broken imports after deletion (grep for `0level-character-gen`, `0level-ui`, `0level-utils`)
