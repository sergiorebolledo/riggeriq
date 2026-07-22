/**
 * true una vez que CLERK_SECRET_KEY fue reemplazado por una key real
 * (ver .env.example). Mientras sea el valor de marcador de posición de
 * .env.local, ni <ClerkProvider> ni clerkMiddleware() deben activarse:
 * ambos intentan contactar el Frontend API codificado en la publishable
 * key, y con una key falsa eso rompe la app entera (no solo lo que
 * requiere login). Se usa tanto en middleware.ts como en layout.tsx.
 */
export const isClerkConfigured = Boolean(
  process.env.CLERK_SECRET_KEY && !process.env.CLERK_SECRET_KEY.includes("placeholder"),
);
