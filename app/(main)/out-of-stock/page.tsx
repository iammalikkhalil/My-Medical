"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/client";

type Medicine = {
  _id: string;
  name: string;
  quantity: number;
  defaultQuantity: number;
  unit: string;
  categoryId: string;
};

type Category = { _id: string; name: string };

export default function OutOfStockPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [medicineData, categoryData] = await Promise.all([
        apiFetch<Medicine[]>("/api/medicines/low-stock"),
        apiFetch<Category[]>("/api/categories"),
      ]);
      setMedicines(medicineData);
      setCategories(categoryData);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const categoryMap = new Map(categories.map((category) => [category._id, category.name]));

  async function markRestocked(medicineId: string) {
    try {
      await apiFetch("/api/medicines/restock", {
        method: "POST",
        body: JSON.stringify({ medicineId }),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function markAllBought() {
    try {
      const categoriesToRestock = Array.from(new Set(medicines.map((medicine) => medicine.categoryId)));
      await Promise.all(
        categoriesToRestock.map((categoryId) =>
          apiFetch("/api/medicines/restock", {
            method: "POST",
            body: JSON.stringify({ categoryId }),
          }),
        ),
      );
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Need To Buy</h1>
      {error ? <Card className="text-[var(--color-danger)]">{error}</Card> : null}

      <Card>
        <ul className="space-y-2">
          {medicines.map((medicine) => (
            <li key={medicine._id} className="rounded-lg border p-3">
              <p className="font-semibold">{medicine.name}</p>
              <p className="text-sm text-zinc-600">
                {categoryMap.get(medicine.categoryId)} · {medicine.quantity <= 0 ? "OUT" : `${medicine.quantity} left`}
              </p>
              <Button className="mt-2" onClick={() => markRestocked(medicine._id)}>
                Mark Restocked ({medicine.defaultQuantity} {medicine.unit})
              </Button>
            </li>
          ))}
          {!medicines.length ? <li className="text-sm text-zinc-600">Everything is stocked.</li> : null}
        </ul>
      </Card>

      <Button onClick={markAllBought} variant="secondary">
        Mark All Bought
      </Button>
    </div>
  );
}

