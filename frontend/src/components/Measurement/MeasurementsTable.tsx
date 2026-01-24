"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import MeasurementUpdateModal from "./Modals/MeasurementUpdateModal";
import MeasurementDeleteModal from "./Modals/MeasurementDeleteModal";

interface Measurement {
  id: number;
  date: string;
  rightArm: number;
  leftArm: number;
  waist: number;
  rightLeg: number;
  leftLeg: number;
  chest: number;
}

interface MeasurementsTableProps {
  measurements: Measurement[];
}

export default function MeasurementsTable({
  measurements,
}: MeasurementsTableProps) {
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] =
    useState<Measurement | null>(null);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const handleEdit = (measurement: Measurement) => {
    setSelectedMeasurement(measurement);
    setUpdateOpen(true);
  };

  const handleDelete = (measurement: Measurement) => {
    setSelectedMeasurement(measurement);
    setDeleteOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Medidas</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm border-t">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Data</th>
                  <th>Braço D</th>
                  <th>Braço E</th>
                  <th>Cintura</th>
                  <th>Perna D</th>
                  <th>Perna E</th>
                  <th>Tórax</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {measurements.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-4 text-center text-muted-foreground"
                    >
                      Nenhuma medição registrada ainda
                    </td>
                  </tr>
                ) : (
                  measurements.map((m) => (
                    <tr key={m.id} className="border-t">
                      <td className="py-2">{formatDate(m.date)}</td>
                      <td>{m.rightArm}</td>
                      <td>{m.leftArm}</td>
                      <td>{m.waist}</td>
                      <td>{m.rightLeg}</td>
                      <td>{m.leftLeg}</td>
                      <td>{m.chest}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit(m)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDelete(m)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ================= MOBILE CARDS ================= */}
          <div className="md:hidden space-y-3">
            {measurements.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma medição registrada ainda
              </p>
            ) : (
              measurements.map((m) => (
                <Card key={m.id} className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">{formatDate(m.date)}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(m)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 w-8 p-0 text-white flex items-center gap-1 cursor-pointer"
                        variant="destructive"
                        onClick={() => handleDelete(m)}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Braço D:</span>{" "}
                      {m.rightArm} cm
                    </div>
                    <div>
                      <span className="text-muted-foreground">Braço E:</span>{" "}
                      {m.leftArm} cm
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cintura:</span>{" "}
                      {m.waist} cm
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tórax:</span>{" "}
                      {m.chest} cm
                    </div>
                    <div>
                      <span className="text-muted-foreground">Perna D:</span>{" "}
                      {m.rightLeg} cm
                    </div>
                    <div>
                      <span className="text-muted-foreground">Perna E:</span>{" "}
                      {m.leftLeg} cm
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {selectedMeasurement && (
        <>
          <MeasurementUpdateModal
            open={updateOpen}
            onOpenChange={(open) => {
              setUpdateOpen(open);
              if (!open) setSelectedMeasurement(null);
            }}
            measurementId={selectedMeasurement.id}
            initialData={selectedMeasurement}
          />
          <MeasurementDeleteModal
            open={deleteOpen}
            onOpenChange={(open) => {
              setDeleteOpen(open);
              if (!open) setSelectedMeasurement(null);
            }}
            measurementId={selectedMeasurement.id}
          />
        </>
      )}
    </>
  );
}
