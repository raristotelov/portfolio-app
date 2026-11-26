import { FaGithub, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import type { SocialLink } from "@/types/social";

export const socials: SocialLink[] = [
	{ name: "GitHub", href: "https://github.com", icon: FaGithub },
	{ name: "LinkedIn", href: "https://linkedin.com", icon: FaLinkedinIn },
	{ name: "X / Twitter", href: "https://x.com", icon: FaXTwitter },
];
