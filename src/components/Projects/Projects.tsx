import { projects } from "@/data/projects";
import SectionHeading from "@/components/ui/SectionHeading";
import ProjectCard from "./ProjectCard";
import styles from "./Projects.module.scss";

export default function Projects() {
  return (
    <section id="projects" className={styles.section}>
      <div className={styles.container}>
        <SectionHeading subtitle="My Work" title="Recent Projects" />
        <div className={styles.grid}>
          {projects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
}
