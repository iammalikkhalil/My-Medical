"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/client";

type DashboardPayload = {
  activeEpisode: { _id: string; name: string; startDate: string } | null;
  lowStock: Array<{ _id: string; name: string; quantity: number }>;
  expiring: Array<{ _id: string; name: string; expiryDate: string }>;
  quickAccess: Array<{ _id: string; name: string; quantity: number; unit: string }>;
  recentDoses: Array<{ _id: string; medicineName: string; takenAt: string; isFromKit: boolean }>;
  recentEpisodes: Array<{ _id: string; name: string; startDate: string; durationDays?: number; isOngoing: boolean }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiFetch<DashboardPayload>("/api/dashboard")
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  const alerts = useMemo(() => {
    if (!data) return [] as string[];

    const lowStockAlerts = data.lowStock.map((medicine) => `${medicine.name} low stock (${medicine.quantity})`);
    const expiringAlerts = data.expiring.map((medicine) => `${medicine.name} expiring soon`);
    return [...lowStockAlerts, ...expiringAlerts];
  }, [data]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold">How are you feeling?</h1>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <Link href="/illness/start">
          <Button className="h-20 w-full text-xl">I&apos;m Sick</Button>
        </Link>
        <Link href="/quick-access">
          <Button className="h-20 w-full text-xl" variant="secondary">
            Quick Medicines
          </Button>
        </Link>
        <Link href="/out-of-stock">
          <Button className="h-20 w-full text-xl" variant="ghost">
            Need to Buy
          </Button>
        </Link>
      </div>

      {error ? <Card className="text-[var(--color-danger)]">{error}</Card> : null}

      {data?.activeEpisode ? (
        <Card className="bg-[var(--color-warning)]">
          <p className="text-xl font-bold">Ongoing Illness: {data.activeEpisode.name}</p>
          <p className="text-sm">Started {new Date(data.activeEpisode.startDate).toLocaleDateString()}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/illness/active">
              <Button>Open Active Dashboard</Button>
            </Link>
            <Link href={`/illness/${data.activeEpisode._id}`}>
              <Button variant="ghost">Details</Button>
            </Link>
          </div>
        </Card>
      ) : null}

      {alerts.length ? (
        <Card>
          <h2 className="mb-2 text-xl font-semibold">Alerts</h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {alerts.map((alert) => (
              <Badge key={alert} tone="warning">
                {alert}
              </Badge>
            ))}
          </div>
        </Card>
      ) : null}

      <Card>
        <h2 className="mb-2 text-xl font-semibold">Quick Access Medicines</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {data?.quickAccess?.length ? (
            data.quickAccess.map((medicine) => (
              <Link href={`/medicines/${medicine._id}`} key={medicine._id} className="rounded-lg border p-3">
                <p className="font-semibold">{medicine.name}</p>
                <p className="text-sm">
                  {medicine.quantity} {medicine.unit}
                </p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-zinc-600">No quick access medicines yet.</p>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-xl font-semibold">Recently Used</h2>
        <ul className="space-y-2">
          {data?.recentDoses?.length ? (
            data.recentDoses.map((dose) => (
              <li key={dose._id} className="rounded-lg border p-3">
                <p className="font-semibold">{dose.medicineName}</p>
                <p className="text-sm">
                  {new Date(dose.takenAt).toLocaleString()} · {dose.isFromKit ? "Kit" : "External"}
                </p>
              </li>
            ))
          ) : (
            <li className="text-sm text-zinc-600">No recent doses.</li>
          )}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-2 text-xl font-semibold">Recent Illness Episodes</h2>
        <ul className="space-y-2">
          {data?.recentEpisodes?.length ? (
            data.recentEpisodes.map((episode) => (
              <li key={episode._id} className="rounded-lg border p-3">
                <p className="font-semibold">{episode.name}</p>
                <p className="text-sm">
                  {new Date(episode.startDate).toLocaleDateString()} · {episode.isOngoing ? "Ongoing" : `Recovered (${episode.durationDays ?? "?"} days)`}
                </p>
              </li>
            ))
          ) : (
            <li className="text-sm text-zinc-600">No episodes yet.</li>
          )}
        </ul>
        <Link href="/illness/history" className="mt-2 inline-block text-sm font-semibold underline">
          View full history
        </Link>
      </Card>
    </div>
  );
}

