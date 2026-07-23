"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  MATERIAL_LABELS,
  estimateWeight,
  type MaterialType,
  type ShapeInput,
  type ShapeType,
} from "@/lib/weight-estimator";

function buildShapeInput(shape: ShapeType, dimensions: Record<string, number>): ShapeInput {
  switch (shape) {
    case "cylinder":
      return {
        type: "cylinder",
        dimensions: {
          diameterM: dimensions.diameterM,
          lengthM: dimensions.lengthM,
          wallThicknessM: dimensions.wallThicknessM,
        },
      };
    case "plate":
      return {
        type: "plate",
        dimensions: {
          lengthM: dimensions.lengthM,
          widthM: dimensions.widthM,
          thicknessM: dimensions.thicknessM,
        },
      };
    case "ibeam":
      return {
        type: "ibeam",
        dimensions: {
          widthM: dimensions.widthM,
          heightM: dimensions.heightM,
          lengthM: dimensions.lengthM,
          wallThicknessM: dimensions.wallThicknessM,
        },
      };
    case "container":
      return {
        type: "container",
        dimensions: {
          lengthM: dimensions.lengthM,
          widthM: dimensions.widthM,
          heightM: dimensions.heightM,
          wallThicknessM: dimensions.wallThicknessM,
        },
      };
    case "block":
      return {
        type: "block",
        dimensions: {
          lengthM: dimensions.lengthM,
          widthM: dimensions.widthM,
          heightM: dimensions.heightM,
        },
      };
  }
}

const SHAPE_LABELS: Record<ShapeType, string> = {
  cylinder: "Cilindro / Tubería",
  plate: "Placa / Lámina",
  ibeam: "Viga H/I",
  container: "Contenedor",
  block: "Bloque macizo",
};

interface DimensionField {
  key: string;
  label: string;
}

const SHAPE_FIELDS: Record<ShapeType, DimensionField[]> = {
  cylinder: [
    { key: "diameterM", label: "Diámetro (m)" },
    { key: "lengthM", label: "Largo (m)" },
    { key: "wallThicknessM", label: "Grosor de pared (m, 0 = macizo)" },
  ],
  plate: [
    { key: "lengthM", label: "Largo (m)" },
    { key: "widthM", label: "Ancho (m)" },
    { key: "thicknessM", label: "Grosor (m)" },
  ],
  ibeam: [
    { key: "widthM", label: "Ancho (m)" },
    { key: "heightM", label: "Alto (m)" },
    { key: "lengthM", label: "Largo (m)" },
    { key: "wallThicknessM", label: "Grosor (m)" },
  ],
  container: [
    { key: "lengthM", label: "Largo (m)" },
    { key: "widthM", label: "Ancho (m)" },
    { key: "heightM", label: "Alto (m)" },
    { key: "wallThicknessM", label: "Grosor de pared (m)" },
  ],
  block: [
    { key: "lengthM", label: "Largo (m)" },
    { key: "widthM", label: "Ancho (m)" },
    { key: "heightM", label: "Alto (m)" },
  ],
};

const DEFAULT_VALUES: Record<ShapeType, Record<string, string>> = {
  cylinder: { diameterM: "0.3", lengthM: "6", wallThicknessM: "0" },
  plate: { lengthM: "2", widthM: "1", thicknessM: "0.01" },
  ibeam: { widthM: "0.2", heightM: "0.3", lengthM: "6", wallThicknessM: "0.02" },
  container: { lengthM: "6", widthM: "2.4", heightM: "2.6", wallThicknessM: "0.05" },
  block: { lengthM: "1", widthM: "1", heightM: "1" },
};

function parsePositiveFloat(value: string): number | null {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function WeightEstimatorCalculator() {
  const [shape, setShape] = useState<ShapeType>("block");
  const [material, setMaterial] = useState<MaterialType>("steel");
  const [values, setValues] = useState<Record<string, string>>(DEFAULT_VALUES.block);
  const [copied, setCopied] = useState(false);

  function handleShapeChange(nextShape: ShapeType) {
    setShape(nextShape);
    setValues(DEFAULT_VALUES[nextShape]);
    setCopied(false);
  }

  function setFieldValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  }

  const { result, error } = useMemo(() => {
    const fields = SHAPE_FIELDS[shape];
    const parsedEntries = fields.map(
      (field) => [field.key, parsePositiveFloat(values[field.key] ?? "")] as const,
    );
    const hasInvalidField = parsedEntries.some(([, value]) => value === null);

    if (hasInvalidField) {
      return { result: null, error: "Completa todas las dimensiones con valores válidos (≥ 0)." };
    }

    const parsed = Object.fromEntries(parsedEntries) as Record<string, number>;

    try {
      const result = estimateWeight(buildShapeInput(shape, parsed), material);
      return { result, error: null };
    } catch (err) {
      return { result: null, error: err instanceof Error ? err.message : "Datos inválidos." };
    }
  }, [shape, material, values]);

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(Math.round(result.weightKg).toString());
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Geometría</span>
            <select
              value={shape}
              onChange={(e) => handleShapeChange(e.target.value as ShapeType)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              {(Object.keys(SHAPE_LABELS) as ShapeType[]).map((key) => (
                <option key={key} value={key}>
                  {SHAPE_LABELS[key]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Material</span>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value as MaterialType)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              {(Object.keys(MATERIAL_LABELS) as MaterialType[]).map((key) => (
                <option key={key} value={key}>
                  {MATERIAL_LABELS[key]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {SHAPE_FIELDS[shape].map((field) => (
            <label key={field.key} className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{field.label}</span>
              <input
                type="number"
                min={0}
                step="any"
                value={values[field.key] ?? ""}
                onChange={(e) => setFieldValue(field.key, e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {error && (
          <div className="rounded-xl border border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            {error}
          </div>
        )}
        {result && (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-600 dark:text-zinc-400">Volumen estimado</dt>
                <dd className="font-mono font-medium">{result.volumeM3.toFixed(4)} m³</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-600 dark:text-zinc-400">Peso estimado</dt>
                <dd className="font-mono text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {Math.round(result.weightKg).toLocaleString("es-CL")} kg
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={handleCopy}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado" : "Copiar peso (kg)"}
            </button>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Estimación con densidad promedio de referencia, no certificada. Úsalo como punto de
              partida en el campo &quot;Peso total&quot; de la calculadora principal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
