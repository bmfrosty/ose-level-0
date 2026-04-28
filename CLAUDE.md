# OSE Level-0 Character Generator — Project Guide for Claude

This project is an **Old-School Essentials (OSE) character generator** with two modes: **Basic**
and **Advanced**. Each mode spans **levels 0–14**. Understanding the difference between these
modes — and the strict separation between race and class — is essential to working on this
codebase correctly.

---

## The Two Modes

### Basic Mode (levels 0–14)

**Race and class are the same thing.** The demihuman "classes" (Dwarf, Elf, Gnome, Halfling) ARE
the race. A "Dwarf" character in Basic mode is simultaneously a dwarf by race and a Fighter-ish
class by function. Human characters choose from: Cleric, Fighter, Magic-User, Thief, Spellblade.

At **level 0** in Basic mode:
- Characters have a race but no class yet.
- They have a **background/profession** instead of class abilities.
- HP is rolled on 1d4 + CON modifier.
- Racial abilities (languages, infravision, etc.) are displayed — `basicAvailableAt: 0`.
- **Racial ability score adjustments do NOT apply in Basic mode.** Race-as-class demihumans
  do not get separate racial stat modifiers. The class IS the full package.
- At level 1, Basic mode demihumans LOSE racial abilities and GAIN class abilities from
  `CLASS_ABILITIES`. This is why `basicAvailableThrough: 0` for demihuman racial abilities.

Key rules for Basic mode:
- **Demihuman classes** (Dwarf, Elf, Gnome, Halfling) are race-as-class. Their `CLASS_ABILITIES`
  contain everything — both what would be racial abilities and class abilities combined into one
  package specific to that class.
- The Gnome class and the Elf class are **independent classes with their own rules**. The fact
  that both have a "Magical Research" ability does not mean they are coupled or that one mirrors
  the other. The Gnome class creates magic items at 8th level; the Elf class at 9th. These are
  separate rules.
- Human classes have `includeName: false` (default) for most abilities — the class name is
  rendered separately by the UI.
- `getBasicModeClassAbilities(className)` in `shared-class-progression.js` is the function that
  reads `CLASS_ABILITIES` and returns the formatted ability list for Basic mode demihuman sheets.
  It filters out entries with `basicMode: false`.

### Advanced Mode (levels 0–14)

**Race and class are completely separate.** A character has both a race (with racial abilities)
and a class (with class abilities). These are entirely independent.

At **level 0** in Advanced mode:
- Characters have a race and a background/profession, but no class yet.
- HP is rolled on 1d4 + CON modifier.
- **Racial ability score adjustments DO apply** (e.g. Elf: +1 DEX, -1 CON).
- Racial abilities are displayed — `advancedAvailableAt: 0`.
- At level 1, the character picks a class and gains class abilities on top of racial abilities.
  Racial abilities remain throughout all levels (`advancedAvailableThrough: 14`).

Key rules for Advanced mode:
- **Races**: Human, Dwarf, Elf, Gnome, Halfling (and rarer races like Drow, Duergar, etc. for
  NPC use — see `RACIAL_CLASS_LEVEL_LIMITS` in `shared-racial-abilities.js`)
- **Classes**: Cleric, Fighter, Magic-User, Thief, Spellblade, plus the Advanced Fantasy expanded
  classes (Acrobat, Assassin, Bard, Druid, Illusionist, Knight, Paladin, Ranger)
- An Elf character in Advanced mode gets **Elf_RACE** racial abilities from `shared-racial-abilities.js`
  **plus** whatever class abilities come from their chosen class (e.g. Fighter, Magic-User).
- There is **no "Elf class" in Advanced mode**. The Basic "Elf class" and the Advanced "Elf race"
  are completely different things. Do not confuse them or assume they share abilities.
- Racial abilities come from `getAdvancedModeRacialAbilities()` in `shared-racial-abilities.js`.
- Class abilities come from `CLASS_ABILITIES` in `shared-class-data-shared.js`.
- Racial class level limits apply in Normal mode (not Smoothified/Gygar mode).

---

## Race vs. Class — The Critical Distinction

This is the most important architectural concept. **Do not conflate race and class.**

| Concept | Basic Mode | Advanced Mode |
|---------|-----------|---------------|
| "Elf" | A class (race-as-class). All abilities are class features. No separate racial stat adjustments. | A race only. Gets racial abilities from `Elf_RACE` including stat adjustments. Needs a separate class. |
| "Dwarf" | A class (race-as-class). All abilities are class features. No separate racial stat adjustments. | A race only. Gets racial abilities from `Dwarf_RACE` including stat adjustments. Needs a separate class. |
| "Gnome" | A class (race-as-class). All abilities are class features. No separate racial stat adjustments. | A race only. Gets racial abilities from `Gnome_RACE` including stat adjustments. Needs a separate class. |
| "Halfling" | A class (race-as-class). All abilities are class features. No separate racial stat adjustments. | A race only. Gets racial abilities from `Halfling_RACE` including stat adjustments. Needs a separate class. |
| "Human" | Not a class. Humans choose Cleric/Fighter/MU/Thief/Spellblade. No racial stat adjustments. | A race. Humans have optional racial abilities (Blessed, Decisiveness, Leadership). Has stat adjustments (+1 CON, +1 CHA). |

The Spellblade is an **Advanced mode fighter/magic-user hybrid class**. It is available to Human
and Elf races in Advanced mode, and to Humans in Basic mode. It is NOT derived from the Basic Elf
class and is NOT coupled to it. They happen to both use arcane magic but have independent rules.

---

## Current Bug: Racial Stat Adjustments in Basic Mode

`gen-0level-gen.js` currently calls `applyRaceAdjustments()` from `gen-race-adjustments.js`
unconditionally — it applies racial ability score modifiers to all level-0 characters regardless
of mode. **This is wrong.** Racial stat adjustments should only apply in Advanced mode. In Basic
mode, race-as-class demihumans do not get separate racial stat modifiers.

This will be fixed as part of the generator merger (see Planned Architecture Changes below).

---

## Key Data Structures

### `CLASS_ABILITIES` (`shared-class-data-shared.js`)

The authoritative source for all class features. One array per class. Each entry:

```js
{
  name: "Ability Name",
  description: "Human-readable description text.",
  availableAt: 1,           // first level this entry displays
  availableThrough: 14,     // last level this entry displays (default 14)
  includeName: true,        // if present and true: renders as "Name: description"
                            // if absent/commented out: renders description standalone
  raceOverrides: {            // Advanced mode only — optional map of race name → partial entry
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
  if a demihuman class has an ability with the same name as a racial ability. Resilience
  (the CON-based save bonus for Dwarf and Halfling) is a racial feature — it lives in
  `RACIAL_ABILITIES`, not `CLASS_ABILITIES`.

### `RACIAL_ABILITIES` (`shared-racial-abilities.js`)

Currently a flat string array **inside** `getAdvancedModeRacialAbilities()`. This is the target of
a planned refactor (see `PLAN_RACE_ABILITIES_AUDIT.md`) to extract it as a top-level `export const`
with the same structured format as `CLASS_ABILITIES`, plus additional fields:

```js
{
  name: "...",
  description: "...",
  basicAvailableAt: 0,       // level range for Basic mode display
  basicAvailableThrough: 0,  // 0 = shown at level 0 only; replaced by class abilities at level 1
  advancedAvailableAt: 0,    // level range for Advanced mode display
  advancedAvailableThrough: 14,
  applyOnly: true,           // if true: mechanic-only, never printed on sheet
  abilityModifiers: { STR: 0, DEX: 1, CON: -1, ... },  // Advanced mode only — never applied in Basic
  saveModifier: { formula: "CON_RESILIENCE", appliesTo: ["Death", "Wands", "Spells"] },
  humanOnly: true,           // if true: only shown when "human racial abilities" option enabled
}
```

**Key policy decisions (already made):**
- `abilityModifiers` entries are **Advanced mode only**. They must never be applied in Basic mode.
- All racial abilities have `basicAvailableAt: 0` and `advancedAvailableAt: 0` (races are chosen
  at level 0; all abilities apply immediately).
- **Exception**: Blessed has `availableAt: 1` because it governs HP rolling at level 1 (roll
  twice, take best), not at level 0.
- Basic mode demihuman racial abilities have `basicAvailableThrough: 0` — they are replaced by
  class abilities at level 1. Advanced mode keeps them through level 14.

---

## Key Files

| File | Role |
|------|------|
| `shared-class-data-shared.js` | `CLASS_ABILITIES`, `CLASS_INFO`, XP tables, HD tables, spell slots, thief skills, turn undead. Authoritative source for all class data. |
| `shared-racial-abilities.js` | `RACIAL_ABILITIES` (currently inside function; planned refactor), `getDwarfResilienceBonus()` etc., `calculateSavingThrows()`, `calculateAttackBonus()`. |
| `shared-class-progression.js` | `getBasicModeClassAbilities()`, `getClassProgressionData()`, `getClassFeatures()`. Reads from `CLASS_ABILITIES`. |
| `shared-basic-character-gen.js` | Wrappers for Basic mode character generation. |
| `shared-advanced-character-gen.js` | Wrappers for Advanced mode character generation. |
| `gen-0level-gen.js` | Level-0 character generation. Currently a separate file — to be merged into the unified generator. **Known bug**: applies racial stat adjustments regardless of mode; should be Advanced only. |
| `gen-race-adjustments.js` | `RACE_ADJUSTMENTS` (ability score deltas), `RACE_MINIMUMS`. Only caller: `gen-0level-gen.js`. Planned to be merged into `RACIAL_ABILITIES`. Advanced mode only. |
| `shared-class-data-ose.js` | Level-dependent progression data for OSE standard classes (saves, attack bonuses, spell slots). |
| `shared-class-data-gygar.js` | Level-dependent data for Gygar/Smoothified mode (Castle Gygar house rules). |
| `shared-class-data-ll.js` | Level-dependent data for Low-Level mode. |
| `gen-ui.js` | Basic mode UI generation. |
| `shared-race-names.js` | `LEGACY_RACE_NAMES`, `normalizeRaceName()` — normalizes race name variants to canonical `Name_RACE` format. |
| `SRD/CLASSES/` | Verbatim SRD source text for each Basic class (cleric, dwarf, elf, fighter, halfling, magic-user, thief). Reference only. |
| `COPYRIGHTED-*.txt` | Verbatim text from OSE Advanced Fantasy book. **Do not reproduce in code.** Reword all descriptions. SRD text may be used verbatim where it applies. |

---

## Modes and Settings

### Normal vs. Smoothified (Gygar) Mode

- **Normal mode**: Traditional OSE rules. Racial level limits apply. Level 0 characters have a
  -1 attack penalty. Uses OSE saving throw tables.
- **Smoothified/Gygar mode** (Castle Gygar house rules): No racial level limits. No attack penalty
  at level 0. Uses Gygar-specific tables from `shared-class-data-gygar.js`.

### Human Racial Abilities (Optional, Advanced Mode Only)

When the "human racial abilities" checkbox is enabled in Advanced mode, Humans gain:
- **Blessed**: Roll HP twice, take best at each level (does not apply at level 0).
- **Decisiveness**: Act first on tied initiative (+1 individual initiative).
- **Leadership**: Retainers/mercenaries +1 loyalty and morale.

These are suppressed by default and enabled by the `humanOnly: true` flag on those `RACIAL_ABILITIES`
entries (planned; currently handled inline in the UI).

---

## Planned Architecture Changes

See `PLAN_RACE_ABILITIES_AUDIT.md` for the full plan. Summary:

1. **Collapse to two modes**: Basic and Advanced, each supporting levels 0–14. The current
   separate "0-level generator" (`gen-0level-gen.js`) is to be merged into each mode's generator.
2. **Fix racial stat adjustments**: Currently applied unconditionally in `gen-0level-gen.js`.
   Must be gated to Advanced mode only.
3. **Extract `RACIAL_ABILITIES`** from inside `getAdvancedModeRacialAbilities()` to a top-level
   `export const` with the same structured format as `CLASS_ABILITIES`.
4. **Fold `gen-race-adjustments.js`** into `RACIAL_ABILITIES` via `applyOnly: true` entries with
   `abilityModifiers` fields. These entries only apply in Advanced mode.
5. **Replace the three `getDwarfResilienceBonus()` etc. functions** with `saveModifier` fields
   on displayable `RACIAL_ABILITIES` entries.
6. **Merge files**: `shared-class-data-shared.js` + `shared-class-progression.js` +
   `shared-racial-abilities.js` + `gen-race-adjustments.js` → `shared-abilities.js` (data) +
   `shared-generator.js` (logic).
7. **Merge generators**: Basic (0–14) and Advanced (0–14) as two clean paths within one generator.
   - Basic level 0: shows racial abilities; no stat adjustments.
   - Basic level 1+: shows class abilities; racial abilities replaced.
   - Advanced level 0: shows racial abilities; applies stat adjustments.
   - Advanced level 1+: shows both racial abilities and class abilities.

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
  feature. It does not belong in `CLASS_ABILITIES`. It will be defined in `RACIAL_ABILITIES`
  with a `saveModifier` field. It is already mechanically applied via `calculateSavingThrows()`
  in `shared-racial-abilities.js`.
- `CLASS_ABILITIES` entries for the Gnome class use `// BOOK:` comments (not `// SRD:`) because
  the Gnome class is not in the free OSE SRD — it is from OSE Advanced Fantasy.
- Gnome class **requirements**: CON 9 minimum only. DEX and INT are prime requisites (XP bonus),
  not minimums.
- Gnome class **armour**: Leather and shields only (not chain mail or plate).
- All `RACIAL_ABILITIES` use `advancedAvailableAt: 0` except **Blessed** (`availableAt: 1`).
- The Spellblade is a house-rules Advanced mode fighter/magic-user hybrid. It is NOT derived from
  the Basic Elf class. Racial abilities for an Elf Spellblade come from `Elf_RACE`, not the class.
- **Racial ability score adjustments are Advanced mode only.** Never apply `abilityModifiers`
  from `RACIAL_ABILITIES` (or `RACE_ADJUSTMENTS` from `gen-race-adjustments.js`) in Basic mode.
