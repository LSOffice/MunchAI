import { Schema, models, model, Types } from "mongoose";
import type { IRecipeIngredient, IRecipeNutrition } from "./Recipe";

export interface ISavedRecipe {
  userId: Types.ObjectId;
  recipeId?: Types.ObjectId; // optional if we snapshot full recipe
  // Snapshot of recipe
  title: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: "easy" | "medium" | "hard";
  ingredients: IRecipeIngredient[];
  instructions: string[];
  tags: string[];
  nutrition?: IRecipeNutrition;
  imageUrl?: string;
  featured?: boolean;
  source: "ai-generated" | "verified";
  rating?: number;
  savedAt: Date;
  notes?: string;
}

const SavedRecipeSchema = new Schema<ISavedRecipe>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    recipeId: { type: Schema.Types.ObjectId, ref: "Recipe" },
    title: String,
    description: String,
    servings: Number,
    prepTime: Number,
    cookTime: Number,
    difficulty: { type: String, enum: ["easy", "medium", "hard"] },
    ingredients: {
      type: [
        new Schema(
          {
            name: String,
            quantity: Number,
            unit: String,
            optional: Boolean,
            substitutions: [String],
          },
          { _id: false },
        ),
      ],
    },
    instructions: [String],
    tags: [String],
    nutrition: {
      type: new Schema(
        { calories: Number, protein: Number, carbs: Number, fat: Number },
        { _id: false },
      ),
    },
    imageUrl: String,
    featured: Boolean,
    source: { type: String, enum: ["ai-generated", "verified"] },
    rating: Number,
    savedAt: { type: Date, default: () => new Date() },
    notes: String,
  },
  { timestamps: false },
);

export default models.SavedRecipe ||
  model<ISavedRecipe>("SavedRecipe", SavedRecipeSchema);
