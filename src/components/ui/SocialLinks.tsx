import { socials } from "@/data/socials";
import styles from "./SocialLinks.module.scss";

interface SocialLinksProps {
  size?: number;
  className?: string;
}

export default function SocialLinks({ size = 20, className = "" }: SocialLinksProps) {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      {socials.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.name}
          className={styles.link}
        >
          <s.icon size={size} />
        </a>
      ))}
    </div>
  );
}
