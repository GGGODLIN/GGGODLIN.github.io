# Complete HP / MP / SP Tank tables

New reconstruction on C26 `9897128ed177f476e4f85543ae20de5f90f27cc9`, not recovered
historical Tank code. Only these three abilities are expanded in this checkpoint.

## Fresh source check

[Abilities revision64891](https://ehwiki.org/index.php?title=Abilities&oldid=64891)
was reopened2026-10-08; the canonical page footer still names that revision.
It lists ten ranks per Tank, each adding a10-percentage-point step to the total
maximum bonus, ending at+100%. The rank costs are incremental, not cumulative:

- Incremental AP:1,2,3,3,4,4,4,5,5,5
- Cumulative AP:1,3,6,9,13,17,21,26,31,36
- HP level gates:0,25,50,75,100,120,150,200,250,300
- MP level gates:0,30,60,90,120,160,210,260,310,350
- SP level gates:0,40,80,120,170,220,270,330,390,450

Thus one complete Tank costs36AP, all three108AP. The source's level0 gate is
available to this prototype's minimum level1 character. This community revision
is evidence for the candidate table, not direct verification of current0.91
Persistent account behavior. No Isekai or external-account benefit is inferred.

## Preserved ownership and conservation

Purchases advance exactly one rank and charge only its incremental AP cost.
Learned ranks remain inactive until assigned to a Major slot. RankN applies total
factor(10+N)/10; previous factors do not stack with it. Reset refunds the sum of
actually owned ranks and consumes the existing single-reset allowance. Ten free
resets remain the unchanged candidate limit; paid resets are not introduced.

At C27 the shared Training ledger granted only the first paid Ability Boost rank;
the later [full progression](FULL-ABILITY-BOOST.md) extends that budget separately. Total AP remains levelAP+trainedAP; no rank, level, item, currency or
training completion is awarded by this expansion. Better Cure remains two ranks
with deferred continuation; other abilities and the full system backlog remain.

## Exact factors and unchanged uncertain formulas

Vitals accept exactly the eleven supported factors1.0–2.0, rejecting neighboring
floating-point values instead of rounding arbitrary inputs into a valid rank.
The existing rational tenths calculation preserves fractional source SP until
one final maximum floor. Its formulas, rounding order and applicability remain
explicit candidates; no source claim is strengthened by a passing unit test.

Tanks increase maxima, not base HP/MP/SP. Base-dependent potions, Cure and Focus
keep their base inputs. Camp reconciliation after assignment/reset retains the
existing outside-combat recovery policy; edits remain blocked throughout combat
and inter-wave pauses.

## Migration

Rules version is `persistent-0.91-training-v21`; ability model is
`complete-tanks-candidate-v1`. The previous four-key Cure/Tank ledger and earlier
three-key Tank ledger are validated with their original rank-two caps before a
detached model migration. Existing ranks, assignments, reset use and AP sources
are preserved; missing/future ranks are not granted or guessed.

Old active battles keep their original ability policy identifier and exact lower-
rank behavior. A current import cannot place a high Tank rank under an old active
rank-two policy. New battles pin the complete-Tank model. Terminal old battle
records can coexist with later legitimate camp purchases without reinterpreting
their recorded events or payouts.

## Verification

New tests cover every source gate and cost, total36 refunds, all supported factor
values against an independent integer oracle, adjacent-float rejection, ownership
versus assignment, reset exhaustion, trained-AP conservation, unsupported imports,
base-dependent restoratives, current UI cap/cancel/purchase wording, and a frozen
C26 paid-Boost/two-rank Arena replay. The latter uses a clearly labeled synthetic
funded level60 profile executed by the actual previous runtime.

Inherited lower-rank cases remain enabled. Only assertions whose public contract
changed (full tables/model/cap and permitted factors) were adapted. Build receipts
separately record the four intentionally changed gameplay integration modules and
hash-check all unaffected modules. Source/VM acceptance is not browser/mobile or
original-server validation.
