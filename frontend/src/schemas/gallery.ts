import { z } from "zod";

export const galleryUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Formato inválido. Use JPG, PNG ou WEBP."
    )
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Imagem deve ter no máximo 5MB"
    ),

  date: z.date(),

  note: z.string().max(200).optional(),

  visibility: z.enum(["PRIVATE", "TRAINER"], {
    required_error: "Escolha a visibilidade da imagem",
  }),
});

export type GalleryUploadSchema = z.infer<typeof galleryUploadSchema>;

export type GalleryImage = {
  id: number;
  url: string;
  date: string;
  note?: string | null;
  visibility: "PRIVATE" | "TRAINER";
};

export type GalleryGroups = Record<string, GalleryImage[]>;

export type GalleryData = {
  groups: GalleryGroups;
};

export const galleryUpdateSchema = z.object({
  date: z.date(),
  note: z.string().max(200).nullable().optional(),
  visibility: z.enum(["PRIVATE", "TRAINER"]),
  file: z.instanceof(File).optional().nullable(),
});

export type GalleryUpdateSchema = z.infer<typeof galleryUpdateSchema>;
