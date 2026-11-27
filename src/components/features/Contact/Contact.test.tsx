import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	CONTACT_API_PATH,
	CONTACT_FAILURE_MESSAGE,
	CONTACT_FIELD_ERRORS,
	CONTACT_HONEYPOT_FIELD,
	CONTACT_JSON_CONTENT_TYPE,
	CONTACT_SENDING_LABEL,
	CONTACT_SUBMIT_LABEL,
	CONTACT_SUCCESS_MESSAGE,
} from "@/constants/contact";
import Contact from "./Contact";

const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
const originalFetch = global.fetch;

function respondWith(ok: boolean): Response {
	return { ok, status: ok ? 200 : 500 } as Response;
}

function getNameField() {
	return screen.getByLabelText("Your Name");
}

function getEmailField() {
	return screen.getByLabelText("Your Email");
}

function getMessageField() {
	return screen.getByLabelText("Your Message");
}

function getTrapField() {
	return screen.getByLabelText("Leave this field empty");
}

function getSubmitButton() {
	return screen.getByRole("button", { name: new RegExp(`${CONTACT_SUBMIT_LABEL}|${CONTACT_SENDING_LABEL}`) });
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
	await user.type(getNameField(), "Ada Lovelace");
	await user.type(getEmailField(), "ada@example.com");
	await user.type(getMessageField(), "Hello there");
}

describe("Contact form", () => {
	beforeEach(() => {
		fetchMock.mockReset();
		fetchMock.mockResolvedValue(respondWith(true));
		global.fetch = fetchMock;
	});

	afterEach(() => {
		global.fetch = originalFetch;
	});

	describe("rendering", () => {
		it("renders the name, email and message fields", () => {
			render(<Contact />);

			expect(getNameField()).toBeInTheDocument();
			expect(getEmailField()).toBeInTheDocument();
			expect(getMessageField().tagName).toBe("TEXTAREA");
		});

		it("renders the submit button enabled with its default label", () => {
			render(<Contact />);

			expect(getSubmitButton()).toBeEnabled();
			expect(getSubmitButton()).toHaveTextContent(CONTACT_SUBMIT_LABEL);
		});

		it("shows no alert or errors initially", () => {
			render(<Contact />);

			expect(screen.queryByRole("status")).not.toBeInTheDocument();
			expect(screen.queryByRole("alert")).not.toBeInTheDocument();
		});

		it("renders a hidden honeypot field that is not reachable by keyboard", () => {
			render(<Contact />);

			const honeypot = getTrapField();

			expect(honeypot).toHaveAttribute("id", "contact-trap");
			expect(honeypot).toHaveAttribute("name", CONTACT_HONEYPOT_FIELD);
			expect(honeypot).toHaveAttribute("tabindex", "-1");
			expect(honeypot.closest("[aria-hidden='true']")).not.toBeNull();
		});

		it("tells browsers and password managers not to autofill the honeypot", () => {
			render(<Contact />);

			const honeypot = getTrapField();

			expect(honeypot).toHaveAttribute("autocomplete", "off");
			expect(honeypot).toHaveAttribute("data-lpignore", "true");
			expect(honeypot).toHaveAttribute("data-1p-ignore");
		});

		it("does not use a name that autofill would recognise", () => {
			render(<Contact />);

			expect(screen.queryByLabelText("Website")).not.toBeInTheDocument();
			expect(getTrapField()).not.toHaveAttribute("name", "website");
		});
	});

	describe("valid submission", () => {
		it("posts the values as JSON to the contact endpoint", async () => {
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.click(getSubmitButton());

			expect(fetchMock).toHaveBeenCalledTimes(1);

			const [url, init] = fetchMock.mock.calls[0];

			expect(url).toBe(CONTACT_API_PATH);
			expect(init?.method).toBe("POST");
			expect(init?.headers).toEqual({ "Content-Type": CONTACT_JSON_CONTENT_TYPE });
			expect(JSON.parse(String(init?.body))).toEqual({
				name: "Ada Lovelace",
				email: "ada@example.com",
				message: "Hello there",
				[CONTACT_HONEYPOT_FIELD]: "",
			});
		});

		it("sends trimmed values", async () => {
			const user = userEvent.setup();
			render(<Contact />);

			await user.type(getNameField(), "  Ada  ");
			await user.type(getEmailField(), " ada@example.com ");
			await user.type(getMessageField(), "  Hi  ");
			await user.click(getSubmitButton());

			expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
				name: "Ada",
				email: "ada@example.com",
				message: "Hi",
				[CONTACT_HONEYPOT_FIELD]: "",
			});
		});

		it("always sends the honeypot field, including its filled value", async () => {
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.type(getTrapField(), "spam.example");
			await user.click(getSubmitButton());

			expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toHaveProperty(CONTACT_HONEYPOT_FIELD, "spam.example");
		});

		it("shows the success alert with the status role", async () => {
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.click(getSubmitButton());

			expect(await screen.findByRole("status")).toHaveTextContent(CONTACT_SUCCESS_MESSAGE);
		});

		it("does not show the failure alert on success", async () => {
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.click(getSubmitButton());
			await screen.findByRole("status");

			expect(screen.queryByRole("alert")).not.toBeInTheDocument();
		});

		it("resets all fields after success", async () => {
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.type(getTrapField(), "x");
			await user.click(getSubmitButton());
			await screen.findByRole("status");

			expect(getNameField()).toHaveValue("");
			expect(getEmailField()).toHaveValue("");
			expect(getMessageField()).toHaveValue("");
			expect(getTrapField()).toHaveValue("");
		});

		it("re-enables the submit button after success", async () => {
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.click(getSubmitButton());
			await screen.findByRole("status");

			expect(getSubmitButton()).toBeEnabled();
			expect(getSubmitButton()).toHaveTextContent(CONTACT_SUBMIT_LABEL);
		});

		it("keeps the success alert until the visitor edits something", async () => {
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.click(getSubmitButton());
			await screen.findByRole("status");

			expect(screen.getByRole("status")).toHaveTextContent(CONTACT_SUCCESS_MESSAGE);
		});

		it.each([
			["name", getNameField],
			["email", getEmailField],
			["message", getMessageField],
			["honeypot", getTrapField],
		])("clears the success alert when the %s is edited", async (_label, getField) => {
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.click(getSubmitButton());
			await screen.findByRole("status");
			await user.type(getField(), "a");

			expect(screen.queryByRole("status")).not.toBeInTheDocument();
		});

		it("lets the visitor send a second message after editing", async () => {
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.click(getSubmitButton());
			await screen.findByRole("status");
			await fillValidForm(user);
			await user.click(getSubmitButton());

			expect(await screen.findByRole("status")).toBeInTheDocument();
			expect(fetchMock).toHaveBeenCalledTimes(2);
		});
	});

	describe("invalid submission", () => {
		it("sends no request when the form is empty", async () => {
			const user = userEvent.setup();
			render(<Contact />);

			await user.click(getSubmitButton());

			expect(fetchMock).not.toHaveBeenCalled();
		});

		it("shows an error under every empty field", async () => {
			const user = userEvent.setup();
			render(<Contact />);

			await user.click(getSubmitButton());

			expect(screen.getByText(CONTACT_FIELD_ERRORS.name)).toBeInTheDocument();
			expect(screen.getByText(CONTACT_FIELD_ERRORS.email)).toBeInTheDocument();
			expect(screen.getByText(CONTACT_FIELD_ERRORS.message)).toBeInTheDocument();
		});

		it("marks each invalid field with aria-invalid and links it to its message", async () => {
			const user = userEvent.setup();
			render(<Contact />);

			await user.click(getSubmitButton());

			expect(getNameField()).toHaveAttribute("aria-invalid", "true");
			expect(getNameField()).toHaveAccessibleDescription(CONTACT_FIELD_ERRORS.name);
			expect(getEmailField()).toHaveAttribute("aria-invalid", "true");
			expect(getEmailField()).toHaveAccessibleDescription(CONTACT_FIELD_ERRORS.email);
			expect(getMessageField()).toHaveAttribute("aria-invalid", "true");
			expect(getMessageField()).toHaveAccessibleDescription(CONTACT_FIELD_ERRORS.message);
		});

		it("shows an error only on the affected field", async () => {
			const user = userEvent.setup();
			render(<Contact />);

			await user.type(getNameField(), "Ada");
			await user.type(getEmailField(), "not-an-email");
			await user.type(getMessageField(), "Hi");
			await user.click(getSubmitButton());

			expect(screen.getByText(CONTACT_FIELD_ERRORS.email)).toBeInTheDocument();
			expect(screen.queryByText(CONTACT_FIELD_ERRORS.name)).not.toBeInTheDocument();
			expect(screen.queryByText(CONTACT_FIELD_ERRORS.message)).not.toBeInTheDocument();
			expect(getNameField()).not.toHaveAttribute("aria-invalid");
			expect(fetchMock).not.toHaveBeenCalled();
		});

		it("treats whitespace-only values as empty", async () => {
			const user = userEvent.setup();
			render(<Contact />);

			await user.type(getNameField(), "   ");
			await user.type(getEmailField(), "ada@example.com");
			await user.type(getMessageField(), "   ");
			await user.click(getSubmitButton());

			expect(screen.getByText(CONTACT_FIELD_ERRORS.name)).toBeInTheDocument();
			expect(screen.getByText(CONTACT_FIELD_ERRORS.message)).toBeInTheDocument();
			expect(fetchMock).not.toHaveBeenCalled();
		});

		it("keeps what the visitor typed", async () => {
			const user = userEvent.setup();
			render(<Contact />);

			await user.type(getEmailField(), "not-an-email");
			await user.click(getSubmitButton());

			expect(getEmailField()).toHaveValue("not-an-email");
		});

		it("clears a field error as soon as the value becomes valid", async () => {
			const user = userEvent.setup();
			render(<Contact />);

			await user.click(getSubmitButton());
			await user.type(getNameField(), "Ada");

			expect(screen.queryByText(CONTACT_FIELD_ERRORS.name)).not.toBeInTheDocument();
			expect(getNameField()).not.toHaveAttribute("aria-invalid");
		});

		it("keeps the other field errors when one is fixed", async () => {
			const user = userEvent.setup();
			render(<Contact />);

			await user.click(getSubmitButton());
			await user.type(getNameField(), "Ada");

			expect(screen.getByText(CONTACT_FIELD_ERRORS.email)).toBeInTheDocument();
			expect(screen.getByText(CONTACT_FIELD_ERRORS.message)).toBeInTheDocument();
		});

		it("keeps an email error while the email is still invalid", async () => {
			const user = userEvent.setup();
			render(<Contact />);

			await user.click(getSubmitButton());
			await user.type(getEmailField(), "ada@");

			expect(screen.getByText(CONTACT_FIELD_ERRORS.email)).toBeInTheDocument();
		});

		it("can be submitted once the errors are fixed", async () => {
			const user = userEvent.setup();
			render(<Contact />);

			await user.click(getSubmitButton());
			await fillValidForm(user);
			await user.click(getSubmitButton());

			expect(await screen.findByRole("status")).toBeInTheDocument();
			expect(fetchMock).toHaveBeenCalledTimes(1);
		});

		it("limits the input length with maxLength attributes", () => {
			render(<Contact />);

			expect(getNameField()).toHaveAttribute("maxlength", "100");
			expect(getEmailField()).toHaveAttribute("maxlength", "254");
			expect(getMessageField()).toHaveAttribute("maxlength", "5000");
		});
	});

	describe("failed request", () => {
		it("shows the failure alert with the alert role on a non-2xx response", async () => {
			fetchMock.mockResolvedValue(respondWith(false));
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.click(getSubmitButton());

			expect(await screen.findByRole("alert")).toHaveTextContent(CONTACT_FAILURE_MESSAGE);
		});

		it("shows the failure alert when the network request rejects", async () => {
			fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.click(getSubmitButton());

			expect(await screen.findByRole("alert")).toHaveTextContent(CONTACT_FAILURE_MESSAGE);
		});

		it("keeps the typed values after a non-2xx response", async () => {
			fetchMock.mockResolvedValue(respondWith(false));
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.click(getSubmitButton());
			await screen.findByRole("alert");

			expect(getNameField()).toHaveValue("Ada Lovelace");
			expect(getEmailField()).toHaveValue("ada@example.com");
			expect(getMessageField()).toHaveValue("Hello there");
		});

		it("keeps the typed values after a network error", async () => {
			fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.click(getSubmitButton());
			await screen.findByRole("alert");

			expect(getNameField()).toHaveValue("Ada Lovelace");
			expect(getEmailField()).toHaveValue("ada@example.com");
			expect(getMessageField()).toHaveValue("Hello there");
		});

		it("does not show the success alert on failure", async () => {
			fetchMock.mockResolvedValue(respondWith(false));
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.click(getSubmitButton());
			await screen.findByRole("alert");

			expect(screen.queryByRole("status")).not.toBeInTheDocument();
		});

		it("re-enables the submit button so the visitor can retry", async () => {
			fetchMock.mockResolvedValue(respondWith(false));
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.click(getSubmitButton());
			await screen.findByRole("alert");

			expect(getSubmitButton()).toBeEnabled();
		});

		it("delivers on retry after a failure", async () => {
			fetchMock.mockResolvedValueOnce(respondWith(false));
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.click(getSubmitButton());
			await screen.findByRole("alert");
			await user.click(getSubmitButton());

			expect(await screen.findByRole("status")).toHaveTextContent(CONTACT_SUCCESS_MESSAGE);
			expect(screen.queryByRole("alert")).not.toBeInTheDocument();
			expect(fetchMock).toHaveBeenCalledTimes(2);
		});
	});

	describe("while sending", () => {
		function holdRequest() {
			let release: (response: Response) => void = () => undefined;

			fetchMock.mockReturnValue(
				new Promise<Response>((resolve) => {
					release = resolve;
				}),
			);

			return (response: Response) => release(response);
		}

		it("disables the submit button and shows the sending label", async () => {
			holdRequest();
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.click(getSubmitButton());

			expect(getSubmitButton()).toBeDisabled();
			expect(getSubmitButton()).toHaveTextContent(CONTACT_SENDING_LABEL);
		});

		it("does not send a second request when the form is submitted again", async () => {
			holdRequest();
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.click(getSubmitButton());
			fireEvent.submit(getNameField().closest("form") as HTMLFormElement);
			await user.click(getSubmitButton());

			expect(fetchMock).toHaveBeenCalledTimes(1);
		});

		it("restores the button once the request completes", async () => {
			const release = holdRequest();
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.click(getSubmitButton());
			release(respondWith(true));

			await waitFor(() => expect(getSubmitButton()).toBeEnabled());
			expect(getSubmitButton()).toHaveTextContent(CONTACT_SUBMIT_LABEL);
		});

		it("accepts a new submission after the previous one completed", async () => {
			fetchMock.mockResolvedValue(respondWith(false));
			const user = userEvent.setup();
			render(<Contact />);

			await fillValidForm(user);
			await user.click(getSubmitButton());
			await screen.findByRole("alert");
			await user.click(getSubmitButton());
			await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
		});
	});
});
