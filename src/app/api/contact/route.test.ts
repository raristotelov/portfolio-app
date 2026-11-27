import { Resend } from "resend";
import {
	CONTACT_EMAIL_DOCTYPE,
	CONTACT_EMAIL_FALLBACK_SENDER_NAME,
	CONTACT_EMAIL_SENDER_SUFFIX,
	CONTACT_EMAIL_SUBJECT_PREFIX,
	CONTACT_FIELD_ERRORS,
	CONTACT_HONEYPOT_FIELD,
	CONTACT_INVALID_REQUEST_MESSAGE,
	CONTACT_JSON_CONTENT_TYPE,
	CONTACT_MAX_BODY_BYTES,
	CONTACT_MAX_LENGTHS,
	CONTACT_SERVER_ERROR_MESSAGE,
	CONTACT_TOO_LONG_ERRORS,
} from "@/constants/contact";
import { POST } from "./route";

const mockSend = jest.fn();

jest.mock("resend", () => ({
	Resend: jest.fn().mockImplementation(() => ({ emails: { send: mockSend } })),
}));

const ENV_NAMES = ["RESEND_API_KEY", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL"] as const;
const TEST_ENV = {
	RESEND_API_KEY: "test-api-key-value",
	CONTACT_FROM_EMAIL: "from-address@sender.test",
	CONTACT_TO_EMAIL: "inbox@recipient.test",
};

const validBody = { name: "Ada Lovelace", email: "ada@example.com", message: "Hello there", [CONTACT_HONEYPOT_FIELD]: "" };

const JSON_HEADERS = { "Content-Type": CONTACT_JSON_CONTENT_TYPE };

function postWith(init: RequestInit): Promise<Response> {
	return POST(new Request("http://localhost/api/contact", { method: "POST", ...init }));
}

function postJson(body: unknown): Promise<Response> {
	return postWith({ headers: JSON_HEADERS, body: JSON.stringify(body) });
}

function postRaw(raw: string): Promise<Response> {
	return postWith({ headers: JSON_HEADERS, body: raw });
}

function streamOf(chunks: readonly Uint8Array[], failure?: Error): ReadableStream<Uint8Array> {
	let index = 0;

	return new ReadableStream<Uint8Array>({
		pull(controller) {
			if (index < chunks.length) {
				controller.enqueue(chunks[index]);
				index += 1;
			} else if (failure) {
				controller.error(failure);
			} else {
				controller.close();
			}
		},
	});
}

function postStream(stream: ReadableStream<Uint8Array>, headers: Record<string, string> = JSON_HEADERS): Promise<Response> {
	return POST(
		new Request("http://localhost/api/contact", {
			method: "POST",
			headers,
			body: stream,
			duplex: "half",
		} as RequestInit),
	);
}

function validJsonOfBytes(totalBytes: number): string {
	const base = { ...validBody, padding: "" };
	const filler = totalBytes - JSON.stringify(base).length;

	return JSON.stringify({ ...base, padding: "a".repeat(filler) });
}

describe("POST /api/contact", () => {
	const originalEnv: Partial<Record<(typeof ENV_NAMES)[number], string>> = {};

	beforeEach(() => {
		for (const name of ENV_NAMES) {
			originalEnv[name] = process.env[name];
			process.env[name] = TEST_ENV[name];
		}

		mockSend.mockReset();
		mockSend.mockResolvedValue({ data: { id: "email-id" }, error: null });
		jest.mocked(Resend).mockClear();
		jest.spyOn(console, "error").mockImplementation(() => undefined);
	});

	afterEach(() => {
		for (const name of ENV_NAMES) {
			const original = originalEnv[name];

			if (original === undefined) {
				delete process.env[name];
			} else {
				process.env[name] = original;
			}
		}

		jest.restoreAllMocks();
	});

	describe("valid submission", () => {
		it("responds 200 with success", async () => {
			const response = await postJson(validBody);

			expect(response.status).toBe(200);
			expect(await response.json()).toEqual({ success: true });
		});

		it("creates the Resend client with the API key", async () => {
			await postJson(validBody);

			expect(Resend).toHaveBeenCalledWith(TEST_ENV.RESEND_API_KEY);
		});

		it("sends the email once with the configured from and to addresses", async () => {
			await postJson(validBody);

			expect(mockSend).toHaveBeenCalledTimes(1);
			expect(mockSend).toHaveBeenCalledWith(
				expect.objectContaining({ from: `"Ada Lovelace via Portfolio" <${TEST_ENV.CONTACT_FROM_EMAIL}>`, to: TEST_ENV.CONTACT_TO_EMAIL }),
			);
		});

		it("sanitises the sender display name", async () => {
			await postJson({ ...validBody, name: 'Ada "<evil>"\r\nBcc: x' });

			const { from } = mockSend.mock.calls[0][0] as { from: string };

			expect(from).toBe(`"Ada evil Bcc: x ${CONTACT_EMAIL_SENDER_SUFFIX}" <${TEST_ENV.CONTACT_FROM_EMAIL}>`);
		});

		it("falls back to a generic sender name when the name has nothing usable", async () => {
			await postJson({ ...validBody, name: '"<>"' });

			expect(mockSend).toHaveBeenCalledWith(
				expect.objectContaining({
					from: `"${CONTACT_EMAIL_FALLBACK_SENDER_NAME} ${CONTACT_EMAIL_SENDER_SUFFIX}" <${TEST_ENV.CONTACT_FROM_EMAIL}>`,
				}),
			);
		});

		it("keeps only the address when the configured sender already has a display name", async () => {
			process.env.CONTACT_FROM_EMAIL = '"Portfolio" <from-address@sender.test>';

			await postJson(validBody);

			expect(mockSend).toHaveBeenCalledWith(
				expect.objectContaining({ from: `"Ada Lovelace ${CONTACT_EMAIL_SENDER_SUFFIX}" <from-address@sender.test>` }),
			);
		});

		it("sends an HTML body with the visitor details", async () => {
			await postJson(validBody);

			const { html } = mockSend.mock.calls[0][0] as { html: string };

			expect(html.startsWith(CONTACT_EMAIL_DOCTYPE)).toBe(true);
			expect(html).toContain("Ada Lovelace");
			expect(html).toContain("ada@example.com");
			expect(html).toContain("Hello there");
		});

		it("escapes visitor content in the HTML body", async () => {
			await postJson({ ...validBody, message: "<script>alert(1)</script>" });

			const { html } = mockSend.mock.calls[0][0] as { html: string };

			expect(html).not.toContain("<script>");
			expect(html).toContain("&lt;script&gt;");
		});

		it("still sends the plain-text fallback alongside the HTML", async () => {
			await postJson(validBody);

			expect(mockSend).toHaveBeenCalledWith(
				expect.objectContaining({
					html: expect.any(String),
					text: "Name: Ada Lovelace\nEmail: ada@example.com\n\nMessage:\nHello there",
				}),
			);
		});

		it("sets the visitor email as replyTo", async () => {
			await postJson(validBody);

			expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ replyTo: "ada@example.com" }));
		});

		it("builds the subject from the visitor name", async () => {
			await postJson(validBody);

			expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ subject: `${CONTACT_EMAIL_SUBJECT_PREFIX} Ada Lovelace` }));
		});

		it("puts the name, email and message in the body", async () => {
			await postJson(validBody);

			expect(mockSend).toHaveBeenCalledWith(
				expect.objectContaining({ text: "Name: Ada Lovelace\nEmail: ada@example.com\n\nMessage:\nHello there" }),
			);
		});

		it("trims the values before sending", async () => {
			await postJson({ name: "  Ada  ", email: " ada@example.com ", message: "  Hi  ", [CONTACT_HONEYPOT_FIELD]: "" });

			expect(mockSend).toHaveBeenCalledWith(
				expect.objectContaining({
					replyTo: "ada@example.com",
					subject: `${CONTACT_EMAIL_SUBJECT_PREFIX} Ada`,
					text: "Name: Ada\nEmail: ada@example.com\n\nMessage:\nHi",
				}),
			);
		});

		it("keeps the subject on one line when the name contains line breaks", async () => {
			await postJson({ ...validBody, name: "Ada\r\nBcc: evil@example.com" });

			const { subject } = mockSend.mock.calls[0][0] as { subject: string };

			expect(subject).not.toMatch(/[\r\n]/);
		});

		it("strips bidirectional and zero-width characters from the subject and sender name", async () => {
			await postJson({ ...validBody, name: "Ada‮evil​x⁦y﻿" });

			const { subject, from } = mockSend.mock.calls[0][0] as { subject: string; from: string };

			expect(subject).toBe(`${CONTACT_EMAIL_SUBJECT_PREFIX} Adaevilxy`);
			expect(from).toBe(`"Adaevilxy ${CONTACT_EMAIL_SENDER_SUFFIX}" <${TEST_ENV.CONTACT_FROM_EMAIL}>`);
		});

		it("accepts a body without the honeypot field", async () => {
			const { name, email, message } = validBody;
			const response = await postJson({ name, email, message });

			expect(response.status).toBe(200);
			expect(mockSend).toHaveBeenCalledTimes(1);
		});

		it("accepts values exactly at the length limits", async () => {
			const domain = "@example.com";
			const response = await postJson({
				name: "a".repeat(CONTACT_MAX_LENGTHS.name),
				email: `${"a".repeat(CONTACT_MAX_LENGTHS.email - domain.length)}${domain}`,
				message: "a".repeat(CONTACT_MAX_LENGTHS.message),
				[CONTACT_HONEYPOT_FIELD]: "",
			});

			expect(response.status).toBe(200);
		});
	});

	describe("honeypot", () => {
		it("responds 200 with success when the honeypot is filled", async () => {
			const response = await postJson({ ...validBody, [CONTACT_HONEYPOT_FIELD]: "spam.example" });

			expect(response.status).toBe(200);
			expect(await response.json()).toEqual({ success: true });
		});

		it("does not send an email when the honeypot is filled", async () => {
			await postJson({ ...validBody, [CONTACT_HONEYPOT_FIELD]: "spam.example" });

			expect(mockSend).not.toHaveBeenCalled();
			expect(Resend).not.toHaveBeenCalled();
		});

		it("responds 200 for a filled honeypot even when the other fields are invalid", async () => {
			const response = await postJson({ name: "", email: "bad", message: "", [CONTACT_HONEYPOT_FIELD]: "spam.example" });

			expect(response.status).toBe(200);
			expect(mockSend).not.toHaveBeenCalled();
		});

		it("responds 200 for a filled honeypot even when the env vars are missing", async () => {
			delete process.env.RESEND_API_KEY;

			const response = await postJson({ ...validBody, [CONTACT_HONEYPOT_FIELD]: "spam.example" });

			expect(response.status).toBe(200);
		});
	});

	describe("content type", () => {
		const body = JSON.stringify(validBody);

		it("responds 415 when the content type header is missing", async () => {
			const response = await postWith({ body });

			expect(response.status).toBe(415);
			expect(await response.json()).toEqual({ message: CONTACT_INVALID_REQUEST_MESSAGE });
		});

		it.each(["text/plain", "application/x-www-form-urlencoded", "application/jsonp", "text/json"])(
			"responds 415 for the content type %s",
			async (contentType) => {
				const response = await postWith({ headers: { "Content-Type": contentType }, body });

				expect(response.status).toBe(415);
			},
		);

		it("does not send an email for an unsupported content type", async () => {
			await postWith({ headers: { "Content-Type": "text/plain" }, body });

			expect(mockSend).not.toHaveBeenCalled();
		});

		it("checks the content type before the body is parsed", async () => {
			const response = await postWith({ headers: { "Content-Type": "text/plain" }, body: "{not json" });

			expect(response.status).toBe(415);
		});

		it("accepts a charset parameter", async () => {
			const response = await postWith({ headers: { "Content-Type": "application/json; charset=utf-8" }, body });

			expect(response.status).toBe(200);
		});

		it("accepts the content type in any letter case", async () => {
			const response = await postWith({ headers: { "Content-Type": "Application/JSON" }, body });

			expect(response.status).toBe(200);
		});
	});

	describe("body size limit", () => {
		it("accepts a body of exactly the limit", async () => {
			const raw = validJsonOfBytes(CONTACT_MAX_BODY_BYTES);

			expect(new TextEncoder().encode(raw).byteLength).toBe(CONTACT_MAX_BODY_BYTES);

			const response = await postRaw(raw);

			expect(response.status).toBe(200);
		});

		it("responds 413 when the declared Content-Length is over the limit", async () => {
			const response = await postWith({
				headers: { ...JSON_HEADERS, "Content-Length": String(CONTACT_MAX_BODY_BYTES + 1) },
				body: JSON.stringify(validBody),
			});

			expect(response.status).toBe(413);
			expect(await response.json()).toEqual({ message: CONTACT_INVALID_REQUEST_MESSAGE });
		});

		it("does not send an email for an oversized body", async () => {
			await postRaw(validJsonOfBytes(CONTACT_MAX_BODY_BYTES + 1));

			expect(mockSend).not.toHaveBeenCalled();
		});

		it("responds 413 for an oversized body with no Content-Length header", async () => {
			const raw = validJsonOfBytes(CONTACT_MAX_BODY_BYTES + 1);
			const response = await postStream(streamOf([new TextEncoder().encode(raw)]));

			expect(response.status).toBe(413);
		});

		it("responds 413 when the header understates the streamed body", async () => {
			const raw = validJsonOfBytes(CONTACT_MAX_BODY_BYTES + 1);
			const response = await postStream(streamOf([new TextEncoder().encode(raw)]), { ...JSON_HEADERS, "Content-Length": "10" });

			expect(response.status).toBe(413);
		});

		it("responds 413 when the limit is crossed across several chunks", async () => {
			const chunk = new TextEncoder().encode("a".repeat(CONTACT_MAX_BODY_BYTES / 2 + 1));
			const response = await postStream(streamOf([chunk, chunk]));

			expect(response.status).toBe(413);
		});

		it("accepts a streamed body of exactly the limit", async () => {
			const response = await postStream(streamOf([new TextEncoder().encode(validJsonOfBytes(CONTACT_MAX_BODY_BYTES))]));

			expect(response.status).toBe(200);
		});

		it("responds 400 when the body stream errors while being read", async () => {
			const response = await postStream(streamOf([new TextEncoder().encode('{"name":')], new Error("connection reset")));

			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({ message: CONTACT_INVALID_REQUEST_MESSAGE });
		});
	});

	describe("invalid input", () => {
		it.each(["name", "email", "message"] as const)("responds 400 with a field error when %s is empty", async (field) => {
			const response = await postJson({ ...validBody, [field]: "" });

			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({
				message: CONTACT_INVALID_REQUEST_MESSAGE,
				errors: { [field]: CONTACT_FIELD_ERRORS[field] },
			});
		});

		it.each(["name", "email", "message"] as const)("responds 400 when %s is only whitespace", async (field) => {
			const response = await postJson({ ...validBody, [field]: "   \n " });

			expect(response.status).toBe(400);
			expect((await response.json()).errors).toEqual({ [field]: CONTACT_FIELD_ERRORS[field] });
		});

		it("responds 400 with every field error when all fields are empty", async () => {
			const response = await postJson({ name: "", email: "", message: "", [CONTACT_HONEYPOT_FIELD]: "" });

			expect(response.status).toBe(400);
			expect((await response.json()).errors).toEqual(CONTACT_FIELD_ERRORS);
		});

		it.each([
			"plainaddress",
			"missing@tld",
			"two words@example.com",
			"@example.com",
			"a,b@c.de",
			"x<y@z.com",
			'"quoted"@example.com',
			"a;b@example.com",
			"ada@example.123",
			".ada@example.com",
			"ada.@example.com",
			"a..da@example.com",
		])("responds 400 for the invalid email %j", async (email) => {
			const response = await postJson({ ...validBody, email });

			expect(response.status).toBe(400);
			expect((await response.json()).errors).toEqual({ email: CONTACT_FIELD_ERRORS.email });
		});

		it("responds 400 when the name is over the limit", async () => {
			const response = await postJson({ ...validBody, name: "a".repeat(CONTACT_MAX_LENGTHS.name + 1) });

			expect(response.status).toBe(400);
			expect((await response.json()).errors).toEqual({ name: CONTACT_TOO_LONG_ERRORS.name });
		});

		it("responds 400 when the email is over the limit", async () => {
			const domain = "@example.com";
			const response = await postJson({ ...validBody, email: `${"a".repeat(CONTACT_MAX_LENGTHS.email - domain.length + 1)}${domain}` });

			expect(response.status).toBe(400);
			expect((await response.json()).errors).toEqual({ email: CONTACT_TOO_LONG_ERRORS.email });
		});

		it("responds 400 when the message is over the limit", async () => {
			const response = await postJson({ ...validBody, message: "a".repeat(CONTACT_MAX_LENGTHS.message + 1) });

			expect(response.status).toBe(400);
			expect((await response.json()).errors).toEqual({ message: CONTACT_TOO_LONG_ERRORS.message });
		});

		it.each(["name", "email", "message"] as const)("responds 400 without field errors when %s is not a string", async (field) => {
			const response = await postJson({ ...validBody, [field]: 123 });

			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({ message: CONTACT_INVALID_REQUEST_MESSAGE, errors: {} });
		});

		it.each(["name", "email", "message"] as const)("responds 400 when %s is missing", async (field) => {
			const body: Record<string, unknown> = { ...validBody };
			delete body[field];

			const response = await postJson(body);

			expect(response.status).toBe(400);
		});

		it.each([null, "text", 42, []])("responds 400 for the non-object body %j", async (body) => {
			const response = await postJson(body);

			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({ message: CONTACT_INVALID_REQUEST_MESSAGE, errors: {} });
		});

		it("responds 400 for malformed JSON", async () => {
			const response = await postRaw("{not json");

			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({ message: CONTACT_INVALID_REQUEST_MESSAGE, errors: {} });
		});

		it("responds 400 for an empty body", async () => {
			const response = await postRaw("");

			expect(response.status).toBe(400);
		});

		it("does not send an email for any invalid input", async () => {
			await postJson({ ...validBody, email: "bad" });
			await postRaw("{not json");
			await postJson(null);

			expect(mockSend).not.toHaveBeenCalled();
		});
	});

	describe("server failures", () => {
		it.each(ENV_NAMES)("responds 500 with the generic message when %s is missing", async (name) => {
			delete process.env[name];

			const response = await postJson(validBody);

			expect(response.status).toBe(500);
			expect(await response.json()).toEqual({ message: CONTACT_SERVER_ERROR_MESSAGE });
		});

		it.each(ENV_NAMES)("responds 500 when %s is empty", async (name) => {
			process.env[name] = "";

			const response = await postJson(validBody);

			expect(response.status).toBe(500);
		});

		it("does not send an email when the env vars are missing", async () => {
			delete process.env.RESEND_API_KEY;

			await postJson(validBody);

			expect(mockSend).not.toHaveBeenCalled();
		});

		it("responds 500 with the generic message when Resend returns an error", async () => {
			mockSend.mockResolvedValue({ data: null, error: { name: "validation_error", message: "secret detail", statusCode: 422 } });

			const response = await postJson(validBody);

			expect(response.status).toBe(500);
			expect(await response.json()).toEqual({ message: CONTACT_SERVER_ERROR_MESSAGE });
		});

		it("responds 500 with the generic message when Resend throws", async () => {
			mockSend.mockRejectedValue(new Error("network down"));

			const response = await postJson(validBody);

			expect(response.status).toBe(500);
			expect(await response.json()).toEqual({ message: CONTACT_SERVER_ERROR_MESSAGE });
		});

		it("responds 500 when the Resend client cannot be created", async () => {
			jest.mocked(Resend).mockImplementationOnce(() => {
				throw new Error("bad key");
			});

			const response = await postJson(validBody);

			expect(response.status).toBe(500);
		});
	});

	describe("secrecy", () => {
		const secrets = Object.values(TEST_ENV);

		it("does not leak env values on success", async () => {
			const text = await (await postJson(validBody)).text();

			for (const secret of secrets) {
				expect(text).not.toContain(secret);
			}
		});

		it("does not leak env values or provider details when Resend returns an error", async () => {
			mockSend.mockResolvedValue({ data: null, error: { name: "validation_error", message: "secret detail", statusCode: 422 } });

			const text = await (await postJson(validBody)).text();

			for (const secret of [...secrets, "secret detail", "validation_error"]) {
				expect(text).not.toContain(secret);
			}
		});

		it("does not leak env values or the thrown message when Resend throws", async () => {
			mockSend.mockRejectedValue(new Error("boom with test-api-key-value"));

			const text = await (await postJson(validBody)).text();

			for (const secret of [...secrets, "boom"]) {
				expect(text).not.toContain(secret);
			}
		});

		it("does not leak env values when the config is missing", async () => {
			delete process.env.CONTACT_TO_EMAIL;

			const text = await (await postJson(validBody)).text();

			for (const secret of secrets) {
				expect(text).not.toContain(secret);
			}
		});

		it("does not leak env values in a validation error", async () => {
			const text = await (await postJson({ ...validBody, email: "bad" })).text();

			for (const secret of secrets) {
				expect(text).not.toContain(secret);
			}
		});
	});
});
