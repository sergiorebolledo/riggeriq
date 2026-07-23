import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIVisionProvider, ExtractedRiggingData } from "./types";
import { EXTRACTION_PROMPT, parseExtractionResponse } from "./prompt";

export class GeminiVisionProvider implements AIVisionProvider {
  name = "gemini";
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model = "gemini-1.5-flash") {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async extractRiggingData(imageBase64: string, mimeType: string): Promise<ExtractedRiggingData> {
    const model = this.client.getGenerativeModel({ model: this.model });
    const result = await model.generateContent([
      EXTRACTION_PROMPT,
      { inlineData: { data: imageBase64, mimeType } },
    ]);
    return parseExtractionResponse(result.response.text());
  }
}
