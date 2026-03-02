"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/client";

type Symptom = {
  _id: string;
  name: string;
  slug: string;
  emoji: string;
  description: string;
  isCommon: boolean;
  sortOrder: number;
};

export default function SymptomsManagePage() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("??");
  const [description, setDescription] = useState("");
  const [isCommon, setIsCommon] = useState(true);
  const [sortOrder, setSortOrder] = useState(1);
  const [error, setError] = useState("");

  async function load() {
    try {
      setSymptoms(await apiFetch<Symptom[]>("/api/symptoms"));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createSymptom(event: React.FormEvent) {
    event.preventDefault();
    try {
      await apiFetch<Symptom>("/api/symptoms", {
        method: "POST",
        body: JSON.stringify({ name, emoji, description, isCommon, sortOrder }),
      });
      setName("");
      setDescription("");
      setSortOrder(1);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function toggleCommon(symptom: Symptom) {
    try {
      await apiFetch(`/api/symptoms/${symptom._id}`, {
        method: "PUT",
        body: JSON.stringify({ isCommon: !symptom.isCommon }),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Manage Symptoms</h1>
      {error ? <Card className="text-[var(--color-danger)]">{error}</Card> : null}

      <Card>
        <h2 className="mb-2 text-xl font-semibold">Add New Symptom</h2>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={createSymptom}>
          <Input placeholder="Symptom name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input placeholder="Emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} required />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="md:col-span-2"
          />
          <Input
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isCommon} onChange={(e) => setIsCommon(e.target.checked)} />
            Show in quick grid
          </label>
          <Button type="submit" className="md:col-span-2">
            Save Symptom
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-2 text-xl font-semibold">Common Symptoms</h2>
        <ul className="space-y-2">
          {symptoms
            .filter((symptom) => symptom.isCommon)
            .map((symptom) => (
              <li key={symptom._id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-semibold">
                    {symptom.emoji} {symptom.name}
                  </p>
                  <p className="text-xs text-zinc-600">slug: {symptom.slug}</p>
                </div>
                <Button variant="ghost" onClick={() => toggleCommon(symptom)}>
                  Remove from grid
                </Button>
              </li>
            ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-2 text-xl font-semibold">All Other Symptoms</h2>
        <ul className="space-y-2">
          {symptoms
            .filter((symptom) => !symptom.isCommon)
            .map((symptom) => (
              <li key={symptom._id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-semibold">
                    {symptom.emoji} {symptom.name}
                  </p>
                  <p className="text-xs text-zinc-600">slug: {symptom.slug}</p>
                </div>
                <Button variant="ghost" onClick={() => toggleCommon(symptom)}>
                  Add to grid
                </Button>
              </li>
            ))}
        </ul>
      </Card>
    </div>
  );
}

