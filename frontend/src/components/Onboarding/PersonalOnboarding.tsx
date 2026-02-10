import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTour } from "@reactour/tour";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useRequest } from "@/api/request";
import type { ReactNode } from "react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { Button } from "@/components/ui/button";
import { UserPlus, Dumbbell, UserCircle, Compass } from "lucide-react";

function StepContent({ text }: { text: string }) {
  return (
    <div className="text-sm text-gray-800 leading-relaxed">
      <p>{text}</p>
    </div>
  );
}

const WELCOME_STEP = {
  selector: "body",
  content: () => <WelcomeContent />,
  position: "center" as const,
};

function WelcomeContent() {

  console.log('here')
  const navigate = useNavigate();
  const { setIsOpen } = useTour();
  const { user, updateUser } = useAuth();
  const { pathname } = useLocation();
  const request = useRequest();
  const {
    markWelcomeShown,
    startCreateAlunoTour,
    setClosingForNavigation,
  } = useOnboardingStore();

  const handleChoice = (choice: string) => {
    if (choice === "create-aluno") {
      markWelcomeShown();
      startCreateAlunoTour();
      if (pathname !== "/clients") {
        navigate("/clients");
        setClosingForNavigation(true);
        setIsOpen(false);
      }
      return;
    }
    if (choice === "explore") {
      markWelcomeShown();
      setIsOpen(false);
      // if (user?.id) {
      //   request({
      //     method: "PATCH",
      //     url: `/user/${user.id}`,
      //     data: { onboardingTourCompleted: true },
      //     showSuccess: false,
      //   }).then((res) => {
      //     if (res && typeof res === "object" && user) updateUser({ ...user, ...res });
      //   }).catch(() => { });
      // }
      return;
    }
    markWelcomeShown();
    setIsOpen(false);
    if (choice === "novo-treino") navigate("/week-summary");
    if (choice === "perfil") navigate("/profile");
  };

  return (
    <div className="p-2 space-y-4 max-w-sm">
      <h3 className="font-semibold text-gray-900">Bem-vindo à Fitrise</h3>
      <p className="text-sm text-gray-600">
        O que você quer fazer primeiro?
      </p>
      <div className="grid gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2 bg-black cursor-pointer hover:opacity-80 hover:bg-black text-white hover:text-white"
          onClick={() => handleChoice("create-aluno")}
        >
          <UserPlus className="h-4 w-4" />
          Criar um aluno
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2 bg-black cursor-pointer hover:opacity-80 hover:bg-black text-white hover:text-white"
          onClick={() => handleChoice("novo-treino")}
        >
          <Dumbbell className="h-4 w-4" />
          Novo treino
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2 bg-black cursor-pointer hover:opacity-80 hover:bg-black text-white hover:text-white"
          onClick={() => handleChoice("perfil")}
        >
          <UserCircle className="h-4 w-4" />
          Editar perfil
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start gap-2 border text-muted-foreground"
          onClick={() => handleChoice("explore")}
        >
          <Compass className="h-4 w-4" />
          Explorar por conta própria
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Você pode reiniciar o tour guiado a qualquer momento em Perfil → Tour guiado.
      </p>
    </div>
  );
}

const CREATE_ALUNO_STEPS_CLIENTS = [
  {
    selector: "[data-tour-id='clients-page']",
    content: () => (
      <StepContent text="Esta é a página de Alunos. Aqui você gerencia todos os alunos vinculados a você: cadastra novos, acessa a ficha de cada um e copia seu link de convite." />
    ),
    position: "bottom" as const,
  },
  {
    selector: "[data-tour-id='personal-link']",
    content: () => (
      <StepContent text="Use o Link de personal para compartilhar seu cadastro com novos alunos. Quem acessar o link poderá se registrar e já ficará vinculado a você." />
    ),
    position: "bottom" as const,
  },
  {
    selector: "[data-tour-id='clients-list']",
    content: () => (
      <StepContent text="Aqui aparece a lista dos seus alunos. Clique em um aluno para abrir a ficha dele e continuar o tour na aba Treinos. Se ainda não tiver alunos, use o próximo passo para cadastrar." />
    ),
    position: "top" as const,
    stepInteraction: true,
  },
  {
    selector: "[data-tour-id='client-create-trigger']",
    content: () => (
      <StepContent text="Use o botão Novo Aluno para cadastrar. Depois de salvar, volte à lista e clique no aluno para abrir a ficha e continuar o tour na aba Treinos." />
    ),
    position: "bottom" as const,
    stepInteraction: true,
  },
];

const CREATE_ALUNO_STEPS_CLIENT_VIEW = [
  {
    selector: "[data-tour-id='client-view-tabs']",
    content: () => (
      <StepContent text="Aqui estão as abas da ficha do aluno: Evolução, Medidas, Treinos, Galeria e Anamnese." />
    ),
    position: "bottom" as const,
  },
  {
    selector: "[data-tour-id='workouts-tab-trigger']",
    content: () => (
      <StepContent text="Clique na aba Treinos para gerenciar os treinos deste aluno." />
    ),
    position: "bottom" as const,
  },
  {
    selector: "[data-tour-id='workouts-header']",
    content: () => (
      <StepContent text="Nesta área você cria e gerencia os treinos. Use o botão Novo treino para cadastrar um treino para o aluno." />
    ),
    position: "bottom" as const,
  },
  {
    selector: "[data-tour-id='workout-novo-treino']",
    content: () => (
      <StepContent text="Clique em Novo treino para criar um treino: defina períodos, exercícios, séries e repetições." />
    ),
    position: "bottom" as const,
  },
  {
    selector: "[data-tour-id='workout-accordion']",
    content: () => (
      <StepContent text="Os treinos aparecem aqui em formato de lista. Você pode expandir, editar, excluir ou gerar PDF de cada um." />
    ),
    position: "top" as const,
  },
  {
    selector: "[data-tour-id='workouts-content']",
    content: () => (
      <StepContent text="Você concluiu o tour de criação de aluno e treinos. Explore as outras abas da ficha e use o menu para acessar o restante do sistema." />
    ),
    position: "center" as const,
  },
];

type PersonalOnboardingProps = {
  children: ReactNode;
};

export default function PersonalOnboarding({ children }: PersonalOnboardingProps) {
  const { user, updateUser } = useAuth();
  const request = useRequest();
  const {
    isWelcomeOpen,
    activeTour,
    currentStep: storeCurrentStep,
    setCurrentStep: setStoreCurrentStep,
    welcomeShownThisSession,
    setTourConfig,
  } = useOnboardingStore();
  const { pathname } = useLocation();
  const { setSteps: setTourSteps, setCurrentStep: setTourCurrentStep, setIsOpen } = useTour();

  console.log(user)

  const isOnClients = pathname === "/clients";
  const isOnClientView = pathname.startsWith("/client-view/");

  const showWelcomeByDefault =
    user?.roles?.includes("ROLE_PERSONAL") &&
    user?.onboardingTourCompleted !== true &&
    !welcomeShownThisSession;

  console.log(welcomeShownThisSession);

  useEffect(() => {
    if (showWelcomeByDefault) {
      setTourSteps?.([WELCOME_STEP]);
      setTourCurrentStep?.(0);
      setIsOpen(true);
      return;
    }
    console.log(activeTour);
    if (activeTour === "create-aluno" && isOnClients) {
      setTourSteps?.(CREATE_ALUNO_STEPS_CLIENTS);
      setTourCurrentStep?.(0);
      setIsOpen(true);
      setTourConfig({ showBadge: true, showCloseButton: true, showNavigation: true });
    }
    if (activeTour === "create-aluno" && isOnClientView) {
      setTourSteps?.(CREATE_ALUNO_STEPS_CLIENT_VIEW);
      setTourCurrentStep?.(0);
      setIsOpen(true);
      setTourConfig({ showBadge: true, showCloseButton: true, showNavigation: true });
    }
  }, [activeTour, isOnClientView, isOnClients, showWelcomeByDefault, setTourSteps, setTourCurrentStep, setIsOpen]);

  const beforeCloseRef = useRef<(() => void) | null>(null);
  beforeCloseRef.current = () => {
    if (useOnboardingStore.getState().closingForNavigation) {
      useOnboardingStore.getState().setClosingForNavigation(false);
      return;
    }
    const state = useOnboardingStore.getState();
    if (state.isWelcomeOpen) state.markWelcomeShown();
    const wasCreateAluno = state.activeTour === "create-aluno";
    useOnboardingStore.getState().closeAll();
    // if (wasCreateAluno && user?.id) {
    //   request({
    //     method: "PATCH",
    //     url: `/user/${user.id}`,
    //     data: { onboardingTourCompleted: true },
    //     showSuccess: false,
    //   }).then((res) => {
    //     if (res && typeof res === "object" && user) updateUser({ ...user, ...res });
    //   }).catch(() => { });
    // }
  };

  return <>{children}</>;
}
