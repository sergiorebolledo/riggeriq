interface NumberFieldProps {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  step?: number | "any";
  invalid?: boolean;
}

export function NumberField({
  id,
  label,
  unit,
  value,
  onChange,
  min = 0,
  step = "any",
  invalid = false,
}: NumberFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <div
        className={`flex items-center rounded-lg border bg-white focus-within:ring-2 dark:bg-zinc-900 ${
          invalid
            ? "border-red-400 focus-within:ring-red-500 dark:border-red-500/60"
            : "border-zinc-300 focus-within:ring-blue-500 dark:border-zinc-700"
        }`}
      >
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid}
          className="w-full flex-1 rounded-l-lg bg-transparent px-3 py-2 text-base text-zinc-900 outline-none dark:text-zinc-50"
        />
        <span className="whitespace-nowrap rounded-r-lg px-3 text-sm text-zinc-500 dark:text-zinc-400">
          {unit}
        </span>
      </div>
    </div>
  );
}
