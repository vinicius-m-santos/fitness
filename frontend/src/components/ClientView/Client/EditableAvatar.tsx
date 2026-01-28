import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequest } from "@/api/request";
import AvatarLoader from "@/components/ui/avatarLoader";
import DeleteAvatarModal from "./DeleteAvatarModal";
import { UPLOAD_PROFILE_PHOTO_MAX_FILE_SIZE } from "@/utils/constants/Client/constants";
import toast from "react-hot-toast";

export default function EditableAvatar({ clientData }) {
  const fileInputRef = useRef(null);
  const request = useRequest();
  const queryClient = useQueryClient();
  const [client, setClient] = useState(null);

  useEffect(() => {
    if (!clientData) {
      return;
    }

    setClient(clientData);
  }, [clientData]);

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      if (file.size > UPLOAD_PROFILE_PHOTO_MAX_FILE_SIZE) {
        toast.error("Tamanho máximo de 5MB");
        return;
      }

      const formData = new FormData();
      formData.append("avatar", file);

      const url = await request({
        method: "POST",
        url: `/client/avatar/${client?.id}`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      await request({
        method: "PATCH",
        url: `/client/${client?.id}`,
        data: { avatarUrl: url },
      });

      return url;
    },
    onSuccess: (newUrl) => {
      queryClient.setQueryData(["client", client?.id], (old) => ({
        ...old,
        user: {
          ...old?.user,
          avatarUrl: newUrl,
        },
      }));

      setClient((prev) => ({
        ...prev,
        user: {
          ...prev?.user,
          avatarUrl: newUrl,
        },
      }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await request({
        method: "DELETE",
        url: `/client/avatar/${client?.id}`,
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(["client", client?.id], (old) => ({
        ...old,
        user: {
          ...old?.user,
          avatarUrl: null,
        },
      }));

      setClient((prev) => ({
        ...prev,
        user: {
          ...prev?.user,
          avatarUrl: null,
        },
      }));
    },
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const isLoading = uploadMutation.isPending || deleteMutation.isPending;

  return (
    <div className="relative group">
      <Avatar
        key={client?.user?.avatarUrl || "no-avatar"}
        className="h-24 w-24 cursor-pointer"
        onClick={() => {
          if (isLoading) {
            return;
          }
          if (fileInputRef.current) fileInputRef.current.value = "";
          fileInputRef.current?.click();
        }}
      >
        {client?.user?.avatarUrl ? (
          <AvatarImage
            key={client?.user?.avatarUrl}
            src={client.user.avatarUrl}
            alt="Foto do cliente"
            className="object-cover object-center"
          />
        ) : (
          <AvatarFallback className="bg-gray-200">
            {client?.name[0].toUpperCase()}
            {client?.lastName?.[0].toUpperCase()}
          </AvatarFallback>
        )}

        {!isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-sm font-medium rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            Trocar
          </div>
        )}

        {isLoading && <AvatarLoader />}
      </Avatar>

      {!isLoading && client?.user?.avatarUrl && (
        <DeleteAvatarModal onConfirm={handleDelete} />
      )}

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
    </div>
  );
}
