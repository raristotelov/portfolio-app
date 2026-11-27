import { NextResponse } from "next/server";
import { Resend } from "resend";
import { CONTACT_INVALID_REQUEST_MESSAGE, CONTACT_SERVER_ERROR_MESSAGE } from "@/constants/contact";
import { buildContactEmailContent, readContactEmailConfig } from "@/lib/contactEmail";
import { parseContactRequestBody, trimContactValues, validateContactForm } from "@/lib/contactValidation";
import type { ContactServerErrorResponse, ContactSuccessResponse, ContactValidationErrorResponse } from "@/types/contact";

type ContactResponseBody = ContactSuccessResponse | ContactValidationErrorResponse | ContactServerErrorResponse;

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_SERVER_ERROR = 500;

function invalidRequest(errors: ContactValidationErrorResponse["errors"]): NextResponse<ContactResponseBody> {
	return NextResponse.json({ message: CONTACT_INVALID_REQUEST_MESSAGE, errors }, { status: HTTP_BAD_REQUEST });
}

function serverError(): NextResponse<ContactResponseBody> {
	return NextResponse.json({ message: CONTACT_SERVER_ERROR_MESSAGE }, { status: HTTP_SERVER_ERROR });
}

export async function POST(request: Request): Promise<NextResponse<ContactResponseBody>> {
	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return invalidRequest({});
	}

	const parsedBody = parseContactRequestBody(body);

	if (!parsedBody) {
		return invalidRequest({});
	}

	if (parsedBody.website !== "") {
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
		const { error } = await new Resend(config.apiKey).emails.send({
			from: config.from,
			to: config.to,
			replyTo: values.email,
			subject,
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
