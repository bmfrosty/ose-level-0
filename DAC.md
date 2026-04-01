# Descending Armor Class (DAC) — Reference for OSE Implementation

## Source
- https://oldschoolessentials.necroticgnome.com/srd/index.php/Game_Statistics
- https://oldschoolessentials.necroticgnome.com/srd/index.php/Combat_Tables

---

## Two Armor Class Systems

### Default: Descending Armor Class (DAC)
- **Lower AC = better armor** (the "descending" part — it goes down as armor improves)
- Unarmored = **AC 9**
- Plate mail + shield = **AC 2** (very good)
- **Bonuses DECREASE AC** (e.g., DEX +1 means AC drops by 1 = harder to hit)
- **Penalties INCREASE AC**
- Range typically: AC 9 (unarmored) down to AC -3 or lower for heavily armored monsters

### Optional: Ascending Armor Class (AAC)
- **Higher AC = better armor** (the "ascending" part — more modern D&D approach)
- Unarmored = **AC 10**
- Bonuses INCREASE AC
- Uses an **attack bonus** instead of THAC0

### Dual Format Notation
OSE lists both systems together:  
> `AC 5 [14]` — AC 5 in DAC, or AC 14 in AAC  
> `THAC0 17 [+2]` — THAC0 of 17 in DAC, or +2 attack bonus in AAC

The conversion between them:  
> **DAC + AAC = 19**  
> e.g., AC 5 + AC 14 = 19 ✓  
> e.g., unarmored: AC 9 + AC 10 = 19 ✓

---

## THAC0 (To Hit Armor Class 0)

- **THAC0** = the d20 roll needed to hit an opponent with AC 0
- **Lower THAC0 = more powerful attacker** (a THAC0 of 14 is better than 17)
- Listed in each class's progression table alongside the AAC attack bonus
- **Formula: THAC0 = 19 − classAttackBonus**
  - NH (normal human): class attack bonus = -1, THAC0 = 19 - (-1) = **20**
  - 0-level / no class: class attack bonus = -1 (OSE standard), THAC0 = **20**
  - Level 1 Fighter: attack bonus = +1, THAC0 = 19 - 1 = **18**
  - Level 5 Fighter: attack bonus = +2, THAC0 = 19 - 2 = **17**

### Quick calculation to hit a given DAC:
> **Roll needed = THAC0 − target AC**  
> Result is clamped: minimum **2**, maximum **20**

Example: Fighter THAC0 17, attacking AC 4:  
> Roll needed = 17 − 4 = **13**  
> Roll 13+ on d20 to hit.

---

## The Attack Matrix (from OSE SRD Combat Tables)

This is the authoritative table for DAC. Rows = THAC0. Columns = target DAC value.  
Cell value = minimum d20 roll needed to hit.

```
Monster HD       | THAC0      | AC-3 | AC-2 | AC-1 | AC0 | AC1 | AC2 | AC3 | AC4 | AC5 | AC6 | AC7 | AC8 | AC9
-----------------|------------|------|------|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|----
Normal Human (NH)| 20  [-1]   |  20  |  20  |  20  |  20 |  19 |  18 |  17 |  16 |  15 |  14 |  13 |  12 |  11
Up to 1 HD       | 19   [0]   |  20  |  20  |  20  |  19 |  18 |  17 |  16 |  15 |  14 |  13 |  12 |  11 |  10
1+ to 2 HD       | 18  [+1]   |  20  |  20  |  19  |  18 |  17 |  16 |  15 |  14 |  13 |  12 |  11 |  10 |   9
2+ to 3 HD       | 17  [+2]   |  20  |  19  |  18  |  17 |  16 |  15 |  14 |  13 |  12 |  11 |  10 |   9 |   8
3+ to 4 HD       | 16  [+3]   |  19  |  18  |  17  |  16 |  15 |  14 |  13 |  12 |  11 |  10 |   9 |   8 |   7
4+ to 5 HD       | 15  [+4]   |  18  |  17  |  16  |  15 |  14 |  13 |  12 |  11 |  10 |   9 |   8 |   7 |   6
5+ to 6 HD       | 14  [+5]   |  17  |  16  |  15  |  14 |  13 |  12 |  11 |  10 |   9 |   8 |   7 |   6 |   5
6+ to 7 HD       | 13  [+6]   |  16  |  15  |  14  |  13 |  12 |  11 |  10 |   9 |   8 |   7 |   6 |   5 |   4
7+ to 9 HD       | 12  [+7]   |  15  |  14  |  13  |  12 |  11 |  10 |   9 |   8 |   7 |   6 |   5 |   4 |   3
9+ to 11 HD      | 11  [+8]   |  14  |  13  |  12  |  11 |  10 |   9 |   8 |   7 |   6 |   5 |   4 |   3 |   2
11+ to 13 HD     | 10  [+9]   |  13  |  12  |  11  |  10 |   9 |   8 |   7 |   6 |   5 |   4 |   3 |   2 |   2
13+ to 15 HD     |  9 [+10]   |  12  |  11  |  10  |   9 |   8 |   7 |   6 |   5 |   4 |   3 |   2 |   2 |   2
15+ to 17 HD     |  8 [+11]   |  11  |  10  |   9  |   8 |   7 |   6 |   5 |   4 |   3 |   2 |   2 |   2 |   2
17+ to 19 HD     |  7 [+12]   |  10  |   9  |   8  |   7 |   6 |   5 |   4 |   3 |   2 |   2 |   2 |   2 |   2
19+ to 21 HD     |  6 [+13]   |   9  |   8  |   7  |   6 |   5 |   4 |   3 |   2 |   2 |   2 |   2 |   2 |   2
21+ or more HD   |  5 [+14]   |   8  |   7  |   6  |   5 |   4 |   3 |   2 |   2 |   2 |   2 |   2 |   2 |   2
```

**Note:** Minimum roll is always 2 (a roll of 1 always misses). Maximum roll needed is 20.  
The formula `max(2, min(20, THAC0 − AC))` reproduces the table exactly.

---

## Character Sheet Display: DAC Attack Matrix (2 Lines)

When using DAC, the character sheet replaces the single "Class Attack Bonus" line with a **2-line attack matrix**:

**Line 1 — THAC0:**  
> `THAC0: 17`  
> Computed as: `THAC0 = 19 − classAttackBonus`

**Line 2 — d20 Roll to hit each AC:**  
> Show the minimum d20 roll needed to hit each Descending AC from -3 to 9:
> `AC: -3  -2  -1   0   1   2   3   4   5   6   7   8   9`  
> `Hit: 20  19  18  17  16  15  14  13  12  11  10   9   8`  
> (example for THAC0 17)

Formula for each cell: `max(2, min(20, THAC0 − AC))`

### Example for a Level 1 Fighter (classAttackBonus = +1, THAC0 = 18):
```
THAC0: 18
AC:    -3   -2   -1    0    1    2    3    4    5    6    7    8    9
Roll:  20   20   19   18   17   16   15   14   13   12   11   10    9
```

### Example for a 0-level character / Normal Human (classAttackBonus = -1, THAC0 = 20):
```
THAC0: 20
AC:    -3   -2   -1    0    1    2    3    4    5    6    7    8    9
Roll:  20   20   20   20   19   18   17   16   15   14   13   12   11
```

---

## Implementation Notes

### Converting our existing AAC to THAC0
Our codebase uses `classAttackBonus` (which is the AAC attack bonus):
```javascript
const thac0 = 19 - classAttackBonus;
```

### Generating the d20 roll row
```javascript
const DAC_RANGE = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function getRollToHit(thac0, targetAC) {
    return Math.max(2, Math.min(20, thac0 - targetAC));
}

// Returns array of rolls for display
function getDACAttackRow(classAttackBonus) {
    const thac0 = 19 - classAttackBonus;
    return DAC_RANGE.map(ac => getRollToHit(thac0, ac));
}
```

### AC Display on Character Sheet
- **Currently shown**: Starting AC (as AAC e.g., 14 for leather armor + DEX)
- **With DAC**: Should show `AC 5 [14]` format, or just the DAC value `AC 5`
- Starting AC in DAC = `19 - startingACinAAC`  
  e.g., AAC 14 → DAC 5; AAC 10 (unarmored) → DAC 9

### Armour/Equipment AC Values
Currently stored as AAC in `cp.ac`. For DAC display:
- `DAC = 19 - AAC`
- Unarmored: AAC 10 → DAC 9
- Leather: AAC 13 → DAC 6 (with no DEX)
- Chain: AAC 14 → DAC 5
- Plate: AAC 15 → DAC 4
- With shield: +1 AAC → -1 DAC

---

## Summary: AAC vs DAC at a Glance

| Concept             | Ascending AC (AAC)         | Descending AC (DAC)        |
|---------------------|----------------------------|----------------------------|
| Unarmored           | AC 10                      | AC 9                       |
| Better armor        | Higher number              | Lower number               |
| Attack stat         | Attack Bonus (+0, +1, …)   | THAC0 (20, 19, 18, …)      |
| Hit check           | d20 + bonus ≥ target AAC   | d20 ≥ THAC0 − target DAC   |
| Conversion          | AAC = 19 − DAC             | DAC = 19 − AAC             |
| Sheet display       | Single "Attack Bonus" line | 2-line matrix (THAC0 + row)|
