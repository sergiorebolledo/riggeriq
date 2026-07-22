"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { FileDown, Loader2 } from "lucide-react";
import type { RiggingInput, RiggingResult } from "@/lib/rigging-calculator";
import { PlanDeIzajePDF } from "./PlanDeIzajePDF";

interface GeneratePdfButtonProps {
  input: RiggingInput;
  result: RiggingResult;
}

export function GeneratePdfButton({ input, result }: GeneratePdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleClick() {
    setIsGenerating(true);
    try {
      const blob = await pdf(
        <PlanDeIzajePDF input={input} result={result} generatedAt={new Date()} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `plan-de-izaje-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isGenerating}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {isGenerating ? "Generando PDF..." : "Generar y Descargar PDF Oficial"}
    </button>
  );
}
