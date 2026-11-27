import type { CONTACT_HONEYPOT_FIELD } from "@/constants/contact";

export type ContactField = "name" | "email" | "message";

export type ContactFormValues = Record<ContactField, string>;

export type ContactFormErrors = Partial<Record<ContactField, string>>;

export type ContactRequestBody = ContactFormValues & Record<typeof CONTACT_HONEYPOT_FIELD, string>;

export type ContactSubmitStatus = "idle" | "sending" | "success" | "failure";

export interface ContactSuccessResponse {
	success: true;
}

export interface ContactValidationErrorResponse {
	message: string;
	errors: ContactFormErrors;
}

export interface ContactServerErrorResponse {
	message: string;
}
