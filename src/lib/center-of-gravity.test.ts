import { describe, expect, it } from "vitest";
import { calculateCenterOfGravity, type PointLoad } from "./center-of-gravity";

describe("calculateCenterOfGravity", () => {
  it("retorna el mismo punto cuando hay un único componente", () => {
    const loads: PointLoad[] = [{ label: "Motor", xM: 2, yM: 3, weightKg: 500 }];
    const result = calculateCenterOfGravity(loads);
    expect(result.xM).toBeCloseTo(2, 6);
    expect(result.yM).toBeCloseTo(3, 6);
    expect(result.totalWeightKg).toBe(500);
  });

  it("calcula el punto medio con dos componentes de igual peso", () => {
    const loads: PointLoad[] = [
      { label: "A", xM: 0, yM: 0, weightKg: 100 },
      { label: "B", xM: 4, yM: 0, weightKg: 100 },
    ];
    const result = calculateCenterOfGravity(loads);
    expect(result.xM).toBeCloseTo(2, 6);
    expect(result.yM).toBeCloseTo(0, 6);
    expect(result.totalWeightKg).toBe(200);
  });

  it("desplaza el centroide hacia el componente más pesado", () => {
    const loads: PointLoad[] = [
      { label: "Liviano", xM: 0, yM: 0, weightKg: 100 },
      { label: "Pesado", xM: 10, yM: 0, weightKg: 300 },
    ];
    const result = calculateCenterOfGravity(loads);
    // x̄ = (0*100 + 10*300) / 400 = 7.5
    expect(result.xM).toBeCloseTo(7.5, 6);
  });

  it("maneja correctamente 3 componentes en un plano 2D", () => {
    const loads: PointLoad[] = [
      { label: "A", xM: 0, yM: 0, weightKg: 100 },
      { label: "B", xM: 4, yM: 0, weightKg: 100 },
      { label: "C", xM: 2, yM: 6, weightKg: 200 },
    ];
    const result = calculateCenterOfGravity(loads);
    // x̄ = (0+400+400)/400 = 2 ; ȳ = (0+0+1200)/400 = 3
    expect(result.xM).toBeCloseTo(2, 6);
    expect(result.yM).toBeCloseTo(3, 6);
    expect(result.totalWeightKg).toBe(400);
  });

  it("lanza un error si no hay componentes", () => {
    expect(() => calculateCenterOfGravity([])).toThrow();
  });

  it("lanza un error si algún componente tiene peso 0 o negativo", () => {
    expect(() =>
      calculateCenterOfGravity([{ label: "A", xM: 0, yM: 0, weightKg: 0 }]),
    ).toThrow();
    expect(() =>
      calculateCenterOfGravity([{ label: "A", xM: 0, yM: 0, weightKg: -10 }]),
    ).toThrow();
  });
});
