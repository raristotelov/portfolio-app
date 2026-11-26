import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { navLinks } from "@/lib/constants";
import Navbar from "./Navbar";

function getToggle() {
	return screen.getByRole("button", { name: "Toggle menu" });
}

function getMobileMenu(container: HTMLElement) {
	const menu = container.querySelector<HTMLElement>("#mobile-menu");

	if (!menu) {
		throw new Error("Mobile menu not rendered");
	}

	return menu;
}

describe("Navbar mobile menu", () => {
	it("starts closed", () => {
		render(<Navbar />);

		expect(getToggle()).toHaveAttribute("aria-expanded", "false");
	});

	it("points the toggle at the mobile menu", () => {
		const { container } = render(<Navbar />);

		expect(getToggle()).toHaveAttribute("aria-controls", getMobileMenu(container).id);
	});

	it("opens and closes when the toggle is clicked", async () => {
		const user = userEvent.setup();
		render(<Navbar />);

		await user.click(getToggle());
		expect(getToggle()).toHaveAttribute("aria-expanded", "true");

		await user.click(getToggle());
		expect(getToggle()).toHaveAttribute("aria-expanded", "false");
	});

	it("closes when a mobile link is clicked", async () => {
		const user = userEvent.setup();
		const { container } = render(<Navbar />);

		await user.click(getToggle());
		await user.click(within(getMobileMenu(container)).getByRole("link", { name: navLinks[0].label }));

		expect(getToggle()).toHaveAttribute("aria-expanded", "false");
	});
});
