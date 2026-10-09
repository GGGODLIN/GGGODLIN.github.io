# Coherent, versioned static releases

## Why this checkpoint exists

After C23 publication, a real cloud browser's ordinary reload still executed the
previous unversioned module graph. A hard refresh loaded the new Searing UI.
This checkpoint replaces stable asset URLs with one content-addressed release
namespace. It does not change game rules, storage keys, saved ownership, account
permissions, browser settings, service workers or network configuration.

[MDN's HTTP caching guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)
describes URL-versioned static resources and the difference between normal and
forced reload. Different URLs avoid reusing the previous cached resource. This
build applies that principle to the entire transitive graph, not just app.js.

## Build and identity

`npm run build` creates a clean local dist with a root index.html, a current
release-manifest.json and an immutable releases/<full SHA256>/ directory.
The ID is deterministically derived from deployment source bytes/path names and
the build implementation. It does not depend on absolute workspace paths, git
HEAD, wall-clock time or modification timestamps.

All modules, CSS, artwork and rule documents belong to that same directory.
Native relative module imports stay within its src subtree; CSS-relative images
stay under its public subtree. App-generated art/document URLs use RELEASE.base.
Hash navigation remains at the normal game URL: no HTML base element is added.

The footer exposes a small r:<first12> marker with full identity in
`data-release-id` and its title. This indicates the executing graph, independent
of whether the character's active battle intentionally retains older rules.
Source development shows r:dev. The marker does not become part of a save.

## Source bytes versus deployed bytes

The deployment manifest records each source path/hash/size, deployed path/hash/
size and transformation label. Only two source artifacts are transformed:

1. Root index.html references the release-specific module, stylesheet and favicon.
2. The released src/release.js contains the generated full ID and relative base.

Other source files remain byte-identical at their versioned deployed paths.
Do not compare all deployed artifacts to source and claim universal byte identity.
`npm run verify:checkpoint` validates both representations, complete import/URL
resolution, required original art/fixtures, and unchanged gameplay/save modules.
This is a local integrity gate, not proof of remote publication or browser use.

## Mandatory publication contract

The new dist is an additive deployment payload, NOT a mirror/delete specification.
An authorized publisher must:

1. Reconcile the current remote base/head before preparing its commit.
2. Run local check, build and verify:checkpoint on the exact accepted checkpoint.
3. Preserve every previously published releases/<id>/ directory byte-for-byte.
4. Preserve the legacy top-level C23 src/, styles.css, public/assets/ and docs/
   graph byte-for-byte. Cached old root HTML can still reference these paths.
5. Add the complete new immutable release directory. A pre-existing same-ID path
   with different bytes is a fatal collision, never an overwrite opportunity.
6. Switch only root index.html and release-manifest.json. Prefer one atomic Git
   commit containing the complete graph plus both entry files. If an uploader
   cannot switch atomically, stage and hash-verify all graph files before either
   root entry is switched. Never point HTML at a partially uploaded graph.
7. Read back remote hashes, reconcile CI/deployment, and verify the visible marker
   using ordinary navigation/reload. Keep save export/restoration under normal
   authorization and preservation procedures.

`scripts/plan-publication.mjs <candidate-dist> <existing-hv-root>` produces a
read-only plan with immutable additions/reuse, expected previous entry hashes,
all retained bytes and an empty deletion list. It rejects legacy-path replacement,
immutable collisions and symlinks. It does not upload, stage, commit or delete.
Candidate integrity and remote-base reconciliation are still required separately.
Do not propagate local dist cleanup to the deployed tree. Retention cleanup, if
ever needed, requires a separate policy and approval; this checkpoint authorizes
none.

## Stage a preview before promoting the live entry

For a browser gate that must run before the normal game URL changes, use:

```sh
node scripts/plan-publication.mjs --preview <candidate-dist> <existing-hv-root>
```

The equivalent JavaScript API is
`planPublication(candidateRoot, existingRoot, {preview: true})`. The original
two-argument CLI and API still produce the normal promotion plan.

Preview mode plans the complete immutable release graph plus exactly one sibling
HTML file: `preview-<full release ID>.html`, in the same directory as root
`index.html`. Its `stagePreview` record has `sourcePath: "index.html"` and the
candidate entry's exact byte count and SHA256. An authorized publisher copies
those bytes without editing the HTML, inserting a base element, adding a banner,
or moving the preview into a subdirectory. Relative release, CSS, artwork and
document URLs therefore resolve identically to the candidate's future live
entry, including when the entire game is deployed under a repository subpath.
Hash navigation remains within the preview HTML filename.

The preview plan has an empty `switchEntry` and deletion list. Root index.html,
the current release-manifest.json, all legacy top-level assets, older immutable
releases and existing previews are retained unchanged. The candidate manifest
is not substituted for the live manifest. A matching same-ID release/preview
can be reused; conflicting file bytes, a directory occupying an intended file,
or a file blocking an intended parent directory are fatal collisions. Never
overwrite a collision. The planner itself remains read-only and performs no
local staging or remote write.

Before exposing the preview entry, stage and hash-read-back every graph file,
unless the graph and preview are added atomically. Verify the preview HTML hash
against its `stagePreview`/`reusePreview` record, confirm the live root entry and
manifest hashes have not changed, then open the exact version-labelled URL for
the authorized browser gate. The visible release marker must identify the
candidate. A preview on the same origin shares the game's browser storage; the
filename is not save isolation or permission to change a real save. Use the
normal approved save-preservation and browser-test procedures.

After the browser gate passes and live promotion is authorized, run the normal
publication plan against a freshly reconciled deployed tree. It reuses the
staged release graph, switches only root index.html and release-manifest.json,
and retains the version-labelled preview unchanged. If candidate source or docs
change after staging, rebuild and verify, then stage the resulting new release
ID and preview and repeat the gate. Never retarget an older preview filename.

## What normal refresh establishes

When the entry document is revalidated and receives the new HTML, every graph URL
changes together, so an old JS/CSS response cannot masquerade as the current URL.
A still-open page, back-forward cache, offline document or legitimately fresh
cached HTML can remain on its older release. Retaining old graphs keeps that page
coherent. This build cannot promise every never-refreshed tab instantly runs the
newest release, and does not clear user storage or force reloads. Existing
concurrent-tab save conflicts and backward compatibility of newer saves in an
older open application are not solved by asset versioning itself. The current
checkpoint separately repairs save authority through the protected namespace and
exclusive owner described in [SAVE-OWNERSHIP](SAVE-OWNERSHIP.md).

Reproducible tests cover deterministic builds, source/CSS changes producing new
namespaces, transitive resolution, subpath portability, source/deployed hash
mappings, tamper rejection, publication retention/conflicts, actual generated-app
markers/URLs, old-save reentry and identical gameplay. Browser cache behavior and
layout need separate runtime QA after publication.
