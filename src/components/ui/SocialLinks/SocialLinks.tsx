import { socials } from "@/data/socials";
import type { SocialId } from "@/types/social";
import styles from "./SocialLinks.module.scss";

interface SocialLinksProps {
	size?: number;
	className?: string;
	include?: readonly SocialId[];
}

export default function SocialLinks({ size = 20, className = "", include }: SocialLinksProps) {
	const visibleSocials = include ? socials.filter((s) => include.includes(s.id)) : socials;

	return (
		<div className={`${styles.wrapper} ${className}`}>
			{visibleSocials.map((s) => (
				<a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} className={styles.link}>
					<s.icon size={size} />
				</a>
			))}
		</div>
	);
}
