# Module Dependency Flowcharts

Solid arrows = static `import`. Dashed arrows = dynamic `await import(...)`.

**Color key:**
- 🟩 Green = used by **both** charactersheet.js and generator-ui.js
- 🟥 Red = used **only** by generator-ui.js
- 🟨 Yellow = `charactersheet.js` node in the generator diagram (not expanded there)
- No color = the root entry-point module

> Note: every module that `charactersheet.js` uses is *also* directly imported by `generator-ui.js`,
> so there are no charactersheet-only (yellow) leaf modules.

---

## charactersheet.js

```mermaid
flowchart LR
    classDef shared fill:#90EE90,stroke:#228B22,color:#000

    csjs["charactersheet.js"]

    charsheetjs["shared-character-sheet.js"]
    sheetbuilder["shared-sheet-builder.js"]
    compact["shared-compact-codes.js"]
    wa["weapons-and-armor.js"]
    abilsc["shared-ability-scores.js"]
    modeff["shared-modifier-effects.js"]
    cdshared["class-data-shared.js"]
    cdose["class-data-ose.js"]
    cdgygar["class-data-gygar.js"]
    cdll["class-data-ll.js"]
    racial["shared-racial-abilities.js"]
    racenames["shared-race-names.js"]
    advutils["advanced-utils.js"]
    advgen["advanced-character-gen.js"]
    basicgen["basic-character-gen.js"]
    basicutils["basic-utils.js"]
    hp["shared-hit-points.js"]
    clsprog["shared-class-progression.js"]
    char["shared-character.js"]

    class charsheetjs,sheetbuilder,compact,wa,abilsc,modeff,cdshared,cdose,cdgygar,cdll,racial,racenames,advutils,advgen,basicgen,basicutils,hp,clsprog,char shared

    %% static imports
    csjs --> charsheetjs
    csjs --> compact
    csjs --> sheetbuilder

    %% dynamic imports
    csjs -.->|dyn| abilsc
    csjs -.->|dyn| modeff
    csjs -.->|dyn| cdshared
    csjs -.->|dyn one-of| cdose
    csjs -.->|dyn one-of| cdgygar
    csjs -.->|dyn one-of| cdll
    csjs -.->|dyn| racial
    csjs -.->|dyn| advutils
    csjs -.->|dyn| advgen
    csjs -.->|dyn| basicgen
    csjs -.->|dyn| basicutils
    csjs -.->|dyn| hp

    charsheetjs --> compact
    charsheetjs --> wa

    cdose   --> cdshared
    cdgygar --> cdshared

    racial --> racenames

    advgen --> abilsc
    advgen --> hp
    advgen --> clsprog
    advgen --> racial
    advgen --> char
    advgen --> advutils

    basicgen --> abilsc
    basicgen --> hp
    basicgen --> clsprog
    basicgen --> char

    advutils  --> abilsc
    basicutils --> abilsc
    clsprog   --> abilsc
    char      --> abilsc
    hp        --> abilsc
```

---

## generator-ui.js

```mermaid
flowchart LR
    classDef shared  fill:#90EE90,stroke:#228B22,color:#000
    classDef genOnly fill:#ff6b6b,stroke:#c00,color:#fff

    genui["generator-ui.js"]

    csjs["charactersheet.js"]
    basicgen["basic-character-gen.js"]
    advgen["advanced-character-gen.js"]
    zgen["shared-0level-gen.js"]
    basicutils["basic-utils.js"]
    advutils["advanced-utils.js"]
    clsprog["shared-class-progression.js"]
    char["shared-character.js"]
    hp["shared-hit-points.js"]
    racadj["shared-race-adjustments.js"]
    racial["shared-racial-abilities.js"]
    racenames["shared-race-names.js"]
    eq["shared-equipment.js"]
    settings["shared-settings.js"]
    names["shared-names.js"]
    bg["shared-backgrounds.js"]
    modeff["shared-modifier-effects.js"]
    abilsc["shared-ability-scores.js"]
    sheetbuilder["shared-sheet-builder.js"]
    charsheetjs["shared-character-sheet.js"]
    compact["shared-compact-codes.js"]
    wa["weapons-and-armor.js"]
    cdshared["class-data-shared.js"]
    cdose["class-data-ose.js"]
    cdgygar["class-data-gygar.js"]
    cdll["class-data-ll.js"]

    class basicgen,advgen,basicutils,advutils,clsprog,char,hp,racial,racenames,modeff,abilsc,sheetbuilder,charsheetjs,compact,wa,cdshared,cdose,cdgygar,cdll shared
    class zgen,racadj,eq,settings,names,bg genOnly
    style csjs fill:#ffe066,stroke:#b8860b,color:#333

    %% generator-ui.js static imports
    genui --> cdose
    genui --> cdgygar
    genui --> cdll
    genui --> cdshared
    genui --> basicutils
    genui --> advutils
    genui --> basicgen
    genui --> advgen
    genui --> char
    genui --> eq
    genui --> names
    genui --> bg
    genui --> modeff
    genui --> charsheetjs
    genui --> racial
    genui --> zgen
    genui --> settings
    genui --> compact
    genui --> csjs
    genui --> sheetbuilder

    %% charactersheet.js — not expanded here, see diagram above
    charsheetjs --> compact
    charsheetjs --> wa

    cdose   --> cdshared
    cdgygar --> cdshared

    basicgen --> abilsc
    basicgen --> hp
    basicgen --> clsprog
    basicgen --> char

    advgen --> abilsc
    advgen --> hp
    advgen --> clsprog
    advgen --> racial
    advgen --> char
    advgen --> advutils

    zgen --> abilsc
    zgen --> names
    zgen --> bg
    zgen --> racial
    zgen --> racadj

    basicutils --> abilsc
    advutils   --> abilsc
    clsprog    --> abilsc
    char       --> abilsc
    hp         --> abilsc

    racadj --> racenames
    racadj --> modeff
    racial --> racenames

    eq --> wa
    eq --> cdshared
```

---

## Dead Code (deleted)

| File | Was | Action |
|------|-----|--------|
| `race-adjustments.js` | Never imported by any JS or HTML file — old predecessor to `shared-race-adjustments.js` | 🗑️ Deleted |
| `test-gygar-data.js` | Developer test script with no HTML entry point | 🗑️ Deleted |

---

## Leaf Modules (no imports of their own)

| File | Role |
|------|------|
| `shared-ability-scores.js` | Ability score math (modifiers, XP bonus, roll helpers) |
| `shared-race-names.js` | Race name normalization constants |
| `shared-modifier-effects.js` | Modifier text descriptions |
| `shared-compact-codes.js` | URL encoding/decoding of compact params |
| `weapons-and-armor.js` | Weapon and armor data tables |
| `class-data-shared.js` | XP tables, HD progressions, spell slots |
| `class-data-ll.js` | LL-specific class data (self-contained) |
| `shared-names.js` | Random name tables |
| `shared-backgrounds.js` | Background/occupation tables |
| `shared-settings.js` | localStorage settings helpers |
| `shared-sheet-builder.js` | Sheet spec builder |
