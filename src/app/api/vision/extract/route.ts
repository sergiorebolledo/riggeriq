import { NextResponse } from "next/server";
import { getCurrentPlan } from "@/lib/profile";
import { getAIVisionProvider, isAIVisionConfigured } from "@/lib/ai-vision";

export async function POST(request: Request) {
  const plan = await getCurrentPlan();
  if (plan !== "pro") {
    return NextResponse.json(
      { error: "La lectura de planos por IA es un beneficio Pro." },
      { status: 403 },
    );
  }

  if (!isAIVisionConfigured()) {
    return NextResponse.json(
      {
        error:
          "El proveedor de IA todavía no está configurado. Agrega GEMINI_API_KEY o ANTHROPIC_API_KEY en .env.local.",
      },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const imageBase64 = body?.imageBase64;
  const mimeType = body?.mimeType;

  if (typeof imageBase64 !== "string" || typeof mimeType !== "string") {
    return NextResponse.json({ error: "Falta la imagen a analizar." }, { status: 400 });
  }

  try {
    const provider = await getAIVisionProvider();
    const data = await provider.extractRiggingData(imageBase64, mimeType);
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al procesar la imagen." },
      { status: 500 },
    );
  }
}
