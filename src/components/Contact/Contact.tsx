"use client";

import { HiMail, HiLocationMarker } from "react-icons/hi";
import { siteMetadata } from "@/lib/constants";
import styles from "./Contact.module.scss";

const contactMethods = [
  {
    icon: HiMail,
    label: "Email",
    value: siteMetadata.email,
    href: `mailto:${siteMetadata.email}`,
  },
  {
    icon: HiLocationMarker,
    label: "Location",
    value: siteMetadata.location,
  },
];

export default function Contact() {
  return (
    <section id="contact" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Get In Touch</h2>
        </div>

        <div className={styles.cards}>
          {contactMethods.map((method) => (
            <div key={method.label} className={styles.card}>
              <div className={styles.cardIcon}>
                <method.icon size={22} />
              </div>
              <p className={styles.cardLabel}>{method.label}</p>
              {method.href ? (
                <a href={method.href} className={styles.cardValue}>
                  {method.value}
                </a>
              ) : (
                <p className={styles.cardValue}>{method.value}</p>
              )}
            </div>
          ))}
        </div>

        <form
          className={styles.form}
          onSubmit={(e) => e.preventDefault()}
        >
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder="Your Name"
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="email"
                placeholder="Your Email"
                className={styles.input}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <textarea
              placeholder="Your Message"
              className={`${styles.input} ${styles.textarea}`}
            />
          </div>
          <button type="submit" className={styles.submitBtn}>
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}
