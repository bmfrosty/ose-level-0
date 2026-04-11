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

### Step 1 — Roll Ability Scores
**Identical across all three modes.** Merge verbatim. Note that sub-par characters may be
re-rolled in all modes (we diverge from the level 0 original rule here, which required
keeping what you rolled).

### Step 2 — Choose Race and/or Class
**Most divergent step — needs all three callouts:**

> **Level 0:** Choose a race only. No class is chosen yet.
>
> **Basic:** Choose a class. The class determines race for demihumans. No racial stat
> modifiers are applied.
>
> **Advanced:** Choose a race first. Racial stat modifiers are applied immediately.
> Then choose a class available to that race. Class availability depends on the
> Race/Class Mode in use (Strict OSE, Strict + Human Abilities, Traditional Extended,
> Allow All).

List available races (Level 0 / Advanced) and classes (Basic / Advanced) under their
callouts. This is the step with the most divergence across all three modes.

### Step 3 — Note Ability Score Modifiers
**Nearly identical.** One clause covers both Advanced L1+ and Advanced L0:

> *(Advanced mode: racial modifiers are applied after race selection. Base scores before
> adjustment are preserved and displayed alongside the modified scores.)*

### Step 4 — Note Attack Values and Saves
**Level 0 differs; Basic and Advanced are identical to each other.**

> **Level 0:** Fixed values — THAC0 20 [−1]; saves D14 W15 P16 B17 S18. Gygar mode
> removes the attack penalty (THAC0 20 [0]). Dwarf and Halfling Resilience bonuses apply.
>
> **Level 1+:** Attack bonus and saves are determined by class and level. Racial saving
> throw bonuses (e.g. Dwarf/Halfling Resilience) are applied on top.

### Step 5 — Note Saving Throws and Class/Race Abilities
**Level 1+ only.** Level 0 has no class and uses fixed saves covered in step 4.

> *Level 0 characters skip this step.*
>
> Saving throws are class-based with any applicable racial bonuses. Racial abilities and
> class abilities are both listed on the character sheet. If the character has spells,
> starting spells are determined by class and level.

### Step 6 — Roll Level 0 Hit Points
**All modes — this step always happens.** The level 0 HP roll determines the background
profession table (HP 1–4), so it is relevant even for level 1+ characters. It is also
the character's actual HP if they are level 0.

> Roll 1d4, modified by CON. Minimum 1 HP. No re-rolling 1s or 2s at this step.
>
> **Level 0:** This is the character's HP.
>
> **Level 1+:** This roll is recorded and used to select the background profession table.
> It may optionally serve as a floor for the level 1+ HP roll (see step 7).

**Blessed (Advanced mode, Human with human racial abilities):** Roll 1d4 twice, take the
higher result. Individual dice are still not re-rolled.

### Step 7 — Roll Level 1+ Hit Points
**Level 1+ only.** Level 0 characters skip this step.

> Roll the class hit die, modified by CON. Minimum 1 HP.
>
> **Option — include level 0 HP:** If this option is on, the level 0 HP roll from step 6
> acts as a floor: if the class die roll is lower, the level 0 result is kept instead.

HP rolling modes (all apply to the class die roll):
- **Standard:** Roll and keep the result.
- **Blessed:** Roll twice, take the higher (also applies automatically if the character
  has the Blessed racial ability).
- **Healthy:** Treat every die as its maximum value.
- **5e-style:** Take the average die value (rounded up).

### Step 8 — Choose Alignment
**Identical across all three modes.** Lawful, Neutral, or Chaotic. Not mechanically
tracked. Merge verbatim.

### Step 9 — Note Known Languages
**Level 0 and Advanced share race-based languages; Basic uses class-based languages.**

> Languages are listed on the character sheet. In Basic mode they come from the class
> description; in Level 0 and Advanced mode they come from the race description, with any
> class language entries merged in (sorted and deduplicated). Characters with high INT know
> additional languages.

### Step 10 — Roll Background / Buy Equipment
**Level 0 differs; Basic and Advanced are identical to each other.**

> **Level 0:** Roll on the background table for the character's HP total (from step 6).
> The result determines the character's profession, a starting item, and a starting weapon.
>
> **Level 1+:** Starting gold is determined by level (3d6 × 10 gp at level 1; scaled from
> XP at higher levels, with an option to treat any level as level 1). Equipment is
> purchased automatically based on class, race, and DEX. The background profession from
> step 6 is flavor only — it does not grant equipment at level 1+.

### Step 11 — Note Armour Class
**Identical across all three modes.** Ascending AC is always used; DEX modifier applied.

> *(Level 0: unarmoured base AC is 10. The Armourer background grants chain mail.)*

### Step 12 — Note Level and XP
**Level 0 differs slightly; Basic and Advanced differ by one clause.**

> **Level 0:** Level 0, 0 XP. Attack and saves are fixed (step 4); there is no class
> progression table.
>
> **Level 1+:** Levels 1–14. XP thresholds come from the class progression table.
> *(Advanced, Strict mode: racial level limits are enforced.)*

### Step 13 — Name Character
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
| Ascending AC | Optional | Always used |
| Must keep HP rolls at level 0 | Yes (L0 original) | Followed — no re-roll at step 6 |
| Re-rolling 1s/2s on HP | Optional (L1+) | Selectable HP mode at step 7 |
| Sub-par re-rolling | Forbidden (L0) / Optional (L1+) | Allowed in all modes |
| Multiple classes | Optional | Not used |
| Secondary skills | Optional | Background profession from step 6 |
| Alignment tracking | Required | Not tracked |
| Spellblade | Not in book | Available (human in Basic; human/elf in Advanced) |
| Human racial abilities | Not in book | Advanced only, optional |
| Gygar/Smoothified mode | Not in book | Removes level 0 attack penalty |

---

## Output

- New file: `CHARACTER_CREATION.md`
- Delete: `CHARACTER_CREATION_BASIC.md`, `CHARACTER_CREATION_ADVANCED.md`,
  `CHARACTER_CREATION_0LEVEL.md`

---

## Callout summary

| Step | Level 0 | Basic | Advanced |
|------|---------|-------|----------|
| 1. Roll Ability Scores | same | same | same |
| 2. Choose Race/Class | race only | class → race | race then class |
| 3. Note Modifiers | same | same | racial mods note |
| 4. Attack Values and Saves | fixed values | class-based | class-based |
| 5. Saving Throws and Abilities | **skip** | class abilities | race + class abilities |
| 6. Roll Level 0 HP | final HP | recorded; optional floor | recorded; optional floor |
| 7. Roll Level 1+ HP | **skip** | class die ± L0 floor | class die ± L0 floor |
| 8. Alignment | same | same | same |
| 9. Languages | race-based | class-based | race-based, class merged |
| 10. Equipment | roll background | purchase | purchase |
| 11. Armour Class | AC note | same | same |
| 12. Level and XP | L0 fixed | L1–14 | L1–14 + race limits |
| 13. Name Character | same | same | same |
