import { useCallback, useSyncExternalStore } from "react";
import { DARK_THEME, DEFAULT_THEME, THEME_ATTRIBUTE } from "@/constants/theme";
import { applyTheme, readDocumentTheme } from "@/lib/theme";
import type { Theme } from "@/types/theme";

function subscribe(onChange: () => void): () => void {
	const observer = new MutationObserver(onChange);
	observer.observe(document.documentElement, { attributes: true, attributeFilter: [THEME_ATTRIBUTE] });

	return () => observer.disconnect();
}

function getServerSnapshot(): Theme {
	return DEFAULT_THEME;
}

export function useTheme() {
	const theme = useSyncExternalStore(subscribe, readDocumentTheme, getServerSnapshot);

	const toggleTheme = useCallback(() => {
		applyTheme(readDocumentTheme() === DARK_THEME ? DEFAULT_THEME : DARK_THEME);
	}, []);

	return { theme, toggleTheme };
}
