import { NextRequest } from "next/server";
import { successResponse, errorResponse, validateRequest } from "@/lib/utils";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    validateRequest("GET", ["GET"]);

    const all = db?.recipes?.getAll ? db.recipes.getAll() : [];
    // If recipes have an explicit `featured` flag, use it. Otherwise, fall back to `source === 'verified'`.
    const featured = all.filter((r: any) =>
      typeof r.featured === "boolean" ? r.featured : r.source === "verified",
    );

    return successResponse(featured);
  } catch (error) {
    return errorResponse(error);
  }
}
