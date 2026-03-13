export interface Project {
  title: string;
  description: string;
  tags: string[];
  image: string;
  liveUrl?: string;
  repoUrl?: string;
}

export const projects: Project[] = [
  {
    title: "TaskFlow",
    description:
      "A collaborative project management app with real-time updates, Kanban boards, and team analytics. Built to streamline workflows for remote teams.",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
    image: "/projects/placeholder.svg",
    liveUrl: "#",
    repoUrl: "#",
  },
  {
    title: "DevVault",
    description:
      "A developer toolkit for managing code snippets, environment configs, and API keys. Features encrypted storage and VS Code integration.",
    tags: ["React", "Node.js", "MongoDB", "Docker"],
    image: "/projects/placeholder.svg",
    liveUrl: "#",
    repoUrl: "#",
  },
];
