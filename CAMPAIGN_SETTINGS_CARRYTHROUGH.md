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

| # | Section                  | Setting                            | Saved to Character (`cp`)? | Back to Generator? | Footer?      |
|---|--------------------------|------------------------------------|----------------------------|--------------------|--------------|
| 0 | Campaign Name            | Campaign Name (<=64 Unicode chars) | Yes -- `cn`, raw [8]       | Yes [8]            | Yes [9]      |
| 1 | Mode & Level             | Mode preset (A/B/C)                | Indirect (`m`+`l`)         | Yes [1]            | No           |
| 1 | Mode & Level             | Level                              | Yes -- `l`                 | No -- stripped     | Yes          |
| 1 | Mode & Level             | Level Mode + XP amount             | No                         | No                 | No           |
| 2 | Progressions             | Progression Mode                   | Yes -- `p`                 | Yes                | Yes          |
| 3 | Min Ability Scores       | 6 minimum values                   | Yes -- `sm`                | Yes                | Partial [10] |
| 3 | Min Ability Scores       | "Use fixed scores" checkbox        | No [2]                     | No                 | Yes [11]     |
| 4 | Race/Class Restrictions  | Race/Class Mode                    | Yes -- `rcm`               | Yes                | No [19]      |
| 4 | Race/Class Restrictions  | Exclude Spellblade                 | Yes -- `esb`               | Yes                | No [20]      |
| 4 | Race/Class Restrictions  | Race + Class pick                  | Yes -- `r`/`c` [5]         | No -- stripped     | Yes          |
| 5 | Racial Adjustment Policy | Policy value                       | Yes -- `rap`               | Yes                | Yes [12]     |
| 6 | Referee Options          | Prime Requisite Mode               | Yes -- `prm`               | Yes                | Yes          |
| 6 | Referee Options          | HP Rolling Style                   | Yes -- `hm`                | Yes                | Partial [13] |
| 6 | Referee Options          | Include Level 0 HP                 | Yes -- `il`                | Yes                | Yes          |
| 6 | Referee Options          | No Level 0 Equipment               | Yes -- `nl0`               | Yes                | Yes [18]     |
| 6 | Referee Options          | Starting Wealth (4 tiers)          | Yes -- `wp` + tiers [3]    | Yes                | Partial [14] |
| 7 | Character Name           | Name                               | Yes -- `n`                 | No -- stripped     | No [15]      |
| 8 | Player Options           | Show Undead Names                  | Yes -- `un`                | Yes [6]            | No           |
| 8 | Player Options           | 1977 Ability Ordering              | Yes -- `ao`                | Yes [6]            | No           |
| 8 | Player Options           | Hide "Human" prefix                | Yes -- `hhr`               | No -- stripped [7] | No [16]      |
| 8 | Player Options           | AC Display Mode                    | Yes -- `adm`               | Yes [4][6]         | No           |
| 8 | Player Options           | Character Sheet Branding           | Yes -- `sb`                | Yes [6]            | No [17]      |
| 8 | Player Options           | Auto-gen toggles, Open in new tab  | No                         | No                 | No           |

**Notes:**
1. Reconstructed to an equivalent preset guaranteeing the pick is clickable — not necessarily the original literal A/B/C choice.
2. Only `cp.fs=1` exists (a fact about this character's scores being fixed, not the checkbox setting itself).
3. `l0wm/l0dc/l0ds/l0dm/l0fg`, `l1wm/…`, `l2wm/…`, `xwm/…` — 20 sub-fields total, each omitted when equal to its own default.
4. `generator.html` didn't used to have a URL param for AC Display Mode at all; `adm` was added to `syncURLParams()`/`readURLParams()` (and `buildGeneratorURL()`'s reconstruction) specifically to support this row (2026-07-07).
5. Not a restriction setting like the row above it (Race/Class Mode) — this is the actual race and class the player clicked in the grid for this one character (e.g. "Elf" + "Fighter"). It's inherently specific to this character, the same way Level and Name are, which is why it's stripped from the "Back to Generator" link alongside them rather than carried through like the Campaign-tier rows.
6. Reclassified Campaign-tier (2026-07-07): a referee running a table typically wants one consistent look for every character, not a per-player choice, so it now round-trips like the rest of section 6/2/etc. instead of resetting per character.
7. Stays Character-tier, unlike the row above it — only meaningful for the specific human character that had it set (hides "Human" from that one character's race/class display), not a table-wide style choice. Stripped by both Campaign Link builders: `buildCampaignURL()` (`cs-sheet-page.js`, the "Back to Generator" link) and `buildCampaignProfileURL()` (`gen-ui.js`, the Share/QR link) — the latter was missing it until 2026-07-08, caught by automated review.
8. Stored raw in `cp.cn` (the whole `cp` blob is already gzip-compressed as a unit), but the generator.html URL param is *separately* gzip+base64url-compressed via `compressToBase64Url()`/`decompressFromBase64Url()` — unlike every other string param (`n`, race/class names, etc.), which are plain query-string values. Campaign Name can run up to 64 Unicode characters and appears on every Campaign Profile link/QR code, so it gets its own compression pass to stay compact; the others are short enough that plain percent-encoding is fine.
9. Printed directly as text under the QR code on page 2 when set (2026-07-07, `renderCharacterSheetHTML`'s QR block in `cs-core.js`) — genuinely readable, not just equality-checkable. It's also folded (along with every other Campaign-tier setting) into the `#XXXXXX` fingerprint on the page-1 footer identity line, so two sheets from the same table show a matching tag there too without a referee needing to compare the full printed name by eye.
10. Only entries above the default (3) are shown, as `Min: X≥Y`. A minimum left at the default doesn't appear at all, so a referee auditing the footer can't distinguish "explicitly set to 3" from "never touched" -- both look identical (absent).
11. Shown as `Fixed Scores` when set; otherwise the roll-attempt count (`<n> rolls`) is shown instead -- the two are mutually exclusive in the footer, so "Fixed Scores" absent implies rolled, not necessarily "checkbox off" (a referee can't distinguish "off" from "on but this row happened to roll on the first attempt" without the `Fixed Scores` tag itself, which is unambiguous when present).
12. Fixed (2026-07-07): `buildOptionsLine()` used to only push a `Racial Adj: ...` chip at `lvl === 0`. Now shown at every level -- `cp.rap` is unconditionally written by `buildCampaignRulesetCp()` (not omitted-when-default like most other fields), so there's always an explicit value.
13. Only non-default HP rolling modes push a chip (`Blessed HP`, `5e HP (...)`, `Re-roll 1s and 2s`) -- normal mode (the default) shows nothing, so its absence is the only signal it was normal.
14. Improved (2026-07-07): now shows the actual method (`Wealth: 3d6×10`, `Wealth: 50gp fixed`, or `Wealth: 20%` for xp-pct) for whichever tier applies to *this character's own level*. Still Partial, not Yes -- only one of the 4 tiers is ever relevant to a given character, so the other 3 tiers' settings remain unaudited from any single sheet; a referee would need sample characters at levels 0, 1, and 2+ to audit all of them.
15. Shown in the sheet's header table (`Character Name` column) instead, not the footer.
16. Changes what the identity line/header display (omits "Human" from the race/class name), but the toggle itself has no dedicated footer label -- its effect is visible, the setting name is not.
17. Visible via the page's title/subtitle at the top of the sheet (`OLD-SCHOOL ESSENTIALS` vs `DUNGEONS & DRAGONS`), not the footer specifically.
18. Added (2026-07-07): now always shown explicitly (`L0 Equipment: None`/`Standard`), not just on deviation from default, so absence never has to be interpreted as "default." Adding this footer line surfaced a real, previously-hidden bug: `generateZeroLevel()` never passed `noLevel0Equipment` to `generateCharacterV3()` at all, so level-0 characters always got the library's own internal default (equipment shown) regardless of the checkbox -- and the level-0 rendering path separately never checked `cp.nl0` when building the background-derived weapon/item list, so even a correctly-set `cp.nl0` wouldn't have suppressed anything. Both fixed.
19. Briefly added, then removed the same day (2026-07-07) after review: the setting's effects (racial abilities present, level exceeding normal caps, an otherwise-disallowed race/class combination) are already obvious from the rest of the sheet, so a dedicated chip was redundant noise rather than genuinely useful auditability.
20. Briefly added, then removed the same day (2026-07-07): whether *this* character is a Spellblade is already obvious from its own class, and a referee running a table already knows whether the class is allowed at all — a per-sheet confirmation chip added noise without adding real audit value.

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
  sub-fields show; `Indirect` when it only affects the `#XXXXXX` campaign
  hash (equality-checkable but not readable); `No` otherwise.
