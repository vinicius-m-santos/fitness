"use client";

import { useCallback, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Timer } from "lucide-react";
import CircularSlider from "@fseehawer/react-circular-slider";

const MAX_REST_SECONDS = 300;
/** Step apenas ao manipular o slider (arredonda para múltiplo de 10). */
const REST_SNAP_STEP = 10;
const REST_SAVE_DEBOUNCE_MS = 500;
/** Slider de 1 em 1 segundo para movimento natural durante o timer. */
const REST_DATA = Array.from(
  { length: MAX_REST_SECONDS + 1 },
  (_, i) => i
);

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

type RestModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Duração escolhida no slider (segundos). Controlado pelo pai. */
  restDuration: number;
  onRestDurationChange: (seconds: number) => void;
  /** Segundos restantes da contagem (quando rodando). Controlado pelo pai. */
  restRemainingSeconds: number;
  /** Se o timer de descanso está rodando. Controlado pelo pai. */
  restTimerRunning: boolean;
  onRestStart: () => void;
  onRestPause: () => void;
  onRestSave?: (seconds: number) => void;
  /** Exibe ícone de conclusão em verde por 1s antes de fechar (após o timer chegar a 0). */
  restJustCompleted?: boolean;
  disabled?: boolean;
};

export default function RestModal({
  open,
  onOpenChange,
  restDuration,
  onRestDurationChange,
  restRemainingSeconds,
  restTimerRunning,
  onRestStart,
  onRestPause,
  onRestSave,
  restJustCompleted = false,
  disabled,
}: RestModalProps) {
  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStartPause = useCallback(() => {
    if (restTimerRunning) {
      onRestPause();
    } else {
      onRestStart();
    }
  }, [restTimerRunning, onRestStart, onRestPause]);

  const handleSliderChange = useCallback(
    (value: number) => {
      if (!restTimerRunning) {
        const raw = Number(value);
        const snapped = Math.min(
          MAX_REST_SECONDS,
          Math.round(raw / REST_SNAP_STEP) * REST_SNAP_STEP
        );
        onRestDurationChange(snapped);
        if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
        saveDebounceRef.current = setTimeout(() => {
          saveDebounceRef.current = null;
          onRestSave?.(snapped);
        }, REST_SAVE_DEBOUNCE_MS);
      }
    },
    [restTimerRunning, onRestDurationChange, onRestSave]
  );

  useEffect(() => {
    return () => {
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    };
  }, []);

  const displaySeconds = restTimerRunning ? restRemainingSeconds : restDuration;
  const sliderValueSeconds = restTimerRunning ? restRemainingSeconds : restDuration;
  const sliderDataIndex = Math.min(MAX_REST_SECONDS, Math.round(sliderValueSeconds));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-[min(360px,95vw)] flex flex-col items-center">
        <DialogHeader>
          <DialogTitle className="text-center">Tempo de descanso</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 w-full">
          {restJustCompleted ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="rounded-full bg-green-500/15 p-4 flex items-center justify-center">
                <Check className="w-14 h-14 text-green-600 dark:text-green-400" strokeWidth={2.5} />
              </div>
              <p className="text-base font-medium text-muted-foreground">Descanso concluído</p>
            </div>
          ) : (
            <>
              <div className="relative flex justify-center items-center">
                <CircularSlider
                  width={240}
                  min={0}
                  knobSize={44}
                  progressColorFrom="#1E88E5"
                  progressColorTo="#1E88E5"
                  knobColor="#1E88E5"
                  max={REST_DATA.length - 1}
                  data={REST_DATA}
                  dataIndex={sliderDataIndex}
                  onChange={(value) => handleSliderChange(Number(value))}
                  knobDraggable={!restTimerRunning}
                  trackDraggable={!restTimerRunning}
                  hideLabelValue
                  renderLabelValue={
                    <div className="absolute top-0 h-full w-full flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-4xl md:text-5xl font-mono font-semibold tabular-nums">
                        {formatSeconds(displaySeconds)}
                      </span>
                    </div>
                  }
                >
                  <Timer x="10" y="10" className="w-4 h-4 text-white text-muted-foreground" strokeWidth={2} />
                </CircularSlider>
              </div>
              <Button
                className="w-full"
                onClick={handleStartPause}
                disabled={disabled || (restTimerRunning && restRemainingSeconds <= 0)}
              >
                {restTimerRunning ? "Pausar" : "Iniciar descanso"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
