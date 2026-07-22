import { NORMATIVE_PRESETS, type NormativeCode } from "@/lib/rigging-calculator";

interface NormativeSelectProps {
  value: NormativeCode;
  onChange: (value: NormativeCode) => void;
}

export function NormativeSelect({ value, onChange }: NormativeSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="norm" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Norma aplicable
      </label>
      <select
        id="norm"
        value={value}
        onChange={(e) => onChange(e.target.value as NormativeCode)}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      >
        {Object.values(NORMATIVE_PRESETS).map((preset) => (
          <option key={preset.code} value={preset.code}>
            {preset.label}
          </option>
        ))}
      </select>
    </div>
  );
}
