import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormField from "./FormField";

const baseProps = { id: "field", name: "field", label: "Label", placeholder: "Placeholder", value: "", onChange: jest.fn() };

describe("FormField", () => {
	beforeEach(() => {
		baseProps.onChange.mockClear();
	});

	it("renders an input associated with its label", () => {
		render(<FormField {...baseProps} />);

		expect(screen.getByLabelText("Label").tagName).toBe("INPUT");
	});

	it("renders a textarea when multiline", () => {
		render(<FormField {...baseProps} multiline />);

		expect(screen.getByLabelText("Label").tagName).toBe("TEXTAREA");
	});

	it("applies the type, maxLength and name", () => {
		render(<FormField {...baseProps} type="email" maxLength={20} />);

		const input = screen.getByLabelText("Label");

		expect(input).toHaveAttribute("type", "email");
		expect(input).toHaveAttribute("maxlength", "20");
		expect(input).toHaveAttribute("name", "field");
	});

	it("calls onChange with the typed value", async () => {
		const user = userEvent.setup();
		render(<FormField {...baseProps} />);

		await user.type(screen.getByLabelText("Label"), "a");

		expect(baseProps.onChange).toHaveBeenCalledWith("a");
	});

	it("shows no error markup without an error", () => {
		render(<FormField {...baseProps} />);

		const input = screen.getByLabelText("Label");

		expect(input).not.toHaveAttribute("aria-invalid");
		expect(input).not.toHaveAttribute("aria-describedby");
	});

	it("shows the error message", () => {
		render(<FormField {...baseProps} error="Required" />);

		expect(screen.getByText("Required")).toBeInTheDocument();
	});

	it("marks the input invalid and links it to the error message", () => {
		render(<FormField {...baseProps} error="Required" />);

		const input = screen.getByLabelText("Label");

		expect(input).toHaveAttribute("aria-invalid", "true");
		expect(input).toHaveAccessibleDescription("Required");
	});

	it("links a textarea to its error message", () => {
		render(<FormField {...baseProps} multiline error="Required" />);

		const textarea = screen.getByLabelText("Label");

		expect(textarea).toHaveAttribute("aria-invalid", "true");
		expect(textarea).toHaveAccessibleDescription("Required");
	});
});
