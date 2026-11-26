import { socials } from "@/data/socials";
import styles from "./SocialLinks.module.scss";

interface SocialLinksProps {
	size?: number;
	className?: string;
	animated?: boolean;
}

export default function SocialLinks({ size = 20, className = "", animated = true }: SocialLinksProps) {
	return (
		<div className={`${styles.wrapper} ${animated ? styles.animated : ""} ${className}`}>
			{socials.map((s) => (
				<a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} className={styles.link}>
					<s.icon size={size} />
				</a>
			))}
		</div>
	);
}
