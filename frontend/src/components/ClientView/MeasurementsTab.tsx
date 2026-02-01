"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, Ruler } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRequest } from "@/api/request";
import { useParams } from "react-router-dom";
import ContainerLoader from "@/components/ui/containerLoader";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import MeasurementCreateModal from "@/components/Measurement/Modals/MeasurementCreateModal";
import MeasurementsCards from "@/components/Measurement/MeasurementsCards";
import MeasurementsTable from "@/components/Measurement/MeasurementsTable";

interface Measurement {
  id: number;
  date: string;
  rightArm: number;
  leftArm: number;
  waist: number;
  rightLeg: number;
  leftLeg: number;
  chest: number;
  createdAt: string;
}

export default function MeasurementsTab() {
  const { id } = useParams();
  const request = useRequest();
  const [open, setOpen] = useState(false);

  const { data: measurements, isFetching } = useQuery<Measurement[]>({
    queryKey: ["measurements"],
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

    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        return format(date, "dd/MM/yyyy", { locale: ptBR });
      } catch {
        return dateString;
      }
    };

    return {
      rightArm: measurements.map((m) => ({
        date: formatDate(m.date),
        value: m.rightArm,
      })),
      leftArm: measurements.map((m) => ({
        date: formatDate(m.date),
        value: m.leftArm,
      })),
      waist: measurements.map((m) => ({
        date: formatDate(m.date),
        value: m.waist,
      })),
      rightLeg: measurements.map((m) => ({
        date: formatDate(m.date),
        value: m.rightLeg,
      })),
      leftLeg: measurements.map((m) => ({
        date: formatDate(m.date),
        value: m.leftLeg,
      })),
      chest: measurements.map((m) => ({
        date: formatDate(m.date),
        value: m.chest,
      })),
    };
  }, [measurements]);

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
        />
        <Button
          size="sm"
          className="cursor-pointer w-full md:w-auto"
          onClick={() => setOpen(true)}
        >
          <PlusIcon /> Nova medição
        </Button>
      </div>

      <MeasurementsCards data={data} />

      <MeasurementsTable data={data} measurements={measurements || []} />
    </div>
  );
}
