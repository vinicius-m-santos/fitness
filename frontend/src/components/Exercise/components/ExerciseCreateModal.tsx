import { useState, useEffect } from "react";
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
import { Plus } from "lucide-react";
import { z, ZodError } from "zod";
import SaveButton from "@/components/ui/Buttons/components/SaveButton";

type ExerciseCreateModalProps = {
  openProp: boolean;
  onOpenChange: (open: boolean) => void;
};

const ExerciseCreateModal = ({ openProp, onOpenChange }: ExerciseCreateModalProps) => {
  const api = useApi();
  const queryExercise = useQueryClient();

  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [muscleGroupId, setMuscleGroupId] = useState<string>("");
  const [muscleGroups, setMuscleGroups] = useState<{ id: number; name: string }[]>(
    []
  );
  const [open, setOpen] = useState<boolean>(false);

  const exerciseSchema = z.object({
    name: z
      .string()
      .min(3, "O nome precisa ter pelo menos 3 caracteres")
      .max(50, "O nome pode ter no máximo 50 caracteres"),
    exerciseCategoryId: z.string().min(1, "A categoria é obrigatória"),
    muscleGroupId: z.string().min(1, "O grupo muscular é obrigatório"),
  });

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

    const loadMuscleGroups = async () => {
      try {
        const res = await api.get("/muscle-group/all");
        console.log("Grupos Musculares:", res.data.muscleGroups);
        setMuscleGroups(res.data.muscleGroups);
      } catch (err) {
        console.error("Erro ao carregar grupos musculares", err);
      }
    };

    loadCategories();
    loadMuscleGroups();
  }, [open]);

  const saveExercise = async (data: any) => {
    const res = await api.post("/exercise/create", data);
    setName("");
    setCategoryId("");
    setMuscleGroupId("");
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
    try {
      setLoading(true);
      const data = exerciseSchema.parse({
        name,
        exerciseCategoryId: categoryId,
        muscleGroupId: muscleGroupId,
      });

      await mutation.mutateAsync(data);
    } catch (err) {
      if (err instanceof ZodError) {
        console.log(err);
        err.issues.forEach((e) => {
          toast.error(e.message);
        });
      } else {
        toast.error("Erro inesperado ao validar formulário");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setCategoryId("");
    setMuscleGroupId("");
  };

  const handleOpenChange = (value: boolean) => {
    console.log(value);
    setOpen(value);
    if (value === false) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        onClick={() => setOpen(true)}
        variant="default"
        size="sm"
        className="flex cursor-pointer items-center gap-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Novo Exercício
      </Button>

      <DialogContent className="rounded-md w-[90vw] max-w-[400px] sm:max-w-[500px] md:max-w-[600px] max-h-[85vh] overflow-y-auto">
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
                maxLength={50}
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
                Categoria
              </label>
              <Select
                value={categoryId}
                onValueChange={(val) => setCategoryId(val)}
              >
                <SelectTrigger className="w-full px-3 py-2 text-sm rounded-md bg-gray-100 border border-gray-300 focus:ring-1 outline-none">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                htmlFor="muscleGroup"
                className="block text-sm font-bold mb-1"
              >
                Grupo Muscular
              </label>
              <Select
                value={muscleGroupId}
                onValueChange={(val) => setMuscleGroupId(val)}
              >
                <SelectTrigger className="w-full px-3 py-2 text-sm rounded-md bg-gray-100 border border-gray-300 focus:ring-1 outline-none">
                  <SelectValue placeholder="Selecione o grupo muscular" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {muscleGroups.map((mg) => (
                    <SelectItem key={mg.id} value={String(mg.id)}>
                      {mg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant={"outline"}
              className="cursor-pointer"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
            >
              Cancelar
            </Button>

            <SaveButton loading={loading} onClick={handleSave} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseCreateModal;
