import z from "zod";

export const trainingCreateSchema = z.object({
  name: z
    .string()
    .min(3, "O nome do treino precisa ter pelo menos 3 caracteres")
    .max(50),

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
              instanceId: z.number(),
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
});

export type TrainingCreateSchema = z.infer<typeof trainingCreateSchema>;

export const periodNameSchema = z
  .string()
  .min(3, "O nome do período precisa ter pelo menos 3 caracteres")
  .max(50);
