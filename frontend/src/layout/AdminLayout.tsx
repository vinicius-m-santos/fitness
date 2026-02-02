import Menu from "@/components/Menu/Menu";
import { useContinueTrainingDraft } from "@/hooks/useTrainingDraft";
import ContinueTrainingDraftPrompt from "@/components/Training/ContinueTrainingDraftPrompt";

export default function AdminLayout({ children }) {
    const { draft, showPrompt, onContinue, onDiscard } = useContinueTrainingDraft();
    return (
        <div className="min-h-screen bg-gray-100 text-gray-100">
            <Menu />
            {showPrompt && draft ? (
                <ContinueTrainingDraftPrompt
                    draft={draft}
                    onContinue={onContinue}
                    onDiscard={onDiscard}
                />
            ) : (
                children
            )}
        </div>
    );
}
