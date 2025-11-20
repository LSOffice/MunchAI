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

// Recipe templates for different combinations
const dietaryOptions = [
  "vegan",
  "vegetarian",
  "gluten-free",
  "dairy-free",
  "keto",
  "paleo",
];
const allergyOptions = [
  "peanuts",
  "tree-nuts",
  "shellfish",
  "fish",
  "eggs",
  "dairy",
  "soy",
];
const cuisineOptions = [
  "italian",
  "asian",
  "mediterranean",
  "mexican",
  "indian",
  "thai",
  "greek",
  "american",
];

const recipeTemplates = {
  vegan: {
    italian: [
      {
        title: "Vegan Marinara Pasta",
        description: "Classic pasta with tomato basil sauce",
        ingredients: [
          { name: "pasta", quantity: 400, unit: "g", optional: false },
          { name: "tomato sauce", quantity: 600, unit: "ml", optional: false },
          { name: "basil", quantity: 20, unit: "leaves", optional: false },
          { name: "garlic", quantity: 4, unit: "cloves", optional: false },
        ],
        instructions: [
          "Cook pasta",
          "Heat tomato sauce with garlic",
          "Toss pasta with sauce",
          "Top with fresh basil",
        ],
        nutrition: { calories: 380, protein: 14, carbs: 72, fat: 4 },
      },
      {
        title: "Vegan Risotto",
        description: "Creamy risotto with mushrooms",
        ingredients: [
          { name: "arborio rice", quantity: 300, unit: "g", optional: false },
          { name: "mushrooms", quantity: 300, unit: "g", optional: false },
          {
            name: "vegetable broth",
            quantity: 1,
            unit: "liter",
            optional: false,
          },
          { name: "white wine", quantity: 200, unit: "ml", optional: false },
        ],
        instructions: [
          "Sauté mushrooms",
          "Toast rice",
          "Add wine and gradually add broth",
          "Stir until creamy",
        ],
        nutrition: { calories: 420, protein: 16, carbs: 68, fat: 8 },
      },
    ],
    asian: [
      {
        title: "Vegan Stir Fry",
        description: "Mixed vegetables with soy sauce",
        ingredients: [
          { name: "broccoli", quantity: 300, unit: "g", optional: false },
          { name: "bell peppers", quantity: 2, unit: "whole", optional: false },
          { name: "soy sauce", quantity: 4, unit: "tbsp", optional: false },
          { name: "ginger", quantity: 2, unit: "tbsp", optional: false },
        ],
        instructions: [
          "Heat oil in wok",
          "Add vegetables",
          "Stir fry with soy sauce and ginger",
          "Serve over rice",
        ],
        nutrition: { calories: 280, protein: 12, carbs: 38, fat: 10 },
      },
    ],
    mexican: [
      {
        title: "Vegan Bean Tacos",
        description: "Black bean tacos with fresh toppings",
        ingredients: [
          {
            name: "corn tortillas",
            quantity: 8,
            unit: "whole",
            optional: false,
          },
          { name: "black beans", quantity: 400, unit: "g", optional: false },
          { name: "lettuce", quantity: 200, unit: "g", optional: false },
          { name: "tomato", quantity: 3, unit: "whole", optional: false },
        ],
        instructions: [
          "Warm tortillas",
          "Heat beans with spices",
          "Assemble tacos with toppings",
          "Serve with salsa",
        ],
        nutrition: { calories: 320, protein: 14, carbs: 52, fat: 6 },
      },
    ],
  },
  vegetarian: {
    italian: [
      {
        title: "Vegetarian Lasagna",
        description: "Layered pasta with ricotta and vegetables",
        ingredients: [
          {
            name: "lasagna noodles",
            quantity: 500,
            unit: "g",
            optional: false,
          },
          { name: "ricotta", quantity: 400, unit: "g", optional: false },
          { name: "spinach", quantity: 300, unit: "g", optional: false },
          { name: "mozzarella", quantity: 300, unit: "g", optional: false },
        ],
        instructions: [
          "Layer noodles with ricotta mixture",
          "Add spinach and cheese",
          "Bake at 180°C for 45 minutes",
        ],
        nutrition: { calories: 520, protein: 28, carbs: 62, fat: 18 },
      },
    ],
    mediterranean: [
      {
        title: "Mediterranean Salad",
        description: "Fresh vegetables with feta cheese",
        ingredients: [
          { name: "cucumber", quantity: 2, unit: "whole", optional: false },
          { name: "tomato", quantity: 3, unit: "whole", optional: false },
          { name: "feta cheese", quantity: 200, unit: "g", optional: false },
          { name: "olives", quantity: 150, unit: "g", optional: false },
        ],
        instructions: [
          "Chop vegetables",
          "Combine in bowl",
          "Add feta and olives",
          "Dress with olive oil",
        ],
        nutrition: { calories: 280, protein: 12, carbs: 24, fat: 16 },
      },
    ],
  },
  "gluten-free": {
    asian: [
      {
        title: "Gluten-Free Rice Bowl",
        description: "Rice with vegetables and teriyaki sauce",
        ingredients: [
          { name: "brown rice", quantity: 2, unit: "cups", optional: false },
          { name: "edamame", quantity: 200, unit: "g", optional: false },
          { name: "carrot", quantity: 2, unit: "whole", optional: false },
          { name: "tamari sauce", quantity: 4, unit: "tbsp", optional: false },
        ],
        instructions: [
          "Cook rice",
          "Steam vegetables",
          "Mix with tamari sauce",
          "Serve in bowls",
        ],
        nutrition: { calories: 380, protein: 14, carbs: 68, fat: 6 },
      },
    ],
    mexican: [
      {
        title: "Gluten-Free Corn Enchiladas",
        description: "Corn tortillas with cheese filling",
        ingredients: [
          {
            name: "corn tortillas",
            quantity: 12,
            unit: "whole",
            optional: false,
          },
          { name: "cheese", quantity: 300, unit: "g", optional: false },
          {
            name: "enchilada sauce",
            quantity: 400,
            unit: "ml",
            optional: false,
          },
          { name: "onion", quantity: 1, unit: "whole", optional: false },
        ],
        instructions: [
          "Fill tortillas with cheese",
          "Roll and arrange in baking dish",
          "Cover with sauce",
          "Bake 30 minutes",
        ],
        nutrition: { calories: 420, protein: 18, carbs: 48, fat: 18 },
      },
    ],
  },
  "dairy-free": {
    italian: [
      {
        title: "Dairy-Free Tomato Pasta",
        description: "Simple tomato-based pasta",
        ingredients: [
          { name: "pasta", quantity: 400, unit: "g", optional: false },
          { name: "tomato", quantity: 500, unit: "g", optional: false },
          { name: "olive oil", quantity: 3, unit: "tbsp", optional: false },
          { name: "garlic", quantity: 5, unit: "cloves", optional: false },
        ],
        instructions: [
          "Cook pasta",
          "Simmer tomatoes with garlic",
          "Toss together",
          "Drizzle with olive oil",
        ],
        nutrition: { calories: 360, protein: 12, carbs: 72, fat: 6 },
      },
    ],
    thai: [
      {
        title: "Dairy-Free Coconut Curry",
        description: "Vegetables in coconut curry sauce",
        ingredients: [
          { name: "coconut milk", quantity: 400, unit: "ml", optional: false },
          { name: "curry paste", quantity: 3, unit: "tbsp", optional: false },
          { name: "bell pepper", quantity: 2, unit: "whole", optional: false },
          { name: "basil", quantity: 15, unit: "leaves", optional: false },
        ],
        instructions: [
          "Heat coconut milk",
          "Add curry paste",
          "Add vegetables",
          "Simmer 15 minutes",
        ],
        nutrition: { calories: 320, protein: 10, carbs: 28, fat: 20 },
      },
    ],
  },
  keto: {
    american: [
      {
        title: "Keto Beef Burger",
        description: "Low-carb burger without bun",
        ingredients: [
          { name: "ground beef", quantity: 300, unit: "g", optional: false },
          { name: "lettuce leaf", quantity: 2, unit: "whole", optional: false },
          { name: "cheese", quantity: 100, unit: "g", optional: false },
          { name: "tomato", quantity: 1, unit: "whole", optional: false },
        ],
        instructions: [
          "Make burger patties",
          "Cook on grill",
          "Wrap in lettuce",
          "Add toppings",
        ],
        nutrition: { calories: 420, protein: 40, carbs: 8, fat: 24 },
      },
    ],
    mediterranean: [
      {
        title: "Keto Greek Salad",
        description: "High-fat Greek salad",
        ingredients: [
          { name: "feta cheese", quantity: 250, unit: "g", optional: false },
          { name: "cucumber", quantity: 1, unit: "whole", optional: false },
          { name: "olives", quantity: 200, unit: "g", optional: false },
          { name: "olive oil", quantity: 5, unit: "tbsp", optional: false },
        ],
        instructions: [
          "Chop vegetables",
          "Add feta and olives",
          "Dress with olive oil",
          "Serve cold",
        ],
        nutrition: { calories: 480, protein: 14, carbs: 12, fat: 42 },
      },
    ],
  },
  paleo: {
    american: [
      {
        title: "Paleo Steak and Vegetables",
        description: "Grilled steak with roasted vegetables",
        ingredients: [
          { name: "steak", quantity: 300, unit: "g", optional: false },
          { name: "broccoli", quantity: 200, unit: "g", optional: false },
          { name: "sweet potato", quantity: 200, unit: "g", optional: false },
          { name: "olive oil", quantity: 2, unit: "tbsp", optional: false },
        ],
        instructions: [
          "Grill steak",
          "Roast vegetables",
          "Season with salt and pepper",
          "Serve together",
        ],
        nutrition: { calories: 520, protein: 42, carbs: 35, fat: 22 },
      },
    ],
    mediterranean: [
      {
        title: "Paleo Grilled Fish",
        description: "Fresh grilled fish with lemon",
        ingredients: [
          { name: "salmon", quantity: 400, unit: "g", optional: false },
          { name: "lemon", quantity: 2, unit: "whole", optional: false },
          { name: "asparagus", quantity: 200, unit: "g", optional: false },
          { name: "olive oil", quantity: 2, unit: "tbsp", optional: false },
        ],
        instructions: [
          "Grill salmon",
          "Steam asparagus",
          "Squeeze lemon",
          "Serve with vegetables",
        ],
        nutrition: { calories: 420, protein: 44, carbs: 12, fat: 22 },
      },
    ],
  },
};

const mealTypes = ["breakfast", "lunch", "dinner"];
const difficulties = ["easy", "medium", "hard"];

const imageUrls = [
  "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1455619452474-d2be8b1e4e31?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1547592166-7aae4d755744?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1570073412911-4341d7faf451?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1556910103-1c02411f09ff?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1611003228941-98852ba62227?w=500&h=500&fit=crop",
];

function generateRecipes() {
  const recipes = [];
  const recipesPerDietaryCombination =
    100 / (dietaryOptions.length * cuisineOptions.length);

  dietaryOptions.forEach((dietary) => {
    cuisineOptions.forEach((cuisine) => {
      for (let i = 0; i < recipesPerDietaryCombination; i++) {
        const allergyCount = Math.floor(Math.random() * 3); // 0-2 allergies per recipe
        const selectedAllergies = [];
        for (let j = 0; j < allergyCount; j++) {
          const randomAllergy =
            allergyOptions[Math.floor(Math.random() * allergyOptions.length)];
          if (!selectedAllergies.includes(randomAllergy)) {
            selectedAllergies.push(randomAllergy);
          }
        }

        const template = recipeTemplates[dietary]?.[cuisine]?.[0] || {
          title: `${dietary.charAt(0).toUpperCase() + dietary.slice(1)} ${cuisine.charAt(0).toUpperCase() + cuisine.slice(1)} Recipe`,
          description: `A delicious ${dietary} ${cuisine} dish`,
          ingredients: [
            {
              name: "main ingredient",
              quantity: 300,
              unit: "g",
              optional: false,
            },
            { name: "seasoning", quantity: 2, unit: "tsp", optional: false },
          ],
          instructions: ["Prepare ingredients", "Cook", "Serve"],
          nutrition: { calories: 350, protein: 20, carbs: 45, fat: 12 },
        };

        recipes.push({
          title: `${template.title} ${i + 1}`,
          description: template.description,
          servings: 2 + Math.floor(Math.random() * 3),
          prepTime: 10 + Math.floor(Math.random() * 30),
          cookTime: 10 + Math.floor(Math.random() * 45),
          difficulty:
            difficulties[Math.floor(Math.random() * difficulties.length)],
          ingredients: template.ingredients,
          instructions: template.instructions,
          tags: [dietary, cuisine, ...selectedAllergies],
          nutrition: template.nutrition,
          imageUrl: imageUrls[Math.floor(Math.random() * imageUrls.length)],
          featured: Math.random() > 0.7,
          source: Math.random() > 0.5 ? "verified" : "ai-generated",
          rating: 3 + Math.random() * 2,
        });
      }
    });
  });

  return recipes;
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

async function addRecipes() {
  try {
    await connectDB();

    console.log("🍳 Generating 100 new recipes...");
    const recipes = generateRecipes();

    console.log(`📝 Inserting ${recipes.length} recipes into database...`);
    const result = await Recipe.insertMany(recipes);

    console.log(`✅ Successfully added ${result.length} recipes!`);
    console.log("\n📊 Recipe breakdown:");
    console.log(`   Dietary options: ${dietaryOptions.join(", ")}`);
    console.log(`   Cuisine options: ${cuisineOptions.join(", ")}`);
    console.log(`   Allergy options: ${allergyOptions.join(", ")}`);
    console.log(
      `\n✨ All ${recipes.length} recipes have been added to the database!\n`,
    );
  } catch (error) {
    console.error("❌ Error adding recipes:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed");
  }
}

addRecipes();
