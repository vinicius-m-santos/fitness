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
import { Plus } from "lucide-react";
import SaveButton from "@/components/ui/Buttons/components/SaveButton";
import OutlineButton from "@/components/ui/Buttons/components/OutlineButton";
import GenderSelect from "@/components/ui/Select/GenderSelect";
import PhoneInput from "@/components/ui/Inputs/PhoneInput";
import BirthDateInput, { birthDateToISO } from "@/components/Inputs/BirthDateInput";

import { useRequest } from "@/api/request";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { ClientFormSchema, clientFormSchema } from "@/schemas/clients";

const LIMIT_MESSAGE =
  "Você atingiu o limite de alunos do seu plano. Em breve teremos planos pagos com mais vagas.";

type ClientCreateModalProps = {
  canAddStudent?: boolean;
};

export default function ClientCreateModal({ canAddStudent = true }: ClientCreateModalProps) {
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
      birthDate: null,
      observation: "",
      sendAccessEmail: false,
    },
  });

  const onSubmit = async (data: ClientFormSchema) => {
    setLoading(true);
    const birthDateISO = birthDateToISO(data.birthDate ?? null);
    const payload = {
      ...data,
      birthDate: birthDateISO,
      height: data.height ?? null,
      weight: data.weight ?? null,
      objective: data.objective ?? null,
      observation: data.observation ?? "",
    };

    await request({
      method: "POST",
      url: "/client/clientByPersonal",
      data: payload,
      successMessage: "Aluno cadastrado",
      showSuccess: true,
      onAccept: () => {
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        queryClient.invalidateQueries({ queryKey: ["subscription", "me"] });
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
        <Button
          size="sm"
          className="flex items-center gap-2"
          disabled={!canAddStudent}
          title={!canAddStudent ? LIMIT_MESSAGE : undefined}
          data-tour-id="client-create-trigger"
        >
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

            {/* Data de nascimento */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Label className="sm:text-right">Data de nascimento</Label>
              <div className="sm:col-span-3 space-y-1">
                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field }) => (
                    <BirthDateInput
                      value={field.value ?? ""}
                      onChange={(val) => field.onChange(val)}
                      onBlur={field.onBlur}
                      placeholder="dd/mm/aaaa"
                    />
                  )}
                />
                {errors.birthDate && (
                  <p className="text-xs text-destructive">
                    {errors.birthDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="hidden sm:block" />
              <div className="sm:col-span-3 flex items-center space-x-2">
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
