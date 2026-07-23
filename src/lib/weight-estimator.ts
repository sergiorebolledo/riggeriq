/**
 * Calculadora de Peso de Cargas / Estimador de Masa (PRD sección 8A.1).
 *
 * Calcula el volumen según la geometría elegida y lo multiplica por la
 * densidad del material para estimar el peso. La Viga H/I y el
 * Contenedor se aproximan como perfiles huecos (rectángulo exterior menos
 * rectángulo interior según el grosor de pared): es una aproximación
 * razonable sin una tabla real de perfiles de acero normados; para un
 * peso certificado, usar la ficha técnica del perfil específico.
 */

export type ShapeType = "cylinder" | "plate" | "ibeam" | "container" | "block";

export type MaterialType = "steel" | "concrete" | "water" | "wood" | "copper";

export const MATERIAL_LABELS: Record<MaterialType, string> = {
  steel: "Acero",
  concrete: "Hormigón/Concreto",
  water: "Agua",
  wood: "Madera",
  copper: "Cobre",
};

/** Densidades de referencia en kg/m³. Valores promedio para estimación, no certificados. */
export const MATERIAL_DENSITIES_KG_M3: Record<MaterialType, number> = {
  steel: 7850,
  concrete: 2400,
  water: 1000,
  wood: 600,
  copper: 8960,
};

export interface CylinderDimensions {
  diameterM: number;
  lengthM: number;
  /** 0 o ausente = cilindro macizo; > 0 = tubería (cilindro hueco). */
  wallThicknessM?: number;
}

export interface PlateDimensions {
  lengthM: number;
  widthM: number;
  thicknessM: number;
}

export interface IBeamDimensions {
  widthM: number;
  heightM: number;
  lengthM: number;
  wallThicknessM: number;
}

export interface ContainerDimensions {
  lengthM: number;
  widthM: number;
  heightM: number;
  wallThicknessM: number;
}

export interface BlockDimensions {
  lengthM: number;
  widthM: number;
  heightM: number;
}

export type ShapeInput =
  | { type: "cylinder"; dimensions: CylinderDimensions }
  | { type: "plate"; dimensions: PlateDimensions }
  | { type: "ibeam"; dimensions: IBeamDimensions }
  | { type: "container"; dimensions: ContainerDimensions }
  | { type: "block"; dimensions: BlockDimensions };

function assertPositive(value: number, label: string): void {
  if (!(value > 0)) {
    throw new Error(`${label} debe ser mayor que 0.`);
  }
}

export function calculateCylinderVolume(dimensions: CylinderDimensions): number {
  const { diameterM, lengthM, wallThicknessM = 0 } = dimensions;
  assertPositive(diameterM, "El diámetro");
  assertPositive(lengthM, "El largo");

  const outerRadius = diameterM / 2;
  if (wallThicknessM > 0) {
    const innerRadius = outerRadius - wallThicknessM;
    if (innerRadius <= 0) {
      throw new Error("El grosor de pared es mayor o igual al radio: geometría inválida.");
    }
    return Math.PI * (outerRadius ** 2 - innerRadius ** 2) * lengthM;
  }
  return Math.PI * outerRadius ** 2 * lengthM;
}

export function calculatePlateVolume(dimensions: PlateDimensions): number {
  const { lengthM, widthM, thicknessM } = dimensions;
  assertPositive(lengthM, "El largo");
  assertPositive(widthM, "El ancho");
  assertPositive(thicknessM, "El grosor");
  return lengthM * widthM * thicknessM;
}

export function calculateIBeamVolume(dimensions: IBeamDimensions): number {
  const { widthM, heightM, lengthM, wallThicknessM } = dimensions;
  assertPositive(widthM, "El ancho");
  assertPositive(heightM, "El alto");
  assertPositive(lengthM, "El largo");
  assertPositive(wallThicknessM, "El grosor");

  const innerWidth = widthM - 2 * wallThicknessM;
  const innerHeight = heightM - 2 * wallThicknessM;
  if (innerWidth <= 0 || innerHeight <= 0) {
    throw new Error("El grosor es demasiado grande para estas dimensiones.");
  }
  return (widthM * heightM - innerWidth * innerHeight) * lengthM;
}

export function calculateContainerVolume(dimensions: ContainerDimensions): number {
  const { lengthM, widthM, heightM, wallThicknessM } = dimensions;
  assertPositive(lengthM, "El largo");
  assertPositive(widthM, "El ancho");
  assertPositive(heightM, "El alto");
  assertPositive(wallThicknessM, "El grosor");

  const innerLength = lengthM - 2 * wallThicknessM;
  const innerWidth = widthM - 2 * wallThicknessM;
  const innerHeight = heightM - 2 * wallThicknessM;
  if (innerLength <= 0 || innerWidth <= 0 || innerHeight <= 0) {
    throw new Error("El grosor es demasiado grande para estas dimensiones.");
  }
  return lengthM * widthM * heightM - innerLength * innerWidth * innerHeight;
}

export function calculateBlockVolume(dimensions: BlockDimensions): number {
  const { lengthM, widthM, heightM } = dimensions;
  assertPositive(lengthM, "El largo");
  assertPositive(widthM, "El ancho");
  assertPositive(heightM, "El alto");
  return lengthM * widthM * heightM;
}

export function calculateVolumeM3(input: ShapeInput): number {
  switch (input.type) {
    case "cylinder":
      return calculateCylinderVolume(input.dimensions);
    case "plate":
      return calculatePlateVolume(input.dimensions);
    case "ibeam":
      return calculateIBeamVolume(input.dimensions);
    case "container":
      return calculateContainerVolume(input.dimensions);
    case "block":
      return calculateBlockVolume(input.dimensions);
  }
}

export interface WeightEstimateResult {
  volumeM3: number;
  weightKg: number;
}

export function estimateWeight(input: ShapeInput, material: MaterialType): WeightEstimateResult {
  const volumeM3 = calculateVolumeM3(input);
  const weightKg = volumeM3 * MATERIAL_DENSITIES_KG_M3[material];
  return { volumeM3, weightKg };
}
