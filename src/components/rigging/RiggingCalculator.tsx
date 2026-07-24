"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Lock } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  HITCH_TYPES,
  calculateBaseRadius,
  calculateRequiredSlingLength,
  calculateRigging,
  type NormativeCode,
  type RiggingInput,
  type RiggingResult,
  type SlingHitchType,
} from "@/lib/rigging-calculator";
import type { Plan } from "@/lib/profile";
import type { ExtractedRiggingData } from "@/lib/ai-vision/types";
import { NumberField } from "./NumberField";
import { NormativeSelect } from "./NormativeSelect";
import { HitchTypeSelect } from "./HitchTypeSelect";
import { RiggingResultCards } from "./RiggingResultCards";
import { EquipmentCatalogPicker } from "./EquipmentCatalogPicker";
import { PhotoExtractButton } from "./vision/PhotoExtractButton";

const GeneratePdfButton = dynamic(
  () => import("./pdf/GeneratePdfButton").then((mod) => mod.GeneratePdfButton),
  { ssr: false },
);

const RiggingDiagram = dynamic(
  () => import("./diagram/RiggingDiagram").then((mod) => mod.RiggingDiagram),
  { ssr: false },
);

type CalculationMode = "length" | "angle";

/**
 * Ancho interno usado cuando la carga NO tiene orejas de izaje (ej.
 * tubería con puntos de amarre en línea): al hacer baseWidthM ≈ 0, el
 * radio de base r = √((ancho/2)² + (largo/2)²) se reduce a largo/2, que
 * es exactamente la geometría de dos puntos de amarre alineados a lo
 * largo del objeto. No puede ser exactamente 0 (el motor exige > 0).
 */
const NO_LUGS_WIDTH_M = "0.001";

interface FormState {
  totalWeightKg: string;
  numberOfLegs: string;
  numberOfShackles: string;
  baseWidthM: string;
  baseLengthM: string;
  slingLengthM: string;
  desiredAngleDegrees: string;
  slingWLLKg: string;
  shackleWLLKg: string;
  hitchType: SlingHitchType;
  norm: NormativeCode;
}

type NumericFormField = Exclude<keyof FormState, "norm" | "hitchType">;

const DEFAULT_FORM: FormState = {
  totalWeightKg: "4000",
  numberOfLegs: "4",
  numberOfShackles: "4",
  baseWidthM: "1.5",
  baseLengthM: "1.5",
  slingLengthM: "3",
  desiredAngleDegrees: "60",
  slingWLLKg: "6000",
  shackleWLLKg: "6000",
  hitchType: "vertical",
  norm: "ASME",
};

interface RiggingExample {
  title: string;
  description: string;
  form: FormState;
}

const EXAMPLES: RiggingExample[] = [
  {
    title: "Izaje simétrico seguro",
    description: "4 patas, ángulo abierto y WLL amplio.",
    form: DEFAULT_FORM,
  },
  {
    title: "Ángulo cerrado (precaución)",
    description: "Mismas orejas, eslingas más cortas.",
    form: {
      ...DEFAULT_FORM,
      slingLengthM: "1.8",
    },
  },
  {
    title: "WLL insuficiente (peligro)",
    description: "Carga pesada con aparejos de baja capacidad.",
    form: {
      totalWeightKg: "10000",
      numberOfLegs: "2",
      numberOfShackles: "2",
      baseWidthM: "1",
      baseLengthM: "1",
      slingLengthM: "3",
      desiredAngleDegrees: "60",
      slingWLLKg: "4000",
      shackleWLLKg: "4000",
      hitchType: "vertical",
      norm: "ASME",
    },
  },
];

function parsePositiveFloat(value: string): number | null {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

interface RiggingCalculatorProps {
  plan: Plan;
}

export function RiggingCalculator({ plan }: RiggingCalculatorProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [mode, setMode] = useState<CalculationMode>("length");
  const [hasLugs, setHasLugs] = useState(true);
  const previousStatus = useRef<RiggingResult["status"] | null>(null);

  const setField = (key: NumericFormField) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function handleHasLugsChange(nextHasLugs: boolean) {
    setHasLugs(nextHasLugs);
    setForm((prev) => ({
      ...prev,
      baseWidthM: nextHasLugs ? DEFAULT_FORM.baseWidthM : NO_LUGS_WIDTH_M,
    }));
  }

  function handleExtracted(data: ExtractedRiggingData) {
    setForm((prev) => ({
      ...prev,
      ...(data.totalWeightKg != null && { totalWeightKg: String(data.totalWeightKg) }),
      ...(data.numberOfLegs != null && { numberOfLegs: String(data.numberOfLegs) }),
      ...(data.baseWidthM != null && { baseWidthM: String(data.baseWidthM) }),
      ...(data.baseLengthM != null && { baseLengthM: String(data.baseLengthM) }),
      ...(data.slingLengthM != null && { slingLengthM: String(data.slingLengthM) }),
    }));
    setMode("length");
  }

  const { input, result, error, invalidFields, requiredSlingLengthM } = useMemo((): {
    input: RiggingInput | null;
    result: RiggingResult | null;
    error: string | null;
    invalidFields: Partial<Record<NumericFormField, boolean>>;
    requiredSlingLengthM: number | null;
  } => {
    const baseFields: NumericFormField[] = [
      "totalWeightKg",
      "numberOfLegs",
      "numberOfShackles",
      "baseWidthM",
      "baseLengthM",
      "slingWLLKg",
      "shackleWLLKg",
    ];
    const modeField: NumericFormField = mode === "length" ? "slingLengthM" : "desiredAngleDegrees";
    const numericFields = [...baseFields, modeField];

    const parsed = Object.fromEntries(
      numericFields.map((key) => [key, parsePositiveFloat(form[key])]),
    ) as Record<NumericFormField, number | null>;

    const invalidFields: Partial<Record<NumericFormField, boolean>> = {};
    for (const key of numericFields) {
      if (parsed[key] === null) invalidFields[key] = true;
    }
    if (parsed.numberOfLegs !== null && !Number.isInteger(parsed.numberOfLegs)) {
      invalidFields.numberOfLegs = true;
    }
    if (parsed.numberOfShackles !== null && !Number.isInteger(parsed.numberOfShackles)) {
      invalidFields.numberOfShackles = true;
    }

    if (Object.keys(invalidFields).length > 0) {
      return {
        input: null,
        result: null,
        error:
          "Completa todos los campos con valores mayores a 0 (N° de patas y de grilletes deben ser enteros).",
        invalidFields,
        requiredSlingLengthM: null,
      };
    }

    try {
      let slingLengthM: number;
      let requiredSlingLengthM: number | null = null;

      if (mode === "length") {
        slingLengthM = parsed.slingLengthM!;
      } else {
        const baseRadiusM = calculateBaseRadius(parsed.baseWidthM!, parsed.baseLengthM!);
        slingLengthM = calculateRequiredSlingLength(baseRadiusM, parsed.desiredAngleDegrees!);
        requiredSlingLengthM = slingLengthM;
      }

      const input: RiggingInput = {
        totalWeightKg: parsed.totalWeightKg!,
        numberOfLegs: parsed.numberOfLegs!,
        numberOfShackles: parsed.numberOfShackles!,
        baseWidthM: parsed.baseWidthM!,
        baseLengthM: parsed.baseLengthM!,
        slingLengthM,
        slingWLLKg: parsed.slingWLLKg!,
        shackleWLLKg: parsed.shackleWLLKg!,
        hitchType: form.hitchType,
        norm: form.norm,
      };

      const result = calculateRigging(input);
      return { input, result, error: null, invalidFields: {}, requiredSlingLengthM };
    } catch (err) {
      return {
        input: null,
        result: null,
        error: err instanceof Error ? err.message : "Datos inválidos.",
        invalidFields: {},
        requiredSlingLengthM: null,
      };
    }
  }, [form, mode]);

  useEffect(() => {
    if (
      result?.status === "danger" &&
      previousStatus.current !== "danger" &&
      typeof navigator !== "undefined" &&
      "vibrate" in navigator
    ) {
      navigator.vibrate([200, 100, 200]);
    }
    previousStatus.current = result?.status ?? null;
  }, [result?.status]);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Ejemplos precargados
          </h2>
          <button
            type="button"
            onClick={() => {
              setForm(DEFAULT_FORM);
              setMode("length");
              setHasLugs(true);
            }}
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Restablecer
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {EXAMPLES.map((example) => (
            <button
              key={example.title}
              type="button"
              onClick={() => {
                setForm(example.form);
                setMode("length");
                setHasLugs(true);
              }}
              className="flex flex-col items-start gap-1 rounded-xl border border-zinc-200 bg-white p-3 text-left transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
            >
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {example.title}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {example.description}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Datos de la maniobra
            </h2>
            <div className="flex rounded-lg border border-zinc-300 p-0.5 text-xs dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setMode("length")}
                className={`rounded-md px-2 py-1 font-medium transition-colors ${
                  mode === "length"
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                Desde longitud
              </button>
              <button
                type="button"
                onClick={() => setMode("angle")}
                className={`rounded-md px-2 py-1 font-medium transition-colors ${
                  mode === "angle"
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                Desde ángulo deseado
              </button>
            </div>
          </div>

          {plan === "pro" ? (
            <PhotoExtractButton onExtracted={handleExtracted} />
          ) : (
            <Link
              href="/precios"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-500 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
            >
              <Lock className="h-4 w-4" />
              Leer plano con IA es un beneficio Pro — actualiza tu plan
            </Link>
          )}

          <div className="grid grid-cols-2 gap-4">
            <NormativeSelect
              value={form.norm}
              onChange={(norm) => setForm((prev) => ({ ...prev, norm }))}
            />
            <HitchTypeSelect
              value={form.hitchType}
              onChange={(hitchType) => setForm((prev) => ({ ...prev, hitchType }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NumberField
              id="totalWeightKg"
              label="Peso total"
              unit="kg"
              value={form.totalWeightKg}
              onChange={setField("totalWeightKg")}
              invalid={invalidFields.totalWeightKg}
            />
            <NumberField
              id="numberOfLegs"
              label={hasLugs ? "N° de patas" : "N° de puntos de amarre"}
              unit=""
              min={1}
              step={1}
              value={form.numberOfLegs}
              onChange={setField("numberOfLegs")}
              invalid={invalidFields.numberOfLegs}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NumberField
              id="numberOfShackles"
              label="N° de grilletes"
              unit=""
              min={1}
              step={1}
              value={form.numberOfShackles}
              onChange={setField("numberOfShackles")}
              invalid={invalidFields.numberOfShackles}
            />
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                ¿La carga tiene orejas de izaje?
              </span>
              <div className="flex rounded-lg border border-zinc-300 p-0.5 text-xs dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => handleHasLugsChange(true)}
                  className={`rounded-md px-2 py-1 font-medium transition-colors ${
                    hasLugs
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => handleHasLugsChange(false)}
                  className={`rounded-md px-2 py-1 font-medium transition-colors ${
                    !hasLugs
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  No
                </button>
              </div>
            </div>
            {!hasLugs && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Para tubería u objetos sin orejas: modela puntos de amarre (ahorcados) en línea a
                lo largo del objeto.
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              {hasLugs && (
                <NumberField
                  id="baseWidthM"
                  label="Ancho de orejas (X)"
                  unit="m"
                  value={form.baseWidthM}
                  onChange={setField("baseWidthM")}
                  invalid={invalidFields.baseWidthM}
                />
              )}
              <NumberField
                id="baseLengthM"
                label={hasLugs ? "Largo de orejas (Y)" : "Distancia entre puntos de amarre"}
                unit="m"
                value={form.baseLengthM}
                onChange={setField("baseLengthM")}
                invalid={invalidFields.baseLengthM}
              />
            </div>
          </div>

          {mode === "length" ? (
            <NumberField
              id="slingLengthM"
              label="Longitud de eslinga"
              unit="m"
              value={form.slingLengthM}
              onChange={setField("slingLengthM")}
              invalid={invalidFields.slingLengthM}
            />
          ) : (
            <NumberField
              id="desiredAngleDegrees"
              label="Ángulo deseado"
              unit="°"
              value={form.desiredAngleDegrees}
              onChange={setField("desiredAngleDegrees")}
              invalid={invalidFields.desiredAngleDegrees}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <NumberField
              id="slingWLLKg"
              label="WLL eslinga"
              unit="kg"
              value={form.slingWLLKg}
              onChange={setField("slingWLLKg")}
              invalid={invalidFields.slingWLLKg}
            />
            <NumberField
              id="shackleWLLKg"
              label="WLL grillete"
              unit="kg"
              value={form.shackleWLLKg}
              onChange={setField("shackleWLLKg")}
              invalid={invalidFields.shackleWLLKg}
            />
          </div>

          <EquipmentCatalogPicker
            onSelectSling={(wllKg) => setField("slingWLLKg")(String(wllKg))}
            onSelectShackle={(wllKg) => setField("shackleWLLKg")(String(wllKg))}
          />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Resultados en vivo
          </h2>
          {error && (
            <div className="rounded-xl border border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
              {error}
            </div>
          )}
          {requiredSlingLengthM !== null && (
            <div className="rounded-xl border border-blue-300 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
              Longitud de eslinga requerida:{" "}
              <span className="font-mono font-semibold">
                {requiredSlingLengthM.toFixed(2)} m
              </span>{" "}
              para alcanzar {form.desiredAngleDegrees}°.
            </div>
          )}
          {input && result && (
            <>
              <div className="flex justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
                <RiggingDiagram
                  baseRadiusM={result.baseRadiusM}
                  slingAngleDegrees={result.slingAngleDegrees}
                  totalWeightKg={input.totalWeightKg}
                  tensionPerLegKg={result.tensionPerLegKg}
                  status={result.status}
                />
              </div>
              <RiggingResultCards
                result={result}
                totalWeightKg={input.totalWeightKg}
                numberOfLegs={input.numberOfLegs}
                numberOfShackles={input.numberOfShackles}
                hitchLabel={HITCH_TYPES[input.hitchType].label}
              />
              {plan === "pro" ? (
                <GeneratePdfButton input={input} result={result} />
              ) : (
                <Link
                  href="/precios"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-500 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
                >
                  <Lock className="h-4 w-4" />
                  Exportar PDF es un beneficio Pro — actualiza tu plan
                </Link>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
