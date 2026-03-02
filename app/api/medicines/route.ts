import { NextRequest } from "next/server";
import { Types } from "mongoose";

import { fail, ok, serverError } from "@/lib/api";
import { linkMedicineSymptoms, refreshMedicineStatus } from "@/lib/medicine";
import { connectToDatabase } from "@/lib/mongodb";
import { getBooleanQuery, requireApiAuth } from "@/lib/route-helpers";
import { parseBody, medicineSchema } from "@/lib/validators";
import { Category, Medicine, MedicineSymptom } from "@/models";

function idFilter(id?: string | null) {
  return id ? new Types.ObjectId(id) : null;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();

    const categoryId = request.nextUrl.searchParams.get("categoryId");
    const symptomId = request.nextUrl.searchParams.get("symptomId");
    const lowStock = getBooleanQuery(request, "lowStock");

    const medicineIdsBySymptom = symptomId
      ? await MedicineSymptom.find({ symptomId: idFilter(symptomId) }).distinct("medicineId")
      : null;

    const medicines = await Medicine.aggregate([
      {
        $match: {
          isActive: true,
          ...(categoryId ? { categoryId: idFilter(categoryId) } : {}),
          ...(lowStock ? { quantity: { $lte: 3 } } : {}),
          ...(medicineIdsBySymptom ? { _id: { $in: medicineIdsBySymptom } } : {}),
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "medicinesymptoms",
          localField: "_id",
          foreignField: "medicineId",
          as: "medicineSymptomLinks",
        },
      },
      {
        $lookup: {
          from: "symptoms",
          localField: "medicineSymptomLinks.symptomId",
          foreignField: "_id",
          as: "symptoms",
        },
      },
      {
        $project: {
          name: 1,
          purpose: 1,
          dosage: 1,
          usageNotes: 1,
          doseIntervalHours: 1,
          quantity: 1,
          defaultQuantity: 1,
          unit: 1,
          expiryDate: 1,
          isExpired: { $lt: ["$expiryDate", new Date()] },
          isQuickAccess: 1,
          usageCount: 1,
          lastUsed: 1,
          category: { $arrayElemAt: ["$category", 0] },
          symptoms: {
            $map: {
              input: "$symptoms",
              as: "symptom",
              in: {
                _id: "$$symptom._id",
                name: "$$symptom.name",
                slug: "$$symptom.slug",
                emoji: "$$symptom.emoji",
              },
            },
          },
        },
      },
      { $sort: { name: 1 } },
    ]);

    return ok(medicines);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const input = await parseBody(request, medicineSchema);

    const categoryExists = await Category.exists({ _id: input.categoryId, isActive: true });
    if (!categoryExists) {
      return fail("Category not found", 404);
    }

    const medicine = await Medicine.create({
      name: input.name,
      categoryId: input.categoryId,
      purpose: input.purpose,
      usageNotes: input.usageNotes,
      dosage: input.dosage,
      doseIntervalHours: input.doseIntervalHours,
      quantity: input.quantity,
      defaultQuantity: input.defaultQuantity,
      unit: input.unit,
      expiryDate: input.expiryDate,
      isExpired: input.expiryDate < new Date(),
      isActive: true,
      isQuickAccess: input.isQuickAccess,
    });

    await linkMedicineSymptoms(String(medicine._id), input.symptomIds);
    await refreshMedicineStatus(medicine._id);

    return ok(medicine, 201);
  } catch (error) {
    return serverError(error);
  }
}

