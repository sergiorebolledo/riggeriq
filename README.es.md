<div align="center">

# 🏗️ RiggerIQ

**Calculadora de ingeniería de izaje en tiempo real — ángulos, tensiones, factores de seguridad, peso de carga y centro de gravedad, con generación de planes asistida por IA.**

[🇬🇧 [English](README.md)] · [🇪🇸 Español](#)

[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub%20Sponsors-EA4AAA)](https://github.com/sponsors/sergiorebolledo)
[![Patreon](https://img.shields.io/badge/Apoyar-Patreon-FF424D)](https://www.patreon.com/)

</div>

---

## ¿Qué es RiggerIQ?

RiggerIQ es una aplicación web (y PWA instalable) para **riggers, ingenieros de izaje y prevencionistas de riesgos**. Convierte el cálculo manual y propenso a errores detrás de una maniobra de izaje en un dashboard visual e instantáneo en tiempo real — ángulo, tensión, factor de seguridad, estimación de peso, centro de gravedad — con un semáforo de seguridad a color, un diagrama interactivo de vectores de fuerza, y un Plan de Izaje en PDF listo para firmar.

Soporta simultáneamente **ASME B30.9/B30.26** (EE.UU./Latam), **EN 1492/13889** (Europa) y **NCh/DS 594** (Chile), de modo que la misma herramienta funciona en distintos contextos normativos.

> ⚠️ **Advertencia de seguridad**: RiggerIQ es una ayuda de ingeniería, no una autoridad de seguridad certificada. Todo cálculo, plan en PDF o valor extraído por IA **debe ser revisado y validado por un rigger o prevencionista calificado** antes de usarse en una maniobra real. Los autores no asumen responsabilidad por el resultado de maniobras reales planificadas con esta herramienta.

## ✨ Funcionalidades

- **Calculadora de izaje en vivo** — geometría → ángulo de eslinga (θ) → factor de amplificación → tensión por pata → factor de seguridad, calculado al instante mientras escribes. También funciona **al revés**: das un ángulo objetivo y te dice la longitud de eslinga requerida.
- **Tipos de montaje de eslinga** — Vertical (100% WLL), Ahorcado/Choker (80% WLL) y Canasta/Basket (capacidad dependiente del ángulo, `2·sen θ`, no un 200% fijo).
- **Modo "sin orejas de izaje"** — para tuberías u objetos cilíndricos montados con dos puntos de ahorcado en línea en vez de orejas discretas.
- **Cumplimiento multi-norma** — cambia entre ASME B30.9/B30.26, EN 1492/EN 13889 y NCh/DS 594; cada una con sus propios factores de seguridad y ángulos mínimos.
- **Diagrama interactivo 2D del izaje** (Konva/canvas) — gancho, patas de eslinga al ángulo real calculado, vector de peso, vectores de tensión, coloreado según el estado de seguridad.
- **Estimador de peso** — cilindro/tubería, placa, viga H/I (vista de sección), contenedor y bloque macizo, cada uno con un diagrama de geometría en vivo y tabla de densidades de material (acero, hormigón, agua, madera, cobre).
- **Calculadora de centro de gravedad** — para cargas asimétricas compuestas por varios componentes de peso.
- **Catálogo de aparejos precargado** — elige una eslinga/grillete en vez de tipear su WLL a mano.
- **Exportación a PDF** — un "Plan de Izaje Seguro" firmable con la memoria de cálculo completa, tabla de componentes y medidas preventivas.
- **Extracción por foto con IA** — toma una foto de un croquis a mano o plano técnico y autocompleta el formulario, mediante un **adaptador agnóstico de proveedor** (cambia entre Google Gemini y Anthropic Claude con una variable de entorno, sin atarte a un solo proveedor de IA).
- **Modelo de suscripción Free/Pro** — Clerk (autenticación) + Stripe (pagos) + Supabase (datos), completamente armado y que se autodesactiva con gracia cuando las credenciales aún no están configuradas (ver [Cero configuración por defecto](#-cero-configuración-por-defecto) abajo).
- **PWA instalable** con soporte offline para las calculadoras del lado del cliente, más una configuración de Capacitor para empaquetarla como app nativa de Android.
- **Lista para SEO** — imagen Open Graph generada dinámicamente, sitemap, robots.txt, metadata por página.

## 🧮 La ingeniería detrás

Todas las fórmulas viven en [`src/lib/rigging-calculator.ts`](src/lib/rigging-calculator.ts), cubiertas por pruebas unitarias:

```
r  = √((ancho/2)² + (largo/2)²)          Radio de base (spread de anclajes)
θ  = arccos(r / L)                        Ángulo de eslinga respecto a la horizontal
FA = 1 / sin(θ)                           Factor de amplificación
T  = (Peso total / N° de patas) × FA      Tensión por eslinga
FS = WLL efectivo / T                     Factor de seguridad (eslinga y grillete)
```

Donde "WLL efectivo" ya incluye el factor de capacidad según el tipo de montaje (100% vertical / 80% ahorcado / `2·sen θ` canasta).

## 🏗️ Stack tecnológico

| Capa | Elección |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) + TypeScript |
| Estilos | [Tailwind CSS 4](https://tailwindcss.com/) + [lucide-react](https://lucide.dev/) |
| Diagramas | [react-konva](https://konvajs.org/) (diagrama de fuerzas del izaje), SVG inline (diagramas de peso/CdG) |
| PDF | [`@react-pdf/renderer`](https://react-pdf.org/) |
| Autenticación | [Clerk](https://clerk.com/) |
| Base de datos | [Supabase](https://supabase.com/) (Postgres) |
| Pagos | [Stripe](https://stripe.com/) |
| Visión IA | [Google Gemini](https://ai.google.dev/) o [Anthropic Claude](https://www.anthropic.com/), intercambiable |
| Testing | [Vitest](https://vitest.dev/) |
| PWA / Móvil | Service worker + Web App Manifest, [Capacitor](https://capacitorjs.com/) para Android |

## 🚀 Cómo empezar

### Requisitos previos

- [Node.js](https://nodejs.org/) 20+
- npm

### Instalación

```bash
git clone https://github.com/sergiorebolledo/riggeriq.git
cd riggeriq
npm install
```

### Variables de entorno

Copia `.env.example` a `.env.local` y completa lo que tengas:

```bash
cp .env.example .env.local
```

#### 🎁 Cero configuración por defecto

**No necesitas ninguna de estas variables para correr las calculadoras gratuitas.** RiggerIQ está construido para que cada integración externa (Clerk, Supabase, Stripe, Gemini, Claude) **detecte automáticamente si está configurada con credenciales reales**, y se desactive limpiamente con un mensaje de "próximamente" cuando no lo esté — en vez de romper la app. Esto significa que puedes clonar el repo y tener todas las calculadoras funcionando en menos de un minuto, y conectar cuentas una por una cuando estés listo para sumar autenticación, pagos o visión por IA.

| Variable | Necesaria para | ¿Requerida para las calculadoras? |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Inicio de sesión / cuentas | No |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Planes guardados, perfiles de usuario | No |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID` | Checkout de suscripción Pro | No |
| `AI_VISION_PROVIDER`, `GEMINI_API_KEY` o `ANTHROPIC_API_KEY` | Extracción por foto con IA | No |
| `NEXT_PUBLIC_APP_URL` | URLs correctas de redirect/OG/sitemap | Recomendada |

### Ejecutarlo

```bash
npm run dev       # levanta el servidor de desarrollo en http://localhost:3000
npm test          # corre la suite de pruebas unitarias (Vitest)
npm run lint      # lintea el código
npm run build     # build de producción
```

## 📁 Estructura del proyecto

```
src/
├── app/                    # Páginas de Next.js App Router (/, /peso, /centro-gravedad, /precios, rutas API)
├── components/
│   └── rigging/             # UI de las calculadoras (izaje, peso, centro de gravedad, diagrama, PDF, visión)
├── lib/
│   ├── rigging-calculator.ts  # Motor de física + presets normativos
│   ├── weight-estimator.ts    # Geometría + material → peso
│   ├── center-of-gravity.ts   # Centroide ponderado
│   ├── ai-vision/             # Adaptador agnóstico Gemini/Claude
│   ├── supabase/, profile.ts  # Capa de datos
│   └── stripe/                # Facturación
supabase/migrations/         # Esquema de base de datos
public/                      # Manifest PWA, iconos, service worker
docs/PRD.md                  # Documento de requerimientos original
```

## 📋 Documento de requerimientos

El documento de requerimientos original que dio forma a este proyecto se conserva en [`docs/PRD.md`](docs/PRD.md), incluyendo la lista completa de librerías de referencia consideradas y notas sobre cuáles se usaron realmente vs. cuáles se reemplazaron por una alternativa nativa.

## 🗺️ Roadmap / pendientes conocidos

- "Modo Terreno" de alto contraste para uso al aire libre/con guantes
- Conversión de unidades métrico ⇄ imperial
- Build de Android vía Capacitor (la config está lista, el proyecto nativo aún no se generó)
- Texto de medidas preventivas generado por IA (en vez de reglas) en el PDF

## 🤝 Contribuir

Los issues y pull requests son bienvenidos. Por favor:

1. Haz un fork del repo y crea una rama de feature.
2. Corre `npm test` y `npm run lint` antes de abrir un PR.
3. Mantén los cambios acotados — una funcionalidad o fix por PR.
4. Si tocas el motor de cálculo (`rigging-calculator.ts`, `weight-estimator.ts`, `center-of-gravity.ts`), agrega o actualiza pruebas unitarias: esta es una herramienta de seguridad crítica, y todo cambio de fórmula necesita cobertura de pruebas.

## 💛 Apoya este proyecto

Si RiggerIQ te resulta útil, considera apoyar su desarrollo:

- [GitHub Sponsors](https://github.com/sponsors/sergiorebolledo)
- [Patreon](https://www.patreon.com/)

## 📄 Licencia

[MIT](LICENSE) © 2026 Sergio Rebolledo Lopez — libre para usar, modificar y distribuir, incluso comercialmente. Se agradece la atribución, aunque no es obligatoria más allá de mantener el aviso de licencia.
