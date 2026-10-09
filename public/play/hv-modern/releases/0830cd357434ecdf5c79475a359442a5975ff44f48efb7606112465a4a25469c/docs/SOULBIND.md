# Paid weapon Soulbind and legacy-factor scaling candidate

Checkpoint21 adds an earned-credit material purchase and a lasting weapon progression choice. It does not unlock Item World or supply World Seeds.

## Verified costs and supply

The public [Bazaar](https://ehwiki.org/wiki/Bazaar), observed revision64945, lists Soul Fragments at1,000Credits. On2026-10-07 at15:12UTC, a separate cloud-browser source inspection confirmed the Soul Fragment name has green styling `#00B000`; the displayed legend identifies green goods as unlimited supply. This is evidence for an NPC source, not generated player-market inventory. No account, original-game session or private data was accessed.

[Items, Soul Fragments](https://ehwiki.org/wiki/Items#Soul_Fragments), observed revision65165, gives base100fragments for Crude through Exquisite and a surcharge for items above playerlevel. The initial implementation supports only the at-or-below-playerlevel case, so it always costs exactly100fragments, or100,000earnedCredits when all were purchased. There is no credit shortcut, discount, starter grant or replacement external reward. Higher qualities/above-level costs remain deferred.

[The Armory, Soulbind](https://ehwiki.org/wiki/The_Armory#Soulbind), observed revision65341, requires binding for stat-changing modifications and describes continued scaling with playerlevel. A flag-only binding would not implement that benefit.

## Explicit candidate scaling, limited to weapons

[Level Scaling](https://ehwiki.org/wiki/Level_Scaling), observed revision63848, is an older page using Soulfuse/potency language. It supplies physicalfactor16.60027 and magicfactor22.72727; the latter is explicitly historically derived/unverified. The page is not proof these factors remain correct in0.91. The prototype labels them `legacy-relative-weapon-v1` and displays that uncertainty before payment.

The original authored weapon's raw attack and magic values are treated as actual reference-level values, **not** its0–200quality rolls or an original-game level-zero base. For immutable reference levelR and current levelL:

- `attack(L) = attackAnchor × (16.60027 + L) / (16.60027 + R)`
- `magic(L) = magicAnchor × (22.72727 + L) / (22.72727 + R)`

Integer factor numerators1660027/2272727 over100000 avoid compounding per-level rounding. Derived values retain fractions; existing combat damage performs its own final floor. This is a versioned mapping assumption for original authored fixtures, not authoritative0.91 equipment generation.

Only the current one-handed/staff weapon templates with zero generic defense qualify. Armor, shields and any weapon carrying generic defense are excluded: generic defense cannot be silently reinterpreted as mitigation. Burden stays fixed. Original quality rolls, anchor stats, template identity, item identity and original assigned level remain stored unchanged; an unassigned weapon receives the current level as its reference on binding. The effective display level then follows the character.

The workbench shows current values, after-binding values and next-level values. At equal level the immediate values can be identical; subsequent level growth has a real attack/magic effect. No invented minimum bonus is added to make payment look stronger. A bound weapon is marked untradable and no unbind/refund operation is offered.

## Local operation rules

Purchases and binding require an EXP-ledger profile, adequate earnedCredits/fragments and an out-of-combat state. Wave pause remains in combat. Stored equipment must be retrieved. The initial conservative implementation requires unlocking a locked weapon first; this binding-specific restriction is a local policy, not a verified original-screen rule. A protected weapon receives an additional explicit confirmation in the UI.

The prototype limits one purchase to1–99,999 and fragment stock to999,999, separate from the NPC's unlimited supply. These are local capacity limits. Purchase and bind share a monotonic revision and one latest-action receipt; identical retained retries do not spend again, while stale/conflicting requests fail. Binding metadata is bounded by the owned inventory. Every bound flag must have exactly one valid metadata record; old saves gain an empty ledger and no materials or effects.

Credits, fragment counts and item changes are committed atomically; no RNG, EXP, stamina, AP or current battle result is changed. Already-active old series retain their exact continuation because none of their items is newly bound and modifying equipment is blocked until the series ends.

World Seed acquisition weights/quantities, full current equipment scaling, armor binding, Item World, Forge, Charms, material upkeep and trade services remain in the backlog. This partial loop does not waive any of their prerequisites.
