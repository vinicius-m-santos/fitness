import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { TrainingCreateSchema } from "@/schemas/training";

type Props = {
  form: UseFormReturn<TrainingCreateSchema>;
};

export default function StepName({ form }: Props) {
  return (
    <Input
      placeholder="Nome do treino"
      className="text-sm font-medium"
      maxLength={50}
      {...form.register("name")}
    />
  );
}
