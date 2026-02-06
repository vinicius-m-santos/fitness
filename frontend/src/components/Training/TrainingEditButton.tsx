import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import TrainingUpdateModal from "@/components/Training/Modals/TrainingUpdateModal";
import type { TrainingDraft } from "@/types/trainingDraft";

export function TrainingEditButton({
  trainingId,
  initialData,
  clientId,
  restoreDraft,
}: {
  trainingId: number;
  initialData: any;
  clientId?: number;
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
      <Button
        variant="outline"
        size="sm"
        className="w-full flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <Edit className="h-4 w-4" />
        Editar
      </Button>

      <TrainingUpdateModal
        open={open}
        onOpenChange={setOpen}
        trainingId={trainingId}
        initialData={initialData}
        clientId={clientId}
        initialDraft={restoreDraft?.trainingId === trainingId ? restoreDraft : undefined}
      />
    </>
  );
}
