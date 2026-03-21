# TODO — Active Planning Document

> **Status:** All three generators complete and working. README updated (2026-03-19). Phase 2A (class abilities, thief skills, ability descriptions) complete (2026-03-20). Phase 2B (starting wealth) complete (2026-03-20). Remaining: Phase 2C–2D (equipment purchase, racial abilities in Advanced mode), HTML sheet improvements, comprehensive testing, misc enhancements.

> ⚠️ **IMPORTANT — ALWAYS UPDATE THIS FILE:** After completing any task, mark checklist items `[x]`, update the status line above with the date, and move "next up" markers accordingly. Do not leave this file stale.
> **History:** See `PLANS_COMPLETED/` for all completed work.

---

## Priority Order

1. ~~**README.md update**~~ ✅ Complete (2026-03-19)
2. **Upper level character generation** — class abilities, wealth, automatic equipment purchase, background selection ← HIGH PRIORITY
3. **HTML sheet improvements** — `@media print` CSS, equipment formatting, Notes section
4. **Comprehensive class/level testing** — saves, attacks, spell slots at levels 1/5/10/14
5. **Level 0 occupation weapon assignments** — ~17 occupations still need weapons
6. **Optional enhancements** — combat stats display, UI polish, export improvements

---

## 1. README Update — ✅ COMPLETE

README.md has been rewritten to document:
- Three generators (0level.html, basic.html, advanced.html) and what each does
- Quick start: `python3 -m http.server 8000`
- PDF workflow: Open in New Tab → browser Print / Save as PDF
- OSE Standard / Smoothified (Gygar) / Labyrinth Lord modes and class lists
- Level 0 "Advanced" checkbox explanation
- Full module/file structure table
- Removed files documented (generate-pdf.sh, node-canvas-generator.js, deprecated-js/)

---

## 2. Upper Level Character Generation — PENDING ← NEXT (HIGH PRIORITY)

Features for `basic.html` and `advanced.html` to make upper-level characters feel complete at generation time.

### What already works
- `getClassFeatures()` in `shared-class-progression.js` retrieves `spellSlots`, `thiefSkills`, `turnUndead`, and `classAbilities` from `CLASS_ABILITIES` in `class-data-shared.js`
- `getAbilitiesAtLevel(className, level)` already filters class abilities by available level
- `getRacialAbilities(className)` already returns racial ability strings for Basic Mode demihuman classes
- Background occupation from `getRandomBackground(hp)` already provides weapon, armor name, and profession text
- `shared-character-sheet.js` renders all of the above: ABILITIES section shows `racial[]` and `class[{name,description}]` lists, SPELL SLOTS and TURN UNDEAD sections already rendered

### What's missing / gaps

#### Phase 2A — Class Abilities: Verify & enrich — ✅ COMPLETE (2026-03-20)

The `CLASS_ABILITIES` entries in `class-data-shared.js` flow to the sheet.

- [x] **2A-1** Audited sheet output: CLASS ABILITIES section shows up for all classes. Verified Fighter L1 (Combat Machine), Thief L10 (5 abilities including Scroll Use at level 10), etc.
- [x] **2A-2** Fixed `getThiefSkills()` in both `class-data-ose.js` and `class-data-gygar.js` to return formatted strings (`"96%"`, `"1-4 on 1d6"` for Hear Noise). Fixed `shared-character-sheet.js` renderer to stop appending extra `%`.
- [x] **2A-3** Confirmed class ability descriptions already include level-specific numbers: Thief "Read Languages" notes 80%; "Scroll Use" notes 10% error chance.
- [x] **2A-4** Fixed Halfling "Hiding" ability description in `class-data-shared.js` to include the dungeon case: "In dungeons: 2-in-6 chance to hide in shadows or behind cover."
- [x] **2A-5** Fixed `_CLASS` suffix stripping in `shared-class-progression.js` → `getClassFeatures()` so `getAbilitiesAtLevel("Cleric_CLASS", 5)` correctly strips the suffix before looking up `CLASS_ABILITIES["Cleric"]`.

#### Phase 2B — Starting Wealth — ✅ COMPLETE (2026-03-20)

`startingGold` is now populated and rendered in the Equipment section of the character sheet.

**Starting gold rules by level and mode:**

| Level | OSE Standard / Smoothified | Labyrinth Lord |
|-------|---------------------------|----------------|
| 0 | (no change — background gear as currently) | (no change) |
| 1 | 3d6 × 10 gp | 3d8 × 10 gp |
| 2+ | % of minimum XP for level (see below) | % of minimum XP for level |

No per-class variation in any mode.

**Level 2+ wealth — XP percentage approach:**  
For upper-level characters (level 2–14), starting wealth is derived from the minimum XP required to reach that level. A UI radio button lets the user choose how wealthy the character is:

| Radio option | Wealth = |
|---|---|
| 0% | 0 gp (start with no gold — just the rolled/equipment setup) |
| 25% | 25% of min XP for level, in gp |
| 50% | 50% of min XP for level, in gp |
| 75% | 75% of min XP for level, in gp |
| 100% | 100% of min XP for level, in gp |

Example: Level 5 Fighter (OSE min XP = 16,000). At 50% → 8,000 gp to spend on equipment.

**UI:** Add a "Starting Wealth" radio group to step 3/Options in `basic.html` and `advanced.html`, visible only for level 2+. For level 1, always roll dice. For level 0, no wealth UI.

- [x] **2B-1** Added `rollStartingGold(progression)` and `calcStartingGold(xpForLevel, pct)` helpers to `shared-character.js`. Level 1 rolls 3d6×10 gp (OSE/Smooth) or 3d8×10 gp (LL). Level 2+ uses XP% formula.
- [x] **2B-2** Added "Starting Wealth (level 2+)" radio group (0%/25%/50%/75%/100%, default 50%) with live gp preview to `basic.html` and `advanced.html` — shown only when level ≥ 2.
- [x] **2B-3** `createCharacter()` in `shared-character.js` now accepts and stores `startingGold`. `basic-ui.js` and `advanced-ui.js` compute and pass it.
- [x] **2B-4** `displayCharacter()` in both UIs passes `character.startingGold` to `sheet.equipment.startingGold`. The sheet renderer already renders it as `Starting Gold: N gp`.

#### Phase 2C — Automatic Equipment Purchase

**Scope:** `basic.html` and `advanced.html` only (level 1+). The `0level.html` generator already works correctly — background items are kept as-is and no purchasing occurs there.

**Key rule from user:** Keep all 0th-level background items in the items list, then spend starting gold in this order: **Weapon → Armor → Shield → Dungeoneering gear**.

**Data already available:**
- `weapons-and-armor.js` — `WEAPONS` (name → {cost, qualities…}), `ARMOR` (name → {ac.ascending, cost}), `AMMUNITION`
- `class-data-shared.js` → `CLASS_INFO[className]` has `.armor[]` (allowed armor names incl. "Shield") and `.weapons[]` (allowed weapon names)
- Level 1: `startingGold = rollStartingGold()` (~105 gp avg). Level 2+: `startingGold = calcStartingGold(xpForLevel, wealthPct)`.
- LL equipment prices to be provided by user later — for now use OSE prices for all three modes.

**How it integrates with background:**
- Background `weapon`, `armor`, `item` values come from `getRandomBackground(hp)` and represent humble 0-level possessions
- At level 1+: all background items move into the `items[]` list (as "0-level gear")
- The purchased weapon, armor, shield become the character's primary adventuring equipment
- The sheet's `equipment.weapon`, `equipment.armor`, `equipment.items[]` are all set from `purchaseEquipment()` output

**New file: `shared-equipment.js`** (ES6 module)

Contents:
1. `ADVENTURING_GEAR` — standard dungeoneering bundle with costs (OSE SRD prices):
   - Backpack: 5 gp
   - Flint and steel: 1 gp
   - Torches (6): 1 gp
   - Iron rations (1 week): 15 gp
   - Rope, hemp (50'): 1 gp
   - Waterskin: 1 gp
2. `WEAPON_PRIORITY` — per-class ordered list of preferred weapons to try buying (best/most appropriate first):
   - Fighter / Dwarf / Elf / Gnome / Halfling / Spellblade: `["Sword", "Short sword", "Mace", "Hand axe", "Dagger"]`
   - Cleric: `["Mace", "War hammer", "Club", "Staff", "Sling"]`
   - Magic-User: `["Dagger", "Staff"]`
   - Thief: `["Short sword", "Dagger", "Club"]`
3. `ARMOR_PRIORITY` — best-to-worst order: `["Plate mail", "Chain mail", "Leather"]`
4. `purchaseEquipment(className, startingGold, dexModifier, backgroundItems, progression)`:

```
function purchaseEquipment(className, startingGold, dexModifier, background, progression):
  gold = startingGold
  purchased = { weapon: null, armor: null, shield: false, items: [] }

  // Keep all background items
  if background.weapon  → purchased.items.push(background.weapon)
  if background.armor   → purchased.items.push(background.armor)
  for item of background.item (array or single) → purchased.items.push(item)

  // 1. Weapon
  allowedWeapons = CLASS_INFO[className].weapons
  priority = WEAPON_PRIORITY[className] (or default order)
  If background.weapon is in allowedWeapons:
    purchased.weapon = background.weapon  // already have it, no spend
  Else:
    for weaponName in priority:
      if weaponName in allowedWeapons and WEAPONS[weaponName].cost <= gold:
        purchased.weapon = weaponName; gold -= cost; break

  // 2. Armor (best affordable from allowed list, excluding Shield)
  allowedArmor = CLASS_INFO[className].armor.filter(a => a !== "Shield")
  for armorName in ARMOR_PRIORITY:
    if armorName in allowedArmor and ARMOR[armorName].cost <= gold:
      purchased.armor = armorName; gold -= cost; break

  // 3. Shield (if "Shield" is in allowed armor list)
  if "Shield" in CLASS_INFO[className].armor and ARMOR["Shield"].cost <= gold:
    purchased.shield = true; gold -= ARMOR["Shield"].cost

  // 4. Dungeoneering gear (buy each item in ADVENTURING_GEAR if affordable)
  for { name, cost } of ADVENTURING_GEAR:
    if cost <= gold:
      purchased.items.push(name); gold -= cost

  // Compute AC
  armorAC = purchased.armor ? ARMOR[purchased.armor].ac.ascending : 10  // base 10 unarmoured
  shieldBonus = purchased.shield ? 1 : 0
  purchased.startingAC = armorAC + dexModifier + shieldBonus
  purchased.goldRemaining = gold

  return purchased
```

**Checklist:**

- [ ] **2C-1** Create `shared-equipment.js` with `ADVENTURING_GEAR`, `WEAPON_PRIORITY`, and `purchaseEquipment()` as ES6 module exports
- [ ] **2C-2** In `basic-ui.js` `generateCharacter()`: call `purchaseEquipment()` after computing `startingGold`; pass result to `createCharacter()` or directly into the sheet object
- [ ] **2C-3** In `advanced-ui.js` `generateCharacter()`: same as 2C-2
- [ ] **2C-4** Update `displayCharacter()` in both UIs: use `purchasedEquipment.weapon`, `.armor`, `.items[]`, `.startingAC` instead of `character.background.weapon` etc.
- [ ] **2C-5** Verify the `shared-character-sheet.js` Equipment section renders purchased weapon (already renders `equipment.weapon`, `equipment.armor`, `equipment.items[]`, `equipment.startingAC`) — should be no change needed
- [ ] **2C-6** *(deferred)* Add LL-specific equipment prices/gear when user provides them — likely a `ADVENTURING_GEAR_LL` export in `shared-equipment.js` and a `progression` param branch in `purchaseEquipment()`

#### Phase 2D — Racial Abilities in Advanced Mode (estimated: 1 hour)

Already works in Basic Mode. In Advanced Mode the race is selected separately from the class.

- [ ] **2D-1** Check `advanced-ui.js` → `displayCharacter()` — does it pass `character.racialAbilities` through to `sheet.abilitiesSection.racial[]`?
- [ ] **2D-2** Check `shared-character.js` → `createCharacter()` — does it populate `racialAbilities` for Advanced Mode characters (race ≠ class)?
- [ ] **2D-3** If missing: `shared-racial-abilities.js` likely has the Advanced Mode racial ability data. Wire it into `createCharacter()` when in advanced mode using the `race` field of the options object.

### Suggested execution order
1. ~~**2A** (class abilities, thief skills, ability descriptions)~~ ✅ Complete
2. ~~**2B** (starting gold)~~ ✅ Complete
3. **2D** (racial abilities in Advanced mode — small) ← NEXT
4. **2C** (equipment purchase — largest chunk, save for last)

---

## 3. HTML Sheet Improvements — PENDING

Print-friendly and formatting improvements to the shared HTML character sheet (`shared-character-sheet.js`).

- [ ] Add `@media print` CSS — hide buttons, set `@page` letter size, control page breaks
- [ ] Better "Starting Equipment" section — render as a proper `<ul>` list, not a comma-joined string
- [ ] Handle long occupation names gracefully (no truncation/overflow)
- [ ] Add optional "Notes" section at the bottom of the sheet
- [ ] Verify ability score display clarity — confirm "12 (11)" format (adjusted vs original) is clear

**Reference:** Originally Phase 3 of PLAN_0LEVEL_BASIC_ADVANCED.md

---

## 4. Class/Level Testing — PENDING

Verify that saves, attack bonuses, and spell slots are correct for all classes at all key levels in each progression mode. Compare against source documents.

### OSE Standard
- [ ] Cleric (levels 1, 5, 10, 14)
- [ ] Fighter (levels 1, 5, 10, 14)
- [ ] Magic-User (levels 1, 5, 10, 14)
- [ ] Thief (levels 1, 5, 10, 14)
- [ ] Dwarf (levels 1, 5, 10, 12)
- [ ] Elf (levels 1, 5, 10)
- [ ] Halfling (levels 1, 5, 8)
- [ ] Gnome (levels 1, 5, 8)

### Smoothified (Gygar)
- [ ] Cleric (levels 1, 5, 10, 14)
- [ ] Fighter (levels 1, 5, 10, 14)
- [ ] Magic-User (levels 1, 5, 10, 14)
- [ ] Thief (levels 1, 5, 10, 14)
- [ ] Dwarf (levels 1, 5, 10, 14)
- [ ] Elf (levels 1, 5, 10, 14)
- [ ] Halfling (levels 1, 5, 10, 14)
- [ ] Gnome (levels 1, 5, 10, 14)
- [ ] Spellblade (levels 1, 5, 10)

### Verification Checklist
- [ ] Saving throws match source documents
- [ ] Attack bonuses match source documents
- [ ] Spell slots match source documents
- [ ] Compare OSE vs Gygar progressions at same level
- [ ] Test mode switching (OSE Standard / Smoothified / Labyrinth Lord)

**Reference:** Originally Phase 9 of PLAN_CLASSES_IMPORT_TODO.md

---

## 5. Level 0 Occupations: Missing Weapon Assignments

The following OSE Advanced Fantasy Player's Tome Secondary Skills still need weapon assignments in the background tables:

- [ ] Animal trainer
- [ ] Bookbinder
- [ ] Brewer
- [ ] Chandler
- [ ] Coppersmith
- [ ] Furrier
- [ ] Glassblower
- [ ] Lapidary / jeweller (have "Jeweller" — verify weapon)
- [ ] Lorimer (horse bits, spurs, stirrups maker)
- [ ] Mapmaker
- [ ] Potter
- [ ] Roper (rope maker)
- [ ] Seafarer (have "Sailor" — need separate entry?)
- [ ] Tanner
- [ ] Thatcher / roofer
- [ ] Vintner (wine maker)
- [ ] Woodcutter

---

## 6. Optional Enhancements

### Combat Stats Display (basic.html / advanced.html)

The 0-level generator shows Class Attack Bonus, Melee Modifier, and Ranged Modifier separately. Basic and Advanced generators only show the single combined attack bonus value.

- [ ] `basic-ui.js` — display STR and DEX modifiers on attack/AC separately
- [ ] `advanced-ui.js` — display STR and DEX modifiers on attack/AC separately
- [ ] Consider `shared-combat-stats.js` for consistent attack/AC calculations across all generators

### Advanced Mode Race/Class Grid

- [ ] Show class requirements (ability minimums) on hover/click in the `advanced.html` race/class grid

### 0-Level Page Visual Styling
- [ ] Audit `0level.html` CSS against `basic.html` / `advanced.html` and align: control section layout, input sizing, button styles, font sizes, spacing, generator container border/background
- [ ] Ensure the numbered control sections (1. Options, 2. Name, etc.) use the same `.control-section` pattern and heading style as the other pages
- [ ] Remove Markdown and JSON export buttons/options (see 0-Level Export Cleanup above)

### UI Polish
- [ ] Tooltips for all options
- [ ] Mobile responsiveness improvements
- [ ] Custom background/profession entry field

### 0-Level Export Cleanup
- [ ] Remove Markdown and JSON export buttons/options from `0level.html` and `0level-ui.js` (PDF via browser Print is sufficient; Markdown/JSON are unused in practice)

### Export Improvements
- [ ] CSV export for multiple 0-level characters
- [ ] Save/Load character to localStorage
- [ ] JSON import

### Testing Automation
- [ ] Automated tests for all races
- [ ] Automated tests for all classes at all levels
- [ ] Test Markdown export (0level generator)
- [ ] Test JSON export (0level generator)

### Documentation
- [ ] Screenshots of each generator for README

### VTT Integration (far future)
- [ ] Export to Roll20 / Foundry VTT formats
- [ ] Discord bot integration

---

## 7. Future: Dynamic Class Document Generation

**Status:** Low priority — static markdown files in `CLASS_MARKDOWN/` work well currently.

**Goal:** Generate class documentation dynamically from `class-data-ose.js`, `class-data-gygar.js`, and `class-data-shared.js` instead of maintaining separate markdown files.

**Key phases when ready:**
- [ ] Create `class-markdown-generator.js` with table/section generators
- [ ] Implement `generateXPTable`, `generateSavingThrowsTable`, `generateSpellSlotsTable`
- [ ] Support Basic Mode (race-as-class) and Advanced Mode (race + class) templates
- [ ] Batch generation for all classes × modes

Valid Advanced Mode combinations (for reference):

| Class | Human | Dwarf | Elf | Halfling | Gnome |
|-------|-------|-------|-----|----------|-------|
| **Cleric** | ✓ | ✓ | ✗ | ✗ | ✓ |
| **Fighter** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Magic-User** | ✓ | ✗ | ✓ | ✗ | ✗ |
| **Thief** | ✓ | ✗ | ✗ | ✓ | ✓ |
| **Spellblade** | ✓ | ✗ | ✓ | ✗ | ✗ |

---

## Reference: PDF Workflow (Implemented — Option 4)

The PDF workflow is fully implemented via "Open in New Tab" → browser Print / Save as PDF:
- ✅ `@media print` CSS in new-tab template (hides controls bar, sets `@page` letter size)
- ✅ "🖨 Print / Save as PDF" button + "✕ Close" button in controls bar
- ✅ Tip text: "In the print dialog, choose Save as PDF and set margins to None or Minimum"

If higher-fidelity silent-download PDF is ever needed, the next option to try is `jsPDF.html()` (already available — just call `doc.html(container, { callback })`). No new library needed.

---

## Reference: File Organization

See `README.md` for the complete module/file structure table.

**Quick summary:**
- `shared-*.js` — shared ES6 modules (ability scores, character creation, class data, sheet renderer)
- `class-data-{ose,gygar,ll}.js` — mode-specific class progression data
- `{0level,basic,advanced}-{ui,character-gen,utils}.js` — generator-specific files
- `PLANS_COMPLETED/` — completed planning documents (for historical reference)
- `CLASS_MARKDOWN/` — static class documentation (GYGAR_*.md)
