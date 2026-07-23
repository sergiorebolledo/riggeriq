import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { AIVisionProvider, ExtractedRiggingData } from "./types";
import { EXTRACTION_PROMPT, parseExtractionResponse } from "./prompt";

type AnthropicImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export class ClaudeVisionProvider implements AIVisionProvider {
  name = "claude";
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model = "claude-sonnet-5") {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async extractRiggingData(imageBase64: string, mimeType: string): Promise<ExtractedRiggingData> {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as AnthropicImageMediaType,
                data: imageBase64,
              },
            },
            { type: "text", text: EXTRACTION_PROMPT },
          ],
        },
      ],
    });

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    return parseExtractionResponse(text);
  }
}
