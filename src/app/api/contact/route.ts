import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
	CONTACT_HONEYPOT_FIELD,
	CONTACT_INVALID_REQUEST_MESSAGE,
	CONTACT_JSON_CONTENT_TYPE,
	CONTACT_MAX_BODY_BYTES,
	CONTACT_SERVER_ERROR_MESSAGE,
} from "@/constants/contact";
import { buildContactEmailContent, buildContactSender, readContactEmailConfig, renderContactEmailHtml } from "@/lib/contactEmail";
import { parseContactRequestBody, trimContactValues, validateContactForm } from "@/lib/contactValidation";
import type { ContactServerErrorResponse, ContactSuccessResponse, ContactValidationErrorResponse } from "@/types/contact";

type ContactResponseBody = ContactSuccessResponse | ContactValidationErrorResponse | ContactServerErrorResponse;

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_PAYLOAD_TOO_LARGE = 413;
const HTTP_UNSUPPORTED_MEDIA_TYPE = 415;
const HTTP_SERVER_ERROR = 500;

function invalidRequest(errors: ContactValidationErrorResponse["errors"]): NextResponse<ContactResponseBody> {
	return NextResponse.json({ message: CONTACT_INVALID_REQUEST_MESSAGE, errors }, { status: HTTP_BAD_REQUEST });
}

function serverError(): NextResponse<ContactResponseBody> {
	return NextResponse.json({ message: CONTACT_SERVER_ERROR_MESSAGE }, { status: HTTP_SERVER_ERROR });
}

function rejectRequest(status: number): NextResponse<ContactResponseBody> {
	return NextResponse.json({ message: CONTACT_INVALID_REQUEST_MESSAGE }, { status });
}

function isJsonRequest(request: Request): boolean {
	const mediaType = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();

	return mediaType === CONTACT_JSON_CONTENT_TYPE;
}

function declaresOversizedBody(request: Request): boolean {
	const declaredLength = request.headers.get("content-length");

	return declaredLength !== null && Number(declaredLength) > CONTACT_MAX_BODY_BYTES;
}

async function readBodyWithinLimit(request: Request): Promise<string | null> {
	if (!request.body) {
		return "";
	}

	const reader = request.body.getReader();
	const decoder = new TextDecoder();
	let receivedBytes = 0;
	let text = "";
	let chunk = await reader.read();

	while (!chunk.done) {
		receivedBytes += chunk.value.byteLength;

		if (receivedBytes > CONTACT_MAX_BODY_BYTES) {
			await reader.cancel();
			return null;
		}

		text += decoder.decode(chunk.value, { stream: true });
		chunk = await reader.read();
	}

	return text + decoder.decode();
}

export async function POST(request: Request): Promise<NextResponse<ContactResponseBody>> {
	if (!isJsonRequest(request)) {
		return rejectRequest(HTTP_UNSUPPORTED_MEDIA_TYPE);
	}

	if (declaresOversizedBody(request)) {
		return rejectRequest(HTTP_PAYLOAD_TOO_LARGE);
	}

	let rawBody: string | null;

	try {
		rawBody = await readBodyWithinLimit(request);
	} catch {
		return rejectRequest(HTTP_BAD_REQUEST);
	}

	if (rawBody === null) {
		return rejectRequest(HTTP_PAYLOAD_TOO_LARGE);
	}

	let body: unknown;

	try {
		body = JSON.parse(rawBody);
	} catch {
		return invalidRequest({});
	}

	const parsedBody = parseContactRequestBody(body);

	if (!parsedBody) {
		return invalidRequest({});
	}

	if (parsedBody[CONTACT_HONEYPOT_FIELD] !== "") {
		return NextResponse.json({ success: true }, { status: HTTP_OK });
	}

	const values = trimContactValues(parsedBody);
	const errors = validateContactForm(values);

	if (Object.keys(errors).length > 0) {
		return invalidRequest(errors);
	}

	const config = readContactEmailConfig();

	if (!config) {
		console.error("Contact form email delivery is not configured.");
		return serverError();
	}

	const { subject, text } = buildContactEmailContent(values);

	try {
		const html = await renderContactEmailHtml(values);

		const { error } = await new Resend(config.apiKey).emails.send({
			from: buildContactSender(values.name, config.from),
			to: config.to,
			replyTo: values.email,
			subject,
			html,
			text,
		});

		if (error) {
			console.error("Contact email delivery failed:", error.name);
			return serverError();
		}
	} catch {
		console.error("Contact email delivery failed.");
		return serverError();
	}

	return NextResponse.json({ success: true }, { status: HTTP_OK });
}
