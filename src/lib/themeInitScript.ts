import { DARK_SCHEME_QUERY, DARK_THEME, DEFAULT_THEME, THEME_ATTRIBUTE, THEME_STORAGE_KEY, THEMES } from "@/constants/theme";

export const themeInitScript = `
(function () {
	var theme = ${JSON.stringify(DEFAULT_THEME)};
	var saved = null;
	try {
		saved = window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
	} catch (error) {
		saved = null;
	}
	try {
		if (${JSON.stringify(THEMES)}.indexOf(saved) !== -1) {
			theme = saved;
		} else if (window.matchMedia(${JSON.stringify(DARK_SCHEME_QUERY)}).matches) {
			theme = ${JSON.stringify(DARK_THEME)};
		}
	} catch (error) {
		theme = ${JSON.stringify(DEFAULT_THEME)};
	}
	document.documentElement.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)}, theme);
})();
`;
