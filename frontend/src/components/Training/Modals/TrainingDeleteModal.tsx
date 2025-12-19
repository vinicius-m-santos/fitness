import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useApi } from "../../../api/Api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "../../ui/button";
import DangerButton from "@/components/ui/Buttons/components/DangerButton";

type TrainingDeleteModalProps = {
  openProp: boolean;
  trainingId: number;
  onOpenChange: (open: boolean) => void;
};

const TrainingDeleteModal = ({
  openProp,
  trainingId,
  onOpenChange,
}: TrainingDeleteModalProps) => {
  const api = useApi();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(openProp);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOpen(openProp);
  }, [openProp]);

  const deleteTraining = async () => {
    setLoading(true);
    const res = await api.delete(`/training/${trainingId}`);
    return res.data;
  };

  const mutation = useMutation({
    mutationFn: deleteTraining,
    onSuccess: (data) => {
      setLoading(false);
      toast.success(data.message || "Treino excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      setLoading(false);
      const message =
        error?.response?.data?.error || "Ocorreu um erro ao excluir o treino.";
      toast.error(message);
    },
  });

  const handleDelete = async () => {
    await mutation.mutateAsync();
  };

  return (
    <Dialog.Root open={openProp} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="z-20 fixed inset-0 bg-black/20" />

        <Dialog.Content
          className="z-30 fixed left-1/2 top-1/2 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-gray-100 p-6 shadow-xl
         [data-state=open]:scale-100 transition-all duration-300 focus:outline-none"
        >
          {/* Close Button */}
          <Dialog.Close asChild>
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none cursor-pointer"
              aria-label="Close"
            >
              <Cross2Icon className="w-5 h-5" />
            </button>
          </Dialog.Close>

          {/* Title */}
          <Dialog.Title className="text-2xl font-semibold">
            Excluir Treino
          </Dialog.Title>

          <Dialog.Description className="text-sm text-muted-foreground">
            Essa ação não pode ser desfeita
          </Dialog.Description>

          {/* Body Content */}
          <div className="mt-4">
            <p>Deseja mesmo excluir este treino?</p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button className="cursor-pointer" variant={"outline"}>
                Cancelar
              </Button>
            </Dialog.Close>
            <DangerButton onClick={handleDelete} loading={loading} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TrainingDeleteModal;
