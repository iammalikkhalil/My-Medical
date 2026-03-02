"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/illness/active", label: "Sick" },
  { href: "/blogs", label: "Guides" },
  { href: "/medicines", label: "Kit" },
  { href: "/illness/history", label: "History" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-white p-2 md:hidden">
      <ul className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex min-h-11 items-center justify-center rounded-lg text-xs font-semibold ${
                  active ? "bg-[var(--color-primary)]" : "bg-transparent"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

