# TODO: Integrate 0-Level Generation into Basic & Advanced Pages (Then Delete 0level.html)

## Goal

Enable players to start a campaign at **Level 0** entirely from `basic.html` or `advanced.html`,
progress through levels 1–14 using the existing generators, and eventually delete the standalone
`0level.html` page (and its exclusive JS files).

This creates one seamless experience: generate a level-0 character, hand it to a player, they
survive their first adventure, gain a class, and then use the same generator to level up all the
way to 14.

---

## Progress Summary (as of 2026-03-30)

### ✅ Phase 1 COMPLETE — Level 0 integrated into basic.html and advanced.html

| Task | Status |
|------|--------|
| Create `shared-0level-gen.js` | ✅ Done |
| Add "0" button to level grid in `basic.html` + `advanced.html` | ✅ Done — defaults to 0 on page load |
| Show race selector when level 0 is selected (both pages) | ✅ Done |
| Hide class/equipment sections when level 0 is selected | ✅ Done |
| `generateCharacter()` branches to 0-level path (`shared-0level-gen.js`) | ✅ Done |
| Level-0 sheet rendered as `m:'Z'` via `displayCharacterSheet()` | ✅ Done |
| `adv:0` for basic.html, `adv:1` for advanced.html | ✅ Done |
| "Open in New Tab for Printing" button present on all 3 pages | ✅ Done (via shared-character-sheet.js) |
| CON minimum defaults to 6 on basic + advanced | ✅ Done |
| Name box (section 4) not overwritten during silent generation | ✅ Done |
| Ability score inputs (section 5) not overwritten during silent generation | ✅ Done |
| "Roll Abilities" button removed from basic + advanced | ✅ Done |
| "Set to Minimums (3)" renamed to "Reset Minimums" | ✅ Done |

### ✅ Phase 2 COMPLETE — Delete 0level.html

| Task | Status |
|------|--------|
| Step 1: Verify `charactersheet.html` Edit panel handles 0→1 level-up | ✅ Already implemented — class picker shown for L0 chars |
| Step 2: Update nav links on `basic.html` | ✅ Done — removed 0level link, updated to "Levels 0–14" |
| Step 2: Update nav links on `advanced.html` | ✅ Done |
| Step 2: Update nav links on `classes.html` | ✅ Done |
| Step 2: Update nav links on `index.html` | ✅ Done — removed L0 card, updated feature list, updated legal text |
| Step 3: Verify no remaining imports of 0level-only files | ✅ Clean (only stale comment, now removed) |
| Step 4: Delete `0level.html` | ✅ Deleted |
| Step 4: Delete `0level-ui.js` | ✅ Deleted |
| Step 4: Delete `0level-character-gen.js` | ✅ Deleted |
| Step 4: Delete `0level-utils.js` | ✅ Deleted |
| Step 4: Delete `canvas-generator.js` | ✅ Deleted (only used by 0level-ui.js) |
| Step 4: Delete `markdown-generator.js` | ✅ Deleted (only used by canvas-generator.js) |
| Step 4: Delete `canvas-sheet-renderer.js` | ✅ Deleted (only used by canvas-generator.js) |
| Step 5: Clean stale comment in `shared-race-adjustments.js` | ✅ Done |

---

## ⏳ Step 5: Manual Testing Checklist (still to verify in browser)

- [ ] `basic.html`: clicking "0" generates a level-0 character with Occupation, 1d4 HP, racial abilities
- [ ] `basic.html`: level-0 character shows no class, no XP section, no spell slots, no turn undead
- [ ] `basic.html`: level-0 cp has `m:'Z'`, no `c` field, `hr:[<l0hp>]`, `hd:[4]`, `adv:0`
- [ ] `advanced.html`: same as above but `adv:1` and racial adjustments applied to scores
- [ ] `advanced.html`: Human level-0 character has human racial abilities (Blessed, Decisiveness, Leadership) when "Strict OSE + Human Racial Abilities" is selected
- [ ] Print tab (`charactersheet.html`): Edit/Level Up panel shows level 0 as current level
- [ ] Print tab: level-up from 0 → 1 shows class picker; promoting works correctly
- [ ] All existing level 1–14 generation still works on both pages
- [ ] Nav links updated; `0level.html` removed; no 404s
- [ ] No broken imports (grep passes clean — ✅ confirmed)
- [ ] `index.html` about page updated — ✅ confirmed

---

## Context: What Exists Today

### The Two Generator Pages (as of 2026-03-30)
| File | Mode Code | Description |
|------|-----------|-------------|
| `basic.html`  | `m:'B'` or `m:'Z'` | Levels **0**–14, race-as-class; defaults to level 0 |
| `advanced.html` | `m:'A'` or `m:'Z'` | Levels **0**–14, separate race + class grid; defaults to level 0 |

### Deleted Files (Phase 2)
| File | Role |
|------|------|
| ~~`0level.html`~~ | Old standalone page — **DELETED** |
| ~~`0level-ui.js`~~ | Old UI logic for standalone page — **DELETED** |
| ~~`0level-character-gen.js`~~ | Old generation logic (superseded by `shared-0level-gen.js`) — **DELETED** |
| ~~`0level-utils.js`~~ | Old utility functions (folded into `shared-0level-gen.js`) — **DELETED** |
| ~~`canvas-generator.js`~~ | PNG/JSON export (0level-only) — **DELETED** |
| ~~`markdown-generator.js`~~ | Markdown export (0level-only) — **DELETED** |
| ~~`canvas-sheet-renderer.js`~~ | Canvas sheet renderer (0level-only) — **DELETED** |

### Shared Files Used by All Generators
| File | Key Exports |
|------|-------------|
| `shared-0level-gen.js` | `generateZeroLevelCharacter(options)` — the canonical 0-level gen function |
| `shared-backgrounds.js` | `getRandomBackground(hp)` |
| `shared-racial-abilities.js` | `getAdvancedModeRacialAbilities(race)`, `calculateSavingThrows()`, `calculateAttackBonus()`, `getMaxLevel()` |
| `shared-race-adjustments.js` | `applyRaceAdjustments()`, `meetsRaceMinimums()` |
| `shared-ability-scores.js` | `calculateModifier()`, `rollAbilities()` |
| `shared-names.js` | `getRandomName(race)` |
| `shared-modifier-effects.js` | `getModifierEffects(ability, modifier, score)` |
| `shared-character-sheet.js` | `displayCharacterSheet(sheet, targetInfo, targetDisplay)` |
| `shared-compact-codes.js` | `encodeCompactParams(cp)`, `decodeCompactParams(encoded)` |
| `charactersheet.html` | Print/save page; decodes `?d=` URL param → renders sheet + Edit/Level Up panel |

---

## Level-0 Character Sheet Format (cp object, mode `'Z'`)

```js
{
  v: 2,        // version
  m: 'Z',      // mode: Z = 0-level
  r: 'HU',     // race code: HU/DW/EL/HA/GN
  s: [STR, DEX, CON, INT, WIS, CHA],   // 6 ability scores (adjusted)
  sv: [death, wands, paralysis, breath, spells],  // saving throws
  h: number,   // total HP (1d4 + CON modifier, min 1)
  hr: number[], // HP rolls — hr[0] is L0 roll
  hd: number[], // die sides — hd[0] = 4 for 0-level
  n: 'Name',
  bg: 'Blacksmith',
  ar: 'Unarmored' | null,
  w: 'Hammer' | null,
  it: ['item1', ...],
  g: number,   // starting gold
  ac: number,  // starting AC
  adv: 0|1,    // 0 = from basic.html, 1 = from advanced.html
  un: 0|1,
  qr: 0|1
}
```

### cp Transformation on Level-Up (0→1+)
```
Keep:   r, s, n, un, qr, bg
Change: m → 'B' (if adv=0) or 'A' (if adv=1)
Add:    c (class code), l (level), p (progression mode)
        ar, w, it, ac, g (new equipment)
        h, hr, hd (new HP with L0 roll at hr[0])
Remove: sv (recalculated from class/level), adv
```

---

## Key Technical Facts (stable as of 2026-03-30)

### Stable `hr[]` array layout
`shared-hit-points.js` guarantees: **L0 background HP roll is always at `hr[0]`/`hd[0]`**, regardless of `includeLevel0HP` flag. `hr[1]`=L1 HP, `hr[2]`=L2 HP, etc. `il=1` means `hr[0]` is counted in max HP; `il=0` means it is stored but not counted.

### L1 HP floor: `hr[1] >= hr[0]` when `il=0`
`rollHitPoints()` guarantees that when `il=0`, the L1 HP roll is rerolled until ≥ the L0 background HP. Same floor applied in the Level Up panel of `charactersheet.html`.

### Background column in Basic/Advanced header
The character sheet header row includes a **Background** column (between Character Name and Class). The 0-level header uses "Occupation" in that position.

### Silent generation (as of 2026-03-30)
When `useFixedScores = false` (the default), generation on basic.html and advanced.html:
- Rolls ability scores in the background — **does NOT update** the score inputs in section 5
- Generates a random name — **does NOT update** the name field in section 4
- Section 5 inputs serve purely as **minimums**, not as display for generated values
