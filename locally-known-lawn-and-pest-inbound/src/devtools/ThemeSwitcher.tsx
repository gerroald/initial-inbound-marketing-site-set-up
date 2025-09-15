import { setTheme, getSavedTheme, type ThemeName } from "../design/tokens";

const themes: ThemeName[] = ["current", "theme-1", "theme-2", "theme-3", "theme-4", "theme-5"];

export function ThemeSwitcher() {
  const saved = getSavedTheme() || "current";
  function onChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    setTheme(target.value as ThemeName);
  }
  return (
    <div style={{ position: "fixed", right: 8, bottom: 8, zIndex: 9999, background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "6px 8px" }}>
      <label style={{ fontSize: "12px", color: "var(--color-fg-muted)", marginRight: 6 }}>Theme</label>
      <select onChange={onChange as any} defaultValue={saved}>
        {themes.map(t => (<option key={t} value={t}>{t}</option>))}
      </select>
    </div>
  );
}
