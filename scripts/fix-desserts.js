const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/munchAI";

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

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

async function fixDesserts() {
  try {
    await connectDB();

    // Find all recipes with "Dessert" in tags or name
    const dessertRecipes = await Recipe.find({
      $or: [
        {
          title: {
            $regex:
              "dessert|cake|cookie|brownie|donut|pastry|ice cream|pudding|mousse|tart|pie",
            $options: "i",
          },
        },
        { tags: { $regex: "dessert", $options: "i" } },
      ],
    });

    console.log(`\n🍰 Found ${dessertRecipes.length} dessert recipes to fix\n`);

    let updated = 0;

    for (const recipe of dessertRecipes) {
      const newMealTypes = classifyMealType(
        recipe.tags.join(" "),
        recipe.title,
      );

      // Only update if it doesn't already have "snacks"
      if (!recipe.mealTypes.includes("snacks")) {
        await Recipe.updateOne(
          { _id: recipe._id },
          { mealTypes: newMealTypes },
        );
        console.log(`✅ Updated: ${recipe.title}`);
        console.log(`   Old: ${recipe.mealTypes.join(", ")}`);
        console.log(`   New: ${newMealTypes.join(", ")}\n`);
        updated++;
      } else {
        console.log(`⏭️  Already correct: ${recipe.title}\n`);
      }
    }

    console.log(`\n🎉 Fixed ${updated} recipes!`);
  } catch (error) {
    console.error("❌ Error during fix:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ MongoDB connection closed");
  }
}

fixDesserts();
