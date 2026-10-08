# Checkpoint15 — early tank abilities

Rules: persistent-0.91-training-v11, schema1. Includes the frozen C14 supplies/restoratives increment and C13a identity/atomic-settlement correction.

The character page now separates attributes/EXP from ability configuration. An EXP-ledger profile has an explicitly inferred level-derived AP budget and Mastery entitlement, with no extra grant from historical levelRewards. The current Lv20 fixture has20 totalAP and2 reserved Mastery. Learning, assigning and removing are distinct; no effect is granted merely by ownership.

HP/MP/SP Tank first ranks cost1AP and add10% when assigned. Second ranks cost2 more and add20%, gated at25/30/40. Higher ranks, other trees, Mastery expansion and proficiency are clearly deferred. Five Major slots are usable; five Supportive slots remain reserved. Ten free single resets follow a named interpretation of source prose, with persisted consumption; paid/full resets are unavailable.

Resource maxima use the existing provisional bases and final-floor multiplier policy. Base restoration amounts do not grow with tank maxima: initial tanks yield413HP/94MP/22SP, while potion bases, Cure and Focus retain their prior quantities. Out-of-combat assignment/removal reconciles the new maxima. Existing old active series retain no-ability behavior; migrations do not auto-learn or assign effects.

296 automated tests, static build and whitespace checks passed. New checks cover all27 rank combinations through levels1–500, gated costs/slots/resets, strict input and write atomicity, tank effects versus restoration bases, level entitlement conservation, stale confirmation rejection, exact C14 replay and legacy preservation. Both actual C13a browser exports migrated with player/items/EXP/activities unchanged. Source EXP/level consistency is now checked before enabling derived AP entitlement.

Independent exact-SHA/source and affected live UI review remains pending. Source interpretation and deferred scope are in ABILITIES.md. No publication is performed by this checkpoint.
