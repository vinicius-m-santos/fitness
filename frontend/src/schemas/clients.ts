import z from "zod";

export const clientFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val?.trim()) return true;
        const digits = val.replace(/\D/g, "");
        return digits.length === 10 || digits.length === 11;
      },
      { message: "Whatsapp inválido" }
    ),
  gender: z.string(),
  age: z.string().nullable().optional(),
  height: z.string().nullable().optional(),
  weight: z.string().nullable().optional(),
  objective: z.string().nullable().optional(),
  observation: z.string(),
});

export type ClientFormSchema = z.infer<typeof clientFormSchema>;

export const clientAnamneseSchema = z.object({
  age: z.string().min(1, "Preencha a Idade"),
  gender: z.string().min(1, "Preencha o Sexo"),
  bloodPressure: z.string().min(1, "Preencha sobre Problema de pressão"),
  ocupation: z.string().min(1, "Preencha a Ocupação"),
  weight: z.string().min(1, "Preencha o Peso"),
  height: z.string().min(1, "Preencha a Altura"),
  objective: z.string().min(1, "Preencha o Objetivo"),
  workoutDaysPerWeek: z.string().min(1, "Preencha Treinos por semana"),
  medicalRestriction: z
    .string()
    .min(1, "Preencha o campo Restrições médicas")
    .max(200),
  cronicalPain: z.string().min(1, "Preencha o campo Dor crônica").max(200),
  controledMedicine: z
    .string()
    .min(1, "Preencha o campo Remédios controlados")
    .max(200),
  heartProblem: z
    .string()
    .min(1, "Preencha o campo Histórico cardíaco familiar")
    .max(200),
  recentSurgery: z
    .string()
    .min(1, "Preencha o campo Cirurgia recente")
    .max(200),
  timeWithoutGym: z
    .string()
    .min(1, "Preencha o campo Tempo sem treinar")
    .max(200),
  observation: z.string().optional(),
  tags: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
    })
  ),
});

export type ClientAnamneseSchema = z.infer<typeof clientAnamneseSchema>;

export const anamneseUpdateModalSchema = z.object({
  age: z.string().optional(),
  gender: z.string().optional(),
  bloodPressure: z.string().optional(),
  ocupation: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  objective: z.string().optional(),
  workoutDaysPerWeek: z.string().optional(),
  medicalRestriction: z.string().optional(),
  cronicalPain: z.string().optional(),
  controledMedicine: z.string().optional(),
  heartProblem: z.string().optional(),
  recentSurgery: z.string().optional(),
  timeWithoutGym: z.string().optional(),
  observation: z.string().optional(),
  diet: z.string().optional(),
  sleep: z.string().optional(),
  physicalActivity: z.string().optional(),
  tags: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
    })
  ),
});

export type AnamneseUpdateModalSchema = z.infer<
  typeof anamneseUpdateModalSchema
>;
