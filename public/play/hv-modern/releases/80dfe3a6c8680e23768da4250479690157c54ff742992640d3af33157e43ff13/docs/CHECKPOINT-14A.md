# Checkpoint14a — imported enemy/feedback display safety

Narrow security correction based on frozen C14 only. No C15 abilities, C16 vitals or future history migration is included.

Read-only review found that imported enemy powerLevel lacked a numeric guard and was interpolated directly in scanned-target HTML. This patch rejects malformed values before UI load and encodes that boundary defensively. The supported authored fixtures are PL0 for training and PL100 for Arena; these are prototype model limits, not a claim about original HV maximum Power Level.

The bounded import-to-display audit also covered player resources/level/EXP/Credits, equipment numbers and generated metadata, battle round/time/cooldowns/effects/final vitals, enemy level/HP/resistances/kind, log text/type, identity attributes and supply receipts. Existing numeric guards or text encoders protect those paths. Enemy numeric/kind output is now encoded uniformly as additional defense.

A secondary defense-in-depth path was identified in damage feedback. Optional imported receipt event amounts and critical flags are now type-checked, along with recognized resource scalars/identity metadata. The feedback amount is also encoded. No ordinary attacker-controlled UI replay path was claimed, and no imported payload was executed in a browser.

261 checks passed; syntax, portable build and diff checks passed. New regressions cover malformed strings/quotes/entities/objects/numbers in enemy fields and receipt feedback, the precise supported PL controls, and all relevant shared-encoder boundaries. Actual historical gameplay fixtures remain passing unchanged. The independent exact-SHA gate and ordinary live smoke verification are separate release steps.
