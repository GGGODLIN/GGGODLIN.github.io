# Full, level-capped Ability Boost

This newly written checkpoint extends C27 `14044890bcea4b8375ea217232c1b33eb6e13422`.
It preserves prior paid jobs and the first-rank behavior. It does not recover a
missing historical implementation or provide free AP.

## Evidence and numerical scope

[Training revision65215](https://ehwiki.org/index.php?title=Training&oldid=65215)
was checked2026-10-08. Ability Boost has500 ranks, each+1AP and two hours, with
trained rank capped by player level. For N already completed ranks, the next
incremental price uses the published candidate:

`Math.round((100 + 100 * N) ** (1 + 0.0005548607 * N))`

N ranges0–499; buying rank r uses N=r−1. Early prices are100,201,302,404,507.
The final rank costs999,999 and the computed sum is109,521,466 Credits, matching
that English table. Older translated totals state109,521,469. This discrepancy
remains visible; constants are not adjusted to force agreement.

The same source's Adept formula remains unchanged. Its computed endpoint49,999
and sum5,126,663 conflict with the English table50,000 and5,126,661. Neither curve
is labeled original-server-exact. Revision dates and official0.91 confirmation
were unavailable; the community page may contain stale material.

## Eligibility, payment and AP

The next Boost rank must not exceed min(500, player level). Below the global cap,
the UI retains the real next price even if level-locked, distinguishes that lock
from completing all500 ranks, and does not charge until a new eligible quote is
confirmed. A legitimate level gain can unlock the next rank; it does not itself
complete training or add trained AP.

Only one shared Adept/Boost job may run. Every start debits its current incremental
price, waits the full two hours, then requires the existing safe Training visit.
No queue, acceleration, auto-renewal or extra rank on a late visit is introduced.
Pre-expiry cancellation refunds that job's recorded debit exactly once, never
the cumulative historical expenditure. At/after expiry no refund is allowed.
Combat and wave pauses continue to block collection and fresh mutations.

Total AP is levelAP+validated completed Boost rank, at most twice player level
and1000 at level500. Ownership/assignment remain separate. Reset refunds only
ability purchase costs; it cannot refund Training, remove trained AP or restore
its price. Existing Tank tables, Cure, Mastery and reset allowances are unchanged.

## Versioning and validation

Rules version becomes `persistent-0.91-training-v22`; Training model becomes
`level-capped-training-candidate-v1`. The old Adept-only and shared-first-rank
validators remain separately retained for strict migration. A migration changes
only model identity and the previously documented missing defaults; existing
rank1 ownership, pending cost/deadline, receipts, Credits and battle outcomes are
preserved. Old shared schemas cannot claim a second rank before migration.

The current ledger validates actual formula-derived debit, rank/revision bounds
and minimum accumulated completed duration. Both completed and pending Boost
ranks are checked against the owning player's level by the full state APIs.
Adept retains its existing300-rank policy without inventing a player-level cap.

A coherently rewritten local file is not proof of payment or wall time. Trusted
server time and protection against deliberate local tampering remain limitations.
The protected progression integration now supplies cooperating multi-tab authority
through SAVE-OWNERSHIP.md; it does not prove payment or trusted time. No original-site, donation, Hath or Isekai AP is enabled.

## Verification

New tests exhaust all500 prices, all player-level gates, full sequential payments,
mixed800-job Adept/Boost progression, exact refunds/replays, invalid clocks and
schemas, legacy migration, pending-over-level imports, maximum1000AP, ownership
refunds and UI level-lock/global-cap distinctions. A real previous-engine trace
preserves a synthetic funded level500 ten-Tank practice with a paid rank1 job.
The old first-rank tests remain enabled with only now-obsolete cap expectations
updated. Sources and deployed transformations are separately hash-checked.

No original-server account, native browser, mobile or remote publication acceptance
is inferred from source/VM tests.
