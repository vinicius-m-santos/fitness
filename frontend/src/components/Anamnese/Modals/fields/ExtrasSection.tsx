import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EXTRA_LABELS } from "@/utils/constants/Client/constants";

export default function ExtrasSection({ form }) {
  const fields = ["observation", "diet", "sleep", "physicalActivity"];
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Extras
      </h3>

      {fields.map((fieldName) => {
        return (
          <FormField
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{EXTRA_LABELS[fieldName]}</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={255} />
                </FormControl>
              </FormItem>
            )}
          />
        );
      })}
    </section>
  );
}
