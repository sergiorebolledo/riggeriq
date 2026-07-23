"use client";

import { useEffect } from "react";

/**
 * Registra el service worker solo en producción: en desarrollo interfiere
 * con el hot reload de Next.js (puede servir bundles cacheados y viejos).
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("No se pudo registrar el service worker:", err);
    });
  }, []);

  return null;
}
