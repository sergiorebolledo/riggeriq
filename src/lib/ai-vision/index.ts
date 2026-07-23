import "server-only";
import type { AIVisionProvider } from "./types";

export type { AIVisionProvider, ExtractedRiggingData } from "./types";

type ProviderName = "gemini" | "claude";

function getProviderName(): ProviderName {
  return process.env.AI_VISION_PROVIDER === "claude" ? "claude" : "gemini";
}

function isPlaceholder(value: string | undefined): boolean {
  return !value || value.includes("placeholder");
}

/**
 * true una vez que el proveedor de IA seleccionado (AI_VISION_PROVIDER)
 * tiene su API key real configurada en .env.local. Mientras sea el valor
 * de marcador de posición, el endpoint de vision responde con un error
 * claro en vez de intentar llamar a la API externa.
 */
export function isAIVisionConfigured(): boolean {
  const provider = getProviderName();
  const apiKey =
    provider === "claude" ? process.env.ANTHROPIC_API_KEY : process.env.GEMINI_API_KEY;
  return !isPlaceholder(apiKey);
}

export async function getAIVisionProvider(): Promise<AIVisionProvider> {
  const provider = getProviderName();

  if (provider === "claude") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (isPlaceholder(apiKey)) {
      throw new Error("ANTHROPIC_API_KEY no está configurado en .env.local.");
    }
    const { ClaudeVisionProvider } = await import("./claude-provider");
    return new ClaudeVisionProvider(apiKey!, process.env.ANTHROPIC_VISION_MODEL);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (isPlaceholder(apiKey)) {
    throw new Error("GEMINI_API_KEY no está configurado en .env.local.");
  }
  const { GeminiVisionProvider } = await import("./gemini-provider");
  return new GeminiVisionProvider(apiKey!, process.env.GEMINI_MODEL);
}
