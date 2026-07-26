import type { CapacitorConfig } from "@capacitor/cli";

/**
 * RiggerIQ usa rutas de servidor (Clerk, Stripe, vision por IA) que no se
 * pueden exportar como sitio estatico. Por eso Capacitor no empaqueta los
 * archivos web: en su lugar, la app nativa es un WebView que carga la URL
 * desplegada en produccion (server.url). "webDir" queda como requisito del
 * tipo CapacitorConfig, pero no se usa en este modo.
 *
 * Antes de publicar: cambiar appId por tu identificador real (formato
 * de dominio invertido) y NEXT_PUBLIC_APP_URL por tu dominio de produccion.
 */
const config: CapacitorConfig = {
  appId: "com.riggeriq.app",
  appName: "RiggerIQ",
  webDir: "public",
  server: {
    url: process.env.NEXT_PUBLIC_APP_URL || "https://your-deployed-domain.com",
    cleartext: false,
  },
};

export default config;
