import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClientTransferList, type ClientItem } from "@/components/ClientTransferList";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/api/Api";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  training: { id: number; name: string } | null;
  excludeClientId: number | null;
};

export default function TrainingApplyModal({
  open,
  onOpenChange,
  training,
  excludeClientId,
}: Props) {
  const api = useApi();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<ClientItem[]>([]);
  const [availableFilter, setAvailableFilter] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");

  const { data: allClients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await api.get("/client/all");
      return (res.data?.clients ?? []) as ClientItem[];
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const clients = useMemo(() => {
    if (excludeClientId == null) return allClients;
    return allClients.filter((c) => c.id !== excludeClientId);
  }, [allClients, excludeClientId]);

  const available = useMemo(() => {
    const sel = new Set(selected.map((c) => c.id));
    return clients.filter((c) => !sel.has(c.id));
  }, [clients, selected]);

  const moveToSelected = (items: ClientItem[]) => {
    setSelected((prev) => {
      const ids = new Set(prev.map((c) => c.id));
      for (const c of items) if (!ids.has(c.id)) ids.add(c.id);
      return clients.filter((c) => ids.has(c.id));
    });
  };
  const moveToAvailable = (items: ClientItem[]) => {
    const remove = new Set(items.map((c) => c.id));
    setSelected((prev) => prev.filter((c) => !remove.has(c.id)));
  };
  const moveAllToSelected = () => setSelected([...clients]);
  const moveAllToAvailable = () => setSelected([]);

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!training) throw new Error("Treino não informado");
      await api.post("/training/apply", {
        trainingId: training.id,
        clientIds: selected.map((c) => c.id),
      });
    },
    onSuccess: () => {
      toast.success("Treino aplicado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      onOpenChange(false);
      setSelected([]);
      setAvailableFilter("");
      setSelectedFilter("");
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      toast.error(
        err?.response?.data?.error ?? "Erro ao aplicar treino aos alunos."
      );
    },
  });

  useEffect(() => {
    if (!open) {
      setSelected([]);
      setAvailableFilter("");
      setSelectedFilter("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) {
      toast.error("Selecione pelo menos um aluno.");
      return;
    }
    applyMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Aplicar treino aos alunos</DialogTitle>
          <DialogDescription>
            {training ? (
              <>
                Treino <strong>{training.name}</strong>. Selecione os alunos que
                receberão uma cópia deste treino (o dono do treino foi excluído
                da lista).
              </>
            ) : (
              "Selecione os alunos que receberão o treino."
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ClientTransferList
            available={available}
            selected={selected}
            onMoveToSelected={moveToSelected}
            onMoveToAvailable={moveToAvailable}
            onMoveAllToSelected={moveAllToSelected}
            onMoveAllToAvailable={moveAllToAvailable}
            availableFilter={availableFilter}
            onAvailableFilterChange={setAvailableFilter}
            selectedFilter={selectedFilter}
            onSelectedFilterChange={setSelectedFilter}
            loading={clientsLoading}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!training || selected.length === 0 || applyMutation.isPending}
              className="cursor-pointer"
            >
              {applyMutation.isPending ? "Aplicando…" : "Aplicar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
