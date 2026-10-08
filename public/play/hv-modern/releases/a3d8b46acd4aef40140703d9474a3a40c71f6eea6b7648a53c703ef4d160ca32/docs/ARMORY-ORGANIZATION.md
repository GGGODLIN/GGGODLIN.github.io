# Armory organization

`src/armory.js` implements deterministic organization for the prototype's existing equipment samples. It adds pinning, mutually exclusive protection modes, inventory/storage transfers, capacity checks, filtered lists, and a non-executing action gate. It does not create equipment or implement commerce, crafting, equipment destruction, or mail.

## Sources and verification boundary

- Intended versioned source: [The Armory, revision 65341, Organize](https://ehwiki.org/index.php?title=The_Armory&oldid=65341#Organize)
- Intended versioned capacity source: [Equipment Basics, revision 65026](https://ehwiki.org/index.php?title=Equipment_Basics&oldid=65026#Storage_Limits)
- Historical URLs returned cache misses during this implementation. The accessible [current Organize section](https://ehwiki.org/wiki/The_Armory#Organize) corroborated pin priority, the distinct protection modes, stored-action exclusion, and the equipped-item storage restriction. The accessible [current Storage Limits section](https://ehwiki.org/wiki/Equipment_Basics#Storage_Limits) corroborated separate default limits of 500 inventory and 500 storage items. This establishes documentary support for the behaviors below, not historical-version equivalence or exact server reproduction.

Source-backed organization semantics:

- Pinned items precede unpinned items of the relevant equipment type
- Protected gear needs extra confirmation for sale, salvage, mail attachment, or sacrifice in stat fusion
- Locked gear is omitted from dangerous-action lists; protection and locking cannot coexist
- Protection and locking do not by themselves prevent repair, upgrade, or modification
- Stored equipment is visible in organization but unavailable for other equipment actions
- Equipped items cannot be stored
- Inventory and storage each start with 500 spaces; Hoarder is an external bonus to storage capacity

The implementation keeps bonuses inactive. It does not claim to support Hoarder, storage-overflow accounting, equipment drops, trophy exchanges, or any other item-generation limit behavior.

## Explicit prototype decisions

1. A move into a full target container is rejected before any mutation. Nothing is discarded, pushed into overflow, or automatically moved elsewhere. This is a conservative admission rule for this prototype; the source's overflow wording does not establish this exact transfer policy.
2. Active training battles block moves in both directions, including between-wave pauses. This is a training-app restriction, not a verified original armory rule. Pinning and protection changes remain available during combat.
3. Attempting to store equipped gear returns a visible error and leaves state unchanged. The source describes silently ignoring this request; the prototype preserves its no-transfer outcome while providing feedback.
4. Sorting is pinned first, then stable original-array order. No unsupported secondary source ordering is invented. Slot filtering is limited to this prototype's three equipment slots.
5. A dangerous action on protected gear yields a confirmation requirement and is denied until an implementing subsystem handles that requirement. This module accepts no confirmation-bypass argument and performs no dangerous action.

## State contract

All equipment remains in the same flat `state.inventory` array. Each item has its existing identity and stats, plus these own data fields:

```js
{
  id: 'existing-item-id',
  pinned: false,
  protected: false,
  locked: false,
  container: 'inventory' // or 'storage'
}
```

`protected` and `locked` are booleans and cannot both be true. Pinning is independent. `state.equipped` contains exactly `weapon`, `body`, and `offhand`, each holding an existing item ID or `null`. The container flag changes; array position, item identity, equipment properties, currency, combat resources, random state, and event counters do not.

Mutations accept ordinary JSON-shaped records, reject malformed organization fields and duplicate IDs, and preflight writable fields. A failed call does not partly apply its change. Accessors on inspected metadata are not evaluated. JavaScript proxies and adversarial host objects are outside this data contract. Save validation, migrations, and ensuring equipped gear belongs to inventory remain responsibilities of the engine.

Legacy prototype `locked` previously meant the softer protection marker. The engine migration must translate that historical marker to `protected`, then initialize the new `locked`, `pinned`, and `container` fields explicitly. This module never guesses a save's version or silently migrates it.

## Exported API

- `ARMORY_CAPACITIES`: frozen `{ inventory: 500, storage: 500 }`; state fields cannot raise the limits
- `getContainerCounts(state)`: `{ inventory, storage, inventoryCapacity, storageCapacity, total }`; counts known containers without modifying input. Malformed lists yield zero counts and unknown containers are ignored. Mutation validation separately rejects malformed lists rather than using those counts to permit a move
- `setEquipmentProtection(state, itemId, mode)`: exact modes `none`, `protected`, and `locked`; always writes both flags to preserve exclusivity
- `toggleEquipmentPin(state, itemId)`: toggles only the pin flag
- `moveEquipment(state, itemId, targetContainer)`: exact destinations `inventory` and `storage`; checks active battle, equipped items, and current capacity before changing one field. Moving to the current container is an unchanged success outside active combat
- `listOrganizedEquipment(state, { container, slot, search })`: defaults to inventory; optional slot is one of the three slots or `all`; search defaults to empty, trims surrounding whitespace, and checks names case-insensitively. Returns a new array of the original item references, with stable pinned-first ordering. Invalid options yield an empty array. The caller should treat returned item references as read-only
- `equipmentActionPermission(item, action)`: a read-only organization gate returning `{ allowed, visible, requiresConfirmation, reason }`

All three mutating functions return `{ ok: true, events: [] }` or `{ ok: false, error, events: [] }`. They do not generate event IDs or consume random values.

### Action-gate interpretation

The supported action keys are `equip`, `repair`, `upgrade`, `modify`, `sell`, `salvage`, `mail`, and `fusion`. `fusion` means consuming an item in stat fusion. Unknown actions and malformed equipment fail closed.

| Item organization | Ordinary actions | Dangerous actions |
| --- | --- | --- |
| Inventory, unprotected | Allowed by this gate, visible | Allowed by this gate, visible |
| Inventory, protected | Allowed by this gate, visible | Not yet allowed, visible, requires confirmation |
| Inventory, locked | Allowed by this gate, visible | Denied and hidden |
| Stored, any valid protection mode | Denied and hidden | Denied and hidden |

“Allowed by this gate” is only an organization check. It does not establish player level, hand compatibility, soulbinding, costs, materials, recipient validity, or whether a feature exists. Repair, upgrade, modification, sale, salvage, mail, and fusion remain unimplemented interfaces; their entries do not create a working feature or authorize an action. The engine must apply its existing equipment eligibility checks as well as the stored-item gate before equipping.

## Verification

Run `node --test tests/armory.test.js` for the focused suite and `npm test` for the complete repository tests.

Focused coverage includes stable pin ordering; container/slot/name filtering; mutual exclusion; item identity, flag and count conservation across round trips; all three equipped slots; combat and between-wave restrictions; protected versus locked action semantics; stored-action exclusion; both 500-item capacity boundaries; repeated same-container moves; exact input validation; duplicate/malformed metadata; read-only atomic failures; no event/RNG side effects; and no confirmation bypass. Capacity fixtures are synthetic test records, not generated gameplay rewards.
