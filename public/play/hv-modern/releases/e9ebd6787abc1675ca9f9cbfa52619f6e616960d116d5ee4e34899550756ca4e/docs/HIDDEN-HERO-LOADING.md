# Hidden decorative hero loading candidate

This isolated successor starts from frozen pixel checkpoint `9dbcf3e34786bffc993940ce1d204babca8b7ff6`. It is a source-qualified performance hypothesis, not a measured improvement or native visual acceptance. The prior checkpoint and its assets remain unchanged.

## Narrow implementation

`battleHero()` now emits the same empty, `aria-hidden="true"` decorative wrapper without an eager image element. An appended `.battle-hero` CSS rule draws the same unchanged `pixel-hero.png` as a centered, non-repeating, contained background with pixelated scaling. The existing full stylesheet remains an exact prefix, including now-unused child-image styling. Existing wrapper dimensions, absolute position, stacking, pointer handling, dense-roster hiding and responsive visibility remain authoritative.

No application, engine, storage, schema, navigation, balance, enemy artwork, player portrait, raster bytes or build implementation changed. The asset remains in the portable content-addressed build graph, now as a stylesheet-relative reference rather than a runtime image reference. Existing release/presentation tests were updated narrowly to describe that intentional move.

## Source/model verification

- A new frozen-baseline receipt protects all application/runtime and public assets byte for byte, and the entire pixel stylesheet prefix. Reversing only the exact decorative hero function change restores the original art module hash.
- Source-model tests cover ordinary and dense rosters at 320, 375, 390, 650, 651, 979, 980, 981, 1164, 1165, 1166, 1549, 1550, 1551 and 1920 CSS pixels.
- Explicit geometry contracts: at 981–1165, 132×190, bottom 122; at 1166–1549, 168×235, bottom 116; at 1550+, 205×275, bottom 110. All retain left 8, absolute position, z-index 1 and pointer-events none. The hero is hidden at ≤980 or in `.arena-many`.
- A centered-contain mathematical model checks the prior and current visible rectangle using the unchanged PNG's 1086×1448 natural dimensions. This cannot establish actual browser rasterization, inline-image baseline effects, rounding, forced-color behavior or screenshot equivalence.
- The existing behavior-source projection, repeat-render purity, historical receipts, full test suite and deployed graph checks remain required.

Run `npm run check`, `npm run build` and `npm run verify:checkpoint` from this source checkout. Check output and external qualification records for actual results; these commands alone are not evidence of a pass.

## Unmeasured loading hypothesis and acceptance gate

The hero PNG is exactly 652,904 bytes. Avoiding its hidden-state request could save that asset's transfer on a cold first visit; this is an upper-bound asset-size hypothesis, not measured wire bytes, speed, memory or decode savings. CSS background loading is browser-dependent. Cache warmth and prior visibility change the outcome, and this candidate does not remove the asset from the deployment.

Before advancing this candidate, compare frozen and candidate native screenshots at 980/981, 1165/1166 and 1549/1550, phone widths, and camp, ordinary three-enemy and many-enemy states. Exercise active, paused and terminal battles; hero-hidden to hero-visible resize and dense-to-ordinary transitions. Check the same character position, size, pixel appearance, layering and unchanged targets/controls, including reduced motion and supported accessibility display modes. Any visual discrepancy must be investigated rather than waived by the mathematical model.

In fresh, cold-cache native browser sessions, record the candidate's hero request count and transfer bytes for initially hidden narrow/dense states. Require zero hero request while hidden, then one correct same-release request on first visibility, correct rendering after it loads, and no unintended repeated request on subsequent rerenders. Compare with the frozen implementation under identical conditions. Record browser/version, viewport, device scale factor, state, cache protocol and network evidence. Do not infer resource timing from source inspection.

No browser observation, new browser route, publication, GitHub write or replacement of the frozen/public build is authorized or performed by this source change. Native visual and cold-network verification remain separate pending gates.
