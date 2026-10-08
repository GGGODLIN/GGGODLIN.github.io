const INTERACTIVE_TAGS = new Set(['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT', 'SUMMARY']);
const INTERACTIVE_ROLES = new Set([
  'button', 'link', 'textbox', 'combobox', 'slider', 'spinbutton',
  'checkbox', 'radio', 'switch', 'tab', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
]);
const INTERACTIVE_SELECTOR = [
  ...[...INTERACTIVE_TAGS].map(tag => tag.toLowerCase()),
  ...[...INTERACTIVE_ROLES].map(role => `[role~="${role}"]`),
].join(',');

function closest(target, selector) {
  // Non-element event targets and lightweight DOM adapters need not implement it.
  try { return typeof target.closest === 'function' ? target.closest(selector) : null; }
  catch { return null; }
}

function attribute(target, name, property = name) {
  if (typeof target.getAttribute === 'function') {
    const value = target.getAttribute(name);
    if (value !== null && value !== undefined) return value;
  }
  return target[property];
}

function editableSetting(target) {
  const value = attribute(target, 'contenteditable', 'contentEditable');
  if (typeof value !== 'string') return undefined;
  switch (value.toLowerCase()) {
    case '': case 'true': case 'plaintext-only': return true;
    case 'false': return false;
    default: return undefined; // Invalid/inherit values inherit from their parent.
  }
}

/** Leave focused controls and editing to the browser; the caller owns modal keys. */
export function ignoreBattleHotkey(event) {
  if (!event || event.repeat || event.ctrlKey || event.altKey || event.metaKey ||
      event.defaultPrevented || event.isComposing || !event.target) return true;

  const target = event.target;
  if (closest(target, INTERACTIVE_SELECTOR)) return true;

  let editable;
  let inheritedEditable = false;
  const visited = new Set();
  for (let node = target; node && !visited.has(node); node = node.parentElement) {
    visited.add(node);
    if (INTERACTIVE_TAGS.has(String(node.tagName || '').toUpperCase())) return true;
    const roles = String(attribute(node, 'role') || '').toLowerCase().split(/\s+/);
    if (roles.some(role => INTERACTIVE_ROLES.has(role))) return true;
    // The nearest explicit setting wins, including a noneditable island.
    if (editable === undefined) editable = editableSetting(node);
    inheritedEditable ||= node.isContentEditable === true;
  }

  if (editable !== undefined) return editable;
  // Also support adapters exposing closest without a complete parent chain.
  const editableAncestor = closest(target, '[contenteditable]');
  if (editableAncestor) {
    const setting = editableSetting(editableAncestor);
    if (setting !== undefined) return setting;
  }
  return inheritedEditable;
}
