import type { Skill } from "@/data/skills";
import styles from "./SkillCard.module.scss";

export default function SkillCard({ name, icon: Icon }: Skill) {
  return (
    <div className={styles.card}>
      <div className={styles.icon}>
        <Icon size={40} />
      </div>
      <div className={styles.name}>{name}</div>
    </div>
  );
}
