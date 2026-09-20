import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

/** design.md §6: 필 모양, 높이 52px, primary는 레드 배경, secondary는 흰 배경+테두리 */
export function Button({ variant = "primary", className = "", disabled, ...props }: ButtonProps) {
  const base = "h-[52px] w-full rounded-full text-xl font-bold transition-colors disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] disabled:bg-[var(--color-disabled)]",
    secondary:
      "border border-[var(--color-text-secondary)] bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-bg-section)] disabled:border-[var(--color-disabled)] disabled:text-[var(--color-disabled)]"
  };

  return <button className={`${base} ${variants[variant]} ${className}`} disabled={disabled} {...props} />;
}
