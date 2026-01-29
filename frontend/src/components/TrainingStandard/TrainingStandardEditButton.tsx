import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import TrainingStandardUpdateModal from "./Modals/TrainingStandardUpdateModal";
import { TrainingCreateSchema } from "@/schemas/training";

export function TrainingStandardEditButton({
  trainingId,
  initialData,
}: {
  trainingId: number;
  initialData: TrainingCreateSchema;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" className="w-full flex items-center gap-2" onClick={() => setOpen(true)}>
        <Edit className="h-4 w-4" />
        Editar
      </Button>
      <TrainingStandardUpdateModal
        open={open}
        onOpenChange={setOpen}
        trainingId={trainingId}
        initialData={initialData}
      />
    </>
  );
}
