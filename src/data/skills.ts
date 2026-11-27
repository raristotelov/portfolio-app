import NextjsIcon from "@/components/ui/NextjsIcon";
import VercelIcon from "@/components/ui/VercelIcon";
import type { Skill } from "@/types/skill";

export const skills: Skill[] = [
	{ name: "JavaScript", icon: { kind: "image", src: "/skills/javascript.svg" } },
	{ name: "TypeScript", icon: { kind: "image", src: "/skills/typescript.svg" } },
	{ name: "React", icon: { kind: "image", src: "/skills/react.svg" } },
	{ name: "Next.js", icon: { kind: "inline", Component: NextjsIcon } },
	{ name: "Tailwind CSS", icon: { kind: "image", src: "/skills/tailwindcss.svg" } },
	{ name: "Node.js", icon: { kind: "image", src: "/skills/nodejs.svg" } },
	{ name: "PostgreSQL", icon: { kind: "image", src: "/skills/postgresql.svg" } },
	{ name: "Supabase", icon: { kind: "image", src: "/skills/supabase.svg" } },
	{ name: "MongoDB", icon: { kind: "image", src: "/skills/mongodb.svg" } },
	{ name: "Docker", icon: { kind: "image", src: "/skills/docker.svg" } },
	{ name: "Vercel", icon: { kind: "inline", Component: VercelIcon } },
	{ name: "Git", icon: { kind: "image", src: "/skills/git.svg" } },
];
