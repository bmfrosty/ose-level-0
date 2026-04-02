# Plan: Class & Race Abilities Audit

## Goal
Verify that all Basic class abilities and Advanced racial abilities match the OSE SRD exactly.
Fix any missing, wrong, or misleading descriptions.

## SRD Reference
https://oldschoolessentials.necroticgnome.com/srd/index.php/

---

## Files to audit

| File | What it controls |
|------|-----------------|
| `shared-class-progression.js` | Basic mode: demihuman "racial abilities" list shown on character sheet |
| `shared-class-data-shared.js` | Advanced mode + class tables: structured ability objects (name + description) for Dwarf, Elf, Halfling, Gnome, Human classes |
| `shared-racial-abilities.js` | Advanced mode: racial abilities by race (Dwarf, Elf, Halfling, Gnome, Human) — used for non-class abilities |

---

## Already Fixed (this session)

### Basic Dwarf (`shared-class-progression.js`)
- ✅ Added missing **Detect Room Traps** ("2-in-6 chance to detect non-magical room traps when searching")
- ✅ Fixed **Detect Construction Tricks** description — was "detect traps, sliding walls, sloping passages", now correctly says "detect new construction, sliding walls, or sloping passages when searching"
- ✅ Fixed language names: `Common, Dwarf, Gnome, Goblin, Kobold` → `Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold`

### Gnome (`shared-class-progression.js`)
- ✅ Fixed **Detect Construction Tricks** description (same wrong wording)

### `shared-class-data-shared.js`
- ✅ Fixed Detect Construction Tricks description for Dwarf: "detect traps, false walls, hidden construction" → "detect new construction, sliding walls, or sloping passages when searching"

---

## Still Needs Review

### Basic Classes — `shared-class-progression.js`

#### Dwarf
- [ ] Verify: should "Detect Construction Tricks" be available passively or only when searching? (SRD: "when searching")
- [ ] Verify: languages match SRD exactly: `Alignment, Common, Dwarvish, Gnomish, Goblin, Kobold`
- [ ] Verify: Resilience save bonus formula matches SRD saving throw table

#### Elf
- [ ] Check SRD: https://oldschoolessentials.necroticgnome.com/srd/index.php/Elf
- [ ] Verify: languages match SRD (`Alignment, Common, Elvish, Gnoll, Hobgoblin, Orc`)
- [ ] Verify: "Detect Secret Doors" 2-in-6 when searching / 1-in-6 passively
- [ ] Verify: "Immunity to Ghoul Paralysis" wording
- [ ] Check if Elf is missing any abilities (e.g. spellcasting listed properly?)

#### Halfling
- [ ] Check SRD: https://oldschoolessentials.necroticgnome.com/srd/index.php/Halfling
- [ ] Verify: languages match SRD (`Alignment, Common, Halfling`)
- [ ] Verify: Missile bonus (+1 to hit)
- [ ] Verify: AC bonus wording (SRD: "-2 AC against larger than human-sized")
- [ ] Verify: Hiding chances (90% wilderness / 2-in-6 dungeons)
- [ ] Verify: Resilience formula

#### Gnome (house rules / not in base OSE SRD)
- [ ] Document which SRD / book Gnome abilities come from
- [ ] Verify: languages (`Alignment, Common, Gnomish, Dwarvish, Goblin, Kobold`)
- [ ] Verify: Infravision 60'
- [ ] Verify: Detect Construction Tricks — now fixed to correct wording
- [ ] Check: does Gnome also get Detect Room Traps like Dwarf?
- [ ] Verify: AC bonus vs ogre-sized creatures
- [ ] Verify: Magic Resistance description

---

### Advanced Mode — `shared-class-data-shared.js`

#### Dwarf
- [x] Detect Construction Tricks description fixed
- [ ] Verify all 6 ability entries match SRD

#### Elf
- [ ] Check SRD and verify all ability entries

#### Halfling
- [ ] Check SRD and verify all ability entries

#### Human classes (Fighter, Cleric, Magic-User, Thief, Spellblade)
- [ ] Check that no class abilities are missing or misdescribed
- [ ] Cleric: Turn Undead, Spells — verify wording
- [ ] Fighter: Combat abilities, Stronghold (9th level)
- [ ] Magic-User: Arcane magic, Spells, Scroll use
- [ ] Thief: All thief skills percentages
- [ ] Spellblade (house rules): verify abilities

---

### Advanced Mode Racial Abilities — `shared-racial-abilities.js`

#### Dwarf Race (Advanced)
- [ ] Check SRD: https://oldschoolessentials.necroticgnome.com/srd/index.php/Dwarf_(Advanced)
- [ ] Verify languages listed
- [ ] "Detect construction tricks 2-in-6" — verify matches SRD
- [ ] "Detect room traps 2-in-6" — verify present
- [ ] "Infravision 60'" — ✓ likely correct
- [ ] "Listen at doors 2-in-6" — ✓ likely correct

#### Elf Race (Advanced)
- [ ] Check SRD: https://oldschoolessentials.necroticgnome.com/srd/index.php/Elf_(Advanced)
- [ ] "Detect secret doors 2-in-6 when actively searching" — verify
- [ ] "Infravision 60'" — verify
- [ ] "Listen at doors 2-in-6" — verify
- [ ] Languages
- [ ] Immunity to ghoul paralysis?

#### Halfling Race (Advanced)
- [ ] Check SRD: https://oldschoolessentials.necroticgnome.com/srd/index.php/Halfling_(Advanced)
- [ ] Verify all abilities

#### Gnome Race (Advanced)
- [ ] Identify source book
- [ ] "Infravision 90'" — verify (note: different from 60' — Gnome sees farther?)
- [ ] "Detect construction tricks 2-in-6" — verify
- [ ] "Listen at doors 2-in-6" — verify

---

## Suggested Review Process

1. Open each SRD page listed above
2. Compare line-by-line with the codebase entries
3. Fix any discrepancies in both `shared-class-progression.js` (basic) and `shared-class-data-shared.js` + `shared-racial-abilities.js` (advanced)
4. Mark each item in this file as resolved

## SRD Pages to Visit

- Dwarf (basic): https://oldschoolessentials.necroticgnome.com/srd/index.php/Dwarf
- Elf (basic): https://oldschoolessentials.necroticgnome.com/srd/index.php/Elf
- Halfling (basic): https://oldschoolessentials.necroticgnome.com/srd/index.php/Halfling
- Cleric: https://oldschoolessentials.necroticgnome.com/srd/index.php/Cleric
- Fighter: https://oldschoolessentials.necroticgnome.com/srd/index.php/Fighter
- Magic-User: https://oldschoolessentials.necroticgnome.com/srd/index.php/Magic-User
- Thief: https://oldschoolessentials.necroticgnome.com/srd/index.php/Thief
- Advanced Dwarf: https://oldschoolessentials.necroticgnome.com/srd/index.php/Dwarf_(Advanced)
- Advanced Elf: https://oldschoolessentials.necroticgnome.com/srd/index.php/Elf_(Advanced)
- Advanced Halfling: https://oldschoolessentials.necroticgnome.com/srd/index.php/Halfling_(Advanced)
