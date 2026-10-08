# Checkpoint21 — earned materials and continuous weapon Soulbind

Built on checkpoint20, preserving its full-length Grindfest loop.

- Verified NPC Soul Fragments cost1,000Credits with unlimited source stock; purchases require actual gameCredits and do not grant starter fragments
-100fragments bind an eligible at/below-level common-quality one-handed/staff weapon; armor and generic defense remain unsupported
- Workbench previews current/after/next-level attack and magic before payment, labels legacy-factor uncertainty, and requires an additional protected-item acknowledgment
- Bound weapons really scale continuously as level grows, while original assigned reference level, raw stat anchors, quality rolls, identity and burden remain unchanged
- Exact source-level factors remain unverified for0.91; the versioned ratio is a declared candidate, not a raw-quality-roll substitution
- Shared purchase/bind revision and bounded last-action receipt prevent duplicate spending; unknown or stale requests reject
- Old saves gain only an empty material/binding ledger. Actual C20 cloud-browser export compared field-for-field: all previous fields exact, only rulesVersion plus empty Soulbind state added

See SOULBIND.md for verified prices, cloud-rendered stock evidence, mapping assumptions and remaining prerequisites. Item World, seeds, armor scaling, fullcurrentfactor verification and Charms remain deferred. Synthetic funded fixtures exist only in tests; production new characters still start with0Credits/0fragments. Independent source/live UI gates remain required.

Local final gate:516checks passed, build and diff check passed. Includes32pure ledger cases,9engine integration cases,9actual-app VM cases and all prior replay/retention checks. Actual C20 browser export migration preserves every earlier field exactly. One historical raw pre-migration stats-reader compatibility case was retained by deriving only bound-item stats; unbound raw legacy reads stay unchanged. Browser validation is still an independent gate, not claimed from these tests.
