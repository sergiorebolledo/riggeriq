/**
 * Datos que la IA de vision intenta extraer de una foto de un plano o
 * croquis de izaje (PRD seccion 4, Opcion B). Cualquier campo puede venir
 * ausente si no es visible en la imagen.
 */
export interface ExtractedRiggingData {
  totalWeightKg?: number;
  numberOfLegs?: number;
  baseWidthM?: number;
  baseLengthM?: number;
  slingLengthM?: number;
}

/**
 * Adaptador comun para cualquier proveedor de IA multimodal (Gemini,
 * Claude, u otro que se agregue despues). Permite cambiar de proveedor
 * sin tocar la ruta de API ni el componente de UI.
 */
export interface AIVisionProvider {
  name: string;
  extractRiggingData(imageBase64: string, mimeType: string): Promise<ExtractedRiggingData>;
}
