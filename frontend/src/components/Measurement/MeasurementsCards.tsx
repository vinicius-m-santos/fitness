"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ArrowUp, ArrowDown } from "lucide-react";
import clsx from "clsx";

interface MeasurementData {
  date: string;
  value: number;
}

interface MeasurementsCardsProps {
  data: {
    rightArm: MeasurementData[];
    leftArm: MeasurementData[];
    waist: MeasurementData[];
    rightLeg: MeasurementData[];
    leftLeg: MeasurementData[];
    chest: MeasurementData[];
  };
}

function MeasureCard({
  title,
  data,
}: {
  title: string;
  data: MeasurementData[];
}) {
  if (data.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-center justify-center h-20">
            <span className="text-sm text-muted-foreground">Sem dados</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const last = data[data.length - 1].value;
  const prev = data[data.length - 2]?.value ?? last;
  const diff = (last - prev).toFixed(1);
  const up = parseFloat(diff) > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-semibold">{last} cm</span>
          <span
            className={clsx(
              "flex items-center text-sm",
              up ? "text-green-600" : "text-red-500",
            )}
          >
            {up ? (
              <ArrowUp className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDown className="w-4 h-4 mr-1" />
            )}
            {diff} cm
          </span>
        </div>
        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Line
                type="monotone"
                dataKey="value"
                name="Valor"
                stroke={up ? "#22c55e" : "#ef4444"}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MeasurementsCards({ data }: MeasurementsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <MeasureCard title="Braço Direito" data={data.rightArm} />
      <MeasureCard title="Braço Esquerdo" data={data.leftArm} />
      <MeasureCard title="Cintura" data={data.waist} />
      <MeasureCard title="Perna Direita" data={data.rightLeg} />
      <MeasureCard title="Perna Esquerda" data={data.leftLeg} />
      <MeasureCard title="Tórax" data={data.chest} />
    </div>
  );
}
