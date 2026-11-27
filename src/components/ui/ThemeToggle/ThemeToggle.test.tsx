import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "@/constants/theme";
import ThemeToggle from "./ThemeToggle";

function getToggle() {
	return screen.getByRole("button", { name: "Dark mode" });
}

describe("ThemeToggle", () => {
	beforeEach(() => {
		window.localStorage.clear();
		document.documentElement.removeAttribute(THEME_ATTRIBUTE);
	});

	afterEach(() => {
		jest.restoreAllMocks();
		window.localStorage.clear();
		document.documentElement.removeAttribute(THEME_ATTRIBUTE);
	});

	it("is not pressed when the light theme is active", () => {
		document.documentElement.setAttribute(THEME_ATTRIBUTE, "light");

		render(<ThemeToggle />);

		expect(getToggle()).toHaveAttribute("aria-pressed", "false");
	});

	it("is pressed when the dark theme is active", () => {
		document.documentElement.setAttribute(THEME_ATTRIBUTE, "dark");

		render(<ThemeToggle />);

		expect(getToggle()).toHaveAttribute("aria-pressed", "true");
	});

	it("switches from light to dark when clicked", async () => {
		const user = userEvent.setup();
		document.documentElement.setAttribute(THEME_ATTRIBUTE, "light");
		render(<ThemeToggle />);

		await user.click(getToggle());

		expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, "dark");
	});

	it("switches from dark to light when clicked", async () => {
		const user = userEvent.setup();
		document.documentElement.setAttribute(THEME_ATTRIBUTE, "dark");
		render(<ThemeToggle />);

		await user.click(getToggle());

		expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, "light");
	});

	it("updates aria-pressed after toggling", async () => {
		const user = userEvent.setup();
		document.documentElement.setAttribute(THEME_ATTRIBUTE, "light");
		render(<ThemeToggle />);

		await user.click(getToggle());

		await waitFor(() => expect(getToggle()).toHaveAttribute("aria-pressed", "true"));
	});

	it("goes back to not pressed after toggling twice", async () => {
		const user = userEvent.setup();
		document.documentElement.setAttribute(THEME_ATTRIBUTE, "light");
		render(<ThemeToggle />);

		await user.click(getToggle());
		await waitFor(() => expect(getToggle()).toHaveAttribute("aria-pressed", "true"));
		await user.click(getToggle());

		await waitFor(() => expect(getToggle()).toHaveAttribute("aria-pressed", "false"));
	});

	it("saves the chosen theme in localStorage", async () => {
		const user = userEvent.setup();
		document.documentElement.setAttribute(THEME_ATTRIBUTE, "light");
		render(<ThemeToggle />);

		await user.click(getToggle());

		expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
	});

	it("saves the latest choice after several toggles", async () => {
		const user = userEvent.setup();
		document.documentElement.setAttribute(THEME_ATTRIBUTE, "light");
		render(<ThemeToggle />);

		await user.click(getToggle());
		await user.click(getToggle());

		expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
	});

	it("reflects a theme change made outside the component", async () => {
		document.documentElement.setAttribute(THEME_ATTRIBUTE, "light");
		render(<ThemeToggle />);

		document.documentElement.setAttribute(THEME_ATTRIBUTE, "dark");

		await waitFor(() => expect(getToggle()).toHaveAttribute("aria-pressed", "true"));
	});

	describe("when localStorage is unavailable", () => {
		beforeEach(() => {
			jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
				throw new Error("storage unavailable");
			});
		});

		it("still switches the theme", async () => {
			const user = userEvent.setup();
			document.documentElement.setAttribute(THEME_ATTRIBUTE, "light");
			render(<ThemeToggle />);

			await user.click(getToggle());

			expect(document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, "dark");
		});

		it("still updates aria-pressed", async () => {
			const user = userEvent.setup();
			document.documentElement.setAttribute(THEME_ATTRIBUTE, "light");
			render(<ThemeToggle />);

			await user.click(getToggle());

			await waitFor(() => expect(getToggle()).toHaveAttribute("aria-pressed", "true"));
		});
	});
});
