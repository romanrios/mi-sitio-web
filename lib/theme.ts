export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";
export type DefaultThemeSetting = "dark" | "light" | "system";

export function getThemeInitScript(
  defaultTheme: DefaultThemeSetting = "dark"
): string {
  return `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var s=localStorage.getItem(k);var d=${JSON.stringify(defaultTheme)};var t=(s==="light"||s==="dark")?s:(d==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):d);document.documentElement.classList.toggle("dark",t==="dark");}catch(e){}})();`;
}

export const themeInitScript = getThemeInitScript("dark");

export function getResolvedTheme(): Theme {
  if (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
  ) {
    return "dark";
  }
  return "light";
}

export function applyTheme(theme: Theme) {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Silenciosamente ignorar si localStorage está bloqueado o deshabilitado
  }
}
