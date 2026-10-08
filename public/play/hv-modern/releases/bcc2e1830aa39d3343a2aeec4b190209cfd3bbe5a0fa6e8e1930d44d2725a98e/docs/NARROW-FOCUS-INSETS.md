# Narrow keyboard-focus viewing area

This CSS-only candidate derives directly from frozen
`5685b401463669493cc66406c7b9c0fb799b4e50`. It contains no Armory successor work.
All runtime JavaScript, engine/storage rules and artwork remain byte-identical.

## Observed boundary

Native testing confirmed that5685 made the exact Major20 and Supportive20 Unslot
focus visible after assignment. At485px, the following native Tab moved focus to
the abilities source-policy link, while the settled viewport did not expose that
link or its focus ring. The original save was restored before stopping.

This observation was **assignment then Tab**, not activating Unslot. Source
inspection found a fixed bottom navigation bar, layout-only bottom padding, no
scroll-padding/margin, and a source-policy link missing the other narrow links'
44px treatment. These source omissions predate5685. Earlier versions were not
natively reproduced for this case, so neither an earlier native failure nor a new
5685 regression is asserted. The screenshot supplies no measured DOM rectangles.

## Smallest stylesheet change

At widths650px and below:

- Root `html` gets `scroll-padding-bottom:84px`, matching the existing layout
  clearance beyond the68px fixed navigation. Existing page padding remains.
- `.ability-fidelity a` becomes an inline-flex box with a44px minimum height,
  6px/4px padding and8px block scroll margin, so the source-policy link has a
  clear target box and room for its existing focus outline.

The [CSS Scroll Snap specification](https://www.w3.org/TR/css-scroll-snap-1/)
defines scroll padding for viewing operations, including focus navigation; the
root property applies to the viewport. It works without enabling scroll snapping.
[MDN's scroll-padding reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-padding)
explains its use to exclude fixed-toolbar areas from the preferred viewing region.
These standards support the candidate; they do not substitute for observing this
particular browser's keyboard behavior.

There is no new focus event handler, forced JavaScript scrolling, scroll animation,
change to the successful exact-slot `focus()` call, or reduced-motion override.
Desktop focus styling, fixed-nav geometry and gameplay remain unchanged.

## Verification boundary

Source cascade tests compute selected declarations at narrow widths and around
the650px boundary, preserve existing layout clearance/focus/reduced-motion rules,
and reject missing or overriding declarations. These are modeled CSS contracts,
not browser-computed rectangles or proof that the focused link is visible.

Native acceptance must repeat exact-slot confirmation, forward Tab and Shift+Tab,
the policy link's full focus ring above the bottom navigation, and navigation
controls themselves. Test both motion preferences and supported desktop/narrow
cloud sizes, plus the boundary when the tool permits it. Do not infer physical
phone behavior or label untested widths as native acceptance.

Run `npm run check`, `npm run build` and `npm run verify:checkpoint`; all31 runtime
modules, inherited fixtures and original artwork are pinned. Keep earlier native
HOLD evidence and validate this successor separately before claiming resolution.

## Parallel Armory lineage

The separately source-tested Armory selection branch
`1f05b997349e7b0d6611ae89a4b7ab081d966eca` also starts from5685 and still contains
that predecessor's stylesheet. Publishing it unchanged after this CSS correction
would remove the new focus insets. This candidate intentionally contains no
Armory work.

A later integration must explicitly combine the verified Armory app behavior
with this candidate's stylesheet, retain both original baseline records, and
update the preservation contract for the declared composition. It needs its own
frozen source/build and native regression gates, including the complete keyboard
focus path. Passing either branch alone does not approve that integration.
The source package records this dependency in
`evidence/narrow-focus-lineage.json`; release coordinators should check it before
promoting a parallel branch.
