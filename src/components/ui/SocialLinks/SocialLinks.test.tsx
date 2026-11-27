import { render, screen } from "@testing-library/react";
import { socials } from "@/data/socials";
import SocialLinks from "./SocialLinks";

function getLinkNames() {
	return screen.getAllByRole("link").map((link) => link.getAttribute("aria-label"));
}

describe("SocialLinks", () => {
	it("renders LinkedIn then GitHub and nothing else", () => {
		render(<SocialLinks />);

		expect(getLinkNames()).toEqual(["LinkedIn", "GitHub"]);
	});

	it("follows the order of the socials data", () => {
		render(<SocialLinks />);

		expect(getLinkNames()).toEqual(socials.map((s) => s.name));
	});

	it("animates in by default", () => {
		const { container } = render(<SocialLinks />);

		expect(container.firstChild).toHaveClass("animated");
	});

	it("does not animate when animated is false", () => {
		const { container } = render(<SocialLinks animated={false} />);

		expect(container.firstChild).not.toHaveClass("animated");
	});

	it("points each link at its profile and opens it safely in a new tab", () => {
		render(<SocialLinks />);

		socials.forEach((s) => {
			const link = screen.getByRole("link", { name: s.name });

			expect(link).toHaveAttribute("href", s.href);
			expect(link).toHaveAttribute("target", "_blank");
			expect(link).toHaveAttribute("rel", "noopener noreferrer");
		});
	});
});
