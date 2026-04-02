# Module Dependency Flowchart

HTML pages on the left, their JS dependencies flowing right.  
Solid arrows = static `import`. Dashed arrows = dynamic `await import(...)`.

```mermaid
flowchart LR
    %% ── HTML Entry Points ────────────────────────────────────────────────────
    subgraph HTML ["HTML Pages"]
        direction TB
        index["index.html\n(no scripts)"]
        generator_html["generator.html"]
        charsheet_html["charactersheet.html"]
        classes_html["classes.html"]
    end

    %% ── Primary Controllers ──────────────────────────────────────────────────
    subgraph Controllers ["Primary Controllers"]
        genui["generator-ui.js"]
        csjs["charactersheet.js"]
    end

    %% ── Character Generation ─────────────────────────────────────────────────
    subgraph CharGen ["Character Generation"]
        basicgen["basic-character-gen.js"]
        advgen["advanced-character-gen.js"]
        zgen["shared-0level-gen.js"]
    end

    %% ── Utilities ────────────────────────────────────────────────────────────
    subgraph Utils ["Utilities"]
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
    end

    %% ── Sheet Rendering ──────────────────────────────────────────────────────
    subgraph SheetRender ["Sheet Rendering"]
        sheetbuilder["shared-sheet-builder.js"]
        charsheetjs["shared-character-sheet.js"]
        compact["shared-compact-codes.js"]
        wa["weapons-and-armor.js"]
    end

    %% ── Class Data ───────────────────────────────────────────────────────────
    subgraph ClassData ["Class Data"]
        cdshared["class-data-shared.js"]
        cdose["class-data-ose.js"]
        cdgygar["class-data-gygar.js"]
        cdll["class-data-ll.js"]
    end

    %% ── Dead Code ────────────────────────────────────────────────────────────
    subgraph Dead ["⚠️ Dead Code — not reachable from any HTML"]
        raceadj_dead["race-adjustments.js\n(never imported by anything)"]
        testgygar["test-gygar-data.js\n(no HTML entry point)"]
    end

    %% ── HTML → first-level JS ────────────────────────────────────────────────
    generator_html --> genui
    charsheet_html --> csjs
    classes_html   --> cdgygar
    classes_html   --> cdshared

    %% ── generator-ui.js static imports ──────────────────────────────────────
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

    %% ── charactersheet.js static imports ────────────────────────────────────
    csjs --> charsheetjs
    csjs --> compact
    csjs --> sheetbuilder

    %% ── charactersheet.js dynamic imports ───────────────────────────────────
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
    csjs -.->|dyn| compact

    %% ── basic-character-gen.js ───────────────────────────────────────────────
    basicgen --> abilsc
    basicgen --> hp
    basicgen --> clsprog
    basicgen --> char

    %% ── advanced-character-gen.js ────────────────────────────────────────────
    advgen --> abilsc
    advgen --> hp
    advgen --> clsprog
    advgen --> racial
    advgen --> char
    advgen --> advutils

    %% ── shared-0level-gen.js ─────────────────────────────────────────────────
    zgen --> abilsc
    zgen --> names
    zgen --> bg
    zgen --> racial
    zgen --> racadj

    %% ── basic-utils.js / advanced-utils.js ───────────────────────────────────
    basicutils --> abilsc
    advutils   --> abilsc

    %% ── shared-class-progression.js ──────────────────────────────────────────
    clsprog --> abilsc

    %% ── shared-character.js ──────────────────────────────────────────────────
    char --> abilsc

    %% ── shared-hit-points.js ─────────────────────────────────────────────────
    hp --> abilsc

    %% ── shared-race-adjustments.js ───────────────────────────────────────────
    racadj --> racenames
    racadj --> modeff

    %% ── shared-racial-abilities.js ───────────────────────────────────────────
    racial --> racenames

    %% ── shared-equipment.js ──────────────────────────────────────────────────
    eq --> wa
    eq --> cdshared

    %% ── shared-character-sheet.js ────────────────────────────────────────────
    charsheetjs --> compact
    charsheetjs --> wa

    %% ── class-data-gygar.js / class-data-ose.js ──────────────────────────────
    cdgygar --> cdshared
    cdose   --> cdshared

    %% ── Dead code internal imports (shown dashed) ────────────────────────────
    testgygar -.-> cdgygar
    testgygar -.-> cdshared
```

---

## Dead Code Analysis

| File | Status | Reason |
|------|--------|--------|
| `race-adjustments.js` | ⚠️ **Dead** | Never imported by any JS or HTML file. `shared-race-adjustments.js` is the active version; this appears to be an old/renamed predecessor. |
| `test-gygar-data.js` | ⚠️ **Unreachable** | Has no HTML entry point. It's a developer test script only — never loaded by a browser. Could be deleted or moved to a `test/` folder. |
| `index.html` | ℹ️ **No scripts** | Pure static HTML landing page. Links to `generator.html` via `<a>` tags. No JS dependencies. |

---

## Leaf Modules (no imports of their own)

These are pure data/utility modules that nothing imports *from* — they only export:

| File | Role |
|------|------|
| `shared-ability-scores.js` | Ability score math (modifiers, XP bonus, roll helpers) |
| `shared-race-names.js` | Race name normalization constants |
| `shared-modifier-effects.js` | Modifier text descriptions |
| `shared-compact-codes.js` | URL encoding/decoding of compact params |
| `weapons-and-armor.js` | Weapon and armor data tables |
| `class-data-shared.js` | XP tables, HD progressions, spell slots — imported by all three class-data files |
| `class-data-ll.js` | LL-specific class data (no imports — self-contained) |
| `shared-names.js` | Random name tables |
| `shared-backgrounds.js` | Background/occupation tables |
| `shared-settings.js` | localStorage settings helpers |
| `shared-sheet-builder.js` | Sheet spec builder — imported by both controllers |

---

## Single Entry → Both Controllers

`generator.html` → `generator-ui.js` → `charactersheet.js`  
`charactersheet.html` → `charactersheet.js`

Both pages ultimately use `charactersheet.js → expandCompactV2()` as the single sheet-rendering path. The generator just adds character generation and UI on top.
