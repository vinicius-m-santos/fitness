import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import ButtonLoader from "@/components/ui/buttonLoader";
import { useRequest } from "@/api/request";
import toast from "react-hot-toast";
import axios from "axios";

const clientRegisterSchema = z
    .object({
        password: z
            .string()
            .min(8, "A senha deve ter pelo menos 8 caracteres")
            .regex(/[a-z]/, "A senha deve conter letras minúsculas")
            .regex(/[A-Z]/, "A senha deve conter letras maiúsculas")
            .regex(/[0-9]/, "A senha deve conter números"),
        confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    });

type ClientRegisterFormData = z.infer<typeof clientRegisterSchema>;

function getPasswordStrength(password: string): {
    strength: "weak" | "medium" | "strong";
    score: number;
    feedback: string[];
} {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push("Pelo menos 8 caracteres");

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("Letras minúsculas");

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("Letras maiúsculas");

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push("Números");

    if (password.length >= 12) score += 1;

    let strength: "weak" | "medium" | "strong" = "weak";
    if (score >= 4) strength = "strong";
    else if (score >= 3) strength = "medium";

    return { strength, score, feedback };
}

const ClientRegister = () => {
    const { token, clientUuid } = useParams<{ token: string; clientUuid: string }>();
    const navigate = useNavigate();
    const request = useRequest();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [valid, setValid] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        trigger,
        formState: { errors, isValid },
    } = useForm<ClientRegisterFormData>({
        resolver: zodResolver(clientRegisterSchema),
        mode: "onChange",
    });

    const password = watch("password", "");
    const confirmPassword = watch("confirmPassword", "");
    const passwordStrength = password ? getPasswordStrength(password) : null;

    // Valida a confirmação de senha em tempo real quando a senha muda
    useEffect(() => {
        if (confirmPassword) {
            trigger("confirmPassword");
        }
    }, [password, confirmPassword, trigger]);

    // Validar token e clientUuid
    useEffect(() => {
        if (!token || !clientUuid) {
            setValid(false);
            setValidating(false);
            return;
        }

        axios
            .get(`${import.meta.env.VITE_API_URL}/user/check-token/${token}/${clientUuid}`)
            .then((res) => {
                if (res.data?.data) {
                    setValid(true);
                } else {
                    setValid(false);
                }
            })
            .catch((err) => {
                console.error(err);
                setValid(false);
            })
            .finally(() => setValidating(false));
    }, [token, clientUuid]);

    const onSubmit = async (data: ClientRegisterFormData) => {
        if (!token || !clientUuid) {
            toast.error("Link inválido");
            return;
        }

        setLoading(true);

        try {
            await request({
                method: "POST",
                url: `/client/register/${token}/${clientUuid}`,
                data: {
                    password: data.password,
                    confirmPassword: data.confirmPassword,
                },
                successMessage: "Cadastro realizado com sucesso! Você pode fazer login agora.",
                showSuccess: true,
                onAccept: () => {
                    navigate("/login");
                    setLoading(false);
                },
                onReject: () => {
                    setLoading(false);
                },
            });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Erro ao realizar cadastro");
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Validando link...</p>
                </div>
            </div>
        );
    }

    if (!valid) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
                <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Link Inválido
                    </h2>
                    <p className="text-gray-600 mb-6">
                        O link de cadastro é inválido ou expirou. Entre em contato com seu personal trainer.
                    </p>
                    <Button onClick={() => navigate("/")} className="w-full">
                        Voltar para página inicial
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
            <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md animate-fade-in">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
                    Definir Senha
                </h2>
                <p className="text-center text-gray-500 mb-8 text-sm">
                    Defina uma senha para completar seu cadastro
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Senha
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                {...register("password")}
                                className="w-full text-black border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="••••••••"
                                required
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-500" />
                                )}
                            </Button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.password.message}
                            </p>
                        )}
                        {passwordStrength && password && (
                            <div className="space-y-1 mt-2">
                                <div className="flex gap-1 h-1.5">
                                    <div
                                        className={`flex-1 rounded ${passwordStrength.strength === "weak"
                                            ? "bg-red-500"
                                            : passwordStrength.strength === "medium"
                                                ? "bg-yellow-500"
                                                : "bg-green-500"
                                            }`}
                                    />
                                    <div
                                        className={`flex-1 rounded ${passwordStrength.strength === "strong"
                                            ? "bg-green-500"
                                            : passwordStrength.strength === "medium"
                                                ? "bg-yellow-500"
                                                : "bg-gray-300"
                                            }`}
                                    />
                                    <div
                                        className={`flex-1 rounded ${passwordStrength.strength === "strong"
                                            ? "bg-green-500"
                                            : "bg-gray-300"
                                            }`}
                                    />
                                </div>
                                <p className="text-xs text-gray-600">
                                    Força:{" "}
                                    <span
                                        className={
                                            passwordStrength.strength === "weak"
                                                ? "text-red-600"
                                                : passwordStrength.strength === "medium"
                                                    ? "text-yellow-600"
                                                    : "text-green-600"
                                        }
                                    >
                                        {passwordStrength.strength === "weak"
                                            ? "Fraca"
                                            : passwordStrength.strength === "medium"
                                                ? "Média"
                                                : "Forte"}
                                    </span>
                                </p>
                                {passwordStrength.feedback.length > 0 && (
                                    <ul className="text-xs text-gray-600 list-disc list-inside">
                                        {passwordStrength.feedback.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Confirmar Senha
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                {...register("confirmPassword")}
                                className="w-full text-black border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="••••••••"
                                required
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-500" />
                                )}
                            </Button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 cursor-pointer text-white font-semibold rounded-lg py-2 hover:bg-blue-700 transition-colors disabled:opacity-70"
                        disabled={loading || !isValid}
                    >
                        {!loading && "Salvar"}
                        {loading && <ButtonLoader />}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ClientRegister;
