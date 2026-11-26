import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import styles from "./Button.module.scss";

type Variant = "primary" | "outline";

type ButtonProps = {
	variant?: Variant;
} & (({ as?: "button" } & ButtonHTMLAttributes<HTMLButtonElement>) | ({ as: "a"; href: string } & AnchorHTMLAttributes<HTMLAnchorElement>));

export default function Button({ variant = "primary", className, ...props }: ButtonProps) {
	const cls = [styles.btn, styles[variant], className].filter(Boolean).join(" ");

	if (props.as === "a") {
		const { as: _, children, ...rest } = props;
		return (
			<a className={cls} {...rest}>
				{children}
			</a>
		);
	}

	const { as: _, children, ...rest } = props;
	return (
		<button className={cls} {...rest}>
			{children}
		</button>
	);
}
