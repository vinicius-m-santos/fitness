"use client";

import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Play } from "lucide-react";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ContinueWorkoutPromptProps = {
  periodName: string;
  onContinue: () => void;
  onFinish: () => void;
  isFinishing?: boolean;
};

/**
 * Tela/pergunta "Treino em andamento": exibe quando há sessão ativa (reload na execute ou em outra tela).
 * Permite Continuar treino ou Finalizar treino.
 */
export default function ContinueWorkoutPrompt({
  periodName,
  onContinue,
  onFinish,
  isFinishing = false,
}: ContinueWorkoutPromptProps) {
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const handleFinishClick = () => setShowFinishConfirm(true);
  const handleConfirmFinish = () => {
    setShowFinishConfirm(false);
    onFinish();
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-4 min-h-[60vh] flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <Card className="rounded-2xl shadow-sm border-2">
            <CardContent className="p-6 sm:p-8 flex flex-col items-center gap-6 text-center">
              <div className="rounded-full bg-primary/10 p-4 flex items-center justify-center">
                <Dumbbell className="w-12 h-12 sm:w-14 sm:h-14 text-primary" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl sm:text-2xl">Treino em andamento</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Você tem um treino ativo:{" "}
                  <span className="font-medium text-foreground">{periodName}</span>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                <Button size="lg" className="flex-1 gap-2" onClick={onContinue}>
                  <Play className="w-4 h-4" />
                  Continuar treino
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handleFinishClick}
                  disabled={isFinishing}
                >
                  {isFinishing ? "Finalizando…" : "Finalizar treino"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <AlertDialog open={showFinishConfirm} onOpenChange={setShowFinishConfirm}>
        <AlertDialogContent className="rounded-2xl max-w-[min(360px,95vw)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar treino?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja finalizar o treino? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel disabled={isFinishing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmFinish} disabled={isFinishing} asChild>
              <Button variant="destructive" disabled={isFinishing}>
                {isFinishing ? "Finalizando…" : "Sim, finalizar"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
