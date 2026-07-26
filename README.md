<div align="center">

# 🏗️ RiggerIQ

**Real-time rigging engineering calculator — angles, tensions, safety factors, load weight and center of gravity, with AI-powered plan generation.**

[🇬🇧 English](#) · [🇪🇸 Español](README.es.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub%20Sponsors-EA4AAA)](https://github.com/sponsors/sergiorebolledo)
[![Patreon](https://img.shields.io/badge/Support-Patreon-FF424D)](https://www.patreon.com/)

</div>

---

## What is RiggerIQ?

RiggerIQ is a web app (and installable PWA) for **riggers, lifting engineers, and safety/prevention officers**. It turns the manual, error-prone math behind a lifting/rigging maneuver into an instant, visual, real-time dashboard — angle, tension, safety factor, weight estimation, center of gravity — with a color-coded safety semaphore, an interactive force-vector diagram, and a signable PDF lifting plan.

It supports **ASME B30.9/B30.26** (US/LatAm), **EN 1492/13889** (Europe) and **NCh/DS 594** (Chile) simultaneously, so the same tool works across different regulatory contexts.

> ⚠️ **Safety disclaimer**: RiggerIQ is an engineering aid, not a certified safety authority. Every calculation, PDF plan, and AI-extracted value **must be reviewed and validated by a qualified rigger or prevention engineer** before being used in an actual lifting operation. The authors assume no liability for the outcome of real-world maneuvers planned with this tool.

## ✨ Features

- **Live rigging calculator** — geometry → sling angle (θ) → amplification factor → tension per leg → safety factor, computed instantly as you type. Also works in **reverse**: give it a target angle, it tells you the required sling length.
- **Sling hitch types** — Vertical (100% WLL), Choker (80% WLL), and Basket (angle-dependent capacity, `2·sin θ`, not a flat 200%).
- **"No lifting lugs" mode** — for pipes or cylindrical loads rigged with two in-line choke points instead of discrete pad-eyes.
- **Multi-standard compliance** — switch between ASME B30.9/B30.26, EN 1492/EN 13889, and NCh/DS 594; each has its own minimum safety factors and angle thresholds.
- **Interactive 2D rigging diagram** (Konva/canvas) — hook, sling legs at the real calculated angle, weight vector, tension vectors, color-coded by safety status.
- **Weight estimator** — cylinder/pipe, plate, I-beam (cross-section), container, and solid block, each with a live-updating geometry diagram and a material density table (steel, concrete, water, wood, copper).
- **Center of gravity calculator** — for asymmetric loads made of several point-weights.
- **Preloaded equipment catalog** — pick a sling/shackle instead of typing its WLL by hand.
- **PDF export** — a signable "Plan de Izaje Seguro" with the full calculation memo, component table, and preventive-measures section.
- **AI photo-to-form extraction** — take a photo of a hand sketch or technical drawing and auto-fill the form, via a **provider-agnostic adapter** (swap between Google Gemini and Anthropic Claude with one env var — not locked to a single AI vendor).
- **Free/Pro subscription model** — Clerk (auth) + Stripe (billing) + Supabase (data), fully scaffolded and gracefully self-disabling when credentials aren't configured yet (see [Zero-config by default](#-zero-config-by-default) below).
- **Installable PWA** with offline support for the client-side calculators, plus a Capacitor config to wrap it as a native Android app.
- **SEO-ready** — Open Graph image generated on the fly, sitemap, robots.txt, per-page metadata.

## 🧮 The engineering behind it

All formulas live in [`src/lib/rigging-calculator.ts`](src/lib/rigging-calculator.ts), covered by unit tests:

```
r  = √((width/2)² + (length/2)²)        Base radius (anchor spread)
θ  = arccos(r / L)                       Sling angle from horizontal
FA = 1 / sin(θ)                          Amplification factor
T  = (Total weight / legs) × FA          Tension per sling leg
FS = effective WLL / T                   Safety factor (sling & shackle)
```

Where "effective WLL" already accounts for the hitch-type capacity factor (100% vertical / 80% choker / `2·sin θ` basket).

## 🏗️ Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) + TypeScript |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) + [lucide-react](https://lucide.dev/) |
| Diagrams | [react-konva](https://konvajs.org/) (rigging force diagram), inline SVG (weight/CoG diagrams) |
| PDF | [`@react-pdf/renderer`](https://react-pdf.org/) |
| Auth | [Clerk](https://clerk.com/) |
| Database | [Supabase](https://supabase.com/) (Postgres) |
| Payments | [Stripe](https://stripe.com/) |
| AI vision | [Google Gemini](https://ai.google.dev/) or [Anthropic Claude](https://www.anthropic.com/), swappable |
| Testing | [Vitest](https://vitest.dev/) |
| PWA / Mobile | Service worker + Web App Manifest, [Capacitor](https://capacitorjs.com/) for Android |

## 🚀 Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- npm

### Installation

```bash
git clone https://github.com/sergiorebolledo/riggeriq.git
cd riggeriq
npm install
```

### Environment variables

Copy `.env.example` to `.env.local` and fill in what you have:

```bash
cp .env.example .env.local
```

#### 🎁 Zero-config by default

**You don't need any of these to run the free calculators.** RiggerIQ was built so that every third-party integration (Clerk, Supabase, Stripe, Gemini, Claude) **auto-detects whether it's configured with real credentials**, and cleanly disables itself with a friendly "coming soon" message when it isn't — instead of crashing the app. This means you can clone the repo and have every calculator working in under a minute, and wire up accounts one at a time whenever you're ready to add auth, payments, or AI vision.

| Variable | Needed for | Required to run calculators? |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Sign-in / accounts | No |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Saved plans, user profiles | No |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID` | Pro subscription checkout | No |
| `AI_VISION_PROVIDER`, `GEMINI_API_KEY` or `ANTHROPIC_API_KEY` | Photo-to-form AI extraction | No |
| `NEXT_PUBLIC_APP_URL` | Correct redirect/OG/sitemap URLs | Recommended |

### Run it

```bash
npm run dev       # start the dev server at http://localhost:3000
npm test          # run the unit test suite (Vitest)
npm run lint      # lint the codebase
npm run build     # production build
```

## 📁 Project structure

```
src/
├── app/                    # Next.js App Router pages (/, /peso, /centro-gravedad, /precios, API routes)
├── components/
│   └── rigging/             # Calculator UI (main calc, weight, center of gravity, diagram, PDF, vision)
├── lib/
│   ├── rigging-calculator.ts  # Core physics engine + normative presets
│   ├── weight-estimator.ts    # Geometry + material → weight
│   ├── center-of-gravity.ts   # Weighted centroid
│   ├── ai-vision/             # Provider-agnostic Gemini/Claude adapter
│   ├── supabase/, profile.ts  # Data layer
│   └── stripe/                # Billing
supabase/migrations/         # Database schema
public/                      # PWA manifest, icons, service worker
docs/PRD.md                  # Original requirements document
```

## 📋 Requirements document

The original product requirements document that shaped this project is preserved at [`docs/PRD.md`](docs/PRD.md), including the full list of reference libraries considered and notes on which ones were actually used vs. replaced with a native alternative.

## 🗺️ Roadmap / known gaps

- High-contrast "field mode" for outdoor/gloved use
- Metric ⇄ Imperial unit conversion
- Android build via Capacitor (config is ready, native project not generated yet)
- AI-generated (rather than rule-based) preventive-measures text in the PDF

## 🤝 Contributing

Issues and pull requests are welcome. Please:

1. Fork the repo and create a feature branch.
2. Run `npm test` and `npm run lint` before opening a PR.
3. Keep changes focused — one feature or fix per PR.
4. If you touch the calculation engine (`rigging-calculator.ts`, `weight-estimator.ts`, `center-of-gravity.ts`), add or update unit tests: this is a safety-critical tool, and every formula change needs test coverage.

## 💛 Support this project

If RiggerIQ is useful to you, consider supporting its development:

- [GitHub Sponsors](https://github.com/sponsors/sergiorebolledo)
- [Patreon](https://www.patreon.com/)

## 📄 License

[MIT](LICENSE) © 2026 Sergio Rebolledo Lopez — free to use, modify, and distribute, including commercially. Attribution appreciated but not required beyond keeping the license notice.
