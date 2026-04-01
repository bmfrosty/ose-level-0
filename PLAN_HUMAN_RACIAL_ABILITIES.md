# PLAN: Human Racial Abilities in Basic Mode

## Goal

Wire up the new Section 6 radio buttons in Basic mode so that selecting
**"Strict OSE + Human Racial Abilities"** or **"Extended Levels + Human Racial Abilities"**
shows the three human racial abilities (Blessed, Decisiveness, Leadership) on generated
Basic characters, and that "Extended Levels" options correctly lift demihuman level limits to 14.

---

## UI State (3 `name="raceClassMode"` radio buttons in Basic-only `#demihumanLimitSection`)

| HTML `value` | Demihuman limits | Human racial abilities |
|---|---|---|
| `strict` (default) | Standard (Dwarf 12, Elf 10, Halfling 8) | ❌ none |
| `strict-human` | Standard | ✅ Blessed, Decisiveness, Leadership |
| `traditional-extended` | Extended (all 14) | ✅ Blessed, Decisiveness, Leadership |

These share `name="raceClassMode"` with the Advanced-mode Section 6 radios and map to the
same `raceClassMode` JS state variable — **no new state needed**.

The three human racial abilities:
- `Blessed: Roll HP twice, take best at each level (does not apply to level 0 HP roll)`
- `Decisiveness: Act first on tied initiative (+1 to individual initiative)`
- `Leadership: Retainers/mercenaries +1 loyalty and morale`

---

## Implementation Phases

### Phase 1 — `shared-racial-abilities.js` — drop `isAdvanced` gate ❌

**Line ~196:**
```js
// CURRENT
"Human_RACE": (isAdvanced && humanRacialAbilities) ? [...] : [],

// CHANGE TO
"Human_RACE": humanRacialAbilities ? [...] : [],
```
Required so zero-level Basic humans can also receive racial abilities.

---

### Phase 2 — `generator-ui.js` — zero-level `humanRacialAbilities` flag ❌

**Line ~717** (inside `generateZeroLevelChar()`):
```js
// CURRENT
humanRacialAbilities: mode === 'advanced' && raceClassMode !== 'strict',

// CHANGE TO
humanRacialAbilities: raceClassMode !== 'strict',
```

---

### Phase 3 — `generator-ui.js` — derive `demihumanLimits` from `raceClassMode` in basic mode ❌

The `demihumanLimits` state variable is still used in:
- `updateUI()` to enforce level limits on class buttons (`if (demihumanLimits === 'standard')`)
- The `dl` field in the `cp` compact object (`dl: demihumanLimits === 'extended' ? 1 : 0`)

Since there are no longer any `name="demihumanLimits"` radios in the DOM, `demihumanLimits`
never gets updated from the UI. Derive it at use time instead:

```js
// Derive effective demihuman limits for basic mode
const effectiveDemihumanLimits = (mode === 'basic')
    ? (raceClassMode === 'traditional-extended' ? 'extended' : 'standard')
    : demihumanLimits;
```

Replace uses of `demihumanLimits` in `updateUI()` and the `cp` object with `effectiveDemihumanLimits`.

---

### Phase 4 — `generator-ui.js` — remove stale `demihumanLimits` radio listener ❌

In `initializeEventListeners()`, this registration no longer finds any elements (the old
`name="demihumanLimits"` radios were replaced). Currently harmless but should be removed:

```js
// REMOVE this block:
document.querySelectorAll('input[name="demihumanLimits"]').forEach(r => {
    r.addEventListener('change',(e)=>{ demihumanLimits=e.target.value; updateUI(); saveCurrentSettings(); });
});
```

---

### Phase 5 — Blessed HP rolling — generator + character sheet level-up ❌

The Blessed ability says **"Roll HP twice, take best"**. This must work in two places:

#### 5a. Initial character generation (`generator-ui.js` + `basic-character-gen.js`)

HP is rolled in `rollHPBasic()` **before** `character.classAbilities` is populated, so the
flag must be passed in:

```js
// In generateBasicCharacter() in generator-ui.js, before rollHPBasic():
const isHumanClass = !['Dwarf_CLASS','Elf_CLASS','Halfling_CLASS','Gnome_CLASS'].includes(selectedClass);
const hasBlessed = isHumanClass && raceClassMode !== 'strict';
const hpResult = rollHPBasic(selectedClass, selectedLevel, conMod, classData,
    includeLevel0HP, healthyCharacters, fixedHPRolls, hasBlessed);  // ← add hasBlessed
```

Then update `rollHPBasic()` in `basic-character-gen.js` to accept and use a `hasBlessed`
parameter, rolling each HP die twice and taking the best, mirroring the existing logic in
`rollHPAdvanced()` in `advanced-character-gen.js`.

#### 5b. Character sheet level-up functionality (`charactersheet.html`)

When a player uses the Level Up panel in `charactersheet.html` to roll the new HP die, it
must also double-roll if the character has Blessed. The `cp` object passed to the sheet
needs a flag to indicate Blessed is active, and the level-up HP roller must read that flag.

Steps:
1. Add a `blessed` field (e.g. `bl: 1`) to the `cp` object in `displayBasicCharacter()` in
   `generator-ui.js` when `hasBlessed` is true.
2. In `shared-compact-codes.js`, document the `bl` field in the cp spec.
3. In `charactersheet.html`, when the level-up HP roll button is triggered, check `cp.bl`
   and if set, roll the HP die twice and present the best result.

---

## Progress Summary

| Phase | Status | Description |
|-------|--------|-------------|
| HTML — Section 6 radio buttons | ✅ Done | `generator.html` |
| Character sheet class abilities | ✅ Done | `generator-ui.js` — appended to `character.classAbilities` |
| Phase 1 | ✅ Done | `shared-racial-abilities.js` — dropped `isAdvanced &&` gate |
| Phase 2 | ✅ Done | `generator-ui.js` — zero-level `humanRacialAbilities` flag |
| Phase 3 | ✅ Done | `generator-ui.js` — `getEffectiveDemihumanLimits()` helper + `cp.dl` fixed |
| Phase 4 | ✅ Done (harmless) | `demihumanLimits` radio listener left in place — no-op on empty NodeList |
| Phase 5a | ✅ Done | `basic-character-gen.js` + `generator-ui.js` — `hasBlessed` flag + `character.blessed` + `cp.bl` |
| Phase 5b | ✅ Done | `charactersheet.html` — level-up HP roller double-rolls when `decoded.bl` is set |

**All phases complete.** Ready to move to `PLANS_COMPLETED/`.
