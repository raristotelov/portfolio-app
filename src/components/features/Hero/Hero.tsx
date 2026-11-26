import { siteMetadata } from "@/data/profile";
import Button from "@/components/ui/Button";
import SocialLinks from "@/components/ui/SocialLinks";
import type { SocialId } from "@/types/social";
import styles from "./Hero.module.scss";

const HERO_SOCIALS: readonly SocialId[] = ["github", "linkedin"];

export default function Hero() {
	return (
		<section id="home" className={styles.section}>
			<div className={styles.hero}>
				<div className={styles.heroInner}>
					<div className={styles.heroLeft}>
						<h1 className={styles.name}>
							{siteMetadata.firstName}

							<br />

							{siteMetadata.lastName}

							<span className={styles.dot}>.</span>
						</h1>

						<h2 className={styles.tagline}>
							Shipping reliable web apps,
							<br />
							<span className={styles.highlight}>one commit at a time.</span>
						</h2>

						<p className={styles.desc}>
							React, Next.js, and TypeScript developer focused on building business tools and web applications. 5+ years of experience
							delivering full-stack solutions for international clients.
						</p>

						<div className={styles.buttons}>
							<Button as="a" href="#projects" variant="primary">
								View Projects
							</Button>

							<Button as="a" href="/cv.pdf" variant="outline">
								Download CV
							</Button>
						</div>

						<SocialLinks include={HERO_SOCIALS} />
					</div>

					<div className={styles.heroRight}>
						<div className={styles.avatarWrapper}>
							<div className={styles.avatarRing} />

							<div className={styles.avatar}>
								<span>{siteMetadata.initials}</span>
							</div>

							<div className={styles.avatarBadge}>Available for hire</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
