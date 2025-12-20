"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SaveButton from "@/components/ui/Buttons/components/SaveButton";
import { Form } from "@/components/ui/form";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { galleryUpdateSchema, GalleryUpdateSchema } from "@/schemas/gallery";
import { useRequest } from "@/api/request";
import {
  GALLERY_VISIBILITY,
  VISIBILITY_BY_VALUE,
} from "@/utils/constants/Client/constants";
import DeleteGalleryImageDialog from "./DeleteGalleryImageDialog";
import DangerButton from "@/components/ui/Buttons/components/DangerButton";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  image: any;
};

export default function GalleryUpdateModal({
  open,
  onOpenChange,
  image,
}: Props) {
  const request = useRequest();
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<GalleryUpdateSchema>({
    resolver: zodResolver(galleryUpdateSchema),
    mode: "onChange",
    defaultValues: {
      date: new Date(image.date),
      note: image.note ?? "",
      visibility: VISIBILITY_BY_VALUE[image.visibility],
    },
  });

  useEffect(() => {
    form.reset({
      date: new Date(image.date),
      note: image.note ?? "",
      visibility: VISIBILITY_BY_VALUE[image.visibility],
    });

    setPreview(null);
  }, [image]);

  const updateMutation = useMutation({
    mutationFn: async (data: GalleryUpdateSchema) => {
      const formData = new FormData();

      formData.append("_method", "PUT");
      formData.append("date", data.date.toISOString());
      formData.append("note", data.note ?? "");
      formData.append(
        "visibility",
        GALLERY_VISIBILITY[data.visibility].toString()
      );

      if (data.file) {
        formData.append("file", data.file);
      }

      await request({
        method: "POST",
        url: `/gallery/${image.id}`,
        data: formData,
      });
    },
    onSuccess: () => {
      toast.success("Imagem atualizada");
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Erro ao atualizar imagem");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await request({
        method: "DELETE",
        url: `/gallery/${image.id}`,
      });
    },
    onSuccess: () => {
      toast.success("Imagem removida");
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Erro ao remover imagem");
    },
  });

  const onSubmit = (data: GalleryUpdateSchema) => {
    updateMutation.mutate(data);
  };

  const loading = updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md rounded-2xl space-y-4">
          <DialogHeader>
            <DialogTitle>Editar imagem</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <img
              src={preview ?? image.url}
              alt="Imagem"
              className="w-full max-h-[280px] object-cover rounded-lg"
            />

            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="gallery-image-input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                form.setValue("file", file, {
                  shouldDirty: true,
                  shouldValidate: true,
                });

                setPreview(URL.createObjectURL(file));
              }}
            />

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                document.getElementById("gallery-image-input")?.click()
              }
              className="cursor-pointer"
            >
              Alterar imagem
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Controller
                control={form.control}
                name="date"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(field.value, "dd/MM/yyyy", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => date && field.onChange(date)}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />

              <textarea
                className="w-full border rounded-md p-2 text-sm"
                placeholder="Observação"
                maxLength={100}
                value={form.watch("note") ?? ""}
                onChange={(e) =>
                  form.setValue("note", e.target.value, { shouldDirty: true })
                }
              />

              <div className="flex gap-2">
                {["PRIVATE", "TRAINER"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() =>
                      form.setValue("visibility", v as any, {
                        shouldDirty: true,
                      })
                    }
                    className={`flex-1 border rounded-lg p-3 text-sm font-medium cursor-pointer
                    ${
                      form.watch("visibility") === v
                        ? "border-primary bg-primary/10"
                        : "border-muted"
                    }`}
                  >
                    {v === "PRIVATE" ? "Privada" : "Personal"}
                  </button>
                ))}
              </div>

              <div className="flex flex-col-reverse justify-between sm:flex-row gap-2">
                <DangerButton
                  onClick={() => setDeleteOpen(true)}
                  loading={loading}
                  className="w-full sm:w-auto cursor-pointer text-white hover:opacity-75"
                >
                  Excluir imagem
                </DangerButton>

                <SaveButton
                  type="submit"
                  text="Salvar alterações"
                  loading={loading}
                  disabled={!form.formState.isValid}
                />
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <DeleteGalleryImageDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteMutation.mutate();
          setDeleteOpen(false);
        }}
      />
    </>
  );
}
