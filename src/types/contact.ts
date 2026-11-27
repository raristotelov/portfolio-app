export type ContactField = "name" | "email" | "message";

export type ContactFormValues = Record<ContactField, string>;

export type ContactFormErrors = Partial<Record<ContactField, string>>;

export interface ContactRequestBody extends ContactFormValues {
	website: string;
}

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
