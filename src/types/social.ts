import type { IconType } from "react-icons";

export type SocialId = "github" | "linkedin" | "x";

export interface SocialLink {
	id: SocialId;
	name: string;
	href: string;
	icon: IconType;
}
