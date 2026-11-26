import { FaGithub, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import type { SocialLink } from "@/types/social";

export const socials: SocialLink[] = [
	{ id: "github", name: "GitHub", href: "https://github.com", icon: FaGithub },
	{ id: "linkedin", name: "LinkedIn", href: "https://linkedin.com", icon: FaLinkedinIn },
	{ id: "x", name: "X / Twitter", href: "https://x.com", icon: FaXTwitter },
];
