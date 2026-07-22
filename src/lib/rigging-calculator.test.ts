import { describe, expect, it } from "vitest";
import {
  NORMATIVE_PRESETS,
  calculateAmplificationFactor,
  calculateBaseRadius,
  calculateRigging,
  calculateSafetyFactor,
  calculateSlingAngle,
  calculateTensionPerLeg,
  evaluateSafetyStatus,
} from "./rigging-calculator";

describe("calculateBaseRadius", () => {
  it("calcula el radio para un arreglo cuadrado de 2x2 m", () => {
    // r = sqrt(1^2 + 1^2) = sqrt(2)
    expect(calculateBaseRadius(2, 2)).toBeCloseTo(Math.SQRT2, 6);
  });

  it("calcula el radio para un arreglo rectangular de 6x8 m", () => {
    // r = sqrt(3^2 + 4^2) = 5
    expect(calculateBaseRadius(6, 8)).toBeCloseTo(5, 6);
  });

  it("lanza un error si el ancho o el largo son 0 o negativos", () => {
    expect(() => calculateBaseRadius(0, 2)).toThrow();
    expect(() => calculateBaseRadius(2, -1)).toThrow();
  });
});

describe("calculateSlingAngle", () => {
  it("calcula 45° cuando r/L = cos(45°)", () => {
    const angle = calculateSlingAngle(Math.SQRT2, 2);
    expect(angle * (180 / Math.PI)).toBeCloseTo(45, 4);
  });

  it("calcula 90° (vertical) cuando el radio es 0", () => {
    const angle = calculateSlingAngle(0, 5);
    expect(angle * (180 / Math.PI)).toBeCloseTo(90, 6);
  });

  it("lanza un error si la eslinga es más corta que el radio de la base", () => {
    expect(() => calculateSlingAngle(5, 3)).toThrow();
  });

  it("lanza un error si la longitud de la eslinga es 0 o negativa", () => {
    expect(() => calculateSlingAngle(1, 0)).toThrow();
  });
});

describe("calculateAmplificationFactor", () => {
  it("es 1 cuando el ángulo es 90° (eslinga vertical)", () => {
    expect(calculateAmplificationFactor(Math.PI / 2)).toBeCloseTo(1, 6);
  });

  it("es 2 cuando el ángulo es 30°", () => {
    expect(calculateAmplificationFactor(Math.PI / 6)).toBeCloseTo(2, 6);
  });

  it("crece a medida que el ángulo disminuye", () => {
    const fa60 = calculateAmplificationFactor((60 * Math.PI) / 180);
    const fa30 = calculateAmplificationFactor((30 * Math.PI) / 180);
    expect(fa30).toBeGreaterThan(fa60);
  });
});

describe("calculateTensionPerLeg", () => {
  it("calcula la tensión repartida entre las patas, amplificada por el ángulo", () => {
    // 4000 kg / 4 patas = 1000 kg base; FA = 1 (vertical) => T = 1000 kg
    expect(calculateTensionPerLeg(4000, 4, 1)).toBeCloseTo(1000, 6);
    // Con FA = 2 (ángulo de 30°) => T = 2000 kg
    expect(calculateTensionPerLeg(4000, 4, 2)).toBeCloseTo(2000, 6);
  });

  it("lanza un error con peso total inválido", () => {
    expect(() => calculateTensionPerLeg(0, 4, 1)).toThrow();
  });

  it("lanza un error con número de patas inválido", () => {
    expect(() => calculateTensionPerLeg(1000, 0, 1)).toThrow();
    expect(() => calculateTensionPerLeg(1000, 2.5, 1)).toThrow();
  });
});

describe("calculateSafetyFactor", () => {
  it("calcula FS = WLL / T", () => {
    expect(calculateSafetyFactor(5000, 1000)).toBeCloseTo(5, 6);
  });

  it("lanza un error con WLL o tensión inválidos", () => {
    expect(() => calculateSafetyFactor(0, 1000)).toThrow();
    expect(() => calculateSafetyFactor(5000, 0)).toThrow();
  });
});

describe("evaluateSafetyStatus", () => {
  const asme = NORMATIVE_PRESETS.ASME;

  it("retorna 'safe' cuando el ángulo y el FS están sobre los umbrales verdes", () => {
    const { status, warnings } = evaluateSafetyStatus(70, 6, 6, asme);
    expect(status).toBe("safe");
    expect(warnings).toHaveLength(0);
  });

  it("retorna 'warning' cuando el ángulo está entre 45° y 59°", () => {
    const { status } = evaluateSafetyStatus(50, 6, 6, asme);
    expect(status).toBe("warning");
  });

  it("retorna 'warning' cuando el FS mínimo está entre 4 y 5", () => {
    const { status } = evaluateSafetyStatus(70, 4.5, 6, asme);
    expect(status).toBe("warning");
  });

  it("retorna 'danger' cuando el ángulo es menor a 45°", () => {
    const { status } = evaluateSafetyStatus(40, 6, 6, asme);
    expect(status).toBe("danger");
  });

  it("retorna 'danger' cuando el FS mínimo es menor a 4", () => {
    const { status } = evaluateSafetyStatus(70, 3.9, 6, asme);
    expect(status).toBe("danger");
  });

  it("agrega advertencias normativas específicas cuando no se cumple el mínimo de la norma", () => {
    // EN 1492 exige FS >= 7 para eslingas; con FS = 6 el estado global es 'safe'
    // (por los umbrales genéricos) pero debe reportarse el incumplimiento normativo.
    const en = NORMATIVE_PRESETS.EN;
    const { status, warnings } = evaluateSafetyStatus(70, 6, 6, en);
    expect(status).toBe("safe");
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toMatch(/eslinga/i);
  });
});

describe("calculateRigging (integración)", () => {
  it("calcula un izaje simétrico de 4 patas seguro", () => {
    const result = calculateRigging({
      totalWeightKg: 4000,
      numberOfLegs: 4,
      baseWidthM: 1,
      baseLengthM: 1,
      slingLengthM: 4,
      slingWLLKg: 6000,
      shackleWLLKg: 6000,
      norm: "ASME",
    });

    // r = sqrt(0.5) ≈ 0.7071; θ = arccos(0.7071/4) ≈ 79.8°
    expect(result.baseRadiusM).toBeCloseTo(Math.SQRT1_2, 4);
    expect(result.slingAngleDegrees).toBeGreaterThan(60);
    expect(result.status).toBe("safe");
    expect(result.warnings).toHaveLength(0);
  });

  it("marca 'danger' un izaje con ángulo bajo (arreglo muy abierto vs. eslinga corta)", () => {
    const result = calculateRigging({
      totalWeightKg: 4000,
      numberOfLegs: 4,
      baseWidthM: 6,
      baseLengthM: 6,
      slingLengthM: 5,
      slingWLLKg: 5000,
      shackleWLLKg: 5000,
      norm: "ASME",
    });

    expect(result.slingAngleDegrees).toBeLessThan(45);
    expect(result.status).toBe("danger");
    expect(result.warnings.some((w) => /Ángulo/.test(w))).toBe(true);
  });

  it("marca 'danger' cuando el WLL es insuficiente para la tensión calculada", () => {
    const result = calculateRigging({
      totalWeightKg: 10000,
      numberOfLegs: 2,
      baseWidthM: 1,
      baseLengthM: 1,
      slingLengthM: 3,
      slingWLLKg: 4000,
      shackleWLLKg: 4000,
      norm: "ASME",
    });

    expect(result.status).toBe("danger");
    expect(result.slingSafetyFactor).toBeLessThan(4);
  });

  it("aplica correctamente el preset normativo EN (factores de seguridad más exigentes)", () => {
    const result = calculateRigging({
      totalWeightKg: 4000,
      numberOfLegs: 4,
      baseWidthM: 1,
      baseLengthM: 1,
      slingLengthM: 4,
      slingWLLKg: 6000,
      shackleWLLKg: 6000,
      norm: "EN",
    });

    // Mismo escenario que el caso "seguro" en ASME (FS ≈ 5.9), pero EN exige FS >= 7 para eslingas.
    expect(result.warnings.some((w) => /EN 1492/.test(w))).toBe(true);
  });

  it("lanza un error cuando la geometría es imposible (eslinga más corta que el radio)", () => {
    expect(() =>
      calculateRigging({
        totalWeightKg: 1000,
        numberOfLegs: 4,
        baseWidthM: 10,
        baseLengthM: 10,
        slingLengthM: 2,
        slingWLLKg: 3000,
        shackleWLLKg: 3000,
        norm: "ASME",
      }),
    ).toThrow();
  });
});

describe("NORMATIVE_PRESETS", () => {
  it("EN 1492 exige un factor de seguridad de eslinga más alto que ASME", () => {
    expect(NORMATIVE_PRESETS.EN.minSlingSafetyFactor).toBeGreaterThan(
      NORMATIVE_PRESETS.ASME.minSlingSafetyFactor,
    );
  });

  it("todas las normas exigen un ángulo mínimo de al menos 45°", () => {
    for (const preset of Object.values(NORMATIVE_PRESETS)) {
      expect(preset.minSlingAngleDegrees).toBeGreaterThanOrEqual(45);
    }
  });
});
