import { DARK_SCHEME_QUERY, DARK_THEME, DEFAULT_THEME, THEME_ATTRIBUTE, THEME_STORAGE_KEY, THEMES } from "@/constants/theme";

export const themeInitScript = `
(function () {
	var theme = null;
	try {
		var saved = window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
		if (${JSON.stringify(THEMES)}.indexOf(saved) !== -1) {
			theme = saved;
		}
	} catch (error) {
		theme = null;
	}
	if (theme === null) {
		theme = window.matchMedia(${JSON.stringify(DARK_SCHEME_QUERY)}).matches ? ${JSON.stringify(DARK_THEME)} : ${JSON.stringify(DEFAULT_THEME)};
	}
	document.documentElement.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)}, theme);
})();
`;
