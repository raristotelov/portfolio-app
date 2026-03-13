import styles from "./SectionHeading.module.scss";

interface SectionHeadingProps {
  subtitle: string;
  title: string;
}

export default function SectionHeading({ subtitle, title }: SectionHeadingProps) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.subtitle}>{subtitle}</p>
      <h2 className={styles.title}>{title}</h2>
    </div>
  );
}
