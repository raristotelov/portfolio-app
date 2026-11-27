"use client";

import { HiMoon, HiSun } from "react-icons/hi";
import { DARK_THEME } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import styles from "./ThemeToggle.module.scss";

const ICON_SIZE = 20;

export default function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();

	return (
		<button type="button" className={styles.toggle} onClick={toggleTheme} aria-label="Dark mode" aria-pressed={theme === DARK_THEME}>
			<HiMoon className={styles.moon} size={ICON_SIZE} aria-hidden="true" />

			<HiSun className={styles.sun} size={ICON_SIZE} aria-hidden="true" />
		</button>
	);
}
