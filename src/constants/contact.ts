import type { ContactField } from "@/types/contact";

export const CONTACT_API_PATH = "/api/contact";

export const CONTACT_FIELDS: readonly ContactField[] = ["name", "email", "message"];

export const CONTACT_HONEYPOT_FIELD = "nx_trap";

export const CONTACT_JSON_CONTENT_TYPE = "application/json";

export const CONTACT_MAX_BODY_BYTES = 16 * 1024;

export const CONTACT_EMAIL_PATTERN =
	/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;

export const CONTACT_FIELD_ERRORS: Record<ContactField, string> = {
	name: "Please enter your name.",
	email: "Please enter a valid email address.",
	message: "Please enter a message.",
};

export const CONTACT_MAX_LENGTHS: Record<ContactField, number> = {
	name: 100,
	email: 254,
	message: 5000,
};

export const CONTACT_TOO_LONG_ERRORS: Record<ContactField, string> = {
	name: `Name must be ${CONTACT_MAX_LENGTHS.name.toLocaleString("en-US")} characters or fewer.`,
	email: `Email must be ${CONTACT_MAX_LENGTHS.email.toLocaleString("en-US")} characters or fewer.`,
	message: `Message must be ${CONTACT_MAX_LENGTHS.message.toLocaleString("en-US")} characters or fewer.`,
};

export const CONTACT_SUCCESS_MESSAGE = "Thanks! Your message has been sent.";
export const CONTACT_FAILURE_MESSAGE = "Something went wrong. Please try again.";
export const CONTACT_INVALID_REQUEST_MESSAGE = "Invalid request.";
export const CONTACT_SERVER_ERROR_MESSAGE = "Something went wrong.";

export const CONTACT_SUBMIT_LABEL = "Send Message";
export const CONTACT_SENDING_LABEL = "Sending…";

export const CONTACT_EMAIL_SUBJECT_PREFIX = "New portfolio message from";
export const CONTACT_EMAIL_SENDER_SUFFIX = "via Portfolio";
export const CONTACT_EMAIL_FALLBACK_SENDER_NAME = "Someone";
export const CONTACT_GMAIL_COMPOSE_URL = "https://mail.google.com/mail/";
export const CONTACT_REPLY_SUBJECT = "Let's talk about your project";
export const CONTACT_EMAIL_DOCTYPE = "<!DOCTYPE html>";
export const CONTACT_EMAIL_HEADING = "New message from your portfolio";
export const CONTACT_EMAIL_FOOTER = "Sent from the contact form on raristotelov.dev";
