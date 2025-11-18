# MunchAI API Documentation

## Base URL

```
http://localhost:3000/api
```

## Endpoints

### Recipes

#### GET /recipes

List all recipes with optional filtering

**Query Parameters:**

- `q` (string) - Search query for recipe title/description
- `difficulty` (string) - Filter by difficulty: `easy`, `medium`, `hard`
- `tags` (string) - Comma-separated tags to filter by
- `source` (string) - Filter by source: `verified`, `ai-generated`

**Example:**

```bash
GET /api/recipes?q=pasta&difficulty=easy&tags=vegetarian
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Tomato Basil Pasta",
      "description": "...",
      "servings": 2,
      "prepTime": 10,
      "cookTime": 20,
      "difficulty": "easy",
      "ingredients": [...],
      "instructions": [...],
      "tags": ["Italian", "pasta", "vegetarian"],
      "source": "verified",
      "rating": 4.8,
      "saved": false
    }
  ]
}
```

#### POST /recipes

Create a new recipe

**Request Body:**

```json
{
  "title": "Pasta Carbonara",
  "description": "Classic Italian pasta",
  "servings": 2,
  "prepTime": 10,
  "cookTime": 20,
  "difficulty": "medium",
  "ingredients": [{ "name": "Pasta", "quantity": 400, "unit": "g" }],
  "instructions": ["Cook pasta", "Add sauce"],
  "tags": ["Italian"],
  "source": "ai-generated"
}
```

#### GET /recipes/[id]

Get a specific recipe

#### PATCH /recipes/[id]

Update a recipe

#### DELETE /recipes/[id]

Delete a recipe

---

### Ingredients

#### GET /ingredients

List all ingredients

**Query Parameters:**

- `category` (string) - Filter by category: `produce`, `dairy`, `meat`, `pantry`, `frozen`, `other`

#### POST /ingredients

Create a new ingredient

**Request Body:**

```json
{
  "name": "Tomatoes",
  "quantity": 4,
  "unit": "piece",
  "category": "produce",
  "expirationDate": "2025-11-25T00:00:00Z"
}
```

#### GET /ingredients/[id]

Get a specific ingredient

#### PATCH /ingredients/[id]

Update an ingredient

#### DELETE /ingredients/[id]

Delete an ingredient

---

### User

#### GET /user/profile

Get current user profile

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Sarah Chen",
    "email": "sarah@example.com",
    "dietaryRestrictions": ["vegetarian"],
    "allergies": ["peanuts"],
    "cuisinePreferences": ["Italian", "Asian"],
    "createdAt": "2025-11-18T00:00:00Z",
    "updatedAt": "2025-11-18T00:00:00Z"
  }
}
```

#### PATCH /user/profile

Update user profile

**Request Body:**

```json
{
  "name": "Sarah Chen",
  "dietaryRestrictions": ["vegetarian", "vegan"],
  "allergies": ["peanuts", "shellfish"]
}
```

#### GET /user/saved-recipes

Get all saved recipes

#### POST /user/saved-recipes

Save a recipe

**Request Body:**

```json
{
  "id": "1",
  "notes": "Make for dinner party"
}
```

#### GET /user/meal-plan

Get meal plan entries

#### POST /user/meal-plan

Add recipe to meal plan

**Request Body:**

```json
{
  "recipeId": "1",
  "date": "2025-11-25",
  "mealType": "dinner"
}
```

---

### Scanning

#### POST /scan

Process receipt via OCR

**Request Body (option 1 - image upload):**

```json
{
  "image": "base64-encoded-image-data"
}
```

**Request Body (option 2 - manual ingredients):**

```json
{
  "ingredients": [
    {
      "name": "Tomatoes",
      "quantity": 4,
      "unit": "piece",
      "category": "produce"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "ingredients": [...],
    "confidence": 0.95,
    "message": "Receipt processed successfully"
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

**Common Error Codes:**

- `INVALID_REQUEST` (400) - Missing or invalid parameters
- `NOT_FOUND` (404) - Resource not found
- `METHOD_NOT_ALLOWED` (405) - HTTP method not allowed
- `INTERNAL_SERVER_ERROR` (500) - Server error
