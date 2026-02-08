"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type HistoryExerciseExecution = {
  id: number;
  periodExerciseId: number;
  exerciseName: string;
  durationSeconds: number | null;
  executed?: boolean;
  sets: { setNumber: number; loadKg: number | null; restSeconds?: number | null }[];
};

export type HistoryItemForEdit = {
  id: number;
  exerciseExecutions: HistoryExerciseExecution[];
};

type EditHistoryLoadsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: HistoryItemForEdit | null;
  onSave: (updates: { exerciseExecutionId: number; sets: { setNumber: number; loadKg: number | null }[] }[]) => Promise<void>;
  isSaving: boolean;
};

function formatLoad(loadKg: number | null): string {
  if (loadKg == null || loadKg === 0) return "";
  return String(loadKg);
}

export default function EditHistoryLoadsModal({
  open,
  onOpenChange,
  item,
  onSave,
  isSaving,
}: EditHistoryLoadsModalProps) {
  const [localExercises, setLocalExercises] = useState<HistoryExerciseExecution[]>([]);

  useEffect(() => {
    if (open && item) {
      setLocalExercises(
        item.exerciseExecutions.map((ee) => ({
          ...ee,
          sets: [...ee.sets].sort((a, b) => a.setNumber - b.setNumber),
        }))
      );
    }
  }, [open, item]);

  const handleLoadChange = (eeIndex: number, setIndex: number, value: string) => {
    const ee = localExercises[eeIndex];
    if (ee?.executed === false) return;
    const num = value === "" ? null : parseFloat(value.replace(",", "."));
    const kg = num != null && !isNaN(num) && num >= 0 ? num : null;
    setLocalExercises((prev) => {
      const next = [...prev];
      const ee = next[eeIndex];
      if (!ee) return prev;
      const sets = [...ee.sets];
      while (sets.length <= setIndex) {
        sets.push({ setNumber: sets.length + 1, loadKg: null });
      }
      sets[setIndex] = { ...sets[setIndex], loadKg: kg };
      next[eeIndex] = { ...ee, sets };
      return next;
    });
  };

  const handleSave = async () => {
    if (!item) return;
    const updates: { exerciseExecutionId: number; sets: { setNumber: number; loadKg: number | null }[] }[] = [];
    localExercises.forEach((ee) => {
      if (ee.executed === false) return;
      const original = item.exerciseExecutions.find((e) => e.id === ee.id);
      if (!original) return;
      const hasChange = ee.sets.some((s) => {
        const origSet = original.sets.find((os) => os.setNumber === s.setNumber);
        return (origSet?.loadKg ?? null) !== (s.loadKg ?? null);
      });
      if (hasChange) {
        updates.push({
          exerciseExecutionId: ee.id,
          sets: ee.sets.map((s) => ({ setNumber: s.setNumber, loadKg: s.loadKg })),
        });
      }
    });
    if (updates.length > 0) {
      await onSave(updates);
      onOpenChange(false);
    } else {
      onOpenChange(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-[min(480px,95vw)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar cargas das séries</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-2">
          {localExercises.map((ee, eeIndex) => (
            <div key={ee.id} className="space-y-3">
              <p className="font-medium text-sm text-foreground">{ee.exerciseName}</p>
              {ee.executed === false ? (
                <span className="text-muted-foreground text-xs italic">Não executado</span>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ee.sets.map((set, setIndex) => (
                    <div key={set.setNumber} className="flex flex-col gap-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Série {set.setNumber}
                      </Label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={0.5}
                        placeholder="kg"
                        value={formatLoad(set.loadKg)}
                        onChange={(e) =>
                          handleLoadChange(eeIndex, setIndex, e.target.value)
                        }
                        className="h-9"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="mb-2" disabled={isSaving}>
            {isSaving ? "Salvando…" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
