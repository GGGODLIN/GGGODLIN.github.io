# Checkpoint 12 · combat-resource fidelity and armory integration

Includes the unpublished C11 organization controls and the audited C10 import-hardening ancestry.

New battle series now use level-based spell costs with one final ceiling. At the initial Lv20/no-modifier profile, Fire costs 2 MP and Cure 4 MP. Source level requirements/cooldowns are enforced; Fire attempts up to three targets independently. Natural MP/SP regeneration occurs only on crossed ticks, with the documented Spirit-activation exception. Fractional carry uses a named, tested fixed-point assumption.

Old active battles retain their previous combat-resource policy through completion. No character stats, purchased attributes, resource maxima, damage or Cure potency are silently replaced. Remaining source conflicts and provisional modifiers are linked from the interface and documented in COMBAT-RESOURCES.md.

The workbench now exposes inventory/storage, pinning, category filters and distinct Protected/Locked states. New item-ID attributes retain encoding and strict import validation. Wallet and attribute-control copy reported by previous browser QA is corrected.

182 automated checks, syntax and static build pass. Full current three-Arena earning/allocation/loot regressions also pass. Browser verification of the new resource and organization controls remains pending.
