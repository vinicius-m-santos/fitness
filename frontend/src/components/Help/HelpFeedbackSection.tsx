import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useFeedbackModal } from "@/components/Feedback/FeedbackModalContext";
import { SECTION_CLASS, SECTION_TITLE_CLASS } from "./HelpSection";

export default function HelpFeedbackSection() {
  const { openFeedback } = useFeedbackModal();

  return (
    <section className={SECTION_CLASS}>
      <h2 className={SECTION_TITLE_CLASS}>
        <MessageCircle className="h-5 w-5 text-gray-600" />
        Feedback
      </h2>
      <div className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-white shadow-sm text-gray-600">
        <p className="mb-4">
          Sua opinião ajuda a melhorar o sistema para todos. Encontrou um bug,
          tem uma sugestão ou ficou com alguma dúvida que não está aqui?
        </p>
        <Button onClick={openFeedback}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Enviar feedback
        </Button>
      </div>
    </section>
  );
}
