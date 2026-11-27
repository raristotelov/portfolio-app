import { createElement } from "react";
import {
	CONTACT_EMAIL_DOCTYPE,
	CONTACT_EMAIL_FALLBACK_SENDER_NAME,
	CONTACT_EMAIL_SENDER_SUFFIX,
	CONTACT_EMAIL_SUBJECT_PREFIX,
	CONTACT_GMAIL_COMPOSE_URL,
	CONTACT_REPLY_SUBJECT,
} from "@/constants/contact";
import ContactNotificationEmail from "@/emails/ContactNotificationEmail";
import type { ContactFormValues } from "@/types/contact";

export interface ContactEmailConfig {
	apiKey: string;
	from: string;
	to: string;
}

export interface ContactEmailContent {
	subject: string;
	text: string;
}

const LAST_CONTROL_CHARACTER_CODE = 31;
const DELETE_CHARACTER_CODE = 127;
const DISPLAY_NAME_FORBIDDEN_CHARACTERS = /["<>\\]/g;
const BIDI_AND_FORMAT_CHARACTERS = /[​-‏‪-‮⁦-⁩﻿]/g;
const ANGLE_BRACKET_ADDRESS_PATTERN = /<([^<>]+)>\s*$/;
const ENCODED_AT_SIGN = /%40/g;

export function readContactEmailConfig(env: Readonly<Record<string, string | undefined>> = process.env): ContactEmailConfig | null {
	const apiKey = env.RESEND_API_KEY;
	const from = env.CONTACT_FROM_EMAIL;
	const to = env.CONTACT_TO_EMAIL;

	if (!apiKey || !from || !to) {
		return null;
	}

	return { apiKey, from, to };
}

function toSingleLine(value: string): string {
	const withoutControlCharacters = Array.from(value)
		.map((character) => {
			const code = character.charCodeAt(0);
			return code <= LAST_CONTROL_CHARACTER_CODE || code === DELETE_CHARACTER_CODE ? " " : character;
		})
		.join("");

	return withoutControlCharacters.replace(BIDI_AND_FORMAT_CHARACTERS, "").replace(/\s+/g, " ").trim();
}

function extractEmailAddress(from: string): string {
	const match = ANGLE_BRACKET_ADDRESS_PATTERN.exec(from);

	return (match ? match[1] : from).trim();
}

function sanitizeDisplayName(name: string): string {
	return toSingleLine(name.replace(DISPLAY_NAME_FORBIDDEN_CHARACTERS, ""));
}

export function getFirstName(name: string): string {
	return toSingleLine(name).split(" ")[0] || CONTACT_EMAIL_FALLBACK_SENDER_NAME;
}

export function buildContactSender(name: string, from: string): string {
	const displayName = sanitizeDisplayName(name) || CONTACT_EMAIL_FALLBACK_SENDER_NAME;

	return `"${displayName} ${CONTACT_EMAIL_SENDER_SUFFIX}" <${extractEmailAddress(from)}>`;
}

export function buildMailtoHref(email: string): string {
	return `mailto:${encodeURIComponent(email).replace(ENCODED_AT_SIGN, "@")}`;
}

export function buildGmailComposeUrl(email: string, subject: string): string {
	const url = new URL(CONTACT_GMAIL_COMPOSE_URL);

	url.search = new URLSearchParams({ view: "cm", fs: "1", to: email, su: subject }).toString();

	return url.toString();
}

export function buildContactEmailContent({ name, email, message }: ContactFormValues): ContactEmailContent {
	return {
		subject: `${CONTACT_EMAIL_SUBJECT_PREFIX} ${toSingleLine(name)}`,
		text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
	};
}

export async function renderContactEmailHtml({ name, email, message }: ContactFormValues): Promise<string> {
	const { renderToStaticMarkup } = await import("react-dom/server");
	const markup = renderToStaticMarkup(
		createElement(ContactNotificationEmail, {
			name,
			email,
			message,
			firstName: getFirstName(name),
			emailHref: buildMailtoHref(email),
			replyHref: buildGmailComposeUrl(email, CONTACT_REPLY_SUBJECT),
		}),
	);

	return `${CONTACT_EMAIL_DOCTYPE}${markup}`;
}
