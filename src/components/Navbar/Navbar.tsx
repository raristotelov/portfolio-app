"use client";

import { useState } from "react";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { navLinks } from "@/lib/constants";
import Button from "@/components/ui/Button";
import styles from "./Navbar.module.scss";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <a href="#home" className={styles.logo}>
          ra<span>.</span>
        </a>

        <ul className={styles.desktopLinks}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        <div className={styles.desktopCta}>
          <Button as="a" href="#contact" variant="primary" small>
            Hire Me
          </Button>
        </div>

        <button
          className={styles.hamburger}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
        </button>
      </div>

      <div className={`${styles.mobileMenu} ${open ? styles.open : ""}`}>
        <ul className={styles.mobileLinks}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}

          <li>
            <Button as="a" href="#contact" variant="primary" small>
              Hire Me
            </Button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
