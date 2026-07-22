"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  calculateBaseRadius,
  calculateRequiredSlingLength,
  calculateRigging,
  type NormativeCode,
  type RiggingInput,
  type RiggingResult,
} from "@/lib/rigging-calculator";
import { NumberField } from "./NumberField";
import { NormativeSelect } from "./NormativeSelect";
import { RiggingResultCards } from "./RiggingResultCards";

const GeneratePdfButton = dynamic(
  () => import("./pdf/GeneratePdfButton").then((mod) => mod.GeneratePdfButton),
  { ssr: false },
);

type CalculationMode = "length" | "angle";

interface FormState {
  totalWeightKg: string;
  numberOfLegs: string;
  baseWidthM: string;
  baseLengthM: string;
  slingLengthM: string;
  desiredAngleDegrees: string;
  slingWLLKg: string;
  shackleWLLKg: string;
  norm: NormativeCode;
}

type NumericFormField = Exclude<keyof FormState, "norm">;

const DEFAULT_FORM: FormState = {
  totalWeightKg: "4000",
  numberOfLegs: "4",
  baseWidthM: "1.5",
  baseLengthM: "1.5",
  slingLengthM: "3",
  desiredAngleDegrees: "60",
  slingWLLKg: "6000",
  shackleWLLKg: "6000",
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
      baseWidthM: "1",
      baseLengthM: "1",
      slingLengthM: "3",
      desiredAngleDegrees: "60",
      slingWLLKg: "4000",
      shackleWLLKg: "4000",
      norm: "ASME",
    },
  },
];

function parsePositiveFloat(value: string): number | null {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function RiggingCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [mode, setMode] = useState<CalculationMode>("length");
  const previousStatus = useRef<RiggingResult["status"] | null>(null);

  const setField = (key: NumericFormField) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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

    if (Object.keys(invalidFields).length > 0) {
      return {
        input: null,
        result: null,
        error: "Completa todos los campos con valores mayores a 0 (N° de patas debe ser entero).",
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
        baseWidthM: parsed.baseWidthM!,
        baseLengthM: parsed.baseLengthM!,
        slingLengthM,
        slingWLLKg: parsed.slingWLLKg!,
        shackleWLLKg: parsed.shackleWLLKg!,
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

          <NormativeSelect
            value={form.norm}
            onChange={(norm) => setForm((prev) => ({ ...prev, norm }))}
          />

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
              label="N° de patas"
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
              id="baseWidthM"
              label="Ancho de orejas (X)"
              unit="m"
              value={form.baseWidthM}
              onChange={setField("baseWidthM")}
              invalid={invalidFields.baseWidthM}
            />
            <NumberField
              id="baseLengthM"
              label="Largo de orejas (Y)"
              unit="m"
              value={form.baseLengthM}
              onChange={setField("baseLengthM")}
              invalid={invalidFields.baseLengthM}
            />
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
              <RiggingResultCards
                result={result}
                totalWeightKg={input.totalWeightKg}
                numberOfLegs={input.numberOfLegs}
              />
              <GeneratePdfButton input={input} result={result} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
