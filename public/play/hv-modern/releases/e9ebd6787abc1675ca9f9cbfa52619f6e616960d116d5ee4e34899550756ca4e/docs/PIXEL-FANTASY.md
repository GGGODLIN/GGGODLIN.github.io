# Pixel-fantasy visual checkpoint · 01

The user approved design mock 01 on 2026-10-09. This checkpoint starts implementation of that moonlit, indigo/violet/gold pixel-fantasy direction. It is not full visual or native-browser acceptance.

## Implemented

- Original moonlit-ruins background; independent wolf, wraith and stone-sentinel sprites; purple-cloaked adventurer and player portrait.
- Decorative battle hero on wide ordinary encounters. Narrow screens and dense enemy rosters use the player portrait and reserve space for actual targets rather than overlaying the hero on controls.
- New editable 16×16 grid-native SVG interface glyphs and four equipment illustrations. Their geometry uses filled integer cells and crisp edges, rather than smoothing the previous line art.
- Square gold-beveled controls, navy/teal surfaces, health bars, selected-target markers and combat feedback.
- A shared theme for the game shell, battle, Armory, character/Abilities, Settings, activities, supplies, training and rules screens.
- Traditional Chinese remains real, selectable system-font text. All original actions and disclosures remain present: seven battle commands, three potion types, current costs, cooldowns, target details and combat logs come from the existing engine, not from the design mock.

The generated bitmap art is pixel-styled artwork; the SVG icons and equipment illustrations are literal editable 16×16 grids. Generated image pixels may include export edge/color variation. There is no claim that the source PNGs are mathematically limited to exactly 20/24/32 colors.

## Behavior and preservation

No engine, data, combat, navigation, ability, Armory logic, storage, save owner, save schema or compatibility module was changed. App integration consists of four exact decorative substitutions: artwork imports, header portrait, enemy images and the decorative hero. The verification helper reverses only those exact substitutions and compares every remaining app byte with the frozen bulk-organization receipt.

The entire previous stylesheet is retained as a prefix. The original four artwork/provenance files are unchanged. Original SVG illustration source is archived as `pixel-mock/pre-pixel-art.js.txt`. Historical fixtures, evidence and saved-state compatibility are preserved.

Inherited presentation/source tests were adapted transparently: the app hash test uses the four-substitution behavior projection, and the Fire-preview positioning test checks actual preview selectors rather than rejecting independent decorative positioning elsewhere in the appended stylesheet. Release tests now expect the five explicit pixel asset references and verify the archived original art module separately from its approved replacement. No historical receipt was rewritten.

## Build and checks

From the source directory:

```
npm run check
npm run build
npm run verify:checkpoint
npm start
```

Build output is content-addressed and uses only relative URLs. `verify:checkpoint` checks exact gameplay/save module bytes, the exact projected app, the preserved stylesheet prefix, original artwork, historical fixtures and the whole deployed graph. Additional pixel-presentation tests cover asset presence/alpha, original-art hashes, decorative markup, actual command controls and repeated-render purity.

## Acceptance still required

The one authorized private cloud-browser opening of the local preview failed with `ERR_CONNECTION_REFUSED` before loading the app. No alternate address, proxy, protocol, headless browser or publication route was used. Therefore real rendered layout, actual screenshot appearance, scrolling, touch hit targets, focus visibility and native keyboard behavior remain UNVERIFIED. Source/model tests are not substitutes for that gate.

Before broad visual acceptance, inspect ordinary and dense battles at desktop and narrow sizes; active/paused/terminal battles; enemy effects/Fire preview; Armory selection and bulk controls; Abilities slot selectors; Settings/import/export dialogs; keyboard focus, reduced motion and interrupted/repeated flows. This is the first functional implementation slice and a global visual foundation, not a claim that every page is visually polished or that every original HV rule is implemented.

No external publication or GitHub write was performed. The existing public build was not replaced.
