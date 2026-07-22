import type { NormativeLimits, RiggingResult, SafetyStatus } from "./rigging-calculator";

/**
 * Medidas preventivas para el Plan de Izaje.
 *
 * Esta es una redacción basada en reglas (determinística), pensada como
 * reemplazo temporal de la Etapa 4 del PRD ("Claude redacta las medidas
 * preventivas e instrucciones de maniobra"), pausada hasta definir el
 * soporte multi-proveedor de IA. Cuando esa etapa se retome, esta función
 * puede seguir usándose como fallback para el plan Free.
 */

const BASE_RECOMMENDATIONS = [
  "Inspeccionar visualmente eslingas, grilletes y demás aparejos antes de cada maniobra; retirar de servicio cualquier componente dañado, corroído o sin identificación de WLL.",
  "Verificar que el área de maniobra esté delimitada y libre de personal no autorizado bajo la carga suspendida.",
  "Confirmar que el gancho de izaje cuente con pestillo de seguridad operativo.",
  "Realizar un izaje de prueba a baja altura para verificar el balance de la carga antes de continuar la maniobra.",
  "Mantener comunicación clara y constante entre el rigger, el operador de grúa y el señalero durante toda la maniobra.",
];

const STATUS_RECOMMENDATIONS: Record<SafetyStatus, string[]> = {
  safe: [
    "La configuración calculada cumple los factores de seguridad y ángulo mínimo exigidos; proceder según procedimiento estándar.",
  ],
  warning: [
    "El ángulo de eslinga o el factor de seguridad están cerca del límite aceptable: evaluar aumentar la longitud de las eslingas o redistribuir los puntos de anclaje antes de izar.",
    "Notificar al supervisor de la maniobra la condición de precaución detectada antes de continuar.",
  ],
  danger: [
    "No proceder con la maniobra en la configuración actual: el ángulo y/o el factor de seguridad están fuera de los límites normativos.",
    "Corregir la geometría del izaje (eslingas más largas, ángulo mayor a 45°) o utilizar aparejos de mayor WLL antes de reintentar el cálculo.",
  ],
};

export function generateSafetyRecommendations(
  result: RiggingResult,
  norm: NormativeLimits,
): string[] {
  const recommendations = [...STATUS_RECOMMENDATIONS[result.status], ...BASE_RECOMMENDATIONS];

  if (result.warnings.length > 0) {
    recommendations.push(
      `Revisar los incumplimientos normativos detectados respecto a ${norm.label} antes de ejecutar la maniobra.`,
    );
  }

  return recommendations;
}
