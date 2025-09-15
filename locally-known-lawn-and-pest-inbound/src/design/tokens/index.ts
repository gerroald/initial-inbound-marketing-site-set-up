export type ThemeName = "current" | "theme-1" | "theme-2" | "theme-3" | "theme-4" | "theme-5";

export function setTheme(name: ThemeName): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = name === "current" ? "" : name;
  try { localStorage.setItem("theme", name); } catch {}
}

export function getSavedTheme(): ThemeName | null {
  try {
    const v = localStorage.getItem("theme");
    if (v === "current" || v === "theme-1" || v === "theme-2" || v === "theme-3" || v === "theme-4" || v === "theme-5") return v;
    return null;
  } catch { return null; }
}

export const TOKENS = {
  color: {
    bg: "var(--color-bg)",
    bgAlt: "var(--color-bg-alt)",
    fg: "var(--color-fg)",
    fgMuted: "var(--color-fg-muted)",
    border: "var(--color-border)",
    primary: "var(--color-primary)",
    secondary: "var(--color-secondary)",
    accent: "var(--color-accent)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    error: "var(--color-error)",
    info: "var(--color-info)"
  },
  spacing: (n: 1|2|3|4|5|6|7|8) => `var(--space-${n})`,
  radius: {
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    full: "var(--radius-full)"
  },
  typography: {
    fontSans: "var(--font-sans)",
    fsHero: "var(--fs-hero)",
    fsH2: "var(--fs-h2)",
    fsH3: "var(--fs-h3)",
    fsBody: "var(--fs-body)",
    fsSmall: "var(--fs-small)",
    lhTight: "var(--lh-tight)",
    lhBody: "var(--lh-body)"
  },
  z: {
    dropdown: "var(--z-dropdown)",
    sticky: "var(--z-sticky)",
    fixed: "var(--z-fixed)",
    modalBackdrop: "var(--z-modal-backdrop)",
    modal: "var(--z-modal)",
    popover: "var(--z-popover)",
    tooltip: "var(--z-tooltip)"
  },
  shadow: {
    sm: "var(--shadow-1)",
    md: "var(--shadow-2)",
    lg: "var(--shadow-3)"
  },
  bp: {
    sm: "var(--bp-sm)",
    md: "var(--bp-md)",
    lg: "var(--bp-lg)",
    xl: "var(--bp-xl)",
    xxl: "var(--bp-2xl)"
  }
};
