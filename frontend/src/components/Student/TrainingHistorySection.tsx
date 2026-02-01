"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequest } from "@/api/request";
import Loader from "@/components/ui/loader";
import TrainingHistoryItem, { type HistoryItem } from "./TrainingHistoryItem";
import EditHistoryLoadsModal, { type HistoryItemForEdit } from "./EditHistoryLoadsModal";

const HISTORY_QUERY_KEY = ["training-execution-history"];

export default function TrainingHistorySection() {
  const request = useRequest();
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HistoryItem | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: HISTORY_QUERY_KEY,
    queryFn: async () => {
      const res = await request({ method: "GET", url: "/training-execution/history" });
      return res as { items: HistoryItem[] };
    },
    staleTime: 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (executionId: number) => {
      await request({
        method: "DELETE",
        url: `/training-execution/${executionId}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY });
    },
  });

  const [saveLoadsPending, setSaveLoadsPending] = useState(false);
  const saveLoads = async (
    updates: { exerciseExecutionId: number; sets: { setNumber: number; loadKg: number | null }[] }[]
  ) => {
    setSaveLoadsPending(true);
    try {
      for (const u of updates) {
        await request({
          method: "PATCH",
          url: `/training-execution/exercise-execution/${u.exerciseExecutionId}/sets`,
          data: { sets: u.sets },
        });
      }
      queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY });
    } finally {
      setSaveLoadsPending(false);
    }
  };

  const handleEdit = (item: HistoryItem) => {
    setEditingItem(item);
    setEditModalOpen(true);
  };

  const handleDelete = (item: HistoryItem) => {
    deleteMutation.mutate(item.id);
  };

  const items = data?.items ?? [];

  return (
    <>
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl md:text-2xl">Histórico de treinos</CardTitle>
          <CardDescription>
            Treinos realizados. Você pode editar cargas ou excluir até 24h após finalizar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Loader loading={isFetching} />
          {items.length === 0 && !isFetching ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
              <p className="font-medium text-base">Nenhum treino realizado ainda.</p>
              <p className="text-sm mt-1">Finalize um treino para ver o histórico aqui.</p>
            </div>
          ) : (
            <ul className="space-y-3 list-none p-0 m-0">
              {items.map((item) => (
                <li key={item.id}>
                  <TrainingHistoryItem
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <EditHistoryLoadsModal
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) setEditingItem(null);
        }}
        item={editingItem as HistoryItemForEdit | null}
        onSave={saveLoads}
        isSaving={saveLoadsPending}
      />
    </>
  );
}
