import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useApi } from "../../../api/Api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

type ExerciseDeleteModalProps = {
  openProp: boolean;
  exerciseId: number;
};

const ExerciseDeleteModal = ({ openProp, exerciseId }: ExerciseDeleteModalProps) => {
  const api = useApi();
  const queryExercise = useQueryClient();
  const [open, setOpen] = useState(openProp);

  
useEffect(() => {
  console.log("Deleting exerciseId:", exerciseId);
}, [exerciseId]);


  const deleteExercise = async () => {
    const res = await api.delete(`/exercise/${exerciseId}`);
    console.log(res.data);
    return res.data;
  };

  const handleDelete = async () => {
    await mutation.mutateAsync();
  };

  const mutation = useMutation({
    mutationFn: deleteExercise,
    onSuccess: (data) => {
      toast.success(data.message || "Exercício excluído com sucesso!");
      queryExercise.invalidateQueries({ queryKey: ["exercises"] });
      setOpen(false);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error || "Ocorreu um erro ao excluir o exercício.";
      toast.error(message);
    },
  });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="default ml-2 border border-red-500 hover:border-red-400 outline-none hover:text-red-400 text-red-500">
          <TrashIcon className="w-4 h-4" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="z-2 fixed inset-0 bg-black/20" />

        {/* Modal Content */}
        <Dialog.Content
          className="z-3 fixed left-1/2 top-1/2 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-gray-100 p-6 shadow-xl
         [data-state=open]:scale-100 transition-all duration-300 focus:outline-none"
          aria-describedby={undefined}
        >
          {/* Close Button */}
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white focus:outline-none"
              aria-label="Close"
            >
              <Cross2Icon className="w-5 h-5" />
            </button>
          </Dialog.Close>

          {/* Title */}
          <Dialog.Title className="text-2xl font-semibold">
            Excluir Cliente
          </Dialog.Title>

          {/* Body Content */}
          <div>
            <div className="mt-4">
              <p>Deseja mesmo excluir este cliente?</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button className="default px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500">
                Cancel
              </button>
            </Dialog.Close>

            <button
              onClick={handleDelete}
              className="default px-4 py-2 bg-red-500 hover:bg-red-400 border-2 border-red-400 font-bold text-white rounded outline-none"
            >
              Confirmar
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ExerciseDeleteModal;