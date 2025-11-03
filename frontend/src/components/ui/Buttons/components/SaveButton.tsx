import BaseButton from "@/components/ui/Buttons/BaseButton";
import ButtonLoader from "../../buttonLoader";

export default function SaveButton({
  text = "Salvar",
  onClick = () => {},
  loading,
  styling = "",
  size = "default",
}) {
  return (
    <BaseButton
      disabled={loading}
      size={size}
      styling={`cursor-pointer text-white font-semibold rounded-lg py-2 transition-colors disabled:opacity-100 ${styling}`}
      onClick={onClick}
    >
      {loading && <ButtonLoader />}
      {!loading && text}
    </BaseButton>
  );
}
