"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Pencil, Trash2, Clock } from "lucide-react";
import { useEditDeadlineTimer, formatRemainingTime } from "@/hooks/useEditDeadlineTimer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type HistoryItem = {
  id: number;
  finishedAt: string;
  startedAt: string;
  trainingId: number;
  trainingName: string;
  periodId: number | null;
  periodName: string | null;
  totalDurationSeconds: number;
  exerciseExecutions: {
    id: number;
    periodExerciseId: number;
    exerciseName: string;
    durationSeconds: number | null;
    sets: { setNumber: number; loadKg: number | null }[];
  }[];
};

type TrainingHistoryItemProps = {
  item: HistoryItem;
  onEdit: (item: HistoryItem) => void;
  onDelete: (item: HistoryItem) => void;
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h}h ${mm}min`;
  }
  return s > 0 ? `${m}min ${s}s` : `${m}min`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (isToday) return "Hoje";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return "Ontem";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Texto para a confirmação de exclusão, com concordância correta para Hoje/Ontem/data. */
function getDeleteDescriptionText(iso: string): string {
  const dateLabel = formatDate(iso);
  if (dateLabel === "Hoje") return "Este treino de hoje será excluído permanentemente.";
  if (dateLabel === "Ontem") return "Este treino de ontem será excluído permanentemente.";
  return `Este treino do dia ${dateLabel} será excluído permanentemente.`;
}

export default function TrainingHistoryItem({
  item,
  onEdit,
  onDelete,
}: TrainingHistoryItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { remainingSeconds, canEdit } = useEditDeadlineTimer({
    executionId: item.id,
    finishedAtIso: item.finishedAt,
    onExpired: () => { },
  });

  return (
    <>
      <Card className="rounded-xl shadow-sm overflow-hidden min-w-0">
        <CardContent className="p-4 space-y-3 max-w-full min-w-0">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="font-medium text-sm text-foreground">
              {formatDate(item.finishedAt)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(item.finishedAt)}
            </span>
            {canEdit && (
              <Badge variant="secondary" className="text-xs gap-1 font-normal">
                <Clock className="w-3 h-3" />
                {formatRemainingTime(remainingSeconds)} para editar
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>{item.periodName ?? item.trainingName}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(item.totalDurationSeconds)} total
            </span>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" /> Ocultar detalhes
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> Ver detalhes
              </>
            )}
          </button>

          {expanded && (
            <div className="pt-2 border-t space-y-2">
              {item.exerciseExecutions.map((ee) => (
                <div
                  key={ee.id}
                  className="text-sm flex flex-wrap items-baseline gap-x-2 gap-y-1"
                >
                  <span className="font-medium text-foreground">{ee.exerciseName}</span>
                  {ee.durationSeconds != null && ee.durationSeconds > 0 && (
                    <span className="text-muted-foreground">
                      {formatDuration(ee.durationSeconds)}
                    </span>
                  )}
                  {ee.sets.some((s) => s.loadKg != null && s.loadKg > 0) && (
                    <span className="text-muted-foreground text-xs">
                      {ee.sets
                        .filter((s) => s.loadKg != null && s.loadKg > 0)
                        .map((s) => `S${s.setNumber}: ${s.loadKg} kg`)
                        .join(", ")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {canEdit && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 flex-1 sm:flex-initial min-w-0"
                onClick={() => onEdit(item)}
              >
                <Pencil className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Editar cargas</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive flex-1 sm:flex-initial min-w-0"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Excluir</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-md w-[90vw] max-w-[420px]">
          <AlertDialogTitle>Excluir treino?</AlertDialogTitle>
          <AlertDialogDescription>
            {getDeleteDescriptionText(item.finishedAt)} Esta ação não pode ser desfeita.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(item);
                setShowDeleteConfirm(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
