import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
});

export async function extractTextFromImage(
  base64Image: string,
): Promise<string[]> {
  try {
    // Remove data URI prefix if present
    const imageBuffer = Buffer.from(
      base64Image.replace(/^data:image\/[a-z]+;base64,/, ""),
      "base64",
    );

    const request = {
      image: {
        content: imageBuffer,
      },
    };

    const [result] = await client.documentText(request);
    const fullText = result.fullText;

    // Split text into lines and filter out empty lines
    const lines = fullText
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);

    return lines;
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Failed to extract text from receipt image");
  }
}
