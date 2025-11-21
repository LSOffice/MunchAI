import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  validateRequest,
  APIError,
} from "@/lib/utils";
import { Ingredient } from "@/app/types";
import { extractTextFromImage } from "@/lib/ocr";
import { parseReceiptText } from "@/lib/parse-receipt";

interface ExpirationMap {
  [category: string]: number; // days until expiration
}

const categoryExpirationDays: ExpirationMap = {
  vegetables: 7,
  fruits: 5,
  dairy: 14,
  meat: 3,
  grains: 30,
  pantry: 365,
  frozen: 180,
  beverages: 90,
  snacks: 60,
  other: 14,
};

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

    let extractedIngredients: Ingredient[] = [];

    if (body.receipt) {
      // Extract text from receipt image using Google Vision OCR
      const textLines = await extractTextFromImage(body.receipt);

      // Parse extracted text using Claude AI to identify grocery items
      const parsedItems = await parseReceiptText(textLines);

      // Convert parsed items to Ingredient format with estimated expiration dates
      extractedIngredients = parsedItems.map((item, index) => {
        const daysUntilExpiration = categoryExpirationDays[item.category] || 14;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + daysUntilExpiration);

        return {
          id: (Date.now() + index).toString(),
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          expirationDate: expirationDate.toISOString(),
          dateAdded: new Date().toISOString(),
        };
      });
    } else if (body.ingredients) {
      extractedIngredients = body.ingredients;
    }

    return successResponse(extractedIngredients, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
