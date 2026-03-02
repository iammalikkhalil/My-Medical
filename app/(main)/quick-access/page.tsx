"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/client";

type Medicine = {
  _id: string;
  name: string;
  quantity: number;
  usageCount: number;
  unit: string;
  lastUsed?: string;
};

export default function QuickAccessPage() {
  const [items, setItems] = useState<Medicine[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiFetch<Medicine[]>("/api/medicines/quick-access")
      .then(setItems)
      .catch((e) => setError((e as Error).message));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Your Quick Access</h1>
      {error ? <Card className="text-[var(--color-danger)]">{error}</Card> : null}

      <Card>
        <h2 className="mb-2 text-xl font-semibold">Frequently Used</h2>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item._id} className="rounded-lg border p-3">
              <Link href={`/medicines/${item._id}`} className="font-semibold underline">
                {item.name}
              </Link>
              <p className="text-sm">
                {item.usageCount} uses · {item.quantity} {item.unit}
              </p>
            </li>
          ))}
          {!items.length ? <li className="text-sm text-zinc-600">No quick access medicines yet.</li> : null}
        </ul>
      </Card>
    </div>
  );
}

