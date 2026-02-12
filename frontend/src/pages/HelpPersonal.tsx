import { HelpCircle } from "lucide-react";
import HelpSection from "@/components/Help/HelpSection";
import HelpFeedbackSection from "@/components/Help/HelpFeedbackSection";

const firstSteps = [
  {
    question: "Como criar um aluno?",
    answer:
      "No menu, clique em Alunos e depois no botão para adicionar novo aluno. Preencha nome e e-mail. Você pode enviar o link de cadastro do personal para a pessoa se cadastrar sozinha, ou criar o cadastro manualmente. Depois que o aluno existir na lista, é só montar os treinos para ele.",
  },
  {
    question: "Como criar um treino?",
    answer:
      "Vá em Alunos, escolha o aluno, depois vá em Treinos (ou use Treinos padrão para um modelo). Clique em criar novo treino, defina o nome e os períodos (ex.: Semana A, Semana B). Em cada período, adicione os exercícios, séries e repetições. Ao finalizar, salve e o treino fica disponível para o aluno executar.",
  },
  {
    question: "Como registrar a execução de um treino?",
    answer:
      "O aluno acessa Meus treinos, escolhe o treino e inicia a execução. Lá ele marca série por série conforme for fazendo. O registro é salvo automaticamente. Você pode acompanhar o histórico e a evolução na aba de acompanhamento do aluno.",
  },
  {
    question: "O que são Treinos padrão?",
    answer:
      "Treinos padrão são modelos de treino que você cria uma vez e pode reutilizar para vários alunos. Em Treinos no menu, você monta o treino (períodos, exercícios, séries e repetições) e depois pode aplicar esse mesmo modelo a qualquer aluno, sem precisar montar tudo de novo.",
  },
  {
    question: "Como funcionam os Exercícios?",
    answer:
      "Em Exercícios no menu você cadastra e gerencia a biblioteca de exercícios que aparece na hora de montar os treinos. Crie o exercício com nome, categoria e grupo muscular. Depois, ao criar ou editar um treino, você busca e adiciona esses exercícios nos períodos. Tudo que você cadastrar fica disponível para usar em qualquer treino.",
  },
];

const faq = [
  {
    question: "Posso usar o app no celular?",
    answer:
      "Sim. O sistema é responsivo e funciona no navegador do celular. Não é obrigatório instalar nada: basta acessar pelo navegador e fazer login. Para um atalho na tela inicial, use \"Adicionar à tela inicial\" nas opções do navegador.",
  },
  {
    question: "Preciso instalar algo?",
    answer:
      "Não. Tudo roda no navegador (Chrome, Safari, Edge etc.). Só precisa de internet para acessar e salvar os dados. Se quiser, pode fixar o site na tela inicial do celular para abrir como app.",
  },
  {
    question: "Posso editar um treino depois de criado?",
    answer:
      "Sim. Abra o treino na lista de treinos do aluno (ou em Treinos padrão) e use a opção de editar. As alterações valem para as próximas execuções. Se o aluno já tiver começado a executar, o que já foi feito permanece registrado.",
  },
];

const commonIssues = [
  {
    question: "Não encontrei uma funcionalidade",
    answer:
      "As principais funções ficam no menu: Resumo da semana, Alunos, Exercícios, Treinos e Perfil. Se ainda não achar o que precisa, use a seção de Feedback abaixo e nos conte — podemos te guiar ou planejar a melhoria.",
  },
  {
    question: "Algo não salvou corretamente",
    answer:
      "Verifique se está com internet estável. Se estiver, tente recarregar a página e refazer a ação. Se o problema continuar nos envie um feedback. Assim conseguimos investigar e corrigir.",
  },
];

export default function HelpPersonal() {
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
