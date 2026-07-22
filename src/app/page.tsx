import { RiggingCalculator } from "@/components/rigging/RiggingCalculator";
import { CenterOfGravityCalculator } from "@/components/rigging/cog/CenterOfGravityCalculator";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-8 sm:px-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Rigging Pro AI — Calculadora Básica
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Ángulos, tensiones y factores de seguridad de tu maniobra de izaje, en tiempo real.
          </p>
        </header>

        <RiggingCalculator />

        <section className="flex flex-col gap-3">
          <header>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Calculadora de Centro de Gravedad
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Estima el punto de balance de una carga asimétrica compuesta por varios componentes.
            </p>
          </header>
          <CenterOfGravityCalculator />
        </section>
      </main>
    </div>
  );
}
