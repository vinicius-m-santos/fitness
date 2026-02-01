import { useEffect, useState } from "react";
import { Pencil1Icon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Edit, Loader } from "lucide-react";
import { Input } from "../../ui/input";
import { useApi } from "../../../api/Api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../ui/button";
import toast from "react-hot-toast";
import { z, ZodError } from "zod";
import SaveButton from "@/components/ui/Buttons/components/SaveButton";
import { useMediaQuery } from "react-responsive";

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

  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [muscleGroup, setMuscleGroup] = useState("");
  const [muscleGroups, setMuscleGroups] = useState<{ id: number; name: string }[]>(
    []
  );
  const [favorite, setFavorite] = useState(false);
  const [open, setOpen] = useState(openProp);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const exerciseSchema = z.object({
    name: z
      .string()
      .min(3, "O nome precisa ter pelo menos 3 caracteres")
      .max(50),
    category: z.number().min(1, "A categoria é obrigatória"),
    muscleGroup: z.number().min(1, "O grupo muscular é obrigatório"),
  });

  const fetchExercise = async (exerciseId: number) => {
    const res = await api.get(`/exercise/${exerciseId}`);
    return res.data.exercise;
  };

  type ExerciseData = {
    name: string;
    category: number;
    muscleGroup: number;
    favorite?: boolean;
  };

  const saveExercise = async (data: ExerciseData) => {
    const res = await api.put(`/exercise/${exerciseId}`, { ...data, favorite });
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
      toast.success("Exercício atualizado com sucesso!");
      queryExercise.invalidateQueries({ queryKey: ["exercises"] });
      setOpen(false);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error ||
        "Ocorreu um erro ao atualizar o exercício.";
      toast.error(message);
    },
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      const data = exerciseSchema.parse({
        name,
        category: Number(category),
        muscleGroup: Number(muscleGroup),
      });
      await mutation.mutateAsync({ ...data, favorite });
    } catch (err) {
      if (err instanceof ZodError) {
        err.issues.forEach((e) => toast.error(e.message));
      } else {
        toast.error("Erro inesperado ao validar formulário");
      }
    } finally {
      setLoading(false);
    }
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

    const fetchMuscleGroups = async () => {
      try {
        const res = await api.get("/muscle-group/all");
        setMuscleGroups(res.data.muscleGroups);
      } catch (err) {
        console.error("Erro ao carregar grupos musculares", err);
      }
    };

    if (open) {
      fetchCategories();
      fetchMuscleGroups();
    }
  }, [open]);

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setCategory(data.exerciseCategory?.id?.toString() || "");
      setMuscleGroup(data.muscleGroup?.id?.toString() || "");
      setFavorite(!!data.isFavorite);
    }
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isMobile && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setOpen(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}

      {isMobile && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-black p-0"
            onClick={() => setOpen(true)}
          >
            <Edit className="h-4 w-4" />
            <span>Editar</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="rounded-md w-[90vw] max-w-[400px] sm:max-w-[500px] md:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Atualizar Exercício
          </DialogTitle>
        </DialogHeader>

        {(isLoading || categories.length === 0 || !category || muscleGroups.length === 0 || !muscleGroup) && (
          <div className="flex justify-center items-center py-8">
            <Loader className="animate-spin w-6 h-6 text-gray-400" />
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm">Erro ao carregar dados</p>
        )}

        {!isLoading && categories.length > 0 && category && muscleGroups.length > 0 && muscleGroup && (
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
                placeholder="Nome"
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
                <SelectContent position="popper" side="bottom" avoidCollisions={false}>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
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
              <Select value={muscleGroup} onValueChange={setMuscleGroup}>
                <SelectTrigger className="w-full px-3 py-2 text-sm rounded-md bg-gray-100 border border-gray-300 focus:ring-1 outline-none">
                  <SelectValue placeholder="Selecione o grupo muscular" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" avoidCollisions={false}>
                  {muscleGroups.map((mg) => (
                    <SelectItem key={mg.id} value={mg.id.toString()}>
                      {mg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="favorite-update"
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="favorite-update"
                className="text-sm font-medium cursor-pointer"
              >
                Favorito?
              </label>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant={"outline"}
            className="cursor-pointer"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <SaveButton loading={loading} onClick={handleSave} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseUpdateModal;
