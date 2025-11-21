import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ParsedIngredient {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

export async function parseReceiptText(
  textLines: string[],
): Promise<ParsedIngredient[]> {
  try {
    const receiptText = textLines.join("\n");

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a grocery receipt interpreter. Parse the following receipt text and extract grocery items with their quantities and units. Return a JSON array of objects with this structure: { name: string, quantity: number, unit: string, category: string }

Categories should be one of: vegetables, fruits, dairy, meat, grains, pantry, frozen, beverages, snacks, other

Ignore store information, dates, totals, and other non-item text. Only return actual grocery items.

Receipt text:
${receiptText}

Return ONLY a valid JSON array, no other text.`,
        },
      ],
    });

    // Extract the text content from the response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn("No JSON array found in Claude response");
      return [];
    }

    const ingredients: ParsedIngredient[] = JSON.parse(jsonMatch[0]);

    // Validate and clean ingredients
    return ingredients.filter(
      (item): item is ParsedIngredient =>
        typeof item.name === "string" &&
        typeof item.quantity === "number" &&
        typeof item.unit === "string" &&
        typeof item.category === "string" &&
        item.name.length > 0,
    );
  } catch (error) {
    console.error("Receipt parsing error:", error);
    throw new Error("Failed to parse receipt items");
  }
}
