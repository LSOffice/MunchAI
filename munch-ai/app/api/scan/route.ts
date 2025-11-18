import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateRequest,
  APIError,
} from "@/lib/utils";
import { Ingredient } from "@/app/types";

export async function POST(request: NextRequest) {
  try {
    validateRequest("POST", ["POST"]);

    const body = await request.json();

    if (!body.receipt && !body.ingredients) {
      throw new APIError(
        400,
        "Either receipt (image) or ingredients must be provided",
        "INVALID_REQUEST",
      );
    }

    // Mock OCR processing - in production, integrate with Google Vision, AWS Textract, etc.
    let extractedIngredients: Ingredient[] = [];

    if (body.receipt) {
      // TODO: Implement actual OCR processing
      // For now, return mock data
      extractedIngredients = [
        {
          id: Date.now().toString(),
          name: "Tomatoes",
          quantity: 4,
          unit: "piece",
          category: "produce",
          expirationDate: new Date(
            Date.now() + 5 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          dateAdded: new Date().toISOString(),
        },
        {
          id: (Date.now() + 1).toString(),
          name: "Spinach",
          quantity: 1,
          unit: "bunch",
          category: "produce",
          expirationDate: new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          dateAdded: new Date().toISOString(),
        },
        {
          id: (Date.now() + 2).toString(),
          name: "Milk",
          quantity: 1,
          unit: "liter",
          category: "dairy",
          expirationDate: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          dateAdded: new Date().toISOString(),
        },
      ];
    } else if (body.ingredients) {
      extractedIngredients = body.ingredients;
    }

    return successResponse(extractedIngredients, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
