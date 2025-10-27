import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useApi } from "@/api/Api";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ButtonLoader from "@/components/ui/buttonLoader";

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const api = useApi();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post("/login_check", {
                email: email,
                password: password,
            });

            login(res.data.token, res.data.user, res.data.refresh_token);
        } catch (e) {
            const data = e.response.data;

            if (!data?.success) {
                if (data.error) {
                    toast.error(data.error);
                }

                if (data.message) {
                    toast.error(data.message);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
            <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-sm animate-fade-in">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
                    Bem-vindo
                </h2>
                <p className="text-center text-gray-500 mb-8 text-sm">
                    Entre na sua conta para continuar
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full text-black border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Senha
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full text-black border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 cursor-pointer text-white font-semibold rounded-lg py-2 hover:bg-blue-700 transition-colors disabled:opacity-80"
                        disabled={loading}
                    >
                        {!loading && "Entrar"}
                        {loading && <ButtonLoader />}
                    </Button>
                </form>

                {/* Esqueci minha senha */}
                {/* <div className="text-center mt-4">
                    <button
                        onClick={() => navigate("/forgot-password")}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Esqueci minha senha
                    </button>
                </div> */}
            </div>
        </div>
    );
};

export default Login;
