"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { OBJECTIVES } from "@/utils/constants/Client/constants";
import type { Client } from "@/types/client";

import SaveButton from "@/components/ui/Buttons/components/SaveButton";
import OutlineButton from "@/components/ui/Buttons/components/OutlineButton";
import GenderSelect from "@/components/ui/Select/GenderSelect";
import PhoneInput from "@/components/ui/Inputs/PhoneInput";

import { clientFormSchema, ClientFormSchema } from "@/schemas/clients";

type ClientUpdateModalProps = {
  clientData: Client;
  onSubmit: (data: ClientFormSchema, setOpen: (v: boolean) => void) => void;
  isLoading: boolean;
};

export default function ClientUpdateModal({
  clientData,
  onSubmit,
  isLoading,
}: ClientUpdateModalProps) {
  const [open, setOpen] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ClientFormSchema>({
    resolver: zodResolver(clientFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      phone: null,
      gender: "",
      age: null,
      height: null,
      weight: null,
      objective: null,
      observation: "",
    },
  });

  /* 🔁 Populate form when opening / client changes */
  useEffect(() => {
    if (!clientData) return;

    reset({
      name: clientData.name ?? "",
      lastName: clientData.lastName ?? "",
      email: clientData.email ?? "",
      phone: clientData.phone ?? null,
      gender: clientData.gender ?? "",
      age: clientData.age ? String(clientData.age) : null,
      height: clientData.height ? String(clientData.height) : null,
      weight: clientData.weight ? String(clientData.weight) : null,
      objective: clientData.objective ?? null,
      observation: clientData.observation ?? "",
    });
  }, [clientData, reset]);

  const handleSave = (data: ClientFormSchema) => {
    onSubmit(data, setOpen);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center cursor-pointer gap-2"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-md w-[90vw] max-w-[400px] sm:max-w-[500px] md:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar dados do aluno</DialogTitle>
          <DialogDescription>
            Atualize as informações pessoais do aluno e clique em "Salvar".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleSave)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Label className="sm:text-right">Nome</Label>
              <div className="sm:col-span-3 space-y-1">
                <Input {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Label className="sm:text-right">Sobrenome</Label>
              <div className="sm:col-span-3 space-y-1">
                <Input {...register("lastName")} />
                {errors.lastName && (
                  <p className="text-xs text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Label className="sm:text-right">Email</Label>
              <div className="sm:col-span-3 space-y-1">
                <Input disabled type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Label className="sm:text-right">WhatsApp</Label>
              <div className="sm:col-span-3 space-y-1">
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      required={false}
                      value={field.value ?? ""}
                      label="phone"
                      onChange={(_, value) =>
                        field.onChange(value && value.trim() ? value : null)
                      }
                    />
                  )}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <GenderSelect
                    value={field.value}
                    handleChange={(_, value) => field.onChange(value)}
                  />
                )}
              />
              {errors.gender && (
                <p className="text-xs text-destructive">
                  {errors.gender.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Label className="sm:text-right">Idade</Label>
              <Input
                type="number"
                className="sm:col-span-3"
                {...register("age")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Label className="sm:text-right">Altura (cm)</Label>
              <Input
                type="number"
                className="sm:col-span-3"
                {...register("height")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Label className="sm:text-right">Peso (kg)</Label>
              <Input
                type="number"
                className="sm:col-span-3"
                {...register("weight")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Label className="sm:text-right">Objetivo</Label>
              <div className="sm:col-span-3 space-y-1">
                <Controller
                  name="objective"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(value) => field.onChange(value || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(OBJECTIVES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.objective && (
                  <p className="text-xs text-destructive">
                    {errors.objective.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Label className="sm:text-right mt-2">Observações</Label>
              <div className="sm:col-span-3 space-y-1">
                <Textarea
                  rows={3}
                  maxLength={255}
                  {...register("observation")}
                />
                {errors.observation && (
                  <p className="text-xs text-destructive">
                    {errors.observation.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <OutlineButton type="button" onClick={() => setOpen(false)} />
            <SaveButton
              type="submit"
              loading={isLoading}
              disabled={!isValid || isLoading}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
