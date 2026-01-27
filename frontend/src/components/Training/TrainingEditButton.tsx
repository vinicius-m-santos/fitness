import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import TrainingUpdateModal from "@/components/Training/Modals/TrainingUpdateModal";

export function TrainingEditButton({
  trainingId,
  initialData,
}: {
  trainingId: number;
  initialData: any;
}) {
  const [open, setOpen] = useState(false);

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
      />
    </>
  );
}
