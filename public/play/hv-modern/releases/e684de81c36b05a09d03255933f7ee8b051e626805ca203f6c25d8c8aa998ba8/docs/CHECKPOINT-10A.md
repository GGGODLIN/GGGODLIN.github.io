# Checkpoint 10A · save-import hardening

Narrow correction to C10. Generated item IDs are now restricted to the engine's canonical lowercase alphanumeric/hyphen format before an imported save can reach rendering. This closes a markup-injection path via malicious hand-edited item IDs. Canonical earned items and earlier source-created saves remain compatible.

Item IDs are also escaped at HTML data-attribute boundaries as an independent defense. Three dedicated regressions cover hostile quote/markup/whitespace/path-like IDs and normal generated IDs. No gameplay, balance, reward, migration or armory-organization changes are included. All 162 checks, syntax and build pass.
