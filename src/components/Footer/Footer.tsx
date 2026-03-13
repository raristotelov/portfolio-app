import { siteMetadata } from "@/lib/constants";
import SocialLinks from "@/components/ui/SocialLinks";
import styles from "./Footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} {siteMetadata.name}. All rights
          reserved.
        </p>
        <SocialLinks size={16} className={styles.footerSocial} />
        <a href="#home" className={styles.backToTop}>
          Back to top &uarr;
        </a>
      </div>
    </footer>
  );
}
