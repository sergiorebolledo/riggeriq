import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  HITCH_TYPES,
  NORMATIVE_PRESETS,
  type RiggingInput,
  type RiggingResult,
} from "@/lib/rigging-calculator";
import { generateSafetyRecommendations } from "@/lib/rigging-safety-recommendations";

const STATUS_LABELS: Record<RiggingResult["status"], string> = {
  safe: "SEGURO",
  warning: "PRECAUCIÓN",
  danger: "PELIGRO",
};

const STATUS_COLORS: Record<RiggingResult["status"], string> = {
  safe: "#16a34a",
  warning: "#ca8a04",
  danger: "#dc2626",
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#18181b",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#52525b",
    marginTop: 2,
  },
  headerMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d8",
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    textTransform: "uppercase",
    color: "#3f3f46",
  },
  statusBanner: {
    marginTop: 16,
    padding: 10,
    borderRadius: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBannerLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    color: "#ffffff",
  },
  table: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
  },
  tableRowLast: {
    flexDirection: "row",
  },
  tableCellLabel: {
    width: "50%",
    padding: 6,
    color: "#52525b",
  },
  tableCellValue: {
    width: "50%",
    padding: 6,
    fontFamily: "Helvetica-Bold",
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  listBullet: {
    width: 12,
  },
  listText: {
    flex: 1,
  },
  warningText: {
    color: "#b91c1c",
    marginBottom: 3,
  },
  signatureRow: {
    marginTop: 32,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "45%",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#18181b",
    marginTop: 32,
    paddingTop: 4,
    fontSize: 9,
    color: "#52525b",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    fontSize: 8,
    color: "#a1a1aa",
    textAlign: "center",
  },
});

interface PlanDeIzajePDFProps {
  input: RiggingInput;
  result: RiggingResult;
  generatedAt: Date;
}

export function PlanDeIzajePDF({ input, result, generatedAt }: PlanDeIzajePDFProps) {
  const norm = NORMATIVE_PRESETS[input.norm];
  const recommendations = generateSafetyRecommendations(result, norm);

  return (
    <Document title="Plan de Izaje Seguro">
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.headerTitle}>Plan de Izaje Seguro</Text>
          <Text style={styles.headerSubtitle}>Generado con Rigging Pro AI</Text>
        </View>

        <View style={styles.headerMetaRow}>
          <Text>Fecha: {generatedAt.toLocaleDateString("es-CL")}</Text>
          <Text>Norma aplicada: {norm.label}</Text>
        </View>

        <View
          style={[styles.statusBanner, { backgroundColor: STATUS_COLORS[result.status] }]}
        >
          <Text style={styles.statusBannerLabel}>{STATUS_LABELS[result.status]}</Text>
          <Text style={{ color: "#ffffff" }}>
            Ángulo θ = {result.slingAngleDegrees.toFixed(1)}° · FS mín. ={" "}
            {Math.min(result.slingSafetyFactor, result.shackleSafetyFactor).toFixed(2)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Componentes de la maniobra</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Peso total de la carga</Text>
              <Text style={styles.tableCellValue}>
                {input.totalWeightKg.toLocaleString("es-CL")} kg
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>N° de patas / eslingas</Text>
              <Text style={styles.tableCellValue}>{input.numberOfLegs}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>N° de grilletes</Text>
              <Text style={styles.tableCellValue}>{input.numberOfShackles}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Montaje de la eslinga</Text>
              <Text style={styles.tableCellValue}>{HITCH_TYPES[input.hitchType].label}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Dimensiones del arreglo de anclajes</Text>
              <Text style={styles.tableCellValue}>
                {input.baseWidthM} m × {input.baseLengthM} m
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Longitud de eslinga</Text>
              <Text style={styles.tableCellValue}>{input.slingLengthM} m</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>WLL eslinga (vertical/recto)</Text>
              <Text style={styles.tableCellValue}>
                {input.slingWLLKg.toLocaleString("es-CL")} kg
              </Text>
            </View>
            <View style={styles.tableRowLast}>
              <Text style={styles.tableCellLabel}>WLL grillete</Text>
              <Text style={styles.tableCellValue}>
                {input.shackleWLLKg.toLocaleString("es-CL")} kg
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Memoria de cálculo</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>
                Radio de base: r = √((ancho/2)² + (largo/2)²)
              </Text>
              <Text style={styles.tableCellValue}>{result.baseRadiusM.toFixed(3)} m</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Ángulo de eslinga: θ = arccos(r / L)</Text>
              <Text style={styles.tableCellValue}>{result.slingAngleDegrees.toFixed(2)}°</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Factor de amplificación: FA = 1 / sin(θ)</Text>
              <Text style={styles.tableCellValue}>{result.amplificationFactor.toFixed(3)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>
                Tensión por eslinga: T = (Peso / N° patas) × FA
              </Text>
              <Text style={styles.tableCellValue}>{result.tensionPerLegKg.toFixed(1)} kg</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>
                WLL eslinga efectivo (× {(result.hitchCapacityFactor * 100).toFixed(0)}% por montaje
                {input.hitchType === "basket" ? " en canasta, según ángulo" : ""})
              </Text>
              <Text style={styles.tableCellValue}>{result.effectiveSlingWLLKg.toFixed(1)} kg</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Factor de seguridad eslinga: FS = WLL efectivo / T</Text>
              <Text style={styles.tableCellValue}>{result.slingSafetyFactor.toFixed(2)}</Text>
            </View>
            <View style={styles.tableRowLast}>
              <Text style={styles.tableCellLabel}>Factor de seguridad grillete: FS = WLL / T</Text>
              <Text style={styles.tableCellValue}>{result.shackleSafetyFactor.toFixed(2)}</Text>
            </View>
          </View>

          {result.warnings.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {result.warnings.map((warning) => (
                <Text key={warning} style={styles.warningText}>
                  ⚠ {warning}
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medidas preventivas e instrucciones de maniobra</Text>
          {recommendations.map((item) => (
            <View key={item} style={styles.listItem}>
              <Text style={styles.listBullet}>•</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Nombre y firma del Rigger responsable</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}>Nombre y firma del Supervisor / Prevencionista</Text>
          </View>
        </View>

        <Text style={styles.footer} fixed>
          Documento generado automáticamente por Rigging Pro AI. Debe ser validado por un
          rigger/prevencionista calificado antes de su uso en terreno.
        </Text>
      </Page>
    </Document>
  );
}
