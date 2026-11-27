import type { SVGProps } from "react";
import styles from "./VercelIcon.module.scss";

export default function VercelIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" {...props}>
			<path className={styles.triangle} d="M64.002 8.576 128 119.424H0Zm0 0" />
		</svg>
	);
}
