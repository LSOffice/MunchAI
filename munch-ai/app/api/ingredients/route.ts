import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateRequest,
  APIError,
} from "@/lib/utils";
import { connectMongo } from "@/lib/mongodb";
import IngredientModel from "@/models/Ingredient";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    validateRequest("GET", ["GET", "POST"]);
    const session = (await auth()) as any;
    const userId = session?.user?.id as string | undefined;
    if (!userId) {
      return errorResponse(new APIError(401, "Unauthorized", "UNAUTHORIZED"));
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    await connectMongo();
    const query: any = { userId };
    if (category) query.category = category;
    const docs = await IngredientModel.find(query).lean();

    const results = docs.map((d) => ({
      id: String(d._id),
      name: d.name,
      quantity: d.quantity,
      unit: d.unit,
      category: d.category,
      expirationDate: d.expirationDate.toISOString(),
      dateAdded: d.dateAdded.toISOString(),
      imageUrl: d.imageUrl,
    }));

    return successResponse(results);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    validateRequest("POST", ["GET", "POST"]);
    const session = (await auth()) as any;
    const userId = session?.user?.id as string | undefined;
    if (!userId) {
      throw new APIError(401, "Unauthorized", "UNAUTHORIZED");
    }

    const body = await request.json();

    if (!body.name || body.quantity == null || !body.unit) {
      throw new APIError(400, "Missing required fields", "INVALID_REQUEST");
    }

    await connectMongo();
    const doc = await IngredientModel.create({
      userId,
      name: body.name,
      quantity: body.quantity,
      unit: body.unit,
      category: body.category || "other",
      expirationDate: body.expirationDate
        ? new Date(body.expirationDate)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      dateAdded: new Date(),
      imageUrl: body.imageUrl,
    });

    const ingredient = {
      id: String(doc._id),
      name: doc.name,
      quantity: doc.quantity,
      unit: doc.unit,
      category: doc.category,
      expirationDate: doc.expirationDate.toISOString(),
      dateAdded: doc.dateAdded.toISOString(),
      imageUrl: doc.imageUrl,
    };
    return successResponse(ingredient, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
