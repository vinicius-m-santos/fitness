import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EXTRA_LABELS } from "@/utils/constants/Client/constants";
import { useAuth } from "@/providers/AuthProvider";

export default function ExtrasSection({ form }) {
  const fields = ["observation", "diet", "sleep", "physicalActivity"];
  const { user } = useAuth();
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Extras
      </h3>

      {fields.map((fieldName) => {
        if (!user?.roles.includes("ROLE_PERSONAL") && fieldName === "observation") {
          return null;
        }

        return (
          <FormField
            control={form.control}
            name={fieldName}
            key={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{EXTRA_LABELS[fieldName]}</FormLabel>
                <FormControl>
                  <Input placeholder={EXTRA_LABELS[fieldName]} maxLength={255} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        );
      })}
    </section>
  );
}
