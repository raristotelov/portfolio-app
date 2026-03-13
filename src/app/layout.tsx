import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.scss";

const sora = Sora({
  variable: "--font-sora",
  weight: ["300", "400", "500", "800"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "John Doe — Full Stack Developer",
  description:
    "Portfolio of John Doe, a Full Stack Developer specializing in modern web applications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
