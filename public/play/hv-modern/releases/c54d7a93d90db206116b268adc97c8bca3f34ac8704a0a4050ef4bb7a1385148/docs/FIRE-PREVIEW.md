# Own Fire target preview

This checkpoint adds a read-only presentation of the enemies Fire would attempt
to target under the currently pinned series policy. It does not change the save
schema, ownership model, battle policy or original-rule claims.

The preview and actual Fire resolution share one pure ordered target selector.
The selected living enemy comes first, followed by other living enemies in their
existing encounter order, up to the current series cap. Legacy series can retain
one target; ordinary current Fire has a base cap of three; assigned Conflagration
ranks 1–3 can produce caps four, four and five in a new series. Dead enemies are
excluded. A completed round or absent active battle has no preview targets.

A highlighted card is a possible attempt, not a guaranteed hit. The preview does
not evaluate accuracy, damage, critical hits, Searing application, future enemy
actions or any random draw. It uses only enemy identity, living status and order
already visible in the encounter. It does not reveal unscanned numeric stats.
Availability to cast remains governed by the existing action button and engine;
showing an area does not promise sufficient MP or an available action.

The deliberate toggle works without hover and remains available in read-only
sessions. Preview state belongs to the interface only, never to the saved game.
Entering a modal, navigating away or changing game state clears it. Turning the
preview on must not cast, save, collect Training, advance clocks, consume RNG or
move keyboard focus to a different action. Focus and native button activation
must remain independent from battle hotkeys.

Styles append to the accepted Mastery CSS, preserving independent enemy sprite,
status, name, level and health rows. A card outline/background distinguishes the
area without covering labels; a textual count provides a non-colour signal.
Native layout and assistive-technology acceptance remain separate from source
and synthetic app tests; this is not a full accessibility certification.

## Verification

Run `npm run check`, `npm run build` and `npm run verify:checkpoint` from the
source directory. The checkpoint verifier checks the complete immutable release
graph, all inherited historical fixtures and original artwork, all 28 unaffected
runtime modules and the accepted CSS prefix. Only `src/engine.js` (pure selector
extraction) and `src/app.js` (interface state/presentation) intentionally change.
Mastery/AP/credit ledgers, ownership, migration and storage modules remain exact.

The slot-index picker remains a separate UI limitation; this checkpoint does not
add assignment or currency operations. Freeze, Protection, periodic restorative
rules and unresolved original-server coefficients remain deferred.

A development comparison against frozen Mastery
`0daa178f1d49485c0a601f1f5faf78cef02695b8` matched complete results, state objects
and serialized saves for 1,197 actions: 1,152 seeded casts across nine scenarios,
36 rejected casts and nine historical replay actions. Synthetic variants cover
rank/policy, sparse living targets, Focus/Spirit and Searing refresh; they do not
claim organically earned progression or original-server parity. Portable tests
also replay the inherited exact frozen pre-Mastery recording. The comparison
is evidence for a behavior-preserving extraction, not a new combat policy.


## Accepted enemy identities

Preview description IDs use the enemy's roster index, not imported enemy text.
Accepted historical saves can contain whitespace or punctuation in enemy IDs;
HTML escaping alone would not make whitespace a single ARIA ID reference. The
label successor preserves those saves and changes only generated DOM identity.
The initial frozen preview's whitespace-association failure is retained as QA
evidence; it did not alter battle targeting, state or storage.
