"use client";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequest } from "@/api/request";
import Loader from "@/components/ui/loader";
import TrainingHistoryItem, { type HistoryItem } from "./TrainingHistoryItem";
import EditHistoryLoadsModal, { type HistoryItemForEdit } from "./EditHistoryLoadsModal";
import { useWorkoutSessionStore } from "@/stores/workoutSessionStore";

const HISTORY_QUERY_KEY = ["training-execution-history"];
const TWELVE_MONTHS_AGO = (() => {
  const d = new Date();
  d.setMonth(d.getMonth() - 12);
  return d.toISOString();
})();

function formatMonthYear(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

function groupByMonth(items: HistoryItem[]): [string, HistoryItem[]][] {
  const map = new Map<string, HistoryItem[]>();
  for (const item of items) {
    const d = new Date(item.finishedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  const entries = Array.from(map.entries());
  entries.sort(([a], [b]) => b.localeCompare(a));
  return entries;
}

export default function TrainingHistorySection() {
  const navigate = useNavigate();
  const request = useRequest();
  const queryClient = useQueryClient();
  const session = useWorkoutSessionStore((s) => s.session);
  const restoreFromHistory = useWorkoutSessionStore((s) => s.restoreFromHistory);
  const setShowWorkoutPrompt = useWorkoutSessionStore((s) => s.setShowWorkoutPrompt);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HistoryItem | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: [...HISTORY_QUERY_KEY, TWELVE_MONTHS_AGO],
    queryFn: async () => {
      const res = await request({
        method: "GET",
        url: "/training-execution/history",
        params: { since: TWELVE_MONTHS_AGO },
      });
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

  const handleRestart = (item: HistoryItem) => {
    if (item.periodId == null) return;
    if (session && (session.trainingId !== item.trainingId || session.periodId !== item.periodId)) {
      setShowWorkoutPrompt(true);
      return;
    }
    restoreFromHistory({
      id: item.id,
      trainingId: item.trainingId,
      periodId: item.periodId,
      periodName: item.periodName ?? `Período ${item.periodId}`,
      startedAt: item.startedAt,
      totalDurationSeconds: item.totalDurationSeconds,
      exerciseExecutions: item.exerciseExecutions.map((ee) => ({
        periodExerciseId: ee.periodExerciseId,
        durationSeconds: ee.durationSeconds,
        executed: ee.executed,
        sets: ee.sets.map((s) => ({
          setNumber: s.setNumber,
          loadKg: s.loadKg,
          restSeconds: s.restSeconds ?? null,
        })),
      })),
    });
    navigate(`/student/training/${item.trainingId}/period/${item.periodId}/execute`, {
      state: { fromContinue: true },
    });
  };

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const byMonth = useMemo(() => groupByMonth(items), [items]);

  return (
    <>
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl md:text-2xl">Histórico de treinos</CardTitle>
          <CardDescription>
            Treinos dos últimos 12 meses. Você pode editar cargas ou excluir até 24h após finalizar.
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
            <Accordion type="single" collapsible className="w-full space-y-3">
              {byMonth.map(([monthKey, monthItems]) => (
                <AccordionItem key={monthKey} value={monthKey}>
                  <AccordionTrigger className="text-lg font-medium capitalize cursor-pointer">
                    {formatMonthYear(monthKey)}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-3 list-none p-0 m-0 pt-1">
                      {monthItems.map((item) => (
                        <li key={item.id}>
                          <TrainingHistoryItem
                            item={item}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onRestart={handleRestart}
                          />
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
