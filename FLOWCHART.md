# Module Dependency Flowcharts

Solid arrows = static `import`. Dashed arrows = dynamic `await import(...)`.

**Color key:**
- 🟩 Green = used by **both** cs-charactersheet.js and gen-ui.js
- 🟥 Red = used **only** by gen-ui.js (`gen-` prefix)
- 🟦 Blue = used **only** by cs-charactersheet.js (`cs-` prefix)
- � Yellow = `cs-charactersheet.js` node in the generator diagram (not expanded there)
- No color = the root entry-point module

> `cs-compact-codes.js` is a cs-only file. It appears in the gen-ui.js diagram as a transitive
> dependency (via `shared-character-sheet.js`) but gen-ui.js does not import it directly.
>
> `legacy-utils.js` is a standalone archive module — nothing currently imports from it.
> It is not shown in the diagrams below.

---

## cs-charactersheet.js

```mermaid
flowchart LR
    classDef shared fill:#90EE90,stroke:#228B22,color:#000
    classDef csOnly fill:#6bb5ff,stroke:#0066cc,color:#000

    csjs["cs-charactersheet.js"]

    charsheetjs["shared-character-sheet.js"]
    sheetbuilder["shared-sheet-builder.js"]
    compact["cs-compact-codes.js"]
    wa["shared-weapons-and-armor.js"]
    abilsc["shared-ability-scores.js"]
    modeff["shared-modifier-effects.js"]
    cdshared["shared-class-data-shared.js"]
    cdose["shared-class-data-ose.js"]
    cdgygar["shared-class-data-gygar.js"]
    cdll["shared-class-data-ll.js"]
    racial["shared-racial-abilities.js"]
    racenames["shared-race-names.js"]
    advutils["shared-advanced-utils.js"]
    advgen["shared-advanced-character-gen.js"]
    basicgen["shared-basic-character-gen.js"]
    basicutils["shared-basic-utils.js"]
    hp["shared-hit-points.js"]
    clsprog["shared-class-progression.js"]
    char["shared-character.js"]

    class charsheetjs,sheetbuilder,wa,abilsc,modeff,cdshared,cdose,cdgygar,cdll,racial,racenames,advutils,advgen,basicgen,basicutils,hp,clsprog,char shared
    class compact csOnly

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

## gen-ui.js

```mermaid
flowchart LR
    classDef shared  fill:#90EE90,stroke:#228B22,color:#000
    classDef genOnly fill:#ff6b6b,stroke:#c00,color:#fff
    classDef csOnly  fill:#6bb5ff,stroke:#0066cc,color:#000

    genui["gen-ui.js"]

    csjs["cs-charactersheet.js"]
    basicgen["shared-basic-character-gen.js"]
    advgen["shared-advanced-character-gen.js"]
    zgen["gen-0level-gen.js"]
    basicutils["shared-basic-utils.js"]
    advutils["shared-advanced-utils.js"]
    clsprog["shared-class-progression.js"]
    char["shared-character.js"]
    hp["shared-hit-points.js"]
    racadj["gen-race-adjustments.js"]
    racial["shared-racial-abilities.js"]
    racenames["shared-race-names.js"]
    eq["gen-equipment.js"]
    settings["gen-settings.js"]
    names["gen-names.js"]
    bg["gen-backgrounds.js"]
    modeff["shared-modifier-effects.js"]
    abilsc["shared-ability-scores.js"]
    sheetbuilder["shared-sheet-builder.js"]
    charsheetjs["shared-character-sheet.js"]
    compact["cs-compact-codes.js"]
    wa["shared-weapons-and-armor.js"]
    cdshared["shared-class-data-shared.js"]
    cdose["shared-class-data-ose.js"]
    cdgygar["shared-class-data-gygar.js"]
    cdll["shared-class-data-ll.js"]

    class basicgen,advgen,basicutils,advutils,clsprog,char,hp,racial,racenames,modeff,abilsc,sheetbuilder,charsheetjs,wa,cdshared,cdose,cdgygar,cdll shared
    class zgen,racadj,eq,settings,names,bg genOnly
    class compact csOnly
    style csjs fill:#ffe066,stroke:#b8860b,color:#333

    %% gen-ui.js static imports
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
    genui --> charsheetjs
    genui --> racial
    genui --> zgen
    genui --> settings
    genui --> csjs
    genui --> sheetbuilder

    %% cs-charactersheet.js — not expanded here, see diagram above
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
| `race-adjustments.js` | Never imported by any JS or HTML file — old predecessor to `gen-race-adjustments.js` | 🗑️ Deleted |
| `test-gygar-data.js` | Developer test script with no HTML entry point | 🗑️ Deleted |

---

## Leaf Modules (no imports of their own)

| File | Prefix | Role |
|------|--------|------|
| `shared-ability-scores.js` | shared | Ability score math (modifiers, XP bonus, roll helpers) |
| `shared-race-names.js` | shared | Race name normalization constants |
| `shared-modifier-effects.js` | shared | Modifier text descriptions |
| `shared-weapons-and-armor.js` | shared | Weapon and armor data tables |
| `shared-class-data-shared.js` | shared | XP tables, HD progressions, spell slots |
| `shared-class-data-ll.js` | shared | LL-specific class data (self-contained) |
| `shared-sheet-builder.js` | shared | Sheet spec builder |
| `cs-compact-codes.js` | cs | URL encoding/decoding of compact params |
| `gen-names.js` | gen | Random name tables |
| `gen-backgrounds.js` | gen | Background/occupation tables |
| `gen-settings.js` | gen | localStorage settings helpers |
| `legacy-utils.js` | — | Archive of orphaned exports — nothing currently imports from this module |
