"use client";

import { useId, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { calculateCenterOfGravity } from "@/lib/center-of-gravity";

interface LoadRow {
  id: string;
  label: string;
  xM: string;
  yM: string;
  weightKg: string;
}

const DEFAULT_ROWS: LoadRow[] = [
  { id: "1", label: "Componente A", xM: "0", yM: "0", weightKg: "500" },
  { id: "2", label: "Componente B", xM: "3", yM: "1.2", weightKg: "300" },
];

function parseFloatOrNull(value: string): number | null {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function CenterOfGravityCalculator() {
  const [rows, setRows] = useState<LoadRow[]>(DEFAULT_ROWS);
  const nextId = useId();
  const [rowCounter, setRowCounter] = useState(DEFAULT_ROWS.length);

  function updateRow(id: string, patch: Partial<Omit<LoadRow, "id">>) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function addRow() {
    const newCounter = rowCounter + 1;
    setRowCounter(newCounter);
    setRows((prev) => [
      ...prev,
      { id: `${nextId}-${newCounter}`, label: `Componente ${newCounter}`, xM: "0", yM: "0", weightKg: "100" },
    ]);
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  const { result, error } = useMemo(() => {
    const parsedLoads = rows.map((row) => ({
      label: row.label,
      xM: parseFloatOrNull(row.xM),
      yM: parseFloatOrNull(row.yM),
      weightKg: parseFloatOrNull(row.weightKg),
    }));

    if (parsedLoads.some((load) => load.xM === null || load.yM === null || load.weightKg === null)) {
      return { result: null, error: "Completa las coordenadas y el peso de cada componente." };
    }

    try {
      const result = calculateCenterOfGravity(
        parsedLoads.map((load) => ({
          label: load.label,
          xM: load.xM as number,
          yM: load.yM as number,
          weightKg: load.weightKg as number,
        })),
      );
      return { result, error: null };
    } catch (err) {
      return { result: null, error: err instanceof Error ? err.message : "Datos inválidos." };
    }
  }, [rows]);

  const validLoads = rows
    .map((row) => ({
      label: row.label,
      xM: parseFloatOrNull(row.xM),
      yM: parseFloatOrNull(row.yM),
      weightKg: parseFloatOrNull(row.weightKg),
    }))
    .filter(
      (load): load is { label: string; xM: number; yM: number; weightKg: number } =>
        load.xM !== null && load.yM !== null && load.weightKg !== null,
    );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Componentes</h3>
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" /> Agregar
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[1fr_auto] items-end gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <label className="col-span-2 flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400 sm:col-span-1">
                  Nombre
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => updateRow(row.id, { label: e.target.value })}
                    className="rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:text-zinc-50"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  X (m)
                  <input
                    type="number"
                    value={row.xM}
                    onChange={(e) => updateRow(row.id, { xM: e.target.value })}
                    className="rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:text-zinc-50"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Y (m)
                  <input
                    type="number"
                    value={row.yM}
                    onChange={(e) => updateRow(row.id, { yM: e.target.value })}
                    className="rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:text-zinc-50"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Peso (kg)
                  <input
                    type="number"
                    value={row.weightKg}
                    onChange={(e) => updateRow(row.id, { weightKg: e.target.value })}
                    className="rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:text-zinc-50"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={rows.length <= 1}
                aria-label={`Eliminar ${row.label}`}
                className="rounded-md p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-950/40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Resultado</h3>
        {error && (
          <div className="rounded-xl border border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            {error}
          </div>
        )}
        {result && (
          <>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-600 dark:text-zinc-400">Centro de gravedad (X, Y)</dt>
                  <dd className="font-mono font-medium">
                    ({result.xM.toFixed(2)} m, {result.yM.toFixed(2)} m)
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-600 dark:text-zinc-400">Peso total</dt>
                  <dd className="font-mono font-medium">
                    {result.totalWeightKg.toLocaleString("es-CL")} kg
                  </dd>
                </div>
              </dl>
            </div>
            <CenterOfGravityPlot loads={validLoads} cogXM={result.xM} cogYM={result.yM} />
          </>
        )}
      </div>
    </div>
  );
}

interface CenterOfGravityPlotProps {
  loads: { label: string; xM: number; yM: number; weightKg: number }[];
  cogXM: number;
  cogYM: number;
}

function CenterOfGravityPlot({ loads, cogXM, cogYM }: CenterOfGravityPlotProps) {
  const size = 240;
  const padding = 30;
  const xs = loads.map((l) => l.xM).concat(cogXM);
  const ys = loads.map((l) => l.yM).concat(cogYM);
  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, 1);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 1);
  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  const maxWeight = Math.max(...loads.map((l) => l.weightKg), 1);

  const toSvg = (xM: number, yM: number) => ({
    x: padding + ((xM - minX) / spanX) * (size - 2 * padding),
    y: size - padding - ((yM - minY) / spanY) * (size - 2 * padding),
  });

  const cog = toSvg(cogXM, cogYM);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-xs mx-auto">
        <rect
          x={padding}
          y={padding}
          width={size - 2 * padding}
          height={size - 2 * padding}
          fill="none"
          stroke="currentColor"
          strokeDasharray="4 4"
          className="text-zinc-300 dark:text-zinc-700"
        />
        {loads.map((load) => {
          const point = toSvg(load.xM, load.yM);
          const radius = 4 + (load.weightKg / maxWeight) * 10;
          return (
            <g key={load.label}>
              <circle cx={point.x} cy={point.y} r={radius} className="fill-blue-400/60" />
              <text
                x={point.x}
                y={point.y - radius - 4}
                textAnchor="middle"
                className="fill-zinc-600 text-[8px] dark:fill-zinc-400"
              >
                {load.label}
              </text>
            </g>
          );
        })}
        <g>
          <line
            x1={cog.x - 8}
            y1={cog.y}
            x2={cog.x + 8}
            y2={cog.y}
            stroke="currentColor"
            className="text-red-600 dark:text-red-400"
            strokeWidth={2}
          />
          <line
            x1={cog.x}
            y1={cog.y - 8}
            x2={cog.x}
            y2={cog.y + 8}
            stroke="currentColor"
            className="text-red-600 dark:text-red-400"
            strokeWidth={2}
          />
          <circle
            cx={cog.x}
            cy={cog.y}
            r={3}
            className="fill-red-600 dark:fill-red-400"
          />
        </g>
      </svg>
      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Marcador rojo = centro de gravedad estimado
      </p>
    </div>
  );
}
