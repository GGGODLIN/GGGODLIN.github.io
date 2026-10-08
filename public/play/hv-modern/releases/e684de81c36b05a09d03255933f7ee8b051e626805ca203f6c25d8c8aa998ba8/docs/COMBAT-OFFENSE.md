# Outgoing damage candidate

Policy: `outgoing-candidate-v1`, introduced in checkpoint 13. This is a partial model of player attacks, not a complete combat reconstruction.

## Evidence

Canonical live pages were read on 2026-10-07. The observed page footers identify these revisions; this is not a claim that the historical endpoints were separately retrieved:

- [Character Stats](https://ehwiki.org/wiki/Character_Stats), footer 65166: logarithmic physical/magic bases, plus eligible equipment and ability contributions. The page itself warns that derived formulas may be inaccurate
- [Physical Damage](https://ehwiki.org/wiki/Physical_Damage), footer 65271: Spirit ×2 physical damage, base critical ×1.5, final 80–120% roll in one-percentage-point steps
- [Spell Damage](https://ehwiki.org/wiki/Spell_Damage), footer 65272: elemental tier-one base multiplier 4, elemental bonus factor, base critical ×1.5, final 80–120% stepped roll

No ability, proficiency, title, Hath, Tower, equipment elemental bonus, Heartseeker, Arcane Focus or Channeling effect is granted by this increment. Proficiency coefficients require their associated equipped ability, so they cannot simply be added for free.

## Implemented subset

With ADB/MDB taken from the currently equipped original templates:

- Physical base = ln(3330 + 2 STR + DEX) / ln(1.0003) − 27029.81 + ADB
- Magic base = ln(3330 + 2 INT + WIS) / ln(1.0003) − 27039.81 + MDB
- Physical factor = 2 with effective Spirit, otherwise 1
- Fire factor = 4; Spirit does not double spell damage
- General and damage-type mitigation are separate multiplicative inputs

The local policy retains fractional bases, uses an inclusive integer roll from 80 through 120, then floors final nonnegative damage. Final rounding and uniform RNG distribution are explicit unverified choices. Xorshift32 is our local deterministic RNG, not the original server's generator.

The authored encounter has only physical and fire resistance fields. Physical resistance is the general physical mitigation input; general magic mitigation is explicitly zero, and fire resistance is the specific modifier. This does not reconstruct real monster stats. Generic equipment `defense` is not silently reinterpreted as a mitigation percentage.

C18 new series use the source-supported critical-count sequence with explicit authored opposing-contest inputs; see [COMBAT-ACCURACY](./COMBAT-ACCURACY.md). Older active series keep their8% single critical. Incoming damage, full avoidance, timing and Cure potency retain separate gaps. Cure keeps its previous `healingMagicFixture` input rather than changing indirectly when the offensive magic base changes.

## Compatibility

Each series pins its `offenseRules` at entry. Saves from C12 and earlier keep the prior linear bases, Fire ×1.7 and continuous 90–110% damage roll until that entire active series ends. Existing attributes and item numbers are not rewritten. Out-of-combat sheets and the next series use the new candidate. No completed event is recalculated.

The equipment reward policy is independently pinned as `equipmentRules`: an older active Arena finishes with its original one-draw fixed-template reward. Future series use quality rolls. This preserves the older battle's RNG continuation as well as its loot contract.

## Verified examples

Six attributes 14, ADB29/MDB2 produce physical 80.7891580173 and magic 43.7891580173. With no mitigation/critical, 80/100/120 rolls produce physical 64/80/96 and Fire 140/175/210. Spirit physical at 100% is 161; Spirit Fire remains 175. A conditional base100 with 25% general and 20% specific mitigation produces 60.

Actual frozen C12a engine fixtures test exact action events, resources, enemy HP, RNG and full Arena reward continuation. These demonstrate compatibility with this project, not matching the original server.
