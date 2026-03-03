import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition duration-200",
        className,
      )}
    >
      {children}
    </section>
  );
}

