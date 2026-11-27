import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import type { SocialLink } from "@/types/social";

export const socials: SocialLink[] = [
	{ id: "linkedin", name: "LinkedIn", href: "https://linkedin.com", icon: FaLinkedinIn },
	{ id: "github", name: "GitHub", href: "https://github.com", icon: FaGithub },
];
