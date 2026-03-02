"use client";

import * as React from "react";

import { cn } from "@/lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-[var(--color-primary)] text-[var(--color-text)] hover:brightness-95",
  secondary: "bg-[var(--color-secondary)] text-white hover:brightness-95",
  danger: "bg-[var(--color-danger)] text-white hover:brightness-95",
  ghost: "bg-transparent text-[var(--color-text)] border border-[var(--color-border)]",
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "min-h-11 rounded-xl px-4 py-2 text-base font-semibold transition-colors disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

