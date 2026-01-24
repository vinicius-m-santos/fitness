"use client";

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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequest } from "@/api/request";
import toast from "react-hot-toast";

interface MeasurementDeleteModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    measurementId: number;
}

export default function MeasurementDeleteModal({
    open,
    onOpenChange,
    measurementId,
}: MeasurementDeleteModalProps) {
    const request = useRequest();
    const queryClient = useQueryClient();

    const deleteMeasurementMutation = useMutation({
        mutationFn: async () => {
            const res = await request({
                method: "DELETE",
                url: `/measurement/${measurementId}`,
            });
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["measurements"] });
            toast.success("Medição excluída com sucesso!");
            onOpenChange(false);
        },
        onError: (error: unknown) => {
            const errorMessage = error instanceof Error ? error.message : "Erro ao excluir medição";
            toast.error(errorMessage);
        },
    });

    const handleDelete = () => {
        deleteMeasurementMutation.mutate();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="rounded-md w-[90vw] max-w-[420px]">
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir medição?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta medição será removida permanentemente e não poderá ser recuperada.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <OutlineButton />
                    </AlertDialogCancel>

                    <AlertDialogAction asChild onClick={handleDelete}>
                        <DangerButton
                            styling="flex cursor-pointer text-white hover:opacity-80 items-center gap-2 mb-2"
                            loading={deleteMeasurementMutation.isPending}
                        />
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
