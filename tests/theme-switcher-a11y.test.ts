import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { syncThemePanelAccessibility } from "../src/data/theme-panel-state.ts";

const themeSwitcherSource = readFileSync(
  new URL("../src/components/ThemeSwitcher.astro", import.meta.url),
  "utf8",
);

function createFakeControl(name: string) {
  const attrs = new Map<string, string>();
  return {
    name,
    inert: false,
    focused: false,
    setAttribute(key: string, value: string) {
      attrs.set(key, value);
    },
    getAttribute(key: string) {
      return attrs.get(key) ?? null;
    },
    focus() {
      this.focused = true;
    },
  };
}

test("ThemeSwitcher markup ships closed panel with inert attribute", () => {
  const asideMatch = themeSwitcherSource.match(/<aside\b[\s\S]*?>/);
  assert.ok(asideMatch, "Expected <aside> panel in ThemeSwitcher.astro");
  assert.match(asideMatch[0], /\aria-hidden="true"/);
  assert.match(asideMatch[0], /\binert\b/);
});

test("opening and closing theme panel toggles inert and restores focus only when needed", () => {
  const trigger = createFakeControl("trigger");
  const panel = createFakeControl("panel");
  const closeButton = createFakeControl("close");

  syncThemePanelAccessibility({
    open: true,
    trigger,
    panel,
    closeButton,
    panelContainsActiveElement: false,
  });

  assert.equal(panel.inert, false);
  assert.equal(panel.getAttribute("aria-hidden"), "false");
  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  assert.equal(trigger.inert, true);
  assert.equal(closeButton.focused, true);

  closeButton.focused = false;
  syncThemePanelAccessibility({
    open: false,
    trigger,
    panel,
    closeButton,
    panelContainsActiveElement: true,
  });

  assert.equal(panel.inert, true);
  assert.equal(panel.getAttribute("aria-hidden"), "true");
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  assert.equal(trigger.inert, false);
  assert.equal(trigger.focused, true);

  trigger.focused = false;
  syncThemePanelAccessibility({
    open: false,
    trigger,
    panel,
    closeButton,
    panelContainsActiveElement: false,
  });
  assert.equal(trigger.focused, false);
});
