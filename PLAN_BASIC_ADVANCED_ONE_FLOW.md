# Plan: Merge All Three Character Creation Flows into One Document

## Goal

Replace `CHARACTER_CREATION_BASIC.md`, `CHARACTER_CREATION_ADVANCED.md`, and
`CHARACTER_CREATION_0LEVEL.md` with a single `CHARACTER_CREATION.md` covering all three
modes — Level 0, Basic Level 1+, and Advanced Level 1+ — in one step sequence.

The document describes the character creation procedure and its options. It does not
reference internal implementation details, UI elements, or variable names.

---

## Why this works

Level 0 and Level 1+ share the same structural spine. Most steps are identical or differ by
one clause. The only genuinely separate structure is the HP section, which becomes a
two-part step: level 0 HP is always rolled first (it drives the background table), and
level 1+ HP is rolled on top of it with an optional floor.

Three modes need callouts throughout: **Level 0**, **Basic**, **Advanced**. Many steps
only need one or two of those labels.

---

## Step-by-step decisions

### Step 0 — Choose Race and/or Class, and Set Options
**Most divergent step — needs all three callouts.** This step happens before rolling so
that race/class requirements and options can inform the ability score minimums in step 1.

> **Level 0:** Choose a race only. No class is chosen yet.
>   - **Basic level 0 demihumans** (Dwarf, Elf, Gnome, Halfling): The race is also the
>     future class. The character's racial abilities are the class's racial abilities —
>     the same entries that will appear on the level 1+ Basic sheet. No separate racial
>     stat modifiers are applied. Ability score requirements are the **class** requirements
>     (e.g. Gnome requires CON 9); these feed into step 1.
>   - **Advanced level 0 demihumans** (Dwarf, Elf, Gnome, Halfling): The race's abilities
>     come from `RACIAL_ABILITIES` for that race. Racial stat modifiers apply. Ability
>     score requirements are the **race** requirements plus the requirements of at least
>     one class available to that race; these feed into step 1.
>
> **Basic:** Choose a class. The class determines race for demihumans. No racial stat
> modifiers are applied.
>
> **Advanced:** Choose a race first. Racial stat modifiers for that race will be
> reflected on the sheet. Then choose a class available to that race. Class availability
> depends on the Race/Class Mode in use (Strict OSE, Strict + Human Abilities,
> Traditional Extended, Allow All).

List available races (Level 0 / Advanced) and classes (Basic / Advanced) under their
callouts. This is the step with the most divergence across all three modes.

Options chosen here that affect later steps:

> - **Race/class minimum ability scores:** some race or class selections require a minimum
>   score in one or more abilities. These are established here and feed into step 1.
> - **HP options:** the HP rolling mode (standard, blessed, healthy, 5e-style) and whether
>   level 0 HP is included in the level 1+ total are chosen here. They affect steps 6–7.
> - **Prime requisite mode:** chosen here; enforced during rolling in step 2.
> - **Race/Class Mode** (Advanced): Strict OSE, Strict + Human Abilities, Traditional
>   Extended, or Allow All. Determines which class/race combinations are available.

### Step 1 — Set Minimum Ability Scores
**Identical across all three modes.** After choosing race/class, the player sets any
additional minimums. A roll that fails any minimum is discarded and re-rolled.

> - **CON minimum:** default 6. May be raised or lowered by the user.
> - **Other ability minimums:** default 3 (i.e. no effective minimum). May be raised
>   individually.
> - The effective minimum for each score is the higher of the user-set minimum and any
>   minimum imposed by the selection in step 0:
>   - **Basic (all levels, including level 0 demihumans):** class requirements only.
>   - **Advanced level 0:** race requirements, combined with the requirements of at least
>     one class available to that race. A roll is valid if it satisfies the race minimums
>     and could qualify for at least one class.
>   - **Advanced level 1+:** both race requirements and the chosen class's requirements
>     must be met.
>   - **Advanced (all levels):** requirements are checked against the **rolled scores**,
>     before racial ability modifiers are applied.
>
> These settings are stored in compact params (`sm`, `prm`) so the referee can verify
> that the character was rolled under the agreed minimums.

### Step 2 — Roll Ability Scores
**Identical across all three modes.** Merge verbatim. Note that sub-par characters may be
re-rolled in all modes (we diverge from the level 0 original rule here, which required
keeping what you rolled).

### Step 3 — Roll Level 0 Hit Points
**All modes — this step always happens.** The level 0 HP roll determines the background
profession table (HP 1–4), so it is relevant even for level 1+ characters. It is also
the character's actual HP if they are level 0.

> Roll 1d4, modified by CON. Minimum 1 HP. No re-rolling 1s or 2s at this step.
>
> **Level 0:** This is the character's HP.
>
> **Level 1+:** This roll is recorded and used to select the background profession table.
> The level 1 HP roll (step 4) will always re-roll if it comes in below this result —
> the OSE advancement rule (keep whichever is higher) is applied unconditionally.

**Blessed (Advanced mode, Human with human racial abilities):** The Blessed ability does
**not** apply at level 0 — the level 0 HP roll is always a single 1d4. Blessed takes effect
from level 1 onward (step 4): roll the class die twice, take the higher result.

### Step 4 — Roll Level 1+ Hit Points
**Level 1+ only.** Level 0 characters skip this step.

> Roll the class hit die, modified by CON. Minimum 1 HP. If the result is lower than the
> level 0 HP from step 3, re-roll until it meets or exceeds it (the higher result is kept).
>
> **Option — include level 0 HP:** When this option is on, the level 0 HP from step 3
> is added to the level 1+ total rather than just serving as a floor. The two rolls
> stack: the character's HP is the sum of both.

HP rolling modes (all apply to the class die roll):
- **Standard:** Roll and keep the result.
- **Blessed:** Roll twice, take the higher (also applies automatically if the character
  has the Blessed racial ability).
- **Healthy:** Treat every die as its maximum value.
- **5e-style:** Take the average die value (rounded up).

### Step 5 — Choose Alignment
**Identical across all three modes.** Lawful, Neutral, or Chaotic. Not mechanically
tracked. Merge verbatim.

### Step 6 — Roll Background

> **Level 0:** Roll on the background table for the character's HP total (from step 3).
> The result determines the character's profession, a starting item, and a starting weapon.
> These are stored in compact params (`bg`, and within `it`/`w`) and displayed by the sheet.
>
> **Level 1+:** The background profession is recorded (`bg`). Equipment purchases and
> starting gold are derived by the sheet renderer from the background, class, race, and DEX
> modifier — no manual purchase step is required.

### Step 7 — Note Level and XP
**Level 0 differs slightly; Basic and Advanced differ by one clause.**

> **Level 0:** Level 0, 0 XP. Attack and saves are fixed (derived by the sheet renderer);
> there is no class progression table.
>
> **Level 1+:** Levels 1–14. XP thresholds come from the class progression table.
> *(Advanced, Strict mode: racial level limits are enforced.)*

### Step 8 — Name Character
**Identical across all three modes.** Name is chosen or generated from race-appropriate
tables. Merge verbatim.

---

## Sections to drop

- **"Key Differences from Basic Method"** table in the Advanced file — redundant.
- **"Key Differences from Level 1+"** table in the Level 0 file — redundant.

## Sections to keep as appendix

- **Advancing to 1st Level** — describes how a level 0 character graduates; still useful
  context even in a unified doc. Move to a brief appendix after the main steps.
- **Funnel Adventures** — likewise; keep as a short appendix section.

---

## House rules table

Single merged table covering all three modes:

| Rule | Book | This Document |
|------|------|---------------|
| Ascending AC | Optional | AAC always used internally; display mode selectable via `adm` (ascending-only, descending+matrix, dual, dual+matrix) — stored in compact params, rendered by the sheet |
| Must keep HP rolls at level 0 | Yes (L0 original) | Followed — no re-roll at step 3 |
| Re-rolling 1s/2s on HP | Optional (L1+) | Selectable HP mode at step 4 |
| Sub-par re-rolling | Forbidden (L0) / Optional (L1+) | Allowed in all modes |
| Multiple classes | Optional | Not used |
| Secondary skills | Optional | Background profession rolled at step 6; starting item and weapon derived by sheet renderer at L1+ |
| Alignment tracking | Required | Not tracked |
| Spellblade | Not in book | Available (human in Basic; human/elf in Advanced) |
| Human racial abilities | Not in book | Advanced only, optional |
| Gygar/Smoothified mode | Not in book | Removes level 0 attack penalty |

---

## Compact Code Coverage

Every completed character is fully represented by a compact params object (`cp`), which is
gzip-compressed and base64url-encoded into the `?d=` URL parameter of the character sheet
page. The merged CHARACTER_CREATION.md should note that any character can be shared as a
URL that reconstructs its sheet exactly.

### Step-by-step mapping to compact fields

| Step | Data | Compact fields |
|------|------|----------------|
| 0. Choose Race/Class + Options | Mode, progression, race, class, HP options | `m`, `p`, `r`, `c`, `hm`, `il`, `rcm`, `dl`, `prm` |
| 1. Set Minimums | Score minimums | `sm` |
| 2. Roll Ability Scores | Rolled scores, roll attempts | `s`, `rr` |
| *(sheet)* Modifiers | Racial adj derived from `r`; post-gen adj | `sa` (omitted if all zero) |
| *(sheet)* Attacks/Saves (L0) | Fully derivable from `m`, `p`, `r`, `s`, `sa` | *(derived)* |
| *(sheet)* Attacks/Saves (L1+) | Computed from class/level/mode | *(derived)* |
| *(sheet)* Abilities | Computed from class/race data | *(derived)* |
| 3. Roll Level 0 HP | L0 die roll and result | `hr[0]`, `hd[0]` (always 4) |
| 4. Roll Level 1+ HP | Per-level rolls, die sizes, total, mode, L0 flag | `hr[1…n]`, `hd[1…n]`, `h`, `hm`, `il` |
| 5. Alignment | Not tracked | *(not stored — intentional)* |
| 6. Roll Background | Profession, background item and weapon | `bg`, within `it`/`w` |
| *(sheet)* Languages | Computed from race/class data | *(derived)* |
| *(sheet)* Equipment | Always derived from class, bg, DEX, gold | *(derived — not stored)* |
| *(sheet)* Armour Class | Always derived from equipment | *(derived — not stored)* |
| 7. Level/XP | Level; XP computed from level | `l` |
| 7. Options | Wealth % | `wp` |
| 8. Name | Character name | `n` |
| Display options | Undead names, QR code, ability order, AC mode | `un`, `qr`, `ao`, `adm` |

### Proposed changes to compact params

**Remove `sv` — Level 0 saves are fully derivable**

Level 0 saves are always Death 14, Wands 15, Paralysis 16, Breath 17, Spells 18. The only
variation is the Resilience save bonus for Dwarf and Halfling, which is computed from race
(`r`) and CON score (`s[2]`). Progression mode (`p`) determines whether the attack penalty
applies. All of this is already in the compact params. The `sv` field should be dropped and
the sheet page should derive saves from `l=0`, `p`, `r`, and `s`.

**Remove `ap` — Auto-print is a session action, not a character property**

Auto-print triggers the browser print dialog when the sheet page loads. It is a one-time
transient action, not a property of the character. Baking it into the shareable character
URL means anyone who opens a shared link gets an unexpected print dialog. It should be
a separate URL parameter on the sheet page (`?print=1`) that is never written into the
compact character data.

**Keep `rr` — Roll attempts is referee-verifiable character provenance**

The number of roll attempts is part of the character's creation record. A referee may require
that players keep the first valid roll (no sub-par rerolling), in which case `rr > 1` is
evidence the player did not comply. It also feeds into the generator link-back: the regeneration
URL can pre-set any limits that were in effect. Keep in compact params.

**Keep `sm` — Score minimums are a verifiable generation constraint**

The minimums used during generation let a referee confirm that the character was created under
the table's agreed minimums. They also drive the generator link-back: when a player returns to
the generator from their sheet, the same minimums are pre-filled so additional characters can be
rolled under the same rules. Keep in compact params.

**Restructure ability score storage — `s` is the rolled record, racial is derived, `sa` holds post-gen edits**

In v2, `s` stores the adjusted scores and `bs` stores the pre-racial scores. This is
backwards: the adjusted scores are always derivable (racial modifiers come from `r`), but
the original rolled scores must be stored — they are the referee-verifiable record of
what the dice produced.

In v3:
- `s` always stores the rolled scores, exactly as the dice came up. Never modified.
- Racial adjustments are derived at render time from `r`. No storage needed.
- `sa` (number[6], omitted if all zero) stores any adjustments that happen after
  generation — manual edits, level-up bonuses, etc.
- Displayed score for each ability = `s[i]` + racial_adj_from_r[i] + `sa[i]`

`bs` is retired. The v2→v3 upgrade recasts `bs` as the new `s`:
if `bs` is present, `s` ← `bs`; drop `bs`. If `bs` is absent, `s` was already the
rolled scores (no racial modifiers were stored). `sa` is omitted on upgrade.

**Keep `qr` and `un` in compact params**

Display options travel with the character URL. When a player shares their sheet or returns
to update or print it, their display preferences should still be in effect — they should not
have to reselect them. `qr` and `un` stay in compact params.

**Unify `bl` and `rcm` across all modes**

In Basic mode, `bl` (0/1) encodes whether human racial abilities are active. In Advanced
mode, `rcm` encodes this as part of `SH` (Strict + Human Abilities). These cover overlapping
ground. A single `rcm` field for all modes eliminates the duplication: `bl` is retired and
`rcm` applies to Basic, Advanced, and Level 0. Basic strict = `ST`, Basic + human abilities =
`SH`. Level 0 uses the same two values.

**Equipment is always derived — `ar`, `sh`, `w`, `it`, `ac`, and `de` removed**

Equipment is always derived at render time from `c`, `g`, `s`, `bg`, and `p`. The stored
arrays `ar`, `sh`, `w`, `it`, and `ac` are removed entirely from v3 — they served a
starting-character snapshot purpose that is now handled by derivation. Starting gold (`g`)
is kept because it is a generation-time input (rolled as 3d6 × 10 gp at level 1, or
scaled from XP at level 2+) that the derivation logic requires. After one session players
will have different equipment anyway, so there is no value in persisting the generated kit
beyond using it as the sheet's initial display. The `de` flag is therefore unnecessary —
there is no "stored mode" to toggle off.

### Fields missing from the compact params reference

The following fields are currently emitted but absent from the `COMPACT PARAMS v2 — FIELD
REFERENCE` comment block in `cs-core.js`. Whether they are removed (per above) or kept,
they should first be documented:

| Field | Used for |
|-------|----------|
| `sv`  | Level 0 fixed saving throw values — proposed for removal (derivable) |
| `dl`  | Basic mode demihuman level limits: `0`=standard, `1`=extended to level 14 |
| `rr`  | Roll attempts — kept; referee verification and generator link-back |
| `sm`  | Score minimums — kept; referee verification and generator link-back |
| `ao`  | Ability score display order: `1`=OSE/Basic, `0`=modern |
| `adm` | AC display mode: `1`=descending+matrix, `2`=dual, `3`=dual+matrix (omitted = ascending) |

### Generation options not in compact params (existing)

These already live outside compact params and are intentionally omitted — the resulting
sheet reflects their effect without needing to store them:

- `wealthRollAsLevel1` — whether any level was treated as level 1 for starting gold
- `noLevel0Equipment` — whether background item/weapon was suppressed from the starting kit

---

## Compact Params v3 (target for generator rewrite)

v3 removes derivable fields and session actions, unifies overlapping fields, and adds
equipment derivation. Generation constraints (`rr`, `sm`) and display preferences (`qr`,
`un`) are kept — they travel with the character URL so the player does not need to
reselect settings. The version field bumps to `v:3`.

### Fields removed from v2

| Field | Reason |
|-------|--------|
| `sv`  | Level 0 saves derive from `m`, `p`, `r`, `s`, `sa` — no need to store |
| `ap`  | Session action (print dialog trigger), not a character property |
| `bl`  | Unified into `rcm` (see below) |
| `bs`  | Retired — `s` now stores the rolled scores; racial adjustments derived from `r` |
| `ar`  | Equipment always derived at render time — stored snapshot not needed |
| `sh`  | Equipment always derived at render time — stored snapshot not needed |
| `w`   | Equipment always derived at render time — stored snapshot not needed |
| `it`  | Equipment always derived at render time — stored snapshot not needed |
| `ac`  | Equipment always derived at render time — stored snapshot not needed |
| `de`  | Redundant — equipment is always derived; there is no "stored mode" to toggle |

### Fields whose status changes

| Field | v2 | v3 |
|-------|----|----|
| `s`   | Adjusted scores (post-racial) | Rolled scores — the immutable dice record |
| `bs`  | Base scores before racial adj | Retired — upgrade: `s` ← `bs` if present |
| `bl` + `rcm` | Two separate fields | Unified into `rcm`. Applies to all modes. `bl` retired. |
| `ar`, `sh`, `w`, `it`, `ac` | Always stored | Removed — equipment always derived from `c`, `g`, `s`, `sa`, `bg`, `p` |

### Fields added in v3

| Field | Description |
|-------|-------------|
| `sa`  | `number[6]` — score adjustments after generation [STR,DEX,CON,INT,WIS,CHA] as signed deltas. Omitted if all zero. Displayed score = `s[i]` + racial_adj_from_r[i] + `sa[i]`. |

### Fields carried forward unchanged

`v` (now `3`), `m`, `p`, `r`, `c`, `l`, `n`, `bg`, `s` (redefined), `rr`, `sm`, `h`, `hr`,
`hd`, `il`, `hm`, `g`, `rcm` (unified), `dl`, `wp`, `prm`, `un`, `qr`, `ao`, `adm`,
`hhr`, `mx`

### Conversion path: v2 → v3

When the sheet page encounters `v:2`, it runs this upgrade before rendering:

1. **Recast scores** — if `bs` is present, `s` ← `bs`; drop `bs`. If `bs` is absent, `s`
   is already the rolled scores (no racial modifier was stored). `sa` is omitted.
2. **Drop `sv`** — recompute saves from `l=0`, `p`, `r`, `s`, `sa` at render time.
3. **Drop `ap`** — ignore; never trigger auto-print from a v2 URL during upgrade.
4. **Translate `bl` → `rcm`** — if `rcm` is absent, set `rcm = bl ? 'SH' : 'ST'`; then
   drop `bl`. (Applies to all modes — `bl` was written for Basic and L0 in v2.)
5. **Drop equipment arrays** — drop `ar`, `sh`, `w`, `it`, `ac` if present. Equipment is
   re-derived from `c`, `g`, `s`, `bg`, `p` at render time. `g` is kept as the gold input.
6. Set `v = 3`.

The upgrade discards `ap` (session action) and the stored equipment snapshot (`ar`, `sh`,
`w`, `it`, `ac`). All other data is restructured losslessly. The equipment discarded was
a generation-time snapshot; v3 re-derives it from the same inputs, so no meaningful
character data is lost.

---

## Compact Params v3 — Full Schema

```
Field   Type          Scope            Description
──────  ────────────  ───────────────  ─────────────────────────────────────────────────
v       number        all              Schema version (always 3)
m       'A'|'B'       all              Mode: A=Advanced, B=Basic
                                       Level 0 uses A or B with l=0

── Character identity ──────────────────────────────────────────────────────────────────
p       'O'|'S'|'L'   all              Progression mode: O=OSE Standard, S=Smoothified,
                                       L=Labyrinth Lord
r       2-char code   Adv, L0          Race code: HU DW EL HA GN
c       2-char code   Basic, Adv L1+   Class code: FI CL MU TH SB DW EL HA GN
l       number        all              Level (0–14)
n       string        all              Character name
bg      string|code   all              Background profession (lookup-table compressed)

── Ability scores ──────────────────────────────────────────────────────────────────────
s       number[6]     all              Rolled scores — the immutable dice record
                                       [STR,DEX,CON,INT,WIS,CHA]. Never modified after
                                       generation. Racial adjustments are derived from r.
sa      number[6]     all, omit if 0   Post-generation score adjustments as signed deltas
                                       [STR,DEX,CON,INT,WIS,CHA]. Omitted if all zero.
                                       Displayed score = s[i] + racial_adj(r)[i] + sa[i]
sm      number[6]     Adv, L0          Score minimums used during generation
                                       [STR,DEX,CON,INT,WIS,CHA] — CON default 6,
                                       others default 3. Referee verification and
                                       generator link-back. Not written for Basic L1+.
rr      number        Adv, L0          Roll attempts before a valid character was produced.
                                       Referee verification. Not written for Basic L1+.

── Hit points ──────────────────────────────────────────────────────────────────────────
h       number        all              Max HP (total, respects il flag)
hr      number[]      all              HP roll per entry — index 0 is always the L0
                                       background roll. hr[1]=L1 HP, hr[2]=L2 HP, etc.
hd      number[]      all              Die sides per entry (matches hr[]). hd[0]=4.
il      0|1           L1+              includeLevel0HP — if 1, hr[0] is added to h;
                                       if 0, hr[0] sets the floor for hr[1]
hm      0|1|2|3       L1+              HP rolling mode: omit/0=normal, 1=blessed (roll
                                       twice take best), 2=5e (average rounded up),
                                       3=healthy (every die treated as maximum)

── Equipment ───────────────────────────────────────────────────────────────────────────
g       number        all              Starting gold (generation-time input for equipment
                                       derivation). At level 1: rolled as 3d6×10 gp.
                                       At level 2+: scaled from XP-for-level × wp%.
                                       Equipment (armor, weapons, items, AC) is always
                                       derived at render time from c, g, s, bg, p.
                                       No equipment arrays are stored in v3.

── Generation options ───────────────────────────────────────────────────────────────────
rcm     2-char code   all              Race/class mode — applies to ALL modes:
                                         ST=strict OSE
                                         SH=strict + human racial abilities
                                         TE=traditional extended
                                         AL=allow all
                                       (replaces v2 bl; L0 uses ST or SH only)
dl      0|1           Basic            Demihuman level limits: 0=standard OSE,
                                       1=extended to level 14
wp      number        L1+              wealthPct — starting gold % of XP-for-level for
                                       level 2+ chars (0–100)
prm     0|9|13        all              primeRequisiteMode: 0=user choice, 9=require ≥9,
                                       13=require ≥13

── Display preferences ──────────────────────────────────────────────────────────────────
un      0|1           all              showUndeadNames — show monster names in Turn Undead
qr      0|1           all              showQRCode — show QR code on page 2
ao      0|1           all              abilityOrder: 0=modern (STR DEX CON INT WIS CHA),
                                       1=OSE/Basic (STR INT WIS DEX CON CHA)
adm     1|2|3         all              acDisplayMode: omit=ascending only,
                                       1=descending+attack matrix, 2=dual (AAC+DAC),
                                       3=dual+attack matrix
hhr     0|1           Adv L1+          Hide Human race label in race/class display —
                                       shows class name only ("Fighter" not "Human Fighter")
mx      0|1           all              Modified flag — set when character is edited inline;
                                       prepends "Modified " to footer identity line
```

Fields removed from v2: `sv`, `ap`, `bl`, `bs`, `ar`, `sh`, `w`, `it`, `ac`
Fields added in v3: `sa`
`s` redefined: was adjusted scores, now rolled scores (immutable dice record)
`de` not added: equipment is always derived; no toggle needed

## Character Sheet Generation

The character sheet is rendered entirely from the compact params object. The generator
writes the stored inputs (`s`, `r`, `c`, `l`, `p`, `h`, `hr`, `hd`, etc.) and the sheet
renderer derives everything else at render time. No interactive step is required — the
player never fills in these fields manually. The entry point is `expandCompactV2()` in
`cs-sheet-page.js`, which builds a normalised sheet object passed to
`renderCharacterSheetHTML()` in `cs-core.js`.

The sections below follow the layout of the rendered sheet.

---

### Header

Built from stored compact params directly. No computation required.

| Field | Source |
|-------|--------|
| Character name | `cp.n` |
| Occupation / background | `cp.bg` (decoded from lookup table) |
| Race/Class display | Derived from `cp.r` + `cp.c`; see logic below |
| Level | `cp.l` |
| Hit die | Derived from class: e.g. `1d8` for Fighter |
| XP bonus | Derived from prime requisite scores and class prime requisites |

**Race/Class display logic:**
- **Basic L1+:** class name only (e.g. `Dwarf`). `raceDisplay = clsDisplay`.
- **Advanced L1+:** `"<race> <class>"` (e.g. `Elf Fighter`), except:
  - If `cp.hhr` is set and race is Human, shows class name only.
  - If race and class names are the same (e.g. a hypothetical identity match), shows once.
- **Level 0:** Race/Class column is left blank — no class has been chosen.

**XP bonus:** The lowest XP bonus among all prime requisite scores wins. If the class
has no prime requisites (e.g. Gnome's are XP influencers, not class minimum requirements),
bonus is 0. Thresholds: ≤5 → −20%, ≤8 → −10%, ≤12 → 0%, ≤15 → +5%, 16+ → +10%.

---

### Ability Scores

**Source:** `expandCompactV2` → `getModifierEffects()` in `cs-core.js`.

For each ability (STR, DEX, CON, INT, WIS, CHA):

1. **Rolled score** (`s[i]`) — the immutable dice record, never modified after generation.
2. **Racial adjustment** — derived at render time from `r` via
   `getRaceInfo(race).abilityModifiers`. Never stored; always re-derived.
3. **Post-generation adjustment** (`sa[i]`) — signed delta from manual edits or
   level-up bonuses. Stored; omitted if all zero.
4. **Displayed score** = `s[i]` + racial_adj(`r`)[i] + `sa[i]`.
5. If the displayed score differs from the rolled score, the rolled score is shown
   with strikethrough next to the adjusted score.
6. **Effects** string — computed by `getModifierEffects(ability, modifier, score)`:
   - STR: melee attack/damage bonus, open doors chance
   - DEX: AC modifier, ranged attack bonus, initiative modifier
   - CON: HP per level modifier
   - INT: languages known, literacy
   - WIS: magic saving throw modifier
   - CHA: NPC reaction modifier, max retainers, retainer loyalty

**Mode rules:**
- **Basic (all levels):** no racial adjustments. `s[i]` is the displayed score.
- **Advanced (all levels):** racial adjustments derived from `r` and applied at render
  time. Requirements (step 1) are checked against `s[i]` before racial adj.

**Display order:** Controlled by `cp.ao`:
- `ao = 1` (default): OSE/Basic order — STR, INT, WIS, DEX, CON, CHA
- `ao = 0`: Modern order — STR, DEX, CON, INT, WIS, CHA

---

### Combat Box

| Field | Source |
|-------|--------|
| Max HP | `cp.h` — stored after generation |
| Current HP | Blank (filled in by player) |
| Initiative modifier | DEX modifier, derived at render time |
| AC | Blank (filled in by player from armour section) |

---

### Attack Values and Saving Throws

**Source:** Level 0 uses fixed values; level 1+ reads from `createCharacter()` →
class progression tables selected by `cp.p`.

#### Level 0 (both Basic and Advanced)

| Value | Source |
|-------|--------|
| Attack bonus | −1 (OSE Standard `p=O`) or 0 (Smoothified `p=S`) |
| THAC0 | `19 − attackBonus` |
| Death save | 14 (fixed) |
| Wands save | 15 (fixed) |
| Paralysis save | 16 (fixed) |
| Breath save | 17 (fixed) |
| Spells save | 18 (fixed) |
| Melee modifier | STR modifier, derived from displayed score |
| Ranged modifier | DEX modifier, derived from displayed score |

Dwarf and Halfling CON-based Resilience bonuses are applied on top of the fixed saves
via `calculateSavingThrows()` in `shared-racial-abilities.js`.

In v2 compact params, `sv` stores the five base save values. In v3, `sv` is removed and
saves are re-derived from `l=0`, `p`, `r`, and `s` at render time.

#### Level 1+ (both Basic and Advanced)

Attack bonus and saves come from the class progression table for mode `cp.p`:

| `cp.p` | Progression table |
|--------|-------------------|
| `O` (OSE Standard) | `shared-class-data-ose.js` |
| `S` (Smoothified / Gygar) | `shared-class-data-gygar.js` |
| `L` (Labyrinth Lord) | `shared-class-data-ll.js` |

Dwarf and Halfling Resilience bonuses are applied on top of class saves by
`calculateSavingThrows()`.

AC display mode (`cp.adm`) controls how THAC0 and attack bonus are presented:
- Omitted / `0`: ascending AC only — shows class attack bonus and THAC0 in parentheses
- `1`: descending AC + attack matrix
- `2`: dual — both AAC and DAC shown
- `3`: dual + attack matrix

---

### Weapons, Armor, and Skills

**Source:** All derived from `cp.c`, `cp.bg`, `cp.g`, `cp.s`, `cp.p` plus class data.
No weapon or armor fields are stored in v3 compact params.

| Field | Source |
|-------|--------|
| Weapons (up to 3 slots) | Derived from class permitted weapons, gold, and DEX modifier |
| Background weapon | Derived from `cp.bg` background profession table |
| Armor | Derived from class permitted armor and gold; "Unarmored" suppressed in display |
| Shield | Derived from class permissions and gold |
| Helmet | Derived from class permissions and gold |
| Class attack bonus | Derived from class/level via progression table |
| Melee modifier | STR modifier |
| Ranged modifier | DEX modifier |
| Thief skills | Derived from class/level for Thief and Acrobat |

---

### Abilities Section

**Source:** `getBasicModeClassAbilities()` (Basic), `getAdvancedModeRacialAbilities()`
and `getClassFeatures()` (Advanced), all filtered to the character's current level.

#### Level 0 — abilities shown

No class has been chosen; only racial (or race-as-class) abilities are shown.

- **Basic level 0 demihumans:** `getBasicModeClassAbilities(cls)` returns entries with
  `basicAvailableAt: 0`. These are the same entries that appear at level 1 on the Basic
  sheet — the class's racial ability package.
- **Basic level 0 humans:** No racial abilities. The section is empty at level 0.
- **Advanced level 0:** `getAdvancedModeRacialAbilities(race)` returns racial ability
  strings for the chosen race at `advancedAvailableAt: 0`.

Section header at level 0: `RACIAL ABILITIES` (for all modes/races).

#### Level 1+ — abilities shown

| Mode | Racial abilities | Class abilities |
|------|-----------------|-----------------|
| **Basic** | `getBasicModeClassAbilities(cls)` — entries with `basicMode: true` or unset, filtered to current level. For demihumans, this IS the full racial/class package. | `getClassFeatures()` — class entries for current level, filtered by `basicMode: false` entries excluded. |
| **Advanced** | `getAdvancedModeRacialAbilities(race, { isAdvanced: true, humanRacialAbilities })` | `getClassFeatures()` — class entries for current level, with `raceOverrides` merged for the character's race where applicable. |

**Languages** are derived at render time and displayed within the abilities section — see
the Languages subsection below.

**Section header logic** (derived at render time):
- Both racial and class entries present → `RACIAL & CLASS ABILITIES`
- Racial entries only, Basic demihuman → `CLASS ABILITIES` (race-as-class; class IS the package)
- Racial entries only, non-demihuman → `RACIAL ABILITIES`
- Class entries only → `CLASS ABILITIES`

**Human racial abilities (optional, Advanced mode):** When `rcm = 'SH'` in Advanced
(or `cp.bl = 1` in Basic v2), the following are appended to the class abilities list:
- **Blessed:** Roll HP twice, take best at each level (level 1+; does not affect L0 HP roll)
- **Decisiveness:** Act first on tied initiative (+1 individual initiative)
- **Leadership:** Retainers and mercenaries gain +1 loyalty and morale

---

### Languages

Languages are derived at render time from race and class data. No language data is stored
in compact params — the full list is always re-derived.

| Mode | Source |
|------|--------|
| **Basic (all levels)** | Languages come from the class ability entries in `CLASS_ABILITIES`. Displayed as part of the class abilities list. |
| **Advanced and Level 0** | Languages come from the racial ability entries in `RACIAL_ABILITIES`. Any `Languages` entries in the class abilities list are merged in via `mergeAdvancedLanguages()`: the two lists are combined, sorted alphabetically, deduplicated, and the class-side entry is removed. The merged result appears once, in the racial abilities section. |

Additional languages from high INT (Native + 1, + 2, + 3) are part of the base racial
or class language string and do not require separate computation — the description already
encodes the INT threshold.

---

### Spell Slots

Shown only when the class has spells at the current level. Derived from the class
progression table for mode `cp.p`. Displayed as a grid of spell level → slot count,
suppressing levels with 0 slots.

Classes with spell slots: Cleric, Magic-User, Elf (Basic), Gnome (Basic), Illusionist,
Druid, Bard (Advanced). Spellblade gains MU spell slots at higher levels.

---

### Turn Undead

Shown only for Cleric (and Paladin in Advanced). Values are derived from the class
progression table. Display controlled by `cp.un`:
- `un = 0` (default): undead types shown by HD (e.g. `1HD`, `2HD`)
- `un = 1`: monster names shown (e.g. `Skeleton`, `Zombie`)

---

### Equipment

Equipment is derived at render time from the character's class, background, and DEX
modifier. It is not an interactive purchase step — the sheet purchases on behalf of
the character using the stored inputs.

**Derivation inputs:**
- `cp.c` — class determines what armor and weapons are permitted and preferred
- `cp.bg` — background profession determines the starting item and weapon
- `cp.s[1]` + racial adj — DEX modifier affects ranged weapon preference
- `cp.p` — progression mode (affects available equipment in some cases)
- `cp.g` — starting gold (3d6 × 10 at level 1; scaled from XP at level 2+)

In v3, no equipment arrays are stored. The sheet always re-derives the full kit from the
inputs above. Starting gold (`cp.g`) is the only equipment-related field in compact params.

Items are split at render time for display:
- **Weapons/Armor/Skills box (page 1):** weapons permitted and preferred for the class,
  plus the background weapon. Armor, shield, and helmet derived from class and gold.
- **Items column (page 2):** standard dungeoneering kit and class-specific items
  (holy symbol, thieves' tools, spell book, etc.), plus the background item.

Starting gold (`cp.g`) is shown in the page 1 footer.

---

### Armour Class

AC is derived at render time from the equipped armor and shield. It is never an
interactive player step.

| Component | Value |
|-----------|-------|
| Base AC | Determined by `cp.ar`: Plate mail = 7, Chain mail = 5, Leather = 7, Unarmored = 10 |
| Shield bonus | −1 AC (ascending = +1) if `cp.sh = 1` |
| DEX modifier | Applied to base AC (ascending: positive DEX mod raises AC) |

Starting AC is derived at render time from the derived armor and shield — it is not stored
in compact params. The current AC box on the sheet is left blank for the player to fill in,
since AC can change during play.

`cp.adm` controls how AC is presented (ascending-only, descending+matrix, dual, or
dual+matrix) — see the Attack Values and Saving Throws section.

---

### Experience

Shown at level 1+. All values are derived from class progression table and level:

| Field | Source |
|-------|--------|
| Current XP | XP floor for current level (from progression table) |
| XP for current level | Progression table entry for `cp.l` |
| XP for next level | Progression table entry for `cp.l + 1` (blank at max level) |
| XP bonus | Derived from prime requisite scores (same as header) |

Level 0 characters show no XP section (level 0 = 0 XP, no class progression table).

---

### Footer and Print Metadata

The footer identity line is built at render time:
- **Level 0:** `"0-Level <Race>"` (e.g. `0-Level Dwarf`)
- **Basic L1+:** `"Level <N> <ClassName>"` (e.g. `Level 3 Elf`)
- **Advanced L1+:** `"Level <N> <Race> <Class>"` (e.g. `Level 5 Elf Fighter`)

When `cp.mx = 1` (character was modified inline), the word `"Modified "` is prepended.

The options summary line below the identity line is built by `buildOptionsLine(cp)`,
showing progression mode, race/class mode, HP mode, score minimums, roll count, etc.

The page 1 footer also shows starting AC, starting HD, starting gold, and the HP-per-level
roll record (`hr`) with CON modifier noted.

The `printTitle` field (used as the browser tab title and PDF filename suggestion) follows
the pattern: `"OSE [Advanced|Basic] - <Race> - <Class> - Level <N> - <bg> - <name>"`.

---

### QR Code

When `cp.qr ≠ 0`, a QR code is generated and shown on page 2. It encodes the shareable
character URL (the `?d=` URL for the sheet page). When `cp.ap` is set on the current
page, the QR URL is re-encoded with `ap: 0` so scanning the code does not trigger
auto-print on the recipient's device.

---

## Implementation Plan

### Current file inventory

| File | Lines | Role |
|------|-------|------|
| `shared-core.js` | 3057 | All shared data and logic: ability scores, `CLASS_INFO`, `RACE_INFO`, progression tables, saving throws, attack bonuses, class/racial features, HP rolling, `createCharacter()`, compact code helpers |
| `gen-core.js` | 624 | Gen-only logic: DOM helpers, equipment purchasing, name tables, background tables, `generateCharacter()` |
| `gen-ui.js` | ~900 | UI: event handlers, form reading, calls generator, calls sheet renderer |
| `cs-core.js` | 1235 | Sheet-only: URL codec, compact params codec, HTML renderer, edit panel |
| `cs-sheet-page.js` | 921 | Sheet page controller: `expandCompactV2()`, `initEditPanel()`, `renderFromCompactParams()`, `initCharacterSheet()` |

---

### Functions and data to move: gen-core.js → shared-core.js

The sheet renderer needs to derive equipment at render time. The data and logic for that
currently live in `gen-core.js` and are invisible to the sheet. Move these:

| Item | Current location | Move to | Reason |
|------|-----------------|---------|--------|
| `DUNGEONEERING_BUNDLE` | `gen-core.js` | `shared-core.js` | Sheet derives starting items |
| `CLASS_SPECIFIC_GEAR` | `gen-core.js` | `shared-core.js` | Sheet derives class gear |
| `WEAPON_PRIORITY` | `gen-core.js` | `shared-core.js` | Sheet derives weapon selection |
| `ARMOR_PRIORITY` | `gen-core.js` | `shared-core.js` | Sheet derives armor selection |
| `purchaseEquipment()` | `gen-core.js` | `shared-core.js` | Sheet calls this at render time |
| `backgroundTables` | `gen-core.js` | `shared-core.js` | Sheet needs background item/weapon for derivation |
| `getRandomBackground()` | `gen-core.js` | `shared-core.js` | Generator still uses it; sheet may need it |
| `getBackgroundByProfession()` | `gen-core.js` | `shared-core.js` | Sheet looks up bg entry from stored `bg` string |
| `getBackgroundTable()`, `getAllBackgroundTables()`, `getBackgroundByIndex()` | `gen-core.js` | `shared-core.js` | Keep co-located with the tables |
| `getClassRequirements()` | `gen-core.js` | `shared-core.js` | Needed in requirements checking |
| `getDemihumanLimits()` | `gen-core.js` | `shared-core.js` | Needed in class availability logic |

**Keep in gen-core.js** (not needed by sheet renderer):
- `readAbilityScores()` — DOM helper
- Name tables and `getRandomName()`, `getNameTable()`, `getAvailableRaces()` — generator-only

---

### Replace: generateCharacter()

The existing `generateCharacter()` in `gen-core.js` returns a legacy character object.
Replace it with a new function `generateCharacterV3(opts)` that returns a **v3 compact
params object** directly. The old function is deleted; nothing should call the legacy
shape after the rewrite.

**What the new function does differently:**

| Behaviour | Old `generateCharacter()` | New `generateCharacterV3()` |
|-----------|--------------------------|------------------------------|
| Return value | Legacy character object | v3 compact params object |
| Racial stat modifiers | Applied and stored as adjusted scores | Never applied; `s` stores rolled scores only |
| Requirements check | Post-racial scores used for class reqs (bug) | Pre-racial (rolled) scores used for all requirements |
| Advanced L0 class viability | Not checked | Rolled scores must qualify for at least one available class |
| Blessed at L0 | Applied if human + humanRacialAbilities (bug) | Never applied at L0 — always single 1d4 |
| Equipment output | Returns `equipment` object with stored arrays | Returns only `g` (starting gold); equipment derived by sheet |
| Saving throws stored | Returns full saves object | Not stored — derived by sheet from `l`, `p`, `r`, `s` |
| `bs` / `s` duality | Separate `baseScores` and `abilityScores` | `s` = rolled scores only; racial adj re-derived from `r` |

**New function signature:**
```js
// Returns a v3 compact params object ready for encodeCompactParams() + compressToBase64Url()
export function generateCharacterV3(opts = {}) {
    // opts: { mode, level, race, className, progressionMode, raceClassMode,
    //         minimums, primeReqMode, hpMode, includeLevel0HP,
    //         fixedScores, fixedName, fixedOccupation, fixedStartingGold, wealthPct }
}
```

The existing `rollAbilitiesAdvanced()` helper in `gen-ui.js` and `createCharacterAdvanced()`
wrapper are both absorbed into `generateCharacterV3()` and deleted.

---

### Fix: ability score requirements checked pre-racial

Currently `generateCharacter()` checks class requirements against `adjMap` (post-racial
scores). The plan requires checking against rolled scores. In `generateCharacterV3()`:

1. Roll raw scores (3d6 each).
2. Check racial minimums against raw scores.
3. Check class requirements against raw scores.
4. Check user minimums against raw scores.
5. Check at least one available class is viable (Advanced L0 only) against raw scores.
6. If all pass, store raw scores as `s`. Racial adjustments are never applied or stored.

---

### Fix: Blessed does not apply at level 0

In `gen-core.js`, `calcLevel0HP()` currently applies Blessed when
`race === 'Human_RACE' && isAdvanced && humanRacialAbilities`. Per the plan, Blessed never
applies at level 0 — the L0 roll is always a single 1d4 (modified by CON, min 1).
Remove the Blessed branch from the L0 HP calculation. `hpMode === 1` (everyone-blessed
option) also does not apply at L0.

---

### Update: expandCompactV2 → expandCompactV3

`expandCompactV2()` in `cs-sheet-page.js` needs to be updated or replaced to handle v3:

| Change | Detail |
|--------|--------|
| Score handling | `s` is now rolled scores. Racial adj derived from `r`. No `bs`. |
| Equipment derivation | Call `purchaseEquipment()` (moved to shared) using `c`, `g`, `s`+racial_adj, `bg`, `p`. Remove all reads of `ar`, `sh`, `w`, `it`, `ac`. |
| Background item/weapon | Call `getBackgroundByProfession(cp.bg)` (moved to shared) to get background item/weapon for display. |
| Saves at L0 | Remove `cp.sv` read. Derive fixed saves from `l=0`, `p`, `r`, `s`. |
| v2 upgrade path | Run v2→v3 migration (recast scores, drop `sv`/`ap`/`bl`/`bs`/`ar`/`sh`/`w`/`it`/`ac`) when `cp.v === 2` before rendering. |

Rename to `expandCompactV3()` and keep a thin `expandCompactV2()` shim that upgrades
then delegates — or inline the upgrade into the main function.

---

### Update: gen-ui.js

After `generateCharacterV3()` returns a v3 compact params object:

1. Encode it with `encodeCompactParams()` + `compressToBase64Url()`.
2. Pass the decoded object to `expandCompactV3()` to get the sheet spec.
3. Pass the sheet spec to `displayCharacterSheet()`.

The UI no longer needs to compute equipment, saving throws, attack bonus, or abilities —
all of that is handled by the sheet renderer. Remove the corresponding dead code from
`gen-ui.js` after the generator is replaced.

---

### Update: buildGeneratorURL

`buildGeneratorURL()` in `cs-sheet-page.js` reconstructs a generator URL from compact
params. With v3, the equipment fields are gone so no changes are needed for those. The
function already omits `ar`/`sh`/`w`/`it`/`ac` from the URL params (they were never
generator inputs). No structural change required, but verify the score minimums ordering
logic still matches the new `s` field definition.

---

### Deletion list

Functions and helpers to delete outright after the rewrite:

| Item | Location | Reason |
|------|----------|--------|
| `generateCharacter()` (old) | `gen-core.js` | Replaced by `generateCharacterV3()` |
| `rollAbilitiesAdvanced()` | `gen-ui.js` | Absorbed into new generator |
| `createCharacterAdvanced()` | `gen-ui.js` | Absorbed into new generator |
| `raceFromBasicClass()` | `gen-core.js` | Inline in new generator |
| `pickRace()` | `gen-core.js` | Inline in new generator |
| `rollAbilityScores()` (internal) | `gen-core.js` | Replaced by shared `rollAbilities()` |
| `passesFilters()` | `gen-core.js` | Merged into new generator loop |
| `calcLevel0HP()` | `gen-core.js` | Inlined in new generator (Blessed fix removes the branching) |
| `calcAC()` | `gen-core.js` | Replaced by `purchaseEquipment()` result |
| `toMap()` | `gen-core.js` | Trivial; inline at call sites |
| `applyRacialAbilityModifiers()` calls in generator | `gen-core.js` | No longer applied during generation |

---

### Suggested implementation order

1. Move equipment/background data and functions from `gen-core.js` to `shared-core.js`.
   Verify `gen-core.js` still works by re-exporting from shared.
2. Update `expandCompactV2()` to call `purchaseEquipment()` and `getBackgroundByProfession()`
   for equipment derivation. Verify the sheet renders correctly for existing v2 URLs.
3. Write `generateCharacterV3()` in `gen-core.js` returning a v3 compact params object.
   Wire it up in `gen-ui.js` alongside the old generator to test in parallel.
4. Fix Blessed-at-L0 bug and pre-racial requirements check in the new generator.
5. Add v2→v3 upgrade path to `expandCompactV2()` / `initCharacterSheet()`.
6. Remove old `generateCharacter()`, `rollAbilitiesAdvanced()`, `createCharacterAdvanced()`,
   and all associated dead code.
7. Rename `expandCompactV2()` to `expandCompactV3()`, bump version, update all callers.

---

## Mode Conversion

A character sheet can be converted between Basic and Advanced mode. This requires
re-mapping race and class and handling ability score adjustments.

### Basic → Advanced (always possible)

Every Basic character has a defined Advanced equivalent.

| Basic class | Advanced race | Advanced class |
|-------------|---------------|----------------|
| Cleric      | Human         | Cleric         |
| Fighter     | Human         | Fighter        |
| Magic-User  | Human         | Magic-User     |
| Thief       | Human         | Thief          |
| Dwarf       | Dwarf         | Fighter        |
| Halfling    | Halfling      | Fighter        |
| Elf         | Elf           | Spellblade     |

**Ability scores:** `s` is the rolled scores and does not change. In Advanced mode the
sheet derives racial adjustments from `r` automatically. No score manipulation is needed
during conversion — setting `r` is sufficient.

**Compact params changes (B → A):**
- `m`: `'B'` → `'A'`
- `r`: set to the race code from the table above
- `c`: set to the class code from the table above
- `s`: unchanged (rolled scores carry over as-is)
- `sa`: unchanged (any post-gen adjustments carry over)
- `rcm`: carry forward — `ST` or `SH` remain valid; `TE`/`AL` become available

### Advanced → Basic (possible for select combinations only)

Only combinations that have a direct Basic equivalent can be converted. All others
have no Basic representation and cannot be converted.

| Advanced race + class | Basic class |
|-----------------------|-------------|
| Human + Cleric        | Cleric      |
| Human + Fighter       | Fighter     |
| Human + Magic-User    | Magic-User  |
| Human + Thief         | Thief       |
| Dwarf + Fighter       | Dwarf       |
| Halfling + Fighter    | Halfling    |
| Elf + Spellblade      | Elf         |

Any other Advanced combination (e.g. Elf Fighter, Dwarf Cleric, Human Ranger) has
no Basic equivalent — the conversion UI should not offer the option for these characters.

**Ability scores:** `s` is the rolled scores and does not change. In Basic mode the
sheet does not apply racial modifiers, so they simply stop being derived. No score
manipulation needed.

**Compact params changes (A → B):**
- `m`: `'A'` → `'B'`
- `c`: set to the Basic class code from the table above
- `s`: unchanged
- `sa`: unchanged
- `rcm`: retain `ST` or `SH`; downgrade `TE`/`AL` to `ST` (those modes have no Basic equivalent)

---

## Output

- New file: `CHARACTER_CREATION.md`
- Delete: `CHARACTER_CREATION_BASIC.md`, `CHARACTER_CREATION_ADVANCED.md`,
  `CHARACTER_CREATION_0LEVEL.md`

---

## Callout summary

| Step | Level 0 | Basic | Advanced |
|------|---------|-------|----------|
| 0. Choose Race/Class + Options | race only | class → race | race then class |
| 1. Set Minimums | same | same | same |
| 2. Roll Ability Scores | same | same | same |
| *(sheet)* Modifiers, Attacks, Saves, Abilities | derived at render time | derived at render time | derived at render time |
| 3. Roll Level 0 HP | final HP | recorded; optional floor | recorded; optional floor |
| 4. Roll Level 1+ HP | **skip** | class die ± L0 floor | class die ± L0 floor |
| 5. Alignment | same | same | same |
| 6. Roll Background | profession + item + weapon | profession recorded | profession recorded |
| *(sheet)* Languages | race-based | class-based | race-based, class merged |
| *(sheet)* Equipment | background item/weapon | purchased from class/bg/DEX | purchased from class/bg/DEX |
| *(sheet)* Armour Class | base 10 or background armor | derived from equipment | derived from equipment |
| 7. Level and XP | L0 fixed | L1–14 | L1–14 + race limits |
| 8. Name Character | same | same | same |
