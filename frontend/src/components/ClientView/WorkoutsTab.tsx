import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dumbbell } from "lucide-react"

const workouts = [
  {
    name: "Hipertrofia Avançada",
    createdAt: "10/10/2025",
    periods: [
      {
        name: "Treino A – Peito e Tríceps",
        exercises: [
          { name: "Supino reto", series: 4, reps: "8-10", load: "60kg", rest: "60s", notes: "Aumentar progressivamente" },
          { name: "Crucifixo inclinado", series: 3, reps: "10-12", load: "18kg", rest: "45s", notes: "Controle na descida" },
          { name: "Tríceps corda", series: 3, reps: "12", load: "35kg", rest: "40s", notes: "" },
        ],
      },
      {
        name: "Treino B – Costas e Bíceps",
        exercises: [
          { name: "Puxada alta", series: 4, reps: "10", load: "55kg", rest: "60s", notes: "" },
          { name: "Remada curvada", series: 3, reps: "8", load: "50kg", rest: "75s", notes: "Postura!" },
        ],
      },
    ],
  },
  {
    name: "Funcional / Resistência",
    createdAt: "02/09/2025",
    periods: [
      {
        name: "Full Body",
        exercises: [
          { name: "Agachamento com halter", series: 3, reps: "15", load: "12kg", rest: "40s", notes: "" },
          { name: "Burpees", series: 3, reps: "15", load: "-", rest: "30s", notes: "Manter ritmo constante" },
        ],
      },
    ],
  },
]

export default function WorkoutsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Treinos do Aluno
        </h3>
        <Button variant="outline">+ Novo treino</Button>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {workouts.map((workout, wi) => (
          <AccordionItem key={wi} value={workout.name}>
            <AccordionTrigger className="text-lg text-black font-medium">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full text-left">
                <span>{workout.name}</span>
                <Badge variant="secondary" className="mt-1 sm:mt-0">
                  Criado em {workout.createdAt}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              {workout.periods.map((period, pi) => (
                <Card key={pi}>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      {period.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Exercício</TableHead>
                          <TableHead>Séries</TableHead>
                          <TableHead>Reps</TableHead>
                          <TableHead>Carga</TableHead>
                          <TableHead>Descanso</TableHead>
                          <TableHead>Observações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {period.exercises.map((ex, ei) => (
                          <TableRow key={ei}>
                            <TableCell className="font-medium">{ex.name}</TableCell>
                            <TableCell>{ex.series}</TableCell>
                            <TableCell>{ex.reps}</TableCell>
                            <TableCell>{ex.load}</TableCell>
                            <TableCell>{ex.rest}</TableCell>
                            <TableCell className="text-muted-foreground">{ex.notes || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
