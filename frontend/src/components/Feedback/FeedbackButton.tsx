import { useState } from "react";
import * as Sentry from "@sentry/react";
import toast from "react-hot-toast";
import { MessageCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

const FEEDBACK_TYPES = [
    { value: "bug", label: "Bug / erro", emoji: "🐞" },
    { value: "suggestion", label: "Sugestão de melhoria", emoji: "💡" },
    { value: "question", label: "Dúvida", emoji: "😕" },
    { value: "praise", label: "Elogio", emoji: "👍" },
] as const;

function getDeviceType(): "mobile" | "desktop" {
    if (typeof window === "undefined") return "desktop";
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    )
        ? "mobile"
        : "desktop";
}

export default function FeedbackButton() {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<string>("");
    const [message, setMessage] = useState("");
    const { user } = useAuth();

    if (!user) return null;

    const handleSubmit = () => {
        Sentry.captureFeedback(
            {
                message,
                url: window.location.href,
                source: "feedback-button",
                tags: {
                    feedbackType: type || "unknown",
                },
            },
            {
                captureContext: {
                    extra: {
                        path: window.location.pathname,
                        userId: user?.id ?? null,
                        deviceType: getDeviceType(),
                        timestamp: new Date().toISOString(),
                    },
                },
            }
        );
        toast.success("Feedback enviado! Obrigado.");
        setOpen(false);
        setType("");
        setMessage("");
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Enviar feedback"
            >
                <MessageCircle className="h-6 w-6" />
            </button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="rounded-md w-[90vw] max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>Tem algo pra melhorar?</DialogTitle>
                        <DialogDescription>
                            Seu feedback ajuda a deixar o app melhor
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <div className="flex flex-wrap gap-2">
                                {FEEDBACK_TYPES.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setType(opt.value)}
                                        className={cn(
                                            "rounded-md border px-3 py-2 text-sm transition",
                                            type === opt.value
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-input bg-background hover:bg-accent"
                                        )}
                                    >
                                        <span className="mr-1">{opt.emoji}</span>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="feedback-message">
                                O que aconteceu ou o que você sugere?
                            </Label>
                            <Textarea
                                id="feedback-message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Descreva aqui..."
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button className="mb-1" onClick={handleSubmit}>Enviar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
