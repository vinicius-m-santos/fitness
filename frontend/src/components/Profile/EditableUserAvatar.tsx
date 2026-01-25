import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequest } from "@/api/request";
import AvatarLoader from "@/components/ui/avatarLoader";
import DeleteUserAvatarModal from "@/components/Profile/DeleteUserAvatarModal";
import { UPLOAD_PROFILE_PHOTO_MAX_FILE_SIZE } from "@/utils/constants/Client/constants";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/AuthProvider";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
};

export default function EditableUserAvatar({ userData }: { userData: User }) {
  const fileInputRef = useRef(null);
  const request = useRequest();
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!userData) {
      return;
    }

    setUser(userData);
  }, [userData]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (file.size > UPLOAD_PROFILE_PHOTO_MAX_FILE_SIZE) {
        toast.error("Tamanho máximo de 5MB");
        return;
      }

      const formData = new FormData();
      formData.append("avatar", file);

      const url = await request({
        method: "POST",
        url: `/user/avatar/${user?.id}`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      await request({
        method: "PATCH",
        url: `/user/${user?.id}`,
        data: { avatarUrl: url },
      });

      return url;
    },
    onSuccess: (newUrl) => {
      const updatedUser = {
        ...user,
        avatarUrl: newUrl,
      } as User;

      queryClient.setQueryData(["user", user?.id], updatedUser);

      setUser(updatedUser);
      
      if (updateUser) {
        updateUser(updatedUser);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await request({
        method: "DELETE",
        url: `/user/avatar/${user?.id}`,
      });
    },
    onSuccess: () => {
      const updatedUser = {
        ...user,
        avatarUrl: null,
      } as User;

      queryClient.setQueryData(["user", user?.id], updatedUser);

      setUser(updatedUser);
      
      if (updateUser) {
        updateUser(updatedUser);
      }
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
        key={user?.avatarUrl || "no-avatar"}
        className="h-24 w-24 cursor-pointer"
        onClick={() => {
          if (isLoading) {
            return;
          }
          if (fileInputRef.current) (fileInputRef.current as HTMLInputElement).value = "";
          (fileInputRef.current as HTMLInputElement)?.click();
        }}
      >
        {user?.avatarUrl ? (
          <AvatarImage
            key={user?.avatarUrl}
            src={user.avatarUrl}
            alt="Foto do perfil"
            className="object-cover object-center"
          />
        ) : (
          <AvatarFallback className="bg-gray-200">
            {user?.firstName?.[0].toUpperCase()}
            {user?.lastName?.[0].toUpperCase()}
          </AvatarFallback>
        )}

        {!isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-sm font-medium rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            Trocar
          </div>
        )}

        {isLoading && <AvatarLoader />}
      </Avatar>

      {!isLoading && user?.avatarUrl && (
        <DeleteUserAvatarModal onConfirm={handleDelete} />
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
