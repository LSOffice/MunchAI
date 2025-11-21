const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/munchAI";

console.log("Connecting to:", MONGODB_URI.substring(0, 50) + "...");

// Define schemas inline
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passkeys: [
      {
        credentialId: { type: String, required: true },
        publicKey: { type: Buffer, required: true },
        signCount: { type: Number, default: 0 },
        transports: [String],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    dietaryRestrictions: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    cuisinePreferences: { type: [String], default: [] },
  },
  { timestamps: true },
);

const TempAccountSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    verificationToken: {
      type: String,
      required: true,
    },
    verificationTokenExpiry: {
      type: Date,
      required: true,
    },
    resendAttempts: {
      type: Number,
      default: 0,
    },
    lastResendTime: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // Auto-delete after 1 hour
    },
  },
  { timestamps: true },
);

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

const IngredientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  category: {
    type: String,
    enum: ["produce", "dairy", "meat", "pantry", "frozen", "other"],
    default: "other",
  },
  expirationDate: { type: Date, required: true },
  dateAdded: { type: Date, default: () => new Date() },
  imageUrl: { type: String },
});

const SavedRecipeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
    title: String,
    description: String,
    servings: Number,
    prepTime: Number,
    cookTime: Number,
    difficulty: { type: String, enum: ["easy", "medium", "hard"] },
    ingredients: {
      type: [
        new mongoose.Schema(
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
      type: new mongoose.Schema(
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

const MealPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
    date: { type: Date, required: true },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
  },
  { timestamps: true },
);

const MagicTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, index: true },
    userId: { type: String },
    purpose: {
      type: String,
      required: true,
      enum: ["login", "email-verification"],
      default: "login",
    },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const User = mongoose.model("User", UserSchema);
const Recipe = mongoose.model("Recipe", RecipeSchema);
const Ingredient = mongoose.model("Ingredient", IngredientSchema);
const SavedRecipe = mongoose.model("SavedRecipe", SavedRecipeSchema);
const MealPlan = mongoose.model("MealPlan", MealPlanSchema);
const MagicToken = mongoose.model("MagicToken", MagicTokenSchema);

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

async function seedDatabase() {
  try {
    await connectDB();

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Ingredient.deleteMany({});
    await SavedRecipe.deleteMany({});
    await MealPlan.deleteMany({});
    await MagicToken.deleteMany({});

    // Create test users
    console.log("👤 Creating test users...");
    const users = await User.insertMany([
      {
        name: "John Doe",
        email: "john@example.com",
        passkeys: [],
        dietaryRestrictions: ["vegetarian"],
        allergies: ["peanuts"],
        cuisinePreferences: ["italian", "asian"],
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        passkeys: [],
        dietaryRestrictions: [],
        allergies: ["shellfish"],
        cuisinePreferences: ["mediterranean", "french"],
      },
    ]);

    const user1 = users[0];
    const user2 = users[1];

    console.log(`✅ Created ${users.length} users`);

    // Create recipes
    console.log("🍳 Creating recipes...");
    const recipes = await Recipe.insertMany([
      {
        title: "Spaghetti Carbonara",
        description: "Classic Italian pasta with creamy sauce",
        servings: 4,
        prepTime: 10,
        cookTime: 20,
        difficulty: "easy",
        ingredients: [
          { name: "spaghetti", quantity: 400, unit: "g", optional: false },
          { name: "eggs", quantity: 4, unit: "whole", optional: false },
          {
            name: "parmesan cheese",
            quantity: 200,
            unit: "g",
            optional: false,
          },
          { name: "black pepper", quantity: 1, unit: "tbsp", optional: false },
        ],
        instructions: [
          "Cook spaghetti in salted boiling water",
          "Beat eggs with grated cheese",
          "Drain pasta and mix with egg mixture",
          "Season with black pepper and serve",
        ],
        tags: ["italian", "pasta", "vegetarian"],
        nutrition: { calories: 450, protein: 18, carbs: 55, fat: 16 },
        imageUrl:
          "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&h=500&fit=crop",
        featured: true,
        source: "verified",
        rating: 4.5,
      },
      {
        title: "Stir Fry Vegetables",
        description: "Quick and healthy vegetable stir fry",
        servings: 2,
        prepTime: 15,
        cookTime: 10,
        difficulty: "easy",
        ingredients: [
          { name: "broccoli", quantity: 300, unit: "g", optional: false },
          { name: "bell peppers", quantity: 2, unit: "whole", optional: false },
          { name: "soy sauce", quantity: 3, unit: "tbsp", optional: false },
          { name: "garlic", quantity: 3, unit: "cloves", optional: false },
        ],
        instructions: [
          "Heat oil in wok",
          "Add garlic and cook briefly",
          "Add vegetables and stir fry",
          "Add soy sauce and serve hot",
        ],
        tags: ["asian", "vegetarian", "healthy"],
        nutrition: { calories: 250, protein: 12, carbs: 35, fat: 8 },
        imageUrl:
          "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=500&h=500&fit=crop",
        source: "ai-generated",
        rating: 4,
      },
      {
        title: "Chicken Tacos",
        description: "Delicious Mexican-style chicken tacos",
        servings: 4,
        prepTime: 20,
        cookTime: 15,
        difficulty: "easy",
        ingredients: [
          { name: "chicken breast", quantity: 500, unit: "g", optional: false },
          { name: "taco shells", quantity: 8, unit: "whole", optional: false },
          { name: "lettuce", quantity: 1, unit: "cup", optional: false },
          { name: "tomato", quantity: 2, unit: "whole", optional: false },
        ],
        instructions: [
          "Cook and season chicken",
          "Warm taco shells",
          "Assemble tacos with chicken and toppings",
          "Serve with salsa",
        ],
        tags: ["mexican", "meat", "dinner"],
        nutrition: { calories: 380, protein: 35, carbs: 30, fat: 14 },
        imageUrl:
          "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&h=500&fit=crop",
        source: "verified",
        rating: 4.2,
      },
      {
        title: "Margherita Pizza",
        description: "Simple but delicious Italian pizza",
        servings: 2,
        prepTime: 30,
        cookTime: 25,
        difficulty: "medium",
        ingredients: [
          { name: "pizza dough", quantity: 500, unit: "g", optional: false },
          { name: "tomato sauce", quantity: 150, unit: "ml", optional: false },
          { name: "mozzarella", quantity: 250, unit: "g", optional: false },
          { name: "basil", quantity: 10, unit: "leaves", optional: false },
        ],
        instructions: [
          "Preheat oven to 220°C",
          "Spread dough on pizza pan",
          "Add tomato sauce and mozzarella",
          "Bake for 25 minutes",
          "Top with fresh basil",
        ],
        tags: ["italian", "pizza", "vegetarian"],
        nutrition: { calories: 520, protein: 22, carbs: 60, fat: 18 },
        imageUrl:
          "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500&h=500&fit=crop",
        source: "verified",
        rating: 4.6,
      },
      {
        title: "Grilled Salmon",
        description: "Perfectly grilled salmon with lemon",
        servings: 2,
        prepTime: 15,
        cookTime: 12,
        difficulty: "easy",
        ingredients: [
          { name: "salmon fillet", quantity: 400, unit: "g", optional: false },
          { name: "lemon", quantity: 1, unit: "whole", optional: false },
          { name: "olive oil", quantity: 2, unit: "tbsp", optional: false },
          { name: "salt", quantity: 1, unit: "tsp", optional: false },
        ],
        instructions: [
          "Brush salmon with olive oil",
          "Season with salt and pepper",
          "Grill for 6 minutes each side",
          "Squeeze fresh lemon on top",
        ],
        tags: ["seafood", "healthy", "protein"],
        nutrition: { calories: 320, protein: 42, carbs: 2, fat: 16 },
        imageUrl:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop",
        source: "verified",
        rating: 4.7,
      },
      {
        title: "Thai Green Curry",
        description: "Aromatic and spicy Thai curry",
        servings: 4,
        prepTime: 25,
        cookTime: 20,
        difficulty: "medium",
        ingredients: [
          { name: "chicken", quantity: 500, unit: "g", optional: false },
          { name: "coconut milk", quantity: 400, unit: "ml", optional: false },
          {
            name: "green curry paste",
            quantity: 3,
            unit: "tbsp",
            optional: false,
          },
          { name: "basil", quantity: 15, unit: "leaves", optional: false },
        ],
        instructions: [
          "Heat oil and cook curry paste",
          "Add chicken and brown",
          "Add coconut milk and simmer",
          "Add basil and serve with rice",
        ],
        tags: ["thai", "spicy", "meat"],
        nutrition: { calories: 420, protein: 38, carbs: 15, fat: 22 },
        imageUrl:
          "https://images.unsplash.com/photo-1455619452474-d2be8b1e4e31?w=500&h=500&fit=crop",
        source: "verified",
        rating: 4.4,
      },
      {
        title: "Vegetable Soup",
        description: "Hearty and warming vegetable soup",
        servings: 6,
        prepTime: 20,
        cookTime: 30,
        difficulty: "easy",
        ingredients: [
          { name: "carrots", quantity: 3, unit: "whole", optional: false },
          { name: "celery", quantity: 2, unit: "stalks", optional: false },
          { name: "potatoes", quantity: 3, unit: "whole", optional: false },
          {
            name: "vegetable broth",
            quantity: 1.5,
            unit: "liters",
            optional: false,
          },
        ],
        instructions: [
          "Chop all vegetables",
          "Heat broth and add vegetables",
          "Simmer for 30 minutes",
          "Season and serve hot",
        ],
        tags: ["vegetarian", "soup", "healthy"],
        nutrition: { calories: 180, protein: 8, carbs: 35, fat: 2 },
        imageUrl:
          "https://images.unsplash.com/photo-1547592166-7aae4d755744?w=500&h=500&fit=crop",
        source: "ai-generated",
        rating: 4.1,
      },
      {
        title: "Beef Stir Fry",
        description: "Quick beef and vegetable stir fry",
        servings: 3,
        prepTime: 20,
        cookTime: 15,
        difficulty: "medium",
        ingredients: [
          { name: "beef sirloin", quantity: 400, unit: "g", optional: false },
          { name: "snap peas", quantity: 200, unit: "g", optional: false },
          { name: "soy sauce", quantity: 4, unit: "tbsp", optional: false },
          { name: "ginger", quantity: 2, unit: "tbsp", optional: false },
        ],
        instructions: [
          "Slice beef thinly",
          "Heat wok over high heat",
          "Cook beef until browned",
          "Add vegetables and sauce",
          "Serve over rice",
        ],
        tags: ["asian", "meat", "quick"],
        nutrition: { calories: 350, protein: 40, carbs: 20, fat: 14 },
        imageUrl:
          "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=500&h=500&fit=crop",
        source: "verified",
        rating: 4.3,
      },
      {
        title: "Pasta Primavera",
        description: "Fresh pasta with spring vegetables",
        servings: 4,
        prepTime: 15,
        cookTime: 12,
        difficulty: "easy",
        ingredients: [
          { name: "penne pasta", quantity: 400, unit: "g", optional: false },
          { name: "zucchini", quantity: 2, unit: "whole", optional: false },
          {
            name: "cherry tomatoes",
            quantity: 250,
            unit: "g",
            optional: false,
          },
          { name: "garlic", quantity: 4, unit: "cloves", optional: false },
        ],
        instructions: [
          "Cook pasta according to package",
          "Sauté vegetables with garlic",
          "Toss with cooked pasta",
          "Add parmesan and serve",
        ],
        tags: ["italian", "pasta", "vegetarian", "light"],
        nutrition: { calories: 380, protein: 14, carbs: 65, fat: 8 },
        imageUrl:
          "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&h=500&fit=crop",
        source: "ai-generated",
        rating: 4.2,
      },
      {
        title: "Fish Tacos",
        description: "Light and refreshing fish tacos",
        servings: 4,
        prepTime: 25,
        cookTime: 8,
        difficulty: "easy",
        ingredients: [
          { name: "white fish", quantity: 500, unit: "g", optional: false },
          {
            name: "corn tortillas",
            quantity: 8,
            unit: "whole",
            optional: false,
          },
          { name: "cabbage", quantity: 200, unit: "g", optional: false },
          { name: "lime", quantity: 2, unit: "whole", optional: false },
        ],
        instructions: [
          "Pan-fry fish until cooked",
          "Warm tortillas",
          "Shred cabbage",
          "Assemble and serve with lime",
        ],
        tags: ["seafood", "mexican", "light"],
        nutrition: { calories: 280, protein: 32, carbs: 25, fat: 8 },
        imageUrl:
          "https://images.unsplash.com/photo-1556910103-1c02411f09ff?w=500&h=500&fit=crop",
        source: "verified",
        rating: 4.5,
      },
      {
        title: "Mushroom Risotto",
        description: "Creamy and rich mushroom risotto",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        difficulty: "medium",
        ingredients: [
          { name: "arborio rice", quantity: 300, unit: "g", optional: false },
          { name: "mushrooms", quantity: 300, unit: "g", optional: false },
          { name: "white wine", quantity: 200, unit: "ml", optional: false },
          { name: "parmesan", quantity: 100, unit: "g", optional: false },
        ],
        instructions: [
          "Sauté mushrooms",
          "Toast rice",
          "Add wine and gradually add stock",
          "Stir until creamy",
          "Finish with parmesan",
        ],
        tags: ["italian", "rice", "vegetarian"],
        nutrition: { calories: 380, protein: 16, carbs: 58, fat: 12 },
        imageUrl:
          "https://images.unsplash.com/photo-1570073412911-4341d7faf451?w=500&h=500&fit=crop",
        source: "verified",
        rating: 4.6,
      },
      {
        title: "Shrimp Pasta",
        description: "Garlic butter shrimp pasta",
        servings: 4,
        prepTime: 15,
        cookTime: 15,
        difficulty: "easy",
        ingredients: [
          { name: "linguine", quantity: 400, unit: "g", optional: false },
          { name: "shrimp", quantity: 500, unit: "g", optional: false },
          { name: "garlic", quantity: 6, unit: "cloves", optional: false },
          { name: "butter", quantity: 100, unit: "g", optional: false },
        ],
        instructions: [
          "Cook pasta",
          "Sauté garlic in butter",
          "Add shrimp until pink",
          "Toss with pasta",
          "Serve immediately",
        ],
        tags: ["seafood", "pasta", "italian"],
        nutrition: { calories: 410, protein: 38, carbs: 52, fat: 12 },
        imageUrl:
          "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&h=500&fit=crop",
        source: "verified",
        rating: 4.4,
      },
    ]);

    console.log(`✅ Created ${recipes.length} recipes`);

    // Create ingredients for user1
    console.log("🥬 Creating ingredients...");
    const createIngredientsForUser = (userId) => {
      const today = new Date();
      return [
        {
          userId,
          name: "Tomato",
          quantity: 5,
          unit: "whole",
          category: "produce",
          expirationDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
          dateAdded: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          userId,
          name: "Broccoli",
          quantity: 2,
          unit: "whole",
          category: "produce",
          expirationDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
          dateAdded: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          userId,
          name: "Carrots",
          quantity: 1,
          unit: "kg",
          category: "produce",
          expirationDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
          dateAdded: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          userId,
          name: "Spinach",
          quantity: 200,
          unit: "g",
          category: "produce",
          expirationDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
          dateAdded: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          userId,
          name: "Milk",
          quantity: 1,
          unit: "liter",
          category: "dairy",
          expirationDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
          dateAdded: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          userId,
          name: "Cheese",
          quantity: 250,
          unit: "g",
          category: "dairy",
          expirationDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000),
          dateAdded: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          userId,
          name: "Eggs",
          quantity: 12,
          unit: "whole",
          category: "dairy",
          expirationDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000),
          dateAdded: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          userId,
          name: "Chicken Breast",
          quantity: 1.5,
          unit: "kg",
          category: "meat",
          expirationDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
          dateAdded: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          userId,
          name: "Salmon",
          quantity: 600,
          unit: "g",
          category: "meat",
          expirationDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
          dateAdded: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          userId,
          name: "Ground Beef",
          quantity: 500,
          unit: "g",
          category: "meat",
          expirationDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
          dateAdded: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          userId,
          name: "Olive Oil",
          quantity: 500,
          unit: "ml",
          category: "pantry",
          expirationDate: new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000),
          dateAdded: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      ];
    };

    const ingredientsUser1 = createIngredientsForUser(users[0]._id);
    const ingredientsUser2 = createIngredientsForUser(users[1]._id);
    const ingredients = await Ingredient.insertMany([
      ...ingredientsUser1,
      ...ingredientsUser2,
    ]);

    console.log(`✅ Created ${ingredients.length} ingredients`);

    // Create saved recipes for user1
    console.log("❤️  Creating saved recipes...");
    const savedRecipes = await SavedRecipe.insertMany([
      {
        userId: users[0]._id,
        recipeId: recipes[0]._id,
        title: recipes[0].title,
        description: recipes[0].description,
        servings: recipes[0].servings,
        prepTime: recipes[0].prepTime,
        cookTime: recipes[0].cookTime,
        difficulty: recipes[0].difficulty,
        ingredients: recipes[0].ingredients,
        instructions: recipes[0].instructions,
        tags: recipes[0].tags,
        nutrition: recipes[0].nutrition,
        source: recipes[0].source,
        rating: recipes[0].rating,
        savedAt: new Date(),
        notes: "Love this recipe!",
      },
      {
        userId: users[0]._id,
        recipeId: recipes[1]._id,
        title: recipes[1].title,
        description: recipes[1].description,
        servings: recipes[1].servings,
        prepTime: recipes[1].prepTime,
        cookTime: recipes[1].cookTime,
        difficulty: recipes[1].difficulty,
        ingredients: recipes[1].ingredients,
        instructions: recipes[1].instructions,
        tags: recipes[1].tags,
        nutrition: recipes[1].nutrition,
        source: recipes[1].source,
        rating: recipes[1].rating,
        savedAt: new Date(),
        notes: "Great weeknight meal",
      },
      {
        userId: users[0]._id,
        recipeId: recipes[2]._id,
        title: recipes[2].title,
        description: recipes[2].description,
        servings: recipes[2].servings,
        prepTime: recipes[2].prepTime,
        cookTime: recipes[2].cookTime,
        difficulty: recipes[2].difficulty,
        ingredients: recipes[2].ingredients,
        instructions: recipes[2].instructions,
        tags: recipes[2].tags,
        nutrition: recipes[2].nutrition,
        source: recipes[2].source,
        rating: recipes[2].rating,
        savedAt: new Date(),
        notes: "Family favorite",
      },
      {
        userId: users[0]._id,
        recipeId: recipes[3]._id,
        title: recipes[3].title,
        description: recipes[3].description,
        servings: recipes[3].servings,
        prepTime: recipes[3].prepTime,
        cookTime: recipes[3].cookTime,
        difficulty: recipes[3].difficulty,
        ingredients: recipes[3].ingredients,
        instructions: recipes[3].instructions,
        tags: recipes[3].tags,
        nutrition: recipes[3].nutrition,
        source: recipes[3].source,
        rating: recipes[3].rating,
        savedAt: new Date(),
        notes: "Perfect for entertaining",
      },
      {
        userId: users[0]._id,
        recipeId: recipes[4]._id,
        title: recipes[4].title,
        description: recipes[4].description,
        servings: recipes[4].servings,
        prepTime: recipes[4].prepTime,
        cookTime: recipes[4].cookTime,
        difficulty: recipes[4].difficulty,
        ingredients: recipes[4].ingredients,
        instructions: recipes[4].instructions,
        tags: recipes[4].tags,
        nutrition: recipes[4].nutrition,
        source: recipes[4].source,
        rating: recipes[4].rating,
        savedAt: new Date(),
        notes: "Healthy option",
      },
      {
        userId: users[0]._id,
        recipeId: recipes[5]._id,
        title: recipes[5].title,
        description: recipes[5].description,
        servings: recipes[5].servings,
        prepTime: recipes[5].prepTime,
        cookTime: recipes[5].cookTime,
        difficulty: recipes[5].difficulty,
        ingredients: recipes[5].ingredients,
        instructions: recipes[5].instructions,
        tags: recipes[5].tags,
        nutrition: recipes[5].nutrition,
        source: recipes[5].source,
        rating: recipes[5].rating,
        savedAt: new Date(),
        notes: "Trying new flavors",
      },
      {
        userId: users[0]._id,
        recipeId: recipes[6]._id,
        title: recipes[6].title,
        description: recipes[6].description,
        servings: recipes[6].servings,
        prepTime: recipes[6].prepTime,
        cookTime: recipes[6].cookTime,
        difficulty: recipes[6].difficulty,
        ingredients: recipes[6].ingredients,
        instructions: recipes[6].instructions,
        tags: recipes[6].tags,
        nutrition: recipes[6].nutrition,
        source: recipes[6].source,
        rating: recipes[6].rating,
        savedAt: new Date(),
        notes: "Comfort food",
      },
      {
        userId: users[0]._id,
        recipeId: recipes[7]._id,
        title: recipes[7].title,
        description: recipes[7].description,
        servings: recipes[7].servings,
        prepTime: recipes[7].prepTime,
        cookTime: recipes[7].cookTime,
        difficulty: recipes[7].difficulty,
        ingredients: recipes[7].ingredients,
        instructions: recipes[7].instructions,
        tags: recipes[7].tags,
        nutrition: recipes[7].nutrition,
        source: recipes[7].source,
        rating: recipes[7].rating,
        savedAt: new Date(),
        notes: "Weekend dinner",
      },
      {
        userId: users[0]._id,
        recipeId: recipes[8]._id,
        title: recipes[8].title,
        description: recipes[8].description,
        servings: recipes[8].servings,
        prepTime: recipes[8].prepTime,
        cookTime: recipes[8].cookTime,
        difficulty: recipes[8].difficulty,
        ingredients: recipes[8].ingredients,
        instructions: recipes[8].instructions,
        tags: recipes[8].tags,
        nutrition: recipes[8].nutrition,
        source: recipes[8].source,
        rating: recipes[8].rating,
        savedAt: new Date(),
        notes: "Quick lunch",
      },
      {
        userId: users[0]._id,
        recipeId: recipes[9]._id,
        title: recipes[9].title,
        description: recipes[9].description,
        servings: recipes[9].servings,
        prepTime: recipes[9].prepTime,
        cookTime: recipes[9].cookTime,
        difficulty: recipes[9].difficulty,
        ingredients: recipes[9].ingredients,
        instructions: recipes[9].instructions,
        tags: recipes[9].tags,
        nutrition: recipes[9].nutrition,
        source: recipes[9].source,
        rating: recipes[9].rating,
        savedAt: new Date(),
        notes: "Restaurant quality",
      },
      {
        userId: users[1]._id,
        recipeId: recipes[3]._id,
        title: recipes[3].title,
        description: recipes[3].description,
        servings: recipes[3].servings,
        prepTime: recipes[3].prepTime,
        cookTime: recipes[3].cookTime,
        difficulty: recipes[3].difficulty,
        ingredients: recipes[3].ingredients,
        instructions: recipes[3].instructions,
        tags: recipes[3].tags,
        nutrition: recipes[3].nutrition,
        source: recipes[3].source,
        rating: recipes[3].rating,
        savedAt: new Date(),
        notes: "Must try",
      },
      {
        userId: users[1]._id,
        recipeId: recipes[5]._id,
        title: recipes[5].title,
        description: recipes[5].description,
        servings: recipes[5].servings,
        prepTime: recipes[5].prepTime,
        cookTime: recipes[5].cookTime,
        difficulty: recipes[5].difficulty,
        ingredients: recipes[5].ingredients,
        instructions: recipes[5].instructions,
        tags: recipes[5].tags,
        nutrition: recipes[5].nutrition,
        source: recipes[5].source,
        rating: recipes[5].rating,
        savedAt: new Date(),
        notes: "Love this!",
      },
    ]);

    console.log(`✅ Created ${savedRecipes.length} saved recipes`);

    // Create meal plans for user1
    console.log("📅 Creating meal plans...");
    const today = new Date();
    const mealPlans = await MealPlan.insertMany([
      {
        userId: users[0]._id,
        recipeId: recipes[0]._id,
        date: today,
        mealType: "dinner",
      },
      {
        userId: users[0]._id,
        recipeId: recipes[1]._id,
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        mealType: "lunch",
      },
      {
        userId: users[0]._id,
        recipeId: recipes[2]._id,
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        mealType: "dinner",
      },
      {
        userId: users[0]._id,
        recipeId: recipes[3]._id,
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        mealType: "breakfast",
      },
      {
        userId: users[0]._id,
        recipeId: recipes[4]._id,
        date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
        mealType: "lunch",
      },
      {
        userId: users[0]._id,
        recipeId: recipes[5]._id,
        date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        mealType: "dinner",
      },
      {
        userId: users[0]._id,
        recipeId: recipes[6]._id,
        date: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000),
        mealType: "lunch",
      },
      {
        userId: users[0]._id,
        recipeId: recipes[7]._id,
        date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        mealType: "dinner",
      },
      {
        userId: users[0]._id,
        recipeId: recipes[8]._id,
        date: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000),
        mealType: "lunch",
      },
      {
        userId: users[0]._id,
        recipeId: recipes[9]._id,
        date: new Date(today.getTime() + 9 * 24 * 60 * 60 * 1000),
        mealType: "dinner",
      },
      {
        userId: users[1]._id,
        recipeId: recipes[0]._id,
        date: today,
        mealType: "breakfast",
      },
      {
        userId: users[1]._id,
        recipeId: recipes[2]._id,
        date: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        mealType: "dinner",
      },
      {
        userId: users[1]._id,
        recipeId: recipes[4]._id,
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        mealType: "lunch",
      },
      {
        userId: users[1]._id,
        recipeId: recipes[6]._id,
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        mealType: "dinner",
      },
      {
        userId: users[1]._id,
        recipeId: recipes[8]._id,
        date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
        mealType: "lunch",
      },
      {
        userId: users[1]._id,
        recipeId: recipes[10]._id,
        date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        mealType: "dinner",
      },
    ]);

    console.log(`✅ Created ${mealPlans.length} meal plans`);

    console.log("\n✨ Database seeding completed successfully!\n");
    console.log("📝 Test account setup:");
    console.log("  Email: john@example.com");
    console.log("  Email: jane@example.com");
    console.log("\n  Note: Passkey-only authentication enabled.");
    console.log(
      "  Register a passkey in Settings > Account after logging in.\n",
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed");
  }
}

seedDatabase();
