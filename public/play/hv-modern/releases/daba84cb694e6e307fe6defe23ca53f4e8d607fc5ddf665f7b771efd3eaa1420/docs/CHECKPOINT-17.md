# Checkpoint17 — durable bounded history and log layout

Schema2, rules persistent-0.91-training-v13. Contains C16a and both preceding security fixes. No new combat balance or activity rewards are added.

- Typed monotonic action tokens replace indefinite arbitrary-ID result retention.128 full recent results /256KiB; expired, conflicting and future tokens reject without effects. Legacy strings are retry-only
-100 recent log lines /128KiB and64 recent battle summaries, with exact archived outcome counts
- Latest attempt per Arena and one current/latest series audit. Lifetime clear totals and daily eligibility remain exact; stale series cannot bind to a new reservation
- Schema1 validates its complete old records before conversion. The UI keeps the raw original read-only until explicit retention confirmation, offers full original export, and preserves a browser backup when capacity permits
- Separate, bounded20MB legacy recovery; normal current saves remain limited to5MB
- Every size-growing battle transition uses draft/validate/size-check/commit. Serialization is pure
- Enemy card CSS no longer affects enemy-hit log entries, resolving the observed oversized blank log rows

381 checks, static build and whitespace checks passed. The complete test run includes1,200 series (89,248→92,565 bytes from400→1,200), a greater-than5MB legacy recovery,1,000-item capacity case,180-day bounded Arena history, all unchanged historical gameplay/RNG fixtures, strict replay/import checks and storage/consent failure paths. Eight actual QA exports preserve their C16a-normalized core and round-trip.

The API contract changes intentionally: callers needing retries capture nextCommandToken(game), and cannot open new actions with old strings. State children may be replaced after transactional commits; callers should reread game.battle rather than retain mutable nested references. Historical fixture JSON remains unchanged. Existing tests were ported to typed tokens; duplicate tests retain/reuse exact tokens rather than silently allocating new ones.

No globally authoritative guarantee is made across edited/rolled-back saves or concurrent tabs. Full long activities still require separate implementation and validation. Independent exact-SHA source and actual archive/decline/confirm/reload UI checks remain pending at freeze. Source details: AUDIT-RETENTION.md, COMMAND-LEDGER.md, ARENA-RETENTION.md.
