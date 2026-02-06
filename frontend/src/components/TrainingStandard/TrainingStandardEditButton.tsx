import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import TrainingStandardUpdateModal from "./Modals/TrainingStandardUpdateModal";
import { TrainingCreateSchema } from "@/schemas/training";
import type { TrainingDraft } from "@/types/trainingDraft";

export function TrainingStandardEditButton({
  trainingId,
  initialData,
  restoreDraft,
}: {
  trainingId: number;
  initialData: TrainingCreateSchema;
  restoreDraft?: TrainingDraft | null;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (restoreDraft && restoreDraft.trainingId === trainingId) {
      setOpen(true);
    }
  }, [restoreDraft, trainingId]);

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
        initialDraft={restoreDraft?.trainingId === trainingId ? restoreDraft : undefined}
      />
    </>
  );
}
