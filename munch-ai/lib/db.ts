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
    title: "Spaghetti Bolognese",
    description: "A classic Italian pasta dish with rich meat sauce.",
    servings: 4,
    prepTime: 15,
    cookTime: 30,
    difficulty: "medium",
    ingredients: [],
    instructions: [],
    tags: ["italian", "pasta"],
    imageUrl:
      "https://images.unsplash.com/photo-1604908177522-9b8c8983f3f7?auto=format&fit=crop&w=1200&q=80",
    source: "verified",
    featured: true,
    saved: false,
  },
  {
    id: "2",
    title: "Vegan Buddha Bowl",
    description: "A healthy and colorful bowl of veggies and grains.",
    servings: 2,
    prepTime: 10,
    cookTime: 0,
    difficulty: "easy",
    ingredients: [],
    instructions: [],
    tags: ["vegan", "healthy"],
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
    source: "verified",
    featured: true,
    saved: false,
  },
  {
    id: "3",
    title: "Chicken Curry",
    description: "A flavorful curry with tender chicken pieces.",
    servings: 4,
    prepTime: 20,
    cookTime: 40,
    difficulty: "medium",
    ingredients: [],
    instructions: [],
    tags: ["indian", "spicy"],
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    source: "verified",
    featured: true,
    saved: false,
  },
  {
    id: "4",
    title: "Pan-Seared Salmon",
    description: "Simple pan-seared salmon with lemon and herbs.",
    servings: 2,
    prepTime: 10,
    cookTime: 12,
    difficulty: "easy",
    ingredients: [],
    instructions: [],
    tags: ["seafood", "quick"],
    imageUrl:
      "https://images.unsplash.com/photo-1514512364185-0b2b91f0b1b9?auto=format&fit=crop&w=1200&q=80",
    source: "ai-generated",
    featured: false,
    saved: false,
  },
  {
    id: "5",
    title: "Shakshuka",
    description:
      "Eggs poached in a spicy tomato sauce, great for breakfast or dinner.",
    servings: 2,
    prepTime: 8,
    cookTime: 20,
    difficulty: "easy",
    ingredients: [],
    instructions: [],
    tags: ["breakfast", "vegetarian"],
    imageUrl:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
    source: "verified",
    featured: false,
    saved: false,
  },
  {
    id: "6",
    title: "Beef Stir Fry",
    description: "Quick beef stir fry with vegetables and soy sauce.",
    servings: 3,
    prepTime: 15,
    cookTime: 10,
    difficulty: "medium",
    ingredients: [],
    instructions: [],
    tags: ["asian", "quick"],
    imageUrl:
      "https://images.unsplash.com/photo-1512058564366-c9e3b8c3f5d6?auto=format&fit=crop&w=1200&q=80",
    source: "ai-generated",
    featured: false,
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
