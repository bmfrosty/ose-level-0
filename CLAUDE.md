# OSE Level-0 Character Generator — Project Guide for Claude

This project is an **Old-School Essentials (OSE) character generator**, levels 0–14. Race and
class selection live in a **single unified grid**; there is no longer a hard "Basic vs Advanced"
mode split in the generation mechanics. Understanding the grid, the referee-facing restriction
preset, and the race-as-class vs separate-race-and-class distinction is essential to working on
this codebase correctly.

---

## The Unified Grid

`generator.html` shows **one grid**, always, regardless of any preset:

- **Rows** = races (Human, Dwarf, Elf, Halfling — the SRD/generator-ready races).
- **Columns** = **Race-as-Class** (leftmost), then Cleric, Fighter, Magic-User, Thief, Spellblade.

A cell's clickable/disabled state depends on the selected level and the **mode preset** (below) —
never on a hardcoded "Basic" or "Advanced" code path.

### Level 0

Clicking a race in the **Race-as-Class column** at level 0 picks that race for a level-0
character: a background/profession, no class yet, HP rolled on 1d4 + CON modifier. All other
columns are disabled at level 0 (a class can't be chosen before level 1). **Racial ability score
adjustments and racial minimums always apply at level 0**, unconditionally — a race is always
separately chosen at level 0 since there's no class yet to imply one.

### Level 1+

Two ways to fill a class in the grid:

- **Race-as-Class column** — clicking a race here (Dwarf, Elf, Halfling) picks that race's
  `CLASS_INFO` race-as-class package: one class that bundles racial *and* class features
  together (the old "Basic mode" demihuman classes). No separate racial stat adjustments apply —
  the class is the full package. Human has no entry in this column (no "Human class").
- **Separate class columns** (Cleric/Fighter/Magic-User/Thief/Spellblade) — clicking a
  race + class cell here picks a race and a class independently. Racial ability score
  adjustments (e.g. Elf: +1 DEX, −1 CON) and racial minimums apply, and the race's own
  racial abilities (languages, infravision, etc.) are gained alongside the class's abilities.

Ability scores rolled/adjusted at whatever level the character was created are **never re-rolled
or reversed** when leveling up or changing which button was picked later — only the ability set
and progression table change.

---

## Mode Preset — Referee Restriction, Not a Mechanics Switch

The "mode" radio group above the grid is a **three-way referee-facing restriction preset**. It
only controls which grid cells are enabled — it has no effect on generation mechanics.

| Value | Label | Effect |
|-------|-------|--------|
| `race-class` | A — Race-and-Class Only | Only the separate class columns are enabled (any race). Race-as-Class column disabled. |
| `race-as-class` | B — Race-as-Class Only (default) | Race-as-Class column enabled; separate class columns enabled **only for Human** (Human has no race-as-class entry, so this is how Human still picks Cleric/Fighter/Magic-User/Thief/Spellblade). |
| `both` | C — Both | Everything enabled — a referee/player can pick race-as-class *or* a separate race+class, per character. |

This preset is what the old `mode` variable (`'basic'` / `'advanced'`) used to be, but it no
longer drives `generateCharacterV3`. In `gen-ui.js` it is held in the `modePreset` variable and
persisted/URL-synced under the `mode` param (values above), separately from `raceClassMode` (the
Strict OSE / Human Abilities / Traditional Extended / Allow All restriction, which now applies
uniformly to any pick, race-as-class or separate).

---

## What Actually Drives Mechanics: `isSeparateRaceClass`

`generateCharacterV3(opts)` in `gen-core.js` takes an explicit `isSeparateRaceClass` boolean —
**not** a mode string:

- `true` — a race was explicitly, separately selected (a separate class column was clicked, or
  it's level 0). Racial minimums, racial ability adjustments, and class requirements-by-race all
  apply.
- `false` — a race-as-class pick (the Race-as-Class column was clicked at level 1+). Race is
  implied by the class package (`staticRace`, derived from the class name); no separate racial
  stat mechanics apply.

In `gen-ui.js`, this is derived from **which grid column was clicked**, tracked in the
`isRaceAsClassPick` variable (`isSeparateRaceClass = !isRaceAsClassPick`) — never from the mode
preset. `selectedRace` is always populated once a level-1+ pick is made, for both pick types
(e.g. a Dwarf race-as-class pick sets `selectedRace = 'Dwarf_RACE'` too), which is what lets most
downstream logic (Blessed HP eligibility, `hideHumanRace`, wiring race into `generateCharacterV3`)
stay unconditional instead of branching on pick type.

The `mCode` field baked into every generated character's compact params (`cp.m`, `'A'` or `'B'`)
records `isSeparateRaceClass` at creation time and is carried forward unchanged through leveling —
it means "this character has separately-applied racial adjustments," not "which UI screen created
it." `expandCompactV3` re-derives the actual adjustment *values* from `mCode` + race on every
decode; ability scores are stored raw, never pre-adjusted.

---

## Race vs. Class — The Critical Distinction

Do not conflate race and class.

| Concept | Race-as-Class pick | Separate-class pick |
|---------|--------------------|-----------------------|
| "Dwarf" / "Elf" / "Halfling" | A class (race-as-class): all abilities are class features, no separate racial stat adjustments — the class is the full package. | A race only: gets racial abilities from `RACE_INFO` including stat adjustments. Paired with any class the race has access to. |
| "Human" | No race-as-class entry — column is always disabled for Human. | The common case: Human + Cleric/Fighter/Magic-User/Thief/Spellblade. Optional racial abilities (Blessed, Decisiveness, Leadership) when enabled. |

The Gnome class and the Elf class are **independent classes with their own rules** even though
both have a "Magical Research"-style ability — the Gnome class creates magic items at 8th level,
the Elf class at 9th. Not coupled.

The Spellblade is a fighter/magic-user hybrid class, available to any race with access to both
Fighter and Magic-User (currently Human, Elf, Drow, Half-Elf) as a separate-class pick, and to
Human as one of the always-available separate classes under the `race-as-class` preset. It is
**not** derived from the Elf race-as-class package and is not coupled to it — they both use
arcane magic but have independent rules.

---

## Key Data Structures

### `CLASS_INFO` (`shared-class-info.js`)

One entry per class (`Cleric`, `Dwarf`, `Elf`, `Fighter`, `Gnome`, `Halfling`, `Magic-User`,
`Spellblade`, `Thief`, plus Advanced Fantasy expanded classes). Key fields:

- `classType`: `"plainClass"` (Cleric/Fighter/Magic-User/Thief/Spellblade/etc.) or
  `"raceAsClass"` (Dwarf/Elf/Halfling/Gnome).
- `hasClassPage`: whether this class gets a `classprint.html` reference page and a button on
  `classes.html`.
- `showInGenerator`: whether the generator's grid should offer this class at all (gates rarer/
  not-yet-ready classes without deleting their data).
- `requirements`: per-race ability-score minimums for taking this class (Advanced/separate-class
  only — race-as-class packages have their own flat requirements).
- `CLASS_ABILITIES` (the feature list) lives alongside each entry; see below.

### `CLASS_ABILITIES`

The authoritative source for class features (one array per class entry in `CLASS_INFO`). Each
entry:

```js
{
  name: "Ability Name",
  description: "Human-readable description text.",
  availableAt: 1,           // first level this entry displays
  availableThrough: 14,     // last level this entry displays (default 14)
  includeName: true,        // if present and true: renders as "Name: description"
                            // if absent/commented out: renders description standalone
  raceOverrides: {            // separate-class picks only — optional map of race name → partial entry
    "Human": { description: "...", availableAt: 11 },  // any fields; merged over base entry
    "Elf":   { description: "..." }
  },
  // SRD: "verbatim SRD source text"   (always a comment)
  // BOOK: "verbatim book source text" (always a comment, used when not in SRD)
  // PROPOSED: "intended description"  (always a comment, for user review)
}
```

**Rules:**
- `includeName` commented out (`// includeName: true,`) means the renderer defaults to `false`.
  User must uncomment to enable.
- When an ability changes at a level (e.g. gains a new power at 9th), use `availableThrough` on
  the earlier entry and create a new entry with higher `availableAt`.
- `CLASS_ABILITIES` contains **class features only**. Racial features do not belong here, even
  if a race-as-class package has an ability with the same name as a racial ability. Resilience
  (the CON-based save bonus for Dwarf and Halfling) is a racial feature — it lives in
  `RACE_INFO[race].abilities`, not `CLASS_ABILITIES`.

### `RACE_INFO` (`shared-race-info.js`)

One entry per race. Key fields:

```js
{
  code: "DW",                       // compact-params race code
  classLevelLimits: { Fighter_CLASS: 9, ... },  // Normal-mode level caps per class (separate-class picks)
  abilityModifiers: { STR: 0, DEX: 0, CON: 1, ... },  // separate-class picks only — never applied for a race-as-class pick
  minimums: { CON: 9 },              // racial ability-score minimums — separate-class picks only
  abilities: [ /* structured entries, same shape as CLASS_ABILITIES, plus: */
    {
      basicAvailableAt: 0, basicAvailableThrough: 0,      // race-as-class-pick display window
      advancedAvailableAt: 0, advancedAvailableThrough: 14, // separate-class-pick display window
      applyOnly: true,        // mechanic-only, never printed on the sheet
      abilityModifiers: {...},// same shape as above, entry-scoped
      saveModifier: { formula: "CON_RESILIENCE", appliesTo: ["Death","Wands","Spells"] },
      humanOnly: true,        // only shown when "human racial abilities" option enabled
    },
  ],
  showInGenerator: true,
}
```

**Key policy decisions:**
- `abilityModifiers` (whole-race or per-ability-entry) are **separate-class-pick only**. Never
  apply them for a race-as-class pick — the class package already includes everything.
- All racial abilities have `basicAvailableAt: 0` and `advancedAvailableAt: 0` (races are chosen
  at level 0 or paired at level 1; abilities apply immediately either way).
  **Exception**: Blessed has `availableAt: 1` because it governs HP rolling at level 1 (roll
  twice, take best), not level 0.
- Race-as-class packages' own racial-flavor abilities have `basicAvailableThrough: 0` — the
  race-as-class class's own `CLASS_ABILITIES` take over at level 1. Separate-class picks keep
  the racial abilities through level 14 (`advancedAvailableThrough: 14`).

---

## Key Files

| File | Role |
|------|------|
| `shared-core.js` | Consolidated data + logic: re-exports `CLASS_INFO`/`RACE_INFO`, XP/HD/spell-slot/thief-skill/turn-undead tables, `getClassProgressionData()`, `getClassFeatures()`, `getRaceAbilitiesAtLevel()`, `applyRacialAdjustments()`, `checkRacialMinimums()`, `calculateSavingThrows()`, `calculateAttackBonus()`, equipment tables, `createCharacter()`. |
| `shared-class-info.js` | `CLASS_INFO` + per-class `CLASS_ABILITIES` definitions. |
| `shared-race-info.js` | `RACE_INFO` + per-race `abilities` definitions. |
| `shared-race-names.js` | `LEGACY_RACE_NAMES`, `normalizeRaceName()` — normalizes race name variants to canonical `Name_RACE` format. |
| `gen-core.js` | Generator-only logic: DOM helpers, name/background tables, equipment purchasing, `generateCharacterV3(opts)` (levels 0–14, explicit `isSeparateRaceClass`). Re-exports all of `shared-core.js`. |
| `gen-ui.js` | `generator.html`'s UI logic: the unified grid, the 3-way mode preset, settings persistence, URL sync. |
| `cs-core.js` | Character-sheet-side shared logic: progression tables, `buildOptionsLine()` (compact-params → human-readable settings summary). |
| `cs-sheet-page.js` | `charactersheet.html`'s rendering logic: `expandCompactV3()` (decodes a character's compact params, re-deriving racial adjustments from `mCode` + race on every decode), `buildGeneratorURL()` (reconstructs a `generator.html` link to regenerate/edit a character), the level-0→1 "class up" flow. |
| `SRD/CLASSES/` | Verbatim SRD source text for each class (cleric, dwarf, elf, fighter, halfling, magic-user, thief). Reference only. |
| `COPYRIGHTED-*.txt` | Verbatim text from OSE Advanced Fantasy book. **Do not reproduce in code.** Reword all descriptions. SRD text may be used verbatim where it applies. |

---

## Other Settings

### Normal vs. Smoothified (Gygar) Mode

- **Normal mode**: Traditional OSE rules. Racial level limits apply (`raceClassMode: 'strict'` or
  `'strict-human'`). Level 0 characters have a -1 attack penalty. Uses OSE saving throw tables.
- **Smoothified/Gygar mode** (Castle Gygar house rules): No racial level limits. No attack penalty
  at level 0. Uses Gygar-specific progression tables (`progressionMode: 'smoothprog'`).

### Human Racial Abilities (Optional)

When `raceClassMode` is anything other than `'strict'`, Humans additionally gain:
- **Blessed**: Roll HP twice, take best at each level (does not apply at level 0).
- **Decisiveness**: Act first on tied initiative (+1 individual initiative).
- **Leadership**: Retainers/mercenaries +1 loyalty and morale.

These come from `RACE_INFO.Human_RACE.abilities` entries flagged `humanOnly: true`.

---

## Important Rules and Decisions Already Made

- The Gnome class creates magic items at **8th level** (its max level). The Elf class creates
  magic items at **9th level**. These are correct and independent.
- Fighter and Halfling **Stronghold** is available at any level (`availableAt: 1`) per the SRD
  `== Stronghold ==` section (not under "After Reaching 9th Level"). Other class strongholds are
  level-gated (Cleric/Dwarf/Elf: 9th; MU: 11th; Gnome: 8th).
- Fighter has a separate **Baron Title** entry at `availableAt: 9` (from the SRD "After Reaching
  9th Level" section) distinct from the Stronghold ability.
- Dwarf and Halfling `Resilience` (CON-based save bonus) is a **racial feature**, not a class
  feature. It lives in `RACE_INFO[race].abilities` with a `saveModifier` field, mechanically
  applied via `calculateSavingThrows()` in `shared-core.js`.
- `CLASS_ABILITIES` entries for the Gnome class use `// BOOK:` comments (not `// SRD:`) because
  the Gnome class is not in the free OSE SRD — it is from OSE Advanced Fantasy.
- Gnome class **requirements**: CON 9 minimum only. DEX and INT are prime requisites (XP bonus),
  not minimums.
- Gnome class **armour**: Leather and shields only (not chain mail or plate).
- The Spellblade is a house-rules fighter/magic-user hybrid. It is NOT derived from the Elf
  race-as-class package. Racial abilities for a separate-class Elf Spellblade come from
  `RACE_INFO.Elf_RACE`, not the class.
- **Racial ability score adjustments only apply for a separate-class pick** (`isSeparateRaceClass:
  true`). Never apply `abilityModifiers` from `RACE_INFO` for a race-as-class pick.
- **Level 0 always applies racial ability adjustments and racial minimums**, unconditionally —
  a race is always separately chosen at level 0 (no class yet to imply one). This differs from
  the old Basic-mode level-0 behavior, which applied none; it was a deliberate design change made
  when the grid was unified (see git history around the `race-as-class-grid-unification` branch).
