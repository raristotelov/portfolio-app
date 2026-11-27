import type { ComponentType, SVGProps } from "react";

export interface SkillImageIcon {
	kind: "image";
	src: string;
}

export interface SkillInlineIcon {
	kind: "inline";
	Component: ComponentType<SVGProps<SVGSVGElement>>;
}

export type SkillIcon = SkillImageIcon | SkillInlineIcon;

export interface Skill {
	name: string;
	icon: SkillIcon;
}
