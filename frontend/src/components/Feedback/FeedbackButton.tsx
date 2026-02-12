import { MessageCircle } from "lucide-react";
import { useFeedbackModal } from "./FeedbackModalContext";
import { useAuth } from "@/providers/AuthProvider";

export default function FeedbackButton() {
    const { openFeedback } = useFeedbackModal();
    const { user } = useAuth();

    if (!user) return null;

    return (
        <button
            type="button"
            onClick={openFeedback}
            className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Enviar feedback"
        >
            <MessageCircle className="h-6 w-6" />
        </button>
    );
}
