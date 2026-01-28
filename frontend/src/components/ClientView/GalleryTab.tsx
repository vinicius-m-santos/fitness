"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GalleryUploadModal from "@/components/Gallery/Modals/GalleryUploadModal";
import { Images, PlusIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ClientAllData } from "@/types/client";
import { useRequest } from "@/api/request";
import { useParams } from "react-router-dom";
import { GalleryData } from "@/schemas/gallery";
import ContainerLoader from "../ui/containerLoader";
import GalleryUpdateModal from "../Gallery/Modals/GalleryUpdateModal";
import { useAuth } from "@/providers/AuthProvider";

export default function GalleryTab() {
  const { id } = useParams();
  const request = useRequest();
  const [open, setOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const { user } = useAuth();

  const { data: client } = useQuery<ClientAllData>({
    queryKey: ["client", id],
    queryFn: async () => request({ method: "GET", url: `/client/${id}` }),
    enabled: !!id,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000,
  });

  const { data: galleryData, isFetching: isGalleryFetching } =
    useQuery<GalleryData>({
      queryKey: ["gallery"],
      queryFn: async () =>
        request({ method: "GET", url: `/gallery/client/${id}` }),
      enabled: !!id,
      initialData: { groups: {} },
      refetchOnMount: "always",
      staleTime: 5 * 60 * 1000,
    });

  function formatMonthYear(value: string) {
    const [year, month] = value.split("-").map(Number);

    const date = new Date(year, month - 1);

    return date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-black flex items-center gap-2">
          <Images className="h-5 w-5" />
          Galeria de Progresso
        </h3>

        {!user?.roles.includes("ROLE_PERSONAL") && (
          <Button
            size="sm"
            className="cursor-pointer"
            onClick={() => setOpen(true)}
          >
            <PlusIcon /> Adicionar foto
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {isGalleryFetching && <ContainerLoader />}
        {!isGalleryFetching &&
          (Object.keys(galleryData.groups).length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma imagem cadastrada.
            </p>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-3">
              {Object.entries(galleryData.groups).map(
                ([month, images], idx) => (
                  <AccordionItem key={idx} value={month}>
                    <AccordionTrigger className="text-lg font-medium capitalize cursor-pointer">
                      {formatMonthYear(month)}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                        {images.map((image, i) => (
                          <Card key={i} className="overflow-hidden">
                            <CardContent className="p-0">
                              <img
                                src={image.url}
                                alt={`Foto ${i + 1}`}
                                className="w-full h-48 object-cover cursor-pointer hover:scale-105 transition"
                                onClick={() => {
                                  setUpdateOpen(true);
                                  setSelectedImage(image);
                                }}
                              />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ),
              )}
            </Accordion>
          ))}
      </div>
      {!user?.roles.includes("ROLE_PERSONAL") && selectedImage && (
        <>
          <GalleryUpdateModal
            open={updateOpen}
            onOpenChange={(open) => {
              setUpdateOpen(open);
              if (!open) setSelectedImage(null);
            }}
            image={selectedImage}
          />
          <GalleryUploadModal
            open={open}
            onOpenChange={setOpen}
            clientId={client?.id}
          />
        </>
      )}
    </div>
  );
}
