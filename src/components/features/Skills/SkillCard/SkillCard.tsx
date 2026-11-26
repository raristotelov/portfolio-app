import Image from "next/image";
import type { Skill } from "@/types/skill";
import styles from "./SkillCard.module.scss";

export default function SkillCard({ name, icon }: Skill) {
	return (
		<div className={styles.card}>
			<div className={styles.icon}>
				{icon.kind === "image" ? (
					<Image src={icon.src} alt={name} width={40} height={40} />
				) : (
					<icon.Component role="img" aria-label={name} width={40} height={40} />
				)}
			</div>

			<div className={styles.name}>{name}</div>
		</div>
	);
}
