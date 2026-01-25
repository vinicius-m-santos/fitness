"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Calendar,
  IdCard,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { parseISO, format } from "date-fns";

export default function PersonalDataSection() {
  const { user } = useAuth();

  const getUserType = () => {
    if (!user?.roles) return "";
    if (user.roles.includes("ROLE_PERSONAL")) return "Personal Trainer";
    if (user.roles.includes("ROLE_CLIENT")) return "Aluno";
    return "";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Não informado";
    try {
      const date = parseISO(dateString);
      return format(date, "dd/MM/yyyy");
    } catch {
      return "Não informado";
    }
  };

  const formatPhone = (phone?: string | null) => {
    if (!phone) return "Não informado";
    // Remove todos os caracteres não numéricos
    const digits = phone.replace(/\D/g, "");
    // Formata como (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <User className="text-muted-foreground" />
            <h3 className="text-lg font-semibold">Dados básicos</h3>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <DataItem label="Nome" value={user?.firstName || "Não informado"} />
            <DataItem label="Sobrenome" value={user?.lastName || "Não informado"} />
            <DataItem label="Data de nascimento" value={formatDate(user?.birthDate)} />
            <DataItem label="Tipo de usuário" value={getUserType() || "Não informado"} />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="text-muted-foreground" />
            <h3 className="text-lg font-semibold">Contato</h3>
          </div>

          <Separator />

          <div className="space-y-3 text-sm">
            <IconDataItem
              icon={<Mail size={16} />}
              label="E-mail"
              value={user?.email || "Não informado"}
            />

            <IconDataItem
              icon={<Phone size={16} />}
              label="Telefone"
              value={formatPhone(user?.phone)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <IdCard className="text-muted-foreground" />
            <h3 className="text-lg font-semibold">Conta</h3>
          </div>

          <Separator />

          <div className="space-y-3 text-sm">
            <IconDataItem
              icon={<Calendar size={16} />}
              label="Conta criada em"
              value={formatDate(user?.createdAt)}
            />

            <IconDataItem
              icon={<User size={16} />}
              label="Status"
              value="Ativa"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DataItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function IconDataItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
