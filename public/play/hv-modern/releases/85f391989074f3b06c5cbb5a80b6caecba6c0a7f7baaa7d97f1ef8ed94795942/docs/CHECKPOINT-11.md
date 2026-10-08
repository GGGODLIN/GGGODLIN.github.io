# Checkpoint 11 · armory organization

Integrates the previously tested organization model into the workbench: separate 500-item inventory/storage counters and tabs, stable pin-first ordering, category filters, mutually exclusive Protected/Locked modes and reversible storage transfers. Equipped items cannot be stored; stored items cannot be equipped until retrieved. Moves during combat remain a documented prototype restriction.

Protection and locking follow the documented distinction. The app still does not expose selling, salvaging, mailing or stat fusion; their future gates are tested rather than represented as completed actions. Existing old soft-protection markers migrate to Protected, not the stronger Locked state. All item identities, stats and historical progress are preserved.

The C10 import hardening is retained: exact generated ID shapes and attribute-safe escaping at every item-ID DOM boundary, including the newly added controls. Tests cover actual old saves, both flags, pin ordering, transfer/reload, stored eligibility and invalid imports.

168 checks and build pass before integrating the recorded hardening-branch ancestry. Browser verification remains pending; no publication by this worker.
