"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/client";

type Dose = {
  _id: string;
  medicineName: string;
  isFromKit: boolean;
  amount: number;
  unit: string;
  takenAt: string;
};

type Episode = {
  _id: string;
  name: string;
  startDate: string;
  recoveryDate?: string | null;
  durationDays?: number | null;
  overallEffectiveness?: "recovered" | "partial" | "worsened" | null;
  notes?: string;
  symptoms: Array<{ name: string }>;
  groupedDoses: Record<string, Dose[]>;
};

export default function IllnessDetailPage() {
  const params = useParams<{ id: string }>();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiFetch<Episode>(`/api/episodes/${params.id}`)
      .then(setEpisode)
      .catch((e) => setError((e as Error).message));
  }, [params.id]);

  const totals = useMemo(() => {
    if (!episode) return { kit: 0, external: 0 };
    let kit = 0;
    let external = 0;

    Object.values(episode.groupedDoses).forEach((doses) => {
      doses.forEach((dose) => {
        if (dose.isFromKit) kit += 1;
        else external += 1;
      });
    });

    return { kit, external };
  }, [episode]);

  if (!episode) {
    return <Card>{error || "Loading..."}</Card>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-3xl font-bold">{episode.name}</h1>
        <p className="text-sm">
          {new Date(episode.startDate).toLocaleDateString()} {episode.recoveryDate ? `to ${new Date(episode.recoveryDate).toLocaleDateString()}` : "(ongoing)"}
          {episode.durationDays ? ` · ${episode.durationDays} days` : ""}
        </p>
        {episode.overallEffectiveness ? (
          <div className="mt-2">
            <Badge tone={episode.overallEffectiveness === "recovered" ? "success" : episode.overallEffectiveness === "partial" ? "warning" : "danger"}>
              {episode.overallEffectiveness}
            </Badge>
          </div>
        ) : null}
      </Card>

      <Card>
        <p className="font-semibold">Symptoms</p>
        <p className="text-sm">{episode.symptoms.map((symptom) => symptom.name).join(" · ") || "No symptoms linked"}</p>
        <Link href="/blogs" className="mt-2 inline-block text-sm underline">
          Read illness guides
        </Link>
      </Card>

      <Card>
        <h2 className="mb-2 text-xl font-semibold">Medicines Taken</h2>
        {Object.entries(episode.groupedDoses).map(([day, doses]) => (
          <div key={day} className="mb-3">
            <p className="font-semibold">{day}</p>
            <ul className="space-y-1">
              {doses.map((dose) => (
                <li key={dose._id} className="text-sm">
                  {dose.isFromKit ? "[Kit]" : "[External]"} {dose.medicineName} - {new Date(dose.takenAt).toLocaleTimeString()} - {dose.amount} {dose.unit}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Card>

      <Card>
        <p className="font-semibold">Notes</p>
        <p className="text-sm">{episode.notes || "No notes"}</p>
        <p className="mt-2 text-sm">
          Total doses: {totals.kit} kit doses, {totals.external} external doses
        </p>
      </Card>
    </div>
  );
}

