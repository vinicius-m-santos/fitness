import axios from "axios";
import { useAuth } from "../providers/AuthProvider";

export const useApi = () => {
    const { accessToken } = useAuth();

    const api = axios.create({ baseURL: "http://localhost:8000/api" });

    api.interceptors.request.use((config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    });

    return api;
};
