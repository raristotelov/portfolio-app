import Image from "next/image";
import { HiExternalLink } from "react-icons/hi";
import { FaGithub } from "react-icons/fa6";
import type { Project } from "@/data/projects";
import styles from "./ProjectCard.module.scss";

export default function ProjectCard({
  title,
  description,
  tags,
  image,
  liveUrl,
  repoUrl,
}: Project) {
  return (
    <div className={styles.card}>
      <div className={styles.thumbnail}>
        <Image
          src={image}
          alt={title}
          fill
          className={styles.image}
        />
        <div className={styles.overlay}>
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.overlayLink}
              aria-label={`View ${title} live`}
            >
              <HiExternalLink size={18} />
            </a>
          )}
          {repoUrl && (
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.overlayLink}
              aria-label={`View ${title} source`}
            >
              <FaGithub size={18} />
            </a>
          )}
        </div>
      </div>
      <div className={styles.info}>
        <div className={styles.tags}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
}
