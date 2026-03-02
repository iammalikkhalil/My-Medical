import { NextRequest } from "next/server";

import { ok, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import { requireApiAuth } from "@/lib/route-helpers";
import { slugify } from "@/lib/slug";
import { parseBody, categorySchema } from "@/lib/validators";
import { Category } from "@/models/Category";

export async function GET() {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    return ok(categories);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiAuth();
    if (!auth.ok) return auth.response;

    await connectToDatabase();
    const input = await parseBody(request, categorySchema);

    const category = await Category.create({
      name: input.name,
      slug: input.slug ? slugify(input.slug) : slugify(input.name),
      emoji: input.emoji,
      description: input.description,
      sortOrder: input.sortOrder,
      isActive: true,
    });

    return ok(category, 201);
  } catch (error) {
    return serverError(error);
  }
}


