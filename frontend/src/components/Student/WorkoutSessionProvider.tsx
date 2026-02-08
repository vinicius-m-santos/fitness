"use client";

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useRequest } from "@/api/request";
import { useAuth } from "@/providers/AuthProvider";
import { useWorkoutSessionStore } from "@/stores/workoutSessionStore";
import ContinueWorkoutPrompt from "@/components/Student/ContinueWorkoutPrompt";
import WorkoutRatingModal, { type WorkoutRating } from "@/components/Student/WorkoutRatingModal";

const ROLE_CLIENT = "ROLE_CLIENT";

type WorkoutSessionProviderProps = {
  children: React.ReactNode;
};

export default function WorkoutSessionProvider({ children }: WorkoutSessionProviderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const request = useRequest();

  const session = useWorkoutSessionStore((s) => s.session);
  const showWorkoutPrompt = useWorkoutSessionStore((s) => s.showWorkoutPrompt);
  const setShowWorkoutPrompt = useWorkoutSessionStore((s) => s.setShowWorkoutPrompt);
  const getPayloadForFinish = useWorkoutSessionStore((s) => s.getPayloadForFinish);
  const clearSession = useWorkoutSessionStore((s) => s.clearSession);
  const setDuration = useWorkoutSessionStore((s) => s.setDuration);
  const setFinalized = useWorkoutSessionStore((s) => s.setFinalized);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const isClient = !!user?.roles?.includes(ROLE_CLIENT);

  const handleContinue = useCallback(() => {
    if (!session) return;
    setShowWorkoutPrompt(false);
    navigate(
      `/student/training/${session.trainingId}/period/${session.periodId}/execute`,
      { state: { fromContinue: true } }
    );
  }, [session, setShowWorkoutPrompt, navigate]);

  const handleFinishClick = useCallback(() => {
    setShowRatingModal(true);
  }, []);

  const handleRatingSelect = useCallback(
    async (rating: WorkoutRating) => {
      if (session?.currentTimedPeriodExerciseId != null && session?.exerciseStartedAt != null) {
        const duration = Math.floor((Date.now() - session.exerciseStartedAt) / 1000);
        setDuration(session.currentTimedPeriodExerciseId, duration);
        setFinalized(session.currentTimedPeriodExerciseId, true);
      }
      const payload = getPayloadForFinish();
      if (!payload) return;
      setIsFinishing(true);
      try {
        await request({
          method: "POST",
          url: "/training-execution/finish-with-session",
          data: { ...payload, rating },
        });
        setShowRatingModal(false);
        setShowWorkoutPrompt(false);
        clearSession();
        navigate("/student");
      } finally {
        setIsFinishing(false);
      }
    },
    [session, setDuration, setFinalized, getPayloadForFinish, request, setShowWorkoutPrompt, clearSession, navigate]
  );

  const shouldShowPrompt = isClient && session && showWorkoutPrompt;

  return shouldShowPrompt ? (
        <>
          <ContinueWorkoutPrompt
            periodName={session?.periodName ?? "Treino"}
            onContinue={handleContinue}
            onFinish={handleFinishClick}
            isFinishing={isFinishing}
          />
          <WorkoutRatingModal
            open={showRatingModal}
            onOpenChange={setShowRatingModal}
            onSelect={handleRatingSelect}
            disabled={isFinishing}
          />
        </>
  ) : (
    children
  );
}
