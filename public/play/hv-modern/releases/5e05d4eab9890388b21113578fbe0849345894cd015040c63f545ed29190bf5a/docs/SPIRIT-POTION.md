# Instantaneous Spirit Potion candidate

This checkpoint extends accepted Mana source `7ce13667ff75b269999677c5da47f20d8eb08f7f`.
It completes one instantaneous Spirit Potion path: owned inventory, paid NPC
buy/sell, battle consumption and the five Better Spirit Pots ranks. Draught and
Elixir periodic effects remain unfinished; cards and AP confirmations disclose
that scope before purchase. Overlap/refresh, periodic rounding and round
persistence remain unresolved and are not implemented here.

## Sources and prices

Current community pages were checked2026-10-08: [Items](https://ehwiki.org/wiki/Items#Restoratives)
(footer65165), [Abilities](https://ehwiki.org/wiki/Abilities#General) (64891),
[Character Menu](https://ehwiki.org/wiki/Character_Menu#Item_Inventory) (64958),
[Action Speed](https://ehwiki.org/wiki/Action_Speed) (64923), and
[Bazaar](https://ehwiki.org/wiki/Bazaar#Item_Shop) (64945).

Spirit Potion instantly restores50% of baseSP without an assigned upgrade. It
uses the existing ordinary-item40-action cooldown and zero internal time. NPC
buy100/sell4 Credits and ordinary unlimited stock are documented; the green
`#00B000` row and legend establish supply, not the price alone. No starting stock
or external discount is inferred. The sale request cap99,999 and held-stock cap
999,999 are local safeguards; the purchase request limit99,999 is documented.

| Better Spirit Pots rank | Level | Incremental AP | Total AP | Spirit Potion % baseSP |
|---|---:|---:|---:|---:|
| 1 | 0 | 2 | 2 | 55 |
| 2 | 90 | 3 | 5 | 60 |
| 3 | 160 | 5 | 10 | 65 |
| 4 | 240 | 7 | 17 | 70 |
| 5 | 400 | 9 | 26 | 75 |

These are total rank percentages, not summed increases. General abilities use
Major slots. Purchase alone enables no effect; one assignment activates the owned
rank. The five Major slots stay five: six implemented Major abilities now compete
for them. No free slot, rank or AP is added. The executable profile starts at
level1, while the source's first-rank level0 gate is retained in the table.

Community tables remain candidates for Persistent0.91, not original-server
verification. The wiki warns that some pages may be outdated; no authenticated
server transaction, combat sample or historical implementation was recovered.

## Exact SP basis and disclosed rounding

`calculateSpiritBase` exposes a validated exact fraction. For the sourced model,
baseSP is `(5 + sum(attributes)) / 5`. The legacy profile retains its earlier
integer `floor((40 + 3*wis) / 4)`. Existing `calculateVitals` output values and shape
are unchanged. Tank changes the resource maximum, never this restoration basis.

The candidate item amount is one exact final floor of
`numerator * integerPercent / (denominator * 100)`, then capped at current maxSP.
BigInt arithmetic avoids an early base floor or floating-point boundary drift.
For baseSP17.8, rank4 recovers12 and rank5 recovers13; flooring the base first
would give11 and12. BaseSP3.8 at55% gives2 instead of1. **This final-floor choice is
not verified original-server rounding.** No periodic-heal arithmetic is implied.

One successful use consumes one owned Spirit Potion, advances the action count,
sets cooldown40 and adds no internal time, tick or RNG draw. It reduces other
item cooldowns but not spell cooldowns; subsequent eligible actions reduce its
cooldown. Existing stance processing remains unchanged, including its separate
SP consumption. Full-SP rejection, resource caps and action ordering are retained
prototype policies. Wave pause, Continue and reload do not reset the cooldown.

## Persistence and compatibility

Rules become `persistent-0.91-training-v27`; ability/restorative policy becomes
`spirit-potion-candidate-v1`; the shared NPC ledger becomes `npc-potion-trades-v2`.
Fresh and migrated Spirit stock is0. Older saves receive only `potions.spirit:0`,
`purchased.betterSpiritPots:0` and a battle `spiritPotion:0` cooldown when a battle
exists, plus declared model/version migration. No Credits, AP, stock, slots,
resources or reset allowances are granted. Existing values and receipts remain.

Historical ability, inventory and trade shapes are checked before widening.
Future Spirit fields or Spirit action receipts disguised under an old version
are rejected, even if new fields claim zero. The prior two-item shop validator
continues to reject Spirit receipts despite Mana having identical100/4 prices.
Latest retries bind item, direction, quantity and revision across all three items.

Old active series keep their policy tags. Previous Potion-series Health/Mana
upgrades continue at their old assigned percentages; older100%/50% and earliest
legacy50%/40% effects remain unchanged. Spirit is disabled until a new series.
Old active policies cannot carry new Spirit stock, purchased ranks or a nonzero
Spirit cooldown. Terminal old series may coexist with later paid purchases.

Protected storage keys/ownership, fresh canonical reacquisition, error freezes
and memory export stay intact. `S` uses Spirit Potion only from the battle
background; focused controls, IME, modified events and read-only tabs remain
protected. Action feedback includes SP deltas. The item row can wrap for the
third button; no native/mobile layout acceptance is inferred from source tests.

## Validation

Run `npm run check`, `npm run build`, `npm run verify:checkpoint`.
New tests cover every rank/level/AP boundary, Major contention, exact SP residues,
unequal maxSP/maxMP caps, zero-time cooldowns, no grants, strict historical shapes,
720 six-trade orderings, selected-stock isolation, read-only/frozen/getter cases,
owner transfer, failed writes and export. A synthetic trace generated by exact
accepted Mana code preserves prior assigned Health/Mana5, Cure3, stance behavior,
paid Training, complete events/resources/cooldowns and RNG after declared zeros.
Historical fixture bytes are unchanged.

The validation successor rejects future Spirit ability/restorative policy tags
inside every pre-v27 envelope before adding zero migration fields. Valid inherited
active policies remain pinned. The original Spirit freeze accepted those malformed
historical tags; this was found by a synthetic import matrix, not native save loss.
One generated v21/v22 Cure regression now explicitly sets its historical restorative
policy instead of accidentally retaining the current Spirit tag; its healing, AP,
cooldown and rejection assertions remain enabled. Stored fixture bytes are unchanged.

Twenty-three runtime modules remain byte-identical to accepted Mana. The six
changed integration modules are explicitly listed in the baseline manifest;
app/CSS presentation and all current copied/transformed distribution bytes are
covered by the release manifest. Original art remains unchanged. Independent
source review and native deployment acceptance are separate gates.
