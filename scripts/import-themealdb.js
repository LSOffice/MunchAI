const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/munchAI";
const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

console.log("Connecting to:", MONGODB_URI.substring(0, 50) + "...");

// Define RecipeSchema
const RecipeIngredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    optional: { type: Boolean, default: false },
    substitutions: { type: [String], default: [] },
  },
  { _id: false },
);

const NutritionSchema = new mongoose.Schema(
  {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
  },
  { _id: false },
);

const RecipeSchema = new mongoose.Schema(
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

const Recipe = mongoose.model("Recipe", RecipeSchema);

// Utility function to parse cooking time from instructions
function estimateCookingTime(instructions) {
  if (!instructions) return 30;
  const text = instructions.toLowerCase();
  if (text.includes("bake")) {
    const match = text.match(/bake\s+(?:for\s+)?(\d+)\s*(?:minutes?|mins?)/i);
    if (match) return parseInt(match[1]);
  }
  if (text.includes("simmer")) {
    const match = text.match(/simmer\s+(?:for\s+)?(\d+)\s*(?:minutes?|mins?)/i);
    if (match) return parseInt(match[1]);
  }
  if (text.includes("cook")) {
    const match = text.match(/cook\s+(?:for\s+)?(\d+)\s*(?:minutes?|mins?)/i);
    if (match) return parseInt(match[1]);
  }
  return 30; // Default to 30 minutes
}

// Classify difficulty based on ingredient count and instructions
function classifyDifficulty(ingredientCount, instructions) {
  if (ingredientCount <= 5) return "easy";
  if (ingredientCount <= 10) return "medium";
  return "hard";
}

// Classify meal type based on category and name
function classifyMealType(category, mealName) {
  const mealTypes = [];
  const name = mealName.toLowerCase();
  const cat = category.toLowerCase();

  if (
    name.includes("breakfast") ||
    name.includes("pancake") ||
    name.includes("waffle") ||
    name.includes("omelette") ||
    name.includes("egg") ||
    name.includes("toast") ||
    name.includes("cereal") ||
    name.includes("smoothie") ||
    name.includes("yogurt")
  ) {
    mealTypes.push("breakfast");
  }

  if (
    name.includes("lunch") ||
    name.includes("sandwich") ||
    name.includes("wrap") ||
    name.includes("salad") ||
    name.includes("burger") ||
    name.includes("pita")
  ) {
    mealTypes.push("lunch");
  }

  if (
    name.includes("dinner") ||
    cat.includes("seafood") ||
    cat.includes("beef") ||
    cat.includes("chicken") ||
    cat.includes("pasta") ||
    cat.includes("meat") ||
    name.includes("steak") ||
    name.includes("curry") ||
    name.includes("soup")
  ) {
    mealTypes.push("dinner");
  }

  if (
    name.includes("snack") ||
    name.includes("chip") ||
    name.includes("dip") ||
    name.includes("bar") ||
    name.includes("dessert") ||
    name.includes("cake") ||
    name.includes("cookie") ||
    name.includes("brownie") ||
    name.includes("donut") ||
    name.includes("pastry") ||
    name.includes("ice cream") ||
    name.includes("pudding") ||
    name.includes("mousse") ||
    name.includes("tart") ||
    name.includes("pie") ||
    cat.includes("dessert")
  ) {
    mealTypes.push("snacks");
  }

  // If no meal type classified, use category
  if (mealTypes.length === 0) {
    if (cat.includes("seafood") || cat.includes("chicken")) {
      mealTypes.push("dinner");
    } else if (cat.includes("vegetarian") || cat.includes("vegan")) {
      mealTypes.push("lunch", "dinner");
    } else if (cat.includes("dessert")) {
      mealTypes.push("snacks");
    } else {
      mealTypes.push("dinner");
    }
  }

  return [...new Set(mealTypes)]; // Remove duplicates
}

// Parse ingredients from TheMealDB format
function parseIngredients(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (ingredient && ingredient.trim()) {
      // Parse quantity and unit from measure
      const measureStr = (measure || "1").trim();
      const match = measureStr.match(/^([\d.]+)\s*(.*?)$/);
      const quantity = match ? parseFloat(match[1]) : 1;
      const unit = match ? match[2] || "unit" : "unit";

      ingredients.push({
        name: ingredient.toLowerCase().trim(),
        quantity: quantity,
        unit: unit || "unit",
        optional: false,
      });
    }
  }
  return ingredients;
}

// Parse instructions from TheMealDB format
function parseInstructions(instructions) {
  if (!instructions) return [];
  return instructions
    .split("\r\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => line.trim());
}

// Fetch meal details from TheMealDB
async function fetchMealDetails(mealId) {
  try {
    const response = await fetch(`${BASE_URL}/lookup.php?i=${mealId}`);
    const data = await response.json();
    if (data.meals && data.meals.length > 0) {
      return data.meals[0];
    }
    return null;
  } catch (error) {
    console.error(`Error fetching meal ${mealId}:`, error.message);
    return null;
  }
}

// Fetch meals by first letter
async function fetchMealsByLetter(letter) {
  try {
    const response = await fetch(`${BASE_URL}/search.php?f=${letter}`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error(`Error fetching meals for letter ${letter}:`, error.message);
    return [];
  }
}

// Convert TheMealDB format to our Recipe format
async function convertToRecipe(mealData) {
  const instructions = parseInstructions(mealData.strInstructions);
  const ingredients = parseIngredients(mealData);

  return {
    title: mealData.strMeal,
    description: mealData.strArea || "International cuisine",
    servings: 2,
    prepTime: 15, // Default, as TheMealDB doesn't provide this
    cookTime: estimateCookingTime(mealData.strInstructions),
    difficulty: classifyDifficulty(
      ingredients.length,
      mealData.strInstructions,
    ),
    ingredients: ingredients,
    instructions: instructions,
    tags: [
      mealData.strCategory ? mealData.strCategory.toLowerCase() : "general",
      mealData.strArea ? mealData.strArea.toLowerCase() : "international",
      ...(mealData.strTags
        ? mealData.strTags.split(",").map((t) => t.trim())
        : []),
    ],
    mealTypes: classifyMealType(mealData.strCategory, mealData.strMeal),
    imageUrl: mealData.strMealThumb,
    featured: false,
    source: "verified",
    rating: 4 + Math.random() * 1, // Random rating between 4-5
  };
}

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

async function importRecipes() {
  try {
    await connectDB();

    // Clear existing recipes
    console.log("🗑️  Clearing existing recipes...");
    const deleteResult = await Recipe.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing recipes\n`);

    const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    let totalRecipes = 0;
    let successCount = 0;
    let errorCount = 0;

    console.log("🍳 Starting to import recipes from TheMealDB...\n");

    for (const letter of alphabet) {
      console.log(
        `📖 Fetching meals starting with '${letter.toUpperCase()}'...`,
      );
      const mealsPreview = await fetchMealsByLetter(letter);

      if (!mealsPreview || mealsPreview.length === 0) {
        console.log(`   ⚠️  No meals found for letter '${letter}'`);
        continue;
      }

      console.log(`   Found ${mealsPreview.length} meals`);
      const mealIds = mealsPreview.map((meal) => meal.idMeal);

      for (const mealId of mealIds) {
        try {
          console.log(`   ⏳ Fetching details for meal ${mealId}...`);
          const mealData = await fetchMealDetails(mealId);

          if (!mealData) {
            console.log(`   ❌ Failed to get details for meal ${mealId}`);
            errorCount++;
            continue;
          }

          const recipe = await convertToRecipe(mealData);

          // Check if recipe already exists (by title)
          const existingRecipe = await Recipe.findOne({
            title: recipe.title,
          });
          if (existingRecipe) {
            console.log(`   ⏭️  Skipping duplicate: ${recipe.title}`);
            continue;
          }

          // Insert recipe
          await Recipe.create(recipe);
          console.log(`   ✅ Imported: ${recipe.title}`);
          successCount++;
          totalRecipes++;

          // Add a small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`   ❌ Error importing meal ${mealId}:`, error.message);
          errorCount++;
        }
      }
    }

    console.log("\n🎉 Import complete!");
    console.log(`   ✅ Successfully imported: ${successCount} recipes`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total new recipes in database: ${totalRecipes}`);
  } catch (error) {
    console.error("❌ Error during import:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ MongoDB connection closed");
  }
}

importRecipes();
