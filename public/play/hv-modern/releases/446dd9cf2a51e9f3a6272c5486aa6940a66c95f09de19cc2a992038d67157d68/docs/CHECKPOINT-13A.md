# Checkpoint 13a — battle identity and atomic Arena settlement

Narrow correction on checkpoint13 only; no consumable/shop/ability work included.

Independent review found that importing a noncanonical active battle ID such as arena-x was accepted. Its generated reward then failed validation after part of settlement had already changed. Ordinary generated IDs were unaffected.

This correction:

- Requires canonical training-N / arena-N IDs with a positive safe integer matching the global next-battle counter
- Checks pending Arena reservation identity, canonical historical/linked activity IDs and reward identity collisions
- Refuses exhausted counters and conflicting reward IDs before reserving a new daily entry
- Prepares Arena settlement and its possible equipment before committing reward fields
- Runs Arena actions on a draft and validates the complete result before committing it. A late failure, including credit overflow, preserves the entire previous action state and RNG
- Keeps old C12 action/loot replay and existing original-template/generated-item validation unchanged

216 tests passed, static build and whitespace checks passed. New tests cover malformed/cross-kind IDs, counter/reservation links, collisions, late-action rollback and ordinary exactly-once reward completion. Exact frozen C12a full-series reward/RNG replay remains passing.

This is defensive consistency for a local save, not tamper-proof server authority. Browser verification remains the independent publisher/QA stage.
