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
import DefaultTooltip from "@/components/ui/Tooltip/DefaultTooltip";
import { Trash } from "lucide-react";

export default function DeleteExerciseModal({ onConfirm, isMobile = false }) {
  return (
    <AlertDialog>
      {!isMobile && (
        <DefaultTooltip tooltipText="Excluir aluno" delay={0}>
          <AlertDialogTrigger asChild>
            <button className="cursor-pointer p-1 text-red-500 hover:text-red-700 transition">
              <Trash className="w-5 h-5" />
            </button>
          </AlertDialogTrigger>
        </DefaultTooltip>
      )}
      {isMobile && (
        <AlertDialogTrigger className="w-full" asChild>
          <Button
            variant="default"
            size="sm"
            className="w-full bg-red-500 text-white hover:text-white focus:text-white transition"
          >
            <Trash className="w-5 h-5" />
            <span>Excluir</span>
          </Button>
        </AlertDialogTrigger>
      )}

      <AlertDialogContent className="max-w-[300px] sm:max-w-[500px] rounded-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir exercício?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação removerá o exercício e seus dados permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <OutlineButton styling="mt-2 sm:mt-0" />
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} asChild>
            <DangerButton />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
