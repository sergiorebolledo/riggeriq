import type { Metadata } from "next";
import { WeightEstimatorCalculator } from "@/components/rigging/weight/WeightEstimatorCalculator";

export const metadata: Metadata = {
  title: "Calculadora de Peso de Cargas",
  description:
    "Estima el peso de una carga por geometría (cilindro, tubería, placa, viga H/I, contenedor, bloque) y material (acero, hormigón, agua, madera, cobre), con diagrama en vivo.",
};

export default function PesoPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Calculadora de Peso de Cargas
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Estima el peso a partir de la geometría y el material, antes de calcular el izaje.
          </p>
        </header>

        <WeightEstimatorCalculator />
      </main>
    </div>
  );
}
