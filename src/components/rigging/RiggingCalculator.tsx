"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import {
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

interface FormState {
  totalWeightKg: string;
  numberOfLegs: string;
  baseWidthM: string;
  baseLengthM: string;
  slingLengthM: string;
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
  const previousStatus = useRef<RiggingResult["status"] | null>(null);

  const setField = (key: NumericFormField) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const { input, result, error, invalidFields } = useMemo((): {
    input: RiggingInput | null;
    result: RiggingResult | null;
    error: string | null;
    invalidFields: Partial<Record<NumericFormField, boolean>>;
  } => {
    const numericFields: NumericFormField[] = [
      "totalWeightKg",
      "numberOfLegs",
      "baseWidthM",
      "baseLengthM",
      "slingLengthM",
      "slingWLLKg",
      "shackleWLLKg",
    ];

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
      };
    }

    const input: RiggingInput = {
      totalWeightKg: parsed.totalWeightKg!,
      numberOfLegs: parsed.numberOfLegs!,
      baseWidthM: parsed.baseWidthM!,
      baseLengthM: parsed.baseLengthM!,
      slingLengthM: parsed.slingLengthM!,
      slingWLLKg: parsed.slingWLLKg!,
      shackleWLLKg: parsed.shackleWLLKg!,
      norm: form.norm,
    };

    try {
      const result = calculateRigging(input);
      return { input, result, error: null, invalidFields: {} };
    } catch (err) {
      return {
        input: null,
        result: null,
        error: err instanceof Error ? err.message : "Datos inválidos.",
        invalidFields: {},
      };
    }
  }, [form]);

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
            onClick={() => setForm(DEFAULT_FORM)}
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
              onClick={() => setForm(example.form)}
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
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Datos de la maniobra
          </h2>

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

          <NumberField
            id="slingLengthM"
            label="Longitud de eslinga"
            unit="m"
            value={form.slingLengthM}
            onChange={setField("slingLengthM")}
            invalid={invalidFields.slingLengthM}
          />

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
