import type { Theme } from "@/types/theme";

export const THEMES: readonly Theme[] = ["light", "dark"];
export const DEFAULT_THEME: Theme = "light";
export const DARK_THEME: Theme = "dark";
export const THEME_STORAGE_KEY = "theme";
export const THEME_ATTRIBUTE = "data-theme";
export const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";
