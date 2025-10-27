import z from "zod";

export const clientFormSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string(),
    gender: z.string(),
    age: z.number().nullable(),
    height: z.number().nullable(),
    weight: z.number().nullable(),
    objective: z.number().nullable().optional(),
    observation: z.string(),
});

export type ClientFormSchema = z.infer<typeof clientFormSchema>;
