import axios from "axios";
import { useAuth } from "../providers/AuthProvider";

export const useApi = () => {
    const { accessToken } = useAuth();

    const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

    api.interceptors.request.use((config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    });

    return api;
};
