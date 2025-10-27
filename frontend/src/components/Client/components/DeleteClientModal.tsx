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
import DangerButton from "@/components/ui/Buttons/components/DangerButton";
import OutlineButton from "@/components/ui/Buttons/components/OutlineButton";
import DefaultTooltip from "@/components/ui/Tooltip/DefaultTooltip";
import { Trash } from "lucide-react";

export default function DeleteClientModal({ onConfirm }) {
    return (
        <AlertDialog>
            <DefaultTooltip tooltipText="Excluir aluno" delay={0}>
                <AlertDialogTrigger asChild>
                    <button className="cursor-pointer p-1 text-red-500 hover:text-red-700 transition">
                        <Trash className="w-5 h-5" />
                    </button>
                </AlertDialogTrigger>
            </DefaultTooltip>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir aluno?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Essa ação removerá o aluno e seus dados permanentemente.
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
