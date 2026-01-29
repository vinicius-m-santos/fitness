import { useState, useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash, PlusIcon, BicepsFlexed, Search, X, Send } from "lucide-react";
import TrainingStandardCreateModal from "@/components/TrainingStandard/Modals/TrainingStandardCreateModal";
import TrainingStandardDeleteModal from "@/components/TrainingStandard/Modals/TrainingStandardDeleteModal";
import TrainingStandardApplyModal from "@/components/TrainingStandard/Modals/TrainingStandardApplyModal";
import { TrainingStandardEditButton } from "@/components/TrainingStandard/TrainingStandardEditButton";
import { useQuery } from "@tanstack/react-query";
import { useRequest } from "@/api/request";
import ContainerLoader from "@/components/ui/containerLoader";
import { TrainingCreateSchema } from "@/schemas/training";

type SortOption =
  | "name-asc"
  | "name-desc"
  | "date-asc"
  | "date-desc";

export default function StandardTrainings() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openApply, setOpenApply] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: number; name: string } | null>(null);
  const [toApply, setToApply] = useState<{ id: number; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const request = useRequest();

  const { data: workouts = [], isFetching } = useQuery({
    queryKey: ["training-standards"],
    queryFn: async () => {
      const res = await request({ method: "GET", url: "/training-standard/all" });
      return res.trainings ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split("/");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const filteredAndSortedWorkouts = useMemo(() => {
    let filtered = workouts;

    // Aplicar busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = workouts.filter((workout: any) => {
        const matchesTrainingName = workout.name?.toLowerCase().includes(query);

        const matchesPeriods = workout.periods?.some((period: any) =>
          period.name?.toLowerCase().includes(query)
        );

        const matchesExercises = workout.periods?.some((period: any) =>
          period.exercises?.some((exercise: any) =>
            exercise.name?.toLowerCase().includes(query)
          )
        );

        return matchesTrainingName || matchesPeriods || matchesExercises;
      });
    }

    const sorted = [...filtered].sort((a: any, b: any) => {
      switch (sortBy) {
        case "name-asc":
          return (a.name || "").localeCompare(b.name || "", "pt-BR");
        case "name-desc":
          return (b.name || "").localeCompare(a.name || "", "pt-BR");
        case "date-asc": {
          const dateA = parseDate(a.createdAt || "01/01/1970");
          const dateB = parseDate(b.createdAt || "01/01/1970");
          return dateA.getTime() - dateB.getTime();
        }
        case "date-desc": {
          const dateA = parseDate(a.createdAt || "01/01/1970");
          const dateB = parseDate(b.createdAt || "01/01/1970");
          return dateB.getTime() - dateA.getTime();
        }
        default:
          return 0;
      }
    });

    return sorted;
  }, [workouts, searchQuery, sortBy]);

  if (isFetching) {
    return <ContainerLoader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-row justify-between md:flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-wide flex items-center gap-2">
          <BicepsFlexed className="h-6 w-6 md:h-8 md:w-8" />
          Treinos padrão
        </h1>
        <div className="flex items-center gap-2">
          <TrainingStandardCreateModal open={openCreate} onOpenChange={setOpenCreate} />
          <Button size="sm" className="cursor-pointer" onClick={() => setOpenCreate(true)}>
            <PlusIcon /> Novo treino
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome do treino, período ou exercício..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full text-black font-medium text-sm"
          />
          <X
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-2.5 text-gray-400 w-4 h-4"
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full text-black font-semibold text-sm">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc" className="text-black text-sm">Nome (A-Z)</SelectItem>
              <SelectItem value="name-desc" className="text-black text-sm">Nome (Z-A)</SelectItem>
              <SelectItem value="date-desc" className="text-black text-sm">Mais novos</SelectItem>
              <SelectItem value="date-asc" className="text-black text-sm">Mais antigos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {workouts.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum treino padrão cadastrado. Crie um para replicar para os alunos.</p>
      ) : filteredAndSortedWorkouts.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum treino encontrado com os filtros aplicados.</p>
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {filteredAndSortedWorkouts.map((workout) => (
            <AccordionItem key={workout.id} value={String(workout.id)}>
              <AccordionTrigger className="cursor-pointer text-lg text-black font-medium">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full text-left">
                  <span>{workout.name}</span>
                  <Badge variant="secondary" className="mt-1 sm:mt-0">
                    Criado em {workout.createdAt}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="flex justify-end">
                  <div className="flex flex-wrap w-full md:w-auto md:flex-nowrap gap-2 text-black">
                    <Button
                      size="sm"
                      variant="default"
                      className="w-full flex items-center gap-1 cursor-pointer"
                      onClick={() => {
                        setToApply({ id: workout.id, name: workout.name });
                        setOpenApply(true);
                      }}
                    >
                      <Send className="h-4 w-4 mr-1" /> Aplicar
                    </Button>
                    <TrainingStandardEditButton
                      trainingId={workout.id}
                      initialData={workout as TrainingCreateSchema}
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full flex items-center gap-1 cursor-pointer text-white"
                      onClick={() => {
                        setToDelete({ id: workout.id, name: workout.name });
                        setOpenDelete(true);
                      }}
                    >
                      <Trash className="h-4 w-4 mr-1" /> Excluir
                    </Button>
                  </div>
                </div>
                {workout.periods.map((period: { id: number; name: string; exercises: any[] }, pi: number) => (
                  <Card key={pi}>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">{period.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Exercício</TableHead>
                            <TableHead>Séries</TableHead>
                            <TableHead>Reps</TableHead>
                            <TableHead>Descanso</TableHead>
                            <TableHead>Observações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {period.exercises.map((ex: any, ei: number) => (
                            <TableRow key={ei}>
                              <TableCell className="font-medium">{ex.name}</TableCell>
                              <TableCell>{ex.series || "-"}</TableCell>
                              <TableCell>{ex.reps || "-"}</TableCell>
                              <TableCell>{ex.rest || "-"}</TableCell>
                              <TableCell className="text-muted-foreground">{ex.obs || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {toDelete && (
        <TrainingStandardDeleteModal
          openProp={openDelete}
          trainingId={toDelete.id}
          onOpenChange={(open) => {
            setOpenDelete(open);
            if (!open) setToDelete(null);
          }}
        />
      )}

      <TrainingStandardApplyModal
        open={openApply}
        onOpenChange={(open) => {
          setOpenApply(open);
          if (!open) setToApply(null);
        }}
        training={toApply}
      />
    </div>
  );
}
