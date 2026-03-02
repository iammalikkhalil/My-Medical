"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/client";

type Medicine = {
  _id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  isExpired: boolean;
  symptoms: Array<{ _id: string; name: string }>;
  category?: { _id: string; name: string };
};

type Category = { _id: string; name: string };

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([
      apiFetch<Medicine[]>(`/api/medicines${categoryId ? `?categoryId=${categoryId}` : ""}`),
      apiFetch<Category[]>("/api/categories"),
    ])
      .then(([medicineData, categoryData]) => {
        setMedicines(medicineData);
        setCategories(categoryData);
        setError("");
      })
      .catch((e) => setError((e as Error).message));
  }, [categoryId]);

  const expiringSoon = useMemo(
    () => medicines.filter((medicine) => new Date(medicine.expiryDate).getTime() <= Date.now() + 1000 * 60 * 60 * 24 * 30),
    [medicines],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">All Medicines</h1>
        <div className="flex gap-2">
          <Link href="/medicines/add">
            <Button>Add New Medicine</Button>
          </Link>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-xl border border-[var(--color-border)] bg-white px-3"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option value={category._id} key={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <Card className="text-[var(--color-danger)]">{error}</Card> : null}

      {!!expiringSoon.length && (
        <Card>
          <h2 className="mb-2 text-xl font-semibold">Expiring Soon</h2>
          <ul className="space-y-2">
            {expiringSoon.map((medicine) => (
              <li key={medicine._id} className="rounded-lg border p-3">
                <Link href={`/medicines/${medicine._id}`} className="font-semibold underline">
                  {medicine.name}
                </Link>
                <p className="text-sm">Expires {new Date(medicine.expiryDate).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="space-y-4">
        {medicines.map((medicine) => (
          <Card key={medicine._id}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link href={`/medicines/${medicine._id}`} className="text-lg font-semibold underline">
                  {medicine.name}
                </Link>
                <p className="text-sm text-zinc-600">{medicine.category?.name ?? "Uncategorized"}</p>
              </div>
              {medicine.isExpired ? <Badge tone="danger">Expired</Badge> : null}
            </div>
            <p className="mt-2 text-sm">
              {medicine.quantity} {medicine.unit} · Exp {new Date(medicine.expiryDate).toLocaleDateString()}
            </p>
            <p className="mt-1 text-sm text-zinc-700">Symptoms: {medicine.symptoms.map((symptom) => symptom.name).join(" · ") || "None"}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

