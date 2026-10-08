# Checkpoint 22a — replacement presentation and import ordering

This is a narrow UI correction on checkpoint 22. Game rules, Training costs, clocks, EXP, migrations and serialized ledgers are unchanged.

- A successful reset/import clears the previous profile's Training notice, error and pending quote only after the new save has been written and verified
- Failed save replacement retains the previous game, Training presentation, pending import/reset, consent flags and primary bytes; retry remains available
- Each file selection gets a unique read token. A newer selection, modal dismissal, navigation, reset or another modal invalidates the older read
- An obsolete file result or read error cannot replace the current preview, reopen a dismissed modal, or change the toast
- Latest-read failure reports a read error without changing the current game or storage

The actual-app VM regression suite now includes successful and failed reset/import after Training collection, recovery retry, reverse file completion order, stale malformed/error reads, dismissal/navigation/reset during an outstanding read, and current-read failure. Existing failed-write tests also carry Training presentation fields to verify complete retention.

Local gate: 569 checks pass; production build and diff check pass. No browser execution or publication is claimed by this source checkpoint.
