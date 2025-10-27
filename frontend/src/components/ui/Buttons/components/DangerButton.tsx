import BaseButton from "@/components/ui/Buttons/BaseButton";

export default function DangerButton({
    text = "Remover",
    onClick = () => {},
    styling = "flex cursor-pointer text-white hover:opacity-80 items-center gap-2",
    variant = "destructive",
}) {
    return (
        <BaseButton styling={`${styling}`} onClick={onClick} variant={variant}>
            {text}
        </BaseButton>
    );
}
