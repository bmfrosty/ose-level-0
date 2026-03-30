# TODO — Active Planning Document

> **Status:** All three generators complete and working. README updated (2026-03-19). Phase 2A (class abilities, thief skills, ability descriptions) complete (2026-03-20). Phase 2B (starting wealth) complete (2026-03-20). Phase 2C (automatic equipment purchase for basic.html and advanced.html) complete (2026-03-20). Phase 2D (racial abilities in Advanced mode) complete (2026-03-21). Phase 2E (print button + cp v2 normalization) complete (2026-03-29). Phase 2F (Background in header + HP floor) complete (2026-03-29). Remaining: HTML sheet improvements, comprehensive testing, misc enhancements.

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

**Scope:** `basic.html` and `advanced.html` only (level 1+). `0level.html` already works correctly — background items kept as-is, no purchasing.

**Key rule from user:** Keep all 0th-level background items in the items list, then spend starting gold in this order: **Weapon → Armor → Shield → Class-specific gear → Dungeoneering bundle**.

**Data already available:**
- `weapons-and-armor.js` — `WEAPONS` (name → {cost, qualities…}), `ARMOR` (name → {ac.ascending, cost})
- `class-data-shared.js` → `CLASS_INFO[className]` has `.armor[]` (incl. `"Shield"`) and `.weapons[]`
- LL equipment prices to be provided by user later — for now use OSE prices for all three modes

**How it integrates with background:**
- Background `weapon`, `armor`, `item` values represent humble 0-level possessions
- At level 1+: all background fields move into the `items[]` list ("0-level gear")
- Purchased weapon, armor, shield become the character's primary adventuring equipment
- `sheet.equipment.{weapon, armor, items[], startingAC}` are all set from `purchaseEquipment()` output

---

##### Complete OSE SRD Adventuring Gear (from https://oldschoolessentials.necroticgnome.com/srd/index.php/Adventuring_Gear)

| Item | Cost (gp) |
|------|-----------|
| Backpack | 5 |
| Crowbar | 10 |
| Garlic | 5 |
| Grappling hook | 25 |
| Hammer (small) | 2 |
| Holy symbol | 25 |
| Holy water (vial) | 25 |
| Iron spikes (12) | 1 |
| Lantern | 10 |
| Mirror (hand-sized, steel) | 5 |
| Oil (1 flask) | 2 |
| Pole (10' long, wooden) | 1 |
| Rations (iron, 7 days) | 15 |
| Rations (standard, 7 days) | 5 |
| Rope (50') | 1 |
| Sack (large) | 2 |
| Sack (small) | 1 |
| Stakes (3) and mallet | 3 |
| Thieves' tools | 25 |
| Tinder box (flint & steel) | 3 |
| Torches (6) | 1 |
| Waterskin | 1 |
| Wine (2 pints) | 1 |
| Wolfsbane (1 bunch) | 10 |

*Note: LL-specific gear prices to be added when provided by user.*

---

##### New file: `shared-equipment.js` (ES6 module)

**`ADVENTURING_GEAR`** — full OSE gear list (array of `{name, cost}` objects), in the order above. Used for reference and for the purchase loop.

**`DUNGEONEERING_BUNDLE`** — ordered list of items to attempt to buy (priority order, buy if affordable):
```
Backpack              5 gp
Tinder box (flint & steel)  3 gp
Torches (6)           1 gp
Rope (50')            1 gp
Waterskin             1 gp
Crowbar               10 gp
```
Total if all purchased: 21 gp

**`CLASS_SPECIFIC_GEAR`** — per-class items to buy between Shield and dungeoneering bundle:
- `Cleric`: `[{ name: "Holy symbol", cost: 25 }]`
- `Thief`: `[{ name: "Thieves' tools", cost: 25 }]`
- All other classes: `[]`

**`WEAPON_PRIORITY`** — per-class ordered preferred weapons (best/most thematic first):
- Fighter / Dwarf / Elf / Gnome / Halfling / Spellblade: `["Sword", "Short sword", "Mace", "Hand axe", "Dagger"]`
- Cleric: `["Mace", "War hammer", "Club", "Staff", "Sling"]`
- Magic-User: `["Dagger", "Staff"]`
- Thief: `["Sword", "Short sword", "Dagger", "Club"]`

**`ARMOR_PRIORITY`** — `["Plate mail", "Chain mail", "Leather"]`

**`purchaseEquipment(className, startingGold, dexModifier, background, progression)`**:

```
gold = startingGold
result = { weapon: null, armor: null, shield: false, items: [], startingAC: 10, goldRemaining: 0 }

// 0. Collect all 0-level background possessions into items[]
if background.weapon  → result.items.push(background.weapon + " (background)")
if background.armor   → result.items.push(background.armor + " (background)")
for item of (Array.isArray(background.item) ? background.item : [background.item])
  if item  → result.items.push(item)

// Strip _CLASS suffix to look up CLASS_INFO
baseClass = className.replace(/_CLASS$/, '')
classInfo = CLASS_INFO[baseClass]

// 1. WEAPON — keep background weapon if class-legal (no spend), else buy best affordable
allowedWeapons = new Set(classInfo.weapons)
If allowedWeapons.has(background.weapon):
  result.weapon = background.weapon   // already owned, free
Else:
  priority = WEAPON_PRIORITY[baseClass] ?? WEAPON_PRIORITY.default
  for weaponName of priority:
    if allowedWeapons.has(weaponName) and WEAPONS[weaponName].cost <= gold:
      result.weapon = weaponName
      gold -= WEAPONS[weaponName].cost
      result.items.push(weaponName)
      break

// 2. ARMOR — buy best affordable (Plate → Chain → Leather; skip Shield here)
allowedArmors = classInfo.armor.filter(a => a !== "Shield")
for armorName of ARMOR_PRIORITY:
  if allowedArmors.includes(armorName) and ARMOR[armorName].cost <= gold:
    result.armor = armorName
    gold -= ARMOR[armorName].cost
    break

// 3. SHIELD — if allowed and affordable
if classInfo.armor.includes("Shield") and ARMOR["Shield"].cost <= gold:
  result.shield = true
  gold -= ARMOR["Shield"].cost

// 4. CLASS-SPECIFIC GEAR (Cleric: Holy symbol; Thief: Thieves' tools)
for { name, cost } of (CLASS_SPECIFIC_GEAR[baseClass] ?? []):
  if cost <= gold:
    result.items.push(name)
    gold -= cost

// 5. DUNGEONEERING BUNDLE (buy each if affordable)
for { name, cost } of DUNGEONEERING_BUNDLE:
  if cost <= gold:
    result.items.push(name)
    gold -= cost

// 6. Compute AC
armorAC = result.armor ? ARMOR[result.armor].ac.ascending : 10
shieldBonus = result.shield ? 1 : 0
result.startingAC = armorAC + dexModifier + shieldBonus
result.goldRemaining = gold

return result
```

---

##### Detailed Checklist

- [x] **2C-1** Add `ADVENTURING_GEAR` full table to `weapons-and-armor.js` (correct OSE names from SRD above) and export it alongside `WEAPONS`/`ARMOR`
- [x] **2C-2** Create `shared-equipment.js` (ES6 module) with:
  - `DUNGEONEERING_BUNDLE` array (ordered: Backpack, Tinder box, Torches, Rope, Waterskin, Crowbar)
  - `CLASS_SPECIFIC_GEAR` map (Cleric → Holy symbol 25 gp; Thief → Thieves' tools 25 gp)
  - `WEAPON_PRIORITY` map per class (see above)
  - `ARMOR_PRIORITY = ["Plate mail", "Chain mail", "Leather"]`
  - `export function purchaseEquipment(className, startingGold, dexModifier, background, progression)` (full pseudocode above)
- [x] **2C-3** In `basic-ui.js` `generateCharacter()`:
  - Import `purchaseEquipment` from `./shared-equipment.js`
  - After computing `startingGold`, call `const purchased = purchaseEquipment(selectedClass, startingGold, dexModifier, background, progressionMode)`
  - Pass `purchased` into `displayCharacter()` alongside `character`
- [x] **2C-4** In `basic-ui.js` `displayCharacter()`:
  - Replace `character.background?.weapon` with `purchased.weapon`
  - Replace `character.background?.armor` with `purchased.armor` (or `null` if no armor)
  - Replace `items` array with `purchased.items`
  - Replace `startingAC: character.armorClass` with `startingAC: purchased.startingAC`
  - Replace `startingGold: character.startingGold` with `startingGold: purchased.goldRemaining` (gold left after buying)
- [x] **2C-5** In `advanced-ui.js`: same changes as 2C-3 and 2C-4
- [x] **2C-6** Verified `shared-character-sheet.js` renders correctly — no code changes needed. Sheet renderer already handles `weaponsAndSkills.weapon`, `equipment.armor`, `equipment.items[]`, `equipment.startingAC`, and `equipment.startingGold`.
- [ ] **2C-7** *(deferred)* Add `ADVENTURING_GEAR_LL` and `DUNGEONEERING_BUNDLE_LL` to `shared-equipment.js` when user provides LL prices; add `progression` branch to `purchaseEquipment()`

#### Phase 2D — Racial Abilities in Advanced Mode — ✅ COMPLETE (2026-03-21)

Already works in Basic Mode. In Advanced Mode the race is selected separately from the class.

- [x] **2D-1** Confirmed `advanced-ui.js` → `displayCharacter()` passes `character.racialAbilities` to `sheet.abilitiesSection.racial[]`.
- [x] **2D-2** Confirmed `createCharacterAdvanced()` in `advanced-character-gen.js` calls `getRacialAbilities(race, raceClassMode)` using the race argument (e.g. `"Dwarf_RACE"`) — not the class.
- [x] **2D-3** Fixed `getAdvancedModeRacialAbilities()` in `shared-racial-abilities.js` to accept optional `{isAdvanced, humanRacialAbilities}` params (bypasses DOM). Fixed `getRacialAbilities()` wrapper in `advanced-character-gen.js` to pass values directly — no more DOM manipulation. Added new `'strict-human'` raceClassMode value (traditional combos + OSE level caps + humans get racial abilities), made it the default (2nd in the list). Verified: Human Fighter shows Blessed/Decisiveness/Leadership, Dwarf Fighter shows Infravision/etc., Elf Magic-User shows Detect Secret Doors/etc.

#### Phase 2F — Background in Header + L1 HP Floor — ✅ COMPLETE (2026-03-29)

- [x] **2F-1** Added **Background** column to the character sheet header row for Basic and Advanced modes, positioned between "Character Name" and "Class" / "Race & Class". Updated all four relevant files:
  - `basic-ui.js` `displayCharacter()` — added `{ label:'Background', value:character.background?.profession||'—', flex:2 }` to `header.columns`
  - `advanced-ui.js` `displayCharacter()` — same addition
  - `charactersheet.html` `expandCompactV2()` — added Background column in both `m:'B'` and `m:'A'` sheet objects
  - 0-level (`m:'Z'`) header is **unchanged** — it already uses "Occupation" in the same position
- [x] **2F-2** Fixed `page2MiniHeader` in `shared-character-sheet.js` to find the class column by label (`c.label === 'Class' || c.label === 'Race & Class'`) rather than hardcoded `columns[1]` — necessary because inserting Background at index 1 shifted Class to index 2.
- [x] **2F-3** Added **L1 HP floor** rule to `shared-hit-points.js`: when `includeLevel0HP=false`, Level 1 HP is rerolled until `levelHP >= backgroundHP` so a character cannot have fewer HP at Level 1 than they had as a Level 0 character. Existing Healthy Characters minimum-2 reroll preserved as a second OR condition. Verified with 1000 Monte Carlo runs (0 violations, worst case: Magic-User + CON −2).
- [x] **2F-4** Applied the same L1 HP floor to the **Level Up panel** in `charactersheet.html`: captures `l0HP = newHpRolls[0]`, uses `do...while (lvlHP < l0HP)` at `lvl===1` when `decoded.il` is false.

#### Phase 2E — Print Button + cp v2 Normalization — ✅ COMPLETE (2026-03-29)

- [x] **2E-1** "🖨 Print / Save as PDF / EDIT" button in the print bar (top of generated sheet) opens `charactersheet.html?d=...` in a new tab — already existed and working. QR code on page 2 links to the same URL. `autoPrint` flag auto-opens the browser print dialog when set.
- [x] **2E-2** `shared-hit-points.js` refactored: L0 background HP roll is **always at `rolls[0]`/`dice[0]`** regardless of the `includeLevel0HP` flag. `rollsIndex` for levels 1–N is now simply `lvl` (was `includeLevel0HP ? lvl : lvl-1`). L0 HP only contributes to `totalHP` when `includeLevel0HP=true`.
- [x] **2E-3** `advanced-ui.js` and `basic-ui.js`: removed the prepend/slice logic that used to shift `hr[]` when toggling `includeLevel0HP`. The stable `hr[]` layout (`[L0, L1, L2, …]`) makes this unnecessary and was causing subtle bugs on edit round-trips.
- [x] **2E-4** `advanced-ui.js` and `basic-ui.js` cp objects: added missing generation-option fields `hc` (healthyCharacters), `wp` (wealthPct), `prm` (primeRequisiteMode=0|9|13) — basic was missing all three.
- [x] **2E-5** `charactersheet.html` Edit panel: fixed `isL0 = i === 0` (unconditional), `syncHpToLevel` offset is always `1`, and HP sum for Apply Changes correctly skips `hr[0]` when `il=0`.
- [x] **2E-6** `shared-compact-codes.js`: added a full ASCII-table field reference documenting every field in the cp v2 object (type, allowed values, plain-English description). This is the canonical in-code reference.

### Suggested execution order
1. ~~**2A** (class abilities, thief skills, ability descriptions)~~ ✅ Complete
2. ~~**2B** (starting gold)~~ ✅ Complete
3. ~~**2D** (racial abilities in Advanced mode)~~ ✅ Complete
4. ~~**2E** (print button + cp v2 normalization)~~ ✅ Complete
5. **2C** (equipment purchase — largely done, minor deferred items remain)

---

## 3. HTML Sheet Improvements — PENDING

All improvements are in `shared-character-sheet.js` → `renderCharacterSheetHTML()` function, **except** Phase 3B which also touches `0level.html`, `basic.html`, and `advanced.html`.

### Key code facts about the current sheet (read this first)

- **Two-column layout:** A single `display: grid; grid-template-columns: 1fr 1fr; gap: 8px` div, built as one big HTML string by `renderCharacterSheetHTML(sheet)`. No React/Vue — just template literals.
- **Left column top → bottom:** ABILITY SCORES → WEAPONS AND SKILLS → RACIAL & CLASS ABILITIES (or CLASS ABILITIES)
- **Right column top → bottom:** SAVING THROWS → EXPERIENCE → EQUIPMENT AND ITEMS → SPELL SLOTS (if any) → TURN UNDEAD (if any) → TREASURE
- **TREASURE** is rendered at the very bottom of the right column, after SPELL SLOTS and TURN UNDEAD. It consists of a blank "notes" box (5 lines) followed by a coin table (PP/GP/EP/SP/CP rows).
- **Items list** is already a proper `<ul><li>` — each item is its own `<li>`. No comma-joining.
- **Armor line** is a plain `<div>` above the items `<ul>`.
- **Starting AC / Starting Gold** are rendered at the bottom of the equipment box, below a 3-line spacer div.
- **`@media print` CSS** exists in the **new-tab template** (the `openInNewTab: true` code path, ~line 230 in the file) but does **NOT** exist for inline display (when `openInNewTab: false` — sheet appears directly on the generator page).
- **Ability score strikethrough:** Racial adjustment is shown as `<span style='text-decoration:line-through; color:#999;'>11</span> 12` — original crossed out, adjusted value next to it. Works visually but has no legend explaining what it means.
- **Sheet object** passed into `renderCharacterSheetHTML()` is documented at the top of the file. The key fields for this phase are: `equipment: { armor, items[], startingAC, startingGold }`, `abilitiesSection: { header, racial[], class[] }`, `abilityScores: [{ name, score, originalScore, effects }]`.

---

### 3A. Equipment & Treasure Layout — PENDING

The character sheet uses a two-column layout (left column: abilities/skills/items, right column: saves/XP/equipment/treasure). When a character has many items, the EQUIPMENT AND ITEMS box grows tall and pushes the TREASURE section far down the right column, making the sheet hard to read and wasting print space.

**Current layout (right column top-to-bottom):**
```
SAVING THROWS
EXPERIENCE
EQUIPMENT AND ITEMS   ← can get very tall with many items
TREASURE              ← ends up far below, stranded
```

**Goal:** If the EQUIPMENT AND ITEMS box exceeds a threshold height (or item count), move TREASURE to the **left column** below the abilities/skills section, so the right column stays compact and the sheet fits cleanly on one page.

**Design options (to evaluate):**

| Option | Description |
|--------|-------------|
| **A — Item count threshold** | If `items.length > N` (e.g. 6), render TREASURE in left column below abilities. Otherwise render it in the right column as today. |
| **B — Always left** | Always render TREASURE at the bottom of the left column (below abilities). Simpler but may waste space for characters with few items. |
| **C — Two-column equipment** | Render items in two sub-columns within the EQUIPMENT AND ITEMS box (left: weapons/armor, right: misc items). Treasure stays in right column. |

**Implementation notes:**
- `shared-character-sheet.js` builds the sheet HTML — this is where the layout change goes
- The sheet uses CSS grid/flex for the two-column layout; TREASURE would need a CSS class like `treasure-left` vs `treasure-right`
- Threshold for Option A: items.length > 6 (tune after testing)
- Items include: background items (with "(background)" tag), purchased weapon, armor, dungeoneering gear, class-specific gear
- The TREASURE section HTML is built near the end of `renderCharacterSheetHTML()` — look for the `coinRows` variable and the "TREASURE" section header

**Checklist:**
- [ ] **3A-1** Audit `shared-character-sheet.js` — find where TREASURE section is rendered relative to EQUIPMENT AND ITEMS
- [ ] **3A-2** Choose layout option (A, B, or C above) and implement
- [ ] **3A-3** Test with: no items (Magic-User with no equipment), few items (Fighter level 1), many items (level 5+ character with full dungeoneering bundle + background items)
- [ ] **3A-4** Verify print layout — the TREASURE coin rows (PP/GP/EP/SP/CP) should still be writable

---

### 3B. @media print CSS for Inline Display — PENDING

**Problem:** When "Open character in new tab" is **unchecked**, the character sheet appears inline on the generator page (`basic.html` / `advanced.html` / `0level.html`). If the user prints this page directly (Ctrl+P), the entire generator UI — nav bar, level selector, ability score inputs, radio buttons, Generate button — all appear in the printout. The only clean print path currently is via "Open in New Tab."

**What already works:** The new-tab template (in `displayCharacterSheet()` → `openInNewTab: true` branch, ~line 230) already has full `@media print` CSS: hides `.print-controls`, sets `@page { size: letter; margin: 0.5in; }`, and forces color printing. This is the model to follow.

**Fix:** Add `@media print` to the `<style>` block of each HTML file:

```css
@media print {
    nav,
    h1,
    .generator-container,
    .info-note,
    .character-display > h2  { display: none !important; }

    .character-display {
        border: none !important;
        margin: 0 !important;
        padding: 0 !important;
    }

    @page { size: letter; margin: 0.5in; }

    * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
}
```

**Files to update:** `basic.html`, `advanced.html`, `0level.html` — add to each page's `<style>` block (inside `<head>`).

**Note:** Do NOT touch `0level-ui.js` or `0level.html` JavaScript — only the `<style>` block CSS.

**Checklist:**
- [ ] **3B-1** Add `@media print` CSS to `basic.html` `<style>` block
- [ ] **3B-2** Add `@media print` CSS to `advanced.html` `<style>` block
- [ ] **3B-3** Add `@media print` CSS to `0level.html` `<style>` block
- [ ] **3B-4** Test: generate a character in inline mode (new tab unchecked), Ctrl+P — verify only the character sheet appears, controls are hidden, colors print correctly

---

### 3C. Notes Section at Bottom of Sheet — PENDING

**Problem:** There's no free-text notes area for the player to write in things like: spell names, retainer names, dungeon notes, etc.

**Fix:** In `renderCharacterSheetHTML()`, add a NOTES section after the two-column layout div (after the `</div>` that closes the grid) and before the footer `<hr>`:

```javascript
// After the closing </div> of the two-column grid, before the footer hr:
<!-- NOTES -->
<div style='${sectionHeader}; margin-top: 8px;'>NOTES</div>
<div style='border: 1px solid #000; padding: 8px; min-height: 80px; line-height: 2.2em;'>
    &nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;
</div>
```

This gives a full-width lined area at the bottom of the sheet. The `sectionHeader` CSS variable (already defined at the top of the file) provides the black-on-white header styling consistent with the rest of the sheet.

**Checklist:**
- [ ] **3C-1** Add NOTES section HTML in `renderCharacterSheetHTML()` after the two-column grid div, before the `<hr style='margin-top: 12px;'>` footer line
- [ ] **3C-2** Verify it renders full-width (not inside either column)
- [ ] **3C-3** Verify print output — notes lines should print cleanly and be writable

---

### 3D. Ability Score Racial Adjustment Legend — PENDING

**Problem:** When a character has racial ability adjustments (e.g., Elf gets +1 DEX / -1 CON), the base score is shown with a strikethrough: ~~10~~ 9 next to the adjusted value. This is visually functional but there's no legend explaining what it means.

**Current code** (in `renderCharacterSheetHTML()`):
```javascript
const scoreDisplay = (a.originalScore !== null && a.originalScore !== undefined && a.originalScore !== a.score)
    ? `<span style='text-decoration:line-through; color:#999; font-size:0.85em; margin-right:4px;'>${a.originalScore}</span>${a.score}`
    : `${a.score}`;
```

**Fix:** Below the ability score table (after the `</table>` closing tag), add a conditional legend that only appears when at least one score was adjusted:

```javascript
const hasAdjustedScores = sheet.abilityScores.some(
    a => a.originalScore !== null && a.originalScore !== undefined && a.originalScore !== a.score
);
const adjustmentLegendHTML = hasAdjustedScores
    ? `<div style='font-size: 0.75em; color: #888; font-style: italic; margin-bottom: 4px;'>
           <span style='text-decoration: line-through; color: #bbb;'>00</span> = base score before racial adjustment
       </div>`
    : '';
```

Then insert `${adjustmentLegendHTML}` in the template string right after the ability scores `</table>`.

**Checklist:**
- [ ] **3D-1** Add `hasAdjustedScores` check and `adjustmentLegendHTML` variable in `renderCharacterSheetHTML()`
- [ ] **3D-2** Insert legend below the ability score table
- [ ] **3D-3** Verify: Human character (no adjustments) → no legend shown. Elf character (DEX+1, CON-1) → legend shown.

---

### 3E. Equipment Section Polish — PENDING

**Problem:** The current equipment box renders in this order:
1. `Armor: Chain mail` (plain div)
2. `Items:` header + `<ul><li>` list
3. Three blank spacer lines (`&nbsp;<br>&nbsp;<br>&nbsp;`)
4. `Starting AC: 14  Starting Gold: 45 gp`

The spacer lines are odd and the layout could be cleaner.

**Current code** (the `equipmentInnerHTML` template):
```javascript
const equipmentInnerHTML = eq.armor !== null
    ? `
        <div><strong>Armor:</strong> ${eq.armor}</div>
        <div style='margin-top: 4px;'><strong>Items:</strong>
            <ul style='margin: 2px 0; padding-left: 18px;'>${itemsHTML}</ul>
        </div>
        <div style='border-top: 1px solid #ccc; margin-top: 6px; padding-top: 4px; line-height: 1.8em;'>
            &nbsp;<br>&nbsp;<br>&nbsp;
        </div>
        <div style='margin-top: 4px; border-top: 1px solid #ccc; padding-top: 4px;'>
            <strong>Starting AC:</strong> ${eq.startingAC}${startingGoldHTML}
        </div>`
    : `<span style='color:#666;'>No starting equipment</span>`;
```

**Proposed fix:** Move Starting AC inline with Armor, and remove the spacer lines (replace with a small "write-in" line for the player):

```javascript
const equipmentInnerHTML = eq.armor !== null
    ? `
        <div>
            <strong>Armor:</strong> ${eq.armor} &nbsp;&nbsp;
            <strong>AC:</strong> ${eq.startingAC}
            ${eq.startingGold !== null && eq.startingGold !== undefined
                ? `&nbsp;&nbsp; <strong>Gold:</strong> ${eq.startingGold} gp` : ''}
        </div>
        <div style='margin-top: 4px;'><strong>Items:</strong>
            <ul style='margin: 2px 0; padding-left: 18px;'>${itemsHTML}</ul>
        </div>`
    : `<span style='color:#666;'>No starting equipment</span>`;
```

**Checklist:**
- [ ] **3E-1** Refactor `equipmentInnerHTML` template in `renderCharacterSheetHTML()` to inline Armor + AC + Gold on one line
- [ ] **3E-2** Remove the `&nbsp;<br>&nbsp;<br>&nbsp;` spacer block
- [ ] **3E-3** Test with no armor (Magic-User), armor only (Fighter), armor + many items (level 5 Fighter with dungeoneering bundle)

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
