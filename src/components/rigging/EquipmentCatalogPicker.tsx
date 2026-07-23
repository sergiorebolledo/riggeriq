import { SHACKLE_CATALOG, SLING_CATALOG, tonToKg } from "@/lib/equipment-catalog";

interface EquipmentCatalogPickerProps {
  onSelectSling: (wllKg: number) => void;
  onSelectShackle: (wllKg: number) => void;
}

export function EquipmentCatalogPicker({
  onSelectSling,
  onSelectShackle,
}: EquipmentCatalogPickerProps) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-dashed border-zinc-300 p-3 text-sm sm:grid-cols-2 dark:border-zinc-700">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Elegir eslinga del catálogo
        </span>
        <select
          defaultValue=""
          onChange={(e) => {
            const item = SLING_CATALOG.find((s) => s.id === e.target.value);
            if (item) onSelectSling(tonToKg(item.capacityTon));
          }}
          className="rounded-md border border-zinc-300 bg-transparent px-2 py-1.5 text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:text-zinc-50"
        >
          <option value="" disabled>
            Seleccionar...
          </option>
          {SLING_CATALOG.map((item) => (
            <option key={item.id} value={item.id}>
              {item.brand} {item.model} — {item.capacityTon.toFixed(2)} Ton
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Elegir grillete del catálogo
        </span>
        <select
          defaultValue=""
          onChange={(e) => {
            const item = SHACKLE_CATALOG.find((s) => s.id === e.target.value);
            if (item) onSelectShackle(tonToKg(item.capacityTon));
          }}
          className="rounded-md border border-zinc-300 bg-transparent px-2 py-1.5 text-zinc-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:text-zinc-50"
        >
          <option value="" disabled>
            Seleccionar...
          </option>
          {SHACKLE_CATALOG.map((item) => (
            <option key={item.id} value={item.id}>
              {item.brand} {item.sizeInches} — {item.capacityTon.toFixed(2)} Ton
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
