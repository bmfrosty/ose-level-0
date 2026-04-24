# Function and Constant Flowchart

Detailed dependency graphs showing which functions and constants flow between modules, and
how they depend on each other within `shared-core.js`.

**Color key:**
- 🟪 Purple = data leaf (shared-class-info.js / shared-race-info.js)
- 🟩 Green = shared-core.js
- 🟥 Red = gen-core.js / gen-ui.js
- 🟦 Blue = cs-core.js / cs-sheet-page.js
- ⬜ Grey = internal-only (not called by any controller)

---

## 1. Class data flow

What flows from `CLASS_INFO` through `shared-core.js` to each controller.

```mermaid
flowchart LR
    classDef dataLeaf fill:#c084fc,stroke:#7e22ce,color:#000
    classDef shared   fill:#90EE90,stroke:#228B22,color:#000
    classDef genFlow  fill:#ff6b6b,stroke:#c00,color:#fff
    classDef csFlow   fill:#6bb5ff,stroke:#0066cc,color:#000
    classDef internal fill:#d0d0d0,stroke:#888,color:#333

    subgraph sci["shared-class-info.js"]
        CLASS_INFO["CLASS_INFO"]
    end

    subgraph sc["shared-core.js"]
        getClassInfo["getClassInfo()"]
        getPrimeReq["getPrimeRequisites()"]
        getClassAb["getClassAbilities()"]
        getAbAtLevel["getAbilitiesAtLevel()"]
        canRace["canRaceTakeClass()"]
        meetsReq["meetsRequirements()"]
        getProgData["getClassProgressionData()"]
        getClassFeat["getClassFeatures()"]
        getBasicAb["getBasicModeClassAbilities()"]
        getMaxLv["getMaxLevel()"]
        CLS_CODE["CLS_CODE"]
    end

    CLASS_INFO --> getClassInfo
    CLASS_INFO --> getPrimeReq
    CLASS_INFO --> getClassAb
    CLASS_INFO --> getAbAtLevel
    CLASS_INFO --> canRace
    CLASS_INFO --> meetsReq
    CLASS_INFO --> CLS_CODE

    getPrimeReq --> G1["gen-ui.js\ncs-sheet-page.js"]
    getProgData --> G2["gen-ui.js\ncs-sheet-page.js"]
    getClassFeat --> G3["gen-ui.js\ncs-sheet-page.js"]
    getBasicAb --> G4["gen-ui.js\ncs-sheet-page.js"]
    getMaxLv --> G5["gen-ui.js"]
    CLS_CODE --> G6["gen-ui.js"]

    class CLASS_INFO dataLeaf
    class getClassInfo,getClassAb,getAbAtLevel,canRace,meetsReq internal
    class getPrimeReq,getProgData,getClassFeat,getBasicAb,getMaxLv,CLS_CODE shared
    class G1,G2,G3,G4,G5,G6 genFlow
```

---

## 2. Race data flow

What flows from `RACE_INFO` through `shared-core.js` to each controller.

```mermaid
flowchart LR
    classDef dataLeaf fill:#c084fc,stroke:#7e22ce,color:#000
    classDef shared   fill:#90EE90,stroke:#228B22,color:#000
    classDef genFlow  fill:#ff6b6b,stroke:#c00,color:#fff
    classDef csFlow   fill:#6bb5ff,stroke:#0066cc,color:#000
    classDef internal fill:#d0d0d0,stroke:#888,color:#333

    subgraph sri["shared-race-info.js"]
        RACE_INFO["RACE_INFO"]
    end

    subgraph sc["shared-core.js"]
        normRace["normalizeRaceName()"]
        getRaceI["getRaceInfo()"]
        getRaceAb["getRaceAbilitiesAtLevel()"]
        getAdvRace["getAdvancedModeRacialAbilities()"]
        getMaxLv["getMaxLevel()"]
        meetsMin["meetsRacialMinimums()"]
        checkMin["checkRacialMinimums()"]
        getAvail["getAvailableClasses()"]
        applyMods["applyRacialAbilityModifiers()"]
        applySave["applyRacialSaveModifiers()"]
        RACE_CODE["RACE_CODE"]
    end

    RACE_INFO --> normRace
    RACE_INFO --> getRaceI
    RACE_INFO --> getRaceAb
    RACE_INFO --> getMaxLv
    RACE_INFO --> meetsMin
    RACE_INFO --> checkMin
    RACE_INFO --> getAvail
    RACE_INFO --> applyMods
    RACE_INFO --> applySave
    RACE_INFO --> RACE_CODE

    normRace --> getRaceI
    normRace --> getRaceAb
    normRace --> getMaxLv
    normRace --> meetsMin
    normRace --> checkMin
    normRace --> getAvail
    getRaceAb --> getAdvRace

    getRaceI --> GC1["gen-ui.js\ncs-sheet-page.js"]
    getAdvRace --> GC2["gen-ui.js\ncs-sheet-page.js"]
    checkMin --> G1["gen-ui.js"]
    getAvail --> G2["gen-ui.js"]
    getMaxLv --> G3["gen-ui.js"]
    applySave --> G4["gen-ui.js"]
    applyMods --> GC3["gen-core.js\n(internal)"]
    RACE_CODE --> G5["gen-ui.js"]

    class RACE_INFO dataLeaf
    class normRace,getRaceAb,meetsMin internal
    class getRaceI,getAdvRace,checkMin,getAvail,getMaxLv,applySave,RACE_CODE shared
    class GC1,GC2 csFlow
    class G1,G2,G3,G4,G5,GC3 genFlow
```

---

## 3. Ability score math — internal call chain

Functions that call other functions within `shared-core.js` before reaching any controller.

```mermaid
flowchart TD
    classDef shared   fill:#90EE90,stroke:#228B22,color:#000
    classDef internal fill:#d0d0d0,stroke:#888,color:#333

    rollSingle["rollSingleDie()"]
    rollDice["rollDice()"]
    rollAbScore["rollAbilityScore()"]
    rollAb["rollAbilities()"]
    meetsTough["meetsToughCharactersRequirements()"]
    meetsPR["meetsPrimeRequisiteRequirements()"]
    calcMod["calculateModifier()"]

    rollSingle --> rollDice
    rollDice --> rollAbScore
    rollAbScore --> rollAb
    meetsTough --> rollAb
    meetsPR --> rollAb
    calcMod -.-> rollHitPoints["rollHitPoints()"]
    calcMod -.-> calcSaves["calculateSavingThrows()"]
    calcMod -.-> applyMods["applyRacialAbilityModifiers()"]

    rollAb --> G["gen-ui.js"]
    rollHitPoints --> G
    calcMod --> G
    calcMod --> C["cs-sheet-page.js"]
    calcSaves -.-> GC["gen-core.js (internal)"]

    class rollSingle,rollDice,rollAbScore,meetsTough,meetsPR internal
    class rollAb,rollHitPoints,calcMod shared
```

---

## 4. gen-ui.js — what it directly names

All identifiers that `gen-ui.js` references by name (sourced from `gen-core.js` re-exports).

```mermaid
flowchart LR
    classDef genFlow  fill:#ff6b6b,stroke:#c00,color:#fff
    classDef shared   fill:#90EE90,stroke:#228B22,color:#000
    classDef dataLeaf fill:#c084fc,stroke:#7e22ce,color:#000

    genui["gen-ui.js"]

    subgraph ability["Ability scores"]
        calcMod["calculateModifier"]
        fmtMod["formatModifier"]
        xpBonus["calculateXPBonus"]
        rollAb["rollAbilities"]
    end

    subgraph classG["Class"]
        getPrimeReq["getPrimeRequisites"]
        getProgData["getClassProgressionData"]
        getClassFeat["getClassFeatures"]
        getBasicAb["getBasicModeClassAbilities"]
        getMaxLv["getMaxLevel"]
    end

    subgraph raceG["Race"]
        getRaceI["getRaceInfo"]
        getAdvRace["getAdvancedModeRacialAbilities"]
        applySave["applyRacialSaveModifiers"]
        applyAdj["applyRacialAdjustments"]
        checkMin["checkRacialMinimums"]
        getAvail["getAvailableClasses"]
        getClassReq["getClassRequirements"]
        getRaceDisp["getRaceDisplayName"]
        getClsDisp["getClassDisplayName"]
    end

    subgraph hpGold["HP / Gold"]
        rollHP["rollHitPoints"]
        rollGold["rollStartingGold"]
        calcGold["calcStartingGold"]
    end

    subgraph codes["Codes / Modes"]
        PROG_CODE["PROG_CODE"]
        CLS_CODE["CLS_CODE"]
        RACE_CODE["RACE_CODE"]
        RCM_CODE["RCM_CODE"]
        progLabel["progModeLabel"]
        PROG_TABLES["PROGRESSION_TABLES"]
    end

    subgraph genOwn["gen-core own"]
        readScores["readAbilityScores"]
        getRndName["getRandomName"]
        genChar["generateCharacterV3"]
        getAllBg["getAllBackgroundTables"]
        getRndBg["getRandomBackground"]
        purchase["purchaseEquipment"]
        getDemihuman["getDemihumanLimits"]
    end

    genui --> ability
    genui --> classG
    genui --> raceG
    genui --> hpGold
    genui --> codes
    genui --> genOwn

    class genui genFlow
```

---

## 5. cs-sheet-page.js — what it directly names

All identifiers that `cs-sheet-page.js` references by name (sourced from `cs-core.js` re-exports).

```mermaid
flowchart LR
    classDef csFlow fill:#6bb5ff,stroke:#0066cc,color:#000

    csjs["cs-sheet-page.js"]

    subgraph ability["Ability scores"]
        calcMod["calculateModifier"]
        xpBonus["calculateXPBonus"]
    end

    subgraph classC["Class"]
        getPrimeReq["getPrimeRequisites"]
        getProgData["getClassProgressionData"]
        getClassFeat["getClassFeatures"]
        getBasicAb["getBasicModeClassAbilities"]
        HDP["HIT_DICE_PROGRESSIONS"]
        HDS["HIT_DICE_SCALE"]
        PROG_TABLES["PROGRESSION_TABLES"]
        progLabel["progModeLabel"]
    end

    subgraph raceC["Race"]
        getRaceI["getRaceInfo"]
        getAdvRace["getAdvancedModeRacialAbilities"]
        calcSaves["calculateSavingThrows"]
        getRaceDisp["getRaceDisplayName"]
        getClsDisp["getClassDisplayName"]
    end

    subgraph hpCreate["HP / Character"]
        parseHD["parseHitDice"]
        createChar["createCharacter"]
        purchase["purchaseEquipment"]
    end

    subgraph cs["cs-core own"]
        buildOpts["buildOptionsLine"]
        encodeCP["encodeCompactParams"]
        decodeCP["decodeCompactParams"]
        renderHTML["renderCharacterSheetHTML"]
        getModEff["getModifierEffects"]
        compress["compressToBase64Url"]
        dispSheet["displayCharacterSheet"]
        expandCP["expandCompactV2"]
    end

    csjs --> ability
    csjs --> classC
    csjs --> raceC
    csjs --> hpCreate
    csjs --> cs

    class csjs csFlow
```

---

## 6. Move candidate map

Functions currently in `shared-core.js` that could relocate without creating circular imports.

```mermaid
flowchart LR
    classDef dataLeaf fill:#c084fc,stroke:#7e22ce,color:#000
    classDef shared   fill:#90EE90,stroke:#228B22,color:#000
    classDef blocked  fill:#ffd580,stroke:#b8860b,color:#000

    subgraph sci["shared-class-info.js (current)"]
        CLASS_INFO["CLASS_INFO"]
    end

    subgraph sciAdd["→ could add to shared-class-info.js"]
        getClassInfo["getClassInfo()"]
        getPrimeReq["getPrimeRequisites()"]
        getClassAb["getClassAbilities()"]
        getAbAtLevel["getAbilitiesAtLevel()"]
        meetsReq["meetsRequirements()"]
    end

    subgraph sri["shared-race-info.js (current)"]
        RACE_INFO["RACE_INFO"]
    end

    subgraph sriAdd["→ could add to shared-race-info.js"]
        LEGACY["LEGACY_RACE_NAMES\nnormalizeRaceName()"]
        getRaceI["getRaceInfo()"]
        getRaceAb["getRaceAbilitiesAtLevel()"]
        getAdvRace["getAdvancedModeRacialAbilities()"]
        getMaxLv["getMaxLevel()"]
        meetsMin["meetsRacialMinimums()"]
        checkMin["checkRacialMinimums()"]
        getAvail["getAvailableClasses()"]
    end

    subgraph stay["stays in shared-core.js\n(needs other shared-core logic)"]
        applyMods["applyRacialAbilityModifiers()\nneeds calculateModifier"]
        applySave["applyRacialSaveModifiers()\nneeds resolveFormula"]
        calcSaves["calculateSavingThrows()\nneeds PROGRESSION_TABLES"]
        calcAttack["calculateAttackBonus()\nneeds PROGRESSION_TABLES"]
        getClsReq["getClassRequirements()\nreads CLASS_INFO + RACE_INFO"]
        canRace["canRaceTakeClass()\nneeds normalizeRaceName (move first)"]
    end

    CLASS_INFO --> getClassInfo
    CLASS_INFO --> getPrimeReq
    CLASS_INFO --> getClassAb
    CLASS_INFO --> getAbAtLevel
    CLASS_INFO --> meetsReq

    RACE_INFO --> LEGACY
    LEGACY --> getRaceI
    LEGACY --> getRaceAb
    LEGACY --> getMaxLv
    LEGACY --> meetsMin
    LEGACY --> checkMin
    LEGACY --> getAvail
    getRaceAb --> getAdvRace

    class CLASS_INFO,RACE_INFO dataLeaf
    class getClassInfo,getPrimeReq,getClassAb,getAbAtLevel,meetsReq,LEGACY,getRaceI,getRaceAb,getAdvRace,getMaxLv,meetsMin,checkMin,getAvail sciAdd
    class applyMods,applySave,calcSaves,calcAttack,getClsReq,canRace blocked
```

---

## 7. Dead exports (no callers)

These are exported from `shared-core.js` but referenced by nothing in the project.

| Export | File | Comment |
|--------|------|---------|
| `WEAPON_QUALITIES` | shared-core.js | Weapon tag data — weapon query helpers exist but are also dead |
| `getAllWeaponNames` | shared-core.js | |
| `getAllArmorNames` | shared-core.js | |
| `getWeaponsByQuality` | shared-core.js | |
| `getBluntWeapons` | shared-core.js | |
| `getMeleeWeapons` | shared-core.js | |
| `getMissileWeapons` | shared-core.js | |
| `getTwoHandedWeapons` | shared-core.js | |
| `weaponHasQuality` | shared-core.js | |
| `getWeaponData` | shared-core.js | |
| `getArmorData` | shared-core.js | |
| `getXPToNextLevel` | shared-core.js | Bound into PROGRESSION_TABLES but no direct external caller |
| `getNameTable` | gen-core.js | Name table accessor — unused |
| `getAvailableRaces` | gen-core.js | Race list — unused |
| `showDescriptionAnyway` | shared-race-info.js | Debug toggle — not yet wired to display logic |
