# Original pixel artwork · 2026-10-09

Generated with OpenAI built-in imagegen. No copied game art, web images or third-party reference artwork was supplied. The only references were the original VESPER scene study, the user-approved original mock, and newly generated sprites. Existing painterly assets remain untouched in the parent assets directory.

## Asset chain

- `pixel-arena.png`: original scene study, reused unchanged. Wide moonlit pine forest and ruined stone terrace, indigo/teal/violet/gold pixel-art direction, no creatures or UI.
- `pixel-hero.png`: original full-body purple-cloaked adventurer generated using approved mock 01 as a design reference. Transparent background, right-facing stance, full sword and boots.
- `pixel-portrait.png`: original close-up generated using the new full-body hero as reference; dark hair, violet cloak, gold clasp and solid midnight background.
- `pixel-enemies.png`: coarse-grid revision of an original three-enemy sheet, generated from mock 01's creature concepts. Kept as a source study; the live interface does not slice this sheet.
- `pixel-wolf.png`, `pixel-wraith.png`, `pixel-golem.png`: each extracted independently by imagegen from that coarse-grid sheet onto its own transparent canvas. Live controls use these standalone files, so adjacent sheet creatures cannot leak into another target.

Original generated outputs and rejected intermediate sheets remain preserved separately. No image was cut from the UI mock with code or substituted as a fake runtime screenshot.

## Prompt specifications

Scene: original production 16-bit fantasy-RPG backdrop; visible square pixel grid; indigo night sky, muted teal pine forest, violet mountains, pale gold moon, ruined pillars and broken arch, broad empty stone terrace; hard cel shading, no characters, text or UI.

Hero: lone young adult adventurer facing right in three-quarter rear combat stance; dark windswept hair, violet cloak with gold trim, indigo armor, brown boots, steel sword and gold clasp; full body on genuine transparency, crisp square clusters, limited palette and hard cel shading, no floor/shadow/text/UI.

Portrait: matching hero's head and shoulders; tightly framed, looking right; very coarse 16-bit style, visible square pixels, 20-color target, hard jagged steps, no tiny texture, solid midnight navy background, no frame or text.

Enemy sheet: three distinct full-body creatures in a horizontal row; left crescent-horned indigo wolf with violet flames and gold eyes, center faceless purple wraith with gold chest core, right broad stone sentinel with gold seams and sword; transparent background, coarse uniform square grid, 3-tone cel shading, 32-color target, no scenery/UI/text. Revision explicitly requested coarser silhouettes and removal of smooth shading.

Standalone extraction prompt for each creature: "Extract only the [left crescent wolf / middle purple wraith / right stone sentinel] from supplied sprite sheet as a standalone full-body pixel-art game sprite. Remove every other creature. Preserve this creature design and coarse hard-edged pixel-art look, full weapons and effects, no extra ornament. Center in a square transparent canvas, whole sprite visible with 5% transparent padding on all sides, fill remaining space. True clean transparency, no background, no floor, no contact shadow, no text, no UI, no border. Preserve crisp square pixel clusters and 3-tone solid cel shading, no blur, antialiasing or smooth gradients."

The palette counts and exact logical resolution were generation targets, not verified PNG color-count guarantees. SHA256SUMS.json identifies the actual saved bytes.
