import type { Metadata } from "next";
import { Check } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { getCurrentPlan } from "@/lib/profile";
import { isClerkConfigured } from "@/lib/clerk-status";
import { UpgradeToProButton } from "@/components/billing/UpgradeToProButton";
import { ManageBillingButton } from "@/components/billing/ManageBillingButton";
import { SignInTriggerButton } from "@/components/auth/SignInTriggerButton";

export const metadata: Metadata = {
  title: "Planes y precios",
  description:
    "Plan Free con calculadoras ilimitadas en el navegador, y plan Pro con exportación de PDF y lectura de planos por IA.",
};

const FREE_FEATURES = [
  "Calculadora de ángulos, tensiones y factores de seguridad",
  "Calculadora de Centro de Gravedad",
  "Semáforo de seguridad en vivo",
  "Normas ASME, EN y NCh/DS 594",
];

const PRO_FEATURES = [
  "Todo lo del plan Free",
  "Generación ilimitada de PDF del Plan de Izaje",
  "Historial de planes guardado",
  "Módulo de Visión por IA (próximamente)",
];

export default async function PreciosPage() {
  const plan = await getCurrentPlan();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-8">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Planes</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Empieza gratis. Actualiza a Pro cuando necesites exportar planes de izaje en PDF.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Free</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Sin costo, sin tarjeta.</p>
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                  <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                </li>
              ))}
            </ul>
            {plan === "free" && (
              <span className="mt-auto rounded-lg bg-zinc-100 px-3 py-2 text-center text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                Tu plan actual
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border-2 border-blue-500 bg-white p-6 dark:bg-zinc-900">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Rigger Master (Pro)
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Suscripción mensual.</p>
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                  <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              {!isClerkConfigured ? (
                <p className="rounded-lg bg-zinc-100 px-3 py-2 text-center text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  Suscripciones próximamente: falta configurar Clerk y Stripe.
                </p>
              ) : plan === "pro" ? (
                <ManageBillingButton />
              ) : (
                <>
                  <SignedIn>
                    <UpgradeToProButton className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                      Actualizar a Pro
                    </UpgradeToProButton>
                  </SignedIn>
                  <SignedOut>
                    <SignInTriggerButton className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                      Inicia sesión para actualizar
                    </SignInTriggerButton>
                  </SignedOut>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
