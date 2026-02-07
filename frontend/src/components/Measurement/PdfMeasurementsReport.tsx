import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Svg,
  Line,
  Polyline,
  Circle,
} from "@react-pdf/renderer";
import { ClientAllData } from "@/types/client";
import { OBJECTIVES } from "@/utils/constants/Client/constants";
import fitriseLogo from "@/assets/fitrise_logo.png";
import profilePlaceholder from "@/assets/profile_placeholder.jpg";

const PRIMARY = "#0f172a";
const ACCENT = "#f59e0b";
const LIGHT = "#f1f5f9";
const WHITE = "#ffffff";
const GRAY = "#475569";
const CHART_WIDTH = 480;
const CHART_HEIGHT = 100;
const CHART_PAD = { left: 36, right: 12, top: 8, bottom: 20 };
const PLOT_WIDTH = CHART_WIDTH - CHART_PAD.left - CHART_PAD.right;
const PLOT_HEIGHT = CHART_HEIGHT - CHART_PAD.top - CHART_PAD.bottom;

const CONTENT_WIDTH = 547;
const CARD_GAP = 10;
const CARD_CHART_WIDTH = (CONTENT_WIDTH - CARD_GAP) / 2;
const CARD_CHART_HEIGHT = 52;
const CARD_CHART_PAD = { left: 28, right: 8, top: 4, bottom: 12 };
const CARD_PLOT_WIDTH = CARD_CHART_WIDTH - CARD_CHART_PAD.left - CARD_CHART_PAD.right;
const CARD_PLOT_HEIGHT = CARD_CHART_HEIGHT - CARD_CHART_PAD.top - CARD_CHART_PAD.bottom;
const CARD_POINT_R = 2;

function buildLineChartPoints(
  values: number[],
  minY: number,
  maxY: number,
  plotW: number,
  plotH: number,
  pad: { left: number; right: number; top: number; bottom: number },
): string {
  if (values.length === 0) return "";
  const range = maxY - minY || 1;
  const stepX = values.length === 1 ? 0 : plotW / (values.length - 1);
  return values
    .map((v, i) => {
      const x = pad.left + i * stepX;
      const y = pad.top + plotH - ((v - minY) / range) * plotH;
      return `${x},${y}`;
    })
    .join(" ");
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: LIGHT,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottom: `2 solid ${ACCENT}`,
  },
  personalBlock: { flexDirection: "row", alignItems: "center", gap: 12 },
  personalPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    objectFit: "cover",
  },
  personalInfo: { display: "flex", flexDirection: "column" },
  personalName: { fontSize: 12, fontWeight: "bold", color: PRIMARY },
  personalSlogan: { fontSize: 9, color: ACCENT, fontStyle: "italic" },
  reportTitle: { fontSize: 16, fontWeight: "bold", color: ACCENT },
  clientBox: {
    marginBottom: 14,
    padding: 10,
    backgroundColor: WHITE,
    borderRadius: 8,
    border: `1 solid ${PRIMARY}`,
  },
  clientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: { fontSize: 9, fontWeight: "bold", color: PRIMARY },
  value: { fontSize: 9, color: GRAY },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: PRIMARY,
    marginBottom: 8,
    marginTop: 12,
  },
  chartCard: {
    marginBottom: 14,
    width: CONTENT_WIDTH,
    backgroundColor: WHITE,
    borderRadius: 8,
    border: `1 solid ${ACCENT}`,
    overflow: "hidden",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  chartTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: PRIMARY,
    marginBottom: 4,
    paddingLeft: CHART_PAD.left,
  },
  cardChartsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
    marginBottom: 12,
    width: CONTENT_WIDTH,
  },
  cardChartBox: {
    width: CARD_CHART_WIDTH,
    padding: 6,
    backgroundColor: WHITE,
    borderRadius: 8,
    border: `1 solid ${ACCENT}`,
  },
  cardChartTitle: { fontSize: 8, fontWeight: "bold", color: PRIMARY, marginBottom: 2, paddingLeft: CARD_CHART_PAD.left },
  mainTable: {
    width: CONTENT_WIDTH,
    backgroundColor: WHITE,
    borderRadius: 8,
    border: `1 solid ${ACCENT}`,
    overflow: "hidden",
    marginBottom: 12,
  },
  mainTableHeader: {
    flexDirection: "row",
    backgroundColor: ACCENT,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  mainTableHeaderCell: { fontSize: 7, fontWeight: "bold", color: WHITE, flex: 1 },
  mainTableRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  mainTableCell: { fontSize: 7, color: GRAY, flex: 1 },
  rowEven: { backgroundColor: "#fff7ed" },
  rowOdd: { backgroundColor: WHITE },
  emptyMessage: { fontSize: 9, color: GRAY, fontStyle: "italic", padding: 12 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 9,
    color: GRAY,
  },
  fitriseLogo: { width: 40, height: 16, marginTop: 4, alignSelf: "center" },
});

export interface EvolutionDataPoint {
  date: string;
  peso: number | null;
  gordura: number | null;
  massaMagra: number | null;
}

export interface CardSeries {
  date: string;
  value: number;
}

export interface MeasurementRow {
  id: number;
  date: string;
  rightArm: number;
  leftArm: number;
  waist: number;
  rightLeg: number;
  leftLeg: number;
  chest: number;
  weight?: number | null;
  fatPercentage?: number | null;
  fatMass?: number | null;
  leanMass?: number | null;
}

interface PdfMeasurementsReportProps {
  client: ClientAllData;
  evolutionData: EvolutionDataPoint[];
  cardsData: {
    rightArm: CardSeries[];
    leftArm: CardSeries[];
    waist: CardSeries[];
    rightLeg: CardSeries[];
    leftLeg: CardSeries[];
    chest: CardSeries[];
  };
  measurements: MeasurementRow[];
  personalAvatarSrc?: string;
}

function formatName(firstName: string, lastName: string) {
  const n = firstName?.length ? firstName.substring(0, 1).toUpperCase() + firstName.substring(1) : firstName ?? "";
  const l = lastName?.length ? lastName.substring(0, 1).toUpperCase() + lastName.substring(1) : lastName ?? "";
  return `${n} ${l}`.trim();
}

export const PdfMeasurementsReport: React.FC<PdfMeasurementsReportProps> = ({
  client,
  evolutionData,
  cardsData,
  measurements,
  personalAvatarSrc,
}) => {
  const avatarSrc = personalAvatarSrc || profilePlaceholder;
  const pesoData = evolutionData.filter((d) => d.peso != null);
  const gorduraData = evolutionData.filter((d) => d.gordura != null);
  const massaMagraData = evolutionData.filter((d) => d.massaMagra != null);

  const cardLabels: { key: keyof typeof cardsData; label: string }[] = [
    { key: "rightArm", label: "Braço D" },
    { key: "leftArm", label: "Braço E" },
    { key: "waist", label: "Cintura" },
    { key: "rightLeg", label: "Perna D" },
    { key: "leftLeg", label: "Perna E" },
    { key: "chest", label: "Tórax" },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.personalBlock}>
            <Image src={avatarSrc} style={styles.personalPhoto} />
            <View style={styles.personalInfo}>
              <Text style={styles.personalName}>
                {client.personal?.user?.firstName} {client.personal?.user?.lastName}
              </Text>
              <Text style={styles.personalSlogan}>Personal Trainer</Text>
            </View>
          </View>
          <Text style={styles.reportTitle}>Relatório de Medidas e Evolução</Text>
        </View>

        <View style={styles.clientBox}>
          <View style={styles.clientRow}>
            <Text style={styles.label}>Aluno:</Text>
            <Text style={styles.value}>{formatName(client.name, client.lastName)}</Text>
          </View>
          <View style={styles.clientRow}>
            <Text style={styles.label}>Idade:</Text>
            <Text style={styles.value}>
              {client.user?.age != null ? `${client.user.age} anos` : "-"}
            </Text>
          </View>
          <View style={styles.clientRow}>
            <Text style={styles.label}>Altura:</Text>
            <Text style={styles.value}>{client.height ? `${client.height} cm` : "-"}</Text>
          </View>
          <View style={styles.clientRow}>
            <Text style={styles.label}>Peso atual:</Text>
            <Text style={styles.value}>{client.weight ? `${client.weight} kg` : "-"}</Text>
          </View>
          {Object.hasOwn(OBJECTIVES, client?.objective) && (
            <View style={styles.clientRow}>
              <Text style={styles.label}>Objetivo:</Text>
              <Text style={styles.value}>{OBJECTIVES[client.objective]}</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Evolução (Peso, % Gordura, Massa Magra)</Text>

        {pesoData.length > 0 && (() => {
          const values = pesoData.map((d) => d.peso as number);
          const minY = Math.min(...values);
          const maxY = Math.max(...values);
          const padding = (maxY - minY) * 0.1 || 1;
          const yMin = Math.max(0, minY - padding);
          const yMax = maxY + padding;
          const points = buildLineChartPoints(values, yMin, yMax, PLOT_WIDTH, PLOT_HEIGHT, CHART_PAD);
          const stepX = values.length === 1 ? 0 : PLOT_WIDTH / (values.length - 1);
          return (
            <View style={styles.chartCard} wrap={false}>
              <Text style={styles.chartTitle}>Peso Corporal (kg)</Text>
              <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                <Line x1={CHART_PAD.left} y1={CHART_PAD.top} x2={CHART_PAD.left} y2={CHART_PAD.top + PLOT_HEIGHT} stroke={GRAY} strokeWidth={1} />
                <Line x1={CHART_PAD.left} y1={CHART_PAD.top + PLOT_HEIGHT} x2={CHART_PAD.left + PLOT_WIDTH} y2={CHART_PAD.top + PLOT_HEIGHT} stroke={GRAY} strokeWidth={1} />
                <Polyline points={points} stroke="#3b82f6" strokeWidth={2} fill="none" />
                {values.map((v, i) => {
                  const x = CHART_PAD.left + i * stepX;
                  const y = CHART_PAD.top + PLOT_HEIGHT - ((v - yMin) / (yMax - yMin)) * PLOT_HEIGHT;
                  return <Circle key={`p-${i}`} cx={x} cy={y} r={3} fill="#3b82f6" />;
                })}
              </Svg>
              <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: CHART_PAD.left, marginTop: 2 }}>
                <Text style={{ fontSize: 7, color: GRAY }}>{yMin.toFixed(1)} kg</Text>
                <Text style={{ fontSize: 7, color: GRAY }}>{yMax.toFixed(1)} kg</Text>
              </View>
            </View>
          );
        })()}

        {gorduraData.length > 0 && (() => {
          const values = gorduraData.map((d) => d.gordura as number);
          const minY = Math.min(...values);
          const maxY = Math.max(...values);
          const padding = (maxY - minY) * 0.1 || 1;
          const yMin = Math.max(0, minY - padding);
          const yMax = maxY + padding;
          const points = buildLineChartPoints(values, yMin, yMax, PLOT_WIDTH, PLOT_HEIGHT, CHART_PAD);
          const stepX = values.length === 1 ? 0 : PLOT_WIDTH / (values.length - 1);
          return (
            <View style={styles.chartCard} wrap={false}>
              <Text style={styles.chartTitle}>Percentual de Gordura (%)</Text>
              <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                <Line x1={CHART_PAD.left} y1={CHART_PAD.top} x2={CHART_PAD.left} y2={CHART_PAD.top + PLOT_HEIGHT} stroke={GRAY} strokeWidth={1} />
                <Line x1={CHART_PAD.left} y1={CHART_PAD.top + PLOT_HEIGHT} x2={CHART_PAD.left + PLOT_WIDTH} y2={CHART_PAD.top + PLOT_HEIGHT} stroke={GRAY} strokeWidth={1} />
                <Polyline points={points} stroke="#ef4444" strokeWidth={2} fill="none" />
                {values.map((v, i) => {
                  const x = CHART_PAD.left + i * stepX;
                  const y = CHART_PAD.top + PLOT_HEIGHT - ((v - yMin) / (yMax - yMin)) * PLOT_HEIGHT;
                  return <Circle key={`g-${i}`} cx={x} cy={y} r={3} fill="#ef4444" />;
                })}
              </Svg>
              <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: CHART_PAD.left, marginTop: 2 }}>
                <Text style={{ fontSize: 7, color: GRAY }}>{yMin.toFixed(1)} %</Text>
                <Text style={{ fontSize: 7, color: GRAY }}>{yMax.toFixed(1)} %</Text>
              </View>
            </View>
          );
        })()}

        {massaMagraData.length > 0 && (() => {
          const values = massaMagraData.map((d) => d.massaMagra as number);
          const minY = Math.min(...values);
          const maxY = Math.max(...values);
          const padding = (maxY - minY) * 0.1 || 1;
          const yMin = Math.max(0, minY - padding);
          const yMax = maxY + padding;
          const points = buildLineChartPoints(values, yMin, yMax, PLOT_WIDTH, PLOT_HEIGHT, CHART_PAD);
          const stepX = values.length === 1 ? 0 : PLOT_WIDTH / (values.length - 1);
          return (
            <View style={styles.chartCard} wrap={false}>
              <Text style={styles.chartTitle}>Massa Magra (kg)</Text>
              <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                <Line x1={CHART_PAD.left} y1={CHART_PAD.top} x2={CHART_PAD.left} y2={CHART_PAD.top + PLOT_HEIGHT} stroke={GRAY} strokeWidth={1} />
                <Line x1={CHART_PAD.left} y1={CHART_PAD.top + PLOT_HEIGHT} x2={CHART_PAD.left + PLOT_WIDTH} y2={CHART_PAD.top + PLOT_HEIGHT} stroke={GRAY} strokeWidth={1} />
                <Polyline points={points} stroke="#22c55e" strokeWidth={2} fill="none" />
                {values.map((v, i) => {
                  const x = CHART_PAD.left + i * stepX;
                  const y = CHART_PAD.top + PLOT_HEIGHT - ((v - yMin) / (yMax - yMin)) * PLOT_HEIGHT;
                  return <Circle key={`m-${i}`} cx={x} cy={y} r={3} fill="#22c55e" />;
                })}
              </Svg>
              <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: CHART_PAD.left, marginTop: 2 }}>
                <Text style={{ fontSize: 7, color: GRAY }}>{yMin.toFixed(1)} kg</Text>
                <Text style={{ fontSize: 7, color: GRAY }}>{yMax.toFixed(1)} kg</Text>
              </View>
            </View>
          );
        })()}

        {pesoData.length === 0 && gorduraData.length === 0 && massaMagraData.length === 0 && (
          <View style={styles.chartCard} wrap={false}>
            <Text style={styles.emptyMessage}>Sem dados de evolução disponíveis.</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Medidas por grupo</Text>
        <View style={styles.cardChartsRow}>
          {cardLabels.map(({ key, label }) => {
            const series = cardsData[key];
            const values = series.map((d) => d.value);
            if (values.length === 0) {
              return (
                <View key={key} style={styles.cardChartBox} wrap={false}>
                  <Text style={styles.cardChartTitle}>{label}</Text>
                  <Text style={styles.emptyMessage}>Sem dados</Text>
                </View>
              );
            }
            const minY = Math.min(...values);
            const maxY = Math.max(...values);
            const padding = (maxY - minY) * 0.1 || 1;
            const yMin = Math.max(0, minY - padding);
            const yMax = maxY + padding;
            const stepX = values.length === 1 ? 0 : CARD_PLOT_WIDTH / (values.length - 1);
            const points = buildLineChartPoints(values, yMin, yMax, CARD_PLOT_WIDTH, CARD_PLOT_HEIGHT, CARD_CHART_PAD);
            return (
              <View key={key} style={styles.cardChartBox} wrap={false}>
                <Text style={styles.cardChartTitle}>{label} (cm)</Text>
                <Svg width={CARD_CHART_WIDTH} height={CARD_CHART_HEIGHT}>
                  <Line x1={CARD_CHART_PAD.left} y1={CARD_CHART_PAD.top} x2={CARD_CHART_PAD.left} y2={CARD_CHART_PAD.top + CARD_PLOT_HEIGHT} stroke={GRAY} strokeWidth={0.5} />
                  <Line x1={CARD_CHART_PAD.left} y1={CARD_CHART_PAD.top + CARD_PLOT_HEIGHT} x2={CARD_CHART_PAD.left + CARD_PLOT_WIDTH} y2={CARD_CHART_PAD.top + CARD_PLOT_HEIGHT} stroke={GRAY} strokeWidth={0.5} />
                  <Polyline points={points} stroke={ACCENT} strokeWidth={1.5} fill="none" />
                  {values.map((v, i) => {
                    const x = CARD_CHART_PAD.left + i * stepX;
                    const y = CARD_CHART_PAD.top + CARD_PLOT_HEIGHT - ((v - yMin) / (yMax - yMin)) * CARD_PLOT_HEIGHT;
                    return <Circle key={i} cx={x} cy={y} r={CARD_POINT_R} fill={ACCENT} />;
                  })}
                </Svg>
                <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: CARD_CHART_PAD.left, marginTop: 2 }}>
                  <Text style={{ fontSize: 6, color: GRAY }}>{yMin.toFixed(0)}</Text>
                  <Text style={{ fontSize: 6, color: GRAY }}>{yMax.toFixed(0)} cm</Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Histórico de medições</Text>
        <View style={styles.mainTable} wrap={false}>
          {measurements.length === 0 ? (
            <Text style={styles.emptyMessage}>Nenhuma medição registrada.</Text>
          ) : (
            <>
              <View style={styles.mainTableHeader}>
                <Text style={styles.mainTableHeaderCell}>Data</Text>
                <Text style={styles.mainTableHeaderCell}>Braço D</Text>
                <Text style={styles.mainTableHeaderCell}>Braço E</Text>
                <Text style={styles.mainTableHeaderCell}>Cintura</Text>
                <Text style={styles.mainTableHeaderCell}>Perna D</Text>
                <Text style={styles.mainTableHeaderCell}>Perna E</Text>
                <Text style={styles.mainTableHeaderCell}>Tórax</Text>
                <Text style={styles.mainTableHeaderCell}>Peso</Text>
                <Text style={styles.mainTableHeaderCell}>% Gordura</Text>
                <Text style={styles.mainTableHeaderCell}>Massa Magra</Text>
              </View>
              {measurements.map((m, i) => (
                <View
                  key={m.id}
                  style={[
                    styles.mainTableRow,
                    i % 2 === 0 ? styles.rowEven : styles.rowOdd,
                  ]}
                >
                  <Text style={styles.mainTableCell}>{m.date}</Text>
                  <Text style={styles.mainTableCell}>{m.rightArm} cm</Text>
                  <Text style={styles.mainTableCell}>{m.leftArm} cm</Text>
                  <Text style={styles.mainTableCell}>{m.waist} cm</Text>
                  <Text style={styles.mainTableCell}>{m.rightLeg} cm</Text>
                  <Text style={styles.mainTableCell}>{m.leftLeg} cm</Text>
                  <Text style={styles.mainTableCell}>{m.chest} cm</Text>
                  <Text style={styles.mainTableCell}>{m.weight != null ? `${m.weight} kg` : "-"}</Text>
                  <Text style={styles.mainTableCell}>{m.fatPercentage != null ? `${m.fatPercentage} %` : "-"}</Text>
                  <Text style={styles.mainTableCell}>{m.leanMass != null ? `${m.leanMass} kg` : "-"}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text>powered by</Text>
          <Image src={fitriseLogo} style={styles.fitriseLogo} />
        </View>
      </Page>
    </Document>
  );
};
