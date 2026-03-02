"use client";

import * as React from "react";

import { cn } from "@/lib/cn";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-base outline-none focus:border-[var(--color-secondary)]",
        props.className,
      )}
    />
  );
}

