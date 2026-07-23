import { HITCH_TYPES, type SlingHitchType } from "@/lib/rigging-calculator";

interface HitchTypeSelectProps {
  value: SlingHitchType;
  onChange: (value: SlingHitchType) => void;
}

export function HitchTypeSelect({ value, onChange }: HitchTypeSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="hitchType" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Tipo de montaje de la eslinga
      </label>
      <select
        id="hitchType"
        value={value}
        onChange={(e) => onChange(e.target.value as SlingHitchType)}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      >
        {Object.values(HITCH_TYPES).map((hitch) => (
          <option key={hitch.code} value={hitch.code}>
            {hitch.label} ({(hitch.capacityFactor * 100).toFixed(0)}% WLL)
          </option>
        ))}
      </select>
    </div>
  );
}
