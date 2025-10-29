import axios from "axios";
import { createContext, useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "@/components/ui/loader";

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

const AUTHENTICATED_ROUTES = [
  "dashboard",
  "clients",
  "client-view",
  "exercises",
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  const login = (token: string, user: User, refresh_token: string) => {
    setAccessToken(token);
    setUser(user);

    localStorage.setItem("refresh_token", refresh_token);
    navigate("/clients");
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

        // if no token, just stop here (don't logout on public pages)
        if (!refreshToken) {
          setLoading(false);
          return;
        }

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/token/refresh`,
          { refresh_token: refreshToken },
          { withCredentials: true }
        );

        setAccessToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem("refresh_token", res.data.refresh_token);
      } catch (err) {
        // only redirect to login if user is on a protected page
        const publicPaths = ["/login", "/logout", "/anamnese"];
        const currentPath = window.location.pathname;

        if (!publicPaths.includes(currentPath)) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    if (
      !AUTHENTICATED_ROUTES.some((path) => location.pathname.includes(path))
    ) {
      setLoading(false);
      return;
    }

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
