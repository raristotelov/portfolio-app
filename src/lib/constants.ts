export const siteMetadata = {
  name: "Ivan Aristotelov",
  firstName: "Ivan",
  lastName: "Aristotelov",
  initials: "IA",
  role: "Full Stack Developer",
  email: "hello@raristotelov.dev",
  phone: "+1 (555) 123-4567",
  location: "Bulgaria, EU · UTC+2",
};

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
] as const;

export const sectionIds = {
  home: "home",
  skills: "skills",
  projects: "projects",
  contact: "contact",
} as const;
