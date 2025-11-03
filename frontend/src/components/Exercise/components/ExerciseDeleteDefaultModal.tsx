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

type ExerciseDeleteDefaultModalProps = {
  openProp: boolean;
  exerciseId: number;
};

const ExerciseDeleteDefaultModal = ({
  openProp,
  exerciseId,
}: ExerciseDeleteDefaultModalProps) => {
  const api = useApi();
  const queryExercise = useQueryClient();
  const [open, setOpen] = useState(openProp);

  useEffect(() => {
    console.log("Deleting default exerciseId:", exerciseId);
  }, [exerciseId]);

  const deleteDefaultExercise = async () => {
    const res = await api.delete(`/exercise/default/${exerciseId}`);
    return res.data;
  };

  const mutation = useMutation({
    mutationFn: deleteDefaultExercise,
    onSuccess: (data) => {
      toast.success(data.message || "Exercício padrão excluído com sucesso!");
      queryExercise.invalidateQueries({ queryKey: ["exercises"] });
      setOpen(false);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error ||
        "Ocorreu um erro ao excluir o exercício padrão.";
      toast.error(message);
    },
  });

  const handleDelete = async () => {
    await mutation.mutateAsync();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Botão para abrir o modal */}
      <button
        onClick={() => setOpen(true)}
        className="default ml-2 border border-red-500 hover:border-red-400 outline-none hover:text-red-400 text-red-500 rounded p-2"
      >
        <TrashIcon className="w-4 h-4" />
      </button>

      {/* Conteúdo do modal */}
      <DialogContent className="rounded-md w-[90vw] max-w-[400px] sm:max-w-[500px] md:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Excluir Exercício Padrão
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <p>Tem certeza que deseja excluir este exercício padrão?</p>
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

export default ExerciseDeleteDefaultModal;
