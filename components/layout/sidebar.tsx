"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

const navGroups = [
  [
    { href: "/", label: "Dashboard" },
    { href: "/illness/start", label: "I'm Sick" },
  ],
  [
    { href: "/blogs", label: "Illness Guides" },
    { href: "/blogs/manage", label: "Manage Guides" },
    { href: "/illness/history", label: "Illness History" },
    { href: "/insights", label: "Insights" },
  ],
  [
    { href: "/medicines", label: "Medicine Kit" },
    { href: "/medicines/add", label: "Add Medicine" },
    { href: "/out-of-stock", label: "Out of Stock" },
    { href: "/quick-access", label: "Quick Access" },
  ],
  [
    { href: "/symptoms/manage", label: "Manage Symptoms" },
  ],
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-[var(--color-border)] bg-white px-4 py-6 md:flex md:flex-col">
      <h1 className="mb-6 text-2xl font-bold">MedKit</h1>
      <div className="flex-1 space-y-4 overflow-y-auto">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1 border-t border-[var(--color-border)] pt-3">
            {group.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                    active ? "bg-[var(--color-primary)]" : "hover:bg-[var(--color-bg)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
      <Button variant="ghost" onClick={logout}>
        Logout
      </Button>
    </aside>
  );
}

