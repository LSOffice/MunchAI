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

// Parse and clean instructions
function cleanInstructions(instructionsInput) {
  if (!instructionsInput) return [];

  let text = "";

  // Handle both string and array inputs
  if (Array.isArray(instructionsInput)) {
    text = instructionsInput.join(" ");
  } else {
    text = String(instructionsInput);
  }

  // Replace common line breaks and separators
  text = text
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\r/g, " ")
    .replace(/\. \./g, ".");

  // Remove "Step X" prefixes that appear at the beginning
  text = text.replace(/\bStep\s+\d+\s+/gi, "");

  // Split on common step indicators and punctuation
  let steps = [];

  // Try to split on numbered steps (1., 2., etc.)
  const numberedMatch = text.match(/\d+\.\s+[^.!?]*[.!?]/g);
  if (numberedMatch && numberedMatch.length > 1) {
    steps = numberedMatch.map((step) => step.replace(/^\d+\.\s+/, "").trim());
  } else {
    // Try to split on sentences (., !, ?)
    const sentences = text.match(/[^.!?]+[.!?]/g);
    if (sentences && sentences.length > 1) {
      steps = sentences
        .map((s) => s.trim().replace(/^[\d.]+\s+/, ""))
        .filter((s) => s.length > 5);
    } else {
      // Fall back to splitting on common phrases
      steps = text
        .split(
          /(?:then|next|after|once|meanwhile|finally|add|mix|stir|pour|bake|fry|boil|simmer|cook|place|put|remove|combine|blend|beat|whip|fold|knead|let|pour|top|serve|garnish|transfer|drain|strain)\s+/i,
        )
        .map((s) => s.trim())
        .filter((s) => s.length > 5);
    }
  }

  if (steps.length === 0) {
    // If still no steps, return original as single step
    steps = [text.trim()];
  }

  // Clean each step
  steps = steps
    .map((step) => {
      // Remove "Step X" prefixes that might still be there
      step = step.replace(/^\s*Step\s+\d+\s+/i, "").trim();

      // Remove leading/trailing punctuation
      step = step.replace(/^[.!?\s]+|[.!?\s]+$/g, "").trim();

      // Capitalize first letter
      step = step.charAt(0).toUpperCase() + step.slice(1);

      // Ensure it ends with period
      if (!step.endsWith(".") && !step.endsWith("!") && !step.endsWith("?")) {
        step += ".";
      }

      return step;
    })
    .filter((step) => step.length > 3);

  return steps;
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

async function fixInstructions() {
  try {
    await connectDB();

    // Find all recipes
    const recipes = await Recipe.find({});
    console.log(`📖 Found ${recipes.length} recipes to process\n`);

    let updated = 0;
    let skipped = 0;

    for (const recipe of recipes) {
      // Check if instructions need fixing
      const hasMessyInstructions =
        Array.isArray(recipe.instructions) &&
        recipe.instructions.some(
          (instruction) =>
            instruction.includes("\r\n") ||
            instruction.includes("\n") ||
            instruction.length > 500 ||
            /Step\s+\d+/i.test(instruction) ||
            (instruction.match(/\./g) || []).length > 3,
        );

      if (!hasMessyInstructions && recipe.instructions.length > 0) {
        skipped++;
        continue;
      }

      // Clean and reorganize instructions
      const cleanedSteps = cleanInstructions(recipe.instructions);

      if (cleanedSteps.length !== recipe.instructions.length) {
        // Update recipe
        recipe.instructions = cleanedSteps;
        await recipe.save();

        console.log(`✅ Fixed: ${recipe.title}`);
        console.log(`   Before: ${recipe.instructions.length} steps`);
        console.log(`   After: ${cleanedSteps.length} steps`);
        const sampleText =
          cleanedSteps[0]?.substring(0, 80) +
          (cleanedSteps[0]?.length > 80 ? "..." : "");
        console.log(`   Sample: "${sampleText}"`);
        console.log();

        updated++;
      } else {
        skipped++;
      }
    }

    console.log("\n🎉 Fix complete!");
    console.log(`   ✅ Recipes updated: ${updated}`);
    console.log(`   ⏭️  Recipes skipped (already clean): ${skipped}`);
    console.log(`   📊 Total recipes processed: ${recipes.length}`);
  } catch (error) {
    console.error("❌ Error during fix:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ MongoDB connection closed");
  }
}

fixInstructions();
