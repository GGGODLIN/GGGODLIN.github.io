# Six ordinary Arena additions

This checkpoint extends the three early Arena candidates through Power Flux. The nine implemented challenges use sourced wave counts and clear-credit tables with the existing original monster fixtures, candidate EXP rounding, local stamina clock and equipment reward pool. They are not original-server encounter or balance reproductions.

## Verified source rows

Read 8 October 2026 through current EHWiki pages. Footer permanent links identify the revisions below; direct historical retrieval was not independently successful. `count × repetitions` expands to consecutive equal-count rounds. Every added challenge has EXP multiplier 1 and zero special/boss slots.

| Challenge | Entry / retirement level | Waves | Total rounds / monsters | First / repeat Credits | Revision |
| --- | --- | --- | --- | --- | --- |
| Road Less Traveled | 30 / 180 | 3×4,4×2,5×2 | 8 / 30 | 3000 / 600 | [55260](https://ehwiki.org/index.php?title=Road_Less_Traveled&oldid=55260) |
| A Rolling Stone | 40 / 200 | 3×4,4×2,5×2,6×2 | 10 / 42 | 4000 / 800 | [55259](https://ehwiki.org/index.php?title=A_Rolling_Stone&oldid=55259) |
| Fresh Meat | 50 / 225 | 4×4,5×2,6×2,7×2,8×2 | 12 / 68 | 5000 / 1000 | [55258](https://ehwiki.org/index.php?title=Fresh_Meat&oldid=55258) |
| Dark Skies | 60 / 250 | 4×6,5×2,6×3,7×2,8×2 | 15 / 82 | 6000 / 1000 | [55257](https://ehwiki.org/index.php?title=Dark_Skies&oldid=55257) |
| Growing Storm | 70 / 300 | 4×8,5×3,6×3,7×4,8×2 | 20 / 109 | 7000 / 1000 | [55256](https://ehwiki.org/index.php?title=Growing_Storm&oldid=55256) |
| Power Flux | 80 / 400 | 4×10,5×4,6×4,7×4,8×3 | 25 / 136 | 8000 / 1000 | [55255](https://ehwiki.org/index.php?title=Power_Flux&oldid=55255) |

[The Arena overview](https://ehwiki.org/index.php?title=Arena&oldid=64924) agrees with these totals and first-clear values. The detail rows explicitly provide repeat values. Retirement means unavailable at that level, even while the later replacing challenge remains unfinished locally. At level 400 none of the nine implemented Arenas remain available. The original three rows, their retirement levels and rewards are unchanged.

[Killzone's detail](https://ehwiki.org/index.php?title=Killzone&oldid=55208) says first 8000, while the overview says 9000. It is deferred rather than silently selecting one. Endgame and later boss/legendary encounters, token/ordinary drops, complete difficulty choices and exact enemy generation remain gaps. No periodic Draught/Elixir mechanics are introduced.

## Accounting and compatibility

The existing daily entry reservation and sequential settlement ledger remains authoritative. Entry requires sufficient stamina and the preceding clear unless that predecessor has retired. Entry itself reserves an attempt without spending Arena stamina; completed rounds consume the existing candidate amount. One UTC-day attempt is consumed by victory, defeat or flee. Crossing midnight retains the entry day. Completed-round EXP survives later loss; only complete victory pays first/repeat clear Credits and the authored equipment entitlement. Duplicate settlement pays nothing again.

Rules v28 migrate valid earlier envelopes by changing the version only after the existing migrations. No new completion, stock, AP, reward or stamina is granted. Every pre-v28 identity-bearing Arena ledger is checked against the original three IDs before current validators are used: battle, attempts, clears, archived clears, round/series receipts and retained history. Old active series preserve exact policy tags, enemy schedules, RNG, Potion resources and pending paid Training.

New ordinary histories support each challenge's round bound. The old three history bounds remain as accepted previously; schema1 compatibility code is unchanged. EXP input validation now permits the sourced maximum 8 monsters, retaining the same formula, summed-round ceiling and multiplier. Earlier series retain their original counts and therefore arithmetic.

## Verification and provenance

Run `npm run check`, `npm run build`, `npm run verify:checkpoint`.

Tests cover all source rows; complete first/repeat series; unlock/retirement boundaries; UTC entry-day/retry behavior; exhaustion, defeat and flee; save/reload; no grants; future-ID rejection; and real predecessor replay. The replay fixture was generated from frozen accepted Spirit-validation c568550 using funded synthetic level 120 profiles with paid Potion abilities/stock and pending Boost jobs, in practice, early Arena and Grindfest. Delayed enemy schedules and reduced HP in accounting tests are synthetic conveniences, not evidence of original balance.

Four runtime modules intentionally change: arena, audit-history, data and engine. Twenty-five other runtime modules, all original artwork, and all earlier recorded fixtures remain byte-identical to the accepted predecessor. App presentation changes separately; the release manifest records copied bytes and the existing root/generated-module transformations accurately. Independent source QA and native-browser acceptance are separate gates.

Arena confirmation also requires the currently open matching review and its simple sequence token. Dismissal, navigation and fresh-owner acquisition discard the review. Detached/forged target probes are synthetic handler tests; they do not establish a native delayed-callback defect or cancellation-related loss.
