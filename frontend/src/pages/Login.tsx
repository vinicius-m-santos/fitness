import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useApi } from "../api/Api";
import toast from "react-hot-toast";

const Login = () => {
    const { login, user, accessToken } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const api = useApi();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

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
            // setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
                    Login to Your Account
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
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Password
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
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white font-semibold rounded-lg py-2 hover:bg-blue-600 transition-colors"
                    >
                        Login
                    </button>
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
