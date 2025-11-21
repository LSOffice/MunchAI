import { Schema, model, models } from "mongoose";

export interface IRecipeNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface IRecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
  substitutions?: string[];
}

export interface IRecipe {
  title: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: "easy" | "medium" | "hard";
  ingredients: IRecipeIngredient[];
  instructions: string[];
  tags: string[];
  mealTypes: ("breakfast" | "lunch" | "dinner" | "snacks")[];
  nutrition?: IRecipeNutrition;
  imageUrl?: string;
  featured?: boolean;
  source: "ai-generated" | "verified";
  rating?: number;
}

const RecipeIngredientSchema = new Schema<IRecipeIngredient>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    optional: { type: Boolean, default: false },
    substitutions: { type: [String], default: [] },
  },
  { _id: false },
);

const NutritionSchema = new Schema<IRecipeNutrition>(
  {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
  },
  { _id: false },
);

const RecipeSchema = new Schema<IRecipe>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    servings: { type: Number, default: 2 },
    prepTime: { type: Number, default: 0 },
    cookTime: { type: Number, default: 0 },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    ingredients: { type: [RecipeIngredientSchema], default: [] },
    instructions: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    mealTypes: {
      type: [String],
      enum: ["breakfast", "lunch", "dinner", "snacks"],
      default: [],
    },
    nutrition: { type: NutritionSchema, required: false },
    imageUrl: { type: String },
    featured: { type: Boolean, default: false },
    source: {
      type: String,
      enum: ["ai-generated", "verified"],
      default: "ai-generated",
    },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default models.Recipe || model<IRecipe>("Recipe", RecipeSchema);
