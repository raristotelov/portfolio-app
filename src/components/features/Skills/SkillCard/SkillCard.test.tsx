import { render, screen } from "@testing-library/react";
import NextjsIcon from "@/components/ui/NextjsIcon";
import VercelIcon from "@/components/ui/VercelIcon";
import SkillCard from "./SkillCard";

describe("SkillCard", () => {
	describe("inline icons", () => {
		it("exposes the Vercel icon as an image named after the skill", () => {
			render(<SkillCard name="Vercel" icon={{ kind: "inline", Component: VercelIcon }} />);

			expect(screen.getByRole("img", { name: "Vercel" })).toBeInTheDocument();
		});

		it("exposes the Next.js icon as an image named after the skill", () => {
			render(<SkillCard name="Next.js" icon={{ kind: "inline", Component: NextjsIcon }} />);

			expect(screen.getByRole("img", { name: "Next.js" })).toBeInTheDocument();
		});
	});

	describe("image icons", () => {
		it("renders an image with the skill name as alt text", () => {
			render(<SkillCard name="React" icon={{ kind: "image", src: "/skills/react.svg" }} />);

			expect(screen.getByRole("img", { name: "React" })).toBeInTheDocument();
		});
	});

	it("shows the skill name as visible text", () => {
		render(<SkillCard name="Docker" icon={{ kind: "image", src: "/skills/docker.svg" }} />);

		expect(screen.getByText("Docker")).toBeVisible();
	});
});
