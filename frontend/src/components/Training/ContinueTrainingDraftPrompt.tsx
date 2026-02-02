"use client";

import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileEdit, Play } from "lucide-react";
import { motion } from "framer-motion";
import type { TrainingDraft } from "@/types/trainingDraft";
import { clearTrainingDraft, notifyTrainingDraftCleared } from "@/utils/trainingDraftStorage";

type ContinueTrainingDraftPromptProps = {
  draft: TrainingDraft;
  onContinue: () => void;
  onDiscard: () => void;
};

function getDraftTitle(draft: TrainingDraft): string {
  const name = draft.formData?.name?.trim();
  if (name) return `"${name.length > 30 ? name.slice(0, 30) + "…" : name}"`;
  switch (draft.type) {
    case "training-create":
      return "Novo treino (aluno)";
    case "training-update":
      return "Edição de treino";
    case "training-standard-create":
      return "Novo treino padrão";
    case "training-standard-update":
      return "Edição de treino padrão";
    default:
      return "Treino em preenchimento";
  }
}

/**
 * Exibe quando há rascunho de treino no IndexedDB (reload ou navegação).
 * Permite Continuar (navega e repopula o modal) ou Descartar.
 */
export default function ContinueTrainingDraftPrompt({
  draft,
  onContinue,
  onDiscard,
}: ContinueTrainingDraftPromptProps) {
  const [discarding, setDiscarding] = useState(false);

  const handleDiscard = async () => {
    setDiscarding(true);
    try {
      await clearTrainingDraft();
      notifyTrainingDraftCleared();
      onDiscard();
    } finally {
      setDiscarding(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 min-h-[50vh] flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <Card className="rounded-2xl shadow-sm border-2">
          <CardContent className="p-6 sm:p-8 flex flex-col items-center gap-6 text-center">
            <div className="rounded-full bg-primary/10 p-4 flex items-center justify-center">
              <FileEdit className="w-12 h-12 sm:w-14 sm:h-14 text-primary" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl">Treino em preenchimento</CardTitle>
              <p className="text-sm text-muted-foreground">
                Você tinha um treino sendo preenchido:{" "}
                <span className="font-medium text-foreground">{getDraftTitle(draft)}</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <Button size="lg" className="flex-1 gap-2 py-2" onClick={onContinue}>
                <Play className="w-4 h-4" />
                Continuar preenchimento
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 py-2"
                onClick={handleDiscard}
                disabled={discarding}
              >
                {discarding ? "Descartando…" : "Descartar rascunho"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
