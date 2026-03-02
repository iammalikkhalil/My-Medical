"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/client";

type InsightPayload = {
  illnessFrequency: Array<{ _id: string; count: number; lastDate: string }>;
  effectiveMedicines: Array<{ medicineName: string; effectiveCount: number; total: number; rate: number }>;
  averageRecovery: {
    averageRecoveryDays: number | null;
    fastestRecoveryDays: number | null;
    longestRecoveryDays: number | null;
  };
  mostUsedMedicines: Array<{ _id: string; name: string; usageCount: number }>;
  kitHealth: {
    expiredCount: number;
    outOfStockCount: number;
    expiringCount: number;
  };
};

export default function InsightsPage() {
  const [data, setData] = useState<InsightPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiFetch<InsightPayload>("/api/insights")
      .then(setData)
      .catch((e) => setError((e as Error).message));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Your Health Patterns</h1>
      {error ? <Card className="text-[var(--color-danger)]">{error}</Card> : null}

      <Card>
        <h2 className="text-xl font-semibold">Illness Frequency This Year</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {data?.illnessFrequency?.map((item) => (
            <li key={item._id}>
              {item._id} - {item.count}x (last: {new Date(item.lastDate).toLocaleDateString()})
            </li>
          ))}
          {!data?.illnessFrequency?.length ? <li>No data yet.</li> : null}
        </ul>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">What Worked Best</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {data?.effectiveMedicines?.map((item) => (
            <li key={item.medicineName}>
              {item.medicineName} - {item.effectiveCount}/{item.total} ({Math.round(item.rate * 100)}%)
            </li>
          ))}
          {!data?.effectiveMedicines?.length ? <li>No effectiveness data yet.</li> : null}
        </ul>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">Recovery Patterns</h2>
        <ul className="mt-2 space-y-1 text-sm">
          <li>Average illness duration: {data?.averageRecovery.averageRecoveryDays?.toFixed(1) ?? "N/A"} days</li>
          <li>Fastest recovery: {data?.averageRecovery.fastestRecoveryDays ?? "N/A"} days</li>
          <li>Longest illness: {data?.averageRecovery.longestRecoveryDays ?? "N/A"} days</li>
        </ul>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">Most Used Medicines</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {data?.mostUsedMedicines?.map((item) => (
            <li key={item._id}>
              {item.name} - {item.usageCount} doses
            </li>
          ))}
          {!data?.mostUsedMedicines?.length ? <li>No medicine usage data yet.</li> : null}
        </ul>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">Kit Health</h2>
        <ul className="mt-2 space-y-1 text-sm">
          <li>{data?.kitHealth.expiredCount ?? 0} medicine(s) expired</li>
          <li>{data?.kitHealth.expiringCount ?? 0} medicine(s) expiring in 60 days</li>
          <li>{data?.kitHealth.outOfStockCount ?? 0} medicine(s) out of stock</li>
        </ul>
      </Card>
    </div>
  );
}

