import { HiCheckCircle, HiExclamationCircle } from "react-icons/hi";
import styles from "./FormAlert.module.scss";

type FormAlertType = "success" | "error";

interface FormAlertProps {
	type: FormAlertType;
	message: string;
}

const ICON_SIZE = 20;

export default function FormAlert({ type, message }: FormAlertProps) {
	const Icon = type === "success" ? HiCheckCircle : HiExclamationCircle;
	const role = type === "success" ? "status" : "alert";

	return (
		<div role={role} className={`${styles.alert} ${styles[type]}`}>
			<Icon size={ICON_SIZE} className={styles.icon} aria-hidden="true" />
			<p className={styles.message}>{message}</p>
		</div>
	);
}
