import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon, Pencil1Icon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useApi } from "../../../api/Api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { Input } from "../../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type ExerciseUpdateModalProps = {
  openProp: boolean;
  exerciseId: number;
};

const ExerciseUpdateModal = ({ openProp, exerciseId }: ExerciseUpdateModalProps) => {
  const api = useApi();
  const queryExercise = useQueryClient();
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);

  const fetchExercise = async (exerciseId: number) => {
    const res = await api.get(`/exercise/${exerciseId}`);
    return res.data.exercise;
  };

  type ExerciseData = { name: string; category: string };

  const saveExercise = async (data: ExerciseData) => {
    const res = await api.put(`/exercise/${exerciseId}`, data);

    return res.data;
  };

  const [open, setOpen] = useState(openProp);

  const handleSave = async () => {
    if (!name || !category) {
      return;
    }

    await mutation.mutateAsync({
      name,
      category,
    });
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["exercises", exerciseId],
    queryFn: () => fetchExercise(exerciseId),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: saveExercise,
    onSuccess: () => {
      queryExercise.invalidateQueries({
        queryKey: ["exercises"],
      });
      setOpen(false);
    },
  });
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/exercise-category/all');
        console.log(res)
        setCategories(res.data.exerciseCategories);
      } catch (err) {
        console.error('Erro ao carregar categorias', err);
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  useEffect(() => {
    console.log(`Aqui`)
    if (data) {
      setName(data.name || "");
      setCategory(data.exerciseCategory?.id?.toString() || "");
    }
  }, [data]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="default px-4 py-2 font-bold text-blue-500 rounded outline-none">
          <Pencil1Icon className="w-4 h-4" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/20" />

        {/* Modal Content */}
        <Dialog.Content
          className="fixed left-1/2 top-1/2 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-gray-100 p-6 shadow-xl focus:outline-none"
        >
          {/* Close Button */}
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <Cross2Icon className="w-5 h-5" />
            </button>
          </Dialog.Close>

          {/* Title */}
          <Dialog.Title className="text-2xl font-semibold">
            Atualizar Exercicio
          </Dialog.Title>

          {/* Body Content */}
          {isLoading && (
            <div className="flex grow-1 justify-center items-center">
              <Loader />
            </div>
          )}
          {error && <p>Error loading data</p>}
          {data && (
            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-bold mb-1"
                >
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
                <label htmlFor="category" className="block text-sm font-bold mb-1">
                  Categoria
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full px-3 py-2 text-sm rounded-md bg-gray-100 border border-gray-300 focus:ring-1 outline-none" required>
                    <SelectValue placeholder="Selecione a categoria"/>
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400">
                Cancel
              </button>
            </Dialog.Close>

            <button
              onClick={handleSave}
              className="default px-4 py-2 bg-green-500 hover:bg-green-400 border-2 border-green-400 font-bold text-white rounded outline-none"
            >
              Save
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ExerciseUpdateModal;