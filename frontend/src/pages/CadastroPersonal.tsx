import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRequest } from "@/api/request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import GenderSelect from "@/components/ui/Select/GenderSelect";
import PhoneInput from "@/components/ui/Inputs/PhoneInput";
import BirthDateInput, { birthDateToISO } from "@/components/Inputs/BirthDateInput";
import ButtonLoader from "@/components/ui/buttonLoader";
import toast from "react-hot-toast";
import {
  clientPersonalLinkSchema,
  type ClientPersonalLinkSchema,
} from "@/schemas/clients";

const REQUIRED_MARK = " *";

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

export default function CadastroPersonal() {
  const { personalUuid } = useParams<{ personalUuid: string }>();
  const navigate = useNavigate();
  const request = useRequest();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [personalName, setPersonalName] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm<ClientPersonalLinkSchema>({
    resolver: zodResolver(clientPersonalLinkSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: null,
      gender: "",
      birthDate: null,
    },
  });

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");
  const passwordStrength = password ? getPasswordStrength(password) : null;

  useEffect(() => {
    if (confirmPassword) {
      trigger("confirmPassword");
    }
  }, [password, confirmPassword, trigger]);

  useEffect(() => {
    if (!personalUuid?.trim()) {
      setValidating(false);
      return;
    }
    let cancelled = false;
    request({
      method: "get",
      url: `/client/personal-link-info/${personalUuid}`,
      showError: false,
      onAccept: (payload: unknown) => {
        if (cancelled) return;
        const p = payload as { firstName?: string; lastName?: string } | null;
        const first = p?.firstName ?? "";
        const last = p?.lastName ?? "";
        setPersonalName(first && last ? `${first} ${last}` : null);
      },
      onReject: () => {
        if (!cancelled) setPersonalName(null);
      },
    })
      .then(() => { if (!cancelled) setValidating(false); })
      .catch(() => { if (!cancelled) setValidating(false); });
    return () => { cancelled = true; };
  }, [personalUuid, request]);

  const onSubmit = async (data: ClientPersonalLinkSchema) => {
    if (!personalUuid?.trim()) {
      toast.error("Link inválido");
      return;
    }
    setLoading(true);
    const birthDateISO = birthDateToISO(data.birthDate ?? null);
    const payload = {
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      phone: data.phone ?? null,
      gender: data.gender || null,
      birthDate: birthDateISO,
    };

    await request({
      method: "POST",
      url: `/client/register-by-personal-link/${personalUuid}`,
      data: payload,
      showSuccess: false,
      onAccept: () => navigate("/register-success"),
      onReject: () => setLoading(false),
    });
    setLoading(false);
  };

  if (validating) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!personalName) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
        <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Link inválido
          </h2>
          <p className="text-gray-600 mb-6">
            Este link de cadastro não é válido. Verifique o endereço ou entre em
            contato com seu personal.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Voltar à página inicial
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-lg animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">
          Cadastre-se como aluno
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Preencha os dados abaixo para se cadastrar como aluno de{" "}
          <span className="font-medium text-gray-700">{personalName}</span>
        </p>
        <p className="text-amber-700 text-sm mb-4 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Campos com <span className="font-semibold">*</span> são obrigatórios
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="text-black">
              Nome{REQUIRED_MARK}
            </Label>
            <Input {...register("name")} placeholder="Nome" className="mt-1 text-black" />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label className="text-black">
              Sobrenome{REQUIRED_MARK}
            </Label>
            <Input
              {...register("lastName")}
              placeholder="Sobrenome"
              className="mt-1 text-black"
            />
            {errors.lastName && (
              <p className="text-xs text-destructive mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div>
            <Label className="text-black">
              Email{REQUIRED_MARK}
            </Label>
            <Input
              type="email"
              {...register("email")}
              placeholder="Email"
              className="mt-1 text-black"
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label className="text-black">
              Senha{REQUIRED_MARK}
            </Label>
            <div className="relative mt-1">
              <Input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Mín. 8 caracteres, maiúsculas, minúsculas e números"
                className="pr-10 text-black"
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
              <p className="text-xs text-destructive mt-1">
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
            <Label className="text-black">
              Confirmar senha{REQUIRED_MARK}
            </Label>
            <div className="relative mt-1">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Repita a senha"
                className="pr-10 text-black"
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
              <p className="text-xs text-destructive mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label className="text-black">WhatsApp</Label>
            <div className="mt-1 text-black">
              <Controller
                name="phone"
                control={control}
                shouldUnregister={false}
                render={({ field }) => (
                  <PhoneInput
                    value={field.value ?? ""}
                    label="phone"
                    required={false}
                    onChange={(_: string, value: string | number) => {
                      const str =
                        typeof value === "string" ? value : String(value ?? "");
                      const normalized =
                        str.trim().length > 0 ? str : null;
                      field.onChange(normalized);
                    }}
                  />
                )}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-destructive mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <GenderSelect
                  value={field.value}
                  handleChange={(_: string, value: string) => field.onChange(value)}
                />
              )}
            />
          </div>

          <div>
            <Label className="text-black">Data de nascimento</Label>
            <div className="mt-1 text-black">
              <Controller
                name="birthDate"
                control={control}
                render={({ field }) => (
                  <BirthDateInput
                    value={field.value ?? ""}
                    onChange={(val) => field.onChange(val)}
                    onBlur={field.onBlur}
                    placeholder="dd/mm/aaaa"
                  />
                )}
              />
            </div>
            {errors.birthDate && (
              <p className="text-xs text-destructive mt-1">
                {errors.birthDate.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 mt-4"
            disabled={!isValid || loading}
          >
            {loading ? <ButtonLoader /> : "Cadastrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
