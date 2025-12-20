import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DangerButton from "@/components/ui/Buttons/components/DangerButton";
import OutlineButton from "@/components/ui/Buttons/components/OutlineButton";

type Props = {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function DeleteGalleryImageDialog({
  open,
  onConfirm,
  onClose,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent className="rounded-md w-[90vw] max-w-[420px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir imagem?</AlertDialogTitle>

          <AlertDialogDescription>
            Esta imagem será removida permanentemente e não poderá ser
            recuperada.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <OutlineButton />
          </AlertDialogCancel>

          <AlertDialogAction asChild onClick={onConfirm}>
            <DangerButton styling="flex cursor-pointer text-white hover:opacity-80 items-center gap-2 mb-2" />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
