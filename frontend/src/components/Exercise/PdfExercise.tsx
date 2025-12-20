import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { ClientAllData } from "@/types/client";
import { OBJECTIVES } from "@/utils/constants/Client/constants";
import fitriseLogo from "@/assets/fitrise_logo.png";
import profilePlaceholder from "@/assets/profile_placeholder.jpg";

const PRIMARY = "#0f172a"; // azul escuro
const ACCENT = "#f59e0b"; // laranja
const LIGHT = "#f1f5f9"; // fundo
const WHITE = "#ffffff";
const GRAY = "#475569";
const SUCCESS = "#22c55e";
const ALERT = "#ef4444";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: LIGHT,
    padding: 24,
  },

  // 🔹 Top header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 8,
    borderBottom: `2 solid ${ACCENT}`,
  },
  personalBlock: { flexDirection: "row", alignItems: "center", gap: 12 },
  personalPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    objectFit: "cover",
  },
  personalInfo: { display: "flex", flexDirection: "column" },
  personalName: { fontSize: 14, fontWeight: "bold", color: PRIMARY },
  personalSlogan: { fontSize: 10, color: ACCENT, fontStyle: "italic" },
  contactText: { fontSize: 10, color: GRAY },

  // 🔹 Client info
  clientBox: {
    marginVertical: 16,
    padding: 12,
    backgroundColor: WHITE,
    borderRadius: 12,
    border: `1 solid ${PRIMARY}`,
  },
  clientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: { fontSize: 10, fontWeight: "bold", color: PRIMARY },
  value: { fontSize: 10, color: GRAY },

  // 🔹 Objectives and Focus
  objectivesBox: {
    backgroundColor: "#e0f2fe",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  objectivesTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: PRIMARY,
    marginBottom: 6,
  },
  objectivesText: { fontSize: 10, color: GRAY },

  // 🔹 Evolution cards
  evolutionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  evolutionCard: {
    flex: 1,
    marginRight: 6,
    padding: 8,
    borderRadius: 10,
    backgroundColor: WHITE,
    border: `1 solid ${ACCENT}`,
  },
  evolutionLabel: { fontSize: 9, fontWeight: "bold", color: PRIMARY },
  evolutionValue: { fontSize: 12, fontWeight: "bold", color: SUCCESS },

  // 🔹 Workout table
  periodContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: WHITE,
    border: `1 solid ${ACCENT}`,
  },
  periodHeader: {
    backgroundColor: ACCENT,
    color: WHITE,
    padding: 6,
    fontSize: 12,
    fontWeight: "bold",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ffedd5",
    fontSize: 10,
    fontWeight: "bold",
    paddingVertical: 4,
    borderBottom: `1 solid #f97316`,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    fontSize: 10,
    borderBottom: `1 solid #fcd34d`,
  },
  tableCell: { flex: 1, paddingHorizontal: 6 },
  notesCell: { flex: 2, paddingHorizontal: 6 },
  rowOdd: { backgroundColor: "#fff7ed" },
  rowEven: { backgroundColor: "#fff3e0" },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: "#888",
  },
  fitriseLogo: {
    width: 50,
    height: 20,
    marginTop: 4,
    alignSelf: "center",
  },
});

interface PdfExerciseProps {
  client: ClientAllData;
  workout: {
    name: string;
    periods: Array<{
      name: string;
      exercises: Array<{
        name: string;
        series: string;
        reps: string;
        rest: string;
        type?: "Força" | "Cardio" | "Alongamento";
        obs?: string;
      }>;
    }>;
  };
}

export const PdfExercise: React.FC<PdfExerciseProps> = ({
  client,
  workout,
}) => {
  const formatName = (firstName: string, lastName: string) => {
    firstName = firstName.length
      ? firstName.substring(0, 1).toUpperCase() + firstName.substring(1)
      : firstName;
    lastName = lastName.length
      ? lastName.substring(0, 1).toUpperCase() + lastName.substring(1)
      : lastName;

    return `${firstName} ${lastName}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.personalBlock}>
            <Image
              src={client.personal?.photoUrl || profilePlaceholder}
              style={styles.personalPhoto}
            />
            <View style={styles.personalInfo}>
              <Text style={styles.personalName}>
                {client.personal?.user?.firstName}{" "}
                {client.personal?.user?.lastName}
              </Text>
              <Text style={styles.personalSlogan}>Personal Trainer</Text>
              <Text style={styles.contactText}>
                {client.personal?.user?.phone || ""}
              </Text>
              <Text style={styles.contactText}>
                {client.personal?.user?.email || ""}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: ACCENT }}>
            {workout.name || ""}
          </Text>
        </View>

        <View style={styles.clientBox}>
          <View style={styles.clientRow}>
            <Text style={styles.label}>Aluno:</Text>
            <Text style={styles.value}>
              {formatName(client.name, client.lastName)}
            </Text>
          </View>
          <View style={styles.clientRow}>
            <Text style={styles.label}>Idade:</Text>
            <Text style={styles.value}>
              {client.age ? `${client.age} anos` : "-"}
            </Text>
          </View>
          <View style={styles.clientRow}>
            <Text style={styles.label}>Altura:</Text>
            <Text style={styles.value}>
              {client.height ? `${client.height} cm` : "-"}
            </Text>
          </View>
          <View style={styles.clientRow}>
            <Text style={styles.label}>Peso:</Text>
            <Text style={styles.value}>
              {client.weight ? `${client.weight} kg` : "-"}
            </Text>
          </View>
          {Object.hasOwn(OBJECTIVES, client?.objective) && (
            <View style={styles.clientRow}>
              <Text style={styles.label}>Objetivo:</Text>
              <Text style={styles.value}>{OBJECTIVES[client?.objective]}</Text>
            </View>
          )}
        </View>

        {client?.observation && client?.observation.length && (
          <View style={styles.objectivesBox}>
            <Text style={styles.objectivesTitle}>Informações adicionais</Text>
            <Text style={styles.objectivesText}>{client?.observation}</Text>
          </View>
        )}

        {workout.periods.map((period, pi) => (
          <View key={pi} style={styles.periodContainer} wrap={false}>
            <Text style={styles.periodHeader}>{period.name}</Text>

            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>Exercício</Text>
              <Text style={styles.tableCell}>Séries</Text>
              <Text style={styles.tableCell}>Repetições</Text>
              <Text style={styles.tableCell}>Descanso</Text>
              <Text style={styles.notesCell}>Tipo / Notas</Text>
            </View>

            {period.exercises.map((ex, ei) => (
              <View
                key={ei}
                style={[
                  styles.tableRow,
                  ei % 2 === 0 ? styles.rowEven : styles.rowOdd,
                ]}
              >
                <Text style={styles.tableCell}>{ex.name}</Text>
                <Text style={styles.tableCell}>{ex.series}</Text>
                <Text style={styles.tableCell}>{ex.reps}</Text>
                <Text style={styles.tableCell}>{ex.rest}</Text>
                <Text style={styles.notesCell}>{ex.obs ? ex.obs : ""}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          <Text>powered by</Text>
          <Image src={fitriseLogo} style={styles.fitriseLogo} />
        </View>
      </Page>
    </Document>
  );
};
