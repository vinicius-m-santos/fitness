import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useApi } from "../api/Api";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import ButtonLoader from "../components/ui/buttonLoader";

const Login = () => {
    const { login, user, accessToken } = useAuth();
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <button
                onClick={() => navigate("/")}
                className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-gray-900 transition"
            >
                <ArrowLeft className="mr-2 h-5 w-5" /> Voltar
            </button>
            <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
                    Entrar na sua conta
                </h2>
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
                            className="w-full text-black border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="seu@email.com.br"
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
                            className="w-full text-black border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-blue-500 cursor-pointer text-white font-semibold rounded-lg py-2 hover:bg-blue-600 transition-colors disabled:opacity-100"
                        disabled={loading}
                    >
                        {!loading && "Entrar"}
                        {loading && <ButtonLoader />}
                    </Button>
                </form>
                {/* <p className="text-sm text-center text-gray-500 mt-6">
                    Don’t have an account?{" "}
                    <Link
                        to="/register"
                        className="text-blue-500 hover:underline"
                    >
                        Sign up
                    </Link>
                </p> */}
            </div>
        </div>
    );
};

export default Login;
