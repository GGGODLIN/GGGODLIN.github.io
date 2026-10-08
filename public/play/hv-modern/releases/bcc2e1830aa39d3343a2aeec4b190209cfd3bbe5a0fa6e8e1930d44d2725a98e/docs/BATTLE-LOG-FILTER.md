# Optional retained battle-log classification

This small interface addition helps browse the already retained full log. It is not a repair for lost events, a new battle rule, or a claim that the original interface was defective. The sidebar still shows the same newest nine rows. The full-log modal keeps the original newest-first text, 100-row retention limit and omitted-row explanation.

## Categories and boundaries

The native “紀事分類” select offers all rows, player attacks, enemy actions, recovery, status/resources and other rows. Attack/magic/kill belong to player attacks; enemy to enemy actions; heal/regen/recovery to recovery; status/resource to status/resources. A miss belongs to the player only with a targetId and no actor, or to enemies only with an actor and no targetId. Both or neither, unknown types and all remaining known types belong to other rows. Classification reads existing own data-property identity strings, not translated text or hidden enemy state.

Every category preserves original row references and text in reverse retained order. Categories are mutually exclusive and cover every row. The count says how many retained rows are displayed, not actions, enemies or total lifetime events. Empty-category wording refers only to currently retained records. No per-row turn/tick/time, damage totals, new Scan information, RNG, scheduler or enemy intent is reconstructed.

## UI-only state

Each modal opening defaults to all rows. Close, Escape, navigation and page departure discard the selection; reopening after a new series, import or reset starts from the new retained records. There is no saved filter preference or new save field.

A change must come from the live select node while the log modal is open and use a known category. The dedicated event branch updates only the result list, its scrollTop and a single polite atomic count. It does not replace or refocus the select, rerender the application/modal, read the clock, invoke Training, execute an action, persist or write preferences. Read-only and audit-pending users may browse through the existing log access; mutation permissions are unchanged.

The native select remains part of the existing modal Tab trap. The result list is not a live region. Existing focus outlines and reduced-motion rules remain. Scoped CSS allows controls/counts to wrap, keeps a44px select and14px text, and wraps long unbroken log strings. Source declaration tests do not simulate native geometry or certify screen-reader/touch support. Native review must report only viewport sizes actually reached by its tools; no advance claim is made for320/360px.

## Preservation and checks

Base: c56708581b1a4c8328dfe97328ec6e32a1b5f352. Engine, save schema, policies, Training, ledger modules and original art are byte-identical. Only app.js changes among the31 existing runtime modules; battle-log-view.js is a new pure presentation helper. The complete accepted stylesheet remains an exact prefix, with only full-log controls appended. Armory reconciliation, Sorcery and successful slot focus remain in the application.

The narrow-focus test updates only its exact application hash to this UI candidate, retaining its native-focus call and CSS guards. Historical fixtures and shared VM harness are unchanged. The local UI test adapter models only touched nodes and events; it is not a browser or layout engine. The CSS test initially failed because its test parser included a comment in a selector; stripping comments corrected the test, with no product change.

Run npm run check, npm run build and npm run verify:checkpoint. Independent source, publication and native acceptance remain separate gates. No unimplemented game mechanic or external account perk is added.
