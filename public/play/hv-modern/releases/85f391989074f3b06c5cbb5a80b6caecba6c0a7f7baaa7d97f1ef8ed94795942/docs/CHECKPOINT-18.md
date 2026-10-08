# Checkpoint18 — visible glances and multi-critical attacks

Built on C17a, including its staged import/reset persistence correction.

- New series distinguish no hit, half-damage glance and up to nine additive player criticals
- Source critical sequence and multiplier are separated from an explicitly authored opposing-contest probability; the true Accuracy/avoidance formula remains unresolved
- Each Fire target resolves independently; feedback/logs show the result only after settlement
- Existing active series retain their exact earlier hit, critical, RNG and loot policy, including prior schema1 migration and C17 schema2
- No new gear stats, free abilities/proficiency, monster criticals, procs or extra rewards

See [COMBAT-ACCURACY](./COMBAT-ACCURACY.md) for source revisions, the inference boundary and remaining gaps. Full game scope remains in BACKLOG. Independent source and live UI gates are still required.

Local verification:404 checks passed (including the1200-series retention stress), build and diff check passed. Deterministic training Fire examples: seed1 yields562 damage with3 criticals on target1; seed3 target2 glances for94; seed8 includes2-critical damage379 and a glance83. These are this authored encounter's regression vectors, not original-server comparison data.
