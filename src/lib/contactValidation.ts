import {
	CONTACT_EMAIL_PATTERN,
	CONTACT_FIELD_ERRORS,
	CONTACT_FIELDS,
	CONTACT_HONEYPOT_FIELD,
	CONTACT_MAX_LENGTHS,
	CONTACT_TOO_LONG_ERRORS,
} from "@/constants/contact";
import type { ContactField, ContactFormErrors, ContactFormValues, ContactRequestBody } from "@/types/contact";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function trimContactValues(values: ContactFormValues): ContactFormValues {
	return { name: values.name.trim(), email: values.email.trim(), message: values.message.trim() };
}

function isFieldValid(field: ContactField, value: string): boolean {
	if (value === "") {
		return false;
	}

	return field === "email" ? CONTACT_EMAIL_PATTERN.test(value) : true;
}

export function validateContactField(field: ContactField, value: string): string | undefined {
	const trimmedValue = value.trim();

	if (!isFieldValid(field, trimmedValue)) {
		return CONTACT_FIELD_ERRORS[field];
	}

	return trimmedValue.length > CONTACT_MAX_LENGTHS[field] ? CONTACT_TOO_LONG_ERRORS[field] : undefined;
}

export function validateContactForm(values: ContactFormValues): ContactFormErrors {
	const errors: ContactFormErrors = {};

	for (const field of CONTACT_FIELDS) {
		const error = validateContactField(field, values[field]);

		if (error) {
			errors[field] = error;
		}
	}

	return errors;
}

export function parseContactRequestBody(body: unknown): ContactRequestBody | null {
	if (!isRecord(body)) {
		return null;
	}

	const { name, email, message } = body;
	const honeypot = body[CONTACT_HONEYPOT_FIELD];

	if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
		return null;
	}

	return { name, email, message, website: typeof honeypot === "string" ? honeypot : "" };
}
