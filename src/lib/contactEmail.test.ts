import {
	CONTACT_EMAIL_DOCTYPE,
	CONTACT_EMAIL_FALLBACK_SENDER_NAME,
	CONTACT_EMAIL_FOOTER,
	CONTACT_EMAIL_HEADING,
	CONTACT_EMAIL_SENDER_SUFFIX,
	CONTACT_EMAIL_SUBJECT_PREFIX,
	CONTACT_GMAIL_COMPOSE_URL,
	CONTACT_REPLY_SUBJECT,
} from "@/constants/contact";
import {
	buildContactEmailContent,
	buildContactSender,
	buildGmailComposeUrl,
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

	it.each(["​", "‏", "‪", "‮", "⁦", "⁩", "﻿"])("strips the format character %j from the subject", (character) => {
		const { subject } = buildContactEmailContent({ name: `Ada${character}Lovelace`, email: "ada@example.com", message: "Hi" });

		expect(subject).toBe(`${CONTACT_EMAIL_SUBJECT_PREFIX} AdaLovelace`);
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

	it("strips bidirectional and zero-width characters from the display name", () => {
		expect(buildContactSender("‮Ada​ Lovelace⁦", "from@sender.test")).toBe(`"Ada Lovelace ${CONTACT_EMAIL_SENDER_SUFFIX}" <from@sender.test>`);
	});

	it("falls back to a generic name when only format characters remain", () => {
		expect(buildContactSender("​‮﻿", "from@sender.test")).toBe(
			`"${CONTACT_EMAIL_FALLBACK_SENDER_NAME} ${CONTACT_EMAIL_SENDER_SUFFIX}" <from@sender.test>`,
		);
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

	it("strips format characters from the first name", () => {
		expect(getFirstName("‮Ada​ Lovelace")).toBe("Ada");
	});

	it("falls back to a generic name when only format characters are given", () => {
		expect(getFirstName("​﻿")).toBe(CONTACT_EMAIL_FALLBACK_SENDER_NAME);
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

describe("buildGmailComposeUrl", () => {
	it("points at the Gmail compose page", () => {
		const url = new URL(buildGmailComposeUrl("ada@example.com", "Hello"));

		expect(`${url.origin}${url.pathname}`).toBe(CONTACT_GMAIL_COMPOSE_URL);
		expect(url.origin).toBe("https://mail.google.com");
		expect(url.pathname).toBe("/mail/");
	});

	it("sets the compose view, full-screen flag, recipient and subject", () => {
		const { searchParams } = new URL(buildGmailComposeUrl("ada@example.com", "Hello"));

		expect(searchParams.get("view")).toBe("cm");
		expect(searchParams.get("fs")).toBe("1");
		expect(searchParams.get("to")).toBe("ada@example.com");
		expect(searchParams.get("su")).toBe("Hello");
	});

	it("sets no other parameters", () => {
		const { searchParams } = new URL(buildGmailComposeUrl("ada@example.com", "Hello"));

		expect(Array.from(searchParams.keys()).sort()).toEqual(["fs", "su", "to", "view"]);
	});

	it("encodes @ in the recipient", () => {
		expect(buildGmailComposeUrl("ada@example.com", "Hello")).toContain("to=ada%40example.com");
	});

	it("encodes + in the recipient so it is not read as a space", () => {
		const url = buildGmailComposeUrl("a+b@example.com", "Hello");

		expect(url).toContain("to=a%2Bb%40example.com");
		expect(new URL(url).searchParams.get("to")).toBe("a+b@example.com");
	});

	it("encodes & in the subject so it cannot start a new parameter", () => {
		const url = buildGmailComposeUrl("ada@example.com", "Tom & Jerry");

		expect(url).toContain("su=Tom+%26+Jerry");
		expect(new URL(url).searchParams.get("su")).toBe("Tom & Jerry");
	});

	it("encodes spaces in the subject", () => {
		const url = buildGmailComposeUrl("ada@example.com", "two words");

		expect(url).not.toContain(" ");
		expect(new URL(url).searchParams.get("su")).toBe("two words");
	});

	it("keeps injected parameters inside the values", () => {
		const { searchParams } = new URL(buildGmailComposeUrl("ada@example.com&bcc=evil@x.test", "Hi#frag?x=1"));

		expect(searchParams.get("to")).toBe("ada@example.com&bcc=evil@x.test");
		expect(searchParams.get("su")).toBe("Hi#frag?x=1");
		expect(searchParams.has("bcc")).toBe(false);
	});
});

describe("renderContactEmailHtml", () => {
	const values = { name: "Ada Lovelace", email: "ada@example.com", message: "Hello\nthere" };

	function getHrefs(html: string): string[] {
		return Array.from(html.matchAll(/href="([^"]*)"/g), (match) => match[1].replace(/&amp;/g, "&"));
	}

	function getGmailUrl(html: string): URL {
		const href = getHrefs(html).find((candidate) => candidate.startsWith(CONTACT_GMAIL_COMPOSE_URL));

		if (!href) {
			throw new Error("No Gmail compose link found in the email HTML");
		}

		return new URL(href);
	}

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

	it("labels the reply button with the visitor's first name", async () => {
		expect(await renderContactEmailHtml(values)).toContain("Reply to Ada");
	});

	it("links the reply button to a Gmail compose window addressed to the visitor", async () => {
		const url = getGmailUrl(await renderContactEmailHtml(values));

		expect(url.searchParams.get("view")).toBe("cm");
		expect(url.searchParams.get("fs")).toBe("1");
		expect(url.searchParams.get("to")).toBe("ada@example.com");
	});

	it("prefills the reply subject with the fixed reply subject", async () => {
		const url = getGmailUrl(await renderContactEmailHtml(values));

		expect(url.searchParams.get("su")).toBe(CONTACT_REPLY_SUBJECT);
		expect(url.searchParams.get("su")).toBe("Let's talk about your project");
	});

	it.each(["Ada Lovelace", "Tom & Jerry", "Ada\r\nLovelace", "Ada‮​Lovelace", "​﻿"])(
		"uses the same reply subject whatever the visitor name is (%j)",
		async (name) => {
			const url = getGmailUrl(await renderContactEmailHtml({ ...values, name }));

			expect(url.searchParams.get("su")).toBe(CONTACT_REPLY_SUBJECT);
		},
	);

	it("encodes the apostrophe and spaces of the reply subject inside the link", async () => {
		const html = await renderContactEmailHtml(values);
		const href = getHrefs(html).find((candidate) => candidate.startsWith(CONTACT_GMAIL_COMPOSE_URL)) ?? "";

		expect(href).not.toContain(" ");
		expect(new URL(href).searchParams.get("su")).toBe(CONTACT_REPLY_SUBJECT);
	});

	it("encodes a plus sign in the visitor email inside the reply link", async () => {
		const html = await renderContactEmailHtml({ ...values, email: "a+b@example.com" });

		expect(getGmailUrl(html).searchParams.get("to")).toBe("a+b@example.com");
	});

	it("keeps an ampersand in the visitor email from adding parameters to the reply link", async () => {
		const url = getGmailUrl(await renderContactEmailHtml({ ...values, email: "a&bcc=evil@x.test" }));

		expect(url.searchParams.get("to")).toBe("a&bcc=evil@x.test");
		expect(url.searchParams.has("bcc")).toBe(false);
	});

	it("keeps an ampersand in the name from affecting the reply link", async () => {
		const url = getGmailUrl(await renderContactEmailHtml({ ...values, name: "Tom & Jerry" }));

		expect(url.searchParams.get("su")).toBe(CONTACT_REPLY_SUBJECT);
		expect(url.searchParams.get("to")).toBe("ada@example.com");
	});

	it("keeps the mailto link on the email value", async () => {
		const hrefs = getHrefs(await renderContactEmailHtml(values));

		expect(hrefs).toContain("mailto:ada@example.com");
	});

	it("uses the Gmail link only on the button and the mailto link only on the email value", async () => {
		const hrefs = getHrefs(await renderContactEmailHtml(values));

		expect(hrefs).toHaveLength(2);
		expect(hrefs.filter((href) => href.startsWith("mailto:"))).toHaveLength(1);
		expect(hrefs.filter((href) => href.startsWith(CONTACT_GMAIL_COMPOSE_URL))).toHaveLength(1);
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
