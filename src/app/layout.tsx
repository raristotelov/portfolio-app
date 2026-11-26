import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import { PHProvider } from "./providers";
import "@/styles/main.scss";

const sora = Sora({
	variable: "--font-sora",
	weight: ["300", "400", "600", "700", "800"],
	subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains",
	weight: ["400", "500", "700"],
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Radostin Aristotelov — Full Stack Developer",
	description: "Portfolio of Radostin Aristotelov, a Full Stack Developer specializing in modern web applications.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${sora.variable} ${jetbrainsMono.variable}`}>
			<body>
				<PHProvider>{children}</PHProvider>
			</body>
		</html>
	);
}
