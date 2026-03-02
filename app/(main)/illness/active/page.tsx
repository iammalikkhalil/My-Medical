"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/client";

type ActiveEpisode = {
  _id: string;
  name: string;
  startDate: string;
  dayNumber: number;
  symptoms: Array<{ _id: string; name: string }>;
  doses: Array<{ _id: string; medicineName: string; takenAt: string; amount: number; unit: string; isFromKit: boolean }>;
};

type Medicine = { _id: string; name: string; quantity: number; unit: string };

export default function IllnessActivePage() {
  const router = useRouter();
  const [episode, setEpisode] = useState<ActiveEpisode | null>(null);
  const [kitMedicines, setKitMedicines] = useState<Medicine[]>([]);
  const [externalForm, setExternalForm] = useState({ medicineName: "", amount: 1, unit: "tablet", notes: "" });
  const [error, setError] = useState("");

  const symptomId = episode?.symptoms?.[0]?._id;

  async function load() {
    try {
      const active = await apiFetch<ActiveEpisode | null>("/api/episodes/active");
      setEpisode(active);

      if (active?.symptoms?.length) {
        const medicines = await apiFetch<Medicine[]>(`/api/medicines?symptomId=${active.symptoms[0]._id}`);
        setKitMedicines(medicines);
      }
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void load();
  }, [symptomId]);

  const groupedDoses = useMemo(() => {
    if (!episode) return {} as Record<string, ActiveEpisode["doses"]>;

    return episode.doses.reduce<Record<string, ActiveEpisode["doses"]>>((acc, dose) => {
      const key = new Date(dose.takenAt).toDateString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(dose);
      return acc;
    }, {});
  }, [episode]);

  async function logKitDose(medicineId: string) {
    if (!episode) return;

    try {
      const payload = await apiFetch<{ requiresConfirmation: boolean; warning?: string }>(
        `/api/episodes/${episode._id}/log-dose`,
        {
          method: "POST",
          body: JSON.stringify({ medicineId, medicineName: "", isFromKit: true, amount: 1, unit: "tablet" }),
        },
      );

      if (payload.requiresConfirmation && payload.warning) {
        const proceed = confirm(`${payload.warning} Take anyway?`);
        if (proceed) {
          await apiFetch(`/api/episodes/${episode._id}/log-dose`, {
            method: "POST",
            body: JSON.stringify({
              medicineId,
              medicineName: "",
              isFromKit: true,
              amount: 1,
              unit: "tablet",
              overrideIntervalWarning: true,
            }),
          });
        }
      }

      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function logExternalDose(event: React.FormEvent) {
    event.preventDefault();
    if (!episode) return;

    try {
      await apiFetch(`/api/episodes/${episode._id}/log-dose`, {
        method: "POST",
        body: JSON.stringify({ ...externalForm, isFromKit: false }),
      });
      setExternalForm({ medicineName: "", amount: 1, unit: "tablet", notes: "" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function closeEpisode(effectiveness: "recovered" | "partial" | "worsened") {
    if (!episode) return;

    try {
      await apiFetch(`/api/episodes/${episode._id}/recover`, {
        method: "POST",
        body: JSON.stringify({ overallEffectiveness: effectiveness }),
      });
      router.push(`/illness/${episode._id}`);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!episode) {
    return <Card>{error || "No active illness episode."}</Card>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-3xl font-bold">{episode.name}</h1>
        <p className="text-sm">Day {episode.dayNumber} · Started {new Date(episode.startDate).toLocaleDateString()}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link href="/blogs">
            <Button variant="ghost">Read Guide</Button>
          </Link>
          <Button variant="secondary" onClick={() => closeEpisode("recovered")}>
            I&apos;m Better
          </Button>
        </div>
      </Card>

      {error ? <Card className="text-[var(--color-danger)]">{error}</Card> : null}

      <Card>
        <h2 className="mb-2 text-xl font-semibold">Medicines Taken</h2>
        {Object.keys(groupedDoses).length ? (
          Object.entries(groupedDoses).map(([date, doses]) => (
            <div key={date} className="mb-3">
              <p className="font-semibold">{date}</p>
              <ul className="space-y-1">
                {doses.map((dose) => (
                  <li key={dose._id} className="text-sm">
                    {dose.isFromKit ? "[Kit]" : "[External]"} {dose.medicineName} · {new Date(dose.takenAt).toLocaleTimeString()} · {dose.amount} {dose.unit}
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-sm text-zinc-600">No doses logged yet.</p>
        )}
      </Card>

      <Card>
        <h2 className="mb-2 text-xl font-semibold">From My Kit</h2>
        <div className="space-y-2">
          {kitMedicines.map((medicine) => (
            <div key={medicine._id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-semibold">{medicine.name}</p>
                <p className="text-sm">{medicine.quantity} left</p>
              </div>
              <Button onClick={() => logKitDose(medicine._id)}>Take 1 dose</Button>
            </div>
          ))}
          {!kitMedicines.length ? <p className="text-sm text-zinc-600">No matching kit medicines found.</p> : null}
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-xl font-semibold">External Medicine</h2>
        <form className="grid gap-2 md:grid-cols-2" onSubmit={logExternalDose}>
          <Input
            placeholder="Medicine name"
            value={externalForm.medicineName}
            onChange={(e) => setExternalForm((prev) => ({ ...prev, medicineName: e.target.value }))}
            required
            className="md:col-span-2"
          />
          <Input
            type="number"
            min={0.1}
            step={0.1}
            value={externalForm.amount}
            onChange={(e) => setExternalForm((prev) => ({ ...prev, amount: Number(e.target.value) }))}
            required
          />
          <Input value={externalForm.unit} onChange={(e) => setExternalForm((prev) => ({ ...prev, unit: e.target.value }))} required />
          <Input
            placeholder="Notes"
            value={externalForm.notes}
            onChange={(e) => setExternalForm((prev) => ({ ...prev, notes: e.target.value }))}
            className="md:col-span-2"
          />
          <Button type="submit" className="md:col-span-2">
            Log This Dose
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-2 text-xl font-semibold">I&apos;m Feeling Better</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => closeEpisode("recovered")}>Fully Recovered</Button>
          <Button variant="ghost" onClick={() => closeEpisode("partial")}>Partial Recovery</Button>
          <Button variant="danger" onClick={() => closeEpisode("worsened")}>Got Worse</Button>
        </div>
      </Card>
    </div>
  );
}

