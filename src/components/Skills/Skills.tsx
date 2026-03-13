import { skills } from "@/data/skills";
import SkillCard from "./SkillCard";
import styles from "./Skills.module.scss";

export default function Skills() {
  return (
    <section id="skills" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Skills</h2>
        </div>
        <div className={styles.grid}>
          {skills.map((skill) => (
            <SkillCard key={skill.name} {...skill} />
          ))}
        </div>
      </div>
    </section>
  );
}
