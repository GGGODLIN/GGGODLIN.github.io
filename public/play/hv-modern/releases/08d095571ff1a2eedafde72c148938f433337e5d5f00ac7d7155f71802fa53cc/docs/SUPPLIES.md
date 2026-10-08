# NPC Health Potion supplies

`src/supplies.js` is a deterministic, bounded local purchase helper for this single-player prototype. It spends existing in-game Credits and adds Health Potions to the existing consumable count. No real payment, network request, player market, seller account, inventory generation, clock, or random source is involved.

## Documentary source and scope

Verified against the accessible [Bazaar page](https://ehwiki.org/wiki/Bazaar#Item_Shop), whose footer identifies [revision 64945](https://ehwiki.org/index.php?title=Bazaar&oldid=64945), on 2026-10-07:

- A Health Potion costs 50 Credits; its listed sale value is 2 Credits
- The shop allows at most 99,999 items per transaction, subject to affordability and supply
- Green-marked goods have unlimited supply; the Market limits text explicitly identifies health restoratives as always available in the Item Shop
- Mana/Spirit Potions list a 100-Credit purchase price, but unlimited mana supply was not established by the extracted text

Only the NPC Health Potion purchase is implemented. Selling remains absent despite the documented sale value. Mana purchase stays deferred; this module neither invents finite player-sold stock nor treats the known mana price as proof of unlimited availability. Coupon Clipper and other external bonuses are inactive. This is a narrowly sourced candidate, not proof of exact original-server behavior.

## Explicit prototype policies

These are local safeguards, not rules attributed to the source:

1. The saved Health Potion count cannot exceed the existing prototype limit of 999,999. An overflowing purchase fails; nothing is discarded or placed in an overflow store
2. New purchases are blocked whenever `state.battle.status === 'active'`, including between-round pauses. Terminal `victory`, `defeat`, and `fled` states permit purchases
3. Every command must supply the revision displayed by the caller. A fresh purchase is permitted only when that revision equals the current committed-purchase sequence number
4. Only the latest receipt is retained. The exact last command can be acknowledged again without applying its effect, while every older command stays stale forever within that saved ledger
5. Safe-integer exhaustion rejects new commits rather than wrapping the revision
6. Purchase UI confirmation, displayed quantities, feedback, autosave, migrations, and full-game validation belong to the caller. A quote is informational and does not reserve funds, stock, or a revision

This module does not use equipment Protected/Locked flags. Buying consumables does not sell, consume, or change equipment. Purchase also does not heal, restore mana, alter resource maxima, or trigger out-of-combat recovery. Consumable effects are managed separately.

## State contract

Initialize the new nested ledger with `createSupplyState()`:

```js
state.supplies = { revision: 0, lastPurchase: null };
```

After a committed three-potion purchase:

```js
state.supplies = {
  revision: 1,
  lastPurchase: {
    revision: 1,
    item: 'healthPotion',
    quantity: 3,
    total: 150
  }
};
```

The ledger has exactly the two shown own enumerable data fields. Revision zero requires a null receipt; a positive revision requires the exact four receipt fields, a matching revision, the fixed item identifier, a valid quantity, and a total equal to quantity × 50. No growing receipt array, timestamp, or generated command ID is saved.

The helper reads `state.player.credits` as a nonnegative safe integer, including zero; `state.potions.health` as an integer from zero through 999,999; and the optional own `state.battle` field. Battle may be absent, undefined, null, or a plain record with one of the four recognized statuses. Unknown or accessor-based battle status fails closed. Relevant records must be ordinary objects or null-prototype records. Accessors on inspected fields are not evaluated. JavaScript proxies and adversarial host objects are outside this data contract.

Only these four fields can change on commit:

- `state.player.credits`
- `state.potions.health`
- `state.supplies.revision`
- `state.supplies.lastPurchase`

They are all checked for writability before any write. Failure leaves state untouched. No mana inventory, HP/MP/SP/OC, experience, stamina, history, RNG state, combat time, or event counter changes. A returned receipt is a detached copy; editing it cannot corrupt the ledger. Other game-state validation remains the engine's responsibility.

## API and replay behavior

- `SUPPLY_POLICY`: frozen item, price, quantity limit, saved-count cap, source URL, and NPC supply classification
- `createSupplyState()`: returns a fresh `{ revision: 0, lastPurchase: null }` object
- `validateSupplyState(supplies)`: read-only boolean validation of the nested ledger, not the entire game
- `quoteHealthPurchase(state, quantity, expectedRevision)`: returns `{ ok: true, item, quantity, unitPrice, total, expectedRevision }`, or `{ ok: false, error }`
- `purchaseHealthPotion(state, quantity, expectedRevision)`: returns `{ ok: true, receipt, duplicate: false }` for a commit, `{ ok: true, receipt, duplicate: true }` for an exact latest retry, or `{ ok: false, error }`

Quantity must be an integer in 1–99,999. Strings, fractions, omitted values, booleans, infinities, and other coercible values are rejected. The caller must explicitly pass a nonnegative safe-integer revision; there is no default that silently adopts a newer revision.

A new commit at revision N stores receipt N+1. The same quantity with expected revision N can then be retried as an unchanged duplicate. Different quantity at N fails. An older revision fails even if its quantity happens to match the latest purchase. The same quantity at the new current revision N+1 requests a genuinely new purchase.

An exact duplicate validates the request and current input shape, then acknowledges the existing receipt without testing affordability or space again. It therefore also works after the original purchase spent all Credits or filled the inventory, during a later active battle, or with now-read-only state. This does not execute a purchase during combat. Quotes never use this duplicate path: any stale quote, including an otherwise exact last request, fails instead of looking like a newly affordable purchase.

JSON save/reload preserves the ledger and retry behavior when the caller persists it. A local client save is not tamper-proof: validation detects malformed records, not a coherently rewritten or rolled-back save. This is not a multiplayer transaction authority.

## Verification

Run `node --test tests/supplies.test.js` for focused checks and `npm run check` for the repository suite. Coverage includes exact funds and zero balances; quantity boundaries and invalid types; inventory cap; equipment independence; combat and round pauses; immutable quotes and post-quote state changes; writable-field failure atomicity; detached receipts; duplicate, stale, future, and mismatched commands; 150 commits without history growth; JSON reload; safe-integer limits; malformed and accessor inputs; tampered receipt rejection; and fixed-price behavior regardless of unrelated stock, discount, or override fields.
