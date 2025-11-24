import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function ExtrasSection({ form }) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Extras
      </h3>

      <FormField
        control={form.control}
        name="observation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Input {...field} maxLength={255} />
            </FormControl>
          </FormItem>
        )}
      />
    </section>
  );
}
