"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useGlobalNavigationLoader } from "@/components/navigation/global-navigation-loader";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/illness/active", label: "Sick" },
  { href: "/blogs", label: "Guides" },
  { href: "/medicines", label: "Kit" },
  { href: "/illness/history", label: "History" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { startNavigation } = useGlobalNavigationLoader();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    navItems.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [router]);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-white/95 p-2 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch
                onClick={() => {
                  setPendingHref(item.href);
                  startNavigation();
                }}
                onMouseEnter={() => router.prefetch(item.href)}
                onTouchStart={() => router.prefetch(item.href)}
                className={`flex min-h-11 items-center justify-center rounded-lg text-xs font-semibold transition duration-200 active:scale-[0.97] ${
                  active ? "bg-[var(--color-primary)] shadow-sm" : "bg-transparent hover:bg-[var(--color-bg)]"
                } ${pendingHref === item.href ? "opacity-70" : ""}`}
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

