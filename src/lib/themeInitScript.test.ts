import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "@/constants/theme";
import { themeInitScript } from "./themeInitScript";

const originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");

function mockPrefersDark(prefersDark: boolean) {
	Object.defineProperty(window, "matchMedia", {
		configurable: true,
		writable: true,
		value: jest.fn().mockImplementation((query: string) => ({
			matches: query === "(prefers-color-scheme: dark)" && prefersDark,
			media: query,
		})),
	});
}

function runInitScript() {
	window.eval(themeInitScript);
}

function getAppliedTheme() {
	return document.documentElement.getAttribute(THEME_ATTRIBUTE);
}

describe("themeInitScript", () => {
	beforeEach(() => {
		window.localStorage.clear();
		document.documentElement.removeAttribute(THEME_ATTRIBUTE);
	});

	afterEach(() => {
		jest.restoreAllMocks();
		window.localStorage.clear();
		document.documentElement.removeAttribute(THEME_ATTRIBUTE);

		if (originalMatchMedia) {
			Object.defineProperty(window, "matchMedia", originalMatchMedia);
		} else {
			Reflect.deleteProperty(window, "matchMedia");
		}
	});

	describe("first visit with nothing saved", () => {
		it("applies dark when the OS prefers dark", () => {
			mockPrefersDark(true);

			runInitScript();

			expect(getAppliedTheme()).toBe("dark");
		});

		it("applies light when the OS prefers light", () => {
			mockPrefersDark(false);

			runInitScript();

			expect(getAppliedTheme()).toBe("light");
		});

		it("does not write anything to localStorage", () => {
			mockPrefersDark(true);

			runInitScript();

			expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
		});
	});

	describe("with a saved choice", () => {
		it("applies saved light even when the OS prefers dark", () => {
			window.localStorage.setItem(THEME_STORAGE_KEY, "light");
			mockPrefersDark(true);

			runInitScript();

			expect(getAppliedTheme()).toBe("light");
		});

		it("applies saved dark even when the OS prefers light", () => {
			window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
			mockPrefersDark(false);

			runInitScript();

			expect(getAppliedTheme()).toBe("dark");
		});
	});

	describe("with an invalid saved value", () => {
		it("ignores it and follows the OS preference for dark", () => {
			window.localStorage.setItem(THEME_STORAGE_KEY, "sepia");
			mockPrefersDark(true);

			runInitScript();

			expect(getAppliedTheme()).toBe("dark");
		});

		it("ignores it and follows the OS preference for light", () => {
			window.localStorage.setItem(THEME_STORAGE_KEY, "sepia");
			mockPrefersDark(false);

			runInitScript();

			expect(getAppliedTheme()).toBe("light");
		});
	});

	describe("when localStorage throws on read", () => {
		beforeEach(() => {
			jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
				throw new Error("storage unavailable");
			});
		});

		it("does not throw", () => {
			mockPrefersDark(true);

			expect(() => runInitScript()).not.toThrow();
		});

		it("follows the OS preference for dark", () => {
			mockPrefersDark(true);

			runInitScript();

			expect(getAppliedTheme()).toBe("dark");
		});

		it("follows the OS preference for light", () => {
			mockPrefersDark(false);

			runInitScript();

			expect(getAppliedTheme()).toBe("light");
		});
	});

	describe("when matchMedia throws", () => {
		beforeEach(() => {
			Object.defineProperty(window, "matchMedia", {
				configurable: true,
				writable: true,
				value: jest.fn().mockImplementation(() => {
					throw new Error("matchMedia unavailable");
				}),
			});
		});

		it("applies light when nothing is saved", () => {
			runInitScript();

			expect(getAppliedTheme()).toBe("light");
		});

		it("applies the saved dark choice", () => {
			window.localStorage.setItem(THEME_STORAGE_KEY, "dark");

			runInitScript();

			expect(getAppliedTheme()).toBe("dark");
		});
	});
});
