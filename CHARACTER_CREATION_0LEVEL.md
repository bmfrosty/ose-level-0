# Character Creation: Level 0

Level 0 characters are ordinary people — not yet adventurers. They have no class, roll 1d4
for HP, and receive equipment from their background rather than purchasing it. They can advance
to 1st level after surviving an adventure.

Level 0 generation is available in both Basic and Advanced modes.

---

## Steps

### 1. Roll Ability Scores

Roll 3d6 for each ability score: STR, INT, WIS, DEX, CON, CHA.

**Sub-par characters:** Unlike the original OSE rule (keep what you roll), the generator
allows re-rolling very poor characters. The number of attempts is tracked.

### 2. Choose a Race

**Original OSE rule (optional):** 1-in-6 chance of being a demihuman (roll 1d4 for which race).

**Generator:** Race is selected via button grid — Random, Human, Dwarf, Elf, Halfling.
(Gnome is available in the supporting data but not offered as a level-0 option in the UI.)

**Basic mode:** Race does not apply racial stat modifiers — level 0 demihumans get racial
abilities but no stat adjustments.

**Advanced mode:** Racial stat modifiers are applied after rolls are complete. Racial minimums
are enforced when rolling randomly.

**Demihuman racial abilities at level 0:**
- All demihumans: additional native languages, 2-in-6 hear noises at doors
- **Dwarf:** Infravision 60′, detect room traps 2-in-6, detect construction tricks 2-in-6,
  Resilience (CON-based bonus to Death/Wands/Spells saves)
- **Elf:** Infravision 60′, immunity to ghoul paralysis, detect secret doors 2-in-6
- **Halfling:** +1 missile attack rolls, +2 AC vs large opponents

### 3. Note Ability Score Modifiers

Bonuses and penalties from ability scores are calculated automatically. In Advanced mode,
racial modifiers are applied first; base scores are preserved and shown with strikethrough
when adjustments are in effect.

### 4. Note Attack Values and Saves

- **THAC0:** 20 [−1] — level 0 characters have a −1 attack penalty.
- **Smoothified/Gygar mode:** THAC0 20 [0] — no attack penalty for untrained folk.
- **Saves:** Death 14, Wands 15, Paralysis 16, Breath 17, Spells 18.
  Dwarf and Halfling Resilience bonuses (CON-based) are applied where applicable.

### 5. Roll Hit Points

Roll 1d4, modified by CON. Minimum 1 HP.

**No re-rolling 1s/2s** — level 0 characters keep what they roll.

**HP determines background:** Final HP (post-CON, capped at 4, minimum 1) selects which
background table is used in step 7.

**Blessed (Advanced mode, Human with human abilities enabled):** Roll 1d4 twice and take
the higher result. Individual dice are still not re-rolled.

### 6. Choose Alignment

Alignment (Lawful / Neutral / Chaotic) is not tracked by the generator. For funnel
adventures with many characters, roll 1d6: 1–2 Lawful, 3–4 Neutral, 5–6 Chaotic.

### 7. Note Known Languages

All characters speak Common. Characters with high INT also speak additional languages.
Demihumans speak their race's native languages in addition to Common.

### 8. Roll Background and Items

Background profession is rolled from the table matching the character's HP total. Each
profession provides a starting item and a starting weapon.

**Background tables (HP 1–4, d12 each):**

| HP | Example Professions |
|----|---------------------|
| 1 | Acolyte, Actor, Alchemist's Apprentice, Artist, Beggar, Jeweller, Juggler, Money Lender, Scribe, Trumpet Player, Wealthy Heir, Wizard's Apprentice |
| 2 | Butcher, Butler, Cook, Fletcher, Gambler, Horse Thief, Innkeeper, Navigator, Shepherd, Tailor, Trader, Weaver |
| 3 | Bowyer, Cooper, Executioner, Fisher, Groom, Hermit, Kennel Master, Leatherworker, Limner, Sailor, Teamster, Trapper |
| 4 | Armourer, Barber Surgeon, Blacksmith, Carpenter, Farmer, Forester, Hunter, Mason, Miner, Shipwright, Squire, Weaponsmith |

The generator uses the original 48-profession tables plus additional expanded professions.
A specific occupation can be forced via the occupation dropdown.

### 9. Note Armour Class

Ascending AC is always used. Unarmoured base AC is 10, modified by DEX. The Armourer
profession grants chain mail (AC 14 base).

### 10. Note Level and XP

Level 0 characters start with 0 XP. There is no class progression table — they use fixed
attack and save values until they advance to 1st level.

### 11. Name Character

A name is generated randomly from race-appropriate name tables. The name can be overridden
by typing in the name field before generating. Original name tables: Human d20 (20 names),
Dwarf/Elf/Halfling d12 (12 names each). The generator uses expanded tables with 200+ names
per race.

---

## Advancing to 1st Level

After gaining XP on an adventure, a level 0 character becomes a 1st level adventurer.

**1. Choose a Class**
Choose a class meeting minimum ability score requirements. Selection can be based on ability
scores, background, or deeds at level 0. Demihuman characters may select the equivalent
demihuman class.

**2. Roll Hit Points**
Roll the class hit die and apply CON modifier. If higher than the level 0 HP, use the new
total; otherwise keep the level 0 HP. Re-rolling 1s and 2s may be allowed.

---

## Funnel Adventures

A funnel is a session where each player controls multiple level 0 characters, who are
whittled down to survivors who become 1st level PCs.

1. Players roll 10–20 level 0 characters — ordinary folk threatened by some evil.
2. Each player controls 3–5 characters through the adventure.
3. Of the survivors, each player picks one to advance to 1st level.

---

## Key Differences from Level 1+

| Feature | Level 0 | Level 1+ |
|---------|---------|----------|
| HP die | 1d4 (no re-roll) | Class die (re-roll 1s/2s optional) |
| Attack bonus | −1 (Normal) / 0 (Gygar) | 0 (THAC0 19 [0]) |
| Saves | D14 W15 P16 B17 S18 | Class-based |
| Equipment | From background | Purchased with starting gold |
| Class | None | Required |
| Racial stat modifiers | Advanced mode only | Always (Advanced Method) |

---

## House Rules and Deviations

| Rule | Book | Generator |
|------|------|-----------|
| Must keep ability rolls | Yes | Re-rolling allowed |
| Must keep HP rolls | Yes | Kept (no re-roll mode) |
| Demihumans: 1-in-6 chance | Optional | Selectable race button |
| Ascending AC | Optional | Always on |
| Smoothified/Gygar mode | Not in book | No level 0 attack penalty |
| Advanced mode | Not in book | Racial modifiers + minimums |
| Human racial abilities | Not in book | Optional in Advanced mode |
| Expanded name tables | 12–20 names | 200+ names per race |
| Expanded background tables | 48 professions | Additional professions added |
