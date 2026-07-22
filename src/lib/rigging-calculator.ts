/**
 * Motor de cálculo de ingeniería de izaje (rigging).
 *
 * Implementa la geometría, ángulos, tensiones y factores de seguridad
 * para un arreglo de eslingas simétrico sobre una carga rectangular,
 * según lo descrito en el PRD (sección 4) y ajustable por normativa
 * (ASME B30.9/B30.26, EN 1492/EN 13889, NCh/DS 594 — sección 7).
 */

export type NormativeCode = "ASME" | "EN" | "NCH";

export interface NormativeLimits {
  code: NormativeCode;
  label: string;
  /** Factor de seguridad mínimo exigido para la eslinga. */
  minSlingSafetyFactor: number;
  /** Factor de seguridad mínimo exigido para el grillete. */
  minShackleSafetyFactor: number;
  /** Ángulo mínimo aceptable de la eslinga respecto a la horizontal, en grados. */
  minSlingAngleDegrees: number;
}

export const NORMATIVE_PRESETS: Record<NormativeCode, NormativeLimits> = {
  ASME: {
    code: "ASME",
    label: "ASME B30.9 / B30.26 (EE.UU. / Latam)",
    minSlingSafetyFactor: 5,
    minShackleSafetyFactor: 5,
    minSlingAngleDegrees: 45,
  },
  EN: {
    code: "EN",
    label: "EN 1492 / EN 13889 (Europa)",
    minSlingSafetyFactor: 7,
    minShackleSafetyFactor: 6,
    minSlingAngleDegrees: 45,
  },
  NCH: {
    code: "NCH",
    label: "NCh / DS 594 (Chile)",
    minSlingSafetyFactor: 5,
    minShackleSafetyFactor: 5,
    minSlingAngleDegrees: 45,
  },
};

export type SafetyStatus = "safe" | "warning" | "danger";

export interface RiggingInput {
  /** Peso total de la carga, en kg. */
  totalWeightKg: number;
  /** Número de patas/eslingas del arreglo (>= 1). */
  numberOfLegs: number;
  /** Ancho del arreglo de puntos de anclaje, en metros. */
  baseWidthM: number;
  /** Largo del arreglo de puntos de anclaje, en metros. */
  baseLengthM: number;
  /** Longitud de cada eslinga, en metros. */
  slingLengthM: number;
  /** Carga de trabajo límite (WLL) de cada eslinga, en kg. */
  slingWLLKg: number;
  /** Carga de trabajo límite (WLL) de cada grillete, en kg. */
  shackleWLLKg: number;
  /** Norma bajo la cual se evalúa la maniobra. */
  norm: NormativeCode;
}

export interface RiggingResult {
  baseRadiusM: number;
  slingAngleRadians: number;
  slingAngleDegrees: number;
  amplificationFactor: number;
  tensionPerLegKg: number;
  slingSafetyFactor: number;
  shackleSafetyFactor: number;
  status: SafetyStatus;
  warnings: string[];
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Ángulo absoluto mínimo por debajo del cual ninguna norma permite izar. */
const ABSOLUTE_MIN_ANGLE_DEGREES = 30;

/**
 * Tolerancia para comparaciones de ángulo en grados. Evita que el
 * redondeo de punto flotante (p. ej. un round-trip cos→acos al calcular
 * la longitud requerida para un ángulo objetivo) clasifique por error un
 * ángulo matemáticamente exacto como levemente bajo un umbral.
 */
const ANGLE_EPSILON_DEGREES = 1e-6;

/**
 * Radio de la base del arreglo de anclajes (distancia del centro de carga
 * a cada punto de anclaje), para un arreglo rectangular simétrico.
 *
 * r = sqrt((ancho / 2)^2 + (largo / 2)^2)
 */
export function calculateBaseRadius(baseWidthM: number, baseLengthM: number): number {
  if (baseWidthM <= 0 || baseLengthM <= 0) {
    throw new Error("El ancho y el largo de la base deben ser mayores que 0.");
  }
  return Math.sqrt((baseWidthM / 2) ** 2 + (baseLengthM / 2) ** 2);
}

/**
 * Ángulo de la eslinga respecto a la horizontal (en radianes).
 *
 * cos(θ) = r / L  =>  θ = arccos(r / L)
 */
export function calculateSlingAngle(baseRadiusM: number, slingLengthM: number): number {
  if (slingLengthM <= 0) {
    throw new Error("La longitud de la eslinga debe ser mayor que 0.");
  }
  const ratio = baseRadiusM / slingLengthM;
  if (ratio > 1) {
    throw new Error(
      "Geometría inválida: la eslinga es más corta que el radio de la base del arreglo de anclajes.",
    );
  }
  return Math.acos(ratio);
}

/**
 * Longitud de eslinga requerida para alcanzar un ángulo objetivo (modo inverso).
 *
 * A partir de cos(θ) = r / L  =>  L = r / cos(θ)
 */
export function calculateRequiredSlingLength(
  baseRadiusM: number,
  desiredAngleDegrees: number,
): number {
  if (desiredAngleDegrees <= 0 || desiredAngleDegrees >= 90) {
    throw new Error("El ángulo deseado debe estar entre 0° y 90° (exclusivo).");
  }
  return baseRadiusM / Math.cos(toRadians(desiredAngleDegrees));
}

/**
 * Factor de amplificación por ángulo (FA = 1 / sin(θ)).
 */
export function calculateAmplificationFactor(slingAngleRadians: number): number {
  const sinTheta = Math.sin(slingAngleRadians);
  if (sinTheta <= 0) {
    throw new Error("Ángulo de eslinga inválido: debe estar entre 0° y 90°.");
  }
  return 1 / sinTheta;
}

/**
 * Tensión por eslinga: T = (Peso total / N° de patas) * FA
 */
export function calculateTensionPerLeg(
  totalWeightKg: number,
  numberOfLegs: number,
  amplificationFactor: number,
): number {
  if (totalWeightKg <= 0) {
    throw new Error("El peso total debe ser mayor que 0.");
  }
  if (!Number.isInteger(numberOfLegs) || numberOfLegs < 1) {
    throw new Error("El número de patas debe ser un entero mayor o igual a 1.");
  }
  return (totalWeightKg / numberOfLegs) * amplificationFactor;
}

/**
 * Factor de seguridad: FS = WLL / T
 */
export function calculateSafetyFactor(wllKg: number, tensionKg: number): number {
  if (wllKg <= 0) {
    throw new Error("El WLL debe ser mayor que 0.");
  }
  if (tensionKg <= 0) {
    throw new Error("La tensión debe ser mayor que 0.");
  }
  return wllKg / tensionKg;
}

/**
 * Semáforo de seguridad (sección 9 del PRD):
 * - Verde (safe): FS > 5.0 y ángulo >= 60°.
 * - Amarillo (warning): FS entre 4.0 y 5.0, o ángulo entre 45° y 59°.
 * - Rojo (danger): FS < 4.0 o ángulo < 45°.
 *
 * Además, valida contra los mínimos específicos de la norma seleccionada
 * y agrega una advertencia textual por cada incumplimiento normativo.
 */
export function evaluateSafetyStatus(
  slingAngleDegrees: number,
  slingSafetyFactor: number,
  shackleSafetyFactor: number,
  norm: NormativeLimits,
): { status: SafetyStatus; warnings: string[] } {
  const minFS = Math.min(slingSafetyFactor, shackleSafetyFactor);

  let status: SafetyStatus;
  if (slingAngleDegrees < 45 - ANGLE_EPSILON_DEGREES || minFS < 4) {
    status = "danger";
  } else if (slingAngleDegrees < 60 - ANGLE_EPSILON_DEGREES || minFS < 5) {
    status = "warning";
  } else {
    status = "safe";
  }

  const warnings: string[] = [];
  if (slingAngleDegrees < ABSOLUTE_MIN_ANGLE_DEGREES - ANGLE_EPSILON_DEGREES) {
    warnings.push(
      `Ángulo de eslinga (${slingAngleDegrees.toFixed(1)}°) bajo el mínimo absoluto de la industria (${ABSOLUTE_MIN_ANGLE_DEGREES}°): no usar la eslinga en esta configuración bajo ninguna norma.`,
    );
  }
  if (slingAngleDegrees < norm.minSlingAngleDegrees - ANGLE_EPSILON_DEGREES) {
    warnings.push(
      `Ángulo de eslinga (${slingAngleDegrees.toFixed(1)}°) bajo el mínimo exigido por ${norm.label} (${norm.minSlingAngleDegrees}°).`,
    );
  }
  if (slingSafetyFactor < norm.minSlingSafetyFactor) {
    warnings.push(
      `Factor de seguridad de la eslinga (${slingSafetyFactor.toFixed(2)}) bajo el mínimo exigido por ${norm.label} (${norm.minSlingSafetyFactor}).`,
    );
  }
  if (shackleSafetyFactor < norm.minShackleSafetyFactor) {
    warnings.push(
      `Factor de seguridad del grillete (${shackleSafetyFactor.toFixed(2)}) bajo el mínimo exigido por ${norm.label} (${norm.minShackleSafetyFactor}).`,
    );
  }

  return { status, warnings };
}

/**
 * Orquesta el cálculo completo de la maniobra de izaje a partir de los
 * datos de entrada, aplicando la normativa seleccionada.
 */
export function calculateRigging(input: RiggingInput): RiggingResult {
  const norm = NORMATIVE_PRESETS[input.norm];

  const baseRadiusM = calculateBaseRadius(input.baseWidthM, input.baseLengthM);
  const slingAngleRadians = calculateSlingAngle(baseRadiusM, input.slingLengthM);
  const slingAngleDegrees = toDegrees(slingAngleRadians);
  const amplificationFactor = calculateAmplificationFactor(slingAngleRadians);
  const tensionPerLegKg = calculateTensionPerLeg(
    input.totalWeightKg,
    input.numberOfLegs,
    amplificationFactor,
  );
  const slingSafetyFactor = calculateSafetyFactor(input.slingWLLKg, tensionPerLegKg);
  const shackleSafetyFactor = calculateSafetyFactor(input.shackleWLLKg, tensionPerLegKg);

  const { status, warnings } = evaluateSafetyStatus(
    slingAngleDegrees,
    slingSafetyFactor,
    shackleSafetyFactor,
    norm,
  );

  return {
    baseRadiusM,
    slingAngleRadians,
    slingAngleDegrees,
    amplificationFactor,
    tensionPerLegKg,
    slingSafetyFactor,
    shackleSafetyFactor,
    status,
    warnings,
  };
}
