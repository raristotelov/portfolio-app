import { useCallback, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CONTACT_API_PATH } from "@/constants/contact";
import { trimContactValues, validateContactField, validateContactForm } from "@/lib/contactValidation";
import type { ContactField, ContactFormErrors, ContactFormValues, ContactRequestBody, ContactSubmitStatus } from "@/types/contact";

const EMPTY_VALUES: ContactFormValues = { name: "", email: "", message: "" };

async function postContactMessage(body: ContactRequestBody): Promise<boolean> {
	try {
		const response = await fetch(CONTACT_API_PATH, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		return response.ok;
	} catch {
		return false;
	}
}

export function useContactForm() {
	const [values, setValues] = useState<ContactFormValues>(EMPTY_VALUES);
	const [honeypot, setHoneypot] = useState("");
	const [errors, setErrors] = useState<ContactFormErrors>({});
	const [status, setStatus] = useState<ContactSubmitStatus>("idle");

	const isRequestInFlight = useRef(false);

	const isSending = status === "sending";

	const setFieldValue = useCallback((field: ContactField, value: string) => {
		setValues((current) => ({ ...current, [field]: value }));

		if (!validateContactField(field, value)) {
			setErrors((current) => ({ ...current, [field]: undefined }));
		}
	}, []);

	const handleSubmit = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			if (isRequestInFlight.current) {
				return;
			}

			const trimmedValues = trimContactValues(values);
			const validationErrors = validateContactForm(trimmedValues);

			setErrors(validationErrors);

			if (Object.keys(validationErrors).length > 0) {
				setStatus("idle");
				return;
			}

			isRequestInFlight.current = true;
			setStatus("sending");

			const isDelivered = await postContactMessage({ ...trimmedValues, website: honeypot });

			isRequestInFlight.current = false;

			if (isDelivered) {
				setValues(EMPTY_VALUES);
				setHoneypot("");
			}

			setStatus(isDelivered ? "success" : "failure");
		},
		[honeypot, values],
	);

	return { values, honeypot, errors, status, isSending, setFieldValue, setHoneypot, handleSubmit };
}
