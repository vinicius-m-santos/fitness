import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { CLIENT_TAGS } from "@/utils/constants/Client/constants";

export default function TagsSelector({ form }) {
  const tags = form.watch("tags") || [];

  const toggleTag = (tag) => {
    const exists = tags.some((t) => t.id === tag.id);
    if (exists) {
      form.setValue(
        "tags",
        tags.filter((t) => t.id !== tag.id)
      );
    } else {
      form.setValue("tags", [...tags, tag]);
    }
  };

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Tags
      </h3>

      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <Badge
            key={t.id}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => toggleTag(t)}
          >
            {t.label}
            <X className="h-4 w-4 ml-1" />
          </Badge>
        ))}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            Selecionar tags
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Buscar tag..." />
            <CommandList>
              <CommandEmpty>Nenhuma encontrada</CommandEmpty>
              <CommandGroup>
                {CLIENT_TAGS.map((tag) => {
                  const selected = tags.some((t) => t.id === tag.id);

                  return (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => toggleTag(tag)}
                      className="cursor-pointer"
                    >
                      {selected && <Check className="mr-2" />}
                      {tag.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </section>
  );
}
