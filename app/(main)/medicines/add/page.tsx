"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/client";

type Category = { _id: string; name: string };
type Symptom = { _id: string; name: string; emoji: string };

export default function AddMedicinePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    quantity: 10,
    defaultQuantity: 10,
    unit: "tablet",
    dosage: "1 tablet every 6 hours with water",
    doseIntervalHours: 6,
    purpose: "",
    usageNotes: "",
    expiryDate: "",
  });

  useEffect(() => {
    void Promise.all([apiFetch<Category[]>("/api/categories"), apiFetch<Symptom[]>("/api/symptoms")])
      .then(([categoryData, symptomData]) => {
        setCategories(categoryData);
        setSymptoms(symptomData);
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await apiFetch("/api/medicines", {
        method: "POST",
        body: JSON.stringify({ ...form, symptomIds: selectedSymptoms, expiryDate: new Date(form.expiryDate) }),
      });
      router.push("/medicines");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function toggleSymptom(id: string) {
    setSelectedSymptoms((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Add New Medicine</h1>
      {error ? <Card className="text-[var(--color-danger)]">{error}</Card> : null}

      <Card>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
            className="md:col-span-2"
          />

          <select
            required
            value={form.categoryId}
            onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
            className="min-h-11 rounded-xl border border-[var(--color-border)] bg-white px-3"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option value={category._id} key={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <Input value={form.unit} onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))} required />

          <Input
            type="number"
            min={0}
            value={form.defaultQuantity}
            onChange={(e) => setForm((prev) => ({ ...prev, defaultQuantity: Number(e.target.value) }))}
            required
          />

          <Input
            type="number"
            min={0}
            value={form.quantity}
            onChange={(e) => setForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
            required
          />

          <Input
            value={form.dosage}
            onChange={(e) => setForm((prev) => ({ ...prev, dosage: e.target.value }))}
            className="md:col-span-2"
          />

          <Input
            type="number"
            min={1}
            max={48}
            value={form.doseIntervalHours}
            onChange={(e) => setForm((prev) => ({ ...prev, doseIntervalHours: Number(e.target.value) }))}
            required
          />

          <Input
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
            required
          />

          <Input
            placeholder="Purpose"
            value={form.purpose}
            onChange={(e) => setForm((prev) => ({ ...prev, purpose: e.target.value }))}
            className="md:col-span-2"
          />

          <Input
            placeholder="Usage notes"
            value={form.usageNotes}
            onChange={(e) => setForm((prev) => ({ ...prev, usageNotes: e.target.value }))}
            className="md:col-span-2"
          />

          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium">Symptoms this medicine helps:</p>
            <div className="grid gap-2 md:grid-cols-3">
              {symptoms.map((symptom) => {
                const selected = selectedSymptoms.includes(symptom._id);
                return (
                  <button
                    key={symptom._id}
                    type="button"
                    onClick={() => toggleSymptom(symptom._id)}
                    className={`min-h-11 rounded-xl border px-3 text-left text-sm ${
                      selected ? "border-transparent bg-[var(--color-primary)]" : "border-[var(--color-border)] bg-white"
                    }`}
                  >
                    {symptom.emoji} {symptom.name}
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="submit" className="md:col-span-2">
            Save Medicine
          </Button>
        </form>
      </Card>
    </div>
  );
}

