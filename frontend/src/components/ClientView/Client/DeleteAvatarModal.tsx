import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import DangerButton from "@/components/ui/Buttons/components/DangerButton";
import OutlineButton from "@/components/ui/Buttons/components/OutlineButton";
import { Trash2 } from "lucide-react";

export default function DeleteAvatarModal({ onConfirm }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    size="icon"
                    variant="destructive"
                    className="absolute cursor-pointer w-8 h-8 text-white rounded-full bottom-0 right-0 opacity-0 group-hover:opacity-100 hover:opacity-80 transition-opacity"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Remover foto do aluno?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Essa ação removerá a foto atual permanentemente. Você
                        poderá enviar uma nova imagem depois, se desejar.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <OutlineButton />
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} asChild>
                        <DangerButton />
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
