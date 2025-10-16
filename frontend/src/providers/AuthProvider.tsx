import axios from "axios";
import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/ui/loader";

type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
};

type AuthContextType = {
    user: User | null;
    accessToken: string | null;
    login: (token: string, user: User, refresh_token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const login = (token: string, user: User, refresh_token: string) => {
        setAccessToken(token);
        setUser(user);

        localStorage.setItem("refresh_token", refresh_token);
        navigate("/dashboard");
    };

    const logout = () => {
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem("refresh_token");
        navigate("/login");
    };

    useEffect(() => {
        const fetchAccessToken = async () => {
            try {
                const refreshToken = localStorage.getItem("refresh_token");

                if (!refreshToken || !refreshToken.length) {
                    throw new Error("Unauthorized");
                }

                const res = await axios.post(
                    "http://localhost:8000/api/token/refresh",
                    { refresh_token: localStorage.getItem("refresh_token") },
                    { withCredentials: true }
                );

                setAccessToken(res.data.token);
                setUser(res.data.user);
                localStorage.setItem("refresh_token", res.data.refresh_token);
            } catch {
                logout();
            } finally {
                setLoading(false);
            }
        };

        fetchAccessToken();
    }, []);

    if (loading) {
        return <Loader loading={loading} />;
    }

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                user,
                login,
                logout,
                isAuthenticated: !!accessToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
};
