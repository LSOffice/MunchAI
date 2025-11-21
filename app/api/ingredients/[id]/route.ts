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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    validateRequest("GET", ["GET", "PATCH", "DELETE"]);
    const session = (await auth()) as any;
    const userId = session?.user?.id as string | undefined;
    if (!userId) {
      throw new APIError(401, "Unauthorized", "UNAUTHORIZED");
    }
    const { id } = await params;
    await connectMongo();
    const doc = (await IngredientModel.findOne({
      _id: id,
      userId,
    }).lean()) as any;
    if (!doc) {
      throw new APIError(404, "Ingredient not found", "NOT_FOUND");
    }
    return successResponse({
      id: String(doc._id),
      name: doc.name,
      quantity: doc.quantity,
      unit: doc.unit,
      category: doc.category,
      expirationDate: doc.expirationDate.toISOString(),
      dateAdded: doc.dateAdded.toISOString(),
      imageUrl: doc.imageUrl,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    validateRequest("PATCH", ["GET", "PATCH", "DELETE"]);
    const session = (await auth()) as any;
    const userId = session?.user?.id as string | undefined;
    if (!userId) {
      throw new APIError(401, "Unauthorized", "UNAUTHORIZED");
    }
    const { id } = await params;
    const body = await request.json();

    await connectMongo();
    const updated = (await IngredientModel.findOneAndUpdate(
      { _id: id, userId },
      body,
      { new: true },
    ).lean()) as any;
    if (!updated) {
      throw new APIError(404, "Ingredient not found", "NOT_FOUND");
    }
    return successResponse({
      id: String(updated._id),
      name: updated.name,
      quantity: updated.quantity,
      unit: updated.unit,
      category: updated.category,
      expirationDate: updated.expirationDate.toISOString(),
      dateAdded: updated.dateAdded.toISOString(),
      imageUrl: updated.imageUrl,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    validateRequest("DELETE", ["GET", "PATCH", "DELETE"]);
    const session = (await auth()) as any;
    const userId = session?.user?.id as string | undefined;
    if (!userId) {
      throw new APIError(401, "Unauthorized", "UNAUTHORIZED");
    }
    const { id } = await params;
    await connectMongo();
    const res = await IngredientModel.findOneAndDelete({ _id: id, userId });
    if (!res) {
      throw new APIError(404, "Ingredient not found", "NOT_FOUND");
    }
    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
