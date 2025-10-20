import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

const galleryData = {
    "Outubro 2025": [
        "https://picsum.photos/seed/oct1/300/300",
        "https://picsum.photos/seed/oct2/300/300",
        "https://picsum.photos/seed/oct3/300/300",
    ],
    "Setembro 2025": [
        "https://picsum.photos/seed/sep1/300/300",
        "https://picsum.photos/seed/sep2/300/300",
    ],
    "Agosto 2025": [
        "https://picsum.photos/seed/aug1/300/300",
        "https://picsum.photos/seed/aug2/300/300",
        "https://picsum.photos/seed/aug3/300/300",
        "https://picsum.photos/seed/aug4/300/300",
    ],
};

export default function GalleryTab() {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">Galeria de Progresso</h3>

            <Accordion type="single" collapsible className="w-full space-y-3">
                {Object.entries(galleryData).map(([month, images], idx) => (
                    <AccordionItem key={idx} value={month}>
                        <AccordionTrigger className="text-lg font-medium">
                            {month}
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                                {images.map((url, i) => (
                                    <Card key={i} className="overflow-hidden">
                                        <CardContent className="p-0">
                                            <img
                                                src={url}
                                                alt={`${month} foto ${i + 1}`}
                                                className="w-full h-48 object-cover hover:scale-105 transition-transform"
                                            />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
