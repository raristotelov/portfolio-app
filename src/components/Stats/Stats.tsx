import { stats } from "@/data/stats";
import StatCounter from "./StatCounter";
import styles from "./Stats.module.scss";

export default function Stats() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {stats.map((stat) => (
          <StatCounter key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  );
}
