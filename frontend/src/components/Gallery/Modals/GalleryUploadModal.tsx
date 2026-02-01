"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SaveButton from "@/components/ui/Buttons/components/SaveButton";
import toast from "react-hot-toast";
import { galleryUploadSchema, GalleryUploadSchema } from "@/schemas/gallery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, formatDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { useRequest } from "@/api/request";
import { GALLERY_VISIBILITY } from "@/utils/constants/Client/constants";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: number;
};

export default function GalleryUploadModal({
  open,
  onOpenChange,
  clientId,
}: Props) {
  const request = useRequest();
  const [isDragging, setIsDragging] = useState(false);

  const form = useForm<GalleryUploadSchema>({
    resolver: zodResolver(galleryUploadSchema),
    mode: "onChange",
    defaultValues: {
      date: new Date(),
      note: "",
      visibility: "PRIVATE",
    },
  });

  const file = form.watch("file");

  const isValidDate = (d: unknown): d is Date =>
    d instanceof Date && !isNaN(d.getTime());

  const handleFile = (file: File) => {
    form.setValue("file", file, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (data: GalleryUploadSchema) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("date", data.date.toISOString());
      formData.append("note", data.note ?? "");
      formData.append("visibility", GALLERY_VISIBILITY[data.visibility]);

      await request({
        method: "POST",
        url: `/gallery/client/${clientId}`,
        data: formData,
      });
    },
    onSuccess: () => {
      toast.success("Imagem enviada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast.error("Erro ao enviar imagem");
    },
  });

  const onSubmit = (data: GalleryUploadSchema) => {
    uploadMutation.mutate(data);
  };

  const loading = uploadMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar imagem</DialogTitle>
          <DialogDescription>
            Envie uma foto para acompanhamento
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);

                const droppedFile = e.dataTransfer.files?.[0];
                if (droppedFile) {
                  handleFile(droppedFile);
                }
              }}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-sm transition cursor-pointer
                ${isDragging ? "border-primary bg-primary/5" : "border-muted"}`}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) handleFile(selected);
                }}
                id="gallery-file-input"
              />

              {!file && (
                <>
                  <label
                    htmlFor="gallery-file-input"
                    className="font-medium cursor-pointer"
                  >
                    Clique ou arraste a imagem aqui
                  </label>
                  <span className="text-xs text-muted-foreground mt-1">
                    JPG, PNG ou WEBP (máx 5MB)
                  </span>
                </>
              )}

              {file && (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />

                  <p className="text-xs text-muted-foreground">{file.name}</p>

                  <button
                    type="button"
                    onClick={() =>
                      form.setValue("file", undefined as any, {
                        shouldValidate: true,
                      })
                    }
                    className="text-xs text-red-500 cursor-pointer hover:underline"
                  >
                    Remover imagem
                  </button>
                </div>
              )}
            </div>
            <Controller
              control={form.control}
              name="date"
              render={({ field, fieldState }) => (
                <div className="space-y-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"
                          }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(field.value, "dd/MM/yyyy", { locale: ptBR })
                          : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) field.onChange(date);
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("2000-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {fieldState.error && (
                    <p className="text-xs text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            <textarea
              className="w-full border rounded-md p-2 text-sm"
              placeholder="Observação (opcional)"
              value={form.watch("note")}
              onChange={(e) => form.setValue("note", e.target.value)}
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">Visibilidade da imagem</p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    form.setValue("visibility", "PRIVATE", {
                      shouldValidate: true,
                    })
                  }
                  className={`flex-1 border rounded-lg p-3 text-sm font-medium transition
                    ${form.watch("visibility") === "PRIVATE"
                      ? "border-primary bg-primary/10"
                      : "border-muted"
                    }`}
                >
                  Privada
                  <p className="text-xs text-muted-foreground mt-1">
                    Somente você
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    form.setValue("visibility", "TRAINER", {
                      shouldValidate: true,
                    })
                  }
                  className={`flex-1 border rounded-lg p-3 text-sm font-medium transition
                    ${form.watch("visibility") === "TRAINER"
                      ? "border-primary bg-primary/10"
                      : "border-muted"
                    }`}
                >
                  Personal
                  <p className="text-xs text-muted-foreground mt-1">
                    Visível ao treinador
                  </p>
                </button>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <SaveButton
                type="submit"
                loading={loading}
                disabled={!form.formState.isValid}
                text="Enviar imagem"
              />
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
