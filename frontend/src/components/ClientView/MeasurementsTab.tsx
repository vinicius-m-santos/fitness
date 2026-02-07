"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, Ruler, File } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRequest } from "@/api/request";
import { useApi } from "@/api/Api";
import { useParams } from "react-router-dom";
import ContainerLoader from "@/components/ui/containerLoader";
import ButtonLoader from "@/components/ui/buttonLoader";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { pdf } from "@react-pdf/renderer";
import MeasurementCreateModal from "@/components/Measurement/Modals/MeasurementCreateModal";
import MeasurementsCards from "@/components/Measurement/MeasurementsCards";
import MeasurementsTable from "@/components/Measurement/MeasurementsTable";
import { PdfMeasurementsReport } from "@/components/Measurement/PdfMeasurementsReport";
import type { ClientAllData } from "@/types/client";

interface Measurement {
  id: number;
  date: string;
  rightArm: number;
  leftArm: number;
  waist: number;
  rightLeg: number;
  leftLeg: number;
  chest: number;
  weight?: number | null;
  fatPercentage?: number | null;
  fatMass?: number | null;
  leanMass?: number | null;
  createdAt?: string;
}

interface ClientForMeasurement {
  id?: number;
  gender?: string | null;
  user?: { birthDate?: string | null } | null;
}

interface MeasurementsTabProps {
  client?: ClientForMeasurement | null;
}

function formatDatePtBR(dateString: string) {
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
}

export default function MeasurementsTab({ client }: MeasurementsTabProps) {
  const { id } = useParams();
  const request = useRequest();
  const api = useApi();
  const [open, setOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const { data: measurements, isFetching } = useQuery<Measurement[]>({
    queryKey: ["measurements", id],
    queryFn: async () => {
      const res = await request({
        method: "GET",
        url: `/measurement/client/${id}`,
      });
      return Array.isArray(res) ? res : [];
    },
    enabled: !!id,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000,
  });

  const data = useMemo(() => {
    if (!measurements || measurements.length === 0) {
      return {
        rightArm: [],
        leftArm: [],
        waist: [],
        rightLeg: [],
        leftLeg: [],
        chest: [],
      };
    }

    return {
      rightArm: measurements.map((m) => ({
        date: formatDatePtBR(m.date),
        value: m.rightArm,
      })),
      leftArm: measurements.map((m) => ({
        date: formatDatePtBR(m.date),
        value: m.leftArm,
      })),
      waist: measurements.map((m) => ({
        date: formatDatePtBR(m.date),
        value: m.waist,
      })),
      rightLeg: measurements.map((m) => ({
        date: formatDatePtBR(m.date),
        value: m.rightLeg,
      })),
      leftLeg: measurements.map((m) => ({
        date: formatDatePtBR(m.date),
        value: m.leftLeg,
      })),
      chest: measurements.map((m) => ({
        date: formatDatePtBR(m.date),
        value: m.chest,
      })),
    };
  }, [measurements]);

  const evolutionData = useMemo(() => {
    if (!measurements || measurements.length === 0) return [];
    const sorted = [...measurements].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    return sorted.map((m) => ({
      date: formatDatePtBR(m.date),
      peso: m.weight ?? null,
      gordura: m.fatPercentage ?? null,
      massaMagra: m.leanMass ?? null,
    }));
  }, [measurements]);

  const formattedMeasurements = useMemo(() => {
    if (!measurements) return [];
    return measurements.map((m) => ({
      ...m,
      date: formatDatePtBR(m.date),
    }));
  }, [measurements]);

  const handleGeneratePdf = async () => {
    if (!id) return;
    setPdfLoading(true);
    try {
      const clientRes = await request({
        method: "GET",
        url: `/client/${id}`,
      });
      const fullClient = clientRes as ClientAllData;
      let personalAvatarSrc: string | undefined;
      const personalUser = fullClient.personal?.user;
      if (personalUser?.id != null && personalUser?.avatarUrl) {
        try {
          const res = await api.get(`/user/avatar/${personalUser.id}`, {
            responseType: "blob",
          });
          personalAvatarSrc = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(res.data as Blob);
          });
        } catch {
          personalAvatarSrc = undefined;
        }
      }
      const doc = (
        <PdfMeasurementsReport
          client={fullClient}
          evolutionData={evolutionData}
          cardsData={data}
          measurements={formattedMeasurements}
          personalAvatarSrc={personalAvatarSrc}
        />
      );
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "relatorio-medidas-evolucao.pdf";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setPdfLoading(false);
      return;
    } finally {
      setPdfLoading(false);
    }
  };

  if (isFetching) {
    return <ContainerLoader />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-2 md:gap-0 items-center justify-between">
        <h3 className="text-lg md:text-xl font-semibold text-black flex items-center gap-2">
          <Ruler className="h-4 w-4 md:h-5 md:w-5" />
          Medidas Corporais
        </h3>
        <MeasurementCreateModal
          open={open}
          onOpenChange={setOpen}
          clientId={Number(id)}
          client={client}
        />
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button
            size="sm"
            disabled={pdfLoading}
            className="w-full md:w-auto flex bg-blue-500 hover:bg-blue-400 items-center gap-1 cursor-pointer"
            onClick={handleGeneratePdf}
          >
            {!pdfLoading && (
              <>
                <File className="h-4 w-4 mr-1 text-white" /> Gerar PDF
              </>
            )}
            {pdfLoading && <ButtonLoader />}
          </Button>
          <Button
            size="sm"
            className="cursor-pointer w-full md:w-auto"
            onClick={() => setOpen(true)}
          >
            <PlusIcon /> Nova medição
          </Button>
        </div>
      </div>

      <MeasurementsCards data={data} />

      <MeasurementsTable
        measurements={measurements || []}
        client={client}
      />
    </div>
  );
}
