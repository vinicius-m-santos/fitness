import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const fields = [
  ["medicalRestriction", "Restrições médicas"],
  ["cronicalPain", "Dor crônica"],
  ["controledMedicine", "Remédios controlados"],
  ["heartProblem", "Histórico cardíaco"],
  ["recentSurgery", "Cirurgia recente"],
];

export default function HealthSection({ form }) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Saúde & Histórico
      </h3>

      {fields.map(([name, label]) => (
        <FormField
          key={name}
          control={form.control}
          name={name as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <Textarea maxLength={255} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      ))}

      <FormField
        control={form.control}
        name="timeWithoutGym"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tempo sem treinar</FormLabel>
            <FormControl>
              <Textarea maxLength={255} {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </section>
  );
}
