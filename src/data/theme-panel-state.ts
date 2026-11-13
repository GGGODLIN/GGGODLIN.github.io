export interface FocusablePanelElement {
  inert: boolean;
  setAttribute(name: string, value: string): void;
  focus(): void;
}

export interface SyncThemePanelParams {
  readonly open: boolean;
  readonly trigger: FocusablePanelElement;
  readonly panel: FocusablePanelElement;
  readonly closeButton: FocusablePanelElement;
  readonly panelContainsActiveElement: boolean;
}

export function syncThemePanelAccessibility({
  open,
  trigger,
  panel,
  closeButton,
  panelContainsActiveElement,
}: SyncThemePanelParams): void {
  if (open) {
    panel.inert = false;
    panel.setAttribute("aria-hidden", "false");
    trigger.setAttribute("aria-expanded", "true");
    // The trigger becomes opacity:0 / pointer-events:none while expanded;
    // marking it inert prevents Shift+Tab from landing on an invisible button.
    trigger.inert = true;
    closeButton.focus();
    return;
  }

  panel.setAttribute("aria-hidden", "true");
  panel.inert = true;
  trigger.inert = false;
  trigger.setAttribute("aria-expanded", "false");
  if (panelContainsActiveElement) {
    trigger.focus();
  }
}
