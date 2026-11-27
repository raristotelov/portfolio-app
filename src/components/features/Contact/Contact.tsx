"use client";

import { HiMail, HiLocationMarker } from "react-icons/hi";
import FormAlert from "@/components/ui/FormAlert";
import FormField from "@/components/ui/FormField";
import {
	CONTACT_FAILURE_MESSAGE,
	CONTACT_HONEYPOT_FIELD,
	CONTACT_MAX_LENGTHS,
	CONTACT_SENDING_LABEL,
	CONTACT_SUBMIT_LABEL,
	CONTACT_SUCCESS_MESSAGE,
} from "@/constants/contact";
import { siteMetadata } from "@/data/profile";
import { useContactForm } from "@/hooks/useContactForm";
import styles from "./Contact.module.scss";

const contactMethods = [
	{
		icon: HiMail,
		label: "Email",
		value: siteMetadata.email,
		href: `mailto:${siteMetadata.email}`,
	},
	{
		icon: HiLocationMarker,
		label: "Location",
		value: siteMetadata.location,
	},
];

export default function Contact() {
	const { values, honeypot, errors, status, isSending, setFieldValue, setHoneypot, handleSubmit } = useContactForm();

	return (
		<section id="contact" className={styles.section}>
			<div className={styles.container}>
				<div className={styles.header}>
					<h2 className={styles.title}>Get In Touch</h2>
				</div>

				<div className={styles.cards}>
					{contactMethods.map((method) => (
						<div key={method.label} className={styles.card}>
							<div className={styles.cardIcon}>
								<method.icon size={22} />
							</div>

							<p className={styles.cardLabel}>{method.label}</p>

							{method.href ? (
								<a href={method.href} className={styles.cardValue}>
									{method.value}
								</a>
							) : (
								<p className={styles.cardValue}>{method.value}</p>
							)}
						</div>
					))}
				</div>

				<form className={styles.form} onSubmit={handleSubmit} noValidate>
					{status === "success" && <FormAlert type="success" message={CONTACT_SUCCESS_MESSAGE} />}
					{status === "failure" && <FormAlert type="error" message={CONTACT_FAILURE_MESSAGE} />}

					<div className={styles.formRow}>
						<FormField
							id="contact-name"
							name="name"
							label="Your Name"
							placeholder="Your Name"
							autoComplete="name"
							maxLength={CONTACT_MAX_LENGTHS.name}
							value={values.name}
							error={errors.name}
							onChange={(value) => setFieldValue("name", value)}
						/>

						<FormField
							id="contact-email"
							name="email"
							type="email"
							label="Your Email"
							placeholder="Your Email"
							autoComplete="email"
							maxLength={CONTACT_MAX_LENGTHS.email}
							value={values.email}
							error={errors.email}
							onChange={(value) => setFieldValue("email", value)}
						/>
					</div>

					<FormField
						id="contact-message"
						name="message"
						label="Your Message"
						placeholder="Your Message"
						multiline
						maxLength={CONTACT_MAX_LENGTHS.message}
						value={values.message}
						error={errors.message}
						onChange={(value) => setFieldValue("message", value)}
					/>

					<div className={styles.honeypot} aria-hidden="true">
						<label htmlFor="contact-website">Website</label>
						<input
							id="contact-website"
							type="text"
							name={CONTACT_HONEYPOT_FIELD}
							tabIndex={-1}
							autoComplete="off"
							value={honeypot}
							onChange={(event) => setHoneypot(event.target.value)}
						/>
					</div>

					<button type="submit" className={styles.submitBtn} disabled={isSending}>
						{isSending ? CONTACT_SENDING_LABEL : CONTACT_SUBMIT_LABEL}
					</button>
				</form>
			</div>
		</section>
	);
}
