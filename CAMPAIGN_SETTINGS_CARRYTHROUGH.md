# Campaign Settings Carry-Through

Tracks, for every `generator.html` setting, whether it's written onto a
generated character's compact params (`cp`, the data behind the printed
sheet / `?d=` link) and whether it's reconstructed into the "🎲 Back to
Generator" link on `charactersheet.html`.

This file is checked in (not gitignored like `PLAN_*.md`) so it travels with
PRs — **any PR that adds, removes, or changes the carry-through behavior of
a generator setting should update this table in the same PR.** Reviewers can
diff it directly instead of re-deriving carry-through behavior from the code
on every review.

See `PLAN_CAMPAIGN_PROFILES.md` for the Campaign vs. Character tier
classification this table assumes, and `CLAUDE.md` for the broader project
architecture.

## Table

Each row has at most **one** note, covering every column that needs
explanation for that setting — not scattered per-cell references.

"Panel?" is which `charactersheet.html` panel(s) a setting can be edited in
after a character already exists: **C** = 🔧 Modify Character, **S** = ⚙️
Edit Sheet Options, **L** = ⬆ Level Up. Blank means it's not editable in any
of them (only ever set during fresh generation, or — Campaign Name only —
deliberately excluded from character-sheet editing entirely).

| # | Section                  | Setting                            | Saved to Character (`cp`)? | Back to Generator? | Footer? | In Hash? | Panel? | Notes |
|-|------------------------|----------------------------------|--------------------------|------------------|-------|--------|------|-----|
| 0 | Campaign Name            | Campaign Name (<=72 Unicode chars) | Yes -- `cn`, raw           | Yes                | Yes     | Yes      |        | [1]   |
| 1 | Mode & Level             | Mode preset (A/B/C)                | Indirect (`m`+`l`)         | Yes                | No      | Yes      |        | [2]   |
| 1 | Mode & Level             | Level                              | Yes -- `l`                 | No -- stripped     | Yes     | No       | L      |       |
| 1 | Mode & Level             | Level Mode + XP amount             | No                         | No                 | No      | No       |        |       |
| 2 | Progressions             | Progression Mode                   | Yes -- `p`                 | Yes                | Yes     | Yes      | C      |       |
| 3 | Min Ability Scores       | 6 minimum values                   | Yes -- `sm`                | Yes                | Partial | Yes      |        | [3]   |
| 3 | Min Ability Scores       | "Use fixed scores" checkbox        | No                         | No                 | Yes     | No       |        | [4]   |
| 4 | Race/Class Restrictions  | Race/Class Mode                    | Yes -- `rcm`               | Yes                | No      | Yes      | C      | [5]   |
| 4 | Race/Class Restrictions  | Exclude Spellblade                 | Yes -- `esb`               | Yes                | No      | Yes      | C      | [6]   |
| 4 | Race/Class Restrictions  | Race + Class pick                  | Yes -- `r`/`c`             | No -- stripped     | Yes     | No       | L      | [7]   |
| 5 | Racial Adjustment Policy | Policy value                       | Yes -- `rap`               | Yes                | Yes     | Yes      | C      | [8]   |
| 6 | Referee Options          | Prime Requisite Mode               | Yes -- `prm`               | Yes                | Yes     | Yes      |        |       |
| 6 | Referee Options          | HP Rolling Style                   | Yes -- `hm`                | Yes                | Partial | Yes      | C      | [9]   |
| 6 | Referee Options          | Include Level 0 HP                 | Yes -- `il`                | Yes                | Yes     | Yes      | C      |       |
| 6 | Referee Options          | No Level 0 Equipment               | Yes -- `nl0`               | No -- stripped     | Yes     | No       | S      | [10]  |
| 6 | Referee Options          | Starting Wealth (4 tiers)          | Yes -- `wp` + tiers        | Yes                | Partial | Yes      |        | [11]  |
| 7 | Character Name           | Name                               | Yes -- `n`                 | No -- stripped     | No      | No       | S      | [12]  |
| 8 | Player Options           | Show Undead Names                  | Yes -- `un`                | Yes                | No      | No       | S      | [13]  |
| 8 | Player Options           | 1977 Ability Ordering              | Yes -- `ao`                | Yes                | No      | No       | S      | [14]  |
| 8 | Player Options           | Hide "Human" prefix                | Yes -- `hhr`               | No -- stripped     | No      | No       |        | [15]  |
| 8 | Player Options           | AC Display Mode                    | Yes -- `adm`               | Yes                | No      | No       | S      | [16]  |
| 8 | Player Options           | Character Sheet Branding           | Yes -- `sb`                | Yes                | No      | No       | S      | [17]  |
| 8 | Player Options           | Auto-gen toggles, Open in new tab  | No                         | No                 | No      | No       |        |       |

**Notes:**

1. Gets its own gzip+base64url compression pass, separate from every other (plain query-string) param, because it can run up to 72 Unicode characters and appears on every Campaign Profile link/QR code -- keeping it compact matters more here than for any other field. Not editable anywhere in character-sheet editing (2026-07-09): it's part of the campaign hash, so it would technically qualify for Modify Character, but there's no real reason a player or referee would want to rename an existing character's campaign from that character's own sheet -- it only ever changes by generating a new Campaign Link.
2. Reconstructed to an equivalent preset guaranteeing the pick is clickable -- not necessarily the original literal A/B/C choice.
3. Only entries above the default (3) are shown, as `Min: X≥Y`. A minimum left at the default doesn't appear at all, so a referee auditing the footer can't distinguish "explicitly set to 3" from "never touched" -- both look identical (absent).
4. No URL param exists for the checkbox itself -- only `cp.fs=1` exists (a fact about this character's scores being fixed). In the footer, shown as `Fixed Scores` when set, otherwise the roll-attempt count (`<n> rolls`) is shown instead; the two are mutually exclusive, so "Fixed Scores" absent implies rolled, not necessarily "checkbox off."
5. No footer chip: the setting's effects (racial abilities present, level exceeding normal caps, an otherwise-disallowed race/class combination) are already obvious from the rest of the sheet, so a dedicated chip would be redundant noise.
6. No footer chip: whether *this* character is a Spellblade is already obvious from its own class, and a referee running a table already knows whether the class is allowed at all -- a per-sheet confirmation chip would add noise without adding real audit value. Fixed 2026-07-09: the level 0->1 class-up step (charactersheet.html's Level Up panel) never actually checked this at all, so a level-0 character from a campaign with Spellblade excluded could still level into it, bypassing the restriction generation enforces -- now filtered there too. This live effect (not just a hash/carry-through fact) is also why it stayed in Modify Character rather than moving to Edit Sheet Options.
7. Not a restriction setting like the Race/Class Mode row above it -- this is the actual race and class the player clicked in the grid for this one character (e.g. "Elf" + "Fighter"). It's inherently specific to this character, the same way Level and Name are, which is why it's stripped from the "Back to Generator" link alongside them. The "L" in Panel? only covers the class half, and only at the level 0->1 class-up step (Level Up's own picker) -- race is fixed at level 0 and never editable again, and an existing level 1+ character's class can't be changed by any panel either.
8. `cp.rap` is unconditionally written (not omitted-when-default like most other fields), so there's always an explicit value to show in the footer at every level, not just level 0.
9. There are two distinct HP-mode values in play (2026-07-08): the **campaign** value, `cp.hm` itself -- the referee's raw chosen style, always stored unmodified regardless of any individual character -- and an unstored, derived **character** value used only for actually rolling that one character's HP (a Human with racial Blessed eligible, gated by Race/Class Restrictions allowing human abilities, rolls Blessed regardless of `cp.hm`, except under 5e which always wins outright since there's no die to double). This chip deliberately shows the **campaign** value (`cp.hm`), not the character value -- every sheet from the same campaign shows the same chip here, so a referee can spot a character whose `cp.hm` has drifted from the rest of the table (e.g. edited via Modify Character) even though it wouldn't affect that character's own dice. The Blessed racial ability itself is still visible on a qualifying character's own printed ability list, so this doesn't hide that a Human actually rolled Blessed -- it's just not duplicated into this chip too.
10. Means "does this character keep its 0-level equipment once it's past level 0," applying only to level 1+ rendering -- a level-0 character's own gear IS its whole equipment, so it always shows unconditionally regardless of this setting. This is a per-character/per-player choice, not a table-wide policy, so it's Character-tier despite `cp.nl0` living in generator.html's "6. Referee Options" section with no UI relocation there. Both campaign-link builders strip it (matching `hhr`), which also automatically excludes it from the hash, and in character-sheet editing it lives in Edit Sheet Options (freely editable, doesn't set `cp.mx`).
11. `l0wm/l0dc/l0ds/l0dm/l0fg`, `l1wm/…`, `l2wm/…`, `xwm/…` -- 20 sub-fields total, each omitted from `cp` when equal to its own default. The footer shows the actual method (`Wealth: 3d6×10`, `Wealth: 50gp fixed`, or `Wealth: 20%` for xp-pct) only for whichever tier applies to *this character's own level* -- still only Partial, since the other 3 tiers' settings remain unaudited from any single sheet.
12. Shown in the sheet's header table (`Character Name` column) instead, not the footer.
13. A referee running a table typically wants one consistent look for every character, not a per-player choice, so it round-trips through "Back to Generator" instead of resetting per character. Excluded from the `#XXXXXX` campaign hash, though, since Edit Sheet Options lets a player freely tweak it without marking the character Modified -- a purely cosmetic per-sheet tweak shouldn't make two characters from the same table look like they're from different campaigns.
14. Same reasoning as Show Undead Names (note 13): Campaign-tier for "Back to Generator" purposes, but excluded from the hash since it's freely player-editable via Edit Sheet Options without marking Modified.
15. Stays Character-tier, unlike the row above it -- only meaningful for the specific human character that had it set (hides "Human" from that one character's race/class display), not a table-wide style choice. Stripped by both campaign link builders.
16. Same reasoning as Show Undead Names (note 13).
17. Same reasoning as Show Undead Names (note 13). Visible via the page's title/subtitle at the top of the sheet (`OLD-SCHOOL ESSENTIALS` vs `DUNGEONS & DRAGONS`), not the footer.

## Maintenance

- **Adding a new generator setting?** Add a row here describing whether it's
  written to `cp` and whether `buildGeneratorURL()`/`buildCampaignURL()`
  (`cs-sheet-page.js`) carry it into the "Back to Generator" link.
- **Character-tier settings should be stripped** from the "Back to
  Generator" link (see `buildCampaignURL()`'s strip list). If a new
  Character-tier setting is added to `cp`, add it to that strip list and
  mark this table's "Back to Generator" column "No -- stripped" — don't
  leave it as an undiscovered leak (this table caught `sb` doing exactly
  that once already).
- **Campaign-tier settings should round-trip** through `cp` and the "Back
  to Generator" link (see `buildCampaignRulesetCp()` in `gen-ui.js` for
  settings that aren't otherwise needed to regenerate/level the character
  itself).
- **Footer column is not full gating** — it tracks whether a referee can
  audit a setting's actual value just by reading the printed sheet's footer
  (`renderCharacterSheetHTML`'s footer block in `cs-core.js`, driven by
  `buildOptionsLine()`), separately from whether it's carried in `cp` or the
  "Back to Generator" link. Mark `Yes` only when the setting's value is
  unambiguously readable as text; `Partial` when only some of its states or
  sub-fields show; `No` otherwise.
- **"In Hash?" column** tracks whether a setting's value feeds into the
  `#XXXXXX` campaign hash (`expandCompactV3()` in `cs-sheet-page.js`,
  `shortHash()` of `buildCampaignURL()`'s output with `un`/`ao`/`adm`/`sb`
  additionally excluded). A setting stripped from the "Back to Generator"
  link is automatically `No` here too, since the hash is computed from that
  same link.
- **This table also decides Modify Character vs. Edit Sheet Options scope**
  (settled 2026-07-09, `charactersheet.html`): a setting belongs in Modify
  Character if it mechanically modifies an existing character and/or its
  "In Hash?" column is `Yes` (either condition is enough). Otherwise it
  belongs in Edit Sheet Options — freely player-editable, doesn't set
  `cp.mx`. Settings that are neither (only matter during fresh generation,
  e.g. Min Ability Scores, Prime Requisite Mode, Starting Wealth) don't
  belong in either panel. Campaign Name is the one deliberate exception:
  it qualifies on hash alone, but isn't editable in *either* panel — see
  note 1.
- **"Panel?" column** is the concrete answer to the bullet above — C/S/L
  for whichever of Modify Character / Edit Sheet Options / Level Up
  actually has an editable field for that setting today (blank if none do).
  Keep this in sync whenever a field moves between panels or a panel gains
  or loses one — it's meant to be checkable directly against the HTML
  (`grep` for `mc-`/`ep-`/`lup-` prefixed field IDs in `charactersheet.html`)
  rather than re-derived from the scope rule each time.
- **One note per row.** If a row needs explanation, put everything relevant
  (across every column) into a single numbered note, rather than adding
  separate references per cell or reusing one note across multiple rows.
  Keep notes numbered in table order, top to bottom.
