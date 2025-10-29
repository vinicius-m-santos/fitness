import { useEffect, useState } from "react";
import { TrashIcon } from "@radix-ui/react-icons";
import { useApi } from "../../../api/Api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ExerciseDeleteModalProps = {
  openProp: boolean;
  exerciseId: number;
};

const ExerciseDeleteModal = ({
  openProp,
  exerciseId,
}: ExerciseDeleteModalProps) => {
  const api = useApi();
  const queryExercise = useQueryClient();
  const [open, setOpen] = useState(openProp);

  useEffect(() => {
    console.log("Deleting exerciseId:", exerciseId);
  }, [exerciseId]);

  const deleteExercise = async () => {
    const res = await api.delete(`/exercise/${exerciseId}`);
    return res.data;
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
        error?.response?.data?.error ||
        "Ocorreu um erro ao excluir o exercício.";
      toast.error(message);
    },
  });

  const handleDelete = async () => {
    await mutation.mutateAsync();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Botão de abrir modal */}
      <button
        onClick={() => setOpen(true)}
        className="default ml-2 outline-none hover:text-red-400 text-red-500 rounded p-2 cursor-pointer"
      >
        <TrashIcon className="w-4 h-4" />
      </button>

      {/* Conteúdo do modal */}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Excluir Exercício
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <p>Tem certeza que deseja excluir este exercício?</p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="default px-4 py-2 text-white cursor-pointer"
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseDeleteModal;
