# Character Creation: Advanced Method

In Advanced Method, **race and class are completely separate**. A character chooses a race
first (gaining racial abilities and ability score modifiers), then chooses a class available
to that race. Racial abilities persist through all levels alongside class abilities.

Levels 1–14 are supported.

---

## Steps

### 1. Roll Ability Scores

Roll 3d6 for each ability score: STR, INT, WIS, DEX, CON, CHA.

**Sub-par characters:** If scores are very poor (e.g. 8 or below in every score, or extremely
low in more than one ability), the character may be discarded and re-rolled. The generator
tracks how many attempts were needed.

### 2. Choose a Race

Select a race, bearing in mind minimum ability score requirements for some races.

Available races: Human, Dwarf, Elf, Gnome, Halfling.

**Racial ability score modifiers** are applied after race selection. Modifiers cannot raise a
score above 18 or lower it below 3. The unmodified (base) scores are preserved and shown with
strikethrough on the sheet when adjustments are in effect.

### 3. Choose a Class

Select a class available to the chosen race. Class availability is governed by the
Race/Class Mode setting (Strict OSE, Strict + Human Abilities, Traditional Extended, Allow All).

Available classes include the core OSE classes plus Advanced Fantasy expanded classes
(Acrobat, Assassin, Bard, Druid, Illusionist, Knight, Paladin, Ranger) and Spellblade.

**Multiple classes:** Not used. Characters select one class.

### 4. Note Ability Score Modifiers

Bonuses and penalties from ability scores are calculated automatically, using the
post-racial-modifier scores.

### 5. Note Attack Values

We always use Ascending AC. Attack bonus is determined by class and level.

### 6. Note Saving Throws and Class/Race Abilities

Saving throws are class-based with any applicable racial bonuses (e.g. Dwarf and Halfling
Resilience). Racial abilities and class abilities are both listed on the character sheet.
Languages from class abilities are merged into the racial languages list (sorted,
deduplicated).

If the character has spells, starting spells are determined by class and level.

### 7. Roll Hit Points

Hit points are rolled using the class hit die, modified by CON. Minimum 1 HP.

**HP rolling modes (selectable):**
- **Standard:** Roll the hit die; keep the result.
- **Blessed:** Roll twice, take the higher result (also used automatically if the character has
  the Blessed racial ability, e.g. Humans with human racial abilities enabled).
- **Healthy:** All HP rolls are treated as the maximum value for that die.
- **5e-style:** Take the average die value (rounded up) instead of rolling.

HP rolls are preserved and shown on the sheet so they can be edited on re-generation.

### 8. Choose Alignment

Alignment (Lawful / Neutral / Chaotic) is not tracked by the generator.

### 9. Note Known Languages

Languages come from the racial abilities section of the character sheet. Characters with high
INT may know additional languages as noted in the race description. Class language entries are
merged into the racial languages list.

### 10. Buy Equipment

Starting gold is rolled (3d6 × 10 gp for level 1; scaled from XP for higher levels) and
equipment is purchased automatically based on class and DEX modifier.

**Wealth options:**
- Roll normally, or treat any level as level 1 for starting gold (checkbox).
- Starting gold amount is preserved and editable on re-generation.

### 11. Note Armour Class

Ascending AC is always used. Base AC comes from purchased armour; DEX modifier is applied.

### 12. Note Level and XP

The generator supports levels 1–14. XP thresholds are calculated from the class progression
table and displayed on the sheet. Racial level limits are enforced in Strict mode.

### 13. Background Profession

The character receives a background profession derived from the level 0 background system,
based on their HP total. At level 1+ this is flavor only — it does not grant additional
equipment.

### 14. Name Character

A name is generated randomly from race-appropriate name tables. The name can be overridden
by typing in the name field before generating.

---

## Key Differences from Basic Method

| Feature | Basic Method | Advanced Method |
|---------|--------------|-----------------|
| Race selection | Determined by class | Chosen first, separately |
| Racial stat modifiers | None | Applied after race selection |
| Racial minimums | None | Enforced (mode-dependent) |
| Racial abilities | Baked into class abilities | Separate, persist all levels |
| Class selection | First step (determines race) | Second step (after race) |
| Languages | Class-based | Race-based, class langs merged in |

---

## House Rules and Deviations

| Rule | Book | Generator |
|------|------|-----------|
| Ascending AC | Optional | Always on |
| Re-rolling 1s/2s on HP | Optional | Selectable HP mode |
| Sub-par re-rolling | Optional | Enabled |
| Multiple classes | Optional | Not used |
| Secondary skills | Optional | Background profession from level 0 system |
| Alignment tracking | Required | Not tracked |
| Spellblade | Not in book | Available |
| Human racial abilities | Not in book | Optional (checkbox) |
