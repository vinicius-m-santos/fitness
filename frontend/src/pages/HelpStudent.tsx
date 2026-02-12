import { HelpCircle } from "lucide-react";
import HelpSection from "@/components/Help/HelpSection";
import HelpFeedbackSection from "@/components/Help/HelpFeedbackSection";

const firstSteps = [
  {
    question: "Onde vejo meus treinos?",
    answer:
      "No menu, clique em Meus treinos. Lá aparecem os treinos que seu personal cadastrou para você. Escolha um treino para ver os períodos e exercícios. Quando quiser treinar, é só iniciar a execução.",
  },
  {
    question: "Como executo um treino?",
    answer:
      "Em Meus treinos, abra o treino e clique para iniciar a execução. Na tela de treino você verá cada exercício com séries e repetições. Vá marcando série por série conforme for fazendo. O progresso é salvo automaticamente. Se precisar pausar, pode sair e continuar depois de onde parou.",
  },
  {
    question: "Onde acompanho minha evolução?",
    answer:
      "No menu, entre em Acompanhamento. Lá você vê seu histórico de treinos, medidas e evolução ao longo do tempo. Seu personal também acompanha por aí para te dar o suporte certo.",
  },
];

const faq = [
  {
    question: "Posso usar o app no celular?",
    answer:
      "Sim. O sistema funciona no navegador do celular. Não precisa instalar nada: acesse pelo navegador e faça login. Se quiser um atalho na tela inicial, use \"Adicionar à tela inicial\" nas opções do navegador.",
  },
  {
    question: "Preciso instalar algo?",
    answer:
      "Não. Tudo roda no navegador. Só precisa de internet. Se quiser, pode fixar o site na tela inicial do celular para abrir como app.",
  },
  {
    question: "Meu personal alterou o treino. O que muda para mim?",
    answer:
      "As alterações valem para as próximas execuções. Se você já tinha começado a fazer um treino, o que já foi registrado continua lá. Na próxima vez que abrir esse treino, verá a versão atualizada.",
  },
];

const commonIssues = [
  {
    question: "Não encontrei uma funcionalidade",
    answer:
      "No menu você tem Início, Meus treinos e Acompanhamento. Se não achar o que precisa, use a seção de Feedback abaixo e nos conte. Podemos te guiar ou melhorar o app.",
  },
  {
    question: "Algo não salvou corretamente",
    answer:
      "Confira se está com internet estável. Se estiver, tente recarregar a página e refazer a ação. Se continuar, nos envie um feedback para investigarmos.",
  },
];

export default function HelpStudent() {
  return (
    <>
      <HelpSection
        title="Primeiros passos"
        icon={HelpCircle}
        items={firstSteps}
      />
      <HelpSection title="Dúvidas frequentes" icon={HelpCircle} items={faq} />
      <HelpSection
        title="Problemas comuns"
        icon={HelpCircle}
        items={commonIssues}
      />
      <HelpFeedbackSection />
    </>
  );
}
