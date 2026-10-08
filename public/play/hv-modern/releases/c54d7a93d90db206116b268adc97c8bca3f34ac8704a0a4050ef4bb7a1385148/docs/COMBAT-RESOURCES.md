# Versioned combat-resource candidate

`resource-candidate-v1` applies only to newly started battle series. Existing active saves without that identifier migrate to `legacy-training-v1` and finish with their old costs, cooldowns, single-target Fire and no natural regeneration. Their resources, attributes and prior events are retained. Starting a later series opts into the current model.

## Spell cost and access

Source: [Spells, revision 65260](https://ehwiki.org/index.php?title=Spells&oldid=65260). Use one final ceiling of level × base-cost-percent × documented modifiers. The model currently applies Spirit Stance; proficiency, ability, interference and conservation effects are not granted. Those modifiers default to zero in the represented fixture.

- Fire selects the current table's base 6%, level 15 requirement, cooldown 0 and up to three targets
- Cure uses base 20%, level 5 requirement and cooldown 5 without Better Cure
- Lv20, no modifiers: Fire 2 MP, Cure 4 MP; Spirit: Fire 1 MP, Cure 3 MP
- The same source still has an older Fire example using 5. That discrepancy remains recorded; selecting table 6 is a candidate choice, not a claim of official server confirmation
- Coalesced Mana and Channeling factors are supported by the pure cost function but not bestowed by the game

Cure potency, hit/critical rolls, resource maxima and enemy stats remain provisional. C13 separately replaces outgoing magic base/multiplier through its versioned candidate; see COMBAT-OFFENSE.md. Updating cost does not validate those other systems. Fire independently tests each selected target. Encounter rosters may exceed three enemies; the base cap stays three, while assigned Conflagration can raise it to four or five in new-policy series. Primary-first ordering is an explicit candidate implementation, not a reconstructed hidden target-selection algorithm.

## Tick-based natural recovery

Sources: [Character Stats, revision 65166](https://ehwiki.org/index.php?title=Character_Stats&oldid=65166), [Action Speed, revision 64923](https://ehwiki.org/index.php?title=Action_Speed&oldid=64923), [Spirit Stance, revision 65231](https://ehwiki.org/index.php?title=Spirit_Stance&oldid=65231).

At each crossed 100-unit tick, the published no-perk rates are MP = 5 + WIS/25 and SP = 1 + sum(attributes)/600. The source's perk multiplier placement affects the attribute term; no perk is enabled in this game.

The explicit rounding candidate uses integer 1/1200-unit carries, awards only whole spendable resource points and discards overflow at the maximum. This avoids floating-point drift while preserving the written fractions; original-server carry and rounding are unverified. Carries persist across saves and wave continuation. Zero-time items do not generate ticks. Spirit activation suppresses recovery for that action only; later stance actions may recover on their crossed ticks.

No base HP/MP/SP formula is replaced in this checkpoint because the public stat page warns of inaccuracies and some historical values conflict. No unearned ability or proficiency bonus is applied.

## Verification scope

Tests cover quoted costs and final rounding, affordability before mutation, source cooldowns/level gates/target count, 99→100 boundaries, multiple crossed ticks, short actions, zero-time items, activation suppression, caps, exact fractional carry, reload/intermission preservation and actual old active-save compatibility. These establish this candidate's contract, not server-equivalent combat.
