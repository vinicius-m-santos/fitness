"use client";

import { useState } from "react";
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
import { Plus } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { OBJECTIVES } from "@/utils/constants/Client/constants";
import SaveButton from "@/components/ui/Buttons/components/SaveButton";
import OutlineButton from "@/components/ui/Buttons/components/OutlineButton";
import GenderSelect from "@/components/ui/Select/GenderSelect";
import PhoneInput from "@/components/ui/Inputs/PhoneInput";

import { useRequest } from "@/api/request";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { ClientFormSchema, clientFormSchema } from "@/schemas/clients";

export default function ClientCreateModal() {
  const request = useRequest();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
      sendAccessEmail: false,
    },
  });

  const onSubmit = async (data: ClientFormSchema) => {
    setLoading(true);

    await request({
      method: "POST",
      url: "/client/clientByPersonal",
      data,
      successMessage: "Aluno cadastrado",
      showSuccess: true,
      onAccept: () => {
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        setOpen(false);
        reset();
        setLoading(false);
      },
      onReject: (error) => {
        setLoading(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4 mr-2" />
          Novo Aluno
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-md w-[90vw] max-w-[400px] sm:max-w-[500px] md:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Inserir dados do aluno</DialogTitle>
          <DialogDescription>
            Insira as informações pessoais do aluno e clique em "Salvar".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Nome */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Label className="sm:text-right">Nome</Label>
              <div className="sm:col-span-3 space-y-1">
                <Input {...register("name")} placeholder="Nome" />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Sobrenome */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Label className="sm:text-right">Sobrenome</Label>
              <div className="sm:col-span-3 space-y-1">
                <Input {...register("lastName")} placeholder="Sobrenome" />
                {errors.lastName && (
                  <p className="text-xs text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Label className="sm:text-right">Email</Label>
              <div className="sm:col-span-3 space-y-1">
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="Email"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Label className="sm:text-right">WhatsApp</Label>
              <div className="sm:col-span-3 space-y-1">
                <Controller
                  name="phone"
                  control={control}
                  shouldUnregister={false}
                  render={({ field }) => (
                    <PhoneInput
                      value={field.value ?? ""}
                      label="phone"
                      required={false}
                      onChange={(_, value) => {
                        const normalized =
                          value && value.trim().length > 0 ? value : null;

                        field.onChange(normalized);
                      }}
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

            {/* Gênero */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
              <Controller
                control={control}
                name="gender"
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

            {/* Idade */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Label className="sm:text-right">Idade</Label>
              <Input
                type="number"
                className="sm:col-span-3"
                {...register("age")}
              />
            </div>

            {/* Altura */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Label className="sm:text-right">Altura (cm)</Label>
              <Input
                type="number"
                className="sm:col-span-3"
                {...register("height")}
              />
            </div>

            {/* Peso */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Label className="sm:text-right">Peso (kg)</Label>
              <Input
                type="number"
                className="sm:col-span-3"
                {...register("weight")}
              />
            </div>

            {/* Objetivo */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Label className="sm:text-right">Objetivo</Label>
              <div className="sm:col-span-3 space-y-1">
                <Controller
                  control={control}
                  name="objective"
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

            {/* Observações */}
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

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="sm:col-span-4 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendAccessEmail"
                  {...register("sendAccessEmail")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="sendAccessEmail" className="text-sm font-normal cursor-pointer">
                  Enviar acesso para o aluno
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <OutlineButton type="button" onClick={() => setOpen(false)} />
            <SaveButton
              type="submit"
              loading={loading}
              disabled={!isValid || loading}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
