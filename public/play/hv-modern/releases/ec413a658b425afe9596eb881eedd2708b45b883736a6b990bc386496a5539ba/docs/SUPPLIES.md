# NPC Health, Mana and Spirit Potion buy/sell ledger

`src/supplies.js` implements deterministic Health, Mana and Spirit Potion trades using existing
in-game Credits and owned stock. No real payment, network request, player market,
seller account, inventory generation, clock, RNG or external perk is involved.

## Documentary evidence and limits

The accessible [Bazaar / Item Shop](https://ehwiki.org/wiki/Bazaar#Item_Shop),
identified as revision64945, was rechecked2026-10-08:

- Health Potion purchase cost50 Credits and player sale proceeds2 Credits each.
- Mana and Spirit Potions each cost100 Credits to buy and return4 Credits on sale.
- The source explicitly describes a maximum99,999 items per **purchase**.
- Public HTML marks all ordinary Potion rows green (`#00B000`), whose legend
  means unlimited NPC supply. This is verified from the stock indicator, not
  inferred merely from the listed prices. The UI does not invent
  finite player-sold stock or a shop balance.
- No Health Potion-specific level gate, untradeable qualifier or sale-price
  modifier appeared in inspected Bazaar/Items text. This is absence of documented
  restrictions, not proof of all original-server rules.

The fixed prices are community candidates for Persistent0.91. No account-side
trade was observed and no server-equivalence claim is made. Coupon Clipper and
other external price modifiers are inactive. Spirit Potion buying/selling is now enabled on the same ledger as Health/Mana. It
does not sell equipment or other goods.

The source-backed NPC stock is not a starting grant: migration preserves all existing potion counts exactly and adds Spirit stock0, and each new purchase must spend existing Credits.
The original starting profile's authored counts are unchanged. Draught and Elixir trading remain unimplemented. Periodic overlap/refresh, healing
rounding and round persistence are unresolved and deferred; no periodic mechanic
is guessed or inferred from these prices. Player markets and rare finite stock
are also separate backlog work.

## Explicit local safeguards

The sale quantity cap99,999 is a local safeguard, not a sourced sale limit. The
owned count cap999,999 per potion is also local. Quotes disclose invalid quantities,
stock, funds, inventory cap or safe-integer Credit/revision overflow before any
write. No excess is silently discarded. New trades are blocked throughout an
active battle, including wave pauses; terminal states allow trade.

Health purchase consumes50 Credits and adds one Health Potion per unit. Health
sale consumes one owned Health Potion and adds2 Credits per unit. Mana
purchase consumes100 Credits and adds one owned Mana Potion; Mana sale consumes
one and adds4 Credits. Buy-then-sale round trips lose48 Credits per Health Potion
and96 per Mana Potion; selling does not grant an original-price refund. Confirmations
show direction, quantity, proceeds/cost, resulting Credits and resulting stock.
No trade heals, changes resource maxima, modifies the other potion count, changes Training
or AP, draws RNG, advances time, or creates another item.

## Current shared ledger and APIs

Current model is `npc-potion-trades-v2`:

```js
{
  model: 'npc-potion-trades-v2',
  revision: 0,
  lastTrade: null
}
// After selling two owned Health Potions:
{
  model: 'npc-potion-trades-v2',
  revision: 1,
  lastTrade: {
    revision: 1, kind: 'sell', item: 'healthPotion', quantity: 2, total: 4
  }
}
```

`quoteHealthPurchase(state, quantity, expectedRevision)` and
`quoteHealthSale(...)`, `quoteManaPurchase(...)` and `quoteManaSale(...)` are fresh
read-only quotes. Existing Health quote shape
is retained; item and direction are defined by the API invoked. All require the current
shared revision. A quote neither reserves Credits/stock nor mutates the ledger.

`purchaseHealthPotion(...)`, `sellHealthPotion(...)`, `purchaseManaPotion(...)`
and `sellManaPotion(...)` commit one transaction.
All changing own-data fields are checked before the first write. The exact latest
retry is acknowledged only when item, direction, quantity and prior revision match its
receipt. Changing item or direction at the same quantity/revision is stale, not a retry. Older commands remain stale as revision advances; revision exhaustion
never wraps. An exact retry can acknowledge during a battle because it changes
nothing. Only the latest receipt is retained, not an unbounded trade log.

Returned quotes/receipts and migrated states are detached. Hidden fields,
accessors, unknown keys, inherited state flags, malformed arrays/types, unsafe
numbers and current negative-zero values fail closed. JavaScript proxies/host
objects are outside the plain-record API contract.

## Versioned migration and ownership

Full rules become `persistent-0.91-training-v27`. The strict historical validator
retains the exact old `{revision,lastPurchase}` ledger and old receipt fields.
Migration changes its latest receipt to `kind:'buy'`, keeping quantity, total,
revision and exact-last-buy retry identity. It preserves Credits, every potion,
player/gear, paid AP/Training, events and RNG. No extra trade or stock is created.
Pre-shop saves still gain only the documented empty ledger.

The typed Health-only predecessor `npc-health-trades-v1` is validated with its
original Health-only receipt restriction before its model changes. Its revision
and latest buy/sell identity stay exact. A Mana receipt disguised under that old
model is rejected. Both potion inventory counts, including existing Mana stock,
remain unchanged.

The full save importer requires the historical shape for pre-v25 supplied ledgers;
a mislabeled older save cannot smuggle current-model fields. Version25 requires the typed Health-only shape; version26 requires the two-item shape; current saves require the three-item exact shape. A standalone migration API also accepts a valid current
ledger idempotently, returning a detached copy. Legacy validation retains its
historical `-0` behavior, but current migration rejects it rather than coercing.
Normal JSON.stringify-produced saves serialize `-0` as0; hand-written JSON may
still represent `-0` and is not silently repaired.

Both directions share the protected canonical namespace and exclusive writer
lock from SAVE-OWNERSHIP.md. UI confirmation requires a live matching modal,
item, direction and simple review ID. Cancel/Escape/navigation/product/direction/quantity
changes invalidate the pending review. Synthetic detached-target regressions are
hardening tests, not evidence of a native-browser delayed-click defect.

Persistence failure can leave an exportable in-memory trade; the app freezes
further mutations and never flushes that memory on pagehide. Reacquiring a clean
observer loads the newest durable ledger first. Exact-once semantics are limited
to a valid local save lineage; user-edited or explicitly restored older files are
not a server-enforced transaction history.

## Verification

Run `npm run check`, `npm run build`, `npm run verify:checkpoint`.
New ledger tests exercise mixed buy/sell conservation, direction-aware retries,
stock/Credit/revision boundaries, frozen targets, descriptor safety and strict
historical migration. Engine tests use actual frozen Potion-successor purchases
and verify exact retry identity after full-save migration. UI tests cover explicit
spread disclosure, cancellation/reentry, direction substitution, observers,
latest-state acquisition and failed buy/sell saves with export.

Inherited purchase and historical replay tests stay enabled; only declared
ledger/model expectations change. Fixture bytes are never edited to hide a
failure. Twenty-three runtime modules, including Cure arithmetic, Training and
protected persistence, remain byte-identical to the accepted Mana checkpoint
7ce1366. Abilities, supplies, data, engine, restorative arithmetic and vitals are
the six changed Spirit integration modules; app/CSS also change, and all
current source/deployed bytes are separately manifest-verified. Native browser
and independent source acceptance remain separate gates.

## Item catalog and compatibility

`SUPPLY_ITEMS` is a frozen three-item catalog of stock field and fixed buy/sell
prices. `SUPPLY_POLICY.item/unitPrice/saleUnitPrice` remain Health aliases for
existing callers; they are not a Mana quote. The named API fixes the selected
item and direction. Unknown items and caller-supplied price/stock overrides are
not accepted. Each operation reads/writes only the selected potion stock; Health
calls do not evaluate an unrelated Mana getter. The full game validator still
requires the complete valid player/inventory envelope before accepting a save.

`validateLegacySupplyState` retains the original purchase-only contract;
`validateHealthTradeState` retains typed Health-only behavior. Explicit migration
accepts either valid predecessor or valid current data and returns a detached
copy. Current strict shape validation never silently repairs historical or
malformed envelopes. The protected writer and fresh-canonical acquisition rules
are byte-identical to the accepted Health checkpoint.

Spirit APIs are quoteSpiritPurchase/quoteSpiritSale/purchaseSpiritPotion/sellSpiritPotion.
Spirit prices match Mana100/4, but receipt identity includes item and cannot be
substituted. validatePotionTradeState retains the exact two-item predecessor;
migration grants no stock. See SPIRIT-POTION.md for exact SP arithmetic and policy
pinning. Existing Health/Mana stock and prices remain unchanged.
