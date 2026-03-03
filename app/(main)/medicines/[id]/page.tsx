"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useGlobalNavigationLoader } from "@/components/navigation/global-navigation-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/client";

type MedicineDetail = {
  _id: string;
  name: string;
  purpose: string;
  dosage: string;
  usageNotes: string;
  doseIntervalHours: number;
  quantity: number;
  unit: string;
  expiryDate: string;
  isExpired: boolean;
  lastDoseTaken?: string;
  category?: { name: string };
  symptoms: Array<{ _id: string; name: string }>;
};

export default function MedicineDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { startNavigation } = useGlobalNavigationLoader();
  const [medicine, setMedicine] = useState<MedicineDetail | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<MedicineDetail>(`/api/medicines/${params.id}`);
      setMedicine(data);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function takeDose() {
    if (!medicine) return;

    try {
      const payload = await apiFetch<{ requiresConfirmation: boolean; warning?: string }>("/api/medicines/take-dose", {
        method: "POST",
        body: JSON.stringify({ medicineId: medicine._id, amount: 1 }),
      });

      if (payload.requiresConfirmation && payload.warning) {
        const proceed = confirm(`${payload.warning} Take anyway?`);
        if (proceed) {
          await apiFetch("/api/medicines/take-dose", {
            method: "POST",
            body: JSON.stringify({ medicineId: medicine._id, amount: 1, overrideIntervalWarning: true }),
          });
        }
      }

      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function restock() {
    if (!medicine) return;

    try {
      await apiFetch("/api/medicines/restock", {
        method: "POST",
        body: JSON.stringify({ medicineId: medicine._id }),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function removeMedicine() {
    if (!medicine) return;

    const proceed = confirm("Delete medicine?");
    if (!proceed) return;

    try {
      await apiFetch(`/api/medicines/${medicine._id}`, { method: "DELETE" });
      startNavigation();
      router.push("/medicines");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <Skeleton className="mb-2 h-9 w-64" />
        <Skeleton className="mb-2 h-4 w-44" />
        <Skeleton className="mb-2 h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </Card>
    );
  }

  if (!medicine) {
    return <Card>{error || "Unable to load medicine."}</Card>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-3xl font-bold">{medicine.name}</h1>
        <p className="text-sm text-zinc-600">Category: {medicine.category?.name ?? "Unknown"}</p>
      </Card>

      {error ? <Card className="text-[var(--color-danger)]">{error}</Card> : null}

      <Card>
        <p>
          <span className="font-semibold">Purpose:</span> {medicine.purpose || "-"}
        </p>
        <p>
          <span className="font-semibold">Dosage:</span> {medicine.dosage || "-"}
        </p>
        <p>
          <span className="font-semibold">Safe Interval:</span> {medicine.doseIntervalHours} hours
        </p>
        <p>
          <span className="font-semibold">Usage Notes:</span> {medicine.usageNotes || "-"}
        </p>
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <Badge tone={medicine.quantity <= 0 ? "danger" : medicine.quantity <= 3 ? "warning" : "success"}>
            {medicine.quantity} {medicine.unit}
          </Badge>
          {medicine.isExpired ? <Badge tone="danger">Expired</Badge> : <Badge tone="success">Valid</Badge>}
        </div>
        <p className="mt-2 text-sm">Expiry: {new Date(medicine.expiryDate).toLocaleDateString()}</p>
      </Card>

      <Card>
        <p className="mb-2 font-semibold">Helps with</p>
        <p className="text-sm">{medicine.symptoms.map((symptom) => symptom.name).join(" · ") || "None"}</p>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button onClick={takeDose}>Take 1 Dose Now</Button>
        <Button onClick={restock} variant="secondary">
          Restock
        </Button>
        <Button onClick={removeMedicine} variant="danger">
          Delete Medicine
        </Button>
      </div>
    </div>
  );
}
