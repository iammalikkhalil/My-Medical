import { AppShell } from "@/components/layout/app-shell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="page-enter">{children}</div>
    </AppShell>
  );
}

