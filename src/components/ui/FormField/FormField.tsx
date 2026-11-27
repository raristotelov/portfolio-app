import type { ChangeEvent, HTMLInputAutoCompleteAttribute, HTMLInputTypeAttribute } from "react";
import styles from "./FormField.module.scss";

interface FormFieldProps {
	id: string;
	name: string;
	label: string;
	placeholder: string;
	value: string;
	onChange: (value: string) => void;
	error?: string;
	type?: HTMLInputTypeAttribute;
	autoComplete?: HTMLInputAutoCompleteAttribute;
	multiline?: boolean;
	maxLength?: number;
}

export default function FormField({
	id,
	name,
	label,
	placeholder,
	value,
	onChange,
	error,
	type = "text",
	autoComplete,
	multiline = false,
	maxLength,
}: FormFieldProps) {
	const errorId = `${id}-error`;
	const sharedProps = {
		id,
		name,
		placeholder,
		value,
		autoComplete,
		maxLength,
		className: multiline ? `${styles.input} ${styles.textarea}` : styles.input,
		"aria-invalid": error ? true : undefined,
		"aria-describedby": error ? errorId : undefined,
	};

	return (
		<div className={styles.field}>
			<label htmlFor={id} className={styles.label}>
				{label}
			</label>

			{multiline ? (
				<textarea {...sharedProps} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)} />
			) : (
				<input {...sharedProps} type={type} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)} />
			)}

			{error && (
				<p id={errorId} className={styles.error}>
					{error}
				</p>
			)}
		</div>
	);
}
