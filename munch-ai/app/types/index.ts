// Ingredient type for inventory management
export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string; // "g", "ml", "piece", "cup", etc.
  category: "produce" | "dairy" | "meat" | "pantry" | "frozen" | "other";
  expirationDate: string; // ISO date
  dateAdded: string; // ISO date
  imageUrl?: string;
}

// Recipe type
export interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number;
  prepTime: number; // minutes
  cookTime: number; // minutes
  difficulty: "easy" | "medium" | "hard";
  ingredients: RecipeIngredient[];
  instructions: string[];
  tags: string[]; // "vegan", "gluten-free", etc.
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  imageUrl?: string;
  featured?: boolean;
  source: "ai-generated" | "verified";
  rating?: number; // 0-5
  userRating?: number; // current user's rating
  saved: boolean;
}

// Recipe ingredient (used in recipes)
export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
  substitutions?: string[];
}

// User profile
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dietaryRestrictions: string[]; // "vegan", "gluten-free", "nut-free", etc.
  allergies: string[];
  cuisinePreferences: string[]; // "Italian", "Asian", etc.
  createdAt: string;
  updatedAt: string;
}

// Saved recipe
export interface SavedRecipe extends Recipe {
  savedAt: string;
  notes?: string;
}

// Meal plan entry
export interface MealPlanEntry {
  id: string;
  recipeId: string;
  recipe: Recipe;
  date: string; // ISO date
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
}
