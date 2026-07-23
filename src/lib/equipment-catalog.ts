/**
 * Catalogo precargado de aparejos (PRD seccion 9.4: "Inventario/Locker de
 * Aparejos... eslingas sinteticas Kinglift de 3.00 Ton, Grilletes Gorila
 * 3/4 de 4.75 Ton"). Permite elegir un aparejo en vez de tipear el WLL a mano.
 *
 * Los valores de WLL aqui son SOLO los dos ejemplos que ya venian en el PRD.
 * No se transcribieron tablas de capacidad desde el catalogo PDF de Gorila:
 * el texto extraido del PDF (tablas multi-columna con datos de imagenes
 * intercaladas) salia mezclado/ambiguo, y usar numeros mal leidos en una
 * app de seguridad de izaje es inaceptable. Para un catalogo real, cargar
 * aqui los valores certificados por el fabricante (o desde Supabase una
 * vez exista panel de administracion de catalogo).
 */

export interface CatalogSling {
  id: string;
  brand: string;
  model: string;
  capacityTon: number;
}

export interface CatalogShackle {
  id: string;
  brand: string;
  sizeInches: string;
  capacityTon: number;
}

export const SLING_CATALOG: CatalogSling[] = [
  { id: "kinglift-sintetica-3t", brand: "Kinglift", model: "Eslinga sintética plana", capacityTon: 3.0 },
];

export const SHACKLE_CATALOG: CatalogShackle[] = [
  { id: "gorila-lira-3-4", brand: "Gorila", sizeInches: '3/4"', capacityTon: 4.75 },
];

export function tonToKg(capacityTon: number): number {
  return capacityTon * 1000;
}
