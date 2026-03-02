"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/client";

type Symptom = {
  _id: string;
  name: string;
  emoji: string;
  isCommon: boolean;
};

type Suggestion = { _id: string; name: string; quantity: number };
type BlogSuggestion = { _id: string; title: string; slug: string };

export default function IllnessStartPage() {
  const router = useRouter();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [allSymptomsQuery, setAllSymptomsQuery] = useState("");
  const [blogSuggestions, setBlogSuggestions] = useState<BlogSuggestion[]>([]);
  const [medicineSuggestions, setMedicineSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiFetch<Symptom[]>("/api/symptoms")
      .then(setSymptoms)
      .catch((e) => setError((e as Error).message));
  }, []);

  const commonSymptoms = useMemo(() => symptoms.filter((symptom) => symptom.isCommon), [symptoms]);
  const filteredSymptoms = useMemo(() => {
    const q = allSymptomsQuery.trim().toLowerCase();
    if (!q) return symptoms;
    return symptoms.filter((symptom) => symptom.name.toLowerCase().includes(q));
  }, [symptoms, allSymptomsQuery]);

  useEffect(() => {
    const selectedNames = symptoms
      .filter((symptom) => selected.includes(symptom._id))
      .map((symptom) => symptom.name);

    setName(selectedNames.join(" & "));

    if (!selected.length) {
      setBlogSuggestions([]);
      setMedicineSuggestions([]);
      return;
    }

    const symptomId = selected[0];

    void Promise.all([
      apiFetch<BlogSuggestion[]>("/api/blogs"),
      apiFetch<Suggestion[]>(`/api/medicines?symptomId=${symptomId}`),
    ])
      .then(([blogs, medicines]) => {
        setBlogSuggestions(blogs.slice(0, 3));
        setMedicineSuggestions(medicines.slice(0, 6));
      })
      .catch((e) => setError((e as Error).message));
  }, [selected, symptoms]);

  function toggleSymptom(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function startIllness() {
    if (!selected.length) {
      setError("Select at least one symptom");
      return;
    }

    try {
      const episode = await apiFetch<{ _id: string }>("/api/episodes", {
        method: "POST",
        body: JSON.stringify({
          name: name || "Illness",
          symptomIds: selected,
          blogId: blogSuggestions[0]?._id,
          notes,
        }),
      });
      router.push(`/illness/active?id=${episode._id}`);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">How are you feeling today?</h1>
      {error ? <Card className="text-[var(--color-danger)]">{error}</Card> : null}

      <Card>
        <h2 className="mb-2 text-xl font-semibold">Common Symptoms</h2>
        <div className="grid gap-2 md:grid-cols-3">
          {commonSymptoms.map((symptom) => {
            const isSelected = selected.includes(symptom._id);
            return (
              <button
                type="button"
                key={symptom._id}
                onClick={() => toggleSymptom(symptom._id)}
                className={`min-h-11 rounded-xl border px-3 text-left ${
                  isSelected ? "border-transparent bg-[var(--color-primary)]" : "border-[var(--color-border)] bg-white"
                }`}
              >
                {symptom.emoji} {symptom.name}
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-xl font-semibold">Show all symptoms</h2>
        <Input
          value={allSymptomsQuery}
          onChange={(e) => setAllSymptomsQuery(e.target.value)}
          placeholder="Search all symptoms"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {filteredSymptoms.slice(0, 30).map((symptom) => {
            const isSelected = selected.includes(symptom._id);
            return (
              <button
                type="button"
                key={symptom._id}
                onClick={() => toggleSymptom(symptom._id)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  isSelected ? "border-transparent bg-[var(--color-primary)]" : "border-[var(--color-border)] bg-white"
                }`}
              >
                {symptom.emoji} {symptom.name}
              </button>
            );
          })}
        </div>
      </Card>

      {!!selected.length && (
        <Card>
          <h2 className="mb-2 text-xl font-semibold">Based on your symptoms</h2>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Suggested illness name" />
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes"
            className="mt-2"
          />

          <div className="mt-3">
            <p className="text-sm font-medium">Recommended guide:</p>
            {blogSuggestions.length ? (
              <ul className="mt-1 space-y-1">
                {blogSuggestions.map((blog) => (
                  <li key={blog._id} className="text-sm">
                    {blog.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-600">No matching guide found yet.</p>
            )}
          </div>

          <div className="mt-3">
            <p className="text-sm font-medium">Medicines in your kit for these symptoms:</p>
            {medicineSuggestions.length ? (
              <ul className="mt-1 space-y-1">
                {medicineSuggestions.map((medicine) => (
                  <li key={medicine._id} className="text-sm">
                    {medicine.name} - {medicine.quantity} left
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-600">No matching medicine found.</p>
            )}
          </div>

          <Button className="mt-3" onClick={startIllness}>
            Start Illness Log
          </Button>
        </Card>
      )}
    </div>
  );
}

