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
import { WheelPicker, WheelPickerWrapper } from "@/components/wheel-picker";

const LOAD_OPTIONS = Array.from({ length: 151 }, (_, i) => ({
  value: String(i),
  label: i === 0 ? "—" : `${i} kg`,
}));

export type SetLoadInput = {
  setNumber: number;
  loadKg: number | null;
};

type LoadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seriesCount: number;
  savedSets?: SetLoadInput[] | null;
  lastLoadsPerSet?: SetLoadInput[] | null;
  onSave: (sets: SetLoadInput[]) => void;
};

function buildLoadsArray(
  seriesCount: number,
  savedSets?: SetLoadInput[] | null,
  lastLoadsPerSet?: SetLoadInput[] | null
): number[] {
  const count = Math.max(1, seriesCount);
  if (savedSets && savedSets.length > 0) {
    const bySet: Record<number, number> = {};
    savedSets.forEach((s) => {
      bySet[s.setNumber] = s.loadKg != null && s.loadKg > 0 ? Math.round(s.loadKg) : 0;
    });
    return Array.from({ length: count }, (_, i) => bySet[i + 1] ?? 0);
  }
  if (lastLoadsPerSet && lastLoadsPerSet.length > 0) {
    const bySet: Record<number, number> = {};
    lastLoadsPerSet.forEach((s) => {
      bySet[s.setNumber] = s.loadKg != null && s.loadKg > 0 ? Math.round(s.loadKg) : 0;
    });
    return Array.from({ length: count }, (_, i) => bySet[i + 1] ?? 0);
  }
  return Array.from({ length: count }, () => 0);
}

export default function LoadModal({
  open,
  onOpenChange,
  seriesCount,
  savedSets,
  lastLoadsPerSet,
  onSave,
}: LoadModalProps) {
  const [loads, setLoads] = useState<number[]>(() =>
    buildLoadsArray(seriesCount, savedSets, lastLoadsPerSet)
  );

  useEffect(() => {
    if (open) {
      setLoads(buildLoadsArray(seriesCount, savedSets, lastLoadsPerSet));
    }
  }, [open, seriesCount, savedSets, lastLoadsPerSet]);

  const handleSetLoad = (setIndex: number, value: string) => {
    const num = parseInt(value, 10);
    setLoads((prev) => {
      const next = [...prev];
      next[setIndex] = isNaN(num) ? 0 : num;
      return next;
    });
  };

  const handleSave = () => {
    onSave(
      loads.map((kg, i) => ({
        setNumber: i + 1,
        loadKg: kg > 0 ? kg : null,
      }))
    );
    onOpenChange(false);
  };

  const count = Math.max(1, seriesCount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-[min(400px,95vw)]">
        <DialogHeader>
          <DialogTitle>Registrar carga</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${Math.min(count, 4)}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Série {i + 1}
                </span>
                <WheelPickerWrapper className="w-full max-w-[80px]">
                  <WheelPicker
                    value={String(loads[i] ?? 0)}
                    onValueChange={(value) => handleSetLoad(i, value as string)}
                    options={LOAD_OPTIONS}
                    optionItemHeight={36}
                  />
                </WheelPickerWrapper>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button className="w-full" onClick={handleSave}>
            Salvar cargas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
