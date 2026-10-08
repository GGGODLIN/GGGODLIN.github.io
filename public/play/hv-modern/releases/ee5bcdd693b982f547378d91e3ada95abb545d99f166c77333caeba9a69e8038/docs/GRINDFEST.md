# Full-length Grindfest, bounded local prototype

Checkpoint20 opens the full1,000-round Normal-mode progression. It is a partial reconstruction: the complete round count is implemented, but the complete original encounter/drop system is not.

## Source register

Canonical pages read2026-10-07; observed footer revisions:

- [Grindfest](https://ehwiki.org/wiki/Grindfest),65054:1,000rounds,1stamina paid to enter, usual winning-round cost, EXP multiplier1, and5,000Credits after all rounds. Monster count is random and tends to grow. The page marks initial50%damage and+0.4percentage-points per round with question marks. Ordinary drops, additional crystals and occasional bosses are documented but not implemented here
- [Stamina](https://ehwiki.org/wiki/Stamina),65230: at least2stamina to start; Great≥60 gives doubleEXP and consumes0.03 per won round; Normal≥1 consumes0.02; exhausted<1 gives noEXP/Credits/drops. Regeneration1/hour continues in battle. Flee/defeat does not charge the incomplete round. No external drink, donation or RiddleMaster compensation is granted
- [Experience Points](https://ehwiki.org/wiki/Experience_Points),65116: the existing candidate monsterEXP formula is retained. It is summed across the won round then ceiled, with that rounding still unverified
- [Battles](https://ehwiki.org/wiki/Battles),64927: at most10monsters; explicit continuation between rounds. The existing engine's turn/tick/round distinctions and post-series recovery remain unchanged

## Implemented loop

Preview and cancel are read-only. Confirmation checks the same shared stamina as Arena, pays exactly1, starts round1 and reserves the series. There is no daily entry limit. Entry requires an EXP-ledger character; legacy training-only characters are not silently converted or givenEXP.

Each won round grants candidateEXP and consumes current-status stamina exactly once. The player must explicitly Continue. Waiting, navigation, closing and reloading do not advance combat; saved intermissions retainHP/MP/SP/OC, cooldowns, effects and the pending next round. Equipment, allocation and ability changes stay locked while a series is active. To retreat from intermission, Continue first, then use the existing timed flee action; there is no free safe-exit substitute.

Earlier won-roundEXP survives retreat/defeat. Entry cost and earlier winning-round costs are not refunded. Only full1,000-round victory awards5,000Credits, and the existing exhausted-state exclusion applies. No guaranteed equipment, fabricated crystal reward or substitute drop is added. Outside combat, the normal three-resource recovery occurs without refilling potions orOC.

## Explicit authored encounter policy

These inputs are not represented as the original generation formula:

- `maxCount = min(10,3+floor((round−1)/125))`; `minCount = max(1,maxCount−2)`; uniform local integer draw between them at each new wave. Early waves have1–3 enemies; final waves8–10
- Original wolf/golem/wraith templates cycle through the existing two authored pools. PL100 remains a fixture. The displayed monster level is the player's level when that wave is spawned; itsHP/attack/resistance template is not inferred from thatPL
- Incoming damage multiplier is `(500+4×(round−1))/1000`:0.5 at first wave,4.496 at wave1,000. It is applied before the existing final damage floor. This follows the wiki's explicitly uncertain candidate, not a verified server measurement
- Normal difficulty only. No hidden difficulty scaling, boss rate, loot weights, crystal distribution, proficiency growth or RiddleMaster outcome is invented

Attack timing, incoming mitigation, accuracy-contest inputs and other unresolved mechanics keep their existing labels. Better Cure's fixed0-proficiency fixture stays explicit. EXP remains subject to the current prototype's level500 ledger cap; that cap is a separate unfinished progression boundary.

## Bounded saves and migration

`grindfest` stores totalentries/clears and one current-or-latest series, one completed-round watermark and one latest-round receipt. It never appends1,000round receipts. Older totals are retained through the shared history archive. The command watermark and128-result cache preserve rejection of expired repeats; bounded logs and64history summaries remain unchanged.

Older saves gain only an empty Grindfest record and a zero Grindfest audit category. Strict old audit validation precedes this additive migration. No Credits,EXP, stamina, gear, AP or prior battle result is recalculated. Existing Arena/training replay goldens remain exact. See [GRINDFEST-LEDGER](./GRINDFEST-LEDGER.md) for transaction details.

## Verification boundary

The pure ledger completes all1,000sequential settlements and checks the5,000 payout once. Engine tests run normal early waves, pause/reload/Continue/retreat, plus clearly synthetic round501 and1,000 boundaries, final defeat and reward-overflow rollback. The synthetic boundaries construct earlier ledger settlements; they are not a manually played full run. UI tests execute actual app wiring with DOM stubs for entry/cancel/retry and10-card markup. Actual cloud-browser checks remain an independent publication gate; no claim of a full1,000-round manual playthrough is made.
