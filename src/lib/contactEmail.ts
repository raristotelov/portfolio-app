import { CONTACT_EMAIL_SUBJECT_PREFIX } from "@/constants/contact";
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

export function readContactEmailConfig(env: NodeJS.ProcessEnv = process.env): ContactEmailConfig | null {
	const apiKey = env.RESEND_API_KEY;
	const from = env.CONTACT_FROM_EMAIL;
	const to = env.CONTACT_TO_EMAIL;

	if (!apiKey || !from || !to) {
		return null;
	}

	return { apiKey, from, to };
}

export function buildContactEmailContent({ name, email, message }: ContactFormValues): ContactEmailContent {
	const singleLineName = name.replace(/\s+/g, " ");

	return {
		subject: `${CONTACT_EMAIL_SUBJECT_PREFIX} ${singleLineName}`,
		text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
	};
}
