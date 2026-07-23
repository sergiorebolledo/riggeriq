"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, Scale, Crosshair } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Calculadora de Izaje", icon: Calculator },
  { href: "/peso", label: "Peso de Cargas", icon: Scale },
  { href: "/centro-gravedad", label: "Centro de Gravedad", icon: Crosshair },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: sidebar fija a la izquierda */}
      <nav className="hidden w-56 shrink-0 flex-col gap-1 border-r border-zinc-200 bg-white p-4 md:flex dark:border-zinc-800 dark:bg-zinc-950">
        <span className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Calculadoras
        </span>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile/tablet: barra horizontal con scroll */}
      <nav className="flex gap-2 overflow-x-auto border-b border-zinc-200 bg-white p-3 md:hidden dark:border-zinc-800 dark:bg-zinc-950">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
