# Readability and narrow-layout candidate

This is a CSS-only interface change from the frozen ordinary-Arena checkpoint
80f41c1. All thirty runtime JavaScript modules, including app behavior, gameplay,
imports, protected storage, keyboard handling and dialog control, retain exact
predecessor bytes. Original artwork is unchanged. Rule version remains v28;
the immutable release marker distinguishes this visual build.

## Observed problem and changes

An actual cloud-browser screenshot of the preceding interface at 1165×747 showed
very small resource/sidebar/provenance labels. Its stylesheet is byte-identical
to the Arena baseline. Source inspection found many 8–10px labels, a 7px action
help override at 941–1150px, and 23×23px attribute controls (22×24px below 650px).
These are concrete source dimensions, not measured physical-device sizes.

The stylesheet now has a 12px floor for explicitly sized compact text and 14px
base/explanatory copy. Narrow media rules retain those sizes instead of shrinking
labels. Action descriptions can wrap, action grids reflow, the character sheet
becomes one column sooner, narrow attribute grids become one column, and narrow
modal actions stack. Header/resource rows can wrap. Compact controls have 36px
minimum height; at 650px or narrower buttons and visible form controls have 44px
minimum height, buttons 44px minimum width, and attribute/modal-close controls
are 44×44px. File inputs remain under their existing accessible hidden-input flow.

## Contrast scope

Secondary flat-background labels now use `#aaa7bb` for resource maxima, rail
version, footer caveat, rules sidebar and empty log copy. Previously the three
identified pairs were resource maxima `#706c81` on `#191922`, rules sidebar
`#787184` on `#191a25`, and footer `#686273` on `#101119`. Tests calculate sRGB
relative luminance and contrast against these declared solid backgrounds.
Explanatory ledger text and compact action descriptions use `#b4afc3`.

These calculations do not measure the actual pixels of artwork, gradients,
transparent overlays, hover filtering, disabled opacity or every interactive
state. This is not a full accessibility certification. Native review must still
check that larger text fits, meaningful content remains visible, controls are
reachable and complex backgrounds remain readable.

## Keyboard and motion

The existing gold focus-visible outlines, dialog focus/wrap behavior, editing
hotkey guards and ownership barriers are retained unchanged. Both existing
reduced-motion routes remain: OS `prefers-reduced-motion: reduce` and the user's
in-app motion preference disable CSS animation/transition. The OS rule also
removes smooth scrolling. Static hover/dead-state transforms are not described
as animations, and existing action timers/game events are unchanged.

## Verification

Run `npm run check`, `npm run build`, `npm run verify:checkpoint`.
Source tests check typography declarations and effective representative media
cascades, flat-color contrast, target-size/reflow declarations, focus and both
reduced-motion paths. They cannot establish native layout, physical touch use,
font rendering or screen-reader usability. The native cloud browser should test
its supported wide and narrow viewport sizes; do not claim 390px or real mobile
hardware coverage unless that configuration was actually available and checked.

The source/deployed manifest preserves the existing copied-versus-transformed
release contract. No game-rule migration, balance change, free resource grant or
new account capability belongs to this checkpoint.
