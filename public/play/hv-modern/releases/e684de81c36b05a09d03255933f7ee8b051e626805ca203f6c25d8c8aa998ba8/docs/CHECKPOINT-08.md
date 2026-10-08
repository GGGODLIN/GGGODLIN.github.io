# Checkpoint 08 · 2026-10-07

## Actual equipment mechanics

- Staffs occupy both hands. Equipping the staff previews and removes the offhand contribution while retaining the shield in inventory
- A shield cannot be equipped until switching away from the two-handed weapon; switching back does not silently re-equip it
- Low-quality Unassigned items receive the character's current level on first equip, then keep that level
- Assigned equipment above the character's level is rejected without partial changes
- Replaced the authored `Fine` quality label with the documented `Average` grade

Source: [Equipment Basics, revision 65026](https://ehwiki.org/index.php?title=Equipment_Basics&oldid=65026). Full stat scaling, generation probabilities and complete equipment slots remain separate unfinished work. Fixed sample stats remain explicit.

## Legacy preservation

Rules version v4 adds narrow migration from v1/v2/v3. It fills known sample hand/level metadata. If a prior version saved an active staff-plus-shield setup, its effects remain unchanged for that battle series; only after termination is the offhand unequipped, without removing its inventory item. Terminal/noncombat legacy states normalize immediately. Invalid unknown IDs are rejected, not silently repaired.

## Checks

74 automated checks pass, including eight new equipment regressions. Syntax and portable build pass. Current published/QA checkpoint remains parent-controlled; this source worker did not publish.
