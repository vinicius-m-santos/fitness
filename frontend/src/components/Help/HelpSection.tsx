import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SECTION_CLASS = "mb-10";
const SECTION_TITLE_CLASS =
  "text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2";

export { SECTION_CLASS, SECTION_TITLE_CLASS };

export default function HelpSection({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ElementType;
  items: { question: string; answer: string }[];
}) {
  return (
    <section className={SECTION_CLASS}>
      <h2 className={SECTION_TITLE_CLASS}>
        <Icon className="h-5 w-5 text-gray-600" />
        {title}
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {items.map((item, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border border-gray-200 rounded-lg px-4 mb-2 bg-white shadow-sm"
          >
            <AccordionTrigger className="text-gray-900 font-medium hover:no-underline hover:text-gray-700 py-4 text-left">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 pb-4 pt-0">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
