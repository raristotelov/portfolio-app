import { render, screen } from "@testing-library/react";
import FormAlert from "./FormAlert";

describe("FormAlert", () => {
	it("renders a success alert with the status role", () => {
		render(<FormAlert type="success" message="Sent!" />);

		expect(screen.getByRole("status")).toHaveTextContent("Sent!");
	});

	it("renders an error alert with the alert role", () => {
		render(<FormAlert type="error" message="Failed" />);

		expect(screen.getByRole("alert")).toHaveTextContent("Failed");
	});

	it("does not use the alert role for success", () => {
		render(<FormAlert type="success" message="Sent!" />);

		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});

	it("does not use the status role for errors", () => {
		render(<FormAlert type="error" message="Failed" />);

		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});
});
