import z from "zod";
import { getEffectiveDueDateISO, getTodayYMD, isValidISODate } from "@/utils/dateUtils";

export const trainingCreateSchema = z
  .object({
    name: z
      .string()
      .min(3, "O nome do treino precisa ter pelo menos 3 caracteres")
      .max(50),

    dueDate: z.string().optional(),

    periods: z
    .array(
      z.object({
        id: z.number(),
        name: z
          .string()
          .min(3, "O nome do período precisa ter pelo menos 3 caracteres")
          .max(50),
        exercises: z
          .array(
            z.object({
              instanceId: z.string().optional(),
              id: z.number(),
              name: z.string(),
              series: z.string().optional(),
              reps: z.string().optional(),
              rest: z.string().optional(),
              obs: z.string().optional(),
            })
          )
          .min(1, "Cada período precisa ter pelo menos um exercício"),
      })
    )
    .min(1, "Adicione pelo menos um período"),
  })
  .refine(
    (data) => {
      const iso = getEffectiveDueDateISO(data.dueDate);
      if (!iso) return true;
      return isValidISODate(iso);
    },
    { message: "Data de vencimento inválida.", path: ["dueDate"] }
  )
  .refine(
    (data) => {
      const iso = getEffectiveDueDateISO(data.dueDate);
      if (!iso) return true;
      return iso > getTodayYMD();
    },
    { message: "A data de vencimento deve ser no futuro.", path: ["dueDate"] }
  );

export type TrainingCreateSchema = z.infer<typeof trainingCreateSchema>;

export const periodNameSchema = z
  .string()
  .min(3, "O nome do período precisa ter pelo menos 3 caracteres")
  .max(50);
