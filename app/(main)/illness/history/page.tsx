"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/client";

type Episode = {
  _id: string;
  name: string;
  startDate: string;
  recoveryDate?: string | null;
  durationDays?: number | null;
  isOngoing: boolean;
};

export default function IllnessHistoryPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiFetch<Episode[]>("/api/episodes")
      .then(setEpisodes)
      .catch((e) => setError((e as Error).message));
  }, []);

  const groupedByYear = useMemo(() => {
    return episodes.reduce<Record<string, Episode[]>>((acc, episode) => {
      const year = new Date(episode.startDate).getFullYear().toString();
      if (!acc[year]) acc[year] = [];
      acc[year].push(episode);
      return acc;
    }, {});
  }, [episodes]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Illness History</h1>
      {error ? <Card className="text-[var(--color-danger)]">{error}</Card> : null}

      {Object.entries(groupedByYear)
        .sort((a, b) => Number(b[0]) - Number(a[0]))
        .map(([year, yearEpisodes]) => (
          <Card key={year}>
            <h2 className="mb-2 text-2xl font-semibold">{year}</h2>
            <ul className="space-y-2">
              {yearEpisodes.map((episode) => (
                <li key={episode._id} className="rounded-lg border p-3">
                  <p className="font-semibold">{episode.name}</p>
                  <p className="text-sm">
                    {new Date(episode.startDate).toLocaleDateString()} {episode.recoveryDate ? `to ${new Date(episode.recoveryDate).toLocaleDateString()}` : "(ongoing)"}
                    {episode.durationDays ? ` · ${episode.durationDays} days` : ""}
                  </p>
                  <Link href={`/illness/${episode._id}`} className="text-sm font-semibold underline">
                    {episode.isOngoing ? "Continue" : "View details"}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
    </div>
  );
}

