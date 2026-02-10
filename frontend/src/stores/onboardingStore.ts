import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TourPhase = "clients" | "client-view" | null;

type TourConfig = {
  showBadge: boolean;
  showCloseButton: boolean;
  showNavigation: boolean;
};

type OnboardingState = {
  isWelcomeOpen: boolean;
  activeTour: string | null;
  currentStep: number;
  tourPhase: TourPhase;
  closingForNavigation: boolean;
  welcomeShownThisSession: boolean;
  tourConfig: TourConfig;
  setWelcomeOpen: (open: boolean) => void;
  setActiveTour: (tour: string | null) => void;
  setCurrentStep: (step: number) => void;
  setTourPhase: (phase: TourPhase) => void;
  setClosingForNavigation: (value: boolean) => void;
  startCreateAlunoTour: () => void;
  dismissWelcome: (choice: string) => void;
  closeAll: () => void;
  markWelcomeShown: () => void;
  restartTour: () => void;
  setTourConfig: (config: TourConfig) => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      isWelcomeOpen: false,
      activeTour: null,
      currentStep: 0,
      tourPhase: null,
      closingForNavigation: false,
      welcomeShownThisSession: false,
      tourConfig: {
        showBadge: false,
        showCloseButton: false,
        showNavigation: false,
        disableInteraction: true,
        disableDotsNavigation: true,
      },
      setTourConfig: (config) =>
        set((state) => ({
          tourConfig: { ...state.tourConfig, ...config },
        })),

      setWelcomeOpen: (open) => set({ isWelcomeOpen: open }),
      setActiveTour: (tour) => set({ activeTour: tour }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setTourPhase: (phase) => set({ tourPhase: phase }),
      setClosingForNavigation: (value) => set({ closingForNavigation: value }),

      startCreateAlunoTour: () =>
        set({ activeTour: "create-aluno", tourPhase: "clients", currentStep: 0 }),

      dismissWelcome: (choice) =>
        set({
          isWelcomeOpen: false,
          // activeTour: choice === "create-aluno" ? "create-aluno" : null,
          welcomeShownThisSession: true,
        }),

      closeAll: () =>
        set({
          isWelcomeOpen: false,
          activeTour: null,
          currentStep: 0,
          tourPhase: null,
          closingForNavigation: false,
        }),

      markWelcomeShown: () => set({ welcomeShownThisSession: true }),

      restartTour: () =>
        set({
          isWelcomeOpen: true,
          activeTour: null,
          currentStep: 0,
          tourPhase: null,
          welcomeShownThisSession: false,
        }),
    }),
    {
      name: "onboarding-tour",
      partialize: (state) => ({
        activeTour: state.activeTour,
        currentStep: state.currentStep,
        tourPhase: state.tourPhase,
        welcomeShownThisSession: state.welcomeShownThisSession,
        tourConfig: state.tourConfig,
      }),
    }
  )
);
