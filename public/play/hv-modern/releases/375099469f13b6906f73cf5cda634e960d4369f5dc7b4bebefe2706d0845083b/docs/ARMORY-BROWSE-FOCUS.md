# Armory browsing focus continuity

This independent successor is based on frozen loadout-preview source `144ed01e929d4e52b6f591f91c3da62a8f373c78`. It changes only transient focus handling for existing Armory browsing controls. It does not imply publication or native-browser acceptance.

## Reproduced defect

The Armory click handlers replace the app markup after selecting a category, container, inventory item or workbench tab. Unlike ability-slot and battle controls, these buttons had no focus restoration. A replacement-aware DOM model running the actual app reproduced four failures: each activated button disappeared and the live focused control became null. This is a source/VM reproduction, not a claim about measured browser scrolling.

## Behavior

Before rendering, remember only a currently rendered Armory browsing button and its exact dataset value. After rendering, focus its enabled replacement using ordinary `focus()`. If a previously focused item has disappeared from the filtered list, focus the new visible selected item; if there is no such item, focus search. Item IDs are compared as strings, never interpolated into CSS selectors. Search input caret restoration keeps its existing implementation.

Modal and other-view focus are excluded. Equipment commands, protection selectors and navigation controls are not added to this restoration policy. No Tab interception, positive tabindex, DOM reordering, CSS alteration or new shortcut is introduced. Read-only observer browsing remains available, while mutation controls remain disabled. Existing ability-slot focus and narrow bottom-navigation insets are unchanged.

All game rules, resource recovery, equipment projections, save schema, storage ownership, Training and art remain unchanged. Browsing does not call equipment commands or persistence; the existing render lifecycle is retained.

## Verification and acceptance

Run `npm run check`, `npm run build`, then `npm run verify:checkpoint` with Node.js 20 or later. There are no install dependencies. `npm start` serves the source for development. See README and RELEASE-DEPLOYMENT for portable build and immutable-release requirements.

Regression tests cover repeated replacement focus for all four controls, disappeared-row and empty-result fallbacks, observer operation, and yielding to modal/navigation. They compare full serialized game and every storage key/value/write count, including RNG/event counters. Existing search/caret and equipment operation tests continue unchanged. The application hash in the narrow-focus source guard is updated intentionally; the CSS and its negative guards are retained.

Native browser acceptance is still required: desktop and narrow layouts; category/container/item/tab selection via keyboard; Tab and Shift+Tab after each replacement; focus visible above bottom navigation; empty results and clear filters; repeated operation; observer; original-save restoration. VM focus identity does not prove real native focus visibility, keyboard defaults, screen-reader behavior or scroll position. Do not label this checkpoint native PASS before that evidence exists.
