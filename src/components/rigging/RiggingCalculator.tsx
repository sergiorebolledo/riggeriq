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

function parsePositiveFloat(value: string): number | null {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function RiggingCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const previousStatus = useRef<RiggingResult["status"] | null>(null);

  const field = (key: keyof Omit<FormState, "norm">) => ({
    value: form[key],
    onChange: (value: string) => setForm((prev) => ({ ...prev, [key]: value })),
  });

  const { input, result, error } = useMemo((): {
    input: RiggingInput | null;
    result: RiggingResult | null;
    error: string | null;
  } => {
    const totalWeightKg = parsePositiveFloat(form.totalWeightKg);
    const numberOfLegs = parsePositiveFloat(form.numberOfLegs);
    const baseWidthM = parsePositiveFloat(form.baseWidthM);
    const baseLengthM = parsePositiveFloat(form.baseLengthM);
    const slingLengthM = parsePositiveFloat(form.slingLengthM);
    const slingWLLKg = parsePositiveFloat(form.slingWLLKg);
    const shackleWLLKg = parsePositiveFloat(form.shackleWLLKg);

    if (
      totalWeightKg === null ||
      numberOfLegs === null ||
      baseWidthM === null ||
      baseLengthM === null ||
      slingLengthM === null ||
      slingWLLKg === null ||
      shackleWLLKg === null
    ) {
      return { input: null, result: null, error: "Completa todos los campos con valores mayores a 0." };
    }

    if (!Number.isInteger(numberOfLegs)) {
      return { input: null, result: null, error: "El número de patas debe ser un número entero." };
    }

    const input: RiggingInput = {
      totalWeightKg,
      numberOfLegs,
      baseWidthM,
      baseLengthM,
      slingLengthM,
      slingWLLKg,
      shackleWLLKg,
      norm: form.norm,
    };

    try {
      const result = calculateRigging(input);
      return { input, result, error: null };
    } catch (err) {
      return { input: null, result: null, error: err instanceof Error ? err.message : "Datos inválidos." };
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
          <NumberField id="totalWeightKg" label="Peso total" unit="kg" {...field("totalWeightKg")} />
          <NumberField id="numberOfLegs" label="N° de patas" unit="" min={1} step={1} {...field("numberOfLegs")} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <NumberField id="baseWidthM" label="Ancho de orejas (X)" unit="m" {...field("baseWidthM")} />
          <NumberField id="baseLengthM" label="Largo de orejas (Y)" unit="m" {...field("baseLengthM")} />
        </div>

        <NumberField id="slingLengthM" label="Longitud de eslinga" unit="m" {...field("slingLengthM")} />

        <div className="grid grid-cols-2 gap-4">
          <NumberField id="slingWLLKg" label="WLL eslinga" unit="kg" {...field("slingWLLKg")} />
          <NumberField id="shackleWLLKg" label="WLL grillete" unit="kg" {...field("shackleWLLKg")} />
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
  );
}
