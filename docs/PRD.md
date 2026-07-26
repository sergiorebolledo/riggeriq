# Documento de Requerimientos y Arquitectura de Software (PRD)

> Este es el documento de requerimientos original que dio origen a **RiggerIQ**
> (nombre de proyecto original: "Rigging Pro AI"), compartido por el autor del
> proyecto al inicio del desarrollo, más una versión ampliada compartida
> posteriormente. Se conserva aquí sin modificaciones como referencia histórica
> del alcance y la visión del producto. El estado real de implementación de
> cada etapa puede haber avanzado más allá de lo descrito aquí — ver el
> [README](../README.md) para el estado actual de funcionalidades.

---

## Versión 1 — PRD inicial (2026-07-22)

## Proyecto: Plataforma Web & App de Ingeniería de Izaje (Rigging Pro AI)

### 🎯 1. VISIÓN DEL PROYECTO Y OBJETIVO
El objetivo principal es crear una aplicación web responsive y app móvil (Android/PWA) para ingenieros de izaje, riggers y prevencionistas de riesgos.

Buscamos superar a plataformas existentes (como MiLift.cl) ofreciendo:
1. Una interfaz mucho más intuitiva, visual y didáctica.
2. Automatización completa del llenado de datos mediante Visión por Inteligencia Artificial (extrae datos desde fotos de planos técnicos o croquis a mano).
3. Generación automática de Planes de Izaje Seguros y Memorias de Cálculo en PDF listos para firmar y auditar.
4. Un modelo de negocio por suscripción (SaaS) donde los usuarios gratuitos no generen costos de API de IA, mientras que los usuarios de pago (Pro/Enterprise) financien el uso de modelos avanzados de IA.

---

### 🏗️ 2. STACK TECNOLÓGICO Y SERVICIOS
* Frontend: Next.js (React) + Tailwind CSS + Lucide Icons + PWA / Capacitor (para Android).
* Backend & Base de Datos: Supabase (PostgreSQL) + Edge Functions.
* Autenticación: Clerk (Integración rápida con roles de usuario).
* Pagos & Suscripciones: Stripe (Gestión de membresías Free vs Pro).
* Modelos de IA:
  - Gemini 1.5 Flash ("Nano Banana"): Procesamiento visual multimodal (extrae parámetros técnicos de imágenes de planos y croquis).
  - Claude 3.5 Sonnet: Generación y redacción de memorias descriptivas y procedimientos de seguridad en el plan de izaje.
* Infraestructura & Herramientas:
  - Hosting: Vercel.
  - Dominio & DNS: Namecheap + Cloudflare.
  - Correos: Resend.
  - Analytics & Monitoreo: PostHog + Sentry.
  - Base de datos Vectorial / Cache: Pinecone + Upstash Redis.

---

### 💰 3. MODELO DE SUSCRIPCIÓN Y LIMITACIÓN DE COSTOS
1. Plan Gratuito (Costo de IA $0):
   - Acceso ilimitado a calculadoras de ingeniería ejecutadas 100% en el cliente (Browser JS/TS).
   - Cálculos de ángulos, factores de ampliación, tensiones por eslinga y factores de seguridad.
   - Sin llamadas a la API de IA ni exportación de informes complejos.
2. Plan Pro / Rigger Master (Suscripción Mensual via Stripe):
   - Módulo de Visión por IA: Sube/Toma foto a un plano/croquis y auto-llena los datos de izaje.
   - Generación ilimitada de Planes de Izaje Seguros en formato PDF.
   - Selección e historial guardado en Supabase de planes anteriores.

---

### 🧮 4. LÓGICA DE INGENIERÍA Y FÓRMULAS FÍSICAS (MOTOR DE CÁLCULO)
El motor de cálculos debe estar escrito en TypeScript puro e incluir las siguientes validaciones y fórmulas:

1. Geometría y Radio de la Base:
   - Para un arreglo de orejas/puntos de anclaje simétrico:
     r = sqrt((Ancho / 2)^2 + (Largo / 2)^2)

2. Ángulo de la Eslinga respecto a la Horizontal (θ):
   - cos(θ) = r / L  =>  θ = arccos(r / L)
   - Donde L es la longitud de la eslinga.

3. Factor de Amplificación / Factor de Ángulo (FA):
   - FA = 1 / sin(θ)

4. Tensión por Eslinga (T):
   - T = (Peso Total / N° de Patas) * FA

5. Factor de Seguridad (FS):
   - FS_eslinga = WLL_eslinga / T
   - FS_grillete = WLL_grillete / T
   - Regla de negocio: Si θ < 45° o FS < 5.0 (o según norma ASME B30.9/B30.26), la app debe mostrar una alerta roja de advertencia crítica.

---

### 🔄 5. FLUJO DE TRABAJO DEL USUARIO (WORKFLOW)
1. Entrada de Datos:
   - Opción A (Manual / Gratis): El usuario ingresa Peso, N° de patas, Dimensiones X/Y de orejas y Longitud de eslinga.
   - Opción B (IA Multimodal / Pro): El usuario toma foto a un esquema/plano. La API de Gemini extrae los valores en formato JSON estricto y pre-llena los campos del formulario.
2. Ejecución del Cálculo:
   - El motor TS procesa las fórmulas, calcula ángulos, tensiones por eslinga y factores de seguridad.
3. Generación del Informe (Plan de Izaje):
   - Claude redacta las medidas preventivas e instrucciones de maniobra.
   - La librería `@react-pdf/renderer` compila un PDF formal con encabezado, esquema/foto de referencia, tabla de componentes, memoria de cálculo matemática y espacio para firma del Rigger.

---

### 🚀 6. PLAN DE IMPLEMENTACIÓN PASO A PASO
- ETAPA 1: Configurar la estructura del proyecto en Next.js (App Router), Tailwind CSS y TypeScript.
- ETAPA 2: Desarrollar la librería matemática/física en TypeScript (`lib/rigging-calculator.ts`) con pruebas unitarias para validación de fórmulas.
- ETAPA 3: Crear los componentes de interfaz para la Calculadora Básica (versión Gratis).
- ETAPA 4: Integrar Gemini 1.5 Flash para la lectura visual de planos/croquis mediante Prompt estructurado JSON.
- ETAPA 5: Crear el generador de PDF (Plan de Izaje Seguro).
- ETAPA 6: Configurar Clerk, Supabase y los webhooks de Stripe para el manejo de suscripciones.
- ETAPA 7: Configurar PWA / Capacitor para el despliegue en Android.

---

### 📜 7. MÓDULO DE CUMPLIMIENTO DE NORMAS INTERNACIONALES Y LOCALES

El sistema debe integrar una matriz normativa configurable para que el usuario seleccione bajo qué estándar está operando su maniobra.

#### Normas Soportadas e Implementación en Código:
1. **Normativa Americana (ASME / OSHA):**
   - **ASME B30.9 (Slings / Eslingas):** Factores de diseño/seguridad mínimos (5:1 para eslingas sintéticas/cables, 4:1 para cadenas). Reducción de capacidad por ángulo de rigidez.
   - **ASME B30.26 (Rigging Hardware):** Factores de seguridad para grilletes (5:1 o 6:1 según fabricante), cáncamos y templadores.
   - **ASME B30.5 (Mobile Cranes):** Límite máximo operativo recomendado de grúa al 75% o 85% de capacidad teórica de tabla de carga.
   - **OSHA 1926.251:** Inspección pre-uso y criterios de retiro inmediato.

2. **Normativa Chilena (NCh / DS 594):**
   - **Decreto Supremo N° 594:** Requisitos de seguridad industrial y condiciones ambientales de trabajo.
   - **Normas NCh para maniobras de izaje:** Certificaciones de calidad de componentes y cumplimiento de procedimientos para OTEC / Riggers calificados (NCh 2728 / NCh 3570 para maniobras seguras).

3. **Normativa Europea (EN / Marcado CE):**
   - **EN 1492-1 / EN 1492-2:** Factores de seguridad 7:1 para eslingas de poliéster planas y tubulares. Código de colores normalizado obligatorio (Morado 1t, Verde 2t, Amarillo 3t, Gris 4t, Rojo 5t, Marrón 6t, Azul 8t, Naranja ≥10t).
   - **EN 13889:** Grilletes de acero forjado para aplicaciones generales de elevación (Factor de seguridad 6:1).
   - **Directiva de Máquinas 2006/42/CE:** Exigencias de marcado de CE y cálculo del coeficiente de prueba.

### ⚙️ Requerimientos en el código para la gestión de normas

1. **Selector Normativo en Interfaz:**
   El formulario principal debe incluir una lista desplegable: `[Norma: ASME B30.9 (EE.UU./Latam) | EN 1492 (Europa) | NCh / DS594 (Chile)]`.

2. **Ajuste Dinámico de Factores de Seguridad en el Engine TS:**
   ```typescript
   interface NormativeLimits {
     minSlingSafetyFactor: number; // Ej: 5.0 (ASME) vs 7.0 (EN 1492)
     minShackleSafetyFactor: number; // Ej: 5.0 (ASME) vs 6.0 (EN 13889)
     minSlingAngleDegrees: number; // Ej: 30° o 45°
   }
   ```

### ¿Cómo cambia esto tu ventaja competitiva?
* **Apto para Multinacionales y Mineras:** Al soportar normativas locales de Chile (DS 594), americanas (ASME) y europeas (EN), tu aplicación podrá venderse tanto a pequeñas empresas de servicios como a grandes mineras (CODELCO, SQM, BHP) o constructoras internacionales que exigen el cumplimiento explícito de estas reglas en sus auditorías de prevención de riesgos.

---

### 🖥️ 8. VISUALIZACIÓN EN PANTALLA Y CALCULADORAS AUXILIARES (UI/UX)

La aplicación debe mostrar todos los resultados de manera **inmediata, visual e interactiva** en la propia pantalla (Dashboard en vivo) sin obligar al usuario a generar un PDF. La generación de PDF será solo un botón opcional al final ("Exportar Informe").

#### A. Calculadoras Rápida de Terreno (Disponibles en pantalla):
1. **Calculadora de Peso de Cargas (Estimador de Masa):**
   - Selección de geometría: Cilindro/Tubería, Placa/Lámina, Viga H/I, Contenedor, Bloque Macizo.
   - Selección de Material: Acero, Hormigón/Concreto, Agua, Madera, Cobre.
   - Inserción de dimensiones (Largo, Ancho, Alto, Grosor, Diámetro) para calcular el peso estimado automáticamente.

2. **Calculadora Directa de Ángulos y Tensiones (Live Dashboard):**
   - Al deslizar un control (Slider) de ángulo (ej. de 90° a 30°), los valores de Tensión (T) y Factor de Seguridad (FS) deben actualizarse en tiempo real en la pantalla con un indicador tipo velocímetro o barra de color (Verde = Seguro, Amarillo = Advertencia, Rojo = Peligro/Inseguro).

3. **Calculadora de Centro de Gravedad (CdG):**
   - Permite estimar el punto de balance cuando la carga es asimétrica o tiene componentes con distintos pesos.

#### B. Flujo de Pantalla de Resultados (Live Results View):
Cuando el usuario ingresa los datos (manual o por foto con IA), la pantalla mostrará tarjetas ordenadas:
- **Tarjeta 1: Resumen del Izaje** (Peso total, N° de patas, Ángulo de la eslinga θ).
- **Tarjeta 2: Tensiones Calculadas** (Tensión por eslinga T, Factor de Amplificación FA).
- **Tarjeta 3: Semáforo de Seguridad** (Verificación de WLL de eslingas y grilletes según la norma seleccionada).
- **Botón de Acción Principal:** [ 📄 Generar y Descargar PDF Oficial ] (exclusivo para usuarios Pro o previa confirmación).

---

### 🎨 9. DISEÑO DE EXPERIENCIA DE USUARIO (UI/UX) Y REFERENCIAS DE LA COMPETENCIA

El objetivo principal de diseño es crear una experiencia visual atractiva, intuitiva, ultra rápida y moderna, superando las interfaces obsoletas de la industria.

#### A. Análisis de Referencias del Mercado:
1. **MiLift.cl:** Plataforma de referencia local. Superar su flujo agregando pre-llenado por IA (visión) y un generador de PDF más ejecutivo y moderno.
2. **CYESA & Northern Strands:** Calculadoras útiles pero con formularios de texto planos y estáticos. Convertiremos sus fórmulas en **sliders interactivos con gráficos en tiempo real**.
3. **iAegis.io:** Buena estructura de datos. Tomaremos su claridad conceptual para mostrar los resultados de manera resumida en "tarjetas de métricas".

#### B. Principios de UX/UI para Rigging Pro AI:
1. **Gráficos Dinámicos en Tiempo Real (Interactive Canvas/SVG):**
   - Al ajustar sliders (ej: cambiar el ángulo de 60° a 45°), el esquema visual del izaje en pantalla debe actualizarse dinámicamente mostrando los vectores de fuerza y la tensión resultante.
2. **Semáforo de Seguridad Inmediato (Visual Safety Gauge):**
   - Indicador tipo velocímetro o barra de estado en la parte superior:
     - 🟢 **VERDE (Seguro):** Factor de Seguridad (FS) > 5.0 y ángulo ≥ 60°.
     - 🟡 **AMARILLO (Precaución):** FS entre 4.0 y 5.0 o ángulo entre 45° y 59°.
     - 🔴 **ROJO (Peligro):** FS < 4.0 o ángulo < 45° (emite alerta táctil/vibración en el teléfono).
3. **Modo Terreno (High-Contrast Outdoor Mode):**
   - Botón toggle para activar interfaz de alto contraste, textos ampliados y botones táctiles de gran tamaño para operar con guantes de seguridad bajo el sol.
4. **Inventario / Locker de Aparejos del Usuario:**
   - Permite seleccionar equipos desde un catálogo precargado o personalizado (ej: Eslingas sintéticas Kinglift de 3.00 Ton, Grilletes Gorila 3/4" de 4.75 Ton), evitando el tipeo manual continuo.
5. **Cero Ficción para Usuarios Nuevos:**
   - La pantalla de inicio incluirá tarjetas con "Ejemplos Pre-Cargados" (ej: *Izaje Simétrico de 4 Patas*, *Izaje Ahorcado de Tubería*, *Cálculo de Peso de Placa de Acero*) para que el usuario aprenda a usar la app en un solo clic.

---

## Versión 2 — PRD ampliado (2026-07-23)

## Proyecto: Plataforma Web & App Móvil de Ingeniería de Izaje (Rigging Pro AI)

### 🎯 1. VISIÓN DEL PROYECTO Y OBJETIVO
El objetivo es desarrollar una plataforma web responsive y aplicación móvil (PWA/Android) interactiva, moderna y ultra intuitiva para ingenieros de izaje, riggers y prevencionistas de riesgos.

Buscamos superar a las plataformas existentes (como MiLift.cl, CYESA, Northern Strands o iAegis) mediante:
* **PANTALLAS INTERACTIVAS EN TIEMPO REAL:** Resultados instantáneos en la app (sliders, calculadoras directas de peso y ángulos, gráficos dinámicos y semáforo de seguridad) sin obligar al usuario a generar un PDF para consultas rápidas.
* **AUTOMATIZACIÓN POR IA MULTIMODAL:** Extracción automática de parámetros de izaje mediante fotos de planos técnicos o croquis a mano.
* **GENERACIÓN DE PLANES DE IZAJE SEGUROS:** Creación de informes ejecutivos en PDF listos para firmar y auditar.
* **MODELO FREEMIUM SOSTENIBLE:** Los usuarios gratuitos ejecutan cálculos 100% en el cliente (sin consumo de API), mientras que los usuarios de pago (Pro) financian el uso de las APIs de IA mediante suscripciones en Stripe.
* **OPTIMIZACIÓN SEO Y VISIBILIDAD:** Estrategia de posicionamiento web para captar clientes orgánicos que busquen calculadoras de riggers y maniobras de izaje en Google.

### 🏗️ 2. STACK TECNOLÓGICO Y SERVICIOS ($0 COSTO INICIAL)
* **Frontend:** Next.js (React) + Tailwind CSS + Lucide Icons + PWA / Capacitor (para Android).
* **SEO & Metadata:** `open-seo` (Gestión simplificada de Open Graph, Twitter Cards y etiquetas SEO para Next.js).
* **Backend & DB:** Supabase (PostgreSQL) + Edge Functions.
* **Autenticación:** Clerk.
* **Pagos & Suscripciones:** Stripe.
* **Modelos de IA:**
  - **Gemini 1.5 Flash ("Nano Banana"):** Visión multimodal para procesar imágenes de planos y croquis.
  - **Claude 3.5 Sonnet:** Redacción de memorias descriptivas y recomendaciones de seguridad.
* **Infraestructura:** Vercel (Deployment) + Namecheap (Dominio) + Cloudflare (DNS) + Resend (Emails) + PostHog (Analytics) + Sentry (Errores) + Upstash Redis / Pinecone.

> **Nota de implementación:** `open-seo` / `@every-app/open-seo` no existe como paquete publicado en npm (verificado). RiggerIQ usa la Metadata API nativa de Next.js para Open Graph/Twitter Cards en su lugar.

### 🧮 3. LÓGICA DE INGENIERÍA Y FÓRMULAS FÍSICAS (MOTOR DE CÁLCULO)

1. **Geometría y Radio de la Base (r):**
   r = √((Ancho/2)² + (Largo/2)²)

2. **Ángulo respecto a la Horizontal (θ):**
   θ = arccos(r / L), donde L es la longitud de la eslinga.

3. **Factor de Amplificación / Ángulo (FA):**
   FA = 1 / sin(θ)

4. **Tensión por Eslinga (T):**
   T = (Peso Total / N° de Patas) × FA

5. **Factor de Seguridad (FS):**
   FS_eslinga = WLL_eslinga / T ; FS_grillete = WLL_grillete / T
   (Si θ < 45° o FS < mínimo normativo, la app activa una alerta crítica).

### 📜 4. CUMPLIMIENTO DE NORMAS INTERNACIONALES Y LOCALES
El sistema debe permitir seleccionar la norma de operación:
1. **EE.UU. / Internacional (ASME / OSHA):** ASME B30.9 (Eslingas, FS 5:1 sintéticas/cable, 4:1 cadenas), ASME B30.26 (Aparejos, FS 5:1 o 6:1), ASME B30.5 / OSHA 1926.251 (inspección y límites operativos de grúa).
2. **Chile (NCh / DS 594):** Decreto Supremo 594 y normas NCh 2728 / NCh 3570 para maniobras y certificación de riggers.
3. **Europa (EN / Marcado CE):** EN 1492-1/2 (FS 7:1, código de colores obligatorio), EN 13889 (FS 6:1 grilletes forjados).

### 🎨 5. VISUALIZACIÓN EN PANTALLA Y UX/UI
* **Calculadoras Rápidas en Terreno:** Estimador de Peso de Cargas (geometría + material), Live Dashboard con sliders interactivos de ángulos y longitudes.
* **Semáforo de Seguridad:** Barra de estado visual (Verde/Amarillo/Rojo con vibración háptica).
* **Modo Terreno (High Contrast):** Botones gigantes y alto contraste para uso bajo luz solar directa o con guantes.

### 📦 6. LIBRERÍAS Y REPOSITORIOS DE REFERENCIA (TOP 11)

1. `every-app/open-seo` — SEO/OG/Twitter Cards para Next.js. *(No existe en npm; se usó la Metadata API nativa de Next.js.)*
2. `shadcn-ui/taxonomy` / `next-saas-stripe-starter` — Arquitectura SaaS Next.js + Clerk + Stripe. *(Se construyó una arquitectura propia equivalente.)*
3. `supabase/supabase` (`examples/user-management/nextjs`) — Configuración de backend/Postgres. *(Esquema propio construido en `supabase/migrations/`.)*
4. `diegomura/react-pdf` (`@react-pdf/renderer`) — Generación de PDF. *(Implementado.)*
5. `konvajs/react-konva` — Canvas 2D interactivo para diagrama de izaje. *(Implementado.)*
6. `josdejong/mathjs` — Motor matemático avanzado. *(No usado: el motor propio ya está probado y cubre los casos necesarios.)*
7. `convert-units/convert-units` — Conversión métrico/imperial. *(Pendiente.)*
8. `vercel/ai` — Unificación de llamadas de IA. *(Se optó por un adaptador propio `AIVisionProvider` en su lugar, con el mismo objetivo de no acoplarse a un solo proveedor.)*
9. `google-genai` (Official Google Gen AI SDK) — Integración con Gemini. *(Implementado vía `@google/generative-ai`.)*
10. `lucide-react` / `framer-motion` — Iconografía y animaciones. *(lucide-react implementado; framer-motion no usado.)*
11. `ionic-team/capacitor` — Empaquetado PWA/Android. *(Config lista, proyecto Android nativo no generado aún.)*

### 🚀 PLAN DE TRABAJO E INSTRUCCIONES ORIGINALES

> Texto original de la instrucción de arranque del proyecto, conservado como referencia:

Actúa como un Desarrollador Fullstack Senior y UX Designer. Confirma que has comprendido este documento integral y guíame paso a paso comenzando con:

1. **ETAPA 1:** Estructura de carpetas en Next.js (App Router), instalación de dependencias principales e integración de `open-seo` en el `layout.tsx`.
2. **ETAPA 2:** Código en TypeScript del motor matemático `lib/rigging-calculator.ts` con soporte para normativas (ASME, EN, NCh) y pruebas unitarias.
