import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useApi } from "../../../api/Api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "../../ui/button";

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

  useEffect(() => {
    setOpen(openProp);
  }, [openProp]);

  const deleteTraining = async () => {
    const res = await api.delete(`/training/${trainingId}`);
    return res.data;
  };

  const mutation = useMutation({
    mutationFn: deleteTraining,
    onSuccess: (data) => {
      toast.success(data.message || "Treino excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
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
              className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none"
              aria-label="Close"
            >
              <Cross2Icon className="w-5 h-5" />
            </button>
          </Dialog.Close>

          {/* Title */}
          <Dialog.Title className="text-2xl font-semibold">
            Excluir Treino
          </Dialog.Title>

          {/* Body Content */}
          <div className="mt-4">
            <p>Deseja mesmo excluir este treino?</p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant={"outline"}>Cancel</Button>
            </Dialog.Close>

            <Button
              variant={"destructive"}
              onClick={handleDelete}
              className="default px-4 py-2 text-white"
            >
              Confirmar
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TrainingDeleteModal;
