import {
	CONTACT_EMAIL_DOCTYPE,
	CONTACT_EMAIL_FALLBACK_SENDER_NAME,
	CONTACT_EMAIL_FOOTER,
	CONTACT_EMAIL_HEADING,
	CONTACT_EMAIL_SENDER_SUFFIX,
	CONTACT_EMAIL_SUBJECT_PREFIX,
} from "@/constants/contact";
import {
	buildContactEmailContent,
	buildContactSender,
	buildMailtoHref,
	getFirstName,
	readContactEmailConfig,
	renderContactEmailHtml,
} from "./contactEmail";

describe("readContactEmailConfig", () => {
	const fullEnv = { RESEND_API_KEY: "key", CONTACT_FROM_EMAIL: "from@example.com", CONTACT_TO_EMAIL: "to@example.com" };

	it("returns the config when every variable is set", () => {
		expect(readContactEmailConfig(fullEnv)).toEqual({ apiKey: "key", from: "from@example.com", to: "to@example.com" });
	});

	it.each(["RESEND_API_KEY", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL"] as const)("returns null when %s is missing", (name) => {
		const env: Record<string, string | undefined> = { ...fullEnv };
		delete env[name];

		expect(readContactEmailConfig(env)).toBeNull();
	});

	it.each(["RESEND_API_KEY", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL"] as const)("returns null when %s is empty", (name) => {
		const env: Record<string, string | undefined> = { ...fullEnv, [name]: "" };

		expect(readContactEmailConfig(env)).toBeNull();
	});

	it("returns null for an empty environment", () => {
		expect(readContactEmailConfig({})).toBeNull();
	});
});

describe("buildContactEmailContent", () => {
	it("builds the subject from the prefix and the name", () => {
		expect(buildContactEmailContent({ name: "Ada", email: "ada@example.com", message: "Hi" }).subject).toBe(
			`${CONTACT_EMAIL_SUBJECT_PREFIX} Ada`,
		);
	});

	it("collapses line breaks in the name so the subject stays on one line", () => {
		const { subject } = buildContactEmailContent({ name: "Ada\r\nBcc: evil@example.com", email: "ada@example.com", message: "Hi" });

		expect(subject).toBe(`${CONTACT_EMAIL_SUBJECT_PREFIX} Ada Bcc: evil@example.com`);
	});

	it("replaces control characters in the name so the subject stays clean", () => {
		const { subject } = buildContactEmailContent({ name: "Ada\u0000\u007fLovelace", email: "ada@example.com", message: "Hi" });

		expect(subject).toBe(`${CONTACT_EMAIL_SUBJECT_PREFIX} Ada Lovelace`);
	});

	it("puts name, email and message in the body", () => {
		const { text } = buildContactEmailContent({ name: "Ada", email: "ada@example.com", message: "Hello\nthere" });

		expect(text).toBe("Name: Ada\nEmail: ada@example.com\n\nMessage:\nHello\nthere");
	});
});

describe("buildContactSender", () => {
	it("combines the visitor name and suffix as the display name with the configured address", () => {
		expect(buildContactSender("Ada Lovelace", "from@sender.test")).toBe(`"Ada Lovelace ${CONTACT_EMAIL_SENDER_SUFFIX}" <from@sender.test>`);
	});

	it("uses only the address when the configured sender already has a display name", () => {
		expect(buildContactSender("Ada", '"Portfolio" <from@sender.test>')).toBe(`"Ada ${CONTACT_EMAIL_SENDER_SUFFIX}" <from@sender.test>`);
	});

	it("removes quotes, angle brackets and backslashes from the display name", () => {
		expect(buildContactSender('Ada "The" <evil@x.test>\\', "from@sender.test")).toBe(
			`"Ada The evil@x.test ${CONTACT_EMAIL_SENDER_SUFFIX}" <from@sender.test>`,
		);
	});

	it("keeps the display name on one line when the name contains line breaks", () => {
		const sender = buildContactSender("Ada\r\nBcc: evil@x.test", "from@sender.test");

		expect(sender).not.toMatch(/[\r\n]/);
		expect(sender).toBe(`"Ada Bcc: evil@x.test ${CONTACT_EMAIL_SENDER_SUFFIX}" <from@sender.test>`);
	});

	it("falls back to a generic name when nothing usable remains", () => {
		expect(buildContactSender('"<>"', "from@sender.test")).toBe(
			`"${CONTACT_EMAIL_FALLBACK_SENDER_NAME} ${CONTACT_EMAIL_SENDER_SUFFIX}" <from@sender.test>`,
		);
	});
});

describe("getFirstName", () => {
	it("returns the first word of the name", () => {
		expect(getFirstName("Ada Lovelace")).toBe("Ada");
	});

	it("ignores leading whitespace and line breaks", () => {
		expect(getFirstName("  \nAda\nBcc")).toBe("Ada");
	});

	it("falls back to a generic name for a blank value", () => {
		expect(getFirstName("   ")).toBe(CONTACT_EMAIL_FALLBACK_SENDER_NAME);
	});
});

describe("buildMailtoHref", () => {
	it("builds a mailto link with the readable address", () => {
		expect(buildMailtoHref("ada@example.com")).toBe("mailto:ada@example.com");
	});

	it("percent-encodes characters that could break out of the link", () => {
		expect(buildMailtoHref('a"b+c@example.com?cc=x')).toBe("mailto:a%22b%2Bc@example.com%3Fcc%3Dx");
	});
});

describe("renderContactEmailHtml", () => {
	const values = { name: "Ada Lovelace", email: "ada@example.com", message: "Hello\nthere" };

	it("starts with the doctype", async () => {
		expect((await renderContactEmailHtml(values)).startsWith(CONTACT_EMAIL_DOCTYPE)).toBe(true);
	});

	it("contains the heading and footer", async () => {
		const html = await renderContactEmailHtml(values);

		expect(html).toContain(CONTACT_EMAIL_HEADING);
		expect(html).toContain(CONTACT_EMAIL_FOOTER);
	});

	it("contains the name, email and message", async () => {
		const html = await renderContactEmailHtml(values);

		expect(html).toContain("Ada Lovelace");
		expect(html).toContain("ada@example.com");
		expect(html).toContain("Hello");
		expect(html).toContain("there");
	});

	it("turns line breaks in the message into br tags", async () => {
		expect(await renderContactEmailHtml(values)).toContain("Hello<br/>there");
	});

	it("links the reply button to the visitor with their first name", async () => {
		const html = await renderContactEmailHtml(values);

		expect(html).toContain('href="mailto:ada@example.com"');
		expect(html).toContain("Reply to Ada");
	});

	it("escapes HTML in the message", async () => {
		const html = await renderContactEmailHtml({ ...values, message: "<script>alert(1)</script>" });

		expect(html).not.toContain("<script>");
		expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
	});

	it("escapes HTML in the name", async () => {
		const html = await renderContactEmailHtml({ ...values, name: '<img src=x onerror="alert(1)">' });

		expect(html).not.toContain("<img");
		expect(html).toContain("&lt;img");
	});

	it("keeps a hostile email value inside the link attribute", async () => {
		const html = await renderContactEmailHtml({ ...values, email: 'a"><script>x</script>@example.com' });

		expect(html).not.toContain("<script>");
	});
});
