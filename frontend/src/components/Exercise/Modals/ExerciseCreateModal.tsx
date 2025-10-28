import { useState, useEffect } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
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
import { Input } from "@/components/ui/input";
import { useApi } from "../../../api/Api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "../../ui/button";
import { LogOut, PlusIcon } from "lucide-react";

type ExerciseCreateModalProps = {
  openProp: boolean;
};

const ExerciseCreateModal = ({ openProp }: ExerciseCreateModalProps) => {
  const api = useApi();
  const queryExercise = useQueryClient();

  const [name, setName] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [open, setOpen] = useState<boolean>(openProp);

  useEffect(() => {
    if (!open) return;

    const loadCategories = async () => {
      try {
        const res = await api.get("/exercise-category/all");
        console.log("Categorias:", res.data.exerciseCategories);
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
        error?.response?.data?.error || "Ocorreu um erro ao criar o exercício.";
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

  const handleOpenChange = (value: boolean) => {
    console.log(value);
    setOpen(value);
    if (value === false) {
      clearModalData();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        onClick={() => setOpen(true)}
        className="default border-2 text-white rounded outline-none"
      >
        <PlusIcon size={16} />
        Novo Exercício
      </Button>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Cadastrar Exercício
          </DialogTitle>
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          ></button>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
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
              />
            </div>
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-bold mb-1"
              >
                {" "}
                Categoria{" "}
              </label>{" "}
              <Select
                value={categoryId.toString()}
                onValueChange={(val) => setCategoryId(Number(val))}
              >
                {" "}
                <SelectTrigger className="w-full px-3 py-2 text-sm rounded-md bg-gray-100 border border-gray-300 focus:ring-1 outline-none">
                  {" "}
                  <SelectValue placeholder="Selecione a categoria" />{" "}
                </SelectTrigger>{" "}
                <SelectContent position="popper">
                  {" "}
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {" "}
                      {cat.name}{" "}
                    </SelectItem>
                  ))}{" "}
                </SelectContent>{" "}
              </Select>{" "}
            </div>{" "}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant={"outline"}
              onClick={() => {
                clearModalData();
                setOpen(false);
              }}
            >
              Cancelar
            </Button>

            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseCreateModal;
