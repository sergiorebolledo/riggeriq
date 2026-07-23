import type { ExtractedRiggingData } from "./types";

export const EXTRACTION_PROMPT = `Eres un asistente que lee planos, croquis o fotos de maniobras de izaje.

Analiza la imagen y extrae SOLO estos datos si son visibles:
- Peso total de la carga, en kg (totalWeightKg)
- Número de patas/eslingas del arreglo (numberOfLegs)
- Ancho del arreglo de puntos de anclaje, en metros (baseWidthM)
- Largo del arreglo de puntos de anclaje, en metros (baseLengthM)
- Longitud de cada eslinga, en metros (slingLengthM)

Responde ÚNICAMENTE con un objeto JSON, sin texto adicional ni bloques de código,
con exactamente esta forma (usa null para cualquier dato que no puedas determinar):

{"totalWeightKg": number|null, "numberOfLegs": number|null, "baseWidthM": number|null, "baseLengthM": number|null, "slingLengthM": number|null}`;

function toFiniteNumberOrUndefined(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** Parsea la respuesta de texto del modelo, tolerando bloques ```json``` accidentales. */
export function parseExtractionResponse(text: string): ExtractedRiggingData {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("La IA no devolvió un JSON válido.");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("La IA no devolvió un objeto JSON.");
  }

  const record = parsed as Record<string, unknown>;
  return {
    totalWeightKg: toFiniteNumberOrUndefined(record.totalWeightKg),
    numberOfLegs: toFiniteNumberOrUndefined(record.numberOfLegs),
    baseWidthM: toFiniteNumberOrUndefined(record.baseWidthM),
    baseLengthM: toFiniteNumberOrUndefined(record.baseLengthM),
    slingLengthM: toFiniteNumberOrUndefined(record.slingLengthM),
  };
}
