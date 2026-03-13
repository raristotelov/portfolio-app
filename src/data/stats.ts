export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export const stats: Stat[] = [
  { value: 5, suffix: "+", label: "Years Experience" },
  { value: 30, suffix: "+", label: "Projects Completed" },
  { value: 20, suffix: "+", label: "Happy Clients" },
  { value: 10, suffix: "+", label: "Awards Won" },
];
