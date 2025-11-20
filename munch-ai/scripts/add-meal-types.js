const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/munchAI";

console.log("Connecting to:", MONGODB_URI.substring(0, 50) + "...");

const RecipeSchema = new mongoose.Schema({
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
  ingredients: { type: Array, default: [] },
  instructions: { type: Array, default: [] },
  tags: { type: Array, default: [] },
  mealTypes: {
    type: [String],
    enum: ["breakfast", "lunch", "dinner", "snacks"],
    default: [],
  },
  nutrition: { type: mongoose.Schema.Types.Mixed },
  imageUrl: { type: String },
  featured: { type: Boolean, default: false },
  source: {
    type: String,
    enum: ["ai-generated", "verified"],
    default: "ai-generated",
  },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date },
  updatedAt: { type: Date },
});

const Recipe = mongoose.model("Recipe", RecipeSchema);

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

function classifyMealType(recipe) {
  const mealTypes = [];
  const title = recipe.title.toLowerCase();
  const description = (recipe.description || "").toLowerCase();
  const ingredients = (recipe.ingredients || [])
    .map((ing) =>
      (typeof ing === "string" ? ing : ing.name || "").toLowerCase(),
    )
    .join(" ");
  const allText = `${title} ${description} ${ingredients}`;

  // Breakfast indicators
  const breakfastKeywords = [
    "pancake",
    "waffle",
    "omelette",
    "egg",
    "bacon",
    "toast",
    "cereal",
    "granola",
    "yogurt",
    "smoothie",
    "breakfast",
    "french toast",
    "hash brown",
    "bagel",
    "muffin",
    "crepe",
  ];

  if (
    breakfastKeywords.some(
      (keyword) =>
        allText.includes(keyword) ||
        recipe.tags?.some((tag) => tag.toLowerCase().includes("breakfast")),
    )
  ) {
    mealTypes.push("breakfast");
  }

  // Lunch indicators
  const lunchKeywords = [
    "sandwich",
    "burger",
    "wrap",
    "salad",
    "pasta",
    "bowl",
    "lunch",
    "rice",
    "noodle",
    "taco",
    "quesadilla",
    "pita",
  ];

  if (
    lunchKeywords.some(
      (keyword) =>
        allText.includes(keyword) ||
        recipe.tags?.some((tag) => tag.toLowerCase().includes("lunch")),
    )
  ) {
    mealTypes.push("lunch");
  }

  // Dinner indicators
  const dinnerKeywords = [
    "steak",
    "chicken",
    "fish",
    "salmon",
    "roast",
    "bake",
    "grill",
    "dinner",
    "beef",
    "pork",
    "curry",
    "stew",
    "soup",
    "casserole",
    "risotto",
  ];

  if (
    dinnerKeywords.some(
      (keyword) =>
        allText.includes(keyword) ||
        recipe.tags?.some((tag) => tag.toLowerCase().includes("dinner")),
    )
  ) {
    mealTypes.push("dinner");
  }

  // Snacks indicators
  const snacksKeywords = [
    "snack",
    "chips",
    "cookie",
    "brownie",
    "trail mix",
    "popcorn",
    "bar",
    "bite",
    "hummus",
    "dip",
    "nuts",
    "fruit",
    "energy ball",
  ];

  if (
    snacksKeywords.some(
      (keyword) =>
        allText.includes(keyword) ||
        recipe.tags?.some((tag) => tag.toLowerCase().includes("snack")),
    )
  ) {
    mealTypes.push("snacks");
  }

  // If no meal type was detected, classify by prep/cook time
  if (mealTypes.length === 0) {
    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

    if (totalTime <= 20) {
      mealTypes.push("snacks");
    } else if (totalTime <= 40) {
      mealTypes.push("lunch");
    } else {
      mealTypes.push("dinner");
    }
  }

  return [...new Set(mealTypes)]; // Remove duplicates
}

async function addMealTypes() {
  try {
    const recipes = await Recipe.find({});
    console.log(`Found ${recipes.length} recipes`);

    if (recipes.length === 0) {
      console.log("No recipes found in database.");
      return;
    }

    let updated = 0;

    for (const recipe of recipes) {
      const mealTypes = classifyMealType(recipe);
      recipe.mealTypes = mealTypes;
      await recipe.save();
      updated++;
      console.log(
        `✓ Updated "${recipe.title}" with meal types: ${mealTypes.join(", ")}`,
      );
    }

    console.log(`\n✅ Successfully updated ${updated} recipes with meal types`);
  } catch (error) {
    console.error("❌ Error updating recipes:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Connection closed");
  }
}

connectDB().then(() => addMealTypes());
