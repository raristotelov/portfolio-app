import { CONTACT_FIELD_ERRORS, CONTACT_HONEYPOT_FIELD, CONTACT_MAX_LENGTHS, CONTACT_TOO_LONG_ERRORS } from "@/constants/contact";
import { parseContactRequestBody, trimContactValues, validateContactField, validateContactForm } from "./contactValidation";

const validValues = { name: "Ada Lovelace", email: "ada@example.com", message: "Hello there" };

describe("trimContactValues", () => {
	it("removes surrounding whitespace from every field", () => {
		expect(trimContactValues({ name: "  Ada ", email: "\tada@example.com\n", message: "  Hi  " })).toEqual({
			name: "Ada",
			email: "ada@example.com",
			message: "Hi",
		});
	});

	it("keeps inner whitespace", () => {
		expect(trimContactValues({ name: "Ada  Lovelace", email: "a@b.co", message: "line one\nline two" })).toEqual({
			name: "Ada  Lovelace",
			email: "a@b.co",
			message: "line one\nline two",
		});
	});
});

describe("validateContactField", () => {
	it.each(["name", "email", "message"] as const)("rejects an empty %s", (field) => {
		expect(validateContactField(field, "")).toBe(CONTACT_FIELD_ERRORS[field]);
	});

	it.each(["name", "email", "message"] as const)("rejects a whitespace-only %s", (field) => {
		expect(validateContactField(field, "   \n\t ")).toBe(CONTACT_FIELD_ERRORS[field]);
	});

	it.each([
		"plainaddress",
		"missing@tld",
		"@example.com",
		"two words@example.com",
		"a@b@c.com",
		"ada@example.",
		"a,b@c.de",
		"x<y@z.com",
		'"quoted local"@example.com',
		'"quoted"@example.com',
		"a;b@example.com",
		"ada@example.123",
		"ada@example.c",
		".ada@example.com",
		"ada.@example.com",
		"a..da@example.com",
		"ada@.example.com",
		"ada@example..com",
		"ada@-example.com",
		"ada@example.com.",
	])("rejects the invalid email %j", (email) => {
		expect(validateContactField("email", email)).toBe(CONTACT_FIELD_ERRORS.email);
	});

	it.each([
		"ada@example.com",
		"a.b+tag@sub.example.co.uk",
		"  ada@example.com  ",
		"o'brien@example.ie",
		"user_name@ex-ample.com",
		"a@b.co",
		"x!#$%&*/=?^`{|}~-y@example.org",
	])("accepts the valid email %j", (email) => {
		expect(validateContactField("email", email)).toBeUndefined();
	});

	it.each(["name", "message"] as const)("accepts a non-empty %s", (field) => {
		expect(validateContactField(field, "Something")).toBeUndefined();
	});

	it.each(["name", "message"] as const)("accepts a %s exactly at the limit", (field) => {
		expect(validateContactField(field, "a".repeat(CONTACT_MAX_LENGTHS[field]))).toBeUndefined();
	});

	it.each(["name", "message"] as const)("rejects a %s one character over the limit", (field) => {
		expect(validateContactField(field, "a".repeat(CONTACT_MAX_LENGTHS[field] + 1))).toBe(CONTACT_TOO_LONG_ERRORS[field]);
	});

	it("accepts an email exactly at the limit", () => {
		const domain = "@example.com";
		const email = `${"a".repeat(CONTACT_MAX_LENGTHS.email - domain.length)}${domain}`;

		expect(validateContactField("email", email)).toBeUndefined();
	});

	it("rejects an email one character over the limit", () => {
		const domain = "@example.com";
		const email = `${"a".repeat(CONTACT_MAX_LENGTHS.email - domain.length + 1)}${domain}`;

		expect(validateContactField("email", email)).toBe(CONTACT_TOO_LONG_ERRORS.email);
	});

	it("measures length after trimming", () => {
		expect(validateContactField("name", `  ${"a".repeat(CONTACT_MAX_LENGTHS.name)}  `)).toBeUndefined();
	});
});

describe("validateContactForm", () => {
	it("returns no errors for valid values", () => {
		expect(validateContactForm(validValues)).toEqual({});
	});

	it("returns an error for each invalid field only", () => {
		expect(validateContactForm({ name: "", email: "nope", message: "Hi" })).toEqual({
			name: CONTACT_FIELD_ERRORS.name,
			email: CONTACT_FIELD_ERRORS.email,
		});
	});

	it("returns all three errors when everything is empty", () => {
		expect(validateContactForm({ name: "", email: "", message: "" })).toEqual(CONTACT_FIELD_ERRORS);
	});

	it("returns the over-length error for a long message", () => {
		expect(validateContactForm({ ...validValues, message: "a".repeat(CONTACT_MAX_LENGTHS.message + 1) })).toEqual({
			message: CONTACT_TOO_LONG_ERRORS.message,
		});
	});
});

describe("parseContactRequestBody", () => {
	it("returns the fields and honeypot of a valid body", () => {
		expect(parseContactRequestBody({ ...validValues, [CONTACT_HONEYPOT_FIELD]: "" })).toEqual({ ...validValues, [CONTACT_HONEYPOT_FIELD]: "" });
	});

	it("keeps a filled honeypot value", () => {
		expect(parseContactRequestBody({ ...validValues, [CONTACT_HONEYPOT_FIELD]: "spam.example" })?.[CONTACT_HONEYPOT_FIELD]).toBe("spam.example");
	});

	it("defaults a missing honeypot to an empty string", () => {
		expect(parseContactRequestBody(validValues)?.[CONTACT_HONEYPOT_FIELD]).toBe("");
	});

	it("defaults a non-string honeypot to an empty string", () => {
		expect(parseContactRequestBody({ ...validValues, [CONTACT_HONEYPOT_FIELD]: 5 })?.[CONTACT_HONEYPOT_FIELD]).toBe("");
	});

	it("ignores the former honeypot field name", () => {
		expect(parseContactRequestBody({ ...validValues, website: "spam.example" })?.[CONTACT_HONEYPOT_FIELD]).toBe("");
	});

	it("ignores unknown properties", () => {
		expect(parseContactRequestBody({ ...validValues, extra: "x" })).toEqual({ ...validValues, [CONTACT_HONEYPOT_FIELD]: "" });
	});

	it.each([null, undefined, "text", 42, true, []])("returns null for the non-object body %j", (body) => {
		expect(parseContactRequestBody(body)).toBeNull();
	});

	it.each(["name", "email", "message"] as const)("returns null when %s is missing", (field) => {
		const body: Record<string, unknown> = { ...validValues };
		delete body[field];

		expect(parseContactRequestBody(body)).toBeNull();
	});

	it.each(["name", "email", "message"] as const)("returns null when %s is not a string", (field) => {
		expect(parseContactRequestBody({ ...validValues, [field]: 123 })).toBeNull();
	});
});
