# OSE Level-0 Character Generator — Project Guide for Claude

This project is an **Old-School Essentials (OSE) character generator**, levels 0–14. Race and
class selection live in a **single unified grid**; there is no longer a hard "Basic vs Advanced"
mode split in the generation mechanics. Understanding the grid, the referee-facing restriction
preset, and the race-as-class vs separate-race-and-class distinction is essential to working on
this codebase correctly.

---

## The Unified Grid

`generator.html` shows **one grid**, always, regardless of any preset:

- **Rows** = races (Human, Dwarf, Elf, Halfling — the SRD/generator-ready races). **Gnome has full
  `CLASS_INFO`/`RACE_INFO` data support (requirements, armour, magic-item level, etc.) but is
  intentionally not given a grid row right now** — this is a deliberate scope decision, not an
  oversight, so don't "fix" it by adding one without checking first.
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
| `cs-sheet-page.js` | `charactersheet.html`'s rendering logic: `expandCompactV3()` (decodes a character's compact params, re-deriving racial adjustments from `mCode` + race on every decode), `buildGeneratorURL()` / `buildCampaignURL()` (reconstruct a `generator.html` link — the latter strips Character-tier settings for the "Back to Generator" link), the level-0→1 "class up" flow. |
| `SRD/CLASSES/` | Verbatim SRD source text for each class (cleric, dwarf, elf, fighter, halfling, magic-user, thief). Reference only. |
| `COPYRIGHTED-*.txt` | Verbatim text from OSE Advanced Fantasy book. **Do not reproduce in code.** Reword all descriptions. SRD text may be used verbatim where it applies. |
| `CAMPAIGN_SETTINGS_CARRYTHROUGH.md` | Checked-in (not gitignored) table of every `generator.html` setting: whether it's written to a character's compact params (`cp`) and whether it's reconstructed into the "Back to Generator" link. **Update this table in the same PR as any change to what `cp` stores or what `buildGeneratorURL()`/`buildCampaignURL()` carry through** — don't let it drift out of sync with the code. |

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
  applied via `applyRacialSaveModifiers()` in `shared-core.js` — called from
  `calculateSavingThrows()` at level 0 and from `createCharacter()` (when given a `race`) at
  level 1+, so the bonus applies at every level regardless of pick type.
- Dwarf, Halfling, and Gnome's Combat ability ("no longbows or two-handed swords") is enforced
  mechanically, not just described: `substituteSmallRaceWeapon()` in `shared-core.js` swaps a
  Longbow for a Short bow and a Two-handed sword for a Sword (the largest equivalent each race
  can actually use) for any of these three races, whenever a background or purchased weapon
  would otherwise be one of the restricted two. Applied both to the level-0 sheet's background
  item display and to `purchaseEquipment()`'s level 1+ background-carry-through path.
- Fighter, Dwarf, Elf, Gnome, Halfling, and Spellblade (`TWO_HANDED_CANDIDATE_CLASSES` in
  `shared-core.js`) default to a Sword + Shield for auto-purchased equipment. Only Human/Elf/
  Drow/Half-Elf-type ("normal-sized") characters get a two-handed option at all: a persisted
  chance (`cp.th`, decided once when the class is first chosen — fresh level 1+ generation or
  the level-up panel's 0→1 class-up step — and carried forward unchanged on further leveling)
  of preferring a literal Two-handed sword and forgoing the shield instead, governed by the
  referee's **Weapon Preference** setting (`cp.wpm` — Random/1/3 chance, Always One-Handed +
  Shield, or Always Two-Handed; see `resolveWantsTwoHanded()`, the single source of truth used
  identically by both call sites). **Dwarf, Halfling, and Gnome have no two-handed option at
  all** — they can use a normal-sized Sword one-handed just fine per their Combat ability, but
  can't wield an actual Two-handed sword, and there's no benefit to using their own Sword
  two-handed just to lose the shield — `resolveWantsTwoHanded()` always returns `false` for
  these three races regardless of the referee's Weapon Preference setting. Separately, an
  optional referee house rule, **Limit Small Races to Short Swords** (`cp.ssw`, a checkbox,
  default off), makes Halfling and Gnome (deliberately *not* Dwarf) default to a Short sword
  instead of a Sword. `purchaseEquipment()` takes `wantsTwoHanded` and `limitSmallRaceShortSword`
  as explicit params rather than deciding either itself, so the choice stays stable across sheet
  re-renders.
- `RANGED_WEAPON_CANDIDATE_CLASSES` (`TWO_HANDED_CANDIDATE_CLASSES` plus Thief) get a ranged
  weapon added to their auto-purchase list — a Long bow normally, or a Short bow for
  Dwarf/Halfling/Gnome (same "no longbows" restriction as their Combat ability). Thief is in this
  set but deliberately **not** in `TWO_HANDED_CANDIDATE_CLASSES`: per the SRD, "Thieves... can use
  any weapon," but they also have no shield at all (Leather armour only), so the
  two-handed-vs-shield preference logic doesn't apply to them — only the ranged purchase does.
  Purchase order between the melee weapon and this ranged weapon depends on ability scores: if DEX
  modifier > STR modifier the ranged weapon is bought first (so a limited-gold character favoring
  ranged still gets a bow even if that means no melee weapon), otherwise melee is bought first as
  before. `purchaseEquipment()` tracks which weapon name was purchased as the *melee* weapon
  separately from the full `weapons` list, since Long bow/Short bow also carry the WEAPONS
  "Two-handed" quality (both hands to draw) — the shield-skip check deliberately only looks at the
  melee weapon, so owning a bow never costs a Sword+Shield character their shield. A purchased
  Long bow/Short bow also comes with a quiver of arrows (`AMMUNITION["Arrows (quiver of 20)"]`,
  5gp, gold permitting).
- `purchaseEquipment()` also recognizes when a carried-through background weapon (`cp.nl0`
  unchecked) is already one this class can use, instead of separately buying a redundant
  duplicate (a Hunter's background Longbow no longer sits next to a freshly-bought Long bow).
  `normalizeBackgroundWeaponName()` reduces the background's display string (e.g. "Longbow (1d6)
  + 10 arrows") to its likely WEAPONS-table key; most background weapons (Stage sword, Rock,
  Walking stick, etc.) are flavor-only civilian items with no WEAPONS entry at all and simply
  won't match. A matched background weapon claims the ranged slot only if this class has one
  (`RANGED_WEAPON_CANDIDATE_CLASSES`) **and** it's a dedicated bow (`DEDICATED_RANGED_WEAPONS` —
  Long bow or Short bow specifically); otherwise, if usable at all, it claims the single
  melee/primary slot — matching how classes without a separate ranged slot (Cleric, Magic-User)
  always worked. Two things this excludes from the ranged slot on purpose:
  - Dagger, Hand axe, and Spear carry both `"Melee"` and `"Missile"` qualities (throwable melee
    weapons, not dedicated ranged ones) — without excluding weapons with `"Melee"`, a
    Jeweller/Butler/Fisher-type background would wrongly let its Dagger/Hand axe/Spear claim the
    ranged slot and leave the character with no actual bow at all.
  - Sling and Crossbow are ranged-only but not "good enough" for a `RANGED_WEAPON_CANDIDATE_CLASSES`
    member (Shepherd/Innkeeper/Navigator/Trader backgrounds) — a Fighter-type still buys its own
    preferred, race-sized bow over a background Sling or Crossbow, which are left unclaimed by
    either slot (shown as a flavor item) rather than treated as satisfying the ranged slot.
  `AMMO_FOR_WEAPON` only needs Long bow/Short bow entries (Arrows) — Crossbow and Sling are never
  claimed via the ranged slot (see above), so they never reach `buyAmmoFor()` at all.
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

---

## Git / PR Workflow

- **Run `scripts/local-review.sh` before pushing, and iterate until it comes back clean.** It
  mirrors `claude-review.yml`'s exact review criteria (same focus areas, same previous-review
  context-carrying) but runs locally in a fresh `claude` context — billed against the Pro/Max
  subscription via OAuth login (no `ANTHROPIC_API_KEY` needed), not the GitHub Action's
  per-token API billing. Defaults to `--model opus`; pass `--model <name>` to override. This is
  now the **primary** review loop — push only once `local-review.sh` has nothing left to flag.
  The GitHub Action's own post-push review is a secondary/backstop check, not where review
  feedback should be first discovered — by the time a push happens, local-review.sh should
  already have caught what it's going to catch. **Commit fixes locally as soon as they're
  verified, independent of whether a push follows immediately** — don't hold a commit hostage
  to "not ready to push yet." A push is a separate, later decision (and often its own
  confirmation); a clean local commit costs nothing to make in the meantime.
- **Update the PR description before committing or pushing — never after.** Order: review the
  diff → `gh pr edit --body-file` to update the PR description → `git commit` → `git push`. This
  repo's `claude-review.yml` triggers on every push and edits its review comment in place within
  seconds, so there is no safe window to push first and fix the description afterward — pushing
  is the trigger, and the description must already be correct when it fires. Getting this order
  wrong has already cost a prior automated review's content (2026-07-09, PR #21) — it is not a
  hypothetical risk.
