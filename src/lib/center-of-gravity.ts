/**
 * Calculadora de Centro de Gravedad (CdG) para cargas asimétricas
 * compuestas por varios puntos de peso (PRD sección 8A.3).
 */

export interface PointLoad {
  label: string;
  xM: number;
  yM: number;
  weightKg: number;
}

export interface CenterOfGravityResult {
  xM: number;
  yM: number;
  totalWeightKg: number;
}

/**
 * Centroide ponderado: x̄ = Σ(xi·wi) / Σwi ; ȳ = Σ(yi·wi) / Σwi
 */
export function calculateCenterOfGravity(loads: PointLoad[]): CenterOfGravityResult {
  if (loads.length === 0) {
    throw new Error("Debes ingresar al menos un componente de carga.");
  }

  const totalWeightKg = loads.reduce((sum, load) => sum + load.weightKg, 0);
  if (totalWeightKg <= 0) {
    throw new Error("El peso total de los componentes debe ser mayor que 0.");
  }
  if (loads.some((load) => load.weightKg <= 0)) {
    throw new Error("Cada componente debe tener un peso mayor que 0.");
  }

  const xM = loads.reduce((sum, load) => sum + load.xM * load.weightKg, 0) / totalWeightKg;
  const yM = loads.reduce((sum, load) => sum + load.yM * load.weightKg, 0) / totalWeightKg;

  return { xM, yM, totalWeightKg };
}
