import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useApi } from "../../../api/Api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

type ExerciseCreateModalProps = {
  openProp: boolean;
};

const ExerciseCreateModal = ({ openProp }: ExerciseCreateModalProps) => {
  const api = useApi();
  const queryExercise = useQueryClient();

  const [name, setName] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [open, setOpen] = useState<boolean>(openProp);

  useEffect(() => {
    if (!open) return;
    
    const loadCategories = async () => {
      try {
        const res = await api.get("/exercise-category/all");
        console.log('Categorias:', res.data.exerciseCategories);
        setCategories(res.data.exerciseCategories);
      } catch (err) {
        console.error("Erro ao carregar categorias", err);
      }
    };
    
    loadCategories();
  }, [open]);

  const saveExercise = async (data: any) => {
    const res = await api.post("/exercise/create", data);
    setName("");
    setCategoryId("");
    return res.data;
  };

  const mutation = useMutation({
    mutationFn: saveExercise,
    onSuccess: (data) => {
      const message = data?.message || "Exercício criado com sucesso!";
      toast.success(message);
      queryExercise.invalidateQueries({ queryKey: ["exercises"] });
      setOpen(false);
  },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error ||
        "Ocorreu um erro ao criar o exercício.";
      toast.error(message);
    },
  });

  const handleSave = async () => {

    await mutation.mutateAsync({
      name,
      exerciseCategoryId: categoryId,
    });
  };

  const clearModalData = () => {
    setName("");
    setCategoryId("");
  };

  const handleOpenChange = (value) => {
    console.log(value);
    setOpen(value);

    if(value === false){
      clearModalData()
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button className="default px-4 py-2 bg-green-400 border-2 border-green-400 font-bold text-white rounded outline-none">
          Novo Exercício
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20" />

        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-gray-100 p-6 shadow-xl focus:outline-none">
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <Cross2Icon className="w-5 h-5" />
            </button>
          </Dialog.Close>

          <Dialog.Title className="text-2xl font-semibold">
            Cadastrar Exercício
          </Dialog.Title>

          <form onSubmit={(e) => {e.preventDefault(); handleSave();}}>
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
                  placeholder="Nome do exercício"
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-bold mb-1">
                  Categoria
                </label>
                <Select value={categoryId.toString()} onValueChange={(val) => setCategoryId(Number(val))}>
                  <SelectTrigger className="w-full px-3 py-2 text-sm rounded-md bg-gray-100 border border-gray-300 focus:ring-1 outline-none" required>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  onClick={clearModalData}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
              </Dialog.Close>

              <button 
                type="submit"
                className="default px-4 py-2 bg-green-500 hover:bg-green-400 border-2 border-green-400 font-bold text-white rounded outline-none"
              >
                Save
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ExerciseCreateModal;
