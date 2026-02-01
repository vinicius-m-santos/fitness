"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
    User,
    Shield,
    Settings,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRequest } from "@/api/request";
import { useAuth } from "@/providers/AuthProvider";
import toast from "react-hot-toast";
import SecuritySection from "@/components/Profile/SecuritySection";
import PreferencesSection from "@/components/Profile/PreferencesSection";
import PersonalDataSection from "@/components/Profile/PersonalDataSection";
import ProfileUpdateModal from "@/components/Profile/ProfileUpdateModal";
import { UserFormSchema } from "@/schemas/user";
import EditableAvatar from "@/components/ui/EditableAvatar";
import Loader from "@/components/ui/loader";

export default function ProfilePage() {
    const [section, setSection] = useState<"profile" | "security" | "preferences">("profile");
    const { user, updateUser } = useAuth();
    const request = useRequest();
    const queryClient = useQueryClient();

    const isClient = user?.roles?.includes("ROLE_CLIENT");
    const clientId = user?.client?.id;

    const { data: client, isLoading: isLoadingClient } = useQuery({
        queryKey: ["client", String(clientId)],
        queryFn: async () => {
            const res = await request({ method: "GET", url: `/client/${clientId}` });
            return res;
        },
        enabled: !!isClient && !!clientId,
        refetchOnMount: true,
        staleTime: 5 * 60 * 1000,
    });

    const profileUser = useMemo(() => {
        if (!user) return null;
        if (isClient && client?.user) {
            return { ...user, ...client.user, roles: user.roles };
        }
        return user;
    }, [user, isClient, client]);

    const updateUserMutation = useMutation({
        mutationFn: async (payload: UserFormSchema): Promise<unknown> => {
            if (!user?.id) throw new Error("User ID is required");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res: any = await request({
                method: "PATCH",
                url: `/user/${user.id}`,
                // @ts-expect-error - useRequest accepts any data type
                data: payload,
            });
            return res || null;
        },
        onSuccess: (updatedUser: any) => {
            queryClient.setQueryData(["user", user?.id], updatedUser);
            if (isClient && clientId) {
                queryClient.setQueryData(["client", String(clientId)], (old: { user?: object }) =>
                    old ? { ...old, user: updatedUser } : old
                );
            }
            if (updatedUser && user && typeof updatedUser === "object") {
                const updatedUserData = {
                    ...user,
                    ...updatedUser,
                    id: (updatedUser as any).id ?? user.id,
                    firstName: (updatedUser as any).firstName ?? user.firstName,
                    lastName: (updatedUser as any).lastName ?? user.lastName,
                    email: (updatedUser as any).email ?? user.email,
                    roles: (updatedUser as any).roles ?? user.roles,
                    phone: (updatedUser as any).phone ?? user.phone,
                    avatarUrl: (updatedUser as any).avatarUrl ?? user.avatarUrl,
                    birthDate: (updatedUser as any).birthDate ?? user.birthDate,
                    createdAt: (updatedUser as any).createdAt ?? user.createdAt,
                };
                updateUser(updatedUserData);
            }
            toast.success("Dados atualizados!");
        },
    });

    const handleUserUpdate = (data: UserFormSchema, setOpen: (value: boolean) => void) => {
        updateUserMutation.mutate(data, {
            onSuccess: () => {
                setOpen(false);
            },
        });
    };

    const getUserType = () => {
        if (!user?.roles) return "";
        if (user.roles.includes("ROLE_PERSONAL")) return "Personal Trainer";
        if (user.roles.includes("ROLE_CLIENT")) return "Aluno";
        return "";
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
            <Loader loading={isClient && isLoadingClient} />
            <Card>
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                    {!profileUser && (
                        <div className="h-24 w-24 rounded-full bg-gray-300 animate-pulse" />
                    )}
                    {profileUser && (
                        <EditableAvatar variant="user" data={profileUser} />
                    )}

                    <div className="flex-1 text-center sm:text-left space-y-1">
                        <h2 className="text-2xl font-semibold">
                            {profileUser?.firstName} {profileUser?.lastName}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {getUserType()}
                        </p>
                    </div>

                    {profileUser && (
                        <ProfileUpdateModal
                            key={profileUser.id}
                            userData={{
                                id: profileUser.id,
                                firstName: profileUser.firstName,
                                lastName: profileUser.lastName,
                                email: profileUser.email,
                                phone: profileUser.phone || null,
                                avatarUrl: profileUser.avatarUrl || null,
                                birthDate: profileUser.birthDate || null,
                            }}
                            onSubmit={handleUserUpdate}
                            isLoading={updateUserMutation.isPending}
                        />
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <Card
                    className="cursor-pointer hover:bg-muted transition"
                    onClick={() => setSection("profile")}
                >
                    <CardContent className="p-4 flex items-center gap-3">
                        <User className="text-muted-foreground" />
                        <span className="text-sm font-medium">Dados pessoais</span>
                    </CardContent>
                </Card>


                <Card
                    className="cursor-pointer hover:bg-muted transition"
                    onClick={() => setSection("security")}
                >
                    <CardContent className="p-4 flex items-center gap-3">
                        <Shield className="text-muted-foreground" />
                        <span className="text-sm font-medium">Segurança</span>
                    </CardContent>
                </Card>


                <Card
                    className="cursor-pointer hover:bg-muted transition"
                    onClick={() => setSection("preferences")}
                >
                    <CardContent className="p-4 flex items-center gap-3">
                        <Settings className="text-muted-foreground" />
                        <span className="text-sm font-medium">Preferências</span>
                    </CardContent>
                </Card>
            </div>


            {section === "profile" && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <PersonalDataSection userData={profileUser} />
                </motion.div>
            )}

            {section === "security" && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <SecuritySection />
                </motion.div>
            )}

            {section === "preferences" && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <PreferencesSection />
                </motion.div>
            )}
        </div>
    );
}
