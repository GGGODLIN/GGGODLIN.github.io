# Historical baseline restoratives and current Potion extension

Checkpoint 14 introduces `restoratives-candidate-v1` for newly entered series. Existing active series retain `legacy-training-v1` until the entire encounter ends; potions already owned are never replenished or converted.

The newer Potion-only ability extension is documented in [POTION-ABILITIES](POTION-ABILITIES.md). It preserves both active historical policies below and adds the assigned five-rank Health/Mana potency tables for new series. The following describes the original baseline checkpoint.

## Public evidence

Canonical pages read on 2026-10-07:

- [Items · Restoratives](https://ehwiki.org/wiki/Items#Restoratives), observed footer 65165: Health Potion restores 100% base health; Mana Potion restores 50% base mana
- [Character Menu · Item Inventory](https://ehwiki.org/wiki/Character_Menu#Item_Inventory), observed footer 64958: general battle-item cooldown is 40 turns, five initial general slots, automatic restocking from owned inventory
- [Character Stats · Vitals](https://ehwiki.org/wiki/Character_Stats#Vitals), observed footer 65166: restorative references use the pre-ability base, rather than tank-expanded maxima

These are observed live-page footers, not separately retrieved historical endpoints or original-server validation.

## Local implementation

HP amount = floor(baseHp × 1), MP amount = floor(baseMp × 0.5), then cap at the current maximum. At the existing authored Lv20/six-14 profile, baseHp376 and baseMp86 yield 376 HP and 43 MP before the cap. Odd baseMp87 yields 43 under the explicit final-floor policy. Original server fractional rounding remains unverified.

`getStats` now distinguishes baseHp/baseMp/baseSp from maxHp/maxMp/maxSp. With no ability effects implemented they are currently equal. This prepares the correct boundary for future tanks without changing any existing maximum.

Each accepted potion consumes one owned item, advances the player's action counter, costs zero internal time and draws no RNG. Its cooldown starts at40. Later ordinary actions or other item actions reduce it; items do not advance spell cooldowns. Precise decrement-order reconstruction remains a candidate contract. Continue does not reduce cooldowns. Reload, intermissions and duplicate commands preserve the state.

The older active-series branch retains HP50%, MP40% and cooldown4, including prior event text and RNG. New series switch to the source-based restorative policy. Full resource rejection remains the prototype's anti-misclick behavior.

No draught, elixir, spirit potion, battle-loadout editor, ability enhancement, free stock or over-time effect is implied. The existing two potion buttons represent two of the documented five initial general slots; the full inventory/slot system is still pending. NPC Health Potion purchases are described separately in SUPPLIES.md.
