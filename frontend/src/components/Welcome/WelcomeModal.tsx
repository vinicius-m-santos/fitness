import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

type WelcomeModalProps = {
    open: boolean;
    onClose: () => void;
};

export default function WelcomeModal({ open, onClose }: WelcomeModalProps) {
    const navigate = useNavigate();

    if (!open) return null;

    const handleClose = () => {
        onClose();
    };

    const handleCreateClient = () => {
        onClose();
        navigate("/clients");
    };

    const handleHelp = () => {
        onClose();
        navigate("/help");
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
        >
            <div
                className="rounded-md w-[90vw] max-w-[420px] border bg-background p-6 shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <h2
                    id="welcome-title"
                    className="text-lg font-semibold leading-tight tracking-tight"
                >
                    Bem-vindo 👋
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                    A Fitrise ajuda você a gerenciar seus alunos e treinos de
                    forma prática. Escolha por onde começar.
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleHelp}
                        className="w-full sm:w-auto"
                    >
                        Ver ajuda
                    </Button>
                    <Button
                        type="button"
                        onClick={handleCreateClient}
                        className="w-full sm:w-auto"
                    >
                        Criar meu primeiro aluno
                    </Button>
                </div>
            </div>
        </div>
    );
}
