// This is a mock database layer
// In production, replace with actual database (PostgreSQL, MongoDB, etc.)

import {
  Recipe,
  Ingredient,
  UserProfile,
  SavedRecipe,
  MealPlanEntry,
} from "@/app/types";

// Mock data stores
let recipes: Recipe[] = [
  {
    id: "1",
    title: "Tomato Basil Pasta",
    description: "Fresh pasta with tomatoes, garlic, and basil",
    servings: 2,
    prepTime: 10,
    cookTime: 20,
    difficulty: "easy",
    ingredients: [
      { name: "Pasta", quantity: 200, unit: "g" },
      { name: "Tomatoes", quantity: 3, unit: "piece" },
    ],
    instructions: [],
    tags: ["Italian", "pasta", "vegetarian"],
    source: "verified",
    rating: 4.8,
    saved: false,
  },
];

let ingredients: Ingredient[] = [];
let users: UserProfile[] = [];
let savedRecipes: SavedRecipe[] = [];
let mealPlans: MealPlanEntry[] = [];

export const db = {
  // Recipe operations
  recipes: {
    getAll: () => recipes,
    getById: (id: string) => recipes.find((r) => r.id === id),
    search: (query: string) =>
      recipes.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.description.toLowerCase().includes(query.toLowerCase()),
      ),
    create: (recipe: Recipe) => {
      recipes.push(recipe);
      return recipe;
    },
    update: (id: string, updates: Partial<Recipe>) => {
      const index = recipes.findIndex((r) => r.id === id);
      if (index === -1) return null;
      recipes[index] = { ...recipes[index], ...updates };
      return recipes[index];
    },
    delete: (id: string) => {
      const index = recipes.findIndex((r) => r.id === id);
      if (index === -1) return false;
      recipes.splice(index, 1);
      return true;
    },
  },

  // Ingredient operations
  ingredients: {
    getAll: () => ingredients,
    getById: (id: string) => ingredients.find((i) => i.id === id),
    create: (ingredient: Ingredient) => {
      ingredients.push(ingredient);
      return ingredient;
    },
    update: (id: string, updates: Partial<Ingredient>) => {
      const index = ingredients.findIndex((i) => i.id === id);
      if (index === -1) return null;
      ingredients[index] = { ...ingredients[index], ...updates };
      return ingredients[index];
    },
    delete: (id: string) => {
      const index = ingredients.findIndex((i) => i.id === id);
      if (index === -1) return false;
      ingredients.splice(index, 1);
      return true;
    },
  },

  // User operations
  users: {
    getAll: () => users,
    getById: (id: string) => users.find((u) => u.id === id),
    create: (user: UserProfile) => {
      users.push(user);
      return user;
    },
    update: (id: string, updates: Partial<UserProfile>) => {
      const index = users.findIndex((u) => u.id === id);
      if (index === -1) return null;
      users[index] = { ...users[index], ...updates };
      return users[index];
    },
  },

  // Saved recipes
  savedRecipes: {
    getAll: () => savedRecipes,
    create: (recipe: SavedRecipe) => {
      savedRecipes.push(recipe);
      return recipe;
    },
    delete: (id: string) => {
      const index = savedRecipes.findIndex((r) => r.id === id);
      if (index === -1) return false;
      savedRecipes.splice(index, 1);
      return true;
    },
  },

  // Meal plans
  mealPlans: {
    getAll: () => mealPlans,
    create: (entry: MealPlanEntry) => {
      mealPlans.push(entry);
      return entry;
    },
    delete: (id: string) => {
      const index = mealPlans.findIndex((m) => m.id === id);
      if (index === -1) return false;
      mealPlans.splice(index, 1);
      return true;
    },
  },
};
