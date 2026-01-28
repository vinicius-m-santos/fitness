"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import SaveButton from "@/components/ui/Buttons/components/SaveButton";
import toast from "react-hot-toast";

import PersonalInfoSection from "./fields/PersonalInfoSection";
import MeasuresSection from "./fields/MeasuresSection";
import HealthSection from "./fields/HealthSection";
import ExtrasSection from "./fields/ExtrasSection";
import TagsSelector from "./fields/TagsSelector";

import { ClientAllData } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import {
  anamneseUpdateModalSchema,
  AnamneseUpdateModalSchema,
} from "@/schemas/clients";
import { useAuth } from "@/providers/AuthProvider";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientAllData;
  onAccept: (
    data: AnamneseUpdateModalSchema,
    setOpen: (value: boolean) => void
  ) => Promise<any>;
};

export default function AnamneseUpdateModal({
  open,
  onOpenChange,
  client,
  onAccept,
}: Props) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<AnamneseUpdateModalSchema>({
    resolver: zodResolver(anamneseUpdateModalSchema),
    mode: "onChange",
    defaultValues: {
      age: "",
      gender: "",
      bloodPressure: "",
      ocupation: "",
      weight: "",
      height: "",
      objective: "",
      workoutDaysPerWeek: "",
      medicalRestriction: "",
      cronicalPain: "",
      controledMedicine: "",
      heartProblem: "",
      recentSurgery: "",
      timeWithoutGym: "",
      observation: "",
      diet: "",
      sleep: "",
      physicalActivity: "",
      tags: [],
      previousInjuries: "",
    },
  });

  useEffect(() => {
    if (!client) return;

    form.reset({
      age: client.age ? String(client.age) : "",
      gender: client.gender ?? "",
      bloodPressure: client.bloodPressure ?? "",
      ocupation: client.anamnese?.ocupation ?? "",
      weight: client.weight ? String(client.weight) : "",
      height: client.height ? String(client.height) : "",
      objective: client.objective ? String(client.objective) : "",
      workoutDaysPerWeek: client.workoutDaysPerWeek
        ? String(client.workoutDaysPerWeek)
        : "",
      medicalRestriction: client.anamnese?.medicalRestriction ?? "",
      cronicalPain: client.anamnese?.cronicalPain ?? "",
      controledMedicine: client.anamnese?.controledMedicine ?? "",
      heartProblem: client.anamnese?.heartProblem ?? "",
      recentSurgery: client.anamnese?.recentSurgery ?? "",
      timeWithoutGym: client.anamnese?.timeWithoutGym ?? "",
      observation: client.observation ?? "",
      diet: client.anamnese?.diet ?? "",
      sleep: client.anamnese?.sleep ?? "",
      physicalActivity: client.anamnese?.physicalActivity ?? "",
      tags: client.tags ?? [],
      previousInjuries: client.anamnese?.previousInjuries ?? "",
    });
  }, [client, form]);

  const onSubmit = async (data: AnamneseUpdateModalSchema) => {
    try {
      setLoading(true);
      await onAccept(data, onOpenChange);
    } catch (e) {
      toast.error("Ocorreu um erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="cursor-pointer">
          <Edit /> Editar
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl scrollbar-app"
        onEscapeKeyDown={(e) => {
          if (loading) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (loading) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Anamnese do Aluno
          </DialogTitle>
          <DialogDescription>
            Atualize as informações do aluno.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-10 py-4"
          >
            <PersonalInfoSection form={form} />
            <MeasuresSection form={form} />
            <HealthSection form={form} />
            <ExtrasSection form={form} />
            {user?.roles.includes("ROLE_PERSONAL") && (
              <TagsSelector form={form} />
            )}

            <div className="flex justify-end pt-4">
              <SaveButton
                loading={loading}
                type="submit"
                disabled={!form.formState.isValid || loading}
                text="Salvar Anamnese"
              />
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
