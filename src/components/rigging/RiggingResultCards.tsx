import { AlertTriangle, CheckCircle2, XOctagon } from "lucide-react";
import type { RiggingResult } from "@/lib/rigging-calculator";
import { SafetyGaugeBar } from "./SafetyGaugeBar";

const STATUS_CONFIG = {
  safe: {
    label: "SEGURO",
    description: "Ángulo y factores de seguridad dentro de rango.",
    icon: CheckCircle2,
    classes:
      "border-green-500/40 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300",
  },
  warning: {
    label: "PRECAUCIÓN",
    description: "Ángulo o factor de seguridad cercano al límite. Revisa la maniobra.",
    icon: AlertTriangle,
    classes:
      "border-yellow-500/40 bg-yellow-50 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300",
  },
  danger: {
    label: "PELIGRO",
    description: "Condición insegura: no proceder con la maniobra.",
    icon: XOctagon,
    classes: "border-red-500/40 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  },
} as const;

interface RiggingResultCardsProps {
  result: RiggingResult;
  totalWeightKg: number;
  numberOfLegs: number;
  numberOfShackles: number;
  hitchLabel: string;
}

export function RiggingResultCards({
  result,
  totalWeightKg,
  numberOfLegs,
  numberOfShackles,
  hitchLabel,
}: RiggingResultCardsProps) {
  const statusConfig = STATUS_CONFIG[result.status];
  const StatusIcon = statusConfig.icon;
  const minSafetyFactor = Math.min(result.slingSafetyFactor, result.shackleSafetyFactor);

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`flex items-center gap-3 rounded-xl border-2 p-4 ${statusConfig.classes}`}
        role="status"
      >
        <StatusIcon className="h-8 w-8 shrink-0" />
        <div>
          <p className="text-lg font-bold leading-tight">{statusConfig.label}</p>
          <p className="text-sm opacity-90">{statusConfig.description}</p>
        </div>
      </div>

      {result.warnings.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-lg border border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {result.warnings.map((warning, index) => (
            <li key={index} className="flex gap-2">
              <span aria-hidden>⚠️</span>
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Resumen del izaje
          </h3>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-600 dark:text-zinc-400">Peso total</dt>
              <dd className="font-mono font-medium">{totalWeightKg.toLocaleString("es-CL")} kg</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-600 dark:text-zinc-400">N° de patas</dt>
              <dd className="font-mono font-medium">{numberOfLegs}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-600 dark:text-zinc-400">N° de grilletes</dt>
              <dd className="font-mono font-medium">{numberOfShackles}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-600 dark:text-zinc-400">Montaje de eslinga</dt>
              <dd className="font-medium">{hitchLabel}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-600 dark:text-zinc-400">Radio de base</dt>
              <dd className="font-mono font-medium">{result.baseRadiusM.toFixed(2)} m</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-600 dark:text-zinc-400">Ángulo de eslinga (θ)</dt>
              <dd className="font-mono font-medium">{result.slingAngleDegrees.toFixed(1)}°</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Tensiones calculadas
          </h3>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-600 dark:text-zinc-400">Factor de amplificación (FA)</dt>
              <dd className="font-mono font-medium">{result.amplificationFactor.toFixed(3)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-600 dark:text-zinc-400">Tensión por eslinga (T)</dt>
              <dd className="font-mono font-medium">{result.tensionPerLegKg.toFixed(1)} kg</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-600 dark:text-zinc-400">WLL eslinga efectivo</dt>
              <dd className="font-mono font-medium">{result.effectiveSlingWLLKg.toFixed(0)} kg</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-600 dark:text-zinc-400">FS eslinga</dt>
              <dd className="font-mono font-medium">{result.slingSafetyFactor.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-600 dark:text-zinc-400">FS grillete</dt>
              <dd className="font-mono font-medium">{result.shackleSafetyFactor.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Semáforo de seguridad
        </h3>
        <div className="flex flex-col gap-4">
          <SafetyGaugeBar
            label="Ángulo de eslinga"
            value={result.slingAngleDegrees}
            unit="°"
            min={0}
            max={90}
            dangerBelow={45}
            warningBelow={60}
          />
          <SafetyGaugeBar
            label="Factor de seguridad mínimo"
            value={minSafetyFactor}
            unit="x"
            min={0}
            max={10}
            dangerBelow={4}
            warningBelow={5}
          />
        </div>
      </div>
    </div>
  );
}
