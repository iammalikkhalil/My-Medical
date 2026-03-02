"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/client";

type Symptom = {
  _id: string;
  name: string;
  slug: string;
  emoji: string;
  description: string;
};

export default function SymptomSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Symptom[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      void apiFetch<Symptom[]>(`/api/symptoms/search?q=${encodeURIComponent(query)}`)
        .then((data) => {
          setResults(data);
          setError("");
        })
        .catch((e) => setError((e as Error).message));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Symptom Search</h1>
      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search symptoms" />
      {error ? <Card className="text-[var(--color-danger)]">{error}</Card> : null}

      <Card>
        <ul className="space-y-3">
          {results.map((symptom) => (
            <li key={symptom._id} className="rounded-lg border p-3">
              <p className="font-semibold">
                {symptom.emoji} {symptom.name}
              </p>
              <p className="text-sm text-zinc-600">{symptom.description || "No description"}</p>
            </li>
          ))}
          {!results.length ? <li className="text-sm text-zinc-600">No symptoms found.</li> : null}
        </ul>
      </Card>
    </div>
  );
}

