"use client";

import { useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Frown, Meh, Smile } from "lucide-react";

export type WorkoutRating = "bad" | "neutral" | "good";

const RATING_DEBOUNCE_MS = 400;

type WorkoutRatingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (rating: WorkoutRating) => void;
  /** Enquanto true, desabilita os botões (ex.: envio em andamento). */
  disabled?: boolean;
};

export default function WorkoutRatingModal({
  open,
  onOpenChange,
  onSelect,
  disabled = false,
}: WorkoutRatingModalProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(
    (rating: WorkoutRating) => {
      if (disabled) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        onSelect(rating);
      }, RATING_DEBOUNCE_MS);
    },
    [disabled, onSelect]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-[min(360px,95vw)] flex flex-col items-center">
        <DialogHeader>
          <DialogTitle className="text-center">Como foi o treino?</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4 py-2">
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full cursor-pointer"
            onClick={() => handleClick("bad")}
            disabled={disabled}
            aria-label="Ruim"
          >
            <Frown className="w-7 h-7" strokeWidth={2} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full cursor-pointer"
            onClick={() => handleClick("neutral")}
            disabled={disabled}
            aria-label="Mais ou menos"
          >
            <Meh className="w-7 h-7" strokeWidth={2} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full cursor-pointer"
            onClick={() => handleClick("good")}
            disabled={disabled}
            aria-label="Bom"
          >
            <Smile className="w-7 h-7" strokeWidth={2} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
