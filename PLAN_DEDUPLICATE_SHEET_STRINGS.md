# PLAN: Deduplicate sheet rendering — extract charactersheet.js

## Current state (the problem)

### Two pages, two independent rendering paths

```
generator.html
  └── generator-ui.js
        ├── generates character (rolls, choices)
        ├── builds sheet spec (subtitle, footer, etc.) ← duplicated logic
        ├── calls displayCharacterSheet() for inline preview
        └── encodes compact params → opens charactersheet.html?d=...

charactersheet.html
  └── <script type="module"> (large inline script, ~750 lines)
        ├── decodes compact params from URL
        ├── re-derives character from those params
        ├── builds sheet spec (subtitle, footer, etc.) ← same logic, again
        ├── calls renderCharacterSheetHTML() for display
        └── provides edit / level-up / modify panels
```

The two rendering paths are independent. Any change to how the sheet title, subtitle,
footer, or any display field is formatted must be made in **both** places — and currently
also in the three `display*` functions inside `generator-ui.js` (one per generator type).

### Duplicated string-building (the immediate symptom)

The progression mode label and the footer identity line are built independently in
6+ places across `generator-ui.js` and `charactersheet.html`'s inline script.

---

## Proposed architecture

### The key insight

`generator-ui.js` should only do two things:
1. Generate the character (random rolls, UI choices, equipment purchase)
2. Produce compact params (`cp`) that fully encode that character

Everything from "compact params → rendered sheet" should live in one shared module:
**`charactersheet.js`**.

```
generator.html
  └── generator-ui.js
        ├── generates character
        ├── produces compact params (cp)
        └── calls charactersheet.js renderFromCompactParams(cp, targetEl)
                                          ↑ same module
charactersheet.html
  └── charactersheet.js  (extracted from inline <script>)
        ├── reads ?d= URL param
        └── calls renderFromCompactParams(cp, targetEl)
```

### New module: `charactersheet.js`

Extract the inline `<script>` from `charactersheet.html` into an ES6 module.

Key exports:
```js
/**
 * Given a decoded compact-params object (cp), reconstruct the full character,
 * build the sheet spec, and render it into targetEl.
 * Used by both charactersheet.html (from URL) and generator.html (inline preview).
 */
export async function renderFromCompactParams(cp, targetEl, opts = {});

/**
 * Entry point for charactersheet.html — reads ?d= from URL, decompresses,
 * decodes compact params, and calls renderFromCompactParams.
 */
export async function initCharacterSheet();
```

Inside `renderFromCompactParams`:
- Decode mode, progression, race, class, ability scores from `cp`
- Re-derive the character (saving throws, attack bonus, spell slots, etc.)
- Build `subtitle` and `footer` in **one place** using `progModeLabel()` from `shared-sheet-builder.js`
- Build the full sheet spec via `buildSheetSpec()`
- Render via `renderCharacterSheetHTML()`

### Changes to `generator-ui.js`

The three `display*` functions (`displayBasicCharacter`, `displayAdvancedCharacter`,
`displayZeroLevelCharacter`) currently:
1. Build the sheet spec (subtitle, footer, ability score rows, etc.)
2. Build compact params (`cp`)
3. Call `displayCharacterSheet(spec, ...)` for inline preview

After the refactor, they should:
1. Build compact params (`cp`) — this is the canonical character representation
2. Call `renderFromCompactParams(cp, targetEl)` for inline preview (same as charactersheet.html uses)

This means the generator no longer needs to build the sheet spec at all — it just encodes
the character and hands it to the shared renderer.

### Changes to `charactersheet.html`

Replace the large inline `<script>` with:
```html
<script type="module">
    import { initCharacterSheet } from './charactersheet.js';
    initCharacterSheet();
</script>
```

---

## Benefits

| Now | After |
|-----|-------|
| Sheet spec built in 3+ places | Built in 1 place (`charactersheet.js`) |
| Subtitle/footer logic duplicated 6+ times | Defined once in `shared-sheet-builder.js` |
| `charactersheet.html` has ~750 lines of inline JS | Replaced by a 3-line script tag |
| Inline preview and print tab use different code paths | Same `renderFromCompactParams` for both |
| Bug fix must be applied in 2 files | Applied in 1 file |

---

## Files affected

| File | Change |
|------|--------|
| `charactersheet.js` | **New file** — extracted from `charactersheet.html` inline script |
| `charactersheet.html` | Replace `<script>` block with `import { initCharacterSheet }` |
| `generator-ui.js` | Replace 3 `display*` functions with compact-params → `renderFromCompactParams` calls |
| `shared-sheet-builder.js` | Add `progModeLabel()` export (used by `charactersheet.js`) |

---

## What this is NOT

- This does not change the URL format or compact params encoding
- This does not merge the generator and character sheet pages
- This does not change the edit / level-up / modify panel behavior (those stay in `charactersheet.js`)
- The generator page still shows an inline preview (it just uses the shared renderer to do so)

---

## Prerequisite

The compact params (`cp`) must fully encode everything needed to render the sheet —
including ability score adjustments, equipment, HP rolls, etc. This is already largely
true; any gaps should be identified during implementation.

---

## Status

- [x] Add `progModeLabel()` to `shared-sheet-builder.js`
- [x] Extract `charactersheet.html` inline script → `charactersheet.js`
  - [x] Export `renderFromCompactParams(cp, targetEl, opts)`
  - [x] Export `initCharacterSheet()` (reads URL, calls renderFromCompactParams)
- [x] Update `charactersheet.html` to `import { initCharacterSheet }` (3-line script block)
- [x] Update `generator-ui.js` — replace 4× mode-label ternary chains with `progModeLabel()`
- [x] Verified inline preview (0-level Basic Gnome renders correctly)
- [x] Verified `charactersheet.html` loads and calls `initCharacterSheet()` without errors

## Remaining duplication audit

### The two subtitle/footer definitions in `charactersheet.js`

Both live inside `expandCompactV2()` — one per branch of the level-0 / level-1+ `if`:

**Level-0 branch (~line 106 / 127):**
```js
subtitle: `RETRO ADVENTURE GAME &nbsp;·&nbsp; ${modeLabel} Mode`,
footer: (() => {
    const o = buildOptionsLine(cp);
    const modPfx = cp.mx ? 'Modified ' : '';
    return `${modPfx}0-Level ${raceDisplay} &nbsp;·&nbsp; ${modeLabel} Mode` +
           (o ? `<br><small style="opacity:0.7;">${o}</small>` : '');
})(),
```

**Level-1+ branch (~line 196 / 216):**
```js
subtitle: `RETRO ADVENTURE GAME &nbsp;·&nbsp; ${modeStr} Mode`,
footer: (() => {
    const o = buildOptionsLine(cp);
    const who = isAdv ? `${raceDisplay} ${clsDisplay}` : clsDisplay;
    const modPfx = cp.mx ? 'Modified ' : '';
    return `${modPfx}Level ${level} ${who} &nbsp;·&nbsp; ${modeStr} Mode` +
           (o ? `<br><small style="opacity:0.7;">${o}</small>` : '');
})(),
```

### What actually differs

| Part | Level 0 | Level 1+ |
|------|---------|----------|
| `subtitle` | `RETRO ADVENTURE GAME · ${modeLabel} Mode` | **identical** (`modeLabel`/`modeStr` are the same value) |
| `footer` template | `${modPfx}${identity} · ${modeLabel} Mode<br><small>${o}</small>` | **identical** |
| `identity` in footer | `0-Level ${raceDisplay}` | `Level ${level} ${who}` |

The subtitle template is 100% identical. The footer template is 100% identical. Only the
`identity` substring differs.

### Proposed single definition

Extract `modeLabel` and build `title`, `subtitle`, `footer` once **before** the level-0/level-1+ branch:

```js
// ── Shared header/footer strings (computed once, used by both branches) ──────
const modeLabel = progModeLabel(cp.p || 'O');
const isAdvMode  = mode === 'A';
const title      = isAdvMode ? 'OLD-SCHOOL ESSENTIALS ADVANCED' : 'OLD-SCHOOL ESSENTIALS';
const subtitle   = `RETRO ADVENTURE GAME &nbsp;·&nbsp; ${modeLabel} Mode`;

// identity is level-dependent — set inside the if/else, then footer is built once after:
// (level 0 sets identity before early return, level 1+ sets it before buildSheetSpec)
const buildFooter = (identity) => {
    const o = buildOptionsLine(cp);
    const modPfx = cp.mx ? 'Modified ' : '';
    return `${modPfx}${identity} &nbsp;·&nbsp; ${modeLabel} Mode` +
           (o ? `<br><small style="opacity:0.7;">${o}</small>` : '');
};
```

Then in the level-0 branch:
```js
// identity = `0-Level ${raceDisplay}`
return { title, subtitle, footer: buildFooter(`0-Level ${raceDisplay}`), ... };
```

And in the level-1+ branch:
```js
// who = isAdv ? `${raceDisplay} ${clsDisplay}` : clsDisplay
sd.footer = buildFooter(`Level ${level} ${who}`);
```

This collapses 2 subtitle strings → 1 and 2 footer builder closures → 1 shared helper.

**Status: ✅ DONE** — implemented in `charactersheet.js`.

Result (`grep` audit):
- Line 100: `subtitle` defined **once**
- Line 101: `buildFooter` defined **once**
- Line 115: level-0 branch spreads `title, subtitle`
- Line 136: level-0 branch calls `buildFooter('0-Level ${raceDisplay}')`
- Line 196: level-1+ branch spreads `title, subtitle`
- Line 216: level-1+ branch calls `buildFooter('Level ${level} ${who}')`

`generator-ui.js` has zero subtitle or footer string-building.

---

## Completed work

- [x] Update `generator-ui.js` `display*` functions to call `expandCompactV2` instead of
      building the full sheet spec directly via `buildSheetSpec` — removes subtitle/footer
      duplication between the generator inline preview and `charactersheet.js`
- [x] Fix HP rolls not appearing in 0-level footer:
  - `shared-character-sheet.js` now falls back to `cp.hr` when `editState.hpRolls` is absent
  - `expandCompactV2` level-0 path now includes `cp` in the returned spec
  - `displayZeroLevelCharacter` now sets `editState.hpRolls: [char.hitPoints.total]`
- [x] Fix 0-level Basic subtitle/footer missing progression mode label (now always shown,
      consistent with Level 1+: "0-Level Human · OSE Standard Mode")
