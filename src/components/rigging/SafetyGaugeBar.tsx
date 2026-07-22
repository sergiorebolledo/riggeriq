interface SafetyGaugeBarProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  dangerBelow: number;
  warningBelow: number;
}

/**
 * Barra tipo velocímetro: verde/amarillo/rojo con un marcador en el valor actual.
 * Usada tanto para el ángulo de eslinga como para el factor de seguridad mínimo.
 */
export function SafetyGaugeBar({
  label,
  value,
  unit,
  min,
  max,
  dangerBelow,
  warningBelow,
}: SafetyGaugeBarProps) {
  const clampedValue = Math.min(Math.max(value, min), max);
  const percent = ((clampedValue - min) / (max - min)) * 100;
  const dangerPercent = ((dangerBelow - min) / (max - min)) * 100;
  const warningPercent = ((warningBelow - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
        <span className="font-mono text-zinc-900 dark:text-zinc-50">
          {value.toFixed(1)} {unit}
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="absolute inset-y-0 left-0 bg-red-500"
          style={{ width: `${Math.max(dangerPercent, 0)}%` }}
        />
        <div
          className="absolute inset-y-0 bg-yellow-400"
          style={{
            left: `${Math.max(dangerPercent, 0)}%`,
            width: `${Math.max(warningPercent - dangerPercent, 0)}%`,
          }}
        />
        <div
          className="absolute inset-y-0 bg-green-500"
          style={{
            left: `${Math.max(warningPercent, 0)}%`,
            width: `${Math.max(100 - warningPercent, 0)}%`,
          }}
        />
        <div
          className="absolute top-0 h-3 w-0.5 bg-zinc-900 shadow dark:bg-white"
          style={{ left: `${percent}%` }}
        />
      </div>
    </div>
  );
}
