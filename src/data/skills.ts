import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiNodedotjs,
  SiTailwindcss,
  SiPostgresql,
  SiSupabase,
  SiMongodb,
  SiGit,
  SiVercel,
  SiHtml5,
} from "react-icons/si";
import type { IconType } from "react-icons";

export interface Skill {
  name: string;
  icon: IconType;
}

export const skills: Skill[] = [
  { name: "React", icon: SiReact },
  { name: "Next.js", icon: SiNextdotjs },
  { name: "TypeScript", icon: SiTypescript },
  { name: "Node.js", icon: SiNodedotjs },
  { name: "Tailwind CSS", icon: SiTailwindcss },
  { name: "PostgreSQL", icon: SiPostgresql },
  { name: "Supabase", icon: SiSupabase },
  { name: "MongoDB", icon: SiMongodb },
  { name: "Git", icon: SiGit },
  { name: "Vercel", icon: SiVercel },
  { name: "HTML/CSS", icon: SiHtml5 },
];
