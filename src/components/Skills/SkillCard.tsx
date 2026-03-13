import type { Skill } from "@/data/skills";
import styles from "./SkillCard.module.scss";

export default function SkillCard({ name, icon }: Skill) {
  return (
    <div className={styles.card}>
      <div className={styles.icon}>
        <img src={icon} alt={name} width={40} height={40} />
      </div>

      <div className={styles.name}>{name}</div>
    </div>
  );
}
