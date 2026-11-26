import { DARK_THEME, DEFAULT_THEME, THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "@/constants/theme";
import type { Theme } from "@/types/theme";

export function readDocumentTheme(): Theme {
	return document.documentElement.getAttribute(THEME_ATTRIBUTE) === DARK_THEME ? DARK_THEME : DEFAULT_THEME;
}

export function applyTheme(theme: Theme): void {
	document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);

	try {
		window.localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch (error) {
		console.warn("Theme preference could not be saved; it will apply for this visit only.", error);
	}
}
