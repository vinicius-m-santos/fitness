import { useEffect, useState } from "react";
import { Pencil1Icon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader } from "lucide-react";
import { Input } from "../../ui/input";
import { useApi } from "../../../api/Api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../ui/button";
import toast from "react-hot-toast";

type ExerciseUpdateModalProps = {
  openProp: boolean;
  exerciseId: number;
  disabled?: boolean;
};

const ExerciseUpdateModal = ({
  openProp,
  exerciseId,
}: ExerciseUpdateModalProps) => {
  const api = useApi();
  const queryExercise = useQueryClient();

  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );

  const [open, setOpen] = useState(openProp);

  const fetchExercise = async (exerciseId: number) => {
    const res = await api.get(`/exercise/${exerciseId}`);
    return res.data.exercise;
  };

  type ExerciseData = {
    name: string;
    category: string;
  };

  const saveExercise = async (data: ExerciseData) => {
    const res = await api.put(`/exercise/${exerciseId}`, data);
    return res.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["exercises", exerciseId],
    queryFn: () => fetchExercise(exerciseId),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: saveExercise,
    onSuccess: () => {
      const message = data?.message || "Exercício atualizado com sucesso!";
      toast.success(message);
      queryExercise.invalidateQueries({ queryKey: ["exercises"] });
      setOpen(false);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error ||
        "Ocorreu um erro ao atualizado o exercício.";
      toast.error(message);
    },
  });

  const handleSave = async () => {
    if (!name || !category) return;
    await mutation.mutateAsync({ name, category });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/exercise-category/all");
        setCategories(res.data.exerciseCategories);
      } catch (err) {
        console.error("Erro ao carregar categorias", err);
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setCategory(data.exerciseCategory?.id?.toString() || "");
    }
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="default px-4 py-2 font-bold text-blue-500 rounded outline-none"
      >
        <Pencil1Icon className="w-4 h-4" />
      </button>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Atualizar Exercício
          </DialogTitle>
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          ></button>
        </DialogHeader>
        {(isLoading || categories.length === 0 || !category) && (
          <div className="flex justify-center items-center py-8">
            <Loader className="animate-spin w-6 h-6 text-gray-400" />
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm">Erro ao carregar dados</p>
        )}

        {!isLoading && categories.length > 0 && category && (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-bold mb-1">
                Nome
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome"
                required
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-bold mb-1"
              >
                Categoria
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full px-3 py-2 text-sm rounded-md bg-gray-100 border border-gray-300 focus:ring-1 outline-none">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant={"outline"} onClick={() => setOpen(false)}>
            Cancelar
          </Button>

          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseUpdateModal;
