import { cn } from "@/lib/cn";

const colorMap = {
  success: "bg-[var(--color-success)] text-white",
  warning: "bg-[var(--color-warning)] text-black",
  danger: "bg-[var(--color-danger)] text-white",
  neutral: "bg-zinc-200 text-zinc-900",
} as const;

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: keyof typeof colorMap;
}) {
  return <span className={cn("inline-flex rounded-full px-3 py-1 text-sm font-medium", colorMap[tone])}>{children}</span>;
}

