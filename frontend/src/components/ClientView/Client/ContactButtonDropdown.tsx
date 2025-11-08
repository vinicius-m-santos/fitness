import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail } from "lucide-react";
import WhatsAppButton from "@/components/ui/Tooltip/WhatsAppButton";
import { ClientAllData } from "@/types/client";

type ContactButtonDropdownProps = {
  client: ClientAllData;
};

export default function ContactButtonDropdown({
  client,
}: ContactButtonDropdownProps) {
  const handleWhatsApp = () => {
    if (String(client?.phone).trim().length === 0) {
      return;
    }

    window.open("https://wa.me/", "_blank");
  };

  const handleSendEmail = () => {
    if (String(client?.email).trim().length === 0) {
      return;
    }

    window.open(`mailto:${client?.email}`, "_blank");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="cursor-pointer" size="sm">
          <MessageCircle className="h-4 w-4 mr-2" /> Contatar
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Contatar aluno</DropdownMenuLabel>
        <DropdownMenuItem
          className="cursor-pointer"
          disabled={String(client?.email).trim().length === 0}
          onClick={handleSendEmail}
        >
          <Mail className="h-4 w-4 mr-2" /> Email
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          disabled={String(client?.phone).trim().length === 0}
          onClick={handleWhatsApp}
          asChild
        >
          <WhatsAppButton
            phoneNumber={
              client?.phone.trim().length
                ? `+55${client?.phone.replace(/\D/g, "")}`
                : null
            }
            message={`Olá ${client?.name}! Tudo bem? Aqui é o ${client?.personal?.user?.firstName}, seu personal.`}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
