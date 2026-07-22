"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface UpgradeToProButtonProps {
  className?: string;
  children: React.ReactNode;
}

export function UpgradeToProButton({ className, children }: UpgradeToProButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "No se pudo iniciar el checkout.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={handleClick} disabled={isLoading} className={className}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
