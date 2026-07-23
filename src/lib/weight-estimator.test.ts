import { describe, expect, it } from "vitest";
import {
  MATERIAL_DENSITIES_KG_M3,
  calculateBlockVolume,
  calculateContainerVolume,
  calculateCylinderVolume,
  calculateIBeamVolume,
  calculatePlateVolume,
  estimateWeight,
} from "./weight-estimator";

describe("calculateCylinderVolume", () => {
  it("calcula el volumen de un cilindro macizo", () => {
    // V = pi * r^2 * L = pi * 0.5^2 * 2 = pi/2
    const volume = calculateCylinderVolume({ diameterM: 1, lengthM: 2 });
    expect(volume).toBeCloseTo(Math.PI * 0.5 ** 2 * 2, 6);
  });

  it("calcula el volumen de una tubería (cilindro hueco)", () => {
    // Exterior r=0.5, interior r=0.4 (grosor 0.1)
    const volume = calculateCylinderVolume({ diameterM: 1, lengthM: 2, wallThicknessM: 0.1 });
    const expected = Math.PI * (0.5 ** 2 - 0.4 ** 2) * 2;
    expect(volume).toBeCloseTo(expected, 6);
  });

  it("lanza un error si el grosor de pared es mayor o igual al radio", () => {
    expect(() => calculateCylinderVolume({ diameterM: 1, lengthM: 2, wallThicknessM: 0.6 })).toThrow();
  });

  it("lanza un error con dimensiones no positivas", () => {
    expect(() => calculateCylinderVolume({ diameterM: 0, lengthM: 2 })).toThrow();
    expect(() => calculateCylinderVolume({ diameterM: 1, lengthM: 0 })).toThrow();
  });
});

describe("calculatePlateVolume", () => {
  it("calcula el volumen de una placa", () => {
    const volume = calculatePlateVolume({ lengthM: 2, widthM: 1, thicknessM: 0.01 });
    expect(volume).toBeCloseTo(0.02, 6);
  });
});

describe("calculateIBeamVolume", () => {
  it("aproxima el volumen de una viga H/I como perfil hueco", () => {
    // Exterior 0.2x0.3, grosor 0.02 -> interior 0.16x0.26
    const volume = calculateIBeamVolume({ widthM: 0.2, heightM: 0.3, lengthM: 6, wallThicknessM: 0.02 });
    const expected = (0.2 * 0.3 - 0.16 * 0.26) * 6;
    expect(volume).toBeCloseTo(expected, 6);
  });

  it("lanza un error si el grosor es demasiado grande", () => {
    expect(() =>
      calculateIBeamVolume({ widthM: 0.2, heightM: 0.3, lengthM: 6, wallThicknessM: 0.2 }),
    ).toThrow();
  });
});

describe("calculateContainerVolume", () => {
  it("calcula el volumen de un contenedor hueco", () => {
    const volume = calculateContainerVolume({
      lengthM: 6,
      widthM: 2.4,
      heightM: 2.6,
      wallThicknessM: 0.05,
    });
    const expected = 6 * 2.4 * 2.6 - 5.9 * 2.3 * 2.5;
    expect(volume).toBeCloseTo(expected, 6);
  });
});

describe("calculateBlockVolume", () => {
  it("calcula el volumen de un bloque macizo", () => {
    expect(calculateBlockVolume({ lengthM: 2, widthM: 1, heightM: 0.5 })).toBeCloseTo(1, 6);
  });
});

describe("estimateWeight", () => {
  it("calcula el peso de un bloque de acero de 1 m³", () => {
    const result = estimateWeight({ type: "block", dimensions: { lengthM: 1, widthM: 1, heightM: 1 } }, "steel");
    expect(result.volumeM3).toBeCloseTo(1, 6);
    expect(result.weightKg).toBeCloseTo(MATERIAL_DENSITIES_KG_M3.steel, 6);
  });

  it("calcula el peso de 1 m³ de agua como 1000 kg", () => {
    const result = estimateWeight({ type: "block", dimensions: { lengthM: 1, widthM: 1, heightM: 1 } }, "water");
    expect(result.weightKg).toBeCloseTo(1000, 6);
  });

  it("un bloque de acero pesa más que uno de madera del mismo volumen", () => {
    const dims = { type: "block" as const, dimensions: { lengthM: 1, widthM: 1, heightM: 1 } };
    const steel = estimateWeight(dims, "steel");
    const wood = estimateWeight(dims, "wood");
    expect(steel.weightKg).toBeGreaterThan(wood.weightKg);
  });
});
