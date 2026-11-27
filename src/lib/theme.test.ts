import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "@/constants/theme";
import { applyTheme, readDocumentTheme } from "./theme";

describe("readDocumentTheme", () => {
	afterEach(() => {
		document.documentElement.removeAttribute(THEME_ATTRIBUTE);
	});

	it("returns light when the attribute is missing", () => {
		expect(readDocumentTheme()).toBe("light");
	});

	it("returns dark when the attribute is dark", () => {
		document.documentElement.setAttribute(THEME_ATTRIBUTE, "dark");

		expect(readDocumentTheme()).toBe("dark");
	});

	it("returns light when the attribute is light", () => {
		document.documentElement.setAttribute(THEME_ATTRIBUTE, "light");

		expect(readDocumentTheme()).toBe("light");
	});

	it("falls back to light when the attribute holds an unknown value", () => {
		document.documentElement.setAttribute(THEME_ATTRIBUTE, "sepia");

		expect(readDocumentTheme()).toBe("light");
	});
});

describe("applyTheme", () => {
	beforeEach(() => {
		window.localStorage.clear();
	});

	afterEach(() => {
		jest.restoreAllMocks();
		document.documentElement.removeAttribute(THEME_ATTRIBUTE);
		window.localStorage.clear();
	});

	it("sets the data-theme attribute on the document element", () => {
		applyTheme("dark");

		expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, "dark");
	});

	it("saves the choice in localStorage", () => {
		applyTheme("dark");

		expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
	});

	it("overwrites a previously saved choice", () => {
		applyTheme("dark");
		applyTheme("light");

		expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
	});

	describe("when localStorage throws on write", () => {
		beforeEach(() => {
			jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
				throw new Error("storage unavailable");
			});
		});

		it("still applies the theme", () => {
			applyTheme("dark");

			expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, "dark");
		});

		it("does not throw", () => {
			expect(() => applyTheme("dark")).not.toThrow();
		});

		it("logs nothing", () => {
			const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
			const error = jest.spyOn(console, "error").mockImplementation(() => undefined);
			const log = jest.spyOn(console, "log").mockImplementation(() => undefined);

			applyTheme("dark");

			expect(warn).not.toHaveBeenCalled();
			expect(error).not.toHaveBeenCalled();
			expect(log).not.toHaveBeenCalled();
		});
	});
});
