export type NavSection = "blog" | "workshops" | "demo";

export interface NavItemState {
  readonly active: boolean;
  readonly ariaCurrent: "page" | undefined;
}

export function resolveNavItemState(
  pathname: string,
  section: NavSection,
): NavItemState {
  const normalized =
    pathname !== "/" && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  if (section === "blog") {
    if (normalized === "/") {
      return { active: true, ariaCurrent: "page" };
    }
    if (normalized.startsWith("/blog/")) {
      return { active: true, ariaCurrent: undefined };
    }
    return { active: false, ariaCurrent: undefined };
  }

  const target = `/${section}`;
  if (normalized === target) {
    return { active: true, ariaCurrent: "page" };
  }
  if (normalized.startsWith(`${target}/`)) {
    return { active: true, ariaCurrent: undefined };
  }
  return { active: false, ariaCurrent: undefined };
}
