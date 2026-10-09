# Soul Fragment purchase and weapon Soulbind candidate

This checkpoint implements a paid local equipment-progression candidate. It does **not** claim a verified Persistent 0.91 stat-scaling implementation. Its sourced costs and unlimited fragment supply are distinct from its explicitly legacy, unverified relative-level model.

## Sources and scope

- [Bazaar revision 64945](https://ehwiki.org/index.php?title=Bazaar&oldid=64945#Item_Shop): Soul Fragments cost 1,000 Credits each. A separate public cloud-browser inspection on 2026-10-07 confirmed that the actual Soul Fragment span has `style="color:#00B000"`, and that the rendered legend defines green entries as unlimited supply. No finite stock or restocking schedule is invented
- [Items revision 65165](https://ehwiki.org/index.php?title=Items&oldid=65165#Soul_Fragments): the Crude/Fair/Average/Superior/Exquisite base cost is 100 Soul Fragments. This uses the canonical current table, not the stale redirect result with a different Superior/Exquisite price
- [Armory revision 65341](https://ehwiki.org/index.php?title=The_Armory&oldid=65341#Soulbind): Soulbinding makes equipment untradable and continuously match player level. A bound flag or display-level change alone is insufficient
- [Equipment Basics revision 65026](https://ehwiki.org/index.php?title=Equipment_Basics&oldid=65026#Level): ordinary assigned equipment does not continuously grow with the player
- [Level Scaling revision 63848](https://ehwiki.org/index.php?title=Level_Scaling&oldid=63848): a legacy relative-level model supplies the basis for the candidate factors below. This source still discusses older systems; magic's historical derivation is explicitly unverified. It does **not** close the current 0.91 formula gate

Current supported scope is owned one-handed weapons (`hands: 1`) and staves (`hands: 2`) with zero generic defense, quality Crude through Exquisite, and an assigned level at or below player level or a null unassigned level. Assigning a null reference level to the current player level during binding is an explicit local candidate policy. There is no above-level price formula, armor binding, free fragment grant, fragment sale, seed acquisition, Item World entry/reward, forging, or charm effect here.

## Separate raw anchors from effective stats

The stored `item.attack` and `item.magic` values are the supplied **effective-stat anchors at the assigned reference level**. They are not level-zero bases and not the equipment generator's quality-roll units. Binding never changes these values, their generation metadata, or their raw rolls.

The candidate uses these fixed integer-factor ratios:

```text
attack(L) = rawAttack × (1660027 + 100000 × L) / (1660027 + 100000 × referenceLevel)
magic(L)  = rawMagic  × (2272727 + 100000 × L) / (2272727 + 100000 × referenceLevel)
```

These are the selected decimal factors `16.60027` and `22.72727`, represented with the common denominator 100000. The helper calculates the ratio from the immutable reference every time. It retains fractional effective stats, never rounds per level, and never compounds a previous effective value. Existing combat code owns final damage flooring. Same-level binding preserves the anchor exactly; binding an older weapon immediately applies the current-level ratio, and subsequent player levels produce further growth.

`burden` stays fixed. Generic `defense` is never silently reinterpreted as physical or magical mitigation; supported bound weapons require it to be zero. Unbound weapons and armor return their original raw stats unchanged regardless of player level.

Stored `item.level` remains the reference level. A null level is assigned once on binding; a preexisting assigned level is preserved. The effective helper's returned `level` follows the actual player level only for bound items. The bounded supported player-level range is 1–500. Quotes at 500 display level 500 again for the next-level preview.

The complete `SOULBIND_POLICY.candidateWarning` must be shown before paid confirmation. The caller should show the actual before/after/next-level attack and magic values rather than implying the input numbers are quality-roll values.

## State and exact schemas

```js
state.soulbinding = {
  model: 'weapon-soulbind-candidate-v1',
  fragments: 0,
  revision: 0,
  lastAction: null,
  bindings: {}
}
```

Each bound owned item has exactly one keyed record:

```js
bindings[itemId] = {
  referenceLevel: 20,
  boundAtLevel: 20,
  fragmentsSpent: 100,
  scalingModel: 'legacy-relative-weapon-v1'
}
```

A binding record must correspond one-to-one to an owned `item.bound === true`. Its `referenceLevel` must equal stored `item.level`, and `referenceLevel <= boundAtLevel <= currentPlayerLevel`. Unsupported bound types, naked flags, orphan records, duplicate item IDs, and records for removed ownership fail validation. Bound records are limited by the flat owned inventory, whose maximum is 1,000 records across the caller's containers. A bound item may subsequently be stored or locked; that does not remove its metadata or invalidate its retained last-action receipt.

Only one successful receipt is retained across both action kinds:

```js
// Purchase
{ revision: 1, kind: 'purchase', quantity: 100, total: 100000 }

// Bind
{
  revision: 2, kind: 'bind', itemId: 'blade-dawn',
  fragmentsSpent: 100, referenceLevel: 20, boundAtLevel: 20
}
```

Every fresh successful purchase or bind increments the same safe-integer revision. The bounded last receipt is not a historical credit ledger and cannot independently prove externally supplied save provenance; the engine remains responsible for its full save, origin/projection and EXP-ledger validation. This module neither reads nor rewrites EXP or other reward ledgers.

## API contract

Exports:

- `SOULBIND_POLICY`
- `createSoulbindingState()`
- `validateSoulbindingState(ledger, inventory, playerLevel)`
- `quoteSoulFragmentPurchase(state, quantity, expectedRevision)`
- `purchaseSoulFragments(state, quantity, expectedRevision)`
- `quoteWeaponSoulbind(state, itemId, expectedRevision)`
- `bindWeapon(state, itemId, expectedRevision)`
- `effectiveEquipmentStats(item, playerLevel, bindingRecord)`

The action/quote APIs consume a full-state-shaped object with at least `player: { level, credits }`, `progression: { kind: 'experience-ledger' }`, `inventory`, `soulbinding`, and optional `battle` (null when absent). They validate this module's inputs, rather than attempting to validate unrelated subsystems. The engine must validate its complete EXP-funded profile and draft/commit boundary as well. A legacy fixture profile cannot turn its old fixture points or balances into fragments through these APIs.

Purchase quantities are integers 1–99,999; stored fragments are integers 0–999,999. These are explicit local persistence/interaction limits, not claimed original-game limits. Price is exactly 1,000 Credits per fragment, so purchasing all 100 required fragments costs exactly 100,000 Credits. Binding consumes exactly 100 **owned fragments**, with no Credits shortcut.

A successful purchase quote includes `ok`, `kind: 'purchase'`, `item: 'soulFragment'`, `quantity`, `unitPrice`, `total`, `expectedRevision`, and current `revision`.

An eligible bind quote includes:

```js
{
  ok: true, kind: 'bind', itemId, fragmentsSpent: 100,
  expectedRevision, revision, referenceLevel, boundAtLevel,
  before: { attack, magic, defense, burden, level },
  after: { attack, magic, defense, burden, level },
  nextLevel: { attack, magic, defense, burden, level },
  requiresProtectionConfirmation, candidateWarning, affordable: true
}
```

If the item is eligible but fragments are insufficient, the quote preserves **all** these preview fields, changes `ok` and `affordable` to false, and adds `code: 'insufficient-fragments'` and a readable `error`. This lets a player inspect the actual progression effect before buying fragments. Unsupported eligibility or invalid state returns a failure without inventing an effect preview.

Quotes are read-only, support frozen state, and do not reserve stock, currency, or a revision. Mutation recomputes eligibility, cost, funds, combat state and revision. Success returns `{ ok: true, receipt, duplicate: false }`; the returned receipt is detached from retained state. Failure returns `{ ok: false, code, error }` (plus the eligible preview for an insufficient-fragment binding). No events are generated.

`effectiveEquipmentStats` returns a detached `{ attack, magic, defense, burden, level }`. It validates the item and actual player level; a bound item additionally requires a valid corresponding binding record. It throws for invalid inputs or numeric overflow. Unbound items accept no binding record (undefined or null) and return raw stats. It does not perform ownership resolution itself; the ledger validator/caller supplies the owned corresponding record.

## Revision, failure and replay behavior

Fresh actions require `expectedRevision === ledger.revision`. If `expectedRevision === revision - 1` and the retained last action has the identical kind and quantity/item ID, the mutation API returns its detached receipt with `duplicate: true`, without charging or applying anything again. That acknowledgement remains valid after entry into battle, reduced available currency, or read-only fields because it does not execute an action. All older revisions, future revisions, and same-revision payload conflicts reject. Quotes never turn a retry into a fresh offer. JSON reload preserves these semantics.

Both combat and between-wave pauses have `battle.status === 'active'` and block new purchases and binding. Stored items must be retrieved before binding. Locked items are conservatively rejected as an explicit provisional binding restriction. Protected items remain eligible, with `requiresProtectionConfirmation: true`; the caller/UI owns the explicit paid/protected-action confirmation before invoking `bindWeapon`. The data API does not synthesize or assume a user confirmation token.

Before the first write, all destination fields must be own writable data properties and all bounds and scaling calculations must pass. Purchases change only `player.credits`, `soulbinding.fragments`, revision and last receipt. Binding changes only fragments, binding-map replacement, revision, last receipt, `item.bound`, and a null `item.level`. Existing assigned levels need not be writable. Existing binding maps can be frozen because they are replaced rather than mutated in place.

Own enumerable plain records (Object.prototype or null prototype) are accepted. Accessors, hidden fields, symbols, forbidden prototype keys, sparse/decorated arrays, malformed nested item JSON, unsafe scalar values, and noncanonical IDs are rejected without getter evaluation. The full-match ID check specifically rejects trailing newline tricks. Arbitrary JavaScript Proxies and host objects are outside this plain-JSON API. Effective-stat overflow at any supported future level is preflighted at level 500 before paid binding, so a successful bind cannot later fail solely from ordinary supported level growth.

## Migration and tests

New and migrated ordinary profiles start with a freshly created empty ledger. No stock or free bindings are awarded. An empty ledger cannot legitimize preexisting bound flags. Migration decisions for incompatible historical data belong to the engine, rather than this module quietly manufacturing matching records or importing fixture points.

Focused verification:

```sh
node --check src/soulbinding.js
node --test tests/soulbinding.test.js
```

The focused tests cover price and fragment conservation, exact binding costs, scope/level/ownership rejection, raw anchor and roll preservation, fractional immediate/continued growth, reload, old unbound armor behavior, zero-stock preview, caps and overflow, both action kinds sharing one revision, exactly-once retries, active-wave restrictions, storage/lock/protection handling, frozen/read-only destinations, strict schemas, getter/symbol/prototype/newline defenses, and a 1,000-item bounded inventory. Full engine/UI/save/regression integration is verified separately by the parent integration task.
