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
import { z, ZodError } from "zod";
import SaveButton from "@/components/ui/Buttons/components/SaveButton";

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
  const [open, setOpen] = useState(openProp);

  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const exerciseSchema = z.object({
    name: z
      .string()
      .min(3, "O nome precisa ter pelo menos 3 caracteres")
      .max(50),
    category: z.number().min(1, "A categoria é obrigatória"),
  });

  const fetchExercise = async (exerciseId: number) => {
    const res = await api.get(`/exercise/${exerciseId}`);
    return res.data.exercise;
  };

  type ExerciseData = {
    name: string;
    category: number;
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
      });
      await mutation.mutateAsync(data);
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

    if (open) fetchCategories();
  }, [open]);

  useEffect(() => {
    if (data) {
      setName(data.name || "");
      setCategory(data.exerciseCategory?.id?.toString() || "");
    }
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isMobile && (
        <button
          onClick={() => setOpen(true)}
          className="cursor-pointer p-1 text-blue-500 hover:text-blue-700 transition"
        >
          <Pencil1Icon className="w-5 h-5" />
        </button>
      )}

      {isMobile && (
        <Button
          onClick={() => setOpen(true)}
          variant="default"
          size="sm"
          className="w-full bg-blue-500 text-white hover:text-white transition"
        >
          <Pencil1Icon className="w-5 h-5" />
          <span>Editar</span>
        </Button>
      )}

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Atualizar Exercício
          </DialogTitle>
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
