import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import styles from "./Button.module.scss";

type Variant = "primary" | "outline";

type ButtonProps = {
  variant?: Variant;
  small?: boolean;
} & (
  | ({ as?: "button" } & ButtonHTMLAttributes<HTMLButtonElement>)
  | ({ as: "a"; href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
);

export default function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const cls = [styles.btn, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  if (props.as === "a") {
    const { as: _, ...rest } = props;
    return <a className={cls} {...rest} />;
  }

  const { as: _, ...rest } = props;
  return <button className={cls} {...rest} />;
}
